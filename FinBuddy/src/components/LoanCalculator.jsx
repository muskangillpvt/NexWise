// LoanCalculator.jsx
import { useState } from "react";
import {
  Calculator,
  Download,
  FileSpreadsheet,
  BarChart2,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// NOTE: Make sure you have recharts installed:
// npm install recharts

const PALETTE = {
  primaryGradient: "from-blue-500 to-blue-600",
  bg: "#F7F9FC",
  cardBg: "bg-white",
  primary: "#4A85FF",
  textDark: "#1A2D5F",
  textMuted: "#6E7A8A",
};

const PIE_COLORS = ["#4F46E5", "#F97316"];

function computeLoanDetails({
  loanAmount,
  annualRate,
  tenure,
  tenureType = "years", // "years" | "months"
  rateType = "annual", // "annual" | "monthly"
  extraMonthly = 0,
  lumpSum = 0,
  lumpSumMonth = null, // 1-based index
}) {
  if (!loanAmount || !annualRate || !tenure) return null;

  const months =
    tenureType === "years" ? Math.round(tenure * 12) : Math.round(tenure);

  const monthlyRate =
    rateType === "annual" ? annualRate / 12 / 100 : annualRate / 100;

  // EMI formula
  let emi;
  if (monthlyRate === 0) {
    emi = loanAmount / months;
  } else {
    const r = monthlyRate;
    const n = months;
    emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  let balance = loanAmount;
  const schedule = [];
  let totalInterest = 0;
  let totalPaid = 0;

  let month = 0;

  while (balance > 0 && month < 1000 * 12) {
    month += 1;
    const interest = balance * monthlyRate;
    let principal = emi - interest;

    let extra = extraMonthly || 0;
    if (lumpSumMonth && month === lumpSumMonth) {
      extra += lumpSum || 0;
    }

    // If we’re about to overpay, cap at remaining balance + interest
    if (principal + extra > balance) {
      const diff = principal + extra - balance;
      if (extra >= diff) {
        extra -= diff;
      } else {
        principal -= diff - extra;
        extra = 0;
      }
    }

    const totalPayment = principal + interest + extra;
    balance -= principal + extra;

    if (balance < 0.01) balance = 0; // tiny rounding fix

    totalInterest += interest;
    totalPaid += totalPayment;

    schedule.push({
      month,
      interest,
      principal: principal + extra,
      basePrincipal: principal,
      extraPayment: extra,
      totalPayment,
      balance,
    });

    if (balance <= 0) break;
    if (month >= months && extraMonthly <= 0 && !lumpSumMonth) {
      // normal end of schedule
      break;
    }
  }

  return {
    emi: parseFloat(emi.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPaid.toFixed(2)),
    schedule,
    monthsTaken: month,
    principal: loanAmount,
  };
}

function downloadCSV(schedule, summary, filename = "loan_schedule.csv") {
  if (!schedule || schedule.length === 0) return;

  const header = [
    "Month",
    "Interest",
    "Principal",
    "Extra Payment",
    "Total Payment",
    "Balance",
  ];

  const rows = schedule.map((row) => [
    row.month,
    row.interest.toFixed(2),
    row.principal.toFixed(2),
    row.extraPayment.toFixed(2),
    row.totalPayment.toFixed(2),
    row.balance.toFixed(2),
  ]);

  const meta = [
    ["Summary"],
    ["Loan Amount", summary.principal.toFixed(2)],
    ["EMI", summary.emi.toFixed(2)],
    ["Total Interest", summary.totalInterest.toFixed(2)],
    ["Total Payment", summary.totalPayment.toFixed(2)],
    [""],
  ];

  const csvContent = [
    ...meta.map((line) => line.join(",")),
    header.join(","),
    ...rows.map((line) => line.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState("years");
  const [rateType, setRateType] = useState("annual");

  const [extraMonthly, setExtraMonthly] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [lumpSumMonth, setLumpSumMonth] = useState("");

  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [compLoanAmount, setCompLoanAmount] = useState("");
  const [compInterestRate, setCompInterestRate] = useState("");
  const [compTenure, setCompTenure] = useState("");
  const [compTenureType, setCompTenureType] = useState("years");

  const [result, setResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [selectedView, setSelectedView] = useState("summary"); // 'summary' | 'schedule'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!loanAmount || Number(loanAmount) <= 0) {
      newErrors.loanAmount = "Enter a valid loan amount";
    }
    if (!interestRate || Number(interestRate) < 0) {
      newErrors.interestRate = "Enter a valid interest rate";
    }
    if (!tenure || Number(tenure) <= 0) {
      newErrors.tenure = "Enter a valid tenure";
    }

    if (comparisonEnabled) {
      if (!compLoanAmount || Number(compLoanAmount) <= 0) {
        newErrors.compLoanAmount = "Enter a valid comparison loan amount";
      }
      if (!compInterestRate || Number(compInterestRate) < 0) {
        newErrors.compInterestRate = "Enter a valid comparison interest rate";
      }
      if (!compTenure || Number(compTenure) <= 0) {
        newErrors.compTenure = "Enter a valid comparison tenure";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const main = computeLoanDetails({
      loanAmount: Number(loanAmount),
      annualRate: Number(interestRate),
      tenure: Number(tenure),
      tenureType,
      rateType,
      extraMonthly: Number(extraMonthly) || 0,
      lumpSum: Number(lumpSum) || 0,
      lumpSumMonth: lumpSumMonth ? Number(lumpSumMonth) : null,
    });

    let comp = null;
    if (comparisonEnabled) {
      comp = computeLoanDetails({
        loanAmount: Number(compLoanAmount),
        annualRate: Number(compInterestRate),
        tenure: Number(compTenure),
        tenureType: compTenureType,
        rateType,
        extraMonthly: 0,
      });
    }

    setResult(main);
    setComparisonResult(comp);
    setSelectedView("summary");
  };

  const handleReset = () => {
    setLoanAmount("");
    setInterestRate("");
    setTenure("");
    setTenureType("years");
    setRateType("annual");
    setExtraMonthly("");
    setLumpSum("");
    setLumpSumMonth("");
    setComparisonEnabled(false);
    setCompLoanAmount("");
    setCompInterestRate("");
    setCompTenure("");
    setCompTenureType("years");
    setResult(null);
    setComparisonResult(null);
    setErrors({});
    setSelectedView("summary");
  };

  const showSummary = result !== null;

  const pieData =
    result &&
    [
      { name: "Principal", value: result.principal },
      { name: "Total Interest", value: result.totalInterest },
    ];

  const lineData =
    result &&
    result.schedule.map((row) => ({
      month: row.month,
      balance: Number(row.balance.toFixed(2)),
    }));

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: PALETTE.bg }}
    >
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: PALETTE.textDark }}
            >
              Loan Calculator
            </h1>
            <p className="text-sm md:text-base mt-2" style={{ color: PALETTE.textMuted }}>
              Calculate EMIs, view amortization schedules, compare loans & export
              results.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-medium hover:bg-gray-50 transition"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleCalculate}
              className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white bg-gradient-to-r ${PALETTE.primaryGradient} hover:opacity-90 transition`}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </button>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Inputs card */}
          <div className={`${PALETTE.cardBg} rounded-2xl shadow-lg p-6 lg:col-span-2`}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: PALETTE.textDark }}>
              Loan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                  Loan Amount
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.loanAmount ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="e.g. 500000"
                  min="0"
                />
                {errors.loanAmount && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.loanAmount}
                  </p>
                )}
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                  Interest Rate
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.interestRate ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g. 8.5"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="annual">Annual %</option>
                    <option value="monthly">Monthly %</option>
                  </select>
                </div>
                {errors.interestRate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.interestRate}
                  </p>
                )}
              </div>

              {/* Tenure */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                  Tenure
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.tenure ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g. 20"
                    min="0"
                  />
                  <select
                    value={tenureType}
                    onChange={(e) => setTenureType(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                {errors.tenure && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.tenure}
                  </p>
                )}
              </div>

              {/* Prepayment / Extra payment */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                  Extra Monthly Payment (optional)
                </label>
                <input
                  type="number"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 2000"
                  min="0"
                />
                <div className="grid grid-cols-[2fr,1fr] gap-2 mt-3">
                  <input
                    type="number"
                    value={lumpSum}
                    onChange={(e) => setLumpSum(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Lump sum (optional)"
                    min="0"
                  />
                  <input
                    type="number"
                    value={lumpSumMonth}
                    onChange={(e) => setLumpSumMonth(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Month #"
                    min="1"
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: PALETTE.textMuted }}>
                  Model extra monthly payments and one-time prepayment to see how
                  tenure & interest reduce.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison card */}
          <div className={`${PALETTE.cardBg} rounded-2xl shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: PALETTE.textDark }}
              >
                Compare Loans
              </h2>
              <button
                onClick={() => setComparisonEnabled((v) => !v)}
                className={`text-xs font-medium px-3 py-1 rounded-full border ${
                  comparisonEnabled
                    ? "bg-green-50 border-green-400 text-green-700"
                    : "bg-gray-50 border-gray-300 text-gray-500"
                }`}
              >
                {comparisonEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            {comparisonEnabled ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                    Loan Amount
                  </label>
                  <input
                    type="number"
                    value={compLoanAmount}
                    onChange={(e) => setCompLoanAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.compLoanAmount ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g. 450000"
                    min="0"
                  />
                  {errors.compLoanAmount && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.compLoanAmount}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                      Interest Rate
                    </label>
                    <input
                      type="number"
                      value={compInterestRate}
                      onChange={(e) => setCompInterestRate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        errors.compInterestRate
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                      placeholder="e.g. 9.0"
                      min="0"
                      step="0.01"
                    />
                    {errors.compInterestRate && (
                      <p className="mt-1 text-[11px] text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.compInterestRate}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1" style={{ color: PALETTE.textMuted }}>
                      Tenure
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={compTenure}
                        onChange={(e) => setCompTenure(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          errors.compTenure ? "border-red-400" : "border-gray-200"
                        }`}
                        placeholder="e.g. 15"
                        min="0"
                      />
                      <select
                        value={compTenureType}
                        onChange={(e) => setCompTenureType(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    {errors.compTenure && (
                      <p className="mt-1 text-[11px] text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.compTenure}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: PALETTE.textMuted }}>
                  Comparison ignores extra payments to make options directly
                  comparable.
                </p>
              </div>
            ) : (
              <p className="text-xs" style={{ color: PALETTE.textMuted }}>
                Turn on comparison to add a second loan and see EMI / interest
                differences side-by-side.
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {hasErrors && !result && (
          <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-500" />
            <p className="text-xs text-red-700">
              Please fix the highlighted fields above to calculate.
            </p>
          </div>
        )}

        {showSummary && (
          <div className="space-y-6">
            {/* Quick stats + actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white shadow p-4">
                  <p className="text-xs uppercase font-semibold" style={{ color: PALETTE.textMuted }}>
                    EMI
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: PALETTE.textDark }}>
                    ₹{result.emi.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: PALETTE.textMuted }}>
                    for {result.monthsTaken} month(s)
                  </p>
                </div>
                <div className="rounded-2xl bg-white shadow p-4">
                  <p className="text-xs uppercase font-semibold" style={{ color: PALETTE.textMuted }}>
                    Total Interest
                  </p>
                  <p className="text-2xl font-bold mt-1 text-orange-500">
                    ₹{result.totalInterest.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: PALETTE.textMuted }}>
                    over entire loan period
                  </p>
                </div>
                <div className="rounded-2xl bg-white shadow p-4">
                  <p className="text-xs uppercase font-semibold" style={{ color: PALETTE.textMuted }}>
                    Total Payment
                  </p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">
                    ₹{result.totalPayment.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: PALETTE.textMuted }}>
                    Principal + Interest
                  </p>
                </div>
              </div>

              {/* Export actions */}
              <div className="rounded-2xl bg-white shadow p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold mb-2" style={{ color: PALETTE.textMuted }}>
                    Export / Share
                  </p>
                  <p className="text-[11px] mb-3" style={{ color: PALETTE.textMuted }}>
                    Download the amortization schedule as a CSV (Excel-compatible).
                    You can connect this to your Python backend for PDF export.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      downloadCSV(result.schedule, result, "loan_schedule.csv")
                    }
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-white hover:bg-gray-50"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-1.5" />
                    CSV / Excel
                  </button>
                  {/* Placeholder button – hook this to Python PDF endpoint later */}
                  <button
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-white opacity-70 cursor-not-allowed"
                    title="Implement through backend PDF generator"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    PDF (via backend)
                  </button>
                </div>
              </div>
            </div>

            {/* Charts + comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Charts */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow p-4 h-72">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: PALETTE.textDark }}>
                      Principal vs Interest
                    </h3>
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `₹${Number(value).toLocaleString("en-IN")}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow p-4 h-72">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: PALETTE.textDark }}>
                      Outstanding Balance Over Time
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#4F46E5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison panel */}
              <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: PALETTE.textDark }}>
                  Loan Comparison
                </h3>
                {comparisonResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-1">
                      <span></span>
                      <span>Main</span>
                      <span>Comparison</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span>EMI</span>
                      <span>₹{result.emi.toFixed(2)}</span>
                      <span>₹{comparisonResult.emi.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span>Total Interest</span>
                      <span>₹{result.totalInterest.toFixed(2)}</span>
                      <span>₹{comparisonResult.totalInterest.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span>Total Payment</span>
                      <span>₹{result.totalPayment.toFixed(2)}</span>
                      <span>₹{comparisonResult.totalPayment.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span>Months</span>
                      <span>{result.monthsTaken}</span>
                      <span>{comparisonResult.monthsTaken}</span>
                    </div>
                    <div className="border-t pt-2 mt-1 text-[11px]" style={{ color: PALETTE.textMuted }}>
                      Negative numbers here mean the comparison loan is cheaper or
                      shorter.
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] mt-1">
                      <div className="p-2 rounded-lg bg-emerald-50">
                        <p className="font-semibold text-emerald-700">Interest Saved</p>
                        <p className="mt-1 text-emerald-700">
                          ₹
                          {(
                            comparisonResult.totalInterest - result.totalInterest
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50">
                        <p className="font-semibold text-blue-700">Tenure Difference</p>
                        <p className="mt-1 text-blue-700">
                          {comparisonResult.monthsTaken - result.monthsTaken} months
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: PALETTE.textMuted }}>
                    Enable comparison and calculate to see EMI, interest, and tenure
                    differences here.
                  </p>
                )}
              </div>
            </div>

            {/* Tabs for schedule */}
            <div className="bg-white rounded-2xl shadow">
              <div className="border-b px-4 sm:px-6 flex items-center justify-between">
                <div className="flex gap-4 text-sm font-medium">
                  <button
                    onClick={() => setSelectedView("summary")}
                    className={`py-3 border-b-2 transition ${
                      selectedView === "summary"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setSelectedView("schedule")}
                    className={`py-3 border-b-2 transition ${
                      selectedView === "schedule"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Amortization Schedule
                  </button>
                </div>
              </div>

              {selectedView === "summary" && (
                <div className="p-4 sm:p-6 text-sm" style={{ color: PALETTE.textMuted }}>
                  <p>
                    Your EMI for a loan of{" "}
                    <span className="font-semibold text-blue-600">
                      ₹{result.principal.toLocaleString("en-IN")}
                    </span>{" "}
                    at{" "}
                    <span className="font-semibold text-blue-600">
                      {interestRate}% {rateType === "annual" ? "annual" : "monthly"}
                    </span>{" "}
                    works out to{" "}
                    <span className="font-semibold text-blue-600">
                      ₹{result.emi.toLocaleString("en-IN")} per month
                    </span>
                    .
                  </p>
                  <p className="mt-2">
                    Over{" "}
                    <span className="font-semibold text-blue-600">
                      {result.monthsTaken} month(s)
                    </span>
                    , you’ll pay{" "}
                    <span className="font-semibold text-blue-600">
                      ₹{result.totalInterest.toLocaleString("en-IN")}
                    </span>{" "}
                    as interest, for a total outflow of{" "}
                    <span className="font-semibold text-blue-600">
                      ₹{result.totalPayment.toLocaleString("en-IN")}
                    </span>
                    .
                  </p>
                  {(extraMonthly || lumpSum) && (
                    <p className="mt-3">
                      Extra payments (monthly or one-time) help reduce your
                      outstanding balance faster, which can significantly cut down the
                      total interest and effective tenure.
                    </p>
                  )}
                </div>
              )}

              {selectedView === "schedule" && (
                <div className="p-4 sm:p-6 overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Month
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Interest
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Principal
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Extra Payment
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Total Payment
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month} className="border-b last:border-0">
                          <td className="px-3 py-1.5">{row.month}</td>
                          <td className="px-3 py-1.5">
                            ₹{row.interest.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            ₹{row.principal.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            ₹{row.extraPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            ₹{row.totalPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            ₹{row.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] mt-2 text-gray-500">
                    This is a month-wise breakdown of how each EMI is split into
                    interest and principal, including any extra payments.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!showSummary && !hasErrors && (
          <div className="mt-6 text-center text-sm" style={{ color: PALETTE.textMuted }}>
            Enter loan details above and click{" "}
            <span className="font-semibold" style={{ color: PALETTE.primary }}>
              Calculate
            </span>{" "}
            to see EMI, interest, and detailed schedule.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;