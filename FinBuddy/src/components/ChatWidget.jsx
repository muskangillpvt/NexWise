import { useState } from "react";
import ChatBot from "./ChatBot";
import "../index.css";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Drop-up Chatbox */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 animate-slide-up">
          <ChatBot />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
      >
        💬
      </button>
    </>
  );
};

export default ChatWidget;
