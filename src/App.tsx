import { useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Calendar from "./pages/calendar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [authPage, setAuthPage] = useState("login");
  const [activePage, setActivePage] = useState("Dashboard");

  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  if (!isLoggedIn) {
    return authPage === "login" ? (
      <Login
        onLogin={(userId, email) => {
          setUserId(userId);
          setIsLoggedIn(true);
        }}
        onShowSignup={() => setAuthPage("signup")}
      />
    ) : (
      <Signup
        onSignup={(userId, email) => {
          setUserId(userId);
          setIsLoggedIn(true);
        }}
        onShowLogin={() => setAuthPage("login")}
      />
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <img src="/planova-icon.png" alt="Planova" />
          <span>Planova</span>
        </div>

        <div
          className={`nav-item ${activePage === "Dashboard" ? "active" : ""
            }`}
          onClick={() => setActivePage("Dashboard")}
        >
          Dashboard
        </div>

        <div
          className={`nav-item ${activePage === "Projects" ? "active" : ""
            }`}
          onClick={() => setActivePage("Projects")}
        >
          Projects
        </div>

        <div
          className={`nav-item ${activePage === "Tasks" ? "active" : ""
            }`}
          onClick={() => setActivePage("Tasks")}
        >
          Tasks
        </div>
        <div
          className={`nav-item ${activePage === "Calendar" ? "active" : ""
            }`}
          onClick={() => setActivePage("Calendar")}
        >
          Calendar
        </div>

        <div
          className={`nav-item ${activePage === "Settings" ? "active" : ""
            }`}
          onClick={() => setActivePage("Settings")}
        >
          Settings
        </div>
      </aside>

      <main className="main">


        {activePage === "Dashboard" && (
          <Dashboard
            projects={projects}
            tasks={tasks}
          />
        )}

        {activePage === "Projects" && (
          <Projects
            projects={projects}
            setProjects={setProjects}
            userId={userId}
          />
        )}

        {activePage === "Tasks" && (
          <Tasks
            tasks={tasks}
            setTasks={setTasks}
            projects={projects}
          />
        )}
        {activePage === "Calendar" && <Calendar tasks={tasks} />}

        {activePage === "Settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;