import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const MotivationalQuote = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/quotes/daily")
      .then(res => res.json())
      .then(data => setQuote(data.quote))
      .catch(() => setQuote("Stay focused and keep going 🌱"));
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center mb-2">
        <Sparkles className="w-5 h-5 mr-2" />
        <h3 className="font-semibold">Daily Motivation</h3>
      </div>
      <p className="text-sm italic">“{quote}”</p>
    </div>
  );
};

export default MotivationalQuote;
