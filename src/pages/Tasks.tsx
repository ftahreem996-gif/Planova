import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { API_URL } from "../config";

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: string;
  project_id: number;
}

interface Project {
  id: number;
  name: string;
}

interface TasksProps {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  projects: Project[];
}

function Tasks({
  tasks,
  setTasks,
  projects,
}: TasksProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDueDate, setEditDueDate] = useState("");

  // ==================== GET TASKS ====================

  useEffect(() => {
    if (projects.length === 0) {
      return;
    }

    const fetchTasks = async () => {
      try {
        const allTasks: Task[] = [];

        for (const project of projects) {
          const response = await fetch(
            `${API_URL}/api/tasks/${project.id}`
          );

          const data = await response.json();

          if (!response.ok) {
            alert(data.message);
            return;
          }

          const projectTasks = data.tasks.map(
            (task: any) => ({
              id: task.id,
              title: task.title,
              priority: task.priority || "Medium",
              status:
                task.status === "completed" ||
                task.status === "Completed"
                  ? "Completed"
                  : "Pending",
              dueDate: task.due_date
                ? task.due_date.split("T")[0]
                : "",
              project_id: task.project_id,
            })
          );

          allTasks.push(...projectTasks);
        }

        setTasks(allTasks);
      } catch (error) {
        alert("Unable to load tasks.");
      }
    };

    fetchTasks();
  }, [projects, setTasks]);

  // ==================== ADD TASK ====================

  const addTask = async () => {
    if (!title.trim()) {
      return;
    }

    if (!selectedProject) {
      alert("Please select a project.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: Number(selectedProject),
            title: title,
            description: "",
            status: "Pending",
            priority: priority,
            due_date: dueDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const newTask: Task = {
        id: data.task.id,
        title: data.task.title,
        priority: data.task.priority,
        status: data.task.status,
        dueDate: data.task.due_date || "",
        project_id: data.task.project_id,
      };

      setTasks([...tasks, newTask]);

      setTitle("");
      setPriority("Medium");
      setDueDate("");
      setSelectedProject("");

      alert("Task created successfully!");
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  // ==================== DELETE TASK ====================

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks(
        tasks.filter((task) => task.id !== id)
      );

      alert("Task deleted successfully!");
    } catch (error) {
      alert("Unable to delete task.");
    }
  };

  // ==================== COMPLETE TASK ====================

  const completeTask = async (id: number) => {
    const task = tasks.find(
      (task) => task.id === id
    );

    if (!task) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            status: "Completed",
            priority: task.priority,
            due_date: task.dueDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                status: "Completed",
              }
            : task
        )
      );
    } catch (error) {
      alert("Unable to complete task.");
    }
  };

  // ==================== START EDIT ====================

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate);
  };

  // ==================== SAVE EDIT ====================

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) {
      return;
    }

    const task = tasks.find(
      (task) => task.id === editingId
    );

    if (!task) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            status: task.status,
            priority: editPriority,
            due_date: editDueDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === editingId
            ? {
                ...task,
                title: editTitle,
                priority: editPriority,
                dueDate: editDueDate,
              }
            : task
        )
      );

      setEditingId(null);
      setEditTitle("");
      setEditPriority("Medium");
      setEditDueDate("");

      alert("Task updated successfully!");
    } catch (error) {
      alert("Unable to update task.");
    }
  };

  // ==================== COUNTS ====================

  const totalTasks = tasks.length;

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  // ==================== FILTER ====================

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      task.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h2>Tasks</h2>
      <p>Create and manage your tasks.</p>

      <div className="task-search">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className="task-filters">
        <button
          className={
            filter === "All"
              ? "filter-active"
              : ""
          }
          onClick={() => setFilter("All")}
        >
          All {totalTasks}
        </button>

        <button
          className={
            filter === "Pending"
              ? "filter-active"
              : ""
          }
          onClick={() => setFilter("Pending")}
        >
          Pending {pendingCount}
        </button>

        <button
          className={
            filter === "Completed"
              ? "filter-active"
              : ""
          }
          onClick={() =>
            setFilter("Completed")
          }
        >
          Completed {completedCount}
        </button>
      </div>

      {/* ADD TASK */}

      <div className="card task-form">
        <h3>Add New Task</h3>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <select
          value={selectedProject}
          onChange={(e) =>
            setSelectedProject(e.target.value)
          }
        >
          <option value="">
            Select Project
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
        >
          <option value="Low">
            Low Priority
          </option>

          <option value="Medium">
            Medium Priority
          </option>

          <option value="High">
            High Priority
          </option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <button onClick={addTask}>
          Add Task
        </button>
      </div>

      {/* TASK LIST */}

      {filteredTasks.length === 0 ? (
        <div className="empty-tasks">
          No {filter.toLowerCase()} tasks yet.
        </div>
      ) : (
        filteredTasks.map((task) => (
          <div
            className="card task-item"
            key={task.id}
          >
            {editingId === task.id ? (
              <div className="task-edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(e.target.value)
                  }
                  placeholder="Task title"
                />

                <select
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(
                      e.target.value
                    )
                  }
                >
                  <option value="Low">
                    Low Priority
                  </option>

                  <option value="Medium">
                    Medium Priority
                  </option>

                  <option value="High">
                    High Priority
                  </option>
                </select>

                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) =>
                    setEditDueDate(
                      e.target.value
                    )
                  }
                />

                <button onClick={saveEdit}>
                  Save Changes
                </button>

                <button
                  onClick={() =>
                    setEditingId(null)
                  }
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h3>{task.title}</h3>

                <p>
                  Priority:{" "}
                  <strong
                    className={`priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </strong>
                </p>

                <p>
                  Status:{" "}
                  <strong
                    className={
                      task.status === "Completed"
                        ? "status-completed"
                        : "status-pending"
                    }
                  >
                    {task.status}
                  </strong>
                </p>

                {task.dueDate && (
                  <div className="task-due">
                    <span>📅</span>
                    <span>
                      Due {task.dueDate}
                    </span>
                  </div>
                )}

                <div className="task-actions">
                  {task.status === "Pending" && (
                    <button
                      onClick={() =>
                        completeTask(task.id)
                      }
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() =>
                      startEdit(task)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Tasks;