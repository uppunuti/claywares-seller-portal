import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../styles/Products.css";

export default function Products() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submittingId, setSubmittingId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Change this endpoint ONLY if your existing
       * seller product-list endpoint is different.
       *
       * Example:
       * /seller/products/
       */

      const response = await api.get("/seller/products/");

      console.log(
        "PRODUCTS RESPONSE:",
        response.data
      );

      // -------------------------------------------------------
      // Handle different possible API response formats
      // -------------------------------------------------------

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

      console.error(
        "FETCH PRODUCTS ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      if (err.response?.data?.message) {

        setError(
          err.response.data.message
        );

      } else if (err.response?.data?.detail) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to load products. Please try again."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // SUBMIT PRODUCT FOR VERIFICATION
  // =========================================================

  const submitForVerification = async (productId) => {

    try {

      setSubmittingId(productId);
      setError("");
      setSuccessMessage("");

      console.log(
        "Submitting product for verification:",
        productId
      );

      /*
       * IMPORTANT:
       *
       * This is your Django endpoint:
       *
       * POST
       * /api/internal/product-reviews/submit/<product_id>/
       */

      const response = await api.post(
        `/internal/product-reviews/submit/${productId}/`
      );

      console.log(
        "VERIFICATION SUBMISSION RESPONSE:",
        response.data
      );

      // -------------------------------------------------------
      // SUCCESS MESSAGE
      // -------------------------------------------------------

      setSuccessMessage(
        response.data?.message ||
        "Product submitted for verification successfully."
      );

      // -------------------------------------------------------
      // UPDATE PRODUCT LOCALLY
      // -------------------------------------------------------

      setProducts((previousProducts) =>
        previousProducts.map((product) => {

          if (product.id !== productId) {
            return product;
          }

          return {
            ...product,
            status:
              response.data?.status ||
              "pending_verification",
          };
        })
      );

      /*
       * Refresh after a short delay so that the product
       * gets the latest verification status from backend.
       */

      setTimeout(() => {
        fetchProducts();
      }, 500);

    } catch (err) {

      console.error(
        "SUBMIT VERIFICATION ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      if (err.response?.data?.message) {

        setError(
          err.response.data.message
        );

      } else if (err.response?.data?.detail) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to submit product for verification."
        );
      }

    } finally {

      setSubmittingId(null);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================
  //
  // IMPORTANT:
  // This function is optional.
  //
  // If you don't have a DELETE API yet, don't use this button.
  //
  // =========================================================

  /*
  const deleteProduct = async (productId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        `/seller/products/${productId}/`
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => product.id !== productId
        )
      );

      setSuccessMessage(
        "Product deleted successfully."
      );

    } catch (err) {

      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete product."
      );
    }
  };
  */

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // GET STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    switch (status) {

      case "draft":
        return "status-draft";

      case "pending_verification":
        return "status-pending";

      case "in_review":
        return "status-review";

      case "changes_required":
        return "status-changes";

      case "approved":
        return "status-approved";

      case "rejected":
        return "status-rejected";

      default:
        return "status-default";
    }
  };

  // =========================================================
  // GET PRODUCT IMAGE
  // =========================================================

  const getProductImage = (product) => {

    // -------------------------------------------------------
    // Different possible image formats
    // -------------------------------------------------------

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {

      const firstImage =
        product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (firstImage?.image) {

        const imageUrl =
          firstImage.image;

        // Already full URL
        if (
          imageUrl.startsWith("http://") ||
          imageUrl.startsWith("https://")
        ) {
          return imageUrl;
        }

        // Backend media URL
        return `http://127.0.0.1:8000${imageUrl}`;
      }
    }

    // -------------------------------------------------------
    // Other possible API field names
    // -------------------------------------------------------

    if (product.image) {

      if (
        product.image.startsWith("http://") ||
        product.image.startsWith("https://")
      ) {
        return product.image;
      }

      return `http://127.0.0.1:8000${product.image}`;
    }

    return null;
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = products.filter(
    (product) => {

      const productName =
        product.productname ||
        product.name ||
        "";

      const matchesSearch =
        productName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "all" ||
        product.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // =========================================================
  // COUNTS
  // =========================================================

  const totalProducts =
    products.length;

  const draftCount =
    products.filter(
      (product) =>
        product.status === "draft"
    ).length;

  const pendingCount =
    products.filter(
      (product) =>
        product.status ===
        "pending_verification"
    ).length;

  const changesCount =
    products.filter(
      (product) =>
        product.status ===
        "changes_required"
    ).length;

  const approvedCount =
    products.filter(
      (product) =>
        product.status ===
        "approved"
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="products-page">

        <div className="products-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading products...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="products-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="products-header">

        <div>

          <div className="breadcrumb">

            <span>Dashboard</span>

            <span className="breadcrumb-separator">
              /
            </span>

            <span className="breadcrumb-current">
              Products
            </span>

          </div>

          <h1>
            Products
          </h1>

          <p>
            Manage your products and submit them
            for verification.
          </p>

        </div>

        <button
          className="add-product-button"
          onClick={() =>
            navigate("/products/add")
          }
        >
          <span className="plus-icon">
            +
          </span>

          Add Product
        </button>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {successMessage && (

        <div className="products-alert success">

          <div className="alert-symbol">
            ✓
          </div>

          <div>
            {successMessage}
          </div>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>

      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (

        <div className="products-alert error">

          <div className="alert-symbol">
            !
          </div>

          <div>
            {error}
          </div>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="product-statistics">

        {/* Total */}

        <div className="stat-card">

          <div className="stat-icon">
            📦
          </div>

          <div>

            <span className="stat-label">
              Total Products
            </span>

            <strong className="stat-value">
              {totalProducts}
            </strong>

          </div>

        </div>

        {/* Draft */}

        <div className="stat-card">

          <div className="stat-icon">
            📝
          </div>

          <div>

            <span className="stat-label">
              Draft
            </span>

            <strong className="stat-value">
              {draftCount}
            </strong>

          </div>

        </div>

        {/* Pending */}

        <div className="stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>

            <span className="stat-label">
              Pending Verification
            </span>

            <strong className="stat-value">
              {pendingCount}
            </strong>

          </div>

        </div>

        {/* Changes */}

        <div className="stat-card">

          <div className="stat-icon">
            ⚠
          </div>

          <div>

            <span className="stat-label">
              Changes Required
            </span>

            <strong className="stat-value">
              {changesCount}
            </strong>

          </div>

        </div>

        {/* Approved */}

        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>

            <span className="stat-label">
              Approved
            </span>

            <strong className="stat-value">
              {approvedCount}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="products-toolbar">

        <div className="search-box">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>

          )}

        </div>

        <div className="filter-box">

          <label>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="all">
              All Products
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="pending_verification">
              Pending Verification
            </option>

            <option value="in_review">
              In Review
            </option>

            <option value="changes_required">
              Changes Required
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

          </select>

        </div>

        <button
          className="refresh-button"
          onClick={fetchProducts}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =====================================================
          PRODUCT COUNT
      ===================================================== */}

      <div className="results-info">

        Showing{" "}

        <strong>
          {filteredProducts.length}
        </strong>{" "}

        of{" "}

        <strong>
          {products.length}
        </strong>{" "}

        products

      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredProducts.length === 0 ? (

        <div className="empty-products">

          <div className="empty-icon">
            📦
          </div>

          {products.length === 0 ? (

            <>
              <h2>
                No products yet
              </h2>

              <p>
                Add your first product to start
                selling on ClayWare.
              </p>

              <button
                className="add-product-button"
                onClick={() =>
                  navigate("/products/add")
                }
              >
                + Add Your First Product
              </button>
            </>

          ) : (

            <>
              <h2>
                No matching products
              </h2>

              <p>
                Try changing your search or
                status filter.
              </p>

              <button
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </button>
            </>

          )}

        </div>

      ) : (

        /* ===================================================
           PRODUCT GRID
        =================================================== */

        <div className="products-grid">

          {filteredProducts.map(
            (product) => {

              const image =
                getProductImage(
                  product
                );

              const productName =
                product.productname ||
                product.name ||
                "Unnamed Product";

              const status =
                product.status ||
                "unknown";

              const isSubmitting =
                submittingId ===
                product.id;

              const canSubmit =
                status === "draft" ||
                status ===
                  "changes_required";

              return (

                <div
                  className="product-card"
                  key={product.id}
                >

                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <div className="product-image-container">

                    {image ? (

                      <img
                        src={image}
                        alt={productName}
                        className="product-image"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          const fallback =
                            e.currentTarget
                              .parentElement
                              ?.querySelector(
                                ".image-fallback"
                              );

                          if (fallback) {
                            fallback.style.display =
                              "flex";
                          }
                        }}
                      />

                    ) : null}

                    <div
                      className="image-fallback"
                      style={{
                        display:
                          image
                            ? "none"
                            : "flex",
                      }}
                    >
                      📦
                    </div>

                    {/* Status badge */}

                    <div
                      className={`product-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {formatStatus(
                        status
                      )}
                    </div>

                  </div>

                  {/* =========================================
                      PRODUCT BODY
                  ========================================= */}

                  <div className="product-body">

                    <div className="product-id">
                      Product #{product.id}
                    </div>

                    <h2 className="product-name">
                      {productName}
                    </h2>

                    <p className="product-description">

                      {product.description
                        ? product.description.length >
                          100
                          ? `${product.description.substring(
                              0,
                              100
                            )}...`
                          : product.description
                        : "No description available."}

                    </p>

                    {/* =======================================
                        PRICE
                    ======================================= */}

                    <div className="product-pricing">

                      <div>

                        <span className="price-label">
                          Price
                        </span>

                        <strong className="product-price">

                          ₹
                          {Number(
                            product.discount_price ||
                            product.price ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </div>

                      {product.discount_price &&
                        Number(
                          product.discount_price
                        ) <
                          Number(
                            product.price
                          ) && (

                          <span className="original-price">

                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </span>

                        )}

                    </div>

                    {/* =======================================
                        STOCK
                    ======================================= */}

                    <div className="product-meta">

                      <div className="meta-item">

                        <span>
                          Stock
                        </span>

                        <strong>
                          {product.stock_quantity ??
                            0}
                        </strong>

                      </div>

                      {product.category && (

                        <div className="meta-item">

                          <span>
                            Category
                          </span>

                          <strong>
                            {formatStatus(
                              product.category
                            )}
                          </strong>

                        </div>

                      )}

                    </div>

                    {/* =======================================
                        STATUS MESSAGE
                    ======================================= */}

                    {status ===
                      "pending_verification" && (

                      <div className="workflow-message pending">

                        <span>
                          ⏳
                        </span>

                        <div>

                          <strong>
                            Submitted for verification
                          </strong>

                          <small>
                            Waiting for a product reviewer.
                          </small>

                        </div>

                      </div>

                    )}

                    {status ===
                      "in_review" && (

                      <div className="workflow-message review">

                        <span>
                          🔍
                        </span>

                        <div>

                          <strong>
                            Under Review
                          </strong>

                          <small>
                            A product reviewer is currently
                            reviewing this product.
                          </small>

                        </div>

                      </div>

                    )}

                    {status ===
                      "changes_required" && (

                      <div className="workflow-message changes">

                        <span>
                          ⚠
                        </span>

                        <div>

                          <strong>
                            Changes Required
                          </strong>

                          <small>
                            Review the requested changes
                            before resubmitting.
                          </small>

                        </div>

                      </div>

                    )}

                    {status ===
                      "approved" && (

                      <div className="workflow-message approved">

                        <span>
                          ✓
                        </span>

                        <div>

                          <strong>
                            Product Approved
                          </strong>

                          <small>
                            Your product has been approved.
                          </small>

                        </div>

                      </div>

                    )}

                    {status ===
                      "rejected" && (

                      <div className="workflow-message rejected">

                        <span>
                          ✕
                        </span>

                        <div>

                          <strong>
                            Product Rejected
                          </strong>

                          <small>
                            This product was rejected by
                            the reviewer.
                          </small>

                        </div>

                      </div>

                    )}

                    {/* =======================================
                        ACTIONS
                    ======================================= */}

                    <div className="product-actions">

                      {/* EDIT */}

                      {(status === "draft" ||
                        status ===
                          "changes_required") && (

                        <button
                          className="edit-button"
                          onClick={() =>
                            navigate(
                              `/products/edit/${product.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                      )}

                      {/* VIEW */}

                      <button
                        className="view-button"
                        onClick={() =>
                          navigate(
                            `/products/${product.id}`
                          )
                        }
                      >
                        View
                      </button>

                      {/* SUBMIT */}

                      {canSubmit && (

                        <button
                          className="submit-button"
                          onClick={() =>
                            submitForVerification(
                              product.id
                            )
                          }
                          disabled={isSubmitting}
                        >

                          {isSubmitting ? (

                            <>
                              <span className="button-spinner"></span>

                              Submitting...
                            </>

                          ) : status ===
                            "changes_required" ? (

                            "Resubmit for Verification"

                          ) : (

                            "Submit for Verification"

                          )}

                        </button>

                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}