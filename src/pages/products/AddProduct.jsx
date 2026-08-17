import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../styles/AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    productname: "",
    description: "",
    price: "",
    category: "",
    discount_price: "",
    stock_quantity: "",
    weight: "",
    capacity: "",
  });

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    "cookware",
    "water_bottles",
    "tea_cups",
    "water_glasses",
    "decors",
    "kitchen_accessories",
    "gifts",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      setImages((prev) => [...prev, ...imageFiles]);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { capacity: "", price: "", stock_quantity: "" },
    ]);
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.productname.trim()) errors.productname = "Product name is required";
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.price) errors.price = "Price is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.stock_quantity) errors.stock_quantity = "Stock quantity is required";
    if (images.length === 0) errors.images = "Please select at least one product image";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("productname", form.productname);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("discount_price", form.discount_price);
      formData.append("stock_quantity", form.stock_quantity);
      formData.append("weight", form.weight);
      formData.append("capacity", form.capacity);

      images.forEach((image) => {
        formData.append("images", image);
      });

      formData.append("variants", JSON.stringify(variants));

      const response = await api.post("/seller/add-product/", formData);

      setSuccess(response.data?.message || "Product added successfully");

      setForm({
        productname: "",
        description: "",
        price: "",
        category: "",
        discount_price: "",
        stock_quantity: "",
        weight: "",
        capacity: "",
      });
      setImages([]);
      setVariants([]);

      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (err) {
      console.error("Add product error:", err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError({ general: data });
        } else if (data.message) {
          setError({ general: data.message });
        } else {
          setError({ general: Object.values(data).flat().join(" ") });
        }
      } else {
        setError({ general: "Unable to connect to server. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span>Dashboard</span>
            <span className="separator">/</span>
            <span>Products</span>
            <span className="separator">/</span>
            <span className="current">Add Product</span>
          </div>
          <h1>Add New Product</h1>
          <p className="subtitle">List your product on ClayWare marketplace</p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate("/products")}
          className="btn btn-outline"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Products
        </button>
      </div>

      {/* Alerts */}
      {error.general && (
        <div className="alert alert-error">
          <span className="alert-icon">✕</span>
          <span>{error.general}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">

        {/* Basic Information */}
        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>Basic Information</h2>
              <p>Essential product details for your listing</p>
            </div>
            <span className="badge required">Required</span>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group full-width">
                <label>Product Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="productname"
                  value={form.productname}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={error.productname ? "error" : ""}
                />
                {error.productname && <span className="error-text">{error.productname}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Description <span className="required-star">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product in detail..."
                  rows="4"
                  className={error.description ? "error" : ""}
                />
                {error.description && <span className="error-text">{error.description}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category <span className="required-star">*</span></label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={error.category ? "error" : ""}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {error.category && <span className="error-text">{error.category}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>Pricing & Stock</h2>
              <p>Set your product pricing and inventory</p>
            </div>
            <span className="badge required">Required</span>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label>Price <span className="required-star">*</span></label>
                <div className="input-with-symbol">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={error.price ? "error" : ""}
                  />
                </div>
                {error.price && <span className="error-text">{error.price}</span>}
              </div>
              <div className="form-group">
                <label>Discount Price</label>
                <div className="input-with-symbol">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    name="discount_price"
                    value={form.discount_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity <span className="required-star">*</span></label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={error.stock_quantity ? "error" : ""}
                />
                {error.stock_quantity && <span className="error-text">{error.stock_quantity}</span>}
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="text"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 1 Litre"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>Product Images</h2>
              <p>Upload photos of your product</p>
            </div>
            <span className="badge">{images.length} uploaded</span>
          </div>
          <div className="card-body">
            <div 
              className={`upload-zone ${dragActive ? "drag-active" : ""} ${error.images ? "error" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4M8 8L12 4L16 8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 16V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V16" strokeLinecap="round"/>
                </svg>
                <p className="upload-title">Drag & drop images here</p>
                <p className="upload-subtitle">or click to browse files</p>
                <p className="upload-hint">Supports JPG, PNG, WEBP · Max 5MB each</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden-input"
              />
            </div>
            {error.images && <span className="error-text">{error.images}</span>}

            {images.length > 0 && (
              <div className="image-grid">
                {images.map((image, index) => (
                  <div className="image-item" key={`${image.name}-${index}`}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="image-preview"
                    />
                    {index === 0 && <span className="main-badge">Main</span>}
                    <button
                      type="button"
                      className="remove-image"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <span className="image-size">{(image.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="form-card">
          <div className="card-header">
            <div>
              <h2>Product Variants</h2>
              <p>Add variations like size, color, or material</p>
            </div>
            <button type="button" onClick={addVariant} className="btn btn-secondary">
              + Add Variant
            </button>
          </div>
          <div className="card-body">
            {variants.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5V19M5 12H19" strokeLinecap="round"/>
                </svg>
                <p>No variants added</p>
                <span>Click "Add Variant" to create product variations</span>
              </div>
            ) : (
              <div className="variants-container">
                {variants.map((variant, index) => (
                  <div className="variant-item" key={index}>
                    <div className="variant-header">
                      <span className="variant-number">Variant {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="remove-variant"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="variant-fields">
                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="text"
                          value={variant.capacity}
                          onChange={(e) => updateVariant(index, "capacity", e.target.value)}
                          placeholder="e.g., 1L"
                        />
                      </div>
                      <div className="form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={variant.stock_quantity}
                          onChange={(e) => updateVariant(index, "stock_quantity", e.target.value)}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}