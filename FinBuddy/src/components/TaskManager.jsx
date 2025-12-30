import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, Pin, CheckCircle, TriangleAlert, History } from "lucide-react";
import Todo from "./Todo";
import { useAuth } from "./AuthProvider";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

export default function TaskManager() {
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("deadline"); // kept as-is
  const [categorySort, setCategorySort] = useState("All");
  const [todoOpen, setTodoOpen] = useState(false);

  // Fetch user tasks
  const fetchTasks = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`${API_BASE}/api/todo/tasks/${user.uid}`);
      const data = await res.json();
      setTasks(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.uid]);

  // Apply search & sort filters
  useEffect(() => {
    let list = [...tasks];

    if (search.trim() !== "") {
      list = list.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categorySort !== "All") {
      list = list.filter((t) => t.category === categorySort);
    }

    if (sortBy === "deadline") {
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    setFiltered(list);
  }, [search, sortBy, categorySort, tasks]);

  // Add Task
  const addTask = async (task) => {
    const payload = { ...task, user_id: user.uid };
    await fetch(`${API_BASE}/api/todo/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    fetchTasks();
  };

  // Delete Task
  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/api/todo/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  // Mark Complete
  const markComplete = async (task) => {
    await fetch(`${API_BASE}/api/todo/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchTasks();
  };

  // ---------- Derived Data ----------
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const today = new Date().toISOString().split("T")[0];

  const urgentTasks = tasks.filter(
    (t) => t.urgent && (t.date === today || t.deadline === today)
  );

  const upcomingTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    const todayObj = new Date();
    const diff = (d - todayObj) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const categories = ["General", "Work", "Study", "Personal", "Finance"];
  const COLORS = ["#4A85FF", "#FFD166"];

  return (
    <div className="space-y-4">
      {/* URGENT TASKS */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl border-l-6">
          <h1 className="flex font-semibold text-lg mb-1">
            <TriangleAlert className="w-6 h-6" />
            <span className="px-2">Urgent Tasks</span>
          </h1>
          {urgentTasks.map((t) => (
            <p key={t.id} className="text-sm">
              {t.title} — Due Today
            </p>
          ))}
        </div>
      )}

      {/* SUMMARY BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 shadow rounded-xl">
          <p className="text-gray-500">Total Tasks</p>
          <h2 className="text-3xl font-bold text-blue-600">{total}</h2>
        </div>
        <div className="bg-white p-5 shadow rounded-xl">
          <p className="text-gray-500">Completed</p>
          <h2 className="text-3xl font-bold text-green-500">{completed}</h2>
        </div>
        <div className="bg-white p-5 shadow rounded-xl">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-500">{pending}</h2>
        </div>
      </div>

      {/* UPCOMING TASKS */}
      <div className="bg-white p-6 shadow rounded-xl">
        <h1 className="flex text-xl font-bold mb-3">
          <History className="w-6 h-6" />
          <span className="px-2">Upcoming Tasks</span>
        </h1>
        {upcomingTasks.length === 0 && (
          <p className="text-gray-500">No tasks this week.</p>
        )}
        {upcomingTasks.map((t) => (
          <p key={t.id} className="text-sm mb-1">• {t.title}</p>
        ))}
      </div>

      <div className="bg-white p-6 shadow rounded-xl space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Search tasks..."
              className="w-full border rounded-lg pl-10 pr-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border px-3 py-2 rounded-lg"
            value={categorySort}
            onChange={(e) => setCategorySort(e.target.value)}
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* SORT BY DEADLINE BUTTON REMOVED */}

          <button
            onClick={() => setTodoOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>

        {/* Task List Items */}
        {filtered.slice(0, 2).map((task) => (
          <div
            key={task.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.category}</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => markComplete(task)}>
                <CheckCircle
                  className={
                    task.completed ? "text-green-500" : "text-gray-400"
                  }
                />
              </button>

              <button onClick={() => deleteTask(task.id)}>
                <Trash2 className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {todoOpen && (
        <Todo
          onClose={() => setTodoOpen(false)}
          defaultDate={new Date().toISOString().split("T")[0]}
          onSave={async (task) => {
            await addTask(task);
            setTodoOpen(false);
          }}
        />
      )}
    </div>
  );
}
