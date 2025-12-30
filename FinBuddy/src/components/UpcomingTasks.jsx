import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Todo from "./Todo";

export default function UpcomingTasks({ onOpen }) {
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [tasks, setTasks] = useState([]);
  const [todoOpen, setTodoOpen] = useState(false);

  const fetchTasks = () => {
    if (!user?.uid) return;

    fetch(`${API_BASE}/api/todo/tasks/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        const today = new Date();

        const upcoming = data.filter(t => {
          const d = new Date(t.date || t.deadline);
          const diff = (d - today) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7 && !t.completed;
        });

        setTasks(upcoming.slice(0, 4));
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.uid]);

  // ✅ SAME add-task logic as CalendarItem
  const addTaskToServer = async (taskData) => {
    const payload = { ...taskData, user_id: user.uid };
    await fetch(`${API_BASE}/api/todo/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    fetchTasks();
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-md p-5 h-44 flex flex-col hover:shadow-lg transition cursor-pointer"
        onClick={onOpen}
      >
        {/* HEADER (same visual hierarchy as Calendar) */}
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-[#4A85FF]" />
          <h3 className="text-lg font-semibold text-[#1A2D5F]">
            Upcoming Tasks
          </h3>
        </div>

        {/* TASK LIST */}
        <div className="flex-1 overflow-y-auto mb-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-[#6E7A8A]">
              No tasks for this week ✨
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(t => (
                <li
                  key={t.id}
                  className="text-sm text-[#1A2D5F] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4A85FF]" />
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ ADD TASK (SAME STYLE AS CALENDAR) */}
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTodoOpen(true);
            }}
            className="bg-[#4A85FF] text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 "
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* ADD TASK MODAL (same as CalendarItem) */}
      {todoOpen && (
        <Todo
          defaultDate={new Date().toLocaleDateString("en-CA")}
          onClose={() => setTodoOpen(false)}
          onSave={async (task) => {
            await addTaskToServer(task);
            setTodoOpen(false);
          }}
        />
      )}
    </>
  );
}