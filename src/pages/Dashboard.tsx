interface DashboardProps {
  projects: any[];
  tasks: any[];
}

function Dashboard({ projects, tasks }: DashboardProps) {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const upcomingTasks = tasks
    .filter(
      (task) => task.status === "Pending" && task.dueDate
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <div className="dashboard-page">

      <div className="dashboard-title">
        <h2>Dashboard</h2>
        <p>Here’s an overview of your work.</p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon">📁</div>

          <div>
            <h3>Total Projects</h3>
            <p>{totalProjects}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📝</div>

          <div>
            <h3>Total Tasks</h3>
            <p>{totalTasks}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⏳</div>

          <div>
            <h3>Pending Tasks</h3>
            <p>{pendingTasks}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">✅</div>

          <div>
            <h3>Completed Tasks</h3>
            <p>{completedTasks}</p>
          </div>
        </div>

      </div>

      {/* Task Progress */}
      <div className="task-progress-card">

        <div className="progress-header">

          <div>
            <h3>Task Progress</h3>
            <p>Your overall completion progress.</p>
          </div>

          <span>{completionPercentage}%</span>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${completionPercentage}%`,
            }}
          ></div>

        </div>

        <div className="progress-footer">
          <span>{completedTasks} completed</span>
          <span>{pendingTasks} pending</span>
        </div>

      </div>

      {/* Upcoming Tasks */}
      <div className="upcoming-tasks-card">

        <div className="upcoming-header">

          <div>
            <h3>Upcoming Tasks</h3>
            <p>Your next pending tasks.</p>
          </div>

        </div>

        {upcomingTasks.length === 0 ? (
          <p className="no-upcoming">
            No upcoming tasks.
          </p>
        ) : (
          upcomingTasks.map((task) => (
            <div
              className="upcoming-task"
              key={task.id}
            >

              <div className="upcoming-task-info">

                <span className="upcoming-dot"></span>

                <div>
                  <h4>{task.title}</h4>
                  <p>{task.priority} Priority</p>
                </div>

              </div>

              <span className="upcoming-date">
                {task.dueDate}
              </span>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Dashboard;