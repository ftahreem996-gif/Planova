import { useEffect, useState } from "react";
import { API_URL } from "../config";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
}

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  userId: number | null;
}

function Projects({
  projects,
  setProjects,
  userId,
}: ProjectsProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editStatus, setEditStatus] =
    useState("Planning");
  const [editProgress, setEditProgress] =
    useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/projects/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        setProjects(
          data.projects.map((project: Project) => ({
            ...project,
            progress: project.progress || 0,
          }))
        );
      } catch (error) {
        alert("Unable to load projects.");
      }
    };

    fetchProjects();
  }, [userId, setProjects]);

  const addProject = async () => {
    if (!projectName.trim()) {
      return;
    }

    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
       `${API_URL}/api/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            name: projectName,
            description: description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const newProject: Project = {
        id: data.project.id,
        name: data.project.name,
        description: data.project.description || "",
        status: status,
        progress: 0,
      };

      setProjects([...projects, newProject]);

      setProjectName("");
      setDescription("");
      setStatus("Planning");

      alert("Project created successfully!");
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  const deleteProject = async (id: number) => {
    try {
      const response = await fetch(
       `${API_URL}/api/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setProjects(
        projects.filter(
          (project) => project.id !== id
        )
      );
    } catch (error) {
      alert("Unable to delete project.");
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
    setEditStatus(project.status);
    setEditProgress(project.progress || 0);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setProjects(
        projects.map((project) =>
          project.id === editingId
            ? {
                ...project,
                name: editName,
                description: editDescription,
                status: editStatus,
                progress: editProgress,
              }
            : project
        )
      );

      setEditingId(null);
      setEditName("");
      setEditDescription("");
      setEditStatus("Planning");
      setEditProgress(0);

      alert("Project updated successfully!");
    } catch (error) {
      alert("Unable to update project.");
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="projects-page">

      <div className="projects-title">
        <h2>Projects</h2>
        <p>
          Create and manage your projects.
        </p>
      </div>

      {/* Search */}

      <div className="project-search">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Add Project */}

      <div className="card project-form">

        <h3>Add New Project</h3>

        <input
          type="text"
          placeholder="Project name"
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Project description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="Planning">
            Planning
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

        <button onClick={addProject}>
          Add Project
        </button>

      </div>

      {/* Project Cards */}

      <div className="projects-list">

        {filteredProjects.length === 0 ? (
          <div className="empty-projects">
            No projects found.
          </div>
        ) : (
          filteredProjects.map((project) => (

            <div
              className="project-card"
              key={project.id}
            >

              {editingId === project.id ? (

                <div className="project-edit-form">

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    placeholder="Project name"
                  />

                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) =>
                      setEditDescription(
                        e.target.value
                      )
                    }
                    placeholder="Project description"
                  />

                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value)
                    }
                  >
                    <option value="Planning">
                      Planning
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>

                  <label>
                    Progress: {editProgress}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) =>
                      setEditProgress(
                        Number(e.target.value)
                      )
                    }
                  />

                  <div className="project-actions">

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

                </div>

              ) : (

                <>

                  <div className="project-card-header">

                    <div>
                      <h3>{project.name}</h3>

                      <p>
                        {project.description ||
                          "No description"}
                      </p>
                    </div>

                    <span
                      className={`project-status ${project.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {project.status}
                    </span>

                  </div>

                  <div className="project-progress">

                    <div className="project-progress-header">
                      <span>Progress</span>
                      <span>
                        {project.progress || 0}%
                      </span>
                    </div>

                    <div className="project-progress-bar">

                      <div
                        className="project-progress-fill"
                        style={{
                          width: `${project.progress || 0}%`,
                        }}
                      ></div>

                    </div>

                  </div>

                  <div className="project-actions">

                    <button
                      onClick={() =>
                        startEdit(project)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteProject(project.id)
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

    </div>
  );
}

export default Projects;