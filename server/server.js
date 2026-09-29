const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { Resend } = require("resend");
require("dotenv").config();
const resend = new Resend(process.env.RESEND_API_KEY);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MySQL2009",
    database: "planova",
    port: 3307
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/test", (req, res) => {
    res.json({
        message: "Planova backend connected!"
    });
});

app.post("/api/signup", (req, res) => {
    console.log("SIGNUP REQUEST RECEIVED");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required."
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.error("Signup error:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    message: "This email is already registered."
                });
            }

            return res.status(500).json({
                message: "Something went wrong."
            });
        }

        res.json({
            message: "Account created successfully!",
            user: {
                id: result.insertId,
                name,
                email
            }
        });
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }

    const sql = `
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Login error:", err);

            return res.status(500).json({
                message: "Something went wrong."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});


// ==================== FORGOT PASSWORD ====================

app.put("/api/reset-password", (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({
            message: "Email and new password are required."
        });
    }

    const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
    `;

    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error(
                "Password reset check error:",
                err
            );

            return res.status(500).json({
                message: "Something went wrong."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "No account found with this email."
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
                        message: "Unable to reset password."
                    });
                }

                res.json({
                    message:
                        "Password reset successfully!"
                });
            }
        );
    });
});


app.post("/api/projects", (req, res) => {
    const { user_id, name, description } = req.body;

    if (!user_id || !name) {
        return res.status(400).json({
            message: "User ID and project name are required."
        });
    }

    const sql = `
        INSERT INTO projects (user_id, name, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, name, description || ""],
        (err, result) => {
            if (err) {
                console.error(
                    "Project creation error:",
                    err
                );

                return res.status(500).json({
                    message: "Unable to create project."
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

app.get("/api/projects/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT id, user_id, name, description, status
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error(
                "Project fetch error:",
                err
            );

            return res.status(500).json({
                message: "Unable to fetch projects."
            });
        }

        res.json({
            projects: results
        });
    });
});

app.delete("/api/projects/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM projects
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(
                "Project delete error:",
                err
            );

            return res.status(500).json({
                message: "Unable to delete project."
            });
        }

        res.json({
            message:
                "Project deleted successfully!"
        });
    });
});

app.put("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Project name is required."
        });
    }

    const sql = `
        UPDATE projects
        SET name = ?, description = ?, status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, description || "", status, id],
        (err, result) => {
            if (err) {
                console.error(
                    "Project update error:",
                    err
                );

                return res.status(500).json({
                    message: "Unable to update project."
                });
            }

            res.json({
                message:
                    "Project updated successfully!"
            });
        }
    );
});
// ==================== TASK REMINDERS ====================

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
        WHERE tasks.due_date = CURDATE() + INTERVAL 1 DAY
        AND tasks.status != 'Completed'
        AND tasks.reminder_sent = FALSE
    `;

    db.query(sql, async (err, tasks) => {
        if (err) {
            console.error("Reminder check error:", err);
            return;
        }

        for (const task of tasks) {
            try {
                await resend.emails.send({
                    from: "Planova <onboarding@resend.dev>",
                   to: task.email,
                    subject: `Planova Reminder: ${task.title}`,
                    html: `
                        <h2>Planova Task Reminder</h2>
                        <p>Hello ${task.name},</p>
                        <p>Your task <strong>${task.title}</strong> is due tomorrow.</p>
                        <p>Please complete it before the due date.</p>
                        <p>— Planova</p>
                    `
                });

                db.query(
                    `UPDATE tasks
                     SET reminder_sent = TRUE
                     WHERE id = ?`,
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
    });
};
setInterval(checkTaskReminders, 60 * 60 * 1000);

checkTaskReminders();


// ==================== TASKS ====================

// ADD TASK
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
        (project_id, title, description, status, priority, due_date)
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
                    description: description || "",
                    status: status || "Pending",
                    priority: priority || "Medium",
                    due_date: due_date || ""
                }
            });
        }
    );
});


// GET TASKS
app.get("/api/tasks/:project_id", (req, res) => {
    const { project_id } = req.params;

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

    db.query(sql, [project_id], (err, results) => {
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
    });
});


// EDIT TASK
app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

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
        (err, result) => {
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


// DELETE TASK
app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM tasks
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
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
    });
});


app.get("/", (req, res) => {
    res.send("Planova Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});