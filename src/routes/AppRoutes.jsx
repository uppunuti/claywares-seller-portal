import { BrowserRouter, Routes, Route } from "react-router-dom";

import SellerLanding from "../pages/SellerLanding";
import SellerLogin from "../pages/auth/SellerLogin";
import SellerRegister from "../pages/auth/SellerRegister";
import SellerApprovalPending from "../pages/auth/SellerApprovalPending";
import PickupLocation from "../pages/settings/PickupLocation";
import Dashboard from "../pages/dashboard/Dashboard";

import Products from "../pages/products/Products";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import Inventory from "../pages/inventory/Inventory";

// Future pages
// import Inventory from "../pages/inventory/Inventory";
// import Orders from "../pages/orders/Orders";
// import Analytics from "../pages/analytics/Analytics";
// import SellerProfile from "../pages/profile/SellerProfile";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ==================================================
                    SELLER LANDING
                ================================================== */}

                <Route
                    path="/"
                    element={<SellerLanding />}
                />

                {/* ==================================================
                    AUTH
                ================================================== */}

                <Route
                    path="/login"
                    element={<SellerLogin />}
                />

                <Route
                    path="/register"
                    element={<SellerRegister />}
                />

                <Route
                    path="/seller-approval-pending"
                    element={<SellerApprovalPending />}
                />

                {/* ==================================================
                    DASHBOARD
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* ==================================================
                    PRODUCTS
                ================================================== */}

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/products/add"
                    element={<AddProduct />}
                />

                <Route
                    path="/products/edit/:id"
                    element={<EditProduct />}
                />

                {/* ==================================================
                    FUTURE ROUTES
                ================================================== */}

               
                <Route
                    path="/inventory"
                    element={<Inventory />}
                />
                <Route
    path="/pickup-location"
    element={<PickupLocation />}
/>
{/* 
                <Route
                    path="/orders"
                    element={<Orders />}
                />

                <Route
                    path="/analytics"
                    element={<Analytics />}
                />

                <Route
                    path="/profile"
                    element={<SellerProfile />}
                />
                 */}

            </Routes>
        </BrowserRouter>
    );
}