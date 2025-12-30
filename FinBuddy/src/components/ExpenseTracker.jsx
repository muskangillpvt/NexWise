import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getAuth } from "firebase/auth";

function ExpenseTracker() {
  const getToken = async () => {
    const user = getAuth().currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const getToday = () => new Date().toISOString().slice(0, 10);
  const fileInputRef = useRef(null);

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    date: getToday(),
    category: '',
    description: '',
    amount: '',
    currency: '$',
    payment: '',
    bill: null
  });
  const [filter, setFilter] = useState('');
  const [summary, setSummary] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const COLORS = ['#4A85FF', '#3EC6A8', '#FFD166', '#EF476F', '#06D6A0'];

  const categories = [
    'Shopping','Food','Groceries','Rent','Utilities','Transport','Travel','Entertainment',
    'Health','Insurance','Education','Subscriptions','Fees','Gifts','Taxes','Repairs',
    'Personal Care','Investments','Fuel','Others'
  ];

  const currencies = [
    { symbol: '$', label: 'USD' },
    { symbol: '₹', label: 'RS' },
    { symbol: '€', label: 'EUR' },
    { symbol: '£', label: 'GBP' },
    { symbol: '₹', label: 'INR' },
    { symbol: '¥', label: 'JPY' },
    { symbol: '₩', label: 'KRW' },
    { symbol: '฿', label: 'THB' },
    { symbol: '₺', label: 'TRY' },
    { symbol: 'C$', label: 'CAD' },
    { symbol: 'A$', label: 'AUD' }
  ];

  const paymentMethods = [
    'Cash', 'UPI', 'Credit/Debit', 'Mobile Wallet', 'Netbanking', 'Bank Transfer', 'Other'
  ];

  // ----------- FETCH FUNCTIONS WITH TOKEN -----------
  const fetchExpenses = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/expense/get_expenses', {
        headers: { Authorization: token }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/expense/get_summary', {
        headers: { Authorization: token }
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/expense/get_analytics', {
        headers: { Authorization: token }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  // ----------- ADD EXPENSE -----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.category || !form.amount || !form.payment) {
      alert('Please fill Date, Category, Amount and Payment Method.');
      return;
    }

    const formData = new FormData();
    formData.append('date', form.date);
    formData.append('category', form.category);
    formData.append('description', form.description || '');
    formData.append('amount', form.amount);
    formData.append('payment_mode', form.payment);
    formData.append('currency', form.currency || '$');
    if (form.bill) formData.append('bill', form.bill);

    try {
      const token = await getToken();
      const res = await axios.post(
        'http://localhost:5000/api/expense/add_expense',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: token } }
      );

      console.log('Add expense response:', res.status, res.data);
      setForm({ date: getToday(), category: '', description: '', amount: '', currency: form.currency || '$', payment: '', bill: null });
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchExpenses();
      fetchSummary();
      fetchAnalytics();
    } catch (err) {
      console.error('Add expense failed', err);
      alert('Add expense failed — check console for details.');
    }
  };

  // ----------- DELETE EXPENSE -----------
  const handleDelete = async (expense) => {
    const id = expense.id || expense._id;
    if (!id) {
      alert('Cannot delete: invalid expense ID.');
      return;
    }
    try {
      const token = await getToken();
      await axios.delete(`http://localhost:5000/api/expense/delete_expense/${id}`, {
        headers: { Authorization: token }
      });

      setExpenses((prev) => prev.filter((e) => (e.id || e._id) !== id));
      fetchSummary();
      fetchAnalytics();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed — see console/network tab.');
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8 bg-[#F7F9FC] min-h-screen">
      <h1 className="text-3xl font-bold text-[#1A2D5F] mb-6">💸 Expense Tracker</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#4A85FF]">Add Expense</h2>

        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <input
            type="date"
            placeholder="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A85FF]"
            required
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A85FF]"
            required
          >
            <option value="" disabled>Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A85FF]"
          />

          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="px-3 text-sm bg-[#F7F9FC]">{form.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="p-3 focus:outline-none"
                style={{ width: '140px' }}
                required
              />
            </div>

            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A85FF]"
              aria-label="Select currency"
            >
              {currencies.map((c) => (
                <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.label}</option>
              ))}
            </select>
          </div>

          <select
            value={form.payment}
            onChange={(e) => setForm({ ...form, payment: e.target.value })}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A85FF]"
            required
          >
            <option value="" disabled>Payment Method</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Optional bill upload (not mandatory) with friendly "Add bill" label */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="bill-upload"
              className="p-3 border rounded-lg bg-white cursor-pointer flex items-center space-x-2"
            >
              <input
                id="bill-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setForm({ ...form, bill: e.target.files[0] || null })}
                className="hidden"
              />
              <span className="text-sm">{form.bill ? form.bill.name : 'Add bill'}</span>
            </label>

            {form.bill && (
              <button
                type="button"
                onClick={() => {
                  // clear selected file from state and clear native input value
                  setForm((prev) => ({ ...prev, bill: null }));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <button type="submit" className="col-span-full bg-[#4A85FF] text-white py-2 rounded-lg hover:bg-[#3a75ef] transition">
            Save Expense
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#4A85FF]">View Expenses</h2>
          <input
            type="text"
            placeholder="Search by Category"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4A85FF]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#F7F9FC] text-[#1A2D5F]">
              <tr>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Description</th>
                <th className="p-3 border-b">Amount</th>
                <th className="p-3 border-b">Payment Mode</th>
                <th className="p-3 border-b">Delete expense</th>
              </tr>
            </thead>
            <tbody>
              {expenses
                .filter((e) =>
                  e.category.toLowerCase().includes(filter.toLowerCase()) ||
                  (e.payment_mode || e.payment || '').toLowerCase().includes(filter.toLowerCase())
                )
                .map((exp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{exp.date}</td>
                    <td className="p-3 border-b">{exp.category}</td>
                    <td className="p-3 border-b">{exp.description}</td>
                    <td className="p-3 border-b text-[#4A85FF] font-semibold">
                      {(exp.currency || '$')}{exp.amount}
                    </td>
                    <td className="p-3 border-b">{exp.payment_mode || exp.payment}</td>
                    <td className="p-3 border-b flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(exp)}
                        className="px-2 py-1 rounded-lg hover:bg-gray-100 transition text-lg"
                        aria-label={`Delete expense ${exp.description || ''}`}
                      >
                        🗑️
                      </button>

                      {exp.bill_filename && (
                        <a
                          href={`http://localhost:5000/api/expense/bills/${exp.bill_filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-blue-600 hover:text-blue-800"
                        >
                          📄 View Bill
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-[#4A85FF] mb-4">Expense Summary</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.category_totals || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(summary.category_totals || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Total Spent', value: summary.total_spent || 0 },
                  { name: 'Budget', value: summary.budget || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4A85FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-[#4A85FF] mb-4">Analytics & Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white shadow-md">
            <h3 className="text-lg font-semibold mb-3">💰 Top Spending Categories</h3>
            <ul className="space-y-2">
              {analytics.top_categories?.length > 0 ? (
                analytics.top_categories.map((c, i) => (
                  <li key={i} className="flex justify-between border-b border-blue-400 pb-1">
                    <span>{c.category}</span>
                    <span className="font-semibold">{(c.currency || '$')}{c.total}</span>
                  </li>
                ))
              ) : (
                <p>No data yet.</p>
              )}
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-md">
            <h3 className="text-lg font-semibold mb-3">🌱 Smart Saving Tips</h3>
            <ul className="list-disc ml-5 space-y-2">
              {analytics.tips?.length > 0 ? (
                analytics.tips.map((tip, i) => <li key={i}>{tip}</li>)
              ) : (
                <>
                  <li>Track your food & entertainment expenses weekly.</li>
                  <li>Limit impulsive purchases and set monthly targets.</li>
                  <li>Review subscriptions — cancel unused ones.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;