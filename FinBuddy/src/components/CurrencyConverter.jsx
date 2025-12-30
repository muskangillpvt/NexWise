import React, { useEffect, useState, useRef } from "react";
import { Globe, RefreshCw, Clock } from "lucide-react";

import { getAuth } from "firebase/auth";

async function getToken() {
  const user = getAuth().currentUser;
  if (user) return await user.getIdToken();
  return null;
}

// top of CurrencyConverter.jsx
// import React, { useEffect } from "react";
// console.log("[CurrencyConverter] module loaded");

// export default function CurrencyConverter(props) {
//   useEffect(() => {
//     console.log("[CurrencyConverter] mounted");
//     return () => console.log("[CurrencyConverter] unmounted");
//   }, []);

//   // ... rest of component
// }

/**
 * CurrencyConverter.jsx
 *
 * - UI matches DashboardOne color palette and rounded card style
 * - Expects backend endpoints:
 *    GET  /api/symbols        -> { symbols: { "USD": { "description": "United States Dollar" }, ... } }
 *    POST /api/convert        -> { success: true, rate: 0.7412, result: 74.12, from: "USD", to: "INR", date: "2025-11-22" }
 *
 * - Stores recent conversions in localStorage (max 10)
 * - Validates amount input (no negative, only numeric/decimal)
 * - Bidirectional: edit either amount to recalc other
 * - Shows flags in dropdown for common currencies (fallback to code)
 *
 * Add to DashboardOne: import CurrencyConverter and render when subfeature.name === 'Currency Converter'
 */

const BACKEND = "http://localhost:8000"; // adjust if needed
const STORAGE_KEY = "nexwise_currency_history_v1";
const MAX_HISTORY = 10;

// small mapping currency code -> representative country code for emoji flags (not exhaustive)
const currencyToCountry = {
  USD: "US",
  INR: "IN",
  EUR: "EU",
  GBP: "GB",
  AUD: "AU",
  JPY: "JP",
  CAD: "CA",
  SGD: "SG",
  CNY: "CN",
  AED: "AE",
  // add more if you want
};

function flagEmojiFromCurrency(code) {
  const country = currencyToCountry[code];
  if (!country) return code; // fallback
  // convert country code to regional indicator symbols
  return country
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

function sanitizeAmountInput(value) {
  // allow numbers and at most one dot
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 2) return cleaned;
  // more than one dot -> join extras
  return parts[0] + "." + parts.slice(1).join("");
}

