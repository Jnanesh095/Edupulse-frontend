import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef(null);

  const { login } = useAuth();
  const nav = useNavigate();

  // Generate random CAPTCHA string (avoid ambiguous characters like 0, O, 1, I)
  const generateCaptchaString = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Draw the CAPTCHA onto the canvas
  const drawCaptcha = useCallback((code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#f3f5fb");
    bgGradient.addColorStop(1, "#e8ecf8");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = ["#a5b4fc", "#93c5fd", "#c4b5fd", "#818cf8"][i % 4];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Dot noise
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = ["#6366f133", "#3b82f633", "#8b5cf633"][i % 3];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Character drawing with slight angles, colors and monospace font
    const colors = ["#312e81", "#1e3a8a", "#4338ca", "#3730a3", "#1e40af", "#4f46e5"];
    const charWidth = (width - 24) / code.length;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = 14 + i * charWidth + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 4 - 2);
      const angle = Math.random() * 0.36 - 0.18; // slight angle

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 22px "Consolas", "Courier New", monospace';
      ctx.fillStyle = colors[i % colors.length];
      ctx.textBaseline = "middle";
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, []);

  // Refresh CAPTCHA
  const refreshCaptcha = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
    const newCode = generateCaptchaString();
    setCaptchaCode(newCode);
    drawCaptcha(newCode);
  }, [drawCaptcha]);

  // Generate initial CAPTCHA on mount
  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    // Verify CAPTCHA
    if (
      !captchaInput.trim() ||
      captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()
    ) {
      setShowPopup(true);
      setErr("Incorrect CAPTCHA! Please enter the new code and try again.");
      setCaptchaInput("");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      await login(u, p);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed. Check credentials and backend.");
      // Regenerate CAPTCHA on failed login
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      {/* Wrong CAPTCHA Popup Notification */}
      {showPopup && (
        <div className="captcha-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="captcha-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="captcha-popup-icon">
              <AlertCircle size={32} />
            </div>
            <h3>Incorrect CAPTCHA</h3>
            <p>
              The verification code you entered was incorrect. A fresh CAPTCHA code has been generated. Please try again.
            </p>
            <button
              type="button"
              className="captcha-popup-btn"
              onClick={() => {
                setShowPopup(false);
                document.getElementById("captcha-input")?.focus();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <section className="hero">
        <div className="hero-in">
          <div className="login-brand">
            <div className="mark"><GraduationCap /></div>
            <b>EduPulse</b>
          </div>
          <div className="hero-copy">
            <span>ACADEMIC MANAGEMENT PLATFORM</span>
            <h1>Smarter management.<br /><em>Better outcomes.</em></h1>
            <p>One connected platform for student profiles, attendance, results and academic performance.</p>
            <div className="trust"><ShieldCheck /> JWT authentication & role-based access</div>
          </div>
          <small>EduPulse Academy • 2026</small>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <div className="mobile-brand"><GraduationCap /> EduPulse</div>
          <span className="purple">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Use your faculty or administrator account to continue.</p>

          {err && <div className="error">{err}</div>}

          <form onSubmit={submit}>
            <label>
              Username
              <div className="field">
                <User />
                <input
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
            </label>

            <label>
              Password
              <div className="field">
                <Lock />
                <input
                  type={show ? "text" : "password"}
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShow(!show)}
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            {/* CAPTCHA Verification */}
            <div className="captcha-container">
              <label>
                Security Verification
                <div className="captcha-visual-wrap">
                  <canvas
                    ref={canvasRef}
                    width={150}
                    height={42}
                    className="captcha-canvas"
                    onClick={refreshCaptcha}
                    title="Click to refresh CAPTCHA"
                  />
                  <button
                    type="button"
                    className="captcha-refresh-btn"
                    onClick={refreshCaptcha}
                    title="Change CAPTCHA"
                  >
                    <RefreshCw className={isSpinning ? "spin" : ""} size={17} />
                  </button>
                </div>
                <div className="field">
                  <ShieldCheck />
                  <input
                    id="captcha-input"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      if (err.includes("CAPTCHA")) setErr("");
                    }}
                    placeholder="Enter the 6-character code above"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </label>
            </div>

            <label className="remember">
              <input type="checkbox" /> Remember me
            </label>

            <button className="primary" disabled={loading}>
              {loading ? "Signing in..." : <>Sign in <ArrowRight /></>}
            </button>
          </form>

          <div className="security">
            <ShieldCheck /> Protected by JWT authentication & CAPTCHA verification
          </div>
        </div>
      </section>
    </div>
  );
}
