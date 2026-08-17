import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  Mail,
  Check,
  Circle,
  Loader2,
  RefreshCw,
  ChevronRight,
  User,
  Phone,
  AtSign,
  Store,
  Hash,
  Briefcase
} from "lucide-react";

export default function SellerApprovalPending() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [status, setStatus] = useState("pending");
  const [verificationStage, setVerificationStage] = useState(1);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const refreshInterval = useRef(null);

  // Get seller data from storage
  const getSellerData = useCallback(() => {
    try {
      const sessionData = sessionStorage.getItem("sellerRegistration");
      const localData = localStorage.getItem("seller");
      const rawData = sessionData || localData || "{}";
      return JSON.parse(rawData);
    } catch {
      return {};
    }
  }, []);

  // Fetch seller status from backend
  const fetchSellerStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        const data = getSellerData();
        if (data && Object.keys(data).length > 0) {
          setSellerData(data);
          setStatus(data.status || "pending");
          setVerificationStage(data.verification_stage || 1);
          setLoading(false);
        } else {
          setError("No registration data found. Please login again.");
          setLoading(false);
        }
        return;
      }

      const response = await fetch("/accounts/seller-status/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      const result = await response.json();
      setSellerData(result);
      setStatus(result.status || "pending");
      setVerificationStage(result.verification_stage || 1);

      if (result.status === "approved") {
        navigate("/dashboard", { replace: true });
        return;
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching seller status:", err);
      const data = getSellerData();
      if (data && Object.keys(data).length > 0) {
        setSellerData(data);
        setStatus(data.status || "pending");
        setVerificationStage(data.verification_stage || 1);
        setLoading(false);
      } else {
        setError("Unable to load application status. Please try again.");
        setLoading(false);
      }
    }
  }, [getSellerData, navigate]);

  // Initial load
  useEffect(() => {
    fetchSellerStatus();

    refreshInterval.current = setInterval(() => {
      if (!refreshing) {
        fetchSellerStatus();
      }
    }, 60000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchSellerStatus, refreshing]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchSellerStatus();
    setRefreshing(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@clayware.com";
  };

  const displayName = sellerData?.name || sellerData?.full_name || localStorage.getItem("sellerName") || "N/A";
  const displayEmail = sellerData?.email || localStorage.getItem("sellerEmail") || "N/A";
  const displayPhone = sellerData?.phone_number || sellerData?.phone || localStorage.getItem("sellerPhone") || "N/A";
  const displayShopName = sellerData?.shop_name || sellerData?.business_name || localStorage.getItem("sellerShopName") || "N/A";
  const displayUserId = sellerData?.user_id || sellerData?.userId || localStorage.getItem("sellerUserId") || "N/A";
  const displaySellerId = sellerData?.seller_id || sellerData?.sellerId || localStorage.getItem("sellerId") || "N/A";
  const applicationId = sellerData?.application_id || sellerData?.reference_id || `CW-${Date.now().toString().slice(-8)}`;

  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return { label: "Approved", icon: CheckCircle, color: "approved" };
      case "rejected":
        return { label: "Rejected", icon: AlertCircle, color: "rejected" };
      case "changes_requested":
        return { label: "Changes Requested", icon: AlertCircle, color: "changes" };
      case "pending":
      case "under_review":
      default:
        return { label: "Under Verification", icon: Clock, color: "pending" };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const steps = [
    { id: 1, label: "Registration Submitted", status: verificationStage >= 1 ? "completed" : "pending" },
    { id: 2, label: "Document Verification", status: verificationStage >= 2 ? "completed" : verificationStage === 1 ? "current" : "pending" },
    { id: 3, label: "Business Verification", status: verificationStage >= 3 ? "completed" : verificationStage === 2 ? "current" : "pending" },
    { id: 4, label: "Seller Account Activation", status: verificationStage >= 4 ? "completed" : verificationStage === 3 ? "current" : "pending" }
  ];

  const renderStepIcon = (stepStatus) => {
    switch (stepStatus) {
      case "completed":
        return <Check className="step-icon completed" size={18} />;
      case "current":
        return <Loader2 className="step-icon current" size={18} />;
      default:
        return <Circle className="step-icon pending" size={18} />;
    }
  };

  // Error state
  if (error && !sellerData) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoSection}>
              <span style={styles.logoIcon}>🏺</span>
              <span style={styles.logoText}>ClayWare</span>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.headerLabel}>Seller Portal</span>
            </div>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.errorState}>
              <AlertCircle size={48} style={styles.errorIcon} />
              <h2 style={styles.errorTitle}>Unable to Load Application</h2>
              <p style={styles.errorText}>{error}</p>
              <button style={styles.btnPrimary} onClick={() => navigate("/login")}>
                Go to Seller Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Rejected state
  if (status === "rejected") {
    const rejectionReason = sellerData?.rejection_reason || "Your application did not meet our verification requirements.";
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoSection}>
              <span style={styles.logoIcon}>🏺</span>
              <span style={styles.logoText}>ClayWare</span>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.headerLabel}>Seller Portal</span>
            </div>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={{...styles.statusCard, ...styles.statusCardRejected}}>
              <div style={styles.statusHeader}>
                <AlertCircle size={48} style={styles.statusIconError} />
                <h1 style={styles.title}>Application Rejected</h1>
                <p style={styles.statusSubtitle}>
                  We regret to inform you that your seller application could not be approved.
                </p>
              </div>
              <div style={styles.rejectionDetails}>
                <h3 style={styles.detailsTitle}>Reason for Rejection</h3>
                <p style={styles.detailsText}>{rejectionReason}</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.btnPrimary} onClick={handleContactSupport}>
                  Contact Support
                </button>
                <button style={styles.btnSecondary} onClick={() => navigate("/login")}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Changes requested state
  if (status === "changes_requested") {
    const requestedChanges = sellerData?.requested_changes || sellerData?.message || "Additional information is required to complete your verification.";
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoSection}>
              <span style={styles.logoIcon}>🏺</span>
              <span style={styles.logoText}>ClayWare</span>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.headerLabel}>Seller Portal</span>
            </div>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={{...styles.statusCard, ...styles.statusCardChanges}}>
              <div style={styles.statusHeader}>
                <AlertCircle size={48} style={styles.statusIconChanges} />
                <h1 style={styles.title}>Additional Information Required</h1>
                <p style={styles.statusSubtitle}>
                  We need more information to complete your verification.
                </p>
              </div>
              <div style={styles.changesDetails}>
                <h3 style={styles.detailsTitle}>What's Needed</h3>
                <p style={styles.detailsText}>{requestedChanges}</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.btnPrimary} onClick={handleContactSupport}>
                  Contact Support
                </button>
                <button style={styles.btnSecondary} onClick={() => navigate("/login")}>
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoSection}>
              <span style={styles.logoIcon}>🏺</span>
              <span style={styles.logoText}>ClayWare</span>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.headerLabel}>Seller Portal</span>
            </div>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.loadingState}>
              <Loader2 size={40} style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Loading your application...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main pending/under_review state
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoSection}>
            <span style={styles.logoIcon}>🏺</span>
            <span style={styles.logoText}>ClayWare</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.headerLabel}>Seller Portal</span>
            <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} style={refreshing ? styles.spinning : {}} />
              <span>{refreshing ? "Checking..." : "Refresh Status"}</span>
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          {/* Status Card */}
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <div style={styles.statusIconWrapper}>
                <CheckCircle size={48} style={styles.statusIconSuccess} />
              </div>
              <h1 style={styles.title}>Application Submitted Successfully</h1>
              <p style={styles.statusSubtitle}>
                Your seller registration has been received and is currently under verification.
              </p>
              <div style={{...styles.statusBadge, ...styles[`statusBadge${statusConfig.color.charAt(0).toUpperCase() + statusConfig.color.slice(1)}`]}}>
                <StatusIcon size={16} />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            {/* Application ID */}
            <div style={styles.applicationIdSection}>
              <div style={styles.idLabel}>Application ID</div>
              <div style={styles.idValueWrapper}>
                <span style={styles.idValue}>{applicationId}</span>
                <button style={styles.copyBtn} onClick={() => handleCopy(applicationId)}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div style={styles.detailsCard}>
            <h2 style={styles.cardTitle}>Registration Details</h2>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <User size={16} />
                  <span>Full Name</span>
                </div>
                <div style={styles.detailValue}>{displayName}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <Phone size={16} />
                  <span>Mobile Number</span>
                </div>
                <div style={styles.detailValue}>{displayPhone}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <AtSign size={16} />
                  <span>Email Address</span>
                </div>
                <div style={styles.detailValue}>{displayEmail}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <Store size={16} />
                  <span>Shop / Business Name</span>
                </div>
                <div style={styles.detailValue}>{displayShopName}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <Hash size={16} />
                  <span>User ID</span>
                </div>
                <div style={styles.detailValue}>{displayUserId}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>
                  <Briefcase size={16} />
                  <span>Seller ID</span>
                </div>
                <div style={styles.detailValue}>{displaySellerId}</div>
              </div>
            </div>
          </div>

          {/* Verification Progress */}
          <div style={styles.progressCard}>
            <h2 style={styles.cardTitle}>Verification Progress</h2>
            <div style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <div key={step.id} style={styles.stepWrapper}>
                  <div style={styles.stepItem}>
                    <div style={styles.stepIndicator}>
                      {renderStepIcon(step.status)}
                      {index < steps.length - 1 && <div style={styles.stepLine} />}
                    </div>
                    <div style={styles.stepContent}>
                      <span style={styles.stepLabel}>{step.label}</span>
                      <span style={{...styles.stepStatus, ...styles[`stepStatus${step.status.charAt(0).toUpperCase() + step.status.slice(1)}`]}}>
                        {step.status === "completed" && "Completed"}
                        {step.status === "current" && "In Progress"}
                        {step.status === "pending" && "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Happens Next */}
          <div style={styles.nextStepsCard}>
            <h2 style={styles.cardTitle}>What happens next?</h2>
            <ul style={styles.nextStepsList}>
              <li style={styles.nextStepItem}>
                <ChevronRight size={18} style={styles.nextStepIcon} />
                <span>Our verification team reviews your submitted information.</span>
              </li>
              <li style={styles.nextStepItem}>
                <ChevronRight size={18} style={styles.nextStepIcon} />
                <span>Your identity and business documents are checked.</span>
              </li>
              <li style={styles.nextStepItem}>
                <ChevronRight size={18} style={styles.nextStepIcon} />
                <span>If additional information is required, you will be contacted.</span>
              </li>
              <li style={styles.nextStepItem}>
                <ChevronRight size={18} style={styles.nextStepIcon} />
                <span>Once approved, your seller account will be activated.</span>
              </li>
            </ul>
          </div>

          {/* Important Notice */}
          <div style={styles.noticeCard}>
            <div style={styles.noticeContent}>
              <AlertCircle size={18} style={styles.noticeIcon} />
              <div style={styles.noticeText}>
                <p style={styles.noticeTextMain}>
                  <strong>Your seller dashboard will remain unavailable</strong> until your application is approved.
                </p>
                <p style={styles.noticeTextSub}>
                  You can return to the Seller Portal later and sign in to check your application status.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <Link to="/login" style={styles.btnPrimary}>
              Go to Seller Login
            </Link>
            <button style={styles.btnSecondary} onClick={handleContactSupport}>
              <Mail size={18} />
              Contact Support
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span>© {new Date().getFullYear()} ClayWare</span>
          <span style={styles.footerDivider}>|</span>
          <span>Seller Portal</span>
          <span style={styles.footerDivider}>|</span>
          <Link to="/privacy" style={styles.footerLink}>Privacy</Link>
          <span style={styles.footerDivider}>|</span>
          <Link to="/terms" style={styles.footerLink}>Terms</Link>
          <span style={styles.footerDivider}>|</span>
          <Link to="/support" style={styles.footerLink}>Support</Link>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  // Page
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
    color: "#111827",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // Header
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    height: "64px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "24px",
    lineHeight: 1,
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#15803d",
    letterSpacing: "-0.5px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6b7280",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  spinning: {
    animation: "spin 0.8s linear infinite",
  },

  // Main
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "40px 24px 60px",
  },
  container: {
    maxWidth: "900px",
    width: "100%",
  },

  // Loading
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "60px 20px",
    color: "#6b7280",
  },
  loadingSpinner: {
    animation: "spin 0.8s linear infinite",
    color: "#15803d",
  },
  loadingText: {
    margin: 0,
  },

  // Error
  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "60px 20px",
    textAlign: "center",
  },
  errorIcon: {
    color: "#ef4444",
  },
  errorTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
    color: "#111827",
  },
  errorText: {
    margin: 0,
    color: "#6b7280",
    maxWidth: "400px",
  },

  // Status Card
  statusCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "40px 48px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statusCardRejected: {
    borderTop: "4px solid #ef4444",
  },
  statusCardChanges: {
    borderTop: "4px solid #f59e0b",
  },
  statusHeader: {
    textAlign: "center",
    marginBottom: "32px",
  },
  statusIconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  statusIconSuccess: {
    color: "#15803d",
  },
  statusIconError: {
    color: "#ef4444",
  },
  statusIconChanges: {
    color: "#f59e0b",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  statusSubtitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    color: "#6b7280",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: 500,
    background: "#fef3c7",
    color: "#d97706",
  },
  statusBadgePending: {
    background: "#fef3c7",
    color: "#d97706",
  },
  statusBadgeApproved: {
    background: "#d1fae5",
    color: "#065f46",
  },
  statusBadgeRejected: {
    background: "#fee2e2",
    color: "#dc2626",
  },
  statusBadgeChanges: {
    background: "#fef3c7",
    color: "#d97706",
  },

  // Application ID
  applicationIdSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  idLabel: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  idValueWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  idValue: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    fontFamily: "monospace",
    letterSpacing: "0.5px",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#6b7280",
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Details Card
  detailsCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "32px 40px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  progressCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "32px 40px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  nextStepsCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "32px 40px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px 40px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  detailLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailValue: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#111827",
    paddingLeft: "22px",
  },

  // Steps
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  stepWrapper: {
    position: "relative",
  },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "10px 0",
  },
  stepIndicator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    position: "relative",
  },
  stepLine: {
    width: "2px",
    height: "32px",
    background: "#e5e7eb",
    marginTop: "4px",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingTop: "2px",
  },
  stepLabel: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#111827",
  },
  stepStatus: {
    fontSize: "13px",
  },
  stepStatusCompleted: {
    color: "#065f46",
  },
  stepStatusCurrent: {
    color: "#d97706",
  },
  stepStatusPending: {
    color: "#6b7280",
  },

  // Next Steps
  nextStepsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  nextStepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px 0",
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  nextStepIcon: {
    color: "#15803d",
    flexShrink: 0,
    marginTop: "2px",
  },

  // Notice
  noticeCard: {
    background: "#f0fdf4",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "32px",
    border: "1px solid #bbf7d0",
  },
  noticeContent: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  noticeIcon: {
    color: "#15803d",
    flexShrink: 0,
    marginTop: "1px",
  },
  noticeText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  noticeTextMain: {
    margin: 0,
    fontSize: "14px",
    color: "#065f46",
  },
  noticeTextSub: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },

  // Rejection/Changes
  rejectionDetails: {
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "24px",
    borderLeft: "4px solid #ef4444",
  },
  changesDetails: {
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "24px",
    borderLeft: "4px solid #f59e0b",
  },
  detailsTitle: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  },
  detailsText: {
    margin: 0,
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.6",
  },

  // Actions
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 500,
    color: "#ffffff",
    background: "#15803d",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.2s ease",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 500,
    color: "#374151",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Footer
  footer: {
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    padding: "16px 24px",
    flexShrink: 0,
  },
  footerInner: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#6b7280",
    flexWrap: "wrap",
  },
  footerDivider: {
    color: "#e5e7eb",
  },
  footerLink: {
    color: "#6b7280",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
};

// Inject keyframe animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .step-icon.completed { color: #065f46; }
  .step-icon.current { 
    color: #d97706;
    animation: spin 1s linear infinite;
  }
  .step-icon.pending { color: #d1d5db; }
  .refresh-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
  .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .copy-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
  .btn-primary:hover { background: #166534; }
  .btn-secondary:hover { background: #f3f4f6; border-color: #d1d5db; }
  .footer-link:hover { color: #15803d; }
  @media (max-width: 768px) {
    .header-inner { padding: 0 16px; }
    .details-grid { grid-template-columns: 1fr; gap: 16px; }
    .status-card { padding: 24px 20px; }
    .details-card { padding: 20px 16px; }
    .progress-card { padding: 20px 16px; }
    .next-steps-card { padding: 20px 16px; }
    .title { font-size: 22px; }
    .actions { flex-direction: column; align-items: center; }
    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
  }
  @media (max-width: 480px) {
    .main { padding: 20px 12px 40px; }
    .header-label { display: none; }
    .refresh-btn span { display: none; }
    .refresh-btn { padding: 6px 10px; }
    .id-value { font-size: 15px; }
    .application-id-section { padding-top: 16px; }
  }
`;
document.head.appendChild(styleSheet);