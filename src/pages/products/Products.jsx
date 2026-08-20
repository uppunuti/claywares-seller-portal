import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ProductActions from  "../products/ProductActions";
import "../styles/Products.css";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [submittingId, setSubmittingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);

  const mediaBaseUrl =
    import.meta.env.VITE_MEDIA_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/seller/products/");
      
      let productList = [];
      const data = response.data;

      if (Array.isArray(data)) {
        productList = data;
      } else if (data && Array.isArray(data.results)) {
        productList = data.results;
      } else if (data && Array.isArray(data.products)) {
        productList = data.products;
      } else if (data && Array.isArray(data.data)) {
        productList = data.data;
      } else if (data && typeof data === "object") {
        const possibleArray = Object.values(data).find((val) => Array.isArray(val));
        if (possibleArray) productList = possibleArray;
      }

      setProducts(productList);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      handleApiError(err, "Unable to load seller products. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApiError = (err, fallbackMsg) => {
    if (!err.response) {
      setError("Unable to connect to ClayWare server. Check network connection.");
      return;
    }
    const status = err.response.status;
    const data = err.response.data;

    if (status === 403) {
      setError(data?.detail || "Permission denied for this action.");
    } else if (status === 404) {
      setError(data?.detail || "Requested resource not found.");
    } else if (status === 400) {
      setError(data?.message || data?.detail || "Invalid request parameters.");
    } else if (status === 500) {
      setError("Internal server error. Please try again later.");
    } else {
      setError(data?.message || data?.detail || fallbackMsg);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleToggleExpand = (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  const submitForVerification = async (e, productId) => {
    if (e) e.stopPropagation();

    try {
      setSubmittingId(productId);
      setError("");
      setSuccessMessage("");

      const response = await api.post(`/internal/product-reviews/submit/${productId}/`);
      const updatedStatus = response.data?.status || "pending_verification";

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: updatedStatus } : p))
      );

      setSuccessMessage(
        response.data?.message || "Product submitted for verification successfully."
      );
      setExpandedProductId(null);
      await fetchProducts();
    } catch (err) {
      console.error("VERIFICATION SUBMISSION ERROR:", err);
      handleApiError(err, "Unable to submit product for verification.");
    } finally {
      setSubmittingId(null);
    }
  };

  const confirmDelete = (e, product) => {
    if (e) e.stopPropagation();
    setDeleteModalProduct(product);
  };

  const executeDelete = async () => {
    if (!deleteModalProduct) return;
    const productId = deleteModalProduct.id;
    const productName =
      deleteModalProduct.productname ||
      deleteModalProduct.name ||
      deleteModalProduct.title ||
      "this product";

    try {
      setDeletingId(productId);
      setError("");
      setSuccessMessage("");

      await api.delete(`/seller/products/${productId}/`);

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
      if (expandedProductId === productId) setExpandedProductId(null);

      setSuccessMessage(`"${productName}" deleted successfully.`);
      setDeleteModalProduct(null);
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);
      handleApiError(err, "Unable to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatStatus = (status) => {
    if (!status || typeof status !== "string") return "Draft";
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft": return "cw-badge cw-badge-draft";
      case "pending_verification": return "cw-badge cw-badge-pending";
      case "in_review": return "cw-badge cw-badge-review";
      case "changes_required": return "cw-badge cw-badge-changes";
      case "approved": return "cw-badge cw-badge-approved";
      case "rejected": return "cw-badge cw-badge-rejected";
      default: return "cw-badge cw-badge-default";
    }
  };

  const getAllProductImages = (product) => {
    const images = [];
    if (!product) return images;

    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((imgObj) => {
        if (typeof imgObj === "string") {
          images.push(imgObj.startsWith("http") ? imgObj : `${mediaBaseUrl}${imgObj}`);
        } else if (imgObj?.image) {
          const url = imgObj.image;
          images.push(url.startsWith("http") ? url : `${mediaBaseUrl}${url}`);
        }
      });
    }

    if (images.length === 0 && product.image) {
      const url = typeof product.image === "string" ? product.image : product.image?.url;
      if (url) images.push(url.startsWith("http") ? url : `${mediaBaseUrl}${url}`);
    }

    return images;
  };

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts.filter((product) => {
    if (!product) return false;
    const productName = product.productname || product.name || product.title || "";
    const productId = String(product.id || "");
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      productName.toLowerCase().includes(searchValue) || productId.includes(searchValue);

    const productStatus = product.status || "draft";
    const matchesStatus = statusFilter === "all" || productStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      <header className="cw-header-bar">
        <div className="cw-header-left">
          <nav className="cw-breadcrumb" aria-label="Breadcrumb">
            <span>ClayWare Hub</span>
            <span className="cw-crumb-sep">/</span>
            <span className="cw-crumb-active">Catalog Management</span>
          </nav>
          <h1 className="cw-page-title">Products Directory</h1>
          <p className="cw-page-subtitle">
            Manage catalog, update eligible products, and submit listings for verification.
          </p>
        </div>
        <div className="cw-header-right">
          <button
            type="button"
            className="cw-btn cw-btn-secondary"
            onClick={fetchProducts}
            disabled={loading}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            className="cw-btn cw-btn-primary"
            onClick={() => navigate("/products/add")}
          >
            + Add New Product
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="cw-alert cw-alert-success" role="alert">
          <span>✓ {successMessage}</span>
          <button type="button" className="cw-alert-close" onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}

      {error && (
        <div className="cw-alert cw-alert-error" role="alert">
          <span>! {error}</span>
          <button type="button" className="cw-alert-close" onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="cw-controls-bar">
        <div className="cw-search-box">
          <input
            type="text"
            className="cw-input"
            placeholder="Search products by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cw-filter-group">
          <select
            className="cw-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="in_review">In Review</option>
            <option value="changes_required">Changes Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="cw-view-toggle">
            <button
              type="button"
              className={`cw-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={`cw-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="cw-table-container">
          <table className="cw-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedProductIds.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={() => {
                      if (selectedProductIds.length === filteredProducts.length) {
                        setSelectedProductIds([]);
                      } else {
                        setSelectedProductIds(filteredProducts.map((p) => p.id));
                      }
                    }}
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="cw-empty-state" style={{ textAlign: "center", padding: "2rem" }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const images = getAllProductImages(product);
                  const isExpanded = expandedProductId === product.id;
                  const productName =
                    product.productname || product.name || product.title || "Untitled Product";
                  const categoryName =
                    typeof product.category === "object"
                      ? product.category?.name
                      : product.category || "Uncategorized";
                  const priceVal = parseFloat(product.price || 0).toFixed(2);
                  const stockVal =
                    product.stock_quantity ?? product.stock ?? product.quantity ?? 0;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className={isExpanded ? "cw-row-expanded" : ""}>
                        <td>
                          <button
                            type="button"
                            className="cw-expand-btn"
                            onClick={() => handleToggleExpand(product.id)}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedProductIds((prev) =>
                                prev.includes(product.id)
                                  ? prev.filter((i) => i !== product.id)
                                  : [...prev, product.id]
                              );
                            }}
                          />
                        </td>
                        <td className="cw-td-name">
                          <div className="cw-td-product-info">
                            {images[0] && (
                              <img src={images[0]} alt="" className="cw-thumb" />
                            )}
                            <span>{productName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(product.status)}>
                            {formatStatus(product.status)}
                          </span>
                        </td>
                        <td>{categoryName}</td>
                        <td>${priceVal}</td>
                        <td>{stockVal}</td>
                        <td style={{ textAlign: "right" }}>
                          <ProductActions
                            product={product}
                            onView={handleToggleExpand}
                            onEdit={handleEdit}
                            onDelete={confirmDelete}
                            onSubmit={submitForVerification}
                            isSubmitting={submittingId === product.id}
                            isDeleting={deletingId === product.id}
                          />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="cw-expansion-row">
                          <td colSpan="8">
                            <div className="cw-expanded-panel">
                              <div className="cw-expanded-grid">
                                <div className="cw-expanded-gallery">
                                  {images.length > 0 ? (
                                    images.map((img, i) => (
                                      <img key={i} src={img} alt="" className="cw-expanded-img" />
                                    ))
                                  ) : (
                                    <div className="cw-no-media">No images available</div>
                                  )}
                                </div>
                                <div className="cw-expanded-details">
                                  <h3>{productName}</h3>
                                  <p className="cw-expanded-desc">
                                    {product.description || "No description provided."}
                                  </p>
                                  <div className="cw-expanded-meta">
                                    <div><strong>Product ID:</strong> {product.id}</div>
                                    <div><strong>Category:</strong> {categoryName}</div>
                                    <div><strong>Price:</strong> ${priceVal}</div>
                                    <div>
                                      <strong>Discount Price:</strong> $
                                      {parseFloat(product.discount_price || 0).toFixed(2)}
                                    </div>
                                    <div><strong>Stock Quantity:</strong> {stockVal}</div>
                                    <div>
                                      <strong>Status:</strong> {formatStatus(product.status)}
                                    </div>
                                  </div>
                                  <div className="cw-expanded-actions">
                                    <ProductActions
                                      product={product}
                                      onEdit={handleEdit}
                                      onDelete={confirmDelete}
                                      onSubmit={submitForVerification}
                                      isSubmitting={submittingId === product.id}
                                      isDeleting={deletingId === product.id}
                                      isExpandedView={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cw-grid-container">
          {filteredProducts.map((product) => {
            const images = getAllProductImages(product);
            const productName =
              product.productname || product.name || product.title || "Untitled Product";
            const categoryName =
              typeof product.category === "object"
                ? product.category?.name
                : product.category || "Uncategorized";

            return (
              <div key={product.id} className="cw-product-card">
                <div className="cw-card-media">
                  {images[0] ? (
                    <img src={images[0]} alt="" />
                  ) : (
                    <div className="cw-card-placeholder">No Image</div>
                  )}
                  <span className={`${getStatusBadgeClass(product.status)} cw-card-badge`}>
                    {formatStatus(product.status)}
                  </span>
                </div>
                <div className="cw-card-body">
                  <h3>{productName}</h3>
                  <p className="cw-card-category">{categoryName}</p>
                  <p className="cw-card-price">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </p>
                </div>
                <div className="cw-card-footer">
                  <ProductActions
                    product={product}
                    onView={handleToggleExpand}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                    onSubmit={submitForVerification}
                    isSubmitting={submittingId === product.id}
                    isDeleting={deletingId === product.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModalProduct && (
        <div className="cw-modal-overlay">
          <div className="cw-modal-card">
            <h2>Delete Product?</h2>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>
                "{deleteModalProduct.productname || deleteModalProduct.name || deleteModalProduct.title}"
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="cw-modal-actions">
              <button
                type="button"
                className="cw-btn cw-btn-secondary"
                onClick={() => setDeleteModalProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cw-btn cw-btn-danger"
                disabled={deletingId === deleteModalProduct.id}
                onClick={executeDelete}
              >
                {deletingId === deleteModalProduct.id ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}