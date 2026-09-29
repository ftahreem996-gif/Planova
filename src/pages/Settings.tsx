import { useEffect, useState } from "react";

function Settings() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem("planovaSettings");

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);

            setName(settings.name || "");
            setEmail(settings.email || "");
            setNotifications(settings.notifications ?? true);
            setDarkMode(settings.darkMode ?? false);

            document.body.classList.toggle(
                "dark-mode",
                settings.darkMode ?? false
            );
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;

        setDarkMode(newDarkMode);

        document.body.classList.toggle(
            "dark-mode",
            newDarkMode
        );

        const settings = {
            name,
            email,
            notifications,
            darkMode: newDarkMode,
        };

        localStorage.setItem(
            "planovaSettings",
            JSON.stringify(settings)
        );
    };

    const saveSettings = () => {
        const settings = {
            name,
            email,
            notifications,
            darkMode,
        };

        localStorage.setItem(
            "planovaSettings",
            JSON.stringify(settings)
        );

        document.body.classList.toggle(
            "dark-mode",
            darkMode
        );

        alert("Settings saved successfully!");
    };

    return (
        <div className="settings-page">

            <div className="settings-title">
                <h2>Settings</h2>
                <p>Manage your Planova preferences.</p>
            </div>

            <div className="settings-card">
                <h3>Profile</h3>

                <p className="settings-description">
                    Update your personal information.
                </p>

                <div className="settings-field">
                    <label>Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="settings-card">
                <h3>Notifications</h3>

                <div className="setting-row">
                    <div>
                        <strong>Email Notifications</strong>

                        <p>
                            Receive notifications about your tasks.
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={() =>
                                setNotifications(!notifications)
                            }
                        />

                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <div className="settings-card">
                <h3>Appearance</h3>

                <div className="setting-row">
                    <div>
                        <strong>Dark Mode</strong>

                        <p>
                            Change the appearance of Planova.
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />

                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <button
                className="settings-save"
                onClick={saveSettings}
            >
                Save Settings
            </button>

        </div>
    );
}

export default Settings;