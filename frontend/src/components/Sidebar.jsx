import { NavLink, useLocation, useNavigate, Outlet } from "react-router";
import { Menu, LogOut, Briefcase, KeyRound, X, UserRoundPlus, Handshake, User } from "lucide-react";
import { useState, useEffect } from "react";
import "../SidebarLayout.css";
import { usePendingConsultants } from "../context/PendingConsultantsContext";

export default function SidebarLayout() {
  // Hooks must always be called
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userName = user?.name || "User";
  const userRole = sessionStorage.getItem("role"); // "admin" or "consultant"


  const navItems = [];

  if (userRole === "admin") {
    navItems.push(
      { to: "/user-business", label: "User Business", icon: <Briefcase /> },
      { to: "/new-consultant", label: "Consultants", icon: <UserRoundPlus /> },
      { to: "/my-profile", label: "My Profile", icon: <User /> },
      { to: "/change-password", label: "Change Password", icon: <KeyRound /> }
    );
  } else if (userRole === "consultant") {
    navItems.push(
      { to: "/business-register", label: "Business Register", icon: <Briefcase /> },
      { to: "/my-business", label: "My Business", icon: <Handshake /> },
      { to: "/my-profile", label: "My Profile", icon: <User /> },
      { to: "/change-password", label: "Change Password", icon: <KeyRound /> }
    );
  }
  const { pendingConsultants } = usePendingConsultants();


  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    ["token", "user", "role"].forEach((k) => sessionStorage.removeItem(k));
    navigate("/");
  };

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


 
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Conditionally render sidebar only for authenticated users and not on "/", "/register"
  const showSidebar =
    isAuthenticated && !["/", "/register"].includes(location.pathname);

  return (
    
    <div className="sidebar-layout">
      {showSidebar && (
        <>
          {/* Hamburger for mobile/tablet */}
          {(isMobile || isTablet) && !mobileOpen && (
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </button>
          )}

          {/* Sidebar */}
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

            {/* User Info */}
            <div className={`user-info ${collapsed && isDesktop ? "center" : ""}`}>
              {!collapsed || isMobile || isTablet ? (
                <p>Welcome, {userName}</p>
              ) : (
                <img src="/seaneb-icon.png" alt="User" title={userName} />
              )}
            </div>

            {/* Navigation */}
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
                  {/* Icon */}
                  <div className="flex items-center space-x-3">
                    {icon}
                    {(!collapsed || isMobile || isTablet) && <span className="font-medium">{label}</span>}
                  </div>

                  {/* Red badge for pending consultants */}
                  {to === "/new-consultant" && pendingConsultants > 0 && !collapsed && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingConsultants}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && isDesktop && <span className="tooltip">{label}</span>}
                </NavLink>
              ))}


              {/* Logout */}
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

          {/* Overlay for mobile/tablet */}
          {mobileOpen && (isMobile || isTablet) && (
            <div
              onClick={() => setMobileOpen(false)}
              className="sidebar-overlay"
            ></div>
          )}
        </>
      )}

      {/* Main Content */}
      <main className={`main-content ${collapsed && isDesktop ? "collapsed" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
