import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pin, Edit2, Trash2 } from "lucide-react";
import Todo from "./Todo";
import EditTodo from "./EditTodo";

function CalendarItem({ user }) {
  const API_BASE = import.meta.env.VITE_API_BASE;

  // Today
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayISO);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [todoOpen, setTodoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user?.uid) return;
    const res = await fetch(`${API_BASE}/api/todo/tasks/${user.uid}`);
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.uid]);

  // Add task
  const addTaskToServer = async (taskData) => {
    const payload = { ...taskData, user_id: user.uid };
    await fetch(`${API_BASE}/api/todo/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    fetchTasks();
  };

  // Helpers
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let calendar = [];
    let day = 1;

    for (let w = 0; w < 6; w++) {
      let row = [];
      for (let d = 0; d < 7; d++) {
        if ((w === 0 && d < firstDay) || day > daysInMonth) {
          row.push(null);
        } else {
          row.push(day++);
        }
      }
      calendar.push(row);
    }
    return calendar;
  };

  const calendar = generateCalendar();

  const handleSelectDate = (day) => {
    const iso = new Date(currentYear, currentMonth, day)
      .toLocaleDateString("en-CA");
    setSelectedDate(iso);
  };

  const dayTasks = tasks.filter(t => t.date === selectedDate);

  // Dates that have tasks
  const taskDatesSet = new Set(tasks.map(t => t.date));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#1A2D5F]">Calendar</h3>
        <button
          onClick={() => setTodoOpen(true)}
          className="bg-[#4A85FF] text-white px-3 py-2 rounded-lg"
        >
          + Add Task
        </button>
      </div>

      {/* ADD TASK */}
      {todoOpen && (
        <Todo
          defaultDate={selectedDate}
          onClose={() => setTodoOpen(false)}
          onSave={async (task) => {
            await addTaskToServer(task);
            setTodoOpen(false);
          }}
        />
      )}

      {/* MONTH CONTROLS */}
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)}>
          <ChevronLeft />
        </button>

        <div className="font-medium">
          {monthNames[currentMonth]} {currentYear}
        </div>

        <button onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)}>
          <ChevronRight />
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
        {["S","M","T","W","T","F","S"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendar.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={wi + di} className="h-12" />;

            const iso = new Date(currentYear, currentMonth, day)
              .toLocaleDateString("en-CA");

            const isToday = iso === todayISO;
            const isSelected = iso === selectedDate;

            const hasUrgent = tasks.some(
              t => t.date === iso && t.urgent
            );

            return (
              <button
                key={wi + "-" + di}
                onClick={() => handleSelectDate(day)}
                className={`relative h-12 flex flex-col items-center justify-center rounded-full
                  ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-200"
                  }
                `}
              >
                <span className="leading-none">{day}</span>

                {/* LINE INDICATOR */}
                {taskDatesSet.has(iso) && (
                  <span
                    className={`mt-1 w-4 h-1 rounded-full
                      ${
                        hasUrgent
                          ? "bg-red-500"
                          : isSelected
                          ? "bg-white"
                          : "bg-blue-500"
                      }
                    `}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* TASK LIST */}
      <div className="mt-5">
        <h4 className="font-semibold mb-2">
          Tasks for {selectedDate}
        </h4>

        {dayTasks.length === 0 && (
          <p className="text-sm text-gray-500">No tasks for this day ✨</p>
        )}

        {dayTasks.map(t => (
          <div
            key={t.id}
            className="border rounded-lg p-3 mb-2 flex justify-between items-center"
          >
            <div>
              <div className={`font-medium ${t.completed ? "line-through text-gray-400" : ""}`}>
                {t.title}
              </div>
              <div className="text-xs text-gray-500">
                {t.category} • {t.priority}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {t.urgent && <Pin className="text-red-500 w-4 h-4" />}
              <button onClick={() => { setEditingTask(t); setEditOpen(true); }}>
                <Edit2 className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={async () => {
                  await fetch(`${API_BASE}/api/todo/tasks/${t.id}`, { method: "DELETE" });
                  fetchTasks();
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editOpen && editingTask && (
        <EditTodo
          task={editingTask}
          onClose={() => setEditOpen(false)}
          onUpdate={async (updated) => {
            await fetch(`${API_BASE}/api/todo/tasks/${editingTask.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updated),
            });
            fetchTasks();
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default CalendarItem;
