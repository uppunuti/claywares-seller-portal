import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SellerLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  // ==========================================================
  // GET BACKEND MESSAGE
  // ==========================================================

  const getBackendMessage = (data) => {
    if (!data) {
      return "Login failed. Please try again.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.error) {
      return data.error;
    }

    return "Login failed. Please try again.";
  };

  // ==========================================================
  // CHECK SELLER STATUS
  // ==========================================================

  const getSellerStatus = (data) => {
    if (!data) {
      return null;
    }

    return (
      data.status ||
      data.account_status ||
      data.seller_status ||
      data.verification_status ||
      data.user?.status ||
      data.user?.account_status ||
      data.seller?.status ||
      data.seller?.account_status ||
      null
    );
  };

  // ==========================================================
  // SAVE SELLER INFORMATION
  // ==========================================================

  const saveSellerData = (data) => {
    localStorage.setItem(
      "seller",
      JSON.stringify(data)
    );

    if (data.user_id) {
      localStorage.setItem(
        "sellerUserId",
        String(data.user_id)
      );
    }

    if (data.seller_id) {
      localStorage.setItem(
        "sellerId",
        String(data.seller_id)
      );
    }

    if (data.phone_number) {
      localStorage.setItem(
        "sellerPhone",
        data.phone_number
      );
    }

    if (data.email) {
      localStorage.setItem(
        "sellerEmail",
        data.email
      );
    }

    if (data.name) {
      localStorage.setItem(
        "sellerName",
        data.name
      );
    }

    if (data.shop_name) {
      localStorage.setItem(
        "sellerShopName",
        data.shop_name
      );
    }
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!form.identifier.trim()) {
      setMessage("Please enter your email or phone number.");
      return;
    }

    if (!form.password) {
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        password: form.password,
      };

      if (form.identifier.includes("@")) {
        payload.email = form.identifier.trim();
      } else {
        payload.phone_number = form.identifier.trim();
      }

      console.log("=================================");
      console.log("SELLER LOGIN");
      console.log("IDENTIFIER:", form.identifier);

      const response = await api.post(
        "/accounts/login/",
        payload
      );

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", response.data);

      const data = response.data;

      // ======================================================
      // SAVE SELLER DATA
      // ======================================================

      saveSellerData(data);

      // ======================================================
      // SAVE JWT
      // ======================================================

      if (data.access) {
        localStorage.setItem(
          "sellerAccessToken",
          data.access
        );
      }

      if (data.refresh) {
        localStorage.setItem(
          "sellerRefreshToken",
          data.refresh
        );
      }

      // ======================================================
      // GET STATUS
      // ======================================================

      const sellerStatus = String(
        getSellerStatus(data) || "active"
      ).toLowerCase();

      console.log(
        "SELLER ACCOUNT STATUS:",
        sellerStatus
      );

      // ======================================================
      // PENDING VERIFICATION
      // ======================================================

      if (
        sellerStatus === "pending" ||
        sellerStatus === "under_verification" ||
        sellerStatus === "verification_pending" ||
        sellerStatus === "waiting"
      ) {
        navigate("/seller-approval-pending", {
          replace: true,
        });

        return;
      }

      // ======================================================
      // REJECTED
      // ======================================================

      if (
        sellerStatus === "rejected" ||
        sellerStatus === "declined"
      ) {
        navigate("/seller-rejected", {
          replace: true,
          state: {
            reason:
              data.rejection_reason ||
              data.reason ||
              "Your seller account was not approved.",
          },
        });

        return;
      }

      // ======================================================
      // APPROVED / ACTIVE
      // ======================================================

      if (
        sellerStatus === "approved" ||
        sellerStatus === "active" ||
        sellerStatus === "verified"
      ) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      // ======================================================
      // IF BACKEND DOES NOT SEND STATUS
      // ======================================================
      //
      // If login returned JWT successfully, allow dashboard.
      //

      if (data.access) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      setMessage(
        data.message ||
          "Login completed, but account status could not be determined."
      );

    } catch (error) {
      console.error("=================================");
      console.error("SELLER LOGIN ERROR");
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);

      const data = error.response?.data;

      // ======================================================
      // IMPORTANT:
      // BACKEND MAY BLOCK LOGIN BECAUSE SELLER IS PENDING
      // ======================================================

      const sellerStatus = String(
        getSellerStatus(data) || ""
      ).toLowerCase();

      console.log(
        "STATUS FROM ERROR RESPONSE:",
        sellerStatus
      );

      // ------------------------------------------------------
      // PENDING
      // ------------------------------------------------------

      if (
        sellerStatus === "pending" ||
        sellerStatus === "under_verification" ||
        sellerStatus === "verification_pending" ||
        sellerStatus === "waiting"
      ) {
        saveSellerData(data);

        navigate("/seller-approval-pending", {
          replace: true,
        });

        return;
      }

      // ------------------------------------------------------
      // REJECTED
      // ------------------------------------------------------

      if (
        sellerStatus === "rejected" ||
        sellerStatus === "declined"
      ) {
        navigate("/seller-rejected", {
          replace: true,
          state: {
            reason:
              data?.rejection_reason ||
              data?.reason ||
              "Your seller account was not approved.",
          },
        });

        return;
      }

      // ======================================================
      // CHECK MESSAGE FOR PENDING
      // ======================================================

      const backendMessage = getBackendMessage(data);

      const lowerMessage =
        backendMessage.toLowerCase();

      if (
        lowerMessage.includes("pending") ||
        lowerMessage.includes("verification") ||
        lowerMessage.includes("under review") ||
        lowerMessage.includes("awaiting approval") ||
        lowerMessage.includes("waiting for approval")
      ) {
        navigate("/seller-approval-pending", {
          replace: true,
        });

        return;
      }

      // ======================================================
      // NORMAL LOGIN ERROR
      // ======================================================

      setMessage(backendMessage);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "100%",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Seller Login
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Login to your ClayWare Seller Account
        </p>

        <form onSubmit={handleSubmit}>

          {/* IDENTIFIER */}

          <input
            type="text"
            name="identifier"
            placeholder="Email or Phone Number"
            value={form.identifier}
            onChange={handleChange}
            disabled={loading}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />

          {/* PASSWORD */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          {/* ERROR */}

          {message && (
            <div
              style={{
                color: "#c62828",
                background: "#ffebee",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "15px",
              }}
            >
              {message}
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#aaa"
                : "#d97706",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Checking account..."
              : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Don't have a seller account?{" "}
          <Link to="/register">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}