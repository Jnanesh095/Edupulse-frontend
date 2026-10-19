
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Award,
  BarChart3,
  FileBarChart2,
  Settings,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markAllNotificationsRead,
  EVENT_NAME,
} from "../utils/notifications";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/students", "Students", Users],
  ["/attendance", "Attendance", CalendarCheck2],
  ["/results", "Results", Award],
  ["/analytics", "Analytics", BarChart3],
  ["/reports", "Reports", FileBarChart2],
  ["/settings", "Settings", Settings],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    getNotifications()
  );

  const { user, logout } = useAuth();
  const location = useLocation();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const title =
    links.find(([path]) => location.pathname.startsWith(path))?.[1] ||
    "Dashboard";

  useEffect(() => {
    function refreshNotifications() {
      setNotifications(getNotifications());
    }

    window.addEventListener(EVENT_NAME, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);

    return () => {
      window.removeEventListener(EVENT_NAME, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  function toggleNotifications() {
    setNotificationsOpen((previous) => !previous);
    setNotifications(getNotifications());
  }

  function markAllRead() {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  }

  return (
    <div className="shell">
      <aside className={open ? "side open" : "side"}>
        <div className="brand">
          <div className="mark">
            <GraduationCap />
          </div>
          <b>
            EduPulse
            <small>ACADEMY</small>
          </b>
          <button
            className="mobile icon"
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <label>MAIN MENU</label>

        {links.map(([path, name, Icon]) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive ? "nav active" : "nav"
            }
          >
            <Icon />
            <span>{name}</span>
          </NavLink>
        ))}

        <div className="bottom">
          <div className="online">
            ● System Online
            <br />
            <small>All services connected</small>
          </div>

          <button className="logout" type="button" onClick={logout}>
            <LogOut />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="overlay" onClick={() => setOpen(false)} />
      )}

      <main className="main">
        <header>
          <button
            className="mobile icon"
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <small>EduPulse</small>
            <h2>{title}</h2>
          </div>

          <div className="head-right">
            <div className="notification-wrapper">
              <button
                className="icon notification-button"
                type="button"
                title="Notifications"
                aria-label={`Notifications: ${unreadCount} unread`}
                onClick={toggleNotifications}
              >
                <Bell />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <div>
                      <strong>Notifications</strong>
                      <small>{unreadCount} unread</small>
                    </div>
                    <button
                      className="icon"
                      type="button"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <Bell size={28} />
                      <p>No notifications yet</p>
                      <small>
                        Updates will appear here when notifications are
                        created.
                      </small>
                    </div>
                  ) : (
                    <>
                      <div className="notification-list">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-item ${
                              item.read ? "read" : "unread"
                            }`}
                          >
                            <span
                              className={`notification-dot ${
                                item.type || "info"
                              }`}
                            />
                            <div className="notification-message">
                              <p>{item.message}</p>
                              <small>
                                {item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleString()
                                  : ""}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          className="mark-read-button"
                          type="button"
                          onClick={markAllRead}
                        >
                          <CheckCheck size={16} />
                          Mark all as read
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="avatar">
              {(user?.username || "U")[0].toUpperCase()}
            </div>

            <div className="user">
              {user?.username}
              <small>{user?.role}</small>
            </div>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
