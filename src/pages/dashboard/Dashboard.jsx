import React, { useEffect, useState, useCallback } from "react";
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
  FiChevronDown,
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiMenu,
  FiDollarSign,
  FiStar,
  FiClock,
  FiTag,
  FiMessageSquare,
  FiEye,
  FiUser,
  FiLogOut
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  // Interface Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState("catalog");
  const [activeOrderTab, setActiveOrderTab] = useState("all");

  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);

  // Metrics Aggregation State
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    salesGrowth: "0%",
    totalOrders: 0,
    ordersGrowth: "0%",
    totalProducts: 0,
    productsAdded: "0",
    pendingOrdersCount: 0,
    returnCount: 0,
    returnRateTrend: "0%",
    storeRating: 0,
    ordersBreakdown: {
      new: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returns: 0
    },
    inventory: {
      lowStock: 0,
      outOfStock: 0,
      totalUnits: 0
    },
    verification: {
      draft: 0,
      pending: 0,
      review: 0,
      changesRequired: 0,
      approved: 0,
      rejected: 0
    }
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productsRes, ordersRes, analyticsRes, storeRes] = await Promise.allSettled([
        api.get("/seller/products/"),
        api.get("/seller/orders/"),
        api.get("/seller/analytics/"),
        api.get("/seller/store-profile/")
      ]);

      // Handle Products
      let productList = [];
      if (productsRes.status === "fulfilled" && productsRes.value?.data) {
        const data = productsRes.value.data;
        if (Array.isArray(data)) productList = data;
        else if (Array.isArray(data.results)) productList = data.results;
        else if (Array.isArray(data.products)) productList = data.products;
      }
      setProducts(productList);

      // Handle Orders
      let orderList = [];
      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        const data = ordersRes.value.data;
        if (Array.isArray(data)) orderList = data;
        else if (Array.isArray(data.results)) orderList = data.results;
        else if (Array.isArray(data.orders)) orderList = data.orders;
      }
      setOrders(orderList);

      // Handle Analytics
      let analyticsData = null;
      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data) {
        analyticsData = analyticsRes.value.data;
        setAnalytics(analyticsData);
      }

      // Handle Store Info
      if (storeRes.status === "fulfilled" && storeRes.value?.data) {
        setStoreInfo(storeRes.value.data);
      }

      // Compute Derived Metrics from Dynamic Product Payload
      const totalProds = productList.length;
      const lowStockProds = productList.filter((p) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5);
      const outOfStockProds = productList.filter((p) => (p.stock_quantity ?? 0) === 0);
      const totalUnits = productList.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);

      const verificationCounts = {
        draft: productList.filter((p) => p.status === "draft").length,
        pending: productList.filter((p) => p.status === "pending" || p.status === "pending_verification").length,
        review: productList.filter((p) => p.status === "under_review").length,
        changesRequired: productList.filter((p) => p.status === "changes_required").length,
        approved: productList.filter((p) => p.status === "approved" || p.status === "active").length,
        rejected: productList.filter((p) => p.status === "rejected").length
      };

      // Compute Derived Metrics from Dynamic Order Payload
      const orderCounts = {
        new: orderList.filter((o) => o.status === "new" || o.status === "pending").length,
        processing: orderList.filter((o) => o.status === "processing").length,
        shipped: orderList.filter((o) => o.status === "shipped").length,
        delivered: orderList.filter((o) => o.status === "delivered").length,
        cancelled: orderList.filter((o) => o.status === "cancelled").length,
        returns: orderList.filter((o) => o.status === "return_requested" || o.status === "returned").length
      };

      setMetrics({
        totalSales: analyticsData?.total_sales ?? orderList.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
        salesGrowth: analyticsData?.sales_growth ?? "0%",
        totalOrders: analyticsData?.total_orders ?? orderList.length,
        ordersGrowth: analyticsData?.orders_growth ?? "0%",
        totalProducts: totalProds,
        productsAdded: analyticsData?.products_added_this_month ?? `${totalProds}`,
        pendingOrdersCount: orderCounts.new + orderCounts.processing,
        returnCount: orderCounts.returns,
        returnRateTrend: analyticsData?.return_rate_trend ?? "0%",
        storeRating: analyticsData?.store_rating ?? storeInfo?.rating ?? 0,
        ordersBreakdown: orderCounts,
        inventory: {
          lowStock: lowStockProds.length,
          outOfStock: outOfStockProds.length,
          totalUnits
        },
        verification: verificationCounts
      });

      if (
        productsRes.status === "rejected" &&
        ordersRes.status === "rejected" &&
        analyticsRes.status === "rejected"
      ) {
        setError("Failed to fetch dashboard data from server. Please check connection.");
      }
    } catch (err) {
      console.error("Dashboard Data Sync Error:", err);
      setError("Unable to sync marketplace data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleSubmenu = (menuKey) => {
    setExpandedSubmenu(expandedSubmenu === menuKey ? "" : menuKey);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeOrderTab === "all") return true;
    if (activeOrderTab === "new") return o.status === "new" || o.status === "pending";
    return o.status === activeOrderTab;
  });

  const lowStockProducts = products.filter(
    (p) => (p.stock_quantity ?? 0) <= 5
  );

  return (
    <div className={`clayware-app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="cw-topbar">
        <div className="cw-topbar-left">
          <button
            className="cw-icon-btn mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Sidebar Navigation"
          >
            <FiMenu />
          </button>
          <div className="cw-brand" onClick={() => navigate("/dashboard")}>
            <div className="cw-logo">C</div>
            <div className="cw-brand-text">
              <span className="cw-brand-name">ClayWare</span>
              <span className="cw-brand-badge">Seller Center</span>
            </div>
          </div>
        </div>

        <div className="cw-topbar-center">
          <div className="cw-search-input">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products, orders, customers, or SKUs..."
              aria-label="Search Marketplace"
            />
          </div>
        </div>

        <div className="cw-topbar-right">
          <button
            className="cw-icon-btn"
            onClick={fetchDashboardData}
            title="Refresh Data"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin-icon" : ""} />
          </button>

          <button className="cw-icon-btn notification-btn" title="Notifications">
            <FiBell />
            <span className="badge-dot"></span>
          </button>

          <button className="cw-icon-btn" title="Support Portal" onClick={() => navigate("/support")}>
            <FiHelpCircle />
          </button>

          <div className="cw-topbar-divider"></div>

          <div className="cw-profile-wrapper">
            <div
              className="cw-profile-trigger"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="cw-avatar">
                {storeInfo?.owner_name ? storeInfo.owner_name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="cw-profile-info">
                <span className="seller-name">{storeInfo?.owner_name || "Seller Account"}</span>
                <span className="store-name">{storeInfo?.store_name || "ClayWare Store"}</span>
              </div>
              <FiChevronDown />
            </div>

            {profileDropdownOpen && (
              <div className="cw-dropdown-menu">
                <div className="dropdown-header">
                  <strong>{storeInfo?.store_name || "ClayWare Store"}</strong>
                  <span>ID: {storeInfo?.store_id || "CW-SELLER"}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={() => navigate("/profile")}><FiUser /> My Profile</button>
                <button onClick={() => navigate("/settings")}><FiSettings /> Store Settings</button>
                <button onClick={() => navigate("/settings/account")}><FiSettings /> Account Settings</button>
                <button onClick={() => navigate("/support")}><FiHelpCircle /> Help & Support</button>
                <div className="dropdown-divider"></div>
                <button className="logout-btn" onClick={() => navigate("/login")}><FiLogOut /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="cw-viewport-container">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className={`cw-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Collapse Sidebar"
          >
            <FiChevronRight className={sidebarCollapsed ? "" : "rotated"} />
          </button>

          <div className="cw-sidebar-menu">
            <div className="menu-group">
              <span className="group-label">OVERVIEW</span>
              <a className="menu-item active" onClick={() => navigate("/dashboard")}>
                <FiHome />
                <span className="item-label">Dashboard</span>
              </a>
            </div>

            <div className="menu-group">
              <span className="group-label">CATALOG</span>
              <div className={`menu-accordion ${expandedSubmenu === "catalog" ? "open" : ""}`}>
                <div className="accordion-trigger" onClick={() => toggleSubmenu("catalog")}>
                  <div className="trigger-left">
                    <FiBox />
                    <span className="item-label">Catalog</span>
                  </div>
                  <FiChevronDown className="accordion-arrow" />
                </div>
                <div className="accordion-content">
                  <a onClick={() => navigate("/products/add")}>Add Product</a>
                  <a onClick={() => navigate("/products/drafts")}>
                    Draft Products <span className="nav-badge">{metrics.verification.draft}</span>
                  </a>
                  <a onClick={() => navigate("/products")}>Listed Products</a>
                  <a onClick={() => navigate("/products/reviews")}>Product Reviews</a>
                  <a onClick={() => navigate("/categories")}>Categories</a>
                </div>
              </div>
            </div>

            <div className="menu-group">
              <span className="group-label">INVENTORY</span>
              <div className={`menu-accordion ${expandedSubmenu === "inventory" ? "open" : ""}`}>
                <div className="accordion-trigger" onClick={() => toggleSubmenu("inventory")}>
                  <div className="trigger-left">
                    <FiArchive />
                    <span className="item-label">Inventory</span>
                  </div>
                  <FiChevronDown className="accordion-arrow" />
                </div>
                <div className="accordion-content">
                  <a onClick={() => navigate("/inventory")}>Inventory Management</a>
                  <a onClick={() => navigate("/products?filter=low_stock")}>
                    Low Stock <span className="nav-badge warning">{metrics.inventory.lowStock}</span>
                  </a>
                  <a onClick={() => navigate("/products?filter=out_of_stock")}>
                    Out of Stock <span className="nav-badge danger">{metrics.inventory.outOfStock}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="menu-group">
              <span className="group-label">ORDERS</span>
              <div className={`menu-accordion ${expandedSubmenu === "orders" ? "open" : ""}`}>
                <div className="accordion-trigger" onClick={() => toggleSubmenu("orders")}>
                  <div className="trigger-left">
                    <FiShoppingBag />
                    <span className="item-label">Orders</span>
                  </div>
                  <FiChevronDown className="accordion-arrow" />
                </div>
                <div className="accordion-content">
                  <a onClick={() => navigate("/orders")}>All Orders</a>
                  <a onClick={() => navigate("/orders?status=new")}>
                    New Orders <span className="nav-badge">{metrics.ordersBreakdown.new}</span>
                  </a>
                  <a onClick={() => navigate("/orders?status=processing")}>Processing</a>
                  <a onClick={() => navigate("/orders?status=shipped")}>Shipped</a>
                  <a onClick={() => navigate("/orders?status=delivered")}>Delivered</a>
                  <a onClick={() => navigate("/orders?status=returns")}>Returns</a>
                </div>
              </div>
            </div>

            <div className="menu-group">
              <span className="group-label">BUSINESS</span>
              <a className="menu-item" onClick={() => navigate("/analytics")}>
                <FiBarChart2 />
                <span className="item-label">Analytics</span>
              </a>
              <a className="menu-item" onClick={() => navigate("/payments")}>
                <FiDollarSign />
                <span className="item-label">Payments</span>
              </a>
              <a className="menu-item" onClick={() => navigate("/promotions")}>
                <FiTag />
                <span className="item-label">Promotions</span>
              </a>
            </div>

            <div className="menu-group">
              <span className="group-label">CUSTOMER</span>
              <a className="menu-item" onClick={() => navigate("/reviews")}>
                <FiStar />
                <span className="item-label">Customer Reviews</span>
              </a>
              <a className="menu-item" onClick={() => navigate("/qna")}>
                <FiMessageSquare />
                <span className="item-label">Questions & Answers</span>
              </a>
            </div>

            <div className="menu-group">
              <span className="group-label">ACCOUNT</span>
              <a className="menu-item" onClick={() => navigate("/settings")}>
                <FiSettings />
                <span className="item-label">Store Profile & Settings</span>
              </a>
              <a className="menu-item" onClick={() => navigate("/support")}>
                <FiHelpCircle />
                <span className="item-label">Help & Support</span>
              </a>
            </div>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CANVAS ================= */}
        <main className="cw-main-content">
          {error && (
            <div className="cw-alert-banner danger">
              <div className="banner-text"><FiAlertTriangle /> {error}</div>
              <button onClick={fetchDashboardData}>Retry Sync</button>
            </div>
          )}

          {/* DASHBOARD HEADER */}
          <div className="cw-page-header">
            <div className="header-titles">
              <h1>Welcome back{storeInfo?.owner_name ? `, ${storeInfo.owner_name}` : ""} 👋</h1>
              <p>Here is your current store summary from backend data.</p>
            </div>
            <div className="header-actions">
              <button className="cw-btn secondary" onClick={() => navigate("/store/view")}>
                <FiEye /> View Store
              </button>
              <button className="cw-btn primary" onClick={() => navigate("/products/add")}>
                <FiPlus /> Add Product
              </button>
            </div>
          </div>

          {/* STORE HEALTH BAR */}
          <div className="cw-store-health-bar">
            <div className="health-title">
              <strong>Store Health</strong>
              <span className={`health-tag ${storeInfo?.status === "active" ? "active" : ""}`}>
                {storeInfo?.status || "Live"}
              </span>
            </div>
            <div className="health-metrics">
              <div className="health-metric">
                <FiCheckCircle className="icon success" />
                <span>Store Status: <strong>{storeInfo?.status || "Active"}</strong></span>
              </div>
              <div className="health-metric">
                <FiCheckCircle className="icon success" />
                <span><strong>{analytics?.fulfillment_rate ?? "0%"}</strong> Order Fulfillment</span>
              </div>
              <div className="health-metric">
                <FiStar className="icon warning" />
                <span><strong>{metrics.storeRating ? metrics.storeRating : "N/A"}</strong> Rating</span>
              </div>
            </div>
          </div>

          {/* ACTION REQUIRED BANNER */}
          {metrics.verification.changesRequired > 0 && (
            <div className="cw-alert-banner warning">
              <div className="banner-text">
                <FiAlertTriangle />
                <span>
                  <strong>Action Required:</strong> {metrics.verification.changesRequired} products require revision before going live.
                </span>
              </div>
              <button onClick={() => navigate("/products?status=changes_required")}>Review Products</button>
            </div>
          )}

          {/* KPI METRIC CARDS */}
          <div className="cw-kpi-grid">
            <div className="cw-kpi-card">
              <div className="kpi-header">
                <span>Total Sales</span>
                <FiDollarSign className="kpi-icon" />
              </div>
              <div className="kpi-value">
                {loading ? "..." : `₹${metrics.totalSales.toLocaleString("en-IN")}`}
              </div>
              <div className="kpi-footer trend-up">
                <span>{metrics.salesGrowth}</span> vs prior period
              </div>
            </div>

            <div className="cw-kpi-card">
              <div className="kpi-header">
                <span>Orders</span>
                <FiShoppingBag className="kpi-icon" />
              </div>
              <div className="kpi-value">{loading ? "..." : metrics.totalOrders}</div>
              <div className="kpi-footer trend-up">
                <span>{metrics.ordersGrowth}</span> vs prior period
              </div>
            </div>

            <div className="cw-kpi-card">
              <div className="kpi-header">
                <span>Products</span>
                <FiBox className="kpi-icon" />
              </div>
              <div className="kpi-value">{loading ? "..." : metrics.totalProducts}</div>
              <div className="kpi-footer trend-neutral">
                <span>{metrics.productsAdded}</span> total catalog items
              </div>
            </div>

            <div className="cw-kpi-card warning-border">
              <div className="kpi-header">
                <span>Pending Orders</span>
                <FiClock className="kpi-icon warning" />
              </div>
              <div className="kpi-value">{loading ? "..." : metrics.pendingOrdersCount}</div>
              <div className="kpi-footer text-warning">
                Requires fulfillment
              </div>
            </div>

            <div className="cw-kpi-card">
              <div className="kpi-header">
                <span>Returns</span>
                <FiRefreshCw className="kpi-icon" />
              </div>
              <div className="kpi-value">{loading ? "..." : metrics.returnCount}</div>
              <div className="kpi-footer trend-down">
                <span>{metrics.returnRateTrend}</span> return trend
              </div>
            </div>

            <div className="cw-kpi-card">
              <div className="kpi-header">
                <span>Store Rating</span>
                <FiStar className="kpi-icon warning" />
              </div>
              <div className="kpi-value">{loading ? "..." : metrics.storeRating ? `${metrics.storeRating} ★` : "N/A"}</div>
              <div className="kpi-footer trend-up">
                Marketplace feedback score
              </div>
            </div>
          </div>

          {/* SALES ANALYTICS & ORDER BREAKDOWN GRID */}
          <div className="cw-grid-two-column">
            {/* Analytics Engine */}
            <div className="cw-card sales-analytics-card">
              <div className="cw-card-header">
                <div>
                  <h2>Sales Overview</h2>
                  <p>Backend performance metrics</p>
                </div>
              </div>

              <div className="analytics-summary-bar">
                <div className="summary-stat">
                  <span>Revenue</span>
                  <strong>₹{metrics.totalSales.toLocaleString("en-IN")}</strong>
                </div>
                <div className="summary-stat">
                  <span>Orders</span>
                  <strong>{metrics.totalOrders}</strong>
                </div>
                <div className="summary-stat">
                  <span>Avg Order Value</span>
                  <strong>₹{analytics?.avg_order_value ? Number(analytics.avg_order_value).toFixed(2) : "0.00"}</strong>
                </div>
                <div className="summary-stat">
                  <span>Conversion Rate</span>
                  <strong>{analytics?.conversion_rate ?? "0%"}</strong>
                </div>
              </div>

              <div className="cw-chart-container">
                {analytics?.chart_points && Array.isArray(analytics.chart_points) && analytics.chart_points.length > 0 ? (
                  <svg viewBox="0 0 500 150" className="cw-area-chart">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#chartGradient)"
                      d={`M 0,150 L ${analytics.chart_points.map((pt, idx) => `${(idx / (analytics.chart_points.length - 1)) * 500},${150 - pt.value}`).join(' L ')} L 500,150 Z`}
                    />
                    <path
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3"
                      d={`M ${analytics.chart_points.map((pt, idx) => `${(idx / (analytics.chart_points.length - 1)) * 500},${150 - pt.value}`).join(' L ')}`}
                    />
                  </svg>
                ) : (
                  <div className="empty-chart-state">
                    <p>{loading ? "Fetching live chart data..." : "No analytics chart data available."}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown Panel */}
            <div className="cw-card order-summary-card">
              <div className="cw-card-header">
                <div>
                  <h2>Order Summary</h2>
                  <p>Fulfillment queue pipeline</p>
                </div>
                <button className="cw-text-btn" onClick={() => navigate("/orders")}>
                  View All Orders <FiChevronRight />
                </button>
              </div>

              <div className="cw-status-list">
                <div className="status-row" onClick={() => navigate("/orders?status=new")}>
                  <div className="status-info">
                    <span className="dot dot-new"></span>
                    <span>New Orders</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.new}</strong>
                </div>

                <div className="status-row" onClick={() => navigate("/orders?status=processing")}>
                  <div className="status-info">
                    <span className="dot dot-processing"></span>
                    <span>Processing</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.processing}</strong>
                </div>

                <div className="status-row" onClick={() => navigate("/orders?status=shipped")}>
                  <div className="status-info">
                    <span className="dot dot-shipped"></span>
                    <span>Shipped</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.shipped}</strong>
                </div>

                <div className="status-row" onClick={() => navigate("/orders?status=delivered")}>
                  <div className="status-info">
                    <span className="dot dot-delivered"></span>
                    <span>Delivered</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.delivered}</strong>
                </div>

                <div className="status-row" onClick={() => navigate("/orders?status=cancelled")}>
                  <div className="status-info">
                    <span className="dot dot-cancelled"></span>
                    <span>Cancelled</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.cancelled}</strong>
                </div>

                <div className="status-row" onClick={() => navigate("/orders?status=returns")}>
                  <div className="status-info">
                    <span className="dot dot-returns"></span>
                    <span>Returns Requested</span>
                  </div>
                  <strong>{loading ? "—" : metrics.ordersBreakdown.returns}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICATION & INVENTORY WORKFLOW SECTION */}
          <div className="cw-grid-two-column">
            {/* Product Verification Status */}
            <div className="cw-card">
              <div className="cw-card-header">
                <div>
                  <h2>Product Verification</h2>
                  <p>Listing compliance and review status</p>
                </div>
              </div>

              <div className="cw-verification-grid">
                <div className="verification-box">
                  <span className="box-count">{metrics.verification.draft}</span>
                  <span className="box-label">Draft</span>
                </div>
                <div className="verification-box">
                  <span className="box-count warning">{metrics.verification.pending}</span>
                  <span className="box-label">Pending Verification</span>
                </div>
                <div className="verification-box">
                  <span className="box-count info">{metrics.verification.review}</span>
                  <span className="box-label">Under Review</span>
                </div>
                <div className="verification-box highlight-danger">
                  <span className="box-count danger">{metrics.verification.changesRequired}</span>
                  <span className="box-label">Changes Required</span>
                  {metrics.verification.changesRequired > 0 && (
                    <button className="box-action-btn" onClick={() => navigate("/products?status=changes_required")}>Fix Now →</button>
                  )}
                </div>
                <div className="verification-box highlight-success">
                  <span className="box-count success">{metrics.verification.approved}</span>
                  <span className="box-label">Approved & Active</span>
                </div>
                <div className="verification-box">
                  <span className="box-count">{metrics.verification.rejected}</span>
                  <span className="box-label">Rejected</span>
                </div>
              </div>
            </div>

            {/* Inventory Stock Alerts */}
            <div className="cw-card">
              <div className="cw-card-header">
                <div>
                  <h2>Inventory Alerts</h2>
                  <p>Items requiring catalog restock</p>
                </div>
                <button className="cw-text-btn" onClick={() => navigate("/products")}>
                  Manage Stock <FiChevronRight />
                </button>
              </div>

              <div className="inventory-alerts-list">
                {loading ? (
                  <p className="table-loading">Checking inventory records...</p>
                ) : lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 3).map((item) => (
                    <div className="alert-item" key={item.id}>
                      <div className="alert-meta">
                        <div className={`alert-icon-box ${item.stock_quantity === 0 ? "danger" : "warning"}`}>
                          {item.stock_quantity === 0 ? <FiArchive /> : <FiAlertTriangle />}
                        </div>
                        <div>
                          <strong>{item.name || item.title || "Product"}</strong>
                          <span>SKU: {item.sku || `CW-${item.id}`} | Category: {item.category || "Uncategorized"}</span>
                        </div>
                      </div>
                      <div className="alert-action">
                        <span className={`stock-count ${item.stock_quantity === 0 ? "danger" : "warning"}`}>
                          {item.stock_quantity === 0 ? "0 in stock" : `Only ${item.stock_quantity} left`}
                        </span>
                        <button className="cw-btn micro" onClick={() => navigate(`/products/edit/${item.id}`)}>
                          Update Stock
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-table-state">
                    <p>No inventory stock alerts found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RECENT ORDERS TABLE */}
          <div className="cw-card">
            <div className="cw-card-header">
              <div>
                <h2>Recent Orders</h2>
                <p>Live marketplace transactions</p>
              </div>
              <div className="tab-actions">
                <div className="cw-pill-filters">
                  <button className={activeOrderTab === "all" ? "active" : ""} onClick={() => setActiveOrderTab("all")}>All</button>
                  <button className={activeOrderTab === "new" ? "active" : ""} onClick={() => setActiveOrderTab("new")}>New</button>
                  <button className={activeOrderTab === "processing" ? "active" : ""} onClick={() => setActiveOrderTab("processing")}>Processing</button>
                  <button className={activeOrderTab === "shipped" ? "active" : ""} onClick={() => setActiveOrderTab("shipped")}>Shipped</button>
                  <button className={activeOrderTab === "delivered" ? "active" : ""} onClick={() => setActiveOrderTab("delivered")}>Delivered</button>
                </div>
                <button className="cw-text-btn" onClick={() => navigate("/orders")}>
                  Full Table <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="cw-table-responsive">
              <table className="cw-data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product Details</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="table-loading">Loading live marketplace data...</td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td><strong>#{order.order_number || order.id}</strong></td>
                        <td>
                          <div className="table-product">
                            <div className="prod-thumb">🏺</div>
                            <div>
                              <span className="prod-name">{order.product_name || order.items?.[0]?.name || "Order Item"}</span>
                              <span className="prod-sku">SKU: {order.sku || `CW-${order.id}`}</span>
                            </div>
                          </div>
                        </td>
                        <td>{order.customer_name || order.user?.full_name || "Customer"}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                        <td><strong>₹{order.total_amount ? Number(order.total_amount).toLocaleString("en-IN") : "0"}</strong></td>
                        <td><span className="payment-tag">{order.payment_method || "N/A"}</span></td>
                        <td>
                          <span className={`status-badge ${order.status || "processing"}`}>
                            {order.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button className="cw-btn action-btn" onClick={() => navigate(`/orders/${order.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-table-state">
                          <FiShoppingBag />
                          <h3>No orders found</h3>
                          <p>When customer orders arrive from your API, they will render here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP PERFORMING PRODUCTS SECTION */}
          <div className="cw-card">
            <div className="cw-card-header">
              <div>
                <h2>Top Performing Products</h2>
                <p>Catalog items fetched from backend</p>
              </div>
              <button className="cw-text-btn" onClick={() => navigate("/products")}>
                View Full Catalog <FiChevronRight />
              </button>
            </div>

            <div className="cw-table-responsive">
              <table className="cw-data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Rating</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="table-loading">Loading catalog...</td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.slice(0, 5).map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="table-product">
                            <div className="prod-thumb">🍶</div>
                            <div>
                              <span className="prod-name">{product.name || product.title}</span>
                              <span className="prod-sku">ID: {product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{product.category || "Uncategorized"}</td>
                        <td><strong>{product.units_sold ?? 0} sold</strong></td>
                        <td><strong>₹{product.revenue ? Number(product.revenue).toLocaleString("en-IN") : "0"}</strong></td>
                        <td><span className="rating-pill">{product.rating ? `${product.rating} ★` : "N/A"}</span></td>
                        <td>{product.stock_quantity ?? 0} units</td>
                        <td>
                          <span className={`status-badge ${product.status === "approved" || product.status === "active" ? "delivered" : "processing"}`}>
                            {product.status || "Draft"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-table-state">
                          <FiBox />
                          <h3>No catalog items found</h3>
                          <p>Add products via backend or the 'Add Product' form to populate this table.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="cw-card">
            <div className="cw-card-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Seller navigation operations</p>
              </div>
            </div>
            <div className="cw-quick-actions-grid">
              <button onClick={() => navigate("/products/add")}>
                <FiPlus />
                <span>Add Product</span>
              </button>
              <button onClick={() => navigate("/products")}>
                <FiBox />
                <span>Manage Inventory</span>
              </button>
              <button onClick={() => navigate("/orders")}>
                <FiShoppingBag />
                <span>Manage Orders</span>
              </button>
              <button onClick={() => navigate("/analytics")}>
                <FiBarChart2 />
                <span>View Analytics</span>
              </button>
              <button onClick={() => navigate("/payments")}>
                <FiDollarSign />
                <span>Payments</span>
              </button>
              <button onClick={() => navigate("/promotions")}>
                <FiTag />
                <span>Create Promotion</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}