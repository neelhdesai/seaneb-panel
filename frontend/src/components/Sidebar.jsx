import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu, LogOut, Briefcase, KeyRound, X, UserRoundPlus, Handshake, User,
  IndianRupee, BookOpen, Building2, PlusSquare, ListChecks, LayoutDashboard,
  ChevronDown, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import "../SidebarLayout.css";
import { usePendingConsultants } from "../context/PendingConsultantsContext";

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [openMenu, setOpenMenu] = useState({
    consultant: true,
    seaneb: true,
    account: true,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";
  const userRole = localStorage.getItem("role");

  const { pendingConsultants } = usePendingConsultants();

  // ------------------------- ADMIN MENUS -------------------------
  const consultantMenu = [
    { to: "/user-business", label: "User Business", icon: <Briefcase /> },
    { to: "/new-consultant", label: "Consultants", icon: <UserRoundPlus /> },
    { to: "/how-app-works", label: "How App Works", icon: <BookOpen /> },
    { to: "/payout-structure", label: "Payout Structure", icon: <IndianRupee /> },
  ];

  const seanebMenu = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { to: "/register-user", label: "Register User", icon: <UserRoundPlus /> },
    { to: "/register-business-no-payment", label: "Register Business", icon: <Building2 /> },
    { to: "/showcase-add", label: "Add Showcase", icon: <PlusSquare /> },
    { to: "/get-showcase", label: "Showcase List", icon: <ListChecks /> },
    { to: "/users-list", label: "Users List", icon: <User /> },
  ];

  const accountMenu = [
    { to: "/my-profile", label: "My Profile", icon: <User /> },
    { to: "/change-password", label: "Change Password", icon: <KeyRound /> },
  ];

  // ------------------------- CONSULTANT MENU -------------------------
  const consultantRoleMenu = [
    { to: "/business-register", label: "Business Register", icon: <Briefcase /> },
    { to: "/my-business", label: "My Business", icon: <Handshake /> },
    { to: "/how-app-works", label: "How App Works", icon: <BookOpen /> },
    { to: "/payout-structure", label: "Payout Structure", icon: <IndianRupee /> },
    { to: "/my-profile", label: "My Profile", icon: <User /> },
    { to: "/change-password", label: "Change Password", icon: <KeyRound /> },
  ];

  // ------------------------- DATAENTRY MENU -------------------------
  const dataEntryMenu = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { to: "/register-user", label: "Register User", icon: <UserRoundPlus /> },
    { to: "/register-business-no-payment", label: "Register Business", icon: <Building2 /> },
    { to: "/showcase-add", label: "Add Showcase", icon: <PlusSquare /> },
    { to: "/get-showcase", label: "Showcase List", icon: <ListChecks /> },
    { to: "/users-list", label: "Users List", icon: <User /> },
    { to: "/my-profile", label: "My Profile", icon: <User /> },
    { to: "/change-password", label: "Change Password", icon: <KeyRound /> },
  ];

  // Logout
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
            <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
          )}

          <aside
            className={`sidebar ${collapsed ? "collapsed" : ""} ${
              mobileOpen ? "open" : ""
            }`}
          >
            {/* HEADER */}
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

            {/* USER INFO */}
            <div className={`user-info ${collapsed && isDesktop ? "center" : ""}`}>
              {!collapsed || isMobile || isTablet ? (
                <p>Welcome, {userName}</p>
              ) : (
                <img src="/seaneb-icon.png" alt="User" title={userName} />
              )}
            </div>

            {/* ------------------ NAVIGATION ------------------ */}
            <nav className="sidebar-nav">

              {/* ================= ADMIN ROLE ================= */}
              {userRole === "admin" && (
                <>
                  {/* CONSULTANT GROUP */}
                  <div className="mb-2">
                    <button
                      onClick={() =>
                        setOpenMenu((p) => ({ ...p, consultant: !p.consultant }))
                      }
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 font-semibold rounded"
                    >
                      <span>Consultant</span>
                      {openMenu.consultant ? <ChevronDown /> : <ChevronRight />}
                    </button>

                    {openMenu.consultant && (
                      <div className="mt-1">
                        {consultantMenu.map(({ to, label, icon }) => (
                          <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-4 py-2 rounded my-1
                              ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-gray-200 text-gray-700"
                              }
                              ${collapsed && isDesktop ? "justify-center" : ""}`
                            }
                            onClick={() =>
                              (isMobile || isTablet) && setMobileOpen(false)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {icon}
                              {!collapsed && <span>{label}</span>}
                            </div>

                            {to === "/new-consultant" &&
                              pendingConsultants > 0 &&
                              !collapsed && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2">
                                  {pendingConsultants}
                                </span>
                              )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEANEB GROUP */}
                  <div className="mb-2">
                    <button
                      onClick={() =>
                        setOpenMenu((p) => ({ ...p, seaneb: !p.seaneb }))
                      }
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 font-semibold rounded"
                    >
                      <span>SeaNeB App</span>
                      {openMenu.seaneb ? <ChevronDown /> : <ChevronRight />}
                    </button>

                    {openMenu.seaneb && (
                      <div className="mt-1">
                        {seanebMenu.map(({ to, label, icon }) => (
                          <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-4 py-2 rounded my-1
                              ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-gray-200 text-gray-700"
                              }
                              ${collapsed && isDesktop ? "justify-center" : ""}`
                            }
                            onClick={() =>
                              (isMobile || isTablet) && setMobileOpen(false)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {icon}
                              {!collapsed && <span>{label}</span>}
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACCOUNT SETTINGS */}
                  <div className="mb-2">
                    <button
                      onClick={() =>
                        setOpenMenu((p) => ({ ...p, account: !p.account }))
                      }
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 font-semibold rounded"
                    >
                      <span>Account Settings</span>
                      {openMenu.account ? <ChevronDown /> : <ChevronRight />}
                    </button>

                    {openMenu.account && (
                      <div className="mt-1">
                        {accountMenu.map(({ to, label, icon }) => (
                          <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-4 py-2 rounded my-1
                              ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-gray-200 text-gray-700"
                              }
                              ${collapsed && isDesktop ? "justify-center" : ""}`
                            }
                            onClick={() =>
                              (isMobile || isTablet) && setMobileOpen(false)
                            }
                          >
                            <div className="flex items-center gap-3">
                              {icon}
                              {!collapsed && <span>{label}</span>}
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ================= CONSULTANT ROLE ================= */}
              {userRole === "consultant" && (
                <>
                  {consultantRoleMenu.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded my-1
                        ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200 text-gray-700"
                        }`
                      }
                      onClick={() =>
                        (isMobile || isTablet) && setMobileOpen(false)
                      }
                    >
                      {icon}
                      <span className="ml-3">{label}</span>
                    </NavLink>
                  ))}
                </>
              )}

              {/* ================= DATAENTRY ROLE ================= */}
              {userRole === "dataentry" && (
                <>
                  {dataEntryMenu.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded my-1
                        ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200 text-gray-700"
                        }`
                      }
                      onClick={() =>
                        (isMobile || isTablet) && setMobileOpen(false)
                      }
                    >
                      {icon}
                      <span className="ml-3">{label}</span>
                    </NavLink>
                  ))}
                </>
              )}

              {/* LOGOUT */}
              <button
                onClick={() => {
                  handleLogout();
                  if (isMobile || isTablet) setMobileOpen(false);
                }}
                className={`nav-item logout ${
                  collapsed && isDesktop ? "center" : ""
                }`}
              >
                <LogOut />
                {!collapsed && <span>Logout</span>}
              </button>
            </nav>
          </aside>

          {(isMobile || isTablet) && mobileOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </>
      )}

      <main
        className={`main-content ${collapsed && isDesktop ? "collapsed" : ""}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