function CurrencyConverter() {
  const [symbols, setSymbols] = useState({});
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("");
  const [rate, setRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const typingRef = useRef({ source: "from" }); // track which input last changed

  // load symbols on mount
useEffect(() => {
  const loadSymbols = async () => {
    setLoadingSymbols(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/symbols`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok && json.symbols) {
        setSymbols(json.symbols);
      }
    } catch (e) {
      console.error("Could not load symbols:", e);
    } finally {
      setLoadingSymbols(false);
    }
  };

  loadSymbols();

  //  LOAD USER HISTORY FROM MONGODB
 
  (async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok && json.history) {
        setHistory(json.history);
      }
    } catch (e) {
      console.warn("Could not load user history from backend", e);
    }
  })();

}, []);


  // helper to save history
  // const pushHistory = (entry) => {
  //   const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
  //   setHistory(newHistory);
  //   try {
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  //   } catch (e) {
  //     console.warn("Could not save history", e);
  //   }
  // };

  // perform conversion (asks backend)
  const convert = async ({ from, to, amount, source = "from" }) => {
    if (!from || !to) return;
    if (!amount || isNaN(Number(amount))) return;

    setError(null);
    setIsConverting(true);
    try {
      const token = await getToken();
const res = await fetch(`${BACKEND}/api/convert`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ from, to, amount: Number(amount) }),
});

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.detail || "Conversion failed");
        setIsConverting(false);
        return;
      }

      setRate(json.rate);
      setLastUpdated(json.date || new Date().toISOString());
      // set values bidirectionally based on source
      if (source === "from") {
        setToAmount(String(Number(json.result).toFixed(4)));
        setFromAmount(String(Number(amount)));
      } else {
        // source = "to", compute the from amount (backend returns result = converted)
        // we can compute reverse using rate: from = to / rate
        const computedFrom = Number(amount) / Number(json.rate);
        setFromAmount(String(Number(computedFrom).toFixed(4)));
        setToAmount(String(Number(amount)));
      }

      // push to history
      setHistory((prev) => [
  {
    from,
    to,
    fromAmount: Number(amount),
    toAmount: Number(source === "from" ? json.result : Number(amount)),
    rate: Number(json.rate),
    date: json.date || new Date().toISOString(),
  },
  ...prev,
]);

try {
  const token = await getToken();
  await fetch(`${BACKEND}/api/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      from,
      to,
      fromAmount: Number(amount),
      toAmount: Number(source === "from" ? json.result : Number(amount)),
      rate: Number(json.rate),
      date: json.date || new Date().toISOString(),
    }),
  });
} catch (err) {
  console.warn("Could not save to backend history", err);
}

    } catch (e) {
      console.error(e);
      setError("Network error");
    } finally {
      setIsConverting(false);
    }
  };

  // initial convert on mount or when currencies change
  useEffect(() => {
    if (!loadingSymbols) {
      convert({ from: fromCurrency, to: toCurrency, amount: fromAmount, source: "from" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, loadingSymbols]);

  // handle from input change
  const onFromChange = (raw) => {
    const cleaned = sanitizeAmountInput(raw);
    setFromAmount(cleaned);
    typingRef.current = { source: "from" };
    if (cleaned === "" || isNaN(Number(cleaned))) {
      setToAmount("");
      return;
    }
    // call convert (debounce minimal)
    debounceConvert({ from: fromCurrency, to: toCurrency, amount: cleaned, source: "from" });
  };

  // handle to input change for bidirectional behaviour
  const onToChange = (raw) => {
    const cleaned = sanitizeAmountInput(raw);
    setToAmount(cleaned);
    typingRef.current = { source: "to" };
    if (cleaned === "" || isNaN(Number(cleaned))) {
      setFromAmount("");
      return;
    }
    debounceConvert({ from: fromCurrency, to: toCurrency, amount: cleaned, source: "to" });
  };

  // simple debounce
  const convertTimer = useRef(null);
  const debounceConvert = ({ from, to, amount, source }) => {
    if (convertTimer.current) clearTimeout(convertTimer.current);
    convertTimer.current = setTimeout(() => {
      // if source is "to" we want backend to compute based on to->from; backend supports order from->to only,
      // so we send reversed pair when source === "to" and amount is the 'to' amount.
      if (source === "to") {
        // convert to -> from (ask backend reversed)
        convert({ from: to, to: from, amount, source: "to" });
      } else {
        convert({ from, to, amount, source: "from" });
      }
    }, 350);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // swap amounts too
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    // immediate convert after swap
    debounceConvert({ from: toCurrency, to: fromCurrency, amount: toAmount || fromAmount, source: "from" });
  };

  const onSelectHistory = (entry) => {
    setFromCurrency(entry.from);
    setToCurrency(entry.to);
    setFromAmount(String(entry.fromAmount));
    setToAmount(String(entry.toAmount));
    // convert fresh
    debounceConvert({ from: entry.from, to: entry.to, amount: String(entry.fromAmount), source: "from" });
  };

  return (
    <div className="bg-[#F7F9FC] min-h-screen">
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A2D5F]">Currency Converter</h2>
                <p className="text-sm text-[#6E7A8A]">Real-time exchange rates · Recent conversions stored locally</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // refresh
                  debounceConvert({ from: fromCurrency, to: toCurrency, amount: fromAmount || "1", source: "from" });
                }}
                className="px-3 py-2 rounded-lg border border-[#E6EEF9] hover:bg-[#F1F6FF] flex items-center space-x-2"
                title="Refresh rate"
              >
                <RefreshCw className="h-4 w-4 text-[#1A2D5F]" />
                <span className="text-sm text-[#1A2D5F]">Refresh</span>
              </button>

              <div className="text-sm text-[#6E7A8A] flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* row: from/to */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                  <label className="text-xs font-medium opacity-90">From</label>
                  <div className="mt-2 flex items-start space-x-3">
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-36 rounded-lg px-3 py-2 border border-transparent text-sm font-medium"
                    >
                      {Object.keys(symbols).length > 0 ?
                        Object.keys(symbols).map((code) => (
                          <option key={code} value={code}>
                            {`${flagEmojiFromCurrency(code)} ${code} — ${symbols[code].description}`}
                          </option>
                        )) :
                        // fallback small list
                        ["USD","INR","EUR","AUD","JPY","GBP","CAD"].map((c) => (
                          <option key={c} value={c}>{`${flagEmojiFromCurrency(c)} ${c}`}</option>
                        ))
                      }
                    </select>

                    <input
                      inputMode="decimal"
                      value={fromAmount}
                      onChange={(e) => onFromChange(e.target.value)}
                      className="flex-1 bg-transparent text-white text-xl font-semibold placeholder-white/60 outline-none"
                      placeholder="Amount"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md">
                  <label className="text-xs font-medium text-[#6E7A8A]">To</label>
                  <div className="mt-2 flex items-start space-x-3">
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-36 rounded-lg px-3 py-2 border border-gray-200 text-sm font-medium"
                    >
                      {Object.keys(symbols).length > 0 ?
                        Object.keys(symbols).map((code) => (
                          <option key={code} value={code}>
                            {`${flagEmojiFromCurrency(code)} ${code} — ${symbols[code].description}`}
                          </option>
                        )) :
                        ["INR","USD","EUR","AUD","JPY","GBP","CAD"].map((c) => (
                          <option key={c} value={c}>{`${flagEmojiFromCurrency(c)} ${c}`}</option>
                        ))
                      }
                    </select>

                    <input
                      inputMode="decimal"
                      value={toAmount}
                      onChange={(e) => onToChange(e.target.value)}
                      className="flex-1 bg-transparent text-[#1A2D5F] text-xl font-semibold outline-none"
                      placeholder="Converted"
                    />
                  </div>
                </div>
              </div>

              {/* swap & rate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={swapCurrencies}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:shadow-sm"
                  >
                    ⇄ Swap
                  </button>

                  <div className="text-sm text-[#6E7A8A]">
                    {rate ? (
                      <div>
                        1 {fromCurrency} = {Number(rate).toFixed(6)} {toCurrency}
                      </div>
                    ) : (
                      <div className="italic">Rate not available yet</div>
                    )}
                  </div>
                </div>

                <div>
                  {error && <div className="text-sm text-red-500">{error}</div>}
                  <div className="text-sm text-[#6E7A8A]">
                    {isConverting ? "Converting..." : "Live"}
                  </div>
                </div>
              </div>

              {/* quick actions: recent */}
              <div>
                <h3 className="text-sm text-[#1A2D5F] font-semibold mb-2">Recent conversions</h3>
                {history.length === 0 ? (
                  <div className="text-sm text-[#6E7A8A]">No recent conversions</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {history.map((h, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectHistory(h)}
                        className="text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <div className="text-sm font-medium">{`${h.fromAmount} ${h.from} → ${Number(h.toAmount).toFixed(4)} ${h.to}`}</div>
                          <div className="text-xs text-[#6E7A8A]">{new Date(h.date).toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-[#6E7A8A]">rate {Number(h.rate).toFixed(6)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* right column: info / tips */}
            <aside className="bg-white rounded-xl p-4 shadow-md">
              <h4 className="text-lg font-semibold text-[#1A2D5F] mb-2">Info</h4>
              <p className="text-sm text-[#6E7A8A] mb-3">
                Rates are fetched in real-time from a free public service. Use the swap button to flip currencies. Recent conversions are stored locally in your browser.
              </p>

              <div className="mt-4">
                <h5 className="text-sm font-medium text-[#1A2D5F] mb-2">Validation</h5>
                <ul className="text-sm text-[#6E7A8A] space-y-1">
                  <li>- No negative amounts</li>
                  <li>- Only numeric values and a single decimal point allowed</li>
                  <li>- Click a recent conversion to re-load it</li>
                </ul>
              </div>

              <div className="mt-4 text-sm">
                <button
                  onClick={() => setHistory([])}
                  className="w-full py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Clear recent
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CurrencyConverter;