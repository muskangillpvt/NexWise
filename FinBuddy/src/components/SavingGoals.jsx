import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { getAuth } from "firebase/auth";

function SavingGoals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    priority: "Medium",
  });

  // Get Firebase Token
  const getToken = async () => {
    const user = getAuth().currentUser;
    if (user) return await user.getIdToken();
    return null;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculate daily & weekly recommendation
  const calculateRecommendations = () => {
    if (!form.targetAmount || !form.deadline)
      return { daily: 0, weekly: 0 };

    const today = new Date();
    const endDate = new Date(form.deadline);
    const diffDays = Math.ceil(
      (endDate - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) return { daily: 0, weekly: 0 };

    const daily = (form.targetAmount / diffDays).toFixed(2);
    const weekly = (daily * 7).toFixed(2);
    return { daily, weekly };
  };

  const { daily, weekly } = calculateRecommendations();

  // ---------------------------
  // SAVE GOAL
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await getToken();

    const newGoal = {
      name: form.name,
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline,
      priority: form.priority,
      status: "Pending",
      recommendedDaily: daily,
      recommendedWeekly: weekly,
    };

    await fetch("http://127.0.0.1:5000/api/goals/save_goal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newGoal),
    });

    loadGoals(); // reload fresh data
    setForm({
      name: "",
      targetAmount: "",
      deadline: "",
      priority: "Medium",
    });
  };
  
  // ---------------------------
  // LOAD GOALS FOR USER
  // ---------------------------
  const loadGoals = async () => {
    const token = await getToken();
    const res = await fetch("http://127.0.0.1:5000/api/goals/get_goals", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setGoals(data.goals || []);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // ---------------------------
  // DELETE GOAL
  // ---------------------------
  const deleteGoal = async (index) => {
    const token = await getToken();
    const goal = goals[index];

    await fetch("http://127.0.0.1:5000/api/goals/delete_goal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: goal.name }),
    });

    loadGoals();
  };

  // ---------------------------
  // MARK COMPLETED
  // ---------------------------
  const markCompleted = async (index) => {
    const token = await getToken();
    const goal = goals[index];

    await fetch("http://127.0.0.1:5000/api/goals/complete_goal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: goal.name }),
    });

    loadGoals();
  };

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold text-[#1A2D5F]">Savings Goals</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ---------------------- LEFT: CREATE GOAL ---------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#1A2D5F]">Create New Goal</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Goal Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="number"
              name="targetAmount"
              placeholder="Target Amount"
              value={form.targetAmount}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            {/* Recommended Savings */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-[#1A2D5F] font-medium">
                Recommended Daily:{" "}
                <span className="font-bold">{daily}</span>
              </p>
              <p className="text-sm text-[#1A2D5F] font-medium">
                Recommended Weekly:{" "}
                <span className="font-bold">{weekly}</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4A85FF] text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              Save Goal
            </button>
          </form>
        </div>

        {/* ---------------------- RIGHT: TABLE ---------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-[#1A2D5F] mb-4">Saved Goals</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-3 px-1">Goal</th>
                <th className="px-2">Target</th>
                <th className="px-2">Deadline</th>
                <th className="px-2">Priority</th>
                <th className="px-2">Daily</th>
                <th className="px-2">Weekly</th>
                <th className="px-2">Status</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {goals.map((goal, i) => (
                <tr key={goal._id || i} className="border-b">
                  <td className="py-3">{goal.name}</td>
                  <td className="px-2">₹{goal.targetAmount}</td>
                  <td className="px-2">{goal.deadline}</td>
                  <td className="px-2">{goal.priority}</td>
                  <td className="px-2">{goal.recommendedDaily}</td>
                  <td className="px-2">{goal.recommendedWeekly}</td>
                  <td className="px-2">
                    {goal.status === "Completed" ? (
                      <span className="text-green-600 font-bold">Completed</span>
                    ) : (
                      <span className="text-yellow-600 font-bold">Pending</span>
                    )}
                  </td>

                  <td className="flex space-x-3 py-3">
                    <input
                      type="checkbox"
                      onChange={() => markCompleted(i)}
                      checked={goal.status === "Completed"}
                    />

                    <Trash2
                      className="w-5 h-5 text-red-600 cursor-pointer"
                      onClick={() => deleteGoal(i)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default SavingGoals;
