import React, { useState } from "react";
import { X, Edit3, User } from "lucide-react";

export default function Profile({ user, onClose }) {
  const [name, setName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    // TODO: Update Firestore or Firebase Auth here
    console.log("Updated:", { name, bio });
    setEditing(false);
  };

  return (
    <div className="absolute right-0 mt-90 mr-34 w-64 bg-white shadow-xl rounded-xl border p-4 z-50 animate-slideDown fixed">
      
      {/* Close button */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg text-gray-800">Profile</h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      {/* User Avatar */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-600" />
        </div>
      </div>

      {/* User Info */}
      {!editing ? (
        <>
          <p className="text-sm text-gray-900 font-medium">{name || "No Name"}</p>
          <p className="text-xs text-gray-600 mb-2">{user?.email}</p>
          <p className="text-sm text-gray-700 italic mb-3">
            {bio || "No bio added"}
          </p>

          <button
            onClick={() => setEditing(true)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-600 transition"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </>
      ) : (
        <>
          {/* Edit Form */}
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
            placeholder="Your bio"
            rows="2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition mb-2"
          >
            Save
          </button>

          <button
            onClick={() => setEditing(false)}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
