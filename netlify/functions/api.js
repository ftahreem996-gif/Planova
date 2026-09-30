const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { Resend } = require("resend");
const serverless = require("serverless-http");

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== DATABASE ====================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }

    console.log("Aiven MySQL connected successfully!");

    createTables();
});

// ==================== CREATE TABLES ====================

const createTables = () => {

    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY email (email)
        )
    `;

    const projectsTable = `
        CREATE TABLE IF NOT EXISTS projects (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            CONSTRAINT projects_ibfk_1
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
    `;

    const tasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT NOT NULL AUTO_INCREMENT,
            project_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            priority VARCHAR(50) DEFAULT 'Medium',
            due_date DATE DEFAULT NULL,
            reminder_sent TINYINT(1) DEFAULT 0,
            PRIMARY KEY (id),
            KEY project_id (project_id),
            CONSTRAINT tasks_ibfk_1
            FOREIGN KEY (project_id)
            REFERENCES projects(id)
            ON DELETE CASCADE
        )
    `;

    db.query(usersTable, (err) => {

        if (err) {
            console.error("Users table error:", err);
            return;
        }

        db.query(projectsTable, (err) => {

            if (err) {
                console.error("Projects table error:", err);
                return;
            }

            db.query(tasksTable, (err) => {

                if (err) {
                    console.error("Tasks table error:", err);
                    return;
                }

                console.log("Planova database tables are ready!");

            });

        });

    });
};

// ==================== TEST ====================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Planova backend connected!"
    });

});

// ==================== SIGNUP ====================

app.post("/api/signup", (req, res) => {

    console.log("SIGNUP REQUEST RECEIVED");

    const {
        name,
        email,
        password
    } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All fields are required."
        });

    }

    const sql = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.error(
                    "Signup error:",
                    err
                );

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(400).json({
                        message:
                            "This email is already registered."
                    });

                }

                return res.status(500).json({
                    message:
                        "Something went wrong."
                });

            }

            res.json({

                message:
                    "Account created successfully!",

                user: {
                    id: result.insertId,
                    name,
                    email
                }

            });

        }
    );

});

// ==================== LOGIN ====================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message:
                "Email and password are required."
        });

    }

    const sql = `
        SELECT
            id,
            name,
            email,
            password
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    "Login error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Something went wrong."
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });

            }

            const user = results[0];

            if (user.password !== password) {

                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });

            }

            res.json({

                message:
                    "Login successful!",

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }

            });

        }
    );

});

// ==================== RESET PASSWORD ====================

app.put("/api/reset-password", (req, res) => {

    const {
        email,
        newPassword
    } = req.body;

    if (!email || !newPassword) {

        return res.status(400).json({
            message:
                "Email and new password are required."
        });

    }

    const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
    `;

    db.query(
        checkSql,
        [email],
        (err, results) => {

            if (err) {

                console.error(
                    "Password reset check error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Something went wrong."
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "No account found with this email."
                });

            }

            const updateSql = `
                UPDATE users
                SET password = ?
                WHERE email = ?
            `;

            db.query(
                updateSql,
                [newPassword, email],
                (err) => {

                    if (err) {

                        console.error(
                            "Password reset error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Unable to reset password."
                        });

                    }

                    res.json({
                        message:
                            "Password reset successfully!"
                    });

                }
            );

        }
    );

});

// ==================== CREATE PROJECT ====================

app.post("/api/projects", (req, res) => {

    const {
        user_id,
        name,
        description
    } = req.body;

    if (!user_id || !name) {

        return res.status(400).json({
            message:
                "User ID and project name are required."
        });

    }

    const sql = `
        INSERT INTO projects
        (user_id, name, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            name,
            description || ""
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Project creation error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to create project."
                });

            }

            res.json({

                message:
                    "Project created successfully!",

                project: {
                    id: result.insertId,
                    user_id,
                    name,
                    description
                }

            });

        }
    );

});

// ==================== GET PROJECTS ====================

app.get("/api/projects/:user_id", (req, res) => {

    const {
        user_id
    } = req.params;

    const sql = `
        SELECT
            id,
            user_id,
            name,
            description,
            status
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Project fetch error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to fetch projects."
                });

            }

            res.json({
                projects: results
            });

        }
    );

});

// ==================== DELETE PROJECT ====================

app.delete("/api/projects/:id", (req, res) => {

    const {
        id
    } = req.params;

    const sql = `
        DELETE FROM projects
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err) => {

            if (err) {

                console.error(
                    "Project delete error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to delete project."
                });

            }

            res.json({
                message:
                    "Project deleted successfully!"
            });

        }
    );

});

// ==================== UPDATE PROJECT ====================

app.put("/api/projects/:id", (req, res) => {

    const {
        id
    } = req.params;

    const {
        name,
        description,
        status
    } = req.body;

    if (!name) {

        return res.status(400).json({
            message:
                "Project name is required."
        });

    }

    const sql = `
        UPDATE projects
        SET
            name = ?,
            description = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            description || "",
            status,
            id
        ],
        (err) => {

            if (err) {

                console.error(
                    "Project update error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to update project."
                });

            }

            res.json({
                message:
                    "Project updated successfully!"
            });

        }
    );

});

