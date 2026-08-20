import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../styles/Inventory.css";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedItem, setSelectedItem] = useState(null);

  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("10");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // FETCH INVENTORY
  // ==========================================================

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/seller/inventory/");

      setInventory(response.data?.results || []);
    } catch (err) {
      console.error("Inventory fetch error:", err);

      setError(err.response?.data?.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ==========================================================
  // OPEN UPDATE MODAL
  // ==========================================================

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setQuantity(item.stock_quantity ?? 0);
    setThreshold(item.low_stock_threshold ?? 10);
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (updating) return;

    setSelectedItem(null);
    setQuantity("");
    setThreshold("10");
  };

  // ==========================================================
  // UPDATE INVENTORY
  // ==========================================================

  const updateInventory = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    const newQuantity = Number(quantity);
    const newThreshold = Number(threshold);

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      setError("Stock quantity must be a valid number.");
      return;
    }

    if (!Number.isInteger(newThreshold) || newThreshold < 0) {
      setError("Low stock threshold must be a valid number.");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      await api.put(`/seller/inventory/${selectedItem.product_id}/`, {
        quantity: newQuantity,
        low_stock_threshold: newThreshold,
        variant_id: selectedItem.variant_id,
      });

      setSuccess("Inventory updated successfully.");

      await fetchInventory();

      setTimeout(() => {
        setSelectedItem(null);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Inventory update error:", err);

      setError(err.response?.data?.message || "Unable to update inventory.");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================================
  // FILTER + SEARCH
  // ==========================================================

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.productname?.toLowerCase().includes(searchValue) ||
        item.sku?.toLowerCase().includes(searchValue) ||
        item.capacity?.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "all" || item.inventory_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [inventory, search, filter]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    return {
      total: inventory.length,

      inStock: inventory.filter((item) => item.inventory_status === "in_stock")
        .length,

      lowStock: inventory.filter(
        (item) => item.inventory_status === "low_stock",
      ).length,

      outOfStock: inventory.filter(
        (item) => item.inventory_status === "out_of_stock",
      ).length,
    };
  }, [inventory]);

  // ==========================================================
  // STATUS
  // ==========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "in_stock":
        return "In Stock";

      case "low_stock":
        return "Low Stock";

      case "out_of_stock":
        return "Out of Stock";

      default:
        return "Unknown";
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="inventory-header">
          <div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>

        <div className="inventory-summary">
          {[1, 2, 3, 4].map((item) => (
            <div className="inventory-stat skeleton-card" key={item}>
              <div className="skeleton skeleton-icon"></div>
              <div>
                <div className="skeleton skeleton-small"></div>
                <div className="skeleton skeleton-number"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="inventory-table-card">
          <div className="inventory-loading-row"></div>
          <div className="inventory-loading-row"></div>
          <div className="inventory-loading-row"></div>
          <div className="inventory-loading-row"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* ==================================================
                HEADER
            ================================================== */}

      <header className="inventory-header">
        <div className="inventory-heading">
          <div className="inventory-title-icon">
            <span>▦</span>
          </div>

          <div>
            <h1>Inventory</h1>

            <p>Manage stock for your approved products</p>
          </div>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchInventory}
          disabled={loading}
        >
          <span>↻</span>
          Refresh
        </button>
      </header>

      {/* ==================================================
                SUCCESS
            ================================================== */}

      {success && !selectedItem && (
        <div className="inventory-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* ==================================================
                ERROR
            ================================================== */}

      {error && !selectedItem && (
        <div className="inventory-alert error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* ==================================================
                SUMMARY
            ================================================== */}

      <section className="inventory-summary">
        <button
          className={`inventory-stat ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <div className="stat-icon total">▦</div>

          <div className="stat-content">
            <span>Total Items</span>
            <strong>{summary.total}</strong>
          </div>
        </button>

        <button
          className={`inventory-stat ${filter === "in_stock" ? "active" : ""}`}
          onClick={() => setFilter("in_stock")}
        >
          <div className="stat-icon stock">✓</div>

          <div className="stat-content">
            <span>In Stock</span>
            <strong>{summary.inStock}</strong>
          </div>
        </button>

        <button
          className={`inventory-stat ${filter === "low_stock" ? "active" : ""}`}
          onClick={() => setFilter("low_stock")}
        >
          <div className="stat-icon low">!</div>

          <div className="stat-content">
            <span>Low Stock</span>
            <strong>{summary.lowStock}</strong>
          </div>
        </button>

        <button
          className={`inventory-stat ${filter === "out_of_stock" ? "active" : ""}`}
          onClick={() => setFilter("out_of_stock")}
        >
          <div className="stat-icon out">×</div>

          <div className="stat-content">
            <span>Out of Stock</span>
            <strong>{summary.outOfStock}</strong>
          </div>
        </button>
      </section>

      {/* ==================================================
                TABLE CARD
            ================================================== */}

      <section className="inventory-card">
        <div className="inventory-toolbar">
          <div>
            <h2>Product Inventory</h2>

            <p>
              {filteredInventory.length}{" "}
              {filteredInventory.length === 1 ? "item" : "items"} shown
            </p>
          </div>

          <div className="inventory-controls">
            {/* SEARCH */}

            <div className="inventory-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && <button onClick={() => setSearch("")}>×</button>}
            </div>

            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="inventory-filter"
            >
              <option value="all">All Status</option>

              <option value="in_stock">In Stock</option>

              <option value="low_stock">Low Stock</option>

              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* ==================================================
                    EMPTY STATE
                ================================================== */}

        {filteredInventory.length === 0 ? (
          <div className="inventory-empty">
            <div className="empty-icon">▦</div>

            <h3>
              {inventory.length === 0
                ? "No approved products yet"
                : "No inventory found"}
            </h3>

            <p>
              {inventory.length === 0
                ? "Once your products are approved, they will appear here."
                : "Try changing your search or filter."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* ==================================================
                       TABLE
                    ================================================== */

          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CAPACITY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={`${item.product_id}-${item.variant_id || "product"}`}
                  >
                    {/* PRODUCT */}

                    <td>
                      <div className="product-cell">
                        <div className="product-placeholder">🏺</div>

                        <div className="product-info">
                          <strong>{item.productname}</strong>

                          {item.inventory_type === "variant" && (
                            <span>Variant</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}

                    <td>
                      <span className="sku">{item.sku || "—"}</span>
                    </td>

                    {/* CAPACITY */}

                    <td>
                      <span className="capacity">{item.capacity || "—"}</span>
                    </td>

                    {/* PRICE */}

                    <td>
                      <div className="price-cell">
                        <strong>₹{item.discount_price || item.price}</strong>

                        {item.discount_price && <del>₹{item.price}</del>}
                      </div>
                    </td>

                    {/* STOCK */}

                    <td>
                      <div className="stock-cell">
                        <strong>{item.stock_quantity}</strong>

                        <span>units</span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`inventory-status ${item.inventory_status}`}
                      >
                        <span className="status-dot"></span>

                        {getStatusLabel(item.inventory_status)}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        className="update-stock-btn"
                        onClick={() => openUpdateModal(item)}
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==================================================
                UPDATE MODAL
            ================================================== */}

      {selectedItem && (
        <div
          className="inventory-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !updating) {
              closeModal();
            }
          }}
        >
          <div className="inventory-modal">
            <div className="modal-header">
              <div>
                <span className="modal-label">INVENTORY</span>

                <h2>Update Stock</h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={updating}
              >
                ×
              </button>
            </div>

            {/* PRODUCT INFO */}

            <div className="modal-product">
              <div className="modal-product-icon">🏺</div>

              <div>
                <strong>{selectedItem.productname}</strong>

                <span>
                  {selectedItem.capacity || "Standard"}

                  {selectedItem.sku && ` • ${selectedItem.sku}`}
                </span>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={updateInventory}>
              <div className="form-field">
                <label>Available Stock</label>

                <div className="number-input">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    autoFocus
                  />

                  <span>units</span>
                </div>
              </div>

              <div className="form-field">
                <label>Low Stock Alert</label>

                <div className="number-input">
                  <input
                    type="number"
                    min="0"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />

                  <span>units</span>
                </div>

                <small>
                  You will see a low-stock warning when stock reaches this
                  level.
                </small>
              </div>

              {error && (
                <div className="modal-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* ACTIONS */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-stock-btn"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="button-spinner"></span>
                      Updating...
                    </>
                  ) : (
                    <>✓ Update Stock</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
