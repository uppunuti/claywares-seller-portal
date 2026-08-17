import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SellerRegister() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    shop_name: "",
    shop_address: "",
    gst_number: "",
  });

  const [idProof, setIdProof] = useState(null);

  // ==========================================================
  // HANDLE TEXT INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // ==========================================================
  // HANDLE FILE
  // ==========================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setIdProof(file);
    setErrorMessage("");
  };

  // ==========================================================
  // BACKEND ERROR HANDLING
  // ==========================================================

  const getErrorMessage = (error) => {
    // --------------------------------------------------------
    // Django did not respond
    // --------------------------------------------------------

    if (!error.response) {
      return (
        "Unable to connect to the server.\n\n" +
        "Please check whether Django is running."
      );
    }

    const status = error.response.status;
    const data = error.response.data;

    console.log("=================================");
    console.log("BACKEND ERROR");
    console.log("STATUS:", status);
    console.log("DATA:", data);

    // --------------------------------------------------------
    // String response
    // --------------------------------------------------------

    if (typeof data === "string") {
      return data;
    }

    // --------------------------------------------------------
    // Normal custom message
    // --------------------------------------------------------

    if (data?.message) {
      return data.message;
    }

    // --------------------------------------------------------
    // DRF detail
    // --------------------------------------------------------

    if (data?.detail) {
      return data.detail;
    }

    // --------------------------------------------------------
    // Validation errors
    // Example:
    //
    // {
    //   "email": ["This email already exists."]
    // }
    // --------------------------------------------------------

    if (typeof data === "object" && data !== null) {
      const messages = [];

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(
            `${formatFieldName(field)}: ${value.join(", ")}`
          );
        } else if (typeof value === "string") {
          messages.push(
            `${formatFieldName(field)}: ${value}`
          );
        }
      });

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    // --------------------------------------------------------
    // Status based fallback
    // --------------------------------------------------------

    if (status === 400) {
      return (
        "Registration could not be completed.\n" +
        "Please check the information you entered."
      );
    }

    if (status === 401) {
      return "Authentication failed.";
    }

    if (status === 403) {
      return "You are not allowed to perform this action.";
    }

    if (status === 409) {
      return (
        "An account with this email or mobile number " +
        "already exists."
      );
    }

    if (status === 413) {
      return (
        "The uploaded ID proof is too large. " +
        "Please choose a smaller file."
      );
    }

    if (status === 500) {
      return (
        "A server error occurred.\n" +
        "Please try again later."
      );
    }

    return "Seller registration failed. Please try again.";
  };

  // ==========================================================
  // FORMAT FIELD NAME
  // ==========================================================

  const formatFieldName = (field) => {
    return field
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ==========================================================
  // FRONTEND VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter your full name.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!form.phone_number.trim()) {
      return "Please enter your mobile number.";
    }

    if (!form.password) {
      return "Please enter a password.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!form.shop_name.trim()) {
      return "Please enter your shop name.";
    }

    if (!form.shop_address.trim()) {
      return "Please enter your shop address.";
    }

    if (!idProof) {
      return "Please upload your ID proof.";
    }

    return null;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    // --------------------------------------------------------
    // Validate
    // --------------------------------------------------------

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // --------------------------------------------------------
    // Start loading
    // --------------------------------------------------------

    setLoading(true);

    try {
      // ======================================================
      // FORM DATA
      // ======================================================

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone_number",
        form.phone_number.trim()
      );

      formData.append(
        "password",
        form.password
      );

      formData.append(
        "shop_name",
        form.shop_name.trim()
      );

      formData.append(
        "shop_address",
        form.shop_address.trim()
      );

      // GST is optional
      if (form.gst_number.trim()) {
        formData.append(
          "gst_number",
          form.gst_number.trim()
        );
      }

      formData.append(
        "id_proof",
        idProof
      );

      // ======================================================
      // DEBUG
      // ======================================================

      console.log("=================================");
      console.log("SELLER REGISTRATION");
      console.log("=================================");

      console.log("Name:", form.name);
      console.log("Email:", form.email);
      console.log("Phone:", form.phone_number);
      console.log("Shop:", form.shop_name);
      console.log("ID Proof:", idProof.name);

      // ======================================================
      // API REQUEST
      // ======================================================

      const response = await api.post(
        "/accounts/seller-register/",
        formData
      );

      // ======================================================
      // SUCCESS RESPONSE
      // ======================================================

      console.log("=================================");
      console.log("SELLER REGISTRATION SUCCESS");
      console.log("=================================");

      console.log("HTTP STATUS:", response.status);
      console.log("RESPONSE:", response.data);

      // ======================================================
      // 201 CREATED
      // ======================================================

      if (response.status === 201) {
        const data = response.data || {};

        // ----------------------------------------------------
        // Save registration information
        // ----------------------------------------------------

        const registrationData = {
          user_id:
            data.user_id || null,

          seller_id:
            data.seller_id || null,

          name:
            data.name || form.name.trim(),

          email:
            data.email || form.email.trim(),

          phone_number:
            data.phone_number ||
            form.phone_number.trim(),

          shop_name:
            data.shop_name ||
            form.shop_name.trim(),

          status:
            data.status || "pending",

          message:
            data.message ||
            "Seller registration submitted successfully.",
        };

        console.log(
          "REGISTRATION DATA:",
          registrationData
        );

        // ----------------------------------------------------
        // Save temporarily for approval page
        // ----------------------------------------------------

        sessionStorage.setItem(
          "sellerRegistration",
          JSON.stringify(registrationData)
        );

        // ----------------------------------------------------
        // IMPORTANT
        // Redirect immediately
        // ----------------------------------------------------

        navigate(
          "/seller-approval-pending",
          {
            replace: true,
          }
        );

        return;
      }

      // ======================================================
      // UNEXPECTED SUCCESS
      // ======================================================

      setErrorMessage(
        response.data?.message ||
          "Registration could not be completed."
      );

    } catch (error) {
      // ======================================================
      // API ERROR
      // ======================================================

      console.error("=================================");
      console.error("SELLER REGISTRATION FAILED");
      console.error("=================================");

      console.error("ERROR:", error);
      console.error(
        "STATUS:",
        error.response?.status
      );
      console.error(
        "DATA:",
        error.response?.data
      );

      // ------------------------------------------------------
      // Display proper error
      // ------------------------------------------------------

      const message = getErrorMessage(error);

      setErrorMessage(message);

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
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      {/* ====================================================
          TITLE
      ===================================================== */}

      <h2>Seller Registration</h2>

      {/* ====================================================
          ERROR
      ===================================================== */}

      {errorMessage && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "20px",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
          }}
        >
          <strong>Registration failed</strong>

          <div
            style={{
              marginTop: "6px",
            }}
          >
            {errorMessage}
          </div>
        </div>
      )}

      {/* ====================================================
          FORM
      ===================================================== */}

      <form onSubmit={handleSubmit}>

        {/* NAME */}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* EMAIL */}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* PHONE */}

        <input
          type="tel"
          name="phone_number"
          placeholder="Mobile Number"
          value={form.phone_number}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* PASSWORD */}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* SHOP NAME */}

        <input
          type="text"
          name="shop_name"
          placeholder="Shop Name"
          value={form.shop_name}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* SHOP ADDRESS */}

        <textarea
          name="shop_address"
          placeholder="Shop Address"
          value={form.shop_address}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <br />
        <br />

        {/* GST */}

        <input
          type="text"
          name="gst_number"
          placeholder="GST Number (Optional)"
          value={form.gst_number}
          onChange={handleChange}
          disabled={loading}
        />

        <br />
        <br />

        {/* ID PROOF */}

        <label>
          <strong>ID Proof</strong>
        </label>

        <br />

        <input
          type="file"
          name="id_proof"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={loading}
          required
        />

        {idProof && (
          <p>
            Selected file:{" "}
            <strong>{idProof.name}</strong>
          </p>
        )}

        <br />

        {/* ==================================================
            REGISTER BUTTON
        ================================================== */}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Submitting..."
            : "Register"}
        </button>
      </form>

      <br />

      {/* LOGIN */}

      <p>
        Already have an account?{" "}

        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}