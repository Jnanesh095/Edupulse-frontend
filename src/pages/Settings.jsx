
import { UserRound, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="pagehead">
        <div>
          <span className="purple">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Account and workspace information.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-icon">
            <UserRound size={30} />
          </div>

          <div>
            <h3>Profile</h3>
            <p>
              Signed in as {user?.username || "User"} with{" "}
              {user?.role || "USER"} access.
            </p>
          </div>
        </div>

        <div className="settings-card settings-logout">
          <button
            type="button"
            className="secondary"
            onClick={logout}
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
