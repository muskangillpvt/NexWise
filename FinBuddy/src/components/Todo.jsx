// src/components/Todo.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

export default function Todo({ onClose, onSave, defaultDate }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [urgent, setUrgent] = useState(false);
  const [category, setCategory] = useState("General");

  const handleSave = () => {
    if (!title.trim() || !date) {
      alert("Please add a title and a date for the task.");
      return;
    }
    const task = {
      title: title.trim(),
      description: desc.trim(),
      date,
      deadline: deadline || null,
      priority,
      urgent,
      category,
      completed: false,
    };
    onSave(task);
    // onSave should close the modal (Dashboard handler typically does onClose)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h3 className="text-xl font-semibold text-[#1A2D5F] mb-3">Add Task</h3>

        <div className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Description (optional)"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Task Date</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Deadline (optional)</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              className="w-full border rounded-lg px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>General</option>
              <option>Work</option>
              <option>Study</option>
              <option>Personal</option>
              <option>Finance</option>
            </select>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Mark as urgent</span>
          </label>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#4A85FF] text-white rounded-lg py-2 font-medium hover:bg-blue-600"
          >
            Save task
          </button>
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
