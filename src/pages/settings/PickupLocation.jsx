import React, { useEffect, useState } from "react";
import {
    FiMapPin,
    FiNavigation,
    FiCheckCircle,
    FiRefreshCw,
    FiAlertTriangle
} from "react-icons/fi";

import api from "../../api/axios";
//import "../styles/PickupLocation.css";


export default function PickupLocation() {

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [location, setLocation] = useState({
        contact_name: "",
        contact_phone: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        latitude: "",
        longitude: "",
        is_default: true
    });


    // ======================================================
    // LOAD EXISTING LOCATION
    // ======================================================

    useEffect(() => {

        loadLocation();

    }, []);


    const loadLocation = async () => {

        try {

            const response = await api.get(
                "/seller/pickup-location/"
            );

            if (
                response.data?.exists &&
                response.data?.location
            ) {

                setLocation(
                    response.data.location
                );

            }

        } catch (err) {

            console.error(
                "Pickup location loading error:",
                err
            );

        }

    };


    // ======================================================
    // INPUT CHANGE
    // ======================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setLocation(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // ======================================================
    // AUTO DETECT LOCATION
    // ======================================================

    const detectLocation = () => {

        setError("");
        setMessage("");
        setLoading(true);

        if (!navigator.geolocation) {

            setError(
                "Location detection is not supported by your browser."
            );

            setLoading(false);

            return;
        }


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                setLocation(prev => ({
                    ...prev,
                    latitude,
                    longitude
                }));


                try {

                    /*
                     * Reverse geocoding.
                     *
                     * OpenStreetMap Nominatim is used here.
                     * For production, you can later move this
                     * reverse geocoding to Django.
                     */

                    const response =
                        await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to detect address."
                        );

                    }


                    const data =
                        await response.json();


                    const address =
                        data.address || {};


                    setLocation(prev => ({
                        ...prev,

                        latitude,
                        longitude,

                        address:
                            data.display_name ||
                            prev.address,

                        city:
                            address.city ||
                            address.town ||
                            address.village ||
                            address.municipality ||
                            "",

                        state:
                            address.state ||
                            "",

                        postal_code:
                            address.postcode ||
                            "",

                        country:
                            address.country ||
                            "India"
                    }));


                    setMessage(
                        "Location detected successfully. Please verify the address."
                    );


                } catch (err) {

                    console.error(
                        err
                    );

                    setError(
                        "GPS detected, but address could not be found. Please enter the address manually."
                    );

                } finally {

                    setLoading(false);

                }

            },

            (error) => {

                console.error(
                    "GPS error:",
                    error
                );

                let errorMessage =
                    "Unable to detect your location.";

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    errorMessage =
                        "Location permission was denied. Please allow location access.";

                }

                if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    errorMessage =
                        "Your current location is unavailable.";

                }

                if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    errorMessage =
                        "Location detection timed out.";

                }

                setError(
                    errorMessage
                );

                setLoading(false);

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    };


    // ======================================================
    // SAVE
    // ======================================================

    const saveLocation = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");


        if (
            !location.latitude ||
            !location.longitude
        ) {

            setError(
                "Please detect your location before saving."
            );

            return;
        }


        setSaving(true);


        try {

            const response =
                await api.post(
                    "/seller/pickup-location/",
                    location
                );


            setMessage(
                response.data?.message ||
                "Pickup location saved successfully."
            );


        } catch (err) {

            console.error(
                "Save pickup location error:",
                err
            );


            if (
                err.response?.data
            ) {

                setError(
                    Object.values(
                        err.response.data
                    )
                    .flat()
                    .join(" ")
                );

            } else {

                setError(
                    "Unable to save pickup location."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    return (

        <div className="pickup-page">

            <div className="pickup-container">

                {/* HEADER */}

                <div className="pickup-header">

                    <div>

                        <span className="pickup-eyebrow">
                            SHIPPING CONFIGURATION
                        </span>

                        <h1>
                            Pickup Location
                        </h1>

                        <p>
                            This address will be used by
                            ClayWare for ShipMate shipment
                            pickups.
                        </p>

                    </div>

                    <div className="pickup-header-icon">

                        <FiMapPin />

                    </div>

                </div>


                {/* DETECT CARD */}

                <div className="detect-card">

                    <div className="detect-icon">

                        <FiNavigation />

                    </div>

                    <div className="detect-content">

                        <h3>
                            Automatically detect your location
                        </h3>

                        <p>
                            Allow browser location access and
                            ClayWare will automatically fill
                            your pickup address.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="detect-btn"
                        onClick={detectLocation}
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <FiRefreshCw className="spin" />
                                Detecting...
                            </>

                        ) : (

                            <>
                                <FiNavigation />
                                Detect My Location
                            </>

                        )}

                    </button>

                </div>


                {/* MESSAGE */}

                {message && (

                    <div className="success-message">

                        <FiCheckCircle />

                        {message}

                    </div>

                )}


                {error && (

                    <div className="error-message">

                        <FiAlertTriangle />

                        {error}

                    </div>

                )}


                {/* FORM */}

                <form
                    className="pickup-form"
                    onSubmit={saveLocation}
                >

                    <div className="section-title">

                        <h2>
                            Pickup Details
                        </h2>

                        <span>
                            Verify before saving
                        </span>

                    </div>


                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Contact Name
                            </label>

                            <input
                                name="contact_name"
                                value={
                                    location.contact_name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Contact Phone
                            </label>

                            <input
                                name="contact_phone"
                                value={
                                    location.contact_phone
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group full">

                            <label>
                                Pickup Address
                            </label>

                            <textarea
                                name="address"
                                rows="3"
                                value={
                                    location.address
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Landmark
                            </label>

                            <input
                                name="landmark"
                                value={
                                    location.landmark || ""
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Near..."
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                City
                            </label>

                            <input
                                name="city"
                                value={
                                    location.city
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                State
                            </label>

                            <input
                                name="state"
                                value={
                                    location.state
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                PIN Code
                            </label>

                            <input
                                name="postal_code"
                                value={
                                    location.postal_code
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* GPS */}

                    <div className="coordinates-card">

                        <div>

                            <span>
                                GPS Coordinates
                            </span>

                            <strong>

                                {location.latitude
                                    ? `${location.latitude}, ${location.longitude}`
                                    : "Location not detected"}

                            </strong>

                        </div>

                        {location.latitude && (

                            <FiCheckCircle />

                        )}

                    </div>


                    {/* SAVE */}

                    <div className="form-footer">

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Pickup Location"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}