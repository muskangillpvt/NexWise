// import { useState } from "react";
// import axios from "axios";
// import { getAuth } from "firebase/auth";

// const ChatBot = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);

//     try {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       if (!user) {
//         throw new Error("User not logged in");
//       }

//       const token = await user.getIdToken(); // ✅ Firebase ID Token

//       const res = await axios.post(
//         "http://localhost:5000/api/chat",
//         { message: userMsg.text },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // ✅ REQUIRED
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const botMsg = {
//         sender: "bot",
//         text: res.data.reply || "No reply from AI",
//       };

//       setMessages((prev) => [...prev, botMsg]);
//     } catch (error) {
//       console.error("Chat Error:", error);

//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "❌ AI is unreachable right now." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">

//       <div className="chat-messages">
//         {messages.map((msg, i) => (
//           <div key={i} className={`chat-msg ${msg.sender}`}>
//             {msg.text}
//           </div>
//         ))}

//         {loading && <div className="chat-msg bot">Typing...</div>}
//       </div>

//       {/* ✅ FORM WITH PREVENT DEFAULT */}
//       <form
//         onSubmit={(e) => {
//           e.preventDefault(); // ✅ STOPS PAGE REFRESH
//           sendMessage();
//         }}
//         className="chat-input-area"
//       >
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask FinBuddy something..."
//         />

//         {/* ✅ BUTTON MUST NOT BE SUBMIT */}
//         <button type="button" onClick={sendMessage}>
//           Send
//         </button>
//       </form>

//     </div>
//   );
// };

// export default ChatBot;
import { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) throw new Error("User not logged in");

      const token = await user.getIdToken();

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: userMsg.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply || "No reply from AI" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ AI is unreachable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 h-96 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-indigo-600 text-white p-3 font-semibold">
        NexWise AI
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.sender === "user"
                ? "bg-indigo-100 self-end ml-auto"
                : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-400">Typing...</div>}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex border-t"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 outline-none text-sm"
          placeholder="Ask NexWise..."
        />
        <button
          type="submit"
          className="px-4 bg-indigo-600 text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
