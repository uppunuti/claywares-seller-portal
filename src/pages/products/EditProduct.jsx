import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "../styles/EditProduct.css";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    productname: "",
    category: "",
    description: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    weight: "",
    capacity: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);

  /*
   * ------------------------------------------------------
   * MEDIA URL
   * ------------------------------------------------------
   */

  const mediaBaseUrl =
    import.meta.env.VITE_MEDIA_URL ||
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://127.0.0.1:8000";

  /*
   * ------------------------------------------------------
   * BUILD IMAGE URL
   * ------------------------------------------------------
   */

  const getImageUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `${mediaBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  /*
   * ------------------------------------------------------
   * LOAD PRODUCT
   * ------------------------------------------------------
   */

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Load categories
         */

        try {
          const categoryResponse = await api.get(
            "/seller/categories/"
          );

          const categoryData = categoryResponse.data;

          if (Array.isArray(categoryData)) {
            setCategories(categoryData);
          } else if (Array.isArray(categoryData?.results)) {
            setCategories(categoryData.results);
          } else if (Array.isArray(categoryData?.categories)) {
            setCategories(categoryData.categories);
          }
        } catch (categoryError) {
          console.warn(
            "Category loading failed:",
            categoryError
          );
        }

        /*
         * Load existing product
         *
         * IMPORTANT:
         * This GET endpoint must return the product data.
         */

const response = await api.get(
    `/seller/edit-product/${id}/`
);

        const product = response.data;

        console.log("EDIT PRODUCT DATA:", product);

        /*
         * --------------------------------------------------
         * POPULATE INPUTS WITH EXISTING DATA
         * --------------------------------------------------
         */

        setFormData({
          productname:
            product.productname ??
            product.name ??
            product.title ??
            "",

          category:
            typeof product.category === "object"
              ? product.category?.id ?? ""
              : product.category ?? "",

          description:
            product.description ?? "",

          price:
            product.price ?? "",

          discount_price:
            product.discount_price ?? "",

          stock_quantity:
            product.stock_quantity ??
            product.stock ??
            product.quantity ??
            "",

          weight:
            product.weight ?? "",

          capacity:
            product.capacity ?? "",
        });

        /*
         * --------------------------------------------------
         * LOAD EXISTING IMAGES
         * --------------------------------------------------
         */

        const images = [];

        if (
          Array.isArray(product.images) &&
          product.images.length > 0
        ) {
          product.images.forEach((image, index) => {
            if (typeof image === "string") {
              images.push({
                id: `image-${index}`,
                url: getImageUrl(image),
              });
            } else if (image?.image) {
              images.push({
                id: image.id ?? `image-${index}`,
                url: getImageUrl(image.image),
              });
            } else if (image?.url) {
              images.push({
                id: image.id ?? `image-${index}`,
                url: getImageUrl(image.url),
              });
            }
          });
        }

        /*
         * Fallback for single image field
         */

        if (
          images.length === 0 &&
          product.image
        ) {
          const imageUrl =
            typeof product.image === "string"
              ? product.image
              : product.image?.url;

          if (imageUrl) {
            images.push({
              id: "main-image",
              url: getImageUrl(imageUrl),
            });
          }
        }

        console.log(
          "EXISTING PRODUCT IMAGES:",
          images
        );

        setExistingImages(images);

      } catch (err) {
        console.error(
          "LOAD EDIT PRODUCT ERROR:",
          err
        );

        if (err.response?.status === 404) {
          setError(
            "Product not found or you do not have permission to edit it."
          );
        } else {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load product details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  /*
   * ------------------------------------------------------
   * INPUT CHANGE
   * ------------------------------------------------------
   */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ------------------------------------------------------
   * NEW IMAGE SELECTION
   * ------------------------------------------------------
   */

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    setNewImageFiles(files);
  };

  /*
   * ------------------------------------------------------
   * REMOVE EXISTING IMAGE FROM UI
   * ------------------------------------------------------
   *
   * NOTE:
   * Your current backend EditProductApi does NOT handle
   * image deletion/upload.
   *
   * This only removes it from the frontend preview.
   *
   */

  const removeExistingImage = (imageId) => {
    setExistingImages((previous) =>
      previous.filter(
        (image) => image.id !== imageId
      )
    );
  };

  /*
   * ------------------------------------------------------
   * SAVE PRODUCT
   * ------------------------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      /*
       * Your backend uses:
       *
       * PUT /seller/edit-product/<id>/
       *
       * So use PUT here.
       */

      const payload = {
        productname: formData.productname,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        discount_price:
          formData.discount_price || 0,
        stock_quantity:
          formData.stock_quantity,
        weight: formData.weight,
        capacity: formData.capacity,
      };

      console.log(
        "UPDATING PRODUCT:",
        payload
      );

      const response = await api.put(
        `/seller/edit-product/${id}/`,
        payload
      );

      console.log(
        "UPDATE RESPONSE:",
        response.data
      );

      setSuccessMessage(
        response.data?.message ||
          "Product updated and submitted for verification."
      );

      /*
       * Go back to products after successful update.
       */

      setTimeout(() => {
        navigate("/products");
      }, 1500);

    } catch (err) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        err
      );

      const data = err.response?.data;

      if (data) {
        if (typeof data === "string") {
          setError(data);
        } else {
          setError(
            data.message ||
            data.detail ||
            Object.values(data)
              .flat()
              .join(", ") ||
            "Failed to update product."
          );
        }
      } else {
        setError(
          "Network error. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------------
   * LOADING
   * ------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="cw-full-viewport cw-loading-screen">
        <div className="cw-spinner"></div>

        <p className="cw-loading-text">
          Loading product details...
        </p>
      </div>
    );
  }

  /*
   * ------------------------------------------------------
   * PAGE
   * ------------------------------------------------------
   */

  return (
    <div className="cw-full-viewport cw-edit-product-wrapper">

      {/* HEADER */}

      <header className="cw-header-bar">

        <div className="cw-header-left">

          <nav
            className="cw-breadcrumb"
            aria-label="Breadcrumb"
          >
            <span
              onClick={() =>
                navigate("/products")
              }
              style={{
                cursor: "pointer",
              }}
            >
              Products
            </span>

            <span className="cw-crumb-sep">
              /
            </span>

            <span className="cw-crumb-active">
              Edit Product #{id}
            </span>
          </nav>

          <h1 className="cw-page-title">
            Edit Product
          </h1>

          <p className="cw-page-subtitle">
            Update your product information and
            submit the changes for verification.
          </p>

        </div>

        <div className="cw-header-right">

          <button
            type="button"
            className="cw-btn cw-btn-secondary"
            onClick={() =>
              navigate("/products")
            }
          >
            ← Back to Products
          </button>

        </div>

      </header>

      {/* ALERTS */}

      {successMessage && (
        <div className="cw-alert cw-alert-success">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="cw-alert cw-alert-error">
          ! {error}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="cw-edit-form"
      >

        {/* BASIC INFORMATION */}

        <section className="cw-form-section">

          <div className="cw-section-heading">
            <h2>Basic Information</h2>

            <p>
              Update the main information of your
              product.
            </p>
          </div>

          {/* PRODUCT NAME */}

          <div className="cw-form-group">

            <label className="cw-label">
              Product Name
            </label>

            <input
              type="text"
              name="productname"
              className="cw-input"
              value={formData.productname}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />

          </div>

          {/* CATEGORY */}

          <div className="cw-form-row">

            <div className="cw-form-group">

              <label className="cw-label">
                Category
              </label>

              <select
                name="category"
                className="cw-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >

                <option value="">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}

              </select>

            </div>

            {/* STOCK */}

            <div className="cw-form-group">

              <label className="cw-label">
                Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                name="stock_quantity"
                className="cw-input"
                value={
                  formData.stock_quantity
                }
                onChange={handleInputChange}
                required
              />

            </div>

          </div>

        </section>

        {/* PRICING */}

        <section className="cw-form-section">

          <div className="cw-section-heading">
            <h2>Pricing</h2>

            <p>
              Update your product pricing.
            </p>
          </div>

          <div className="cw-form-row">

            <div className="cw-form-group">

              <label className="cw-label">
                Price (₹)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                className="cw-input"
                value={formData.price}
                onChange={handleInputChange}
                required
              />

            </div>

            <div className="cw-form-group">

              <label className="cw-label">
                Discount Price (₹)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                name="discount_price"
                className="cw-input"
                value={
                  formData.discount_price
                }
                onChange={handleInputChange}
              />

            </div>

          </div>

        </section>

        {/* PRODUCT SPECIFICATIONS */}

        <section className="cw-form-section">

          <div className="cw-section-heading">

            <h2>
              Product Specifications
            </h2>

            <p>
              Update weight and capacity when
              applicable.
            </p>

          </div>

          <div className="cw-form-row">

            <div className="cw-form-group">

              <label className="cw-label">
                Weight
              </label>

              <input
                type="text"
                name="weight"
                className="cw-input"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g. 1 kg"
              />

            </div>

            <div className="cw-form-group">

              <label className="cw-label">
                Capacity
              </label>

              <input
                type="text"
                name="capacity"
                className="cw-input"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="e.g. 2 L"
              />

            </div>

          </div>

        </section>

        {/* DESCRIPTION */}

        <section className="cw-form-section">

          <div className="cw-section-heading">

            <h2>Description</h2>

            <p>
              Describe your product for customers.
            </p>

          </div>

          <div className="cw-form-group">

            <textarea
              name="description"
              rows="7"
              className="cw-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description..."
            />

          </div>

        </section>

        {/* EXISTING IMAGES */}

        <section className="cw-form-section">

          <div className="cw-section-heading">

            <h2>
              Product Images
            </h2>

            <p>
              Existing product images are shown
              below.
            </p>

          </div>

          <div className="cw-existing-gallery">

            {existingImages.length === 0 ? (

              <div className="cw-no-media">
                No product images available.
              </div>

            ) : (

              existingImages.map((image, index) => (

                <div
                  key={image.id}
                  className="cw-existing-img-card"
                >

                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                  />

                  <button
                    type="button"
                    className="cw-remove-img-btn"
                    onClick={() =>
                      removeExistingImage(
                        image.id
                      )
                    }
                  >
                    ×
                  </button>

                  {index === 0 && (
                    <span className="cw-primary-image-label">
                      Primary
                    </span>
                  )}

                </div>

              ))

            )}

          </div>

        </section>

        {/* ADD NEW IMAGES */}

        <section className="cw-form-section">

          <div className="cw-section-heading">

            <h2>
              Add New Images
            </h2>

            <p>
              Select additional product images.
            </p>

          </div>

          <div className="cw-form-group">

            <input
              type="file"
              multiple
              accept="image/*"
              className="cw-input"
              onChange={handleFileChange}
            />

          </div>

          {newImageFiles.length > 0 && (

            <div className="cw-new-files">

              <strong>
                New images selected:
              </strong>

              <div>
                {newImageFiles.map(
                  (file, index) => (
                    <span
                      key={index}
                      className="cw-file-name"
                    >
                      {file.name}
                    </span>
                  )
                )}
              </div>

            </div>

          )}

        </section>

        {/* VERIFICATION INFO */}

        <section className="cw-verification-notice">

          <div className="cw-verification-icon">
            ✓
          </div>

          <div>

            <strong>
              Re-verification required
            </strong>

            <p>
              Saving changes will automatically
              submit this product for verification.
              The updated product will only become
              live after it is approved.
            </p>

          </div>

        </section>

        {/* ACTIONS */}

        <div className="cw-form-actions">

          <button
            type="button"
            className="cw-btn cw-btn-secondary"
            onClick={() =>
              navigate("/products")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="cw-btn cw-btn-primary"
            disabled={saving}
          >
            {saving
              ? "Saving & Submitting..."
              : "Save & Submit for Verification"}
          </button>

        </div>

      </form>

    </div>
  );
}