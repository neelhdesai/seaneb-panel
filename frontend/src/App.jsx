import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/Login";
import AllBusinesses from "./components/AllBusinesses";
import BusinessRegister from "./components/BusinessRegister";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "../routes/PrivateRoute";
import ChangePassword from "./components/ChangePassword";
import ConsultantRegister from "./components/ConsultantRegister";
import ConsultantApproval from "./components/ConsultantApproval";
import MyBusinesses from "./components/MyBusinesses";
import RegisterUser from "./components/RegisterUser";
import RegisterBusinessNoPayment from "./components/RegisterBusinessNoPayment";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from "./components/MyProfile";
import ForgotPassword from "./components/ForgotPassword";
import Hero from "./components/Hero";
import CommissionPage from "./components/commissionData";
import HowAppWorks from "./components/HowAppWorks";
import AddShowcase from "./components/AddShowcase";
import ShowCaseList from "./components/ShowCaseList";
import UsersListPage from "./components/UsersListPage";
import DashboardKPI from "./components/DashboardKPI";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consultant" element={<Hero />} />
        <Route path="/consultant-registration" element={<ConsultantRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/business-register"
          element={
            <PrivateRoute allowedRoles={["consultant"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <BusinessRegister />
                </main>
              </div>
            </PrivateRoute>
          }
        />

         <Route
          path="/register-user"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <RegisterUser />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/showcase-add"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <AddShowcase />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/get-showcase"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <ShowCaseList />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/users-list"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <UsersListPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <DashboardKPI />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        
         <Route
          path="/register-business-no-payment"
          element={
            <PrivateRoute allowedRoles={["admin", "dataentry"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <RegisterBusinessNoPayment />
                </main>
              </div>
            </PrivateRoute>
          }
        />
        
        

        <Route
          path="/my-business"
          element={
            <PrivateRoute allowedRoles={["consultant"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <MyBusinesses />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <MyProfile />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <ChangePassword />
                </main>
              </div>
            </PrivateRoute>
          }
        />

         <Route
          path="/payout-structure"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <CommissionPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/how-app-works"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <HowAppWorks />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/user-business"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <AllBusinesses />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/new-consultant"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-4">
                  <ConsultantApproval />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/consultant" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
