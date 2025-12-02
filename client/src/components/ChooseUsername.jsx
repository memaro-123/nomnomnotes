import { useState } from "react";
import { auth } from "../firebase";
export default function ChooseUsername({ onClose }) {
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const setNewUsername = async (name) => {
    setError("");
    if (!name) {
      setError("Username cannot be empty");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const myID = auth.currentUser.uid;
      const res = await fetch("http://localhost:8080/api/user/updateUsername", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ myID, newName: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "username update failed");
        return;
      }
      onClose();
    } catch (err) {
      console.error("Error updating username:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative", // needed for the X button
          backgroundColor: "#fff",
          padding: "25px",
          borderRadius: "12px",
          minWidth: "350px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {/* X button in top-right */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        <h2>Choose a Username to access friend features</h2>
        <input
          type="text"
          placeholder="Enter username"
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => setNewUsername(input)}
          style={{
            marginTop: "10px",
            cursor: "pointer",
            padding: "5px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
