import {
  FiHome,
  FiBox,
  FiShoppingBag,
  FiArchive,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiBell,
  FiSearch,
  FiPlus,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="seller-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="seller-sidebar">
        <div className="seller-brand">
          <div className="brand-logo">C</div>

          <div>
            <h2>ClayWare</h2>
            <span>Seller Portal</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <p className="menu-title">MAIN</p>

          <a className="menu-item active">
            <FiHome />
            <span>Dashboard</span>
          </a>

          <button
            className="add-product-btn"
            onClick={() => navigate("/products/add")}
          >
            <FiPlus />
            Add Product
          </button>

          <a className="menu-item">
            <FiArchive />
            <span>Inventory</span>
          </a>

          <a className="menu-item">
            <FiShoppingBag />
            <span>Orders</span>
          </a>

          <a className="menu-item">
            <FiBarChart2 />
            <span>Analytics</span>
          </a>

          <p className="menu-title account-title">ACCOUNT</p>

          <a className="menu-item">
            <FiSettings />
            <span>Settings</span>
          </a>

          <a className="menu-item">
            <FiHelpCircle />
            <span>Help & Support</span>
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="seller-profile">
            <div className="profile-avatar">S</div>

            <div>
              <strong>Seller Account</strong>
              <span>ClayWare Store</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="seller-main">
        {/* HEADER */}

        <header className="seller-header">
          <div className="header-left">
            <div className="search-box">
              <FiSearch />

              <input type="text" placeholder="Search products, orders..." />
            </div>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FiBell />
            </button>

            <div className="header-divider"></div>

            <div className="header-user">
              <div className="profile-avatar">S</div>

              <div>
                <strong>Seller</strong>
                <span>ClayWare Store</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <section className="dashboard-content">
          {/* PAGE TITLE */}

          <div className="page-heading">
            <div>
              <h1>Dashboard</h1>

              <p>Manage your ClayWare seller account</p>
            </div>

            <button className="add-product-btn">
              <FiPlus />
              Add Product
            </button>
          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="stat-top">
                <span>Total Products</span>

                <div className="stat-icon">
                  <FiBox />
                </div>
              </div>

              <h2>—</h2>

              <p>Products in your catalog</p>
            </div>

            <div className="dashboard-stat">
              <div className="stat-top">
                <span>Listed Products</span>

                <div className="stat-icon">
                  <FiArchive />
                </div>
              </div>

              <h2>—</h2>

              <p>Products currently listed</p>
            </div>

            <div className="dashboard-stat">
              <div className="stat-top">
                <span>Total Orders</span>

                <div className="stat-icon">
                  <FiShoppingBag />
                </div>
              </div>

              <h2>—</h2>

              <p>Orders received</p>
            </div>

            <div className="dashboard-stat">
              <div className="stat-top">
                <span>Low Stock</span>

                <div className="stat-icon warning">
                  <FiAlertTriangle />
                </div>
              </div>

              <h2>—</h2>

              <p>Products needing restock</p>
            </div>
          </div>

          {/* ================= MAIN GRID ================= */}

          <div className="dashboard-main-grid">
            {/* SALES */}

            <div className="dashboard-card sales-card">
              <div className="card-heading">
                <div>
                  <h2>Sales Overview</h2>

                  <p>Your sales performance</p>
                </div>

                <select>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>

              <div className="empty-chart">
                <FiBarChart2 />

                <h3>No sales data yet</h3>

                <p>
                  Sales analytics will appear here once your orders are
                  received.
                </p>
              </div>
            </div>

            {/* ORDER SUMMARY */}

            <div className="dashboard-card order-summary">
              <div className="card-heading">
                <div>
                  <h2>Orders</h2>

                  <p>Order summary</p>
                </div>

                <button className="text-btn">
                  View All
                  <FiChevronRight />
                </button>
              </div>

              <div className="order-status-list">
                <div className="order-status-row">
                  <div>
                    <span className="status-dot new"></span>
                    New Orders
                  </div>

                  <strong>—</strong>
                </div>

                <div className="order-status-row">
                  <div>
                    <span className="status-dot processing"></span>
                    Processing
                  </div>

                  <strong>—</strong>
                </div>

                <div className="order-status-row">
                  <div>
                    <span className="status-dot shipped"></span>
                    Shipped
                  </div>

                  <strong>—</strong>
                </div>

                <div className="order-status-row">
                  <div>
                    <span className="status-dot delivered"></span>
                    Delivered
                  </div>

                  <strong>—</strong>
                </div>

                <div className="order-status-row">
                  <div>
                    <span className="status-dot cancelled"></span>
                    Cancelled
                  </div>

                  <strong>—</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOWER GRID ================= */}

          <div className="dashboard-lower-grid">
            {/* RECENT ORDERS */}

            <div className="dashboard-card recent-orders">
              <div className="card-heading">
                <div>
                  <h2>Recent Orders</h2>

                  <p>Your latest orders</p>
                </div>

                <button className="text-btn">
                  View Orders
                  <FiChevronRight />
                </button>
              </div>

              <div className="empty-section">
                <FiShoppingBag />

                <h3>No orders yet</h3>

                <p>Your recent orders will appear here.</p>
              </div>
            </div>

            {/* INVENTORY */}

            <div className="dashboard-card inventory-card">
              <div className="card-heading">
                <div>
                  <h2>Inventory</h2>

                  <p>Stock overview</p>
                </div>

                <button className="text-btn">
                  Manage
                  <FiChevronRight />
                </button>
              </div>

              <div className="inventory-items">
                <div className="inventory-item">
                  <div className="inventory-icon">
                    <FiBox />
                  </div>

                  <div>
                    <strong>Total Stock</strong>
                    <span>— items</span>
                  </div>
                </div>

                <div className="inventory-item">
                  <div className="inventory-icon warning-bg">
                    <FiAlertTriangle />
                  </div>

                  <div>
                    <strong>Low Stock</strong>
                    <span>— products</span>
                  </div>
                </div>

                <div className="inventory-item">
                  <div className="inventory-icon danger-bg">
                    <FiArchive />
                  </div>

                  <div>
                    <strong>Out of Stock</strong>
                    <span>— products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= QUICK ACTIONS ================= */}

          <div className="dashboard-card quick-actions">
            <div className="card-heading">
              <div>
                <h2>Quick Actions</h2>

                <p>Manage your seller account</p>
              </div>
            </div>

            <div className="quick-action-grid">
              <button>
                <FiPlus />
                <span>Add Product</span>
              </button>

              <button>
                <FiBox />
                <span>Listed Products</span>
              </button>

              <button>
                <FiArchive />
                <span>Manage Inventory</span>
              </button>

              <button>
                <FiShoppingBag />
                <span>View Orders</span>
              </button>

              <button>
                <FiBarChart2 />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
