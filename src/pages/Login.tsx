import { useState } from "react";

interface LoginProps {
  onLogin: (userId: number, email: string) => void;
  onShowSignup: () => void;
}

function Login({ onLogin, onShowSignup }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);
      onLogin(data.user.id, data.user.email);
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/reset-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      setShowForgotPassword(false);
      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <span>P</span>
            Planova
          </div>

          <h2>
            Work smarter.
            <br />
            <span>Achieve more.</span>
          </h2>

          <p className="auth-brand-description">
            Planova helps you organize projects, manage tasks,
            track progress, and stay focused — all in one place.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <span>Manage projects effortlessly</span>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <span>Track your tasks and deadlines</span>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <span>Stay organized and productive</span>
            </div>
          </div>
        </div>

        <div className="auth-decoration"></div>
      </div>

      <div className="auth-form-area">
        <div className="auth-card">
          {!showForgotPassword ? (
            <>
              <div className="auth-card-top">
                <h1>Welcome back</h1>

                <p className="auth-subtitle">
                  Sign in to continue to your Planova workspace.
                </p>
              </div>

              <div className="auth-field">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="auth-field">
                <div className="auth-password-row">
                  <label>Password</label>

                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() =>
                      setShowForgotPassword(true)
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              <button
                className="auth-button"
                onClick={handleLogin}
              >
                Sign In
              </button>

              <p className="auth-switch">
                Don't have an account?{" "}
                <button onClick={onShowSignup}>
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="auth-card-top">
                <h1>Reset Password</h1>

                <p className="auth-subtitle">
                  Enter your email and create a new password.
                </p>
              </div>

              <div className="auth-field">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) =>
                    setResetEmail(e.target.value)
                  }
                />
              </div>

              <div className="auth-field">
                <label>New Password</label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />
              </div>

              <div className="auth-field">
                <label>Confirm New Password</label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />
              </div>

              <button
                className="auth-button"
                onClick={handleForgotPassword}
              >
                Reset Password
              </button>

              <p className="auth-switch">
                Remember your password?{" "}
                <button
                  onClick={() =>
                    setShowForgotPassword(false)
                  }
                >
                  Back to Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;