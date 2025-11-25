import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function FriendModal({ onClose, onSelectFriend }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newFriendUID, setNewFriendUID] = useState("");

  // This fetches the friends and pending requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();

        // Friends list
        const friendsRes = await fetch("http://localhost:8080/api/user/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);

        // Pending friend requests
        const pendingRes = await fetch("http://localhost:8080/api/user/friends/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData.requests || []);
      } catch (err) {
        console.error("Failed to fetch friends or requests", err);
      }
    };
    fetchData();
  }, []);

  // For sending a friend request
  const sendFriendRequest = async () => {
    if (!newFriendUID) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:8080/api/user/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ friendId: newFriendUID })
      });
      if (res.ok) {
        alert("Friend request sent!");
        setNewFriendUID("");
      }
    } catch (err) {
      console.error("Failed to send friend request", err);
    }
  };

  // For accepting or rejecting a pending request
  const handleRequestAction = async (requesterId, action) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:8080/api/user/friends/${requesterId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });
      // Remove request from pending state when rejected
      setPendingRequests(prev => prev.filter(r => r.requesterId !== requesterId));
      // Add to friends list if accepted (and remove from pending state)
      if (action === "accept") {
        setFriends(prev => [...prev, { friend_id: requesterId, username: "New Friend" }]);
      }
    } catch (err) {
      console.error("Failed to update request", err);
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
        zIndex: 1000
      }}
    >
      <div style={{
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "12px",
        minWidth: "350px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        {/* Pending friend requests, accept or reject */}
        <h2 style={{ marginTop: 0 }}>Pending Friend Requests</h2>
        {pendingRequests.length === 0 ? <p>No pending requests</p> : (
          <ul>
            {pendingRequests.map(r => (
              <li key={r.requesterId} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>{r.username}</span>
                <div>
                  <button 
                    onClick={() => handleRequestAction(r.requesterId, "accept")}
                    style={{ marginRight: "5px", cursor: "pointer" }}
                  >Accept</button>
                  <button 
                    onClick={() => handleRequestAction(r.requesterId, "reject")}
                    style={{ cursor: "pointer" }}
                  >Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr style={{ margin: "15px 0" }} />

        {/* Friends List */}
        <h2>Friends</h2>
        {friends.length === 0 ? <p>No friends yet</p> : (
          <ul>
            {friends.map(f => (
              <li key={f.friend_id} style={{ marginBottom: "8px" }}>
                <button
                  style={{ cursor: "pointer", padding: "5px 10px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9" }}
                  onClick={() => onSelectFriend(f.friend_id)}
                >
                  {f.username}
                </button>
              </li>
            ))}
          </ul>
        )}

        <hr style={{ margin: "15px 0" }} />

        {/* Place to add a new friend using UID */}
        <h2>Add Friend by UID</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            value={newFriendUID}
            onChange={e => setNewFriendUID(e.target.value)}
            placeholder="Enter friend's UID"
            style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button 
            onClick={sendFriendRequest}
            style={{ cursor: "pointer", padding: "5px 10px", borderRadius: "6px", backgroundColor: "#4CAF50", color: "#fff", border: "none" }}
          >
            Send
          </button>
        </div>

        <button 
          onClick={onClose} 
          style={{ marginTop: "10px", cursor: "pointer", padding: "5px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