// ==================== ADD TASK ====================

app.post("/api/tasks", (req, res) => {

    const {
        project_id,
        title,
        description,
        status,
        priority,
        due_date
    } = req.body;

    if (!project_id || !title) {

        return res.status(400).json({
            message:
                "Project ID and task title are required."
        });

    }

    const sql = `
        INSERT INTO tasks
        (
            project_id,
            title,
            description,
            status,
            priority,
            due_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            project_id,
            title,
            description || "",
            status || "Pending",
            priority || "Medium",
            due_date || null
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Task creation error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to create task."
                });

            }

            res.json({

                message:
                    "Task created successfully!",

                task: {
                    id: result.insertId,
                    project_id,
                    title,
                    description:
                        description || "",
                    status:
                        status || "Pending",
                    priority:
                        priority || "Medium",
                    due_date:
                        due_date || ""
                }

            });

        }
    );

});

// ==================== GET TASKS ====================

app.get("/api/tasks/:project_id", (req, res) => {

    const {
        project_id
    } = req.params;

    const sql = `
        SELECT
            id,
            project_id,
            title,
            description,
            status,
            priority,
            due_date,
            created_at
        FROM tasks
        WHERE project_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [project_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Task fetch error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to fetch tasks."
                });

            }

            res.json({
                tasks: results
            });

        }
    );

});

// ==================== UPDATE TASK ====================

app.put("/api/tasks/:id", (req, res) => {

    const {
        id
    } = req.params;

    const {
        title,
        status,
        priority,
        due_date
    } = req.body;

    if (!title) {

        return res.status(400).json({
            message:
                "Task title is required."
        });

    }

    const sql = `
        UPDATE tasks
        SET
            title = ?,
            status = ?,
            priority = ?,
            due_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            status,
            priority,
            due_date || null,
            id
        ],
        (err) => {

            if (err) {

                console.error(
                    "Task update error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to update task."
                });

            }

            res.json({
                message:
                    "Task updated successfully!"
            });

        }
    );

});

// ==================== DELETE TASK ====================

app.delete("/api/tasks/:id", (req, res) => {

    const {
        id
    } = req.params;

    const sql = `
        DELETE FROM tasks
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err) => {

            if (err) {

                console.error(
                    "Task delete error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Unable to delete task."
                });

            }

            res.json({
                message:
                    "Task deleted successfully!"
            });

        }
    );

});

// ==================== REMINDER CHECK ====================

const checkTaskReminders = () => {

    const sql = `
        SELECT
            tasks.id,
            tasks.title,
            tasks.due_date,
            users.email,
            users.name
        FROM tasks

        INNER JOIN projects
            ON tasks.project_id = projects.id

        INNER JOIN users
            ON projects.user_id = users.id

        WHERE tasks.due_date =
            CURDATE() + INTERVAL 1 DAY

        AND tasks.status != 'Completed'

        AND tasks.reminder_sent = FALSE
    `;

    db.query(
        sql,
        async (err, tasks) => {

            if (err) {

                console.error(
                    "Reminder check error:",
                    err
                );

                return;
            }

            for (const task of tasks) {

                try {

                    const {
                        data,
                        error
                    } = await resend.emails.send({

                        from:
                            "Planova <onboarding@resend.dev>",

                        to:
                            task.email,

                        subject:
                            `Planova Reminder: ${task.title}`,

                        html: `
                            <h2>Planova Task Reminder</h2>

                            <p>
                                Hello ${task.name},
                            </p>

                            <p>
                                Your task
                                <strong>
                                    ${task.title}
                                </strong>
                                is due tomorrow.
                            </p>

                            <p>
                                Please complete it
                                before the due date.
                            </p>

                            <p>
                                — Planova
                            </p>
                        `

                    });

                    if (error) {

                        console.error(
                            `Failed to send reminder for task ${task.id}:`,
                            error
                        );

                        continue;
                    }

                    db.query(
                        `
                        UPDATE tasks
                        SET reminder_sent = TRUE
                        WHERE id = ?
                        `,
                        [task.id]
                    );

                    console.log(
                        `Reminder sent to ${task.email} for task: ${task.title}`
                    );

                } catch (error) {

                    console.error(
                        `Failed to send reminder for task ${task.id}:`,
                        error
                    );

                }

            }

        }
    );

};

// ==================== HEALTH CHECK ====================

app.get("/", (req, res) => {

    res.json({
        message:
            "Planova API is running!"
    });

});

// ==================== NETLIFY FUNCTION ====================

module.exports.handler = serverless(app);