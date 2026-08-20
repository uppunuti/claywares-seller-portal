import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SellerRegister() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    shop_name: "",
    shop_address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
    latitude: "",
    longitude: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

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
  // GET CURRENT LOCATION
  // ==========================================================

  const getCurrentLocation = () => {
    setErrorMessage("");

    if (!navigator.geolocation) {
      setErrorMessage(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        /*
         * Reverse geocoding.
         *
         * This example uses OpenStreetMap Nominatim.
         * For production, you can replace this with
         * Google Maps / Mapbox / your own geocoding API.
         */

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Unable to detect address.");
          }

          const data = await response.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";

          const state = address.state || "";

          const pincode =
            address.postcode || "";

          const detectedAddress =
            data.display_name || "";

          setForm((prev) => ({
            ...prev,

            latitude: latitude.toString(),
            longitude: longitude.toString(),

            city: city,
            state: state,
            pincode: pincode,

            shop_address:
              prev.shop_address.trim()
                ? prev.shop_address
                : detectedAddress,
          }));

          setLocationConfirmed(true);
        } catch (error) {
          console.error(
            "Reverse geocoding failed:",
            error
          );

          /*
           * GPS still worked.
           * We keep coordinates even if address
           * lookup fails.
           */

          setLocationConfirmed(true);

          setErrorMessage(
            "Location detected, but the address could not be retrieved automatically. Please enter your shop address manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Location permission was denied. Please allow location access in your browser and try again."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setErrorMessage(
              "Your current location could not be determined. Please try again."
            );
            break;

          case error.TIMEOUT:
            setErrorMessage(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setErrorMessage(
              "Unable to detect your location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================================
  // MANUAL LOCATION CONFIRMATION
  // ==========================================================

  const confirmManualLocation = () => {
    if (
      !form.shop_address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setErrorMessage(
        "Please enter your complete shop location before confirming."
      );

      return;
    }

    setLocationConfirmed(true);
    setErrorMessage("");
  };

  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  const getErrorMessage = (error) => {
    if (!error.response) {
      return (
        "Unable to connect to the server.\n\n" +
        "Please check whether Django is running."
      );
    }

    const status = error.response.status;
    const data = error.response.data;

    console.log("BACKEND ERROR");
    console.log("STATUS:", status);
    console.log("DATA:", data);

    if (typeof data === "string") {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const messages = [];

      Object.entries(data).forEach(
        ([field, value]) => {
          if (Array.isArray(value)) {
            messages.push(
              `${formatFieldName(field)}: ${value.join(", ")}`
            );
          } else if (
            typeof value === "string"
          ) {
            messages.push(
              `${formatFieldName(field)}: ${value}`
            );
          }
        }
      );

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (status === 400) {
      return (
        "Registration could not be completed.\n" +
        "Please check the information you entered."
      );
    }

    if (status === 409) {
      return (
        "An account with this email or mobile number already exists."
      );
    }

    if (status === 413) {
      return (
        "The uploaded ID proof is too large. Please choose a smaller file."
      );
    }

    if (status === 500) {
      return (
        "A server error occurred. Please try again later."
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
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // ==========================================================
  // VALIDATION
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

    if (!form.city.trim()) {
      return "Please enter your city.";
    }

    if (!form.state.trim()) {
      return "Please enter your state.";
    }

    if (!form.pincode.trim()) {
      return "Please enter your pincode.";
    }

    if (!locationConfirmed) {
      return "Please detect or confirm your shop location.";
    }

    if (!form.latitude || !form.longitude) {
      return "Please provide your shop's exact location.";
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

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ======================================================
      // PERSONAL DETAILS
      // ======================================================

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

      // ======================================================
      // SHOP DETAILS
      // ======================================================

      formData.append(
        "shop_name",
        form.shop_name.trim()
      );

      formData.append(
        "shop_address",
        form.shop_address.trim()
      );

      formData.append(
        "city",
        form.city.trim()
      );

      formData.append(
        "state",
        form.state.trim()
      );

      formData.append(
        "pincode",
        form.pincode.trim()
      );

      // ======================================================
      // LOCATION
      // ======================================================

      formData.append(
        "latitude",
        form.latitude
      );

      formData.append(
        "longitude",
        form.longitude
      );

      // ======================================================
      // GST
      // ======================================================

      if (form.gst_number.trim()) {
        formData.append(
          "gst_number",
          form.gst_number.trim()
        );
      }

      // ======================================================
      // ID PROOF
      // ======================================================

      formData.append(
        "id_proof",
        idProof
      );

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        "SELLER REGISTRATION"
      );

      console.log("Name:", form.name);
      console.log("Email:", form.email);
      console.log("Phone:", form.phone_number);
      console.log("Shop:", form.shop_name);
      console.log("City:", form.city);
      console.log("State:", form.state);
      console.log("Pincode:", form.pincode);
      console.log("Latitude:", form.latitude);
      console.log("Longitude:", form.longitude);

      // ======================================================
      // API
      // ======================================================

      const response = await api.post(
        "/accounts/seller-register/",
        formData
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response.status === 201) {
        const data =
          response.data || {};

        const registrationData = {
          user_id:
            data.user_id || null,

          seller_id:
            data.seller_id || null,

          name:
            data.name ||
            form.name.trim(),

          email:
            data.email ||
            form.email.trim(),

          phone_number:
            data.phone_number ||
            form.phone_number.trim(),

          shop_name:
            data.shop_name ||
            form.shop_name.trim(),

          city:
            data.city ||
            form.city.trim(),

          state:
            data.state ||
            form.state.trim(),

          pincode:
            data.pincode ||
            form.pincode.trim(),

          latitude:
            data.latitude ||
            form.latitude,

          longitude:
            data.longitude ||
            form.longitude,

          status:
            data.status ||
            "pending",

          message:
            data.message ||
            "Seller registration submitted successfully.",
        };

        sessionStorage.setItem(
          "sellerRegistration",
          JSON.stringify(
            registrationData
          )
        );

        navigate(
          "/seller-approval-pending",
          {
            replace: true,
          }
        );

        return;
      }

      setErrorMessage(
        response.data?.message ||
          "Registration could not be completed."
      );
    } catch (error) {
      console.error(
        "SELLER REGISTRATION FAILED:",
        error
      );

      setErrorMessage(
        getErrorMessage(error)
      );
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
        maxWidth: "650px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fff",
      }}
    >
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
          <strong>
            Registration failed
          </strong>

          <div
            style={{
              marginTop: "6px",
            }}
          >
            {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ==================================================
            PERSONAL DETAILS
        =================================================== */}

        <h3>Personal Details</h3>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <input
          type="tel"
          name="phone_number"
          placeholder="Mobile Number"
          value={form.phone_number}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        {/* ==================================================
            SHOP DETAILS
        =================================================== */}

        <h3
          style={{
            marginTop: "30px",
          }}
        >
          Shop Details
        </h3>

        <input
          type="text"
          name="shop_name"
          placeholder="Shop Name"
          value={form.shop_name}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <textarea
          name="shop_address"
          placeholder="Complete Shop Address"
          value={form.shop_address}
          onChange={handleChange}
          disabled={loading}
          required
          rows={4}
          style={inputStyle}
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          disabled={loading}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          disabled={loading}
          required
          maxLength={6}
          style={inputStyle}
        />

        {/* ==================================================
            LOCATION
        =================================================== */}

        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#f8fafc",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            📍 Shop Location
          </h3>

          <p
            style={{
              color: "#666",
              fontSize: "14px",
            }}
          >
            Your shop location helps ClayWare verify
            your business and support delivery services.
          </p>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={
              loading || locationLoading
            }
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#166534",
              color: "#fff",
              cursor:
                loading || locationLoading
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            {locationLoading
              ? "Detecting Location..."
              : "📍 Use My Current Location"}
          </button>

          {form.latitude &&
            form.longitude && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  color: "#065f46",
                  fontSize: "14px",
                }}
              >
                <strong>
                  ✓ Location detected
                </strong>

                <div
                  style={{
                    marginTop: "5px",
                  }}
                >
                  Latitude:{" "}
                  {form.latitude}
                </div>

                <div>
                  Longitude:{" "}
                  {form.longitude}
                </div>
              </div>
            )}

          {!locationConfirmed && (
            <p
              style={{
                marginTop: "12px",
                color: "#b45309",
                fontSize: "14px",
              }}
            >
              Please detect your location or
              enter your address and confirm it.
            </p>
          )}

          {form.latitude &&
            form.longitude && (
              <button
                type="button"
                onClick={() =>
                  setLocationConfirmed(true)
                }
                style={{
                  marginTop: "12px",
                  padding: "9px 14px",
                  borderRadius: "7px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                ✓ Confirm This Location
              </button>
            )}
        </div>

        {/* ==================================================
            GST
        =================================================== */}

        <h3
          style={{
            marginTop: "30px",
          }}
        >
          Business Verification
        </h3>

        <input
          type="text"
          name="gst_number"
          placeholder="GST Number (Optional)"
          value={form.gst_number}
          onChange={handleChange}
          disabled={loading}
          style={inputStyle}
        />

        {/* ==================================================
            ID PROOF
        =================================================== */}

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label>
            <strong>ID Proof</strong>
          </label>

          <p
            style={{
              color: "#666",
              fontSize: "14px",
            }}
          >
            Upload Aadhaar, PAN, Driving Licence,
            or another accepted identity document.
          </p>

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
              <strong>
                {idProof.name}
              </strong>
            </p>
          )}
        </div>

        {/* ==================================================
            REGISTER
        =================================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            !locationConfirmed
          }
          style={{
            width: "100%",
            marginTop: "25px",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            background:
              loading ||
              !locationConfirmed
                ? "#9ca3af"
                : "#111827",
            color: "#fff",
            cursor:
              loading ||
              !locationConfirmed
                ? "not-allowed"
                : "pointer",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          {loading
            ? "Submitting Registration..."
            : "Submit Seller Registration"}
        </button>
      </form>

      <p
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}

// ==========================================================
// INPUT STYLE
// ==========================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
};