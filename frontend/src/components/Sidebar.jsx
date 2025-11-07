import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu, LogOut, Briefcase, KeyRound, X, UserRoundPlus, Handshake, User, IndianRupee, BookOpen,
  Building2,
  PlusSquare,
  ListChecks,
} from "lucide-react";
import { useState, useEffect } from "react";
import "../SidebarLayout.css";
import { usePendingConsultants } from "../context/PendingConsultantsContext";

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";
  const userRole = localStorage.getItem("role");


  const navItems = [];

  if (userRole === "admin") {
    navItems.push(
      { to: "/user-business", label: "User Business", icon: <Briefcase /> },
      { to: "/new-consultant", label: "Consultants", icon: <UserRoundPlus /> },
      { to: "/how-app-works", label: "How App Works", icon: <BookOpen /> },
      { to: "/payout-structure", label: "Payout Structure", icon: <IndianRupee /> },
      { to: "/my-profile", label: "My Profile", icon: <User /> },
      { to: "/change-password", label: "Change Password", icon: <KeyRound /> },
      { to: "/register-user", label: "Register User", icon: <UserRoundPlus /> },
      { to: "/register-business-no-payment", label: "Register Business", icon: <Building2 /> },
      { to: "/showcase-add", label: "Add Showcase", icon: <PlusSquare /> },
      { to: "/get-showcase", label: "Showcase List", icon: <ListChecks /> },
    );
  } else if (userRole === "consultant") {
    navItems.push(
      { to: "/business-register", label: "Business Register", icon: <Briefcase /> },
      { to: "/my-business", label: "My Business", icon: <Handshake /> },
      { to: "/how-app-works", label: "How App Works", icon: <BookOpen /> }
      ,
      { to: "/payout-structure", label: "Payout Structure", icon: <IndianRupee /> },
      { to: "/my-profile", label: "My Profile", icon: <User /> },
      { to: "/change-password", label: "Change Password", icon: <KeyRound /> },

    );
  } else if (userRole === "dataentry") {
    navItems.push(
      { to: "/register-user", label: "Register User", icon: <UserRoundPlus /> },
      { to: "/register-business-no-payment", label: "Register Business", icon: <Building2 /> },
      { to: "/showcase-add", label: "Add Showcase", icon: <PlusSquare /> },
      { to: "/get-showcase", label: "Showcase List", icon: <ListChecks /> },
    );
  }
  const { pendingConsultants } = usePendingConsultants();


  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    ["token", "user", "role"].forEach((k) => localStorage.removeItem(k));
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const showSidebar =
    isAuthenticated && !["/", "/register"].includes(location.pathname);

  return (

    <div className="sidebar-layout">
      {showSidebar && (
        <>
          {(isMobile || isTablet) && !mobileOpen && (
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </button>
          )}

          <aside
            className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""
              }`}
          >
            <div className="sidebar-header">
              {(!collapsed || isMobile || isTablet) && (
                <img src="/seaneb-offers.png" alt="Logo" />
              )}
              {collapsed && isDesktop && (
                <img src="/seaneb-icon.png" alt="Mini Logo" className="logo-mini" />
              )}

              <div className="sidebar-buttons">
                {(isMobile || isTablet) && (
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="btn-mobile-close"
                  >
                    <X />
                  </button>
                )}
                {isDesktop && (
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="btn-collapse"
                  >
                    <Menu />
                  </button>
                )}
              </div>
            </div>

            <div className={`user-info ${collapsed && isDesktop ? "center" : ""}`}>
              {!collapsed || isMobile || isTablet ? (
                <p>Welcome, {userName}</p>
              ) : (
                <img src="/seaneb-icon.png" alt="User" title={userName} />
              )}
            </div>

            <nav className="sidebar-nav">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 my-1 rounded-lg transition-colors duration-200
       ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
       ${collapsed && isDesktop ? "justify-center" : ""}`
                  }
                  onClick={() => (isMobile || isTablet) && setMobileOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    {icon}
                    {(!collapsed || isMobile || isTablet) && <span className="font-medium">{label}</span>}
                  </div>

                  {to === "/new-consultant" && pendingConsultants > 0 && !collapsed && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingConsultants}
                    </span>
                  )}

                  {collapsed && isDesktop && <span className="tooltip">{label}</span>}
                </NavLink>
              ))}


              <button
                onClick={() => {
                  handleLogout();
                  if (isMobile || isTablet) setMobileOpen(false);
                }}
                className={`nav-item logout ${collapsed && isDesktop ? "center" : ""}`}
              >
                <LogOut />
                {(!collapsed || isMobile || isTablet) && <span>Logout</span>}
                {collapsed && isDesktop && <span className="tooltip">Logout</span>}
              </button>
            </nav>
          </aside>

          {mobileOpen && (isMobile || isTablet) && (
            <div
              onClick={() => setMobileOpen(false)}
              className="sidebar-overlay"
            ></div>
          )}
        </>
      )}

      <main className={`main-content ${collapsed && isDesktop ? "collapsed" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
