import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiShoppingBag,
  FiArchive,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiBell,
  FiPlus,
  FiChevronRight,
  FiUploadCloud,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiLoader,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import "../styles/AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();

  // Primary Product Form State (Capacity and Weight are STRINGS)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Tableware",
    subcategory: "Ceramic Mugs",
    capacity: "", // STRING e.g., "500 ml"
    weight: "", // STRING e.g., "350 g"
    material: "Terracotta Clay",
    sellingPrice: "",
    discountPrice: "",
    stock: "",
    images: [],
  });

  // Dynamic Variants
  const [variants, setVariants] = useState([
    { id: Date.now(), name: "Standard", capacity: "350 ml", price: "", stock: "" },
  ]);

  // UI State Controls
  const [activeStep, setActiveStep] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingState, setLoadingState] = useState({
    savingDraft: false,
    submitting: false,
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errors, setErrors] = useState({});

  // Keyboard accessibility for Drawer & Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form Field Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Image Upload Handling
  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file,
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  // Variant Handlers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now(), name: "", capacity: "", price: "", stock: "" },
    ]);
  };

  const handleVariantChange = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Checklist Calculations
  const checklist = [
    { label: "Basic Information", complete: Boolean(formData.name && formData.description) },
    { label: "Specifications & Material", complete: Boolean(formData.capacity && formData.weight) },
    { label: "Pricing & Stock", complete: Boolean(formData.sellingPrice && formData.stock) },
    { label: "Product Media", complete: formData.images.length > 0 },
    { label: "Variants Configured", complete: variants.length > 0 && Boolean(variants[0].name) },
  ];

  const completedCount = checklist.filter((item) => item.complete).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product name is required.";
    if (!formData.description.trim()) errs.description = "Product description is required.";
    if (!formData.sellingPrice) errs.sellingPrice = "Selling price is required.";
    if (!formData.stock) errs.stock = "Initial stock quantity is required.";
    if (formData.images.length === 0) errs.images = "At least one product image is required.";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    setLoadingState((prev) => ({ ...prev, savingDraft: true }));
    // Simulate API call
    setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, savingDraft: false }));
      triggerToast("Draft saved successfully!", "success");
    }, 1000);
  };

  // Final Submit Action
  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setLoadingState((prev) => ({ ...prev, submitting: true }));

    // Prepare Payload
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "images") {
        payload.append(key, formData[key]);
      }
    });
    payload.append("variants", JSON.stringify(variants));
    formData.images.forEach((img) => payload.append("images", img.file));

    // Simulate Network Request
    setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, submitting: false }));
      triggerToast("Product submitted for ClayWare verification!", "success");
      setTimeout(() => navigate("/dashboard"), 1800);
    }, 1500);
  };

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  return (
    <div className="clayware-app-viewport">
      {/* ================= CLAYWARE GLOBAL HEADER ================= */}
      <header className="cw-global-header">
        <div className="cw-header-left">
          <div className="cw-brand" onClick={() => navigate("/dashboard")}>
            <div className="cw-brand-logo">C</div>
            <div className="cw-brand-titles">
              <span className="brand-name">ClayWare</span>
              <span className="brand-tag">SELLER HUB</span>
            </div>
          </div>
          <nav className="cw-header-nav">
            <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            <a onClick={()=> navigate("/products")}>Products</a>
            <a>Orders</a>
            <a>Inventory</a>
            <a>Analytics</a>
          </nav>
        </div>

        <div className="cw-header-right">
          <button className="cw-icon-btn" aria-label="Notifications">
            <FiBell />
          </button>
          <button className="cw-icon-btn" aria-label="Help">
            <FiHelpCircle />
          </button>
          <div className="cw-header-divider" />
          <div className="cw-seller-profile">
            <div className="profile-avatar">S</div>
            <div className="profile-info">
              <strong>ClayWare Artisans</strong>
              <span>Seller ID: CW-88402</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE AREA ================= */}
      <div className="cw-workspace-wrapper">
        {/* SUB HEADER / BREADCRUMBS */}
        <div className="cw-page-toolbar">
          <div>
            <div className="cw-breadcrumb">
              <a onClick={() => navigate("/dashboard")}>Dashboard</a>
              <FiChevronRight />
              <a>Products</a>
              <FiChevronRight />
              <span>Add Product</span>
            </div>
            <div className="cw-page-title-row">
              <h1>Add New Product</h1>
              <span className="cw-status-badge badge-draft">DRAFT</span>
            </div>
          </div>

          <div className="cw-page-actions">
            <button
              className="cw-btn cw-btn-secondary"
              onClick={handleSaveDraft}
              disabled={loadingState.savingDraft}
            >
              {loadingState.savingDraft ? <FiLoader className="cw-spin" /> : "Save Draft"}
            </button>
            <button
              className="cw-btn cw-btn-ghost"
              onClick={() => navigate("/dashboard")}
            >
              Exit
            </button>
          </div>
        </div>

        {/* STEPPER PROGRESS */}
        <div className="cw-stepper-container">
          {[
            { step: 1, title: "01 Product Information" },
            { step: 2, title: "02 Pricing & Inventory" },
            { step: 3, title: "03 Media & Variants" },
            { step: 4, title: "04 Review & Submit" },
          ].map((item) => (
            <div
              key={item.step}
              className={`cw-step-item ${
                activeStep === item.step
                  ? "active"
                  : activeStep > item.step
                  ? "completed"
                  : ""
              }`}
              onClick={() => setActiveStep(item.step)}
            >
              <div className="step-indicator">
                {activeStep > item.step ? <FiCheck /> : item.step}
              </div>
              <span className="step-label">{item.title}</span>
            </div>
          ))}
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="cw-workspace-grid">
          {/* LEFT FORM WORKSPACE (75-82% Width) */}
          <main className="cw-form-container">
            {/* SECTION 1: BASIC INFORMATION */}
            <section className="cw-card-section" id="section-info">
              <div className="cw-section-header">
                <h2>01. Basic Information</h2>
                <p>Provide core identification details for your handcrafted product.</p>
              </div>

              <div className="cw-form-group">
                <label className="cw-label">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`cw-input ${errors.name ? "input-error" : ""}`}
                  placeholder="e.g., Hand-carved Terracotta Dinner Plate Set"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <span className="cw-error-text">{errors.name}</span>}
              </div>

              <div className="cw-form-row">
                <div className="cw-form-group">
                  <label className="cw-label">Category</label>
                  <select
                    name="category"
                    className="cw-select"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Tableware">Tableware</option>
                    <option value="Cookware">Cookware</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Planters">Planters & Garden</option>
                  </select>
                </div>

                <div className="cw-form-group">
                  <label className="cw-label">Subcategory</label>
                  <select
                    name="subcategory"
                    className="cw-select"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  >
                    <option value="Ceramic Mugs">Ceramic Mugs</option>
                    <option value="Clay Pots">Clay Pots</option>
                    <option value="Serving Bowls">Serving Bowls</option>
                    <option value="Vases">Vases</option>
                  </select>
                </div>
              </div>

              <div className="cw-form-group">
                <label className="cw-label">
                  Product Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className={`cw-textarea ${errors.description ? "input-error" : ""}`}
                  placeholder="Describe the craft process, firing temperature, aesthetic properties, and ideal usage..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <span className="cw-error-text">{errors.description}</span>
                )}
              </div>
            </section>

            {/* SECTION 2: SPECIFICATIONS */}
            <section className="cw-card-section" id="section-specs">
              <div className="cw-section-header">
                <h2>02. Specifications & Dimensions</h2>
                <p>Exact specs ensure buyers understand product dimensions accurately.</p>
              </div>

              <div className="cw-form-row">
                <div className="cw-form-group">
                  <label className="cw-label">Capacity (Exact String)</label>
                  <input
                    type="text"
                    name="capacity"
                    className="cw-input"
                    placeholder="e.g., 500 ml, 1.5 Litres"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                  <span className="field-hint">Preserved directly as typed (no parsing).</span>
                </div>

                <div className="cw-form-group">
                  <label className="cw-label">Weight (Exact String)</label>
                  <input
                    type="text"
                    name="weight"
                    className="cw-input"
                    placeholder="e.g., 450 g, 1.2 kg"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                  <span className="field-hint">Preserved directly as typed.</span>
                </div>
              </div>
            </section>

            {/* SECTION 3: PRICING & INVENTORY */}
            <section className="cw-card-section" id="section-pricing">
              <div className="cw-section-header">
                <h2>03. Pricing & Inventory</h2>
                <p>Set base pricing and current physical inventory levels.</p>
              </div>

              <div className="cw-form-row">
                <div className="cw-form-group">
                  <label className="cw-label">
                    Selling Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    className={`cw-input ${errors.sellingPrice ? "input-error" : ""}`}
                    placeholder="799"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                  />
                  {errors.sellingPrice && (
                    <span className="cw-error-text">{errors.sellingPrice}</span>
                  )}
                </div>

                <div className="cw-form-group">
                  <label className="cw-label">Discount / MRP Price (₹)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    className="cw-input"
                    placeholder="999"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="cw-form-group">
                  <label className="cw-label">
                    Stock Quantity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    className={`cw-input ${errors.stock ? "input-error" : ""}`}
                    placeholder="50"
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                  {errors.stock && (
                    <span className="cw-error-text">{errors.stock}</span>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 4: PRODUCT MEDIA */}
            <section className="cw-card-section" id="section-media">
              <div className="cw-section-header">
                <h2>04. Product Media</h2>
                <p>High quality photos build high buyer trust on ClayWare.</p>
              </div>

              <div
                className={`cw-dropzone ${isDragOver ? "dragover" : ""} ${
                  errors.images ? "input-error" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <FiUploadCloud className="dropzone-icon" />
                <h3>Drag & Drop Product Images</h3>
                <p>Supports JPG, PNG, WEBP up to 5MB each</p>
                <label className="cw-btn cw-btn-secondary upload-btn">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    hidden
                  />
                </label>
              </div>
              {errors.images && <span className="cw-error-text">{errors.images}</span>}

              {formData.images.length > 0 && (
                <div className="cw-image-grid">
                  {formData.images.map((img, idx) => (
                    <div key={img.id} className="cw-image-card">
                      <img src={img.url} alt={`Upload ${idx + 1}`} />
                      <div className="image-overlay">
                        <button
                          type="button"
                          className="action-icon danger"
                          onClick={() => removeImage(img.id)}
                          aria-label="Remove Image"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <span className="image-tag">
                        {idx === 0 ? "COVER IMAGE" : `IMAGE 0${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 5: VARIANTS */}
            <section className="cw-card-section" id="section-variants">
              <div className="cw-section-header-between">
                <div>
                  <h2>05. Product Variants</h2>
                  <p>Offer different capacity or size configurations.</p>
                </div>
                <button
                  type="button"
                  className="cw-btn cw-btn-secondary btn-sm"
                  onClick={handleAddVariant}
                >
                  <FiPlus /> Add Variant
                </button>
              </div>

              <div className="cw-table-responsive">
                <table className="cw-variant-table">
                  <thead>
                    <tr>
                      <th>Variant Name</th>
                      <th>Capacity</th>
                      <th>Price (₹)</th>
                      <th>Stock</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <input
                            type="text"
                            className="cw-input table-input"
                            placeholder="e.g., Medium"
                            value={v.name}
                            onChange={(e) =>
                              handleVariantChange(v.id, "name", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="cw-input table-input"
                            placeholder="e.g., 500 ml"
                            value={v.capacity}
                            onChange={(e) =>
                              handleVariantChange(v.id, "capacity", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="cw-input table-input"
                            placeholder="699"
                            value={v.price}
                            onChange={(e) =>
                              handleVariantChange(v.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="cw-input table-input"
                            placeholder="20"
                            value={v.stock}
                            onChange={(e) =>
                              handleVariantChange(v.id, "stock", e.target.value)
                            }
                          />
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="cw-icon-btn danger"
                            onClick={() => handleRemoveVariant(v.id)}
                            disabled={variants.length === 1}
                            aria-label="Delete Variant"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* RIGHT CONTROL PANEL (Sticky Workspace Sidebar) */}
          <aside className="cw-control-sidebar">
            <div className="sticky-sidebar-card">
              <div className="sidebar-block">
                <span className="block-label">LISTING STATUS</span>
                <div className="status-indicator">
                  <span className="dot dot-draft" />
                  <strong>DRAFT LISTING</strong>
                </div>
              </div>

              <hr className="cw-card-divider" />

              <div className="sidebar-block">
                <div className="flex-between mb-2">
                  <span className="block-label">COMPLETION</span>
                  <strong className="completion-num">{completionPercentage}%</strong>
                </div>
                <div className="cw-progress-track">
                  <div
                    className="cw-progress-bar"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <hr className="cw-card-divider" />

              <div className="sidebar-block">
                <span className="block-label mb-3">CHECKLIST</span>
                <ul className="cw-checklist">
                  {checklist.map((item, i) => (
                    <li key={i} className={item.complete ? "done" : ""}>
                      <span className="check-icon">
                        {item.complete ? <FiCheck /> : "○"}
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="cw-card-divider" />

              <div className="sidebar-actions">
                <button
                  type="button"
                  className="cw-btn cw-btn-secondary full-width"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <FiEye /> View Entered Details
                </button>

                <button
                  type="button"
                  className="cw-btn cw-btn-primary full-width"
                  onClick={() => {
                    if (validateForm()) {
                      setIsModalOpen(true);
                    } else {
                      triggerToast("Please complete required fields before submitting.", "error");
                    }
                  }}
                  disabled={loadingState.submitting}
                >
                  {loadingState.submitting ? (
                    <FiLoader className="cw-spin" />
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM STICKY ACTION BAR */}
      <div className="cw-mobile-action-bar">
        <button
          className="cw-btn cw-btn-secondary"
          onClick={() => setIsDrawerOpen(true)}
        >
          <FiEye /> Details
        </button>
        <button
          className="cw-btn cw-btn-primary"
          onClick={() => {
            if (validateForm()) setIsModalOpen(true);
          }}
        >
          Submit for Verification
        </button>
      </div>

      {/* ================= DRAWER: VIEW ENTERED DETAILS ================= */}
      {isDrawerOpen && (
        <div className="cw-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="cw-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <h2>Product Review Drawer</h2>
                <p>Live preview of entered structured payload state</p>
              </div>
              <button
                className="cw-icon-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close Drawer"
              >
                <FiX />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h3>Product Identification</h3>
                <div className="drawer-data-grid">
                  <div>
                    <label>Product Name</label>
                    <p>{formData.name || "—"}</p>
                  </div>
                  <div>
                    <label>Category</label>
                    <p>{formData.category} / {formData.subcategory}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <label>Description</label>
                  <p className="description-text">{formData.description || "—"}</p>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Specifications (Exact Strings)</h3>
                <div className="drawer-data-grid">
                  <div>
                    <label>Capacity</label>
                    <p>{formData.capacity || "—"}</p>
                  </div>
                  <div>
                    <label>Weight</label>
                    <p>{formData.weight || "—"}</p>
                  </div>
                  <div>
                    <label>Material</label>
                    <p>{formData.material || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Pricing & Stock</h3>
                <div className="drawer-data-grid">
                  <div>
                    <label>Selling Price</label>
                    <p>{formData.sellingPrice ? `₹${formData.sellingPrice}` : "—"}</p>
                  </div>
                  <div>
                    <label>MRP / Discount</label>
                    <p>{formData.discountPrice ? `₹${formData.discountPrice}` : "—"}</p>
                  </div>
                  <div>
                    <label>Available Stock</label>
                    <p>{formData.stock ? `${formData.stock} units` : "—"}</p>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Images Uploaded ({formData.images.length})</h3>
                {formData.images.length > 0 ? (
                  <div className="drawer-image-row">
                    {formData.images.map((img, i) => (
                      <img key={img.id} src={img.url} alt={`Upload preview ${i}`} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No images uploaded yet.</p>
                )}
              </div>

              <div className="drawer-section">
                <h3>Configured Variants ({variants.length})</h3>
                <ul className="drawer-variant-list">
                  {variants.map((v, i) => (
                    <li key={v.id}>
                      <strong>{v.name || `Variant ${i + 1}`}</strong> — {v.capacity || "N/A"} | Price: ₹{v.price || 0} | Stock: {v.stock || 0}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="cw-btn cw-btn-secondary full-width"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VERIFICATION CONFIRMATION ================= */}
      {isModalOpen && (
        <div className="cw-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="cw-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <FiAlertCircle />
            </div>
            <h2>Submit Product for Verification?</h2>
            <p>
              Your listing will be reviewed by the ClayWare Quality Assurance team.
              Once verified, it will be listed live on the marketplace.
            </p>

            <div className="modal-actions">
              <button
                className="cw-btn cw-btn-ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="cw-btn cw-btn-primary"
                onClick={handleConfirmSubmit}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION SYSTEM */}
      {toast.show && (
        <div className={`cw-toast toast-${toast.type}`}>
          <FiCheckCircle />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}