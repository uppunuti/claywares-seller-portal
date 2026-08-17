import { BrowserRouter, Routes, Route } from "react-router-dom";

import SellerLanding from "../pages/SellerLanding";
import SellerLogin from "../pages/auth/SellerLogin";
import SellerRegister from "../pages/auth/SellerRegister";
import SellerApprovalPending from "../pages/auth/SellerApprovalPending";

import Dashboard from "../pages/dashboard/Dashboard";


// import Products from "../pages/products/Products";
import AddProduct from "../pages/products/AddProduct";
// import EditProduct from "../pages/products/EditProduct";

// import Inventory from "../pages/inventory/Inventory";
// import Orders from "../pages/orders/Orders";

// import Analytics from "../pages/analytics/Analytics";
// import SellerProfile from "../pages/profile/SellerProfile";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<SellerLanding />} />

                <Route path="/login" element={<SellerLogin />} />

                <Route path="/register" element={<SellerRegister />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route
          path="/seller-approval-pending"
          element={<SellerApprovalPending />}
        />

                {/* <Route path="/products" element={<Products />} /> */}
                

                <Route
                    path="/products/add"
                    element={<AddProduct />}
                />

                {/* <Route
                    path="/products/edit/:id"
                    element={<EditProduct />}
                />

                <Route 
                    path="/inventory"
                    element={<Inventory />}
                 
{/* 
                <Route
                    path="/orders"
                    element={<Orders />}
                />

                <Route
                    path="/analytics"
                    element={<Analytics />}
                /> */}

                {/* <Route
                    path="/profile"
                    element={<SellerProfile />}
                /> */}

            </Routes>
        </BrowserRouter>
    );
}