import { useState } from "react";

interface Task {
    id: number;
    title: string;
    priority: string;
    status: string;
    dueDate: string;
}

interface CalendarProps {
    tasks: Task[];
}

function Calendar({ tasks }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(
        new Date(2026, 8, 1)
    );

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    const getTasksForDay = (day: number) => {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;

        return tasks.filter((task) => task.dueDate === date);
    };

    return (
        <div className="calendar-page">
            <div className="calendar-title">
                <h2>Calendar</h2>
                <p>Manage your schedule and upcoming tasks.</p>
            </div>

            <div className="calendar-card">
                <div className="calendar-header">
                    <button onClick={previousMonth}>←</button>

                    <div className="calendar-month-center">
                        <h3>
                            {monthName} {year}
                        </h3>

                        <button
                            className="today-button"
                            onClick={() => {
                                const today = new Date();

                                setCurrentDate(
                                    new Date(today.getFullYear(), today.getMonth(), 1)
                                );

                                setSelectedDay(today.getDate());
                            }}
                        >
                            Today
                        </button>
                    </div>

                    <button onClick={nextMonth}>→</button>
                </div>


                <div className="calendar-weekdays">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div className="calendar-legend">
                    <div className="legend-item">
                        <span className="legend-dot pending-dot"></span>
                        <span>Pending</span>
                    </div>

                    <div className="legend-item">
                        <span className="legend-dot completed-dot"></span>
                        <span>Completed</span>
                    </div>
                </div>

                <div className="calendar-days">
                    {Array.from({ length: firstDay }, (_, index) => (
                        <div
                            className="calendar-day empty-day"
                            key={`empty-${index}`}
                        />
                    ))}

                    {Array.from({ length: daysInMonth }, (_, index) => {
                        const day = index + 1;
                        const dayTasks = getTasksForDay(day);
                        const today = new Date();

                        const isToday =
                            year === today.getFullYear() &&
                            month === today.getMonth() &&
                            day === today.getDate();

                        return (
                            <div
                                className={`calendar-day ${selectedDay === day ? "selected-day" : ""
                                    } ${isToday ? "today-day" : ""}`}

                                key={day}
                                onClick={() => setSelectedDay(day)}
                            >
                                <div>{day}</div>
                                {dayTasks.length > 0 && (
                                    <div className="calendar-task-info">
                                        <span
                                            className={`calendar-task-dot ${dayTasks.some((task) => task.status === "Completed")
                                                ? "completed-dot"
                                                : "pending-dot"
                                                }`}
                                        ></span>

                                        {selectedDay === day && (
                                            <div className="calendar-task-title">
                                                {dayTasks.map((task) => (
                                                    <span
                                                        key={task.id}
                                                        className={
                                                            task.status === "Completed"
                                                                ? "completed-task-title"
                                                                : "pending-task-title"
                                                        }
                                                    >
                                                        {task.status === "Completed" ? "✓ " : ""}
                                                        {task.title}
                                                    </span>

                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}


                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;