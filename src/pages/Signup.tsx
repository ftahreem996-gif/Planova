import { useState } from "react";
import { API_URL } from "../config";

interface SignupProps {
    onSignup: (userId: number, email: string) => void;
    onShowLogin: () => void;
}

function Signup({ onSignup, onShowLogin }: SignupProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);
            onSignup(data.user.id, data.user.email);

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
                        Organize your work.
                        <br />
                        <span>Own your progress.</span>
                    </h2>

                    <p className="auth-brand-description">
                        Create your Planova account and bring your
                        projects, tasks, and goals together in one
                        powerful workspace.
                    </p>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <span className="auth-feature-icon">✓</span>
                            <span>Keep every project organized</span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-icon">✓</span>
                            <span>Never lose track of your tasks</span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-icon">✓</span>
                            <span>Build a more productive workflow</span>
                        </div>
                    </div>
                </div>

                <div className="auth-decoration"></div>
            </div>

            <div className="auth-form-area">
                <div className="auth-card">
                    <div className="auth-card-top">
                        <h1>Create your account</h1>

                        <p className="auth-subtitle">
                            Start managing your work with Planova.
                        </p>
                    </div>

                    <div className="auth-field">
                        <label>Full Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />
                    </div>

                    <button
                        className="auth-button"
                        onClick={handleSignup}
                    >
                        Create Account
                    </button>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <button onClick={onShowLogin}>
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;