import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../styles/Products.css";

export default function Products() {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // Track expanded product ID for full inline details
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Toggle expanded row state
  const toggleExpandRow = (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/seller/products/");

      let productList = [];
      if (Array.isArray(response.data)) {
        productList = response.data;
      } else if (Array.isArray(response.data?.results)) {
        productList = response.data.results;
      } else if (Array.isArray(response.data?.products)) {
        productList = response.data.products;
      }

      setProducts(productList);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load seller products. Please refresh or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Submit Product for Verification
  const submitForVerification = async (e, productId) => {
    e.stopPropagation();
    try {
      setSubmittingId(productId);
      setError("");
      setSuccessMessage("");

      const response = await api.post(
        `/internal/product-reviews/submit/${productId}/`
      );

      setSuccessMessage(
        response.data?.message ||
          "Product submitted for verification successfully."
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                status: response.data?.status || "pending_verification",
              }
            : p
        )
      );

      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (err) {
      console.error("SUBMIT VERIFICATION ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to submit product for verification."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  // Formatters
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "cw-badge cw-badge-draft";
      case "pending_verification":
        return "cw-badge cw-badge-pending";
      case "in_review":
        return "cw-badge cw-badge-review";
      case "changes_required":
        return "cw-badge cw-badge-changes";
      case "approved":
        return "cw-badge cw-badge-approved";
      case "rejected":
        return "cw-badge cw-badge-rejected";
      default:
        return "cw-badge cw-badge-default";
    }
  };

  const getAllProductImages = (product) => {
    const images = [];

    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((imgObj) => {
        if (typeof imgObj === "string") {
          images.push(imgObj);
        } else if (imgObj?.image) {
          const url = imgObj.image;
          images.push(
            url.startsWith("http://") || url.startsWith("https://")
              ? url
              : `http://127.0.0.1:8000${url}`
          );
        }
      });
    }

    if (images.length === 0 && product.image) {
      const url = product.image;
      images.push(
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `http://127.0.0.1:8000${url}`
      );
    }

    return images;
  };

  // Filters
  const filteredProducts = products.filter((product) => {
    const productName = product.productname || product.name || "";
    const matchesSearch = productName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalProducts = products.length;
  const draftCount = products.filter((p) => p.status === "draft").length;
  const pendingCount = products.filter(
    (p) => p.status === "pending_verification"
  ).length;
  const changesCount = products.filter(
    (p) => p.status === "changes_required"
  ).length;
  const approvedCount = products.filter((p) => p.status === "approved").length;

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (e, id) => {
    e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="cw-full-viewport cw-loading-screen">
        <div className="cw-spinner"></div>
        <p className="cw-loading-text">Loading ClayWare Workspace...</p>
      </div>
    );
  }

  return (
    <div className="cw-full-viewport cw-products-wrapper">
      {/* 1. HEADER */}
      <header className="cw-header-bar">
        <div className="cw-header-left">
          <nav className="cw-breadcrumb" aria-label="Breadcrumb">
            <span>ClayWare Hub</span>
            <span className="cw-crumb-sep">/</span>
            <span className="cw-crumb-active">Catalog Management</span>
          </nav>
          <h1 className="cw-page-title">Products Directory</h1>
          <p className="cw-page-subtitle">
            Click any row to expand full details, manage gallery media, and review status.
          </p>
        </div>

        <div className="cw-header-right">
          <button className="cw-btn cw-btn-secondary" onClick={fetchProducts} disabled={loading}>
            ↻ Refresh
          </button>
          <button className="cw-btn cw-btn-primary" onClick={() => navigate("/products/add")}>
            + Add New Product
          </button>
        </div>
      </header>

      {/* 2. NOTIFICATIONS */}
      {successMessage && (
        <div className="cw-alert cw-alert-success" role="alert">
          <span>✓ {successMessage}</span>
          <button className="cw-alert-close" onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}

      {error && (
        <div className="cw-alert cw-alert-error" role="alert">
          <span>! {error}</span>
          <button className="cw-alert-close" onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* 3. METRICS STRIP */}
      <section className="cw-metrics-grid">
        <div className={`cw-metric-card ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
          <div className="cw-metric-header">
            <span className="cw-metric-label">Total Catalog</span>
            <span className="cw-metric-icon">📦</span>
          </div>
          <div className="cw-metric-value">{totalProducts}</div>
        </div>

        <div className={`cw-metric-card ${statusFilter === "draft" ? "active" : ""}`} onClick={() => setStatusFilter("draft")}>
          <div className="cw-metric-header">
            <span className="cw-metric-label">Drafts</span>
            <span className="cw-metric-icon">📝</span>
          </div>
          <div className="cw-metric-value">{draftCount}</div>
        </div>

        <div className={`cw-metric-card ${statusFilter === "pending_verification" ? "active" : ""}`} onClick={() => setStatusFilter("pending_verification")}>
          <div className="cw-metric-header">
            <span className="cw-metric-label">Pending Verification</span>
            <span className="cw-metric-icon">⏳</span>
          </div>
          <div className="cw-metric-value">{pendingCount}</div>
        </div>

        <div className={`cw-metric-card ${statusFilter === "changes_required" ? "active" : ""}`} onClick={() => setStatusFilter("changes_required")}>
          <div className="cw-metric-header">
            <span className="cw-metric-label">Action Required</span>
            <span className="cw-metric-icon">⚠️</span>
          </div>
          <div className="cw-metric-value">{changesCount}</div>
        </div>

        <div className={`cw-metric-card ${statusFilter === "approved" ? "active" : ""}`} onClick={() => setStatusFilter("approved")}>
          <div className="cw-metric-header">
            <span className="cw-metric-label">Approved</span>
            <span className="cw-metric-icon">✓</span>
          </div>
          <div className="cw-metric-value">{approvedCount}</div>
        </div>
      </section>

      {/* 4. TOOLBAR */}
      <section className="cw-toolbar">
        <div className="cw-toolbar-left">
          <div className="cw-search-input-wrapper">
            <span className="cw-search-icon">🔍</span>
            <input
              type="text"
              className="cw-search-input"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="cw-search-clear" onClick={() => setSearch("")}>×</button>}
          </div>

          <select className="cw-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="in_review">In Review</option>
            <option value="changes_required">Changes Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="cw-toolbar-right">
          <div className="cw-view-switcher">
            <button className={`cw-view-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>
              📋 Table
            </button>
            <button className={`cw-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
              🏲 Grid
            </button>
          </div>
        </div>
      </section>

      {/* 5. SUMMARY */}
      <div className="cw-results-summary">
        Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
        {selectedProductIds.length > 0 && <span className="cw-selected-count">({selectedProductIds.length} selected)</span>}
      </div>

      {/* 6. TABLE VIEW WITH EXPANDABLE FULL DETAILS */}
      {filteredProducts.length === 0 ? (
        <div className="cw-empty-state">
          <div className="cw-empty-icon">📦</div>
          <h2>No products found</h2>
          <p>Try clearing search filters.</p>
          <button className="cw-btn cw-btn-secondary" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="cw-table-container">
          <table className="cw-data-table">
            <thead>
              <tr>
                <th style={{ width: "32px" }}></th>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Product Name</th>
                <th>Status</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const images = getAllProductImages(product);
                const primaryImg = images[0];
                const name = product.productname || product.name || "Unnamed Product";
                const status = product.status || "unknown";
                const isSubmitting = submittingId === product.id;
                const canSubmit = status === "draft" || status === "changes_required";
                const isSelected = selectedProductIds.includes(product.id);
                const isExpanded = expandedProductId === product.id;

                return (
                  <FragmentWrapper key={product.id}>
                    {/* MINIMAL SUMMARY ROW */}
                    <tr
                      className={`cw-clickable-row ${isExpanded ? "cw-row-expanded" : ""} ${isSelected ? "cw-row-selected" : ""}`}
                      onClick={() => toggleExpandRow(product.id)}
                    >
                      <td className="cw-chevron-cell">
                        <span className={`cw-chevron-icon ${isExpanded ? "open" : ""}`}>▶</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectProduct(e, product.id)}
                        />
                      </td>
                      <td>
                        <div className="cw-table-product-minimal">
                          {primaryImg ? (
                            <img src={primaryImg} alt={name} className="cw-minimal-thumb" />
                          ) : (
                            <div className="cw-minimal-placeholder">📦</div>
                          )}
                          <div className="cw-minimal-info">
                            <span className="cw-table-title">{name}</span>
                            <span className="cw-table-sub">ID: #{product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(status)}>
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td>{product.category ? formatStatus(product.category) : "—"}</td>
                      <td>
                        <div className="cw-table-price">
                          <strong>
                            ₹{Number(product.discount_price || product.price || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <span className={`cw-stock-tag ${(product.stock_quantity ?? 0) < 5 ? "low" : ""}`}>
                          {product.stock_quantity ?? 0} units
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="cw-table-actions">
                          <button
                            className="cw-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandRow(product.id);
                            }}
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                          {(status === "draft" || status === "changes_required") && (
                            <button
                              className="cw-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/edit/${product.id}`);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {canSubmit && (
                            <button
                              className="cw-action-btn cw-action-btn-primary"
                              onClick={(e) => submitForVerification(e, product.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Submitting..." : status === "changes_required" ? "Resubmit" : "Submit"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* FULL DETAILS EXPANDABLE PANEL */}
                    {isExpanded && (
                      <tr className="cw-detail-panel-row">
                        <td colSpan="8">
                          <div className="cw-detail-panel">
                            {/* Gallery Section */}
                            <div className="cw-detail-gallery-section">
                              <span className="cw-panel-label">Media Gallery ({images.length})</span>
                              <div className="cw-detail-image-grid">
                                {images.length > 0 ? (
                                  images.map((imgUrl, idx) => (
                                    <div key={idx} className="cw-detail-img-box">
                                      <img src={imgUrl} alt={`${name} ${idx + 1}`} />
                                    </div>
                                  ))
                                ) : (
                                  <p className="cw-no-media">No images uploaded for this product.</p>
                                )}
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="cw-detail-info-grid">
                              <div className="cw-detail-block">
                                <span className="cw-panel-label">Description</span>
                                <p className="cw-panel-text">
                                  {product.description || "No description provided for this product."}
                                </p>
                              </div>

                              <div className="cw-detail-block cw-detail-specs">
                                <div>
                                  <span className="cw-panel-label">Original Price</span>
                                  <span className="cw-panel-value">
                                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div>
                                  <span className="cw-panel-label">Discount Price</span>
                                  <span className="cw-panel-value">
                                    ₹{Number(product.discount_price || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div>
                                  <span className="cw-panel-label">Available Stock</span>
                                  <span className="cw-panel-value">{product.stock_quantity ?? 0} units</span>
                                </div>
                                <div>
                                  <span className="cw-panel-label">Category</span>
                                  <span className="cw-panel-value">{product.category || "Unassigned"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Panel Quick Actions */}
                            <div className="cw-panel-footer">
                              {(status === "draft" || status === "changes_required") && (
                                <button
                                  className="cw-btn cw-btn-secondary cw-btn-sm"
                                  onClick={() => navigate(`/products/edit/${product.id}`)}
                                >
                                  ✎ Edit Product Details
                                </button>
                              )}
                              <button
                                className="cw-btn cw-btn-secondary cw-btn-sm"
                                onClick={() => navigate(`/products/${product.id}`)}
                              >
                                🔗 Open Full Page View
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </FragmentWrapper>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="cw-grid-container">
          {filteredProducts.map((product) => {
            const images = getAllProductImages(product);
            const primaryImg = images[0];
            const name = product.productname || product.name || "Unnamed Product";
            const status = product.status || "unknown";
            const isSubmitting = submittingId === product.id;
            const canSubmit = status === "draft" || status === "changes_required";

            return (
              <div
                key={product.id}
                className="cw-card cw-clickable-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="cw-card-media">
                  {primaryImg ? (
                    <img src={primaryImg} alt={name} className="cw-card-img" />
                  ) : (
                    <div className="cw-card-img-placeholder">📦</div>
                  )}
                  <span className={`cw-card-badge ${getStatusBadgeClass(status)}`}>
                    {formatStatus(status)}
                  </span>
                  {images.length > 1 && (
                    <span className="cw-card-media-count">+{images.length - 1} Images</span>
                  )}
                </div>

                <div className="cw-card-content">
                  <div className="cw-card-meta">
                    SKU ID: #{product.id}
                  </div>
                  <h3 className="cw-card-title">{name}</h3>
                  <p className="cw-card-desc">
                    {product.description
                      ? product.description.length > 70
                        ? `${product.description.substring(0, 70)}...`
                        : product.description
                      : "No description provided."}
                  </p>

                  <div className="cw-card-price-row">
                    <div>
                      <span className="cw-card-price-label">Price</span>
                      <div className="cw-card-price">
                        ₹{Number(product.discount_price || product.price || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="cw-card-price-label">Stock</span>
                      <div className="cw-card-stock">{product.stock_quantity ?? 0} units</div>
                    </div>
                  </div>

                  <div className="cw-card-footer" onClick={(e) => e.stopPropagation()}>
                    {(status === "draft" || status === "changes_required") && (
                      <button
                        className="cw-btn cw-btn-secondary cw-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/edit/${product.id}`);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="cw-btn cw-btn-secondary cw-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                      }}
                    >
                      View Page
                    </button>
                    {canSubmit && (
                      <button
                        className="cw-btn cw-btn-primary cw-btn-sm"
                        onClick={(e) => submitForVerification(e, product.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : status === "changes_required" ? "Resubmit" : "Submit"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// React fragment wrapper helper
function FragmentWrapper({ children }) {
  return <>{children}</>;
}