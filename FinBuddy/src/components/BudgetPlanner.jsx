import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getAuth } from "firebase/auth";

function BudgetPlanner() {
  const [totalBudget, setTotalBudget] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");

  const COLORS = ["#4A85FF", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#60A5FA"];

  // ------------ GET FIREBASE TOKEN ------------
  const getToken = async () => {
    const user = getAuth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // ------------ FETCH SUMMARY (With Token) ------------
  const fetchSummary = async () => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch("http://127.0.0.1:5000/budget/get_budget_summary", {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    setSummary(data);
  };

  // ------------ SAVE TOTAL BUDGET ------------
  const handleTotalSave = async () => {
    const token = await getToken();
    if (!token) return;

    await fetch("http://127.0.0.1:5000/budget/set_total_budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ total_budget: parseFloat(totalBudget) }),
    });

    setMessage("✅ Total budget saved!");
    fetchSummary();
  };

  // ------------ SAVE CATEGORY BUDGET ------------
  const handleCategorySave = async () => {
    const token = await getToken();
    if (!token) return;

    await fetch("http://127.0.0.1:5000/budget/add_category_budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        category,
        amount: parseFloat(amount),
      }),
    });

    setMessage(`✅ Category "{category}" saved!`);
    setCategory("");
    setAmount("");
    fetchSummary();
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-[#1A2D5F] mb-6">🧾 Budget Planner</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {/* Total Budget */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1A2D5F] mb-2">Set Total Budget</h2>
        <div className="flex space-x-3">
          <input
            type="number"
            placeholder="Enter total budget"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleTotalSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1A2D5F] mb-2">Add Category Budgets</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Category name"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleCategorySave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h2 className="text-xl font-semibold text-[#1A2D5F] mb-4">Budget Summary</h2>

        {!summary ? (
          <p className="text-gray-500">Loading summary...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT SIDE SUMMARY */}
            <div>
              <p className="text-gray-700 mb-1">
                <strong>Total Budget:</strong> {summary.total_budget}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Total Spent:</strong> {summary.total_spent}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Remaining:</strong> {summary.remaining}
              </p>

              {/* CATEGORY LIST */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-[#1A2D5F]">Category Breakdown</h3>

                <ul className="text-gray-700 space-y-1">
                  {Object.entries(summary.category_budgets || {}).map(([cat, amt]) => (
                    <li key={cat}>
                      {cat}: {summary.category_expenses?.[cat] || 0} / {amt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WARNINGS */}
              {summary.warnings?.length > 0 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-300 p-3 rounded-lg text-yellow-800">
                  <strong>Warnings:</strong>
                  <ul className="list-disc pl-5">
                    {summary.warnings.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* PIE CHART */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary.category_expenses || {}).map(([cat, total]) => ({
                      name: cat,
                      value: total,
                    }))}
                    dataKey="value"
                    outerRadius={120}
                    label
                  >
                    {Object.entries(summary.category_expenses || {}).map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetPlanner;
