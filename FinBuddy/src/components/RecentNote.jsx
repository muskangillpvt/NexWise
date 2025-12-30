import React, { useEffect, useState } from "react";
import { Edit3, Trash2, Plus, Check } from "lucide-react";
import { getAuth } from "firebase/auth";

const RecentNote = () => {
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [content, setContent] = useState("");

  const getToken = async () => {
    const user = getAuth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // ✅ FETCH ALL NOTES (IMPORTANT FIX)
  const fetchNotes = async () => {
    const token = await getToken();
    const res = await fetch("http://127.0.0.1:5000/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
  };

  // ✅ ADD NOTE (use backend response)
  const addNote = async () => {
    if (!content.trim()) return;
    const token = await getToken();

    const res = await fetch("http://127.0.0.1:5000/api/notes/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const savedNote = await res.json();

    setNotes(prev => [savedNote, ...prev]);
    setContent("");
    setEditingId(null);
  };

  // ✅ UPDATE NOTE
  const updateNote = async (id) => {
    const token = await getToken();

    await fetch("http://127.0.0.1:5000/api/notes/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, content }),
    });

    setNotes(prev =>
      prev.map(n => (n._id === id ? { ...n, content } : n))
    );

    setEditingId(null);
    setContent("");
  };

  // ✅ DELETE NOTE (header fixed)
  const deleteNote = async (id) => {
    const token = await getToken();

    await fetch("http://127.0.0.1:5000/api/notes/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    setNotes(prev => prev.filter(n => n._id !== id));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="bg-[#f5f6fa] rounded-2xl p-4 shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-[#1A2D5F]">
          Sticky Notes 📝
        </h3>

        <button
          onClick={() => {
            setEditingId("new");
            setContent("");
          }}
          className="flex items-center gap-1 text-sm text-[#4A85FF]"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* NOTES */}
      <div className="grid grid-cols-1 gap-3">
        {notes.map(note => (
          <div
            key={note._id}
            className="relative bg-blue-100 rounded-lg p-3 shadow-md
                       rotate-[-1deg] hover:rotate-0 transition"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <Edit3
                className="w-4 h-4 cursor-pointer"
                onClick={() => {
                  setEditingId(note._id);
                  setContent(note.content);
                }}
              />
              <Trash2
                className="w-4 h-4 cursor-pointer text-red-500"
                onClick={() => deleteNote(note._id)}
              />
            </div>

            {editingId === note._id ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-blue-200 rounded p-2 text-sm"
                  rows={4}
                />
                <button
                  onClick={() => updateNote(note._id)}
                  className="mt-2 flex items-center gap-1 text-sm text-green-700"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </>
            ) : (
              <p className="text-sm whitespace-pre-wrap">
                {note.content}
              </p>
            )}
          </div>
        ))}

        {/* NEW NOTE */}
        {editingId === "new" && (
          <div className="bg-blue-200 rounded-lg p-3 shadow-md">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a new note..."
              className="w-full bg-blue-100 rounded p-2 text-sm"
              rows={4}
            />
            <button
              onClick={addNote}
              className="mt-2 flex items-center gap-1 text-sm text-green-700"
            >
              <Check className="w-4 h-4" /> Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentNote;