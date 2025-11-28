import { useEffect, useState } from "react";
import { auth } from "../firebase";
import FriendFinder from '/src/components/friendFinder/friendSearch.jsx'
import PendingReqs from "./PendingReqs.jsx"
import FriendList from "./FriendList.jsx"
import ChooseUsername from "./ChooseUsername.jsx"
export default function FriendModal({ onClose, onSelectFriend }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newFriendUID, setNewFriendUID] = useState("");
  const [myUsername, setMyUsername] = useState("");
useEffect(() => {
  const fetchMyUsername = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const uid = auth.currentUser.uid;

      const res = await fetch(`http://localhost:8080/api/user/getUsername?id=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch username");

      const data = await res.json();
      setMyUsername(data.username);
    } catch (err) {
      console.error("Failed to fetch my username", err);
      setMyUsername(null);
    }
  };

  fetchMyUsername();
}, []);

  const refreshFriends = async () => {
  const token = await auth.currentUser.getIdToken();
  const friendsRes = await fetch("http://localhost:8080/api/user/friends", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await friendsRes.json();
  setFriends(data.friends || []);
};
  const getUsername= async (id) =>{
    const token = await auth.currentUser.getIdToken();
    try{
      const res = await fetch(`http://localhost:8080/api/user/getUsername?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch username");
    }
    const data = await res.json();
    return data.username;
    }
    catch(err){       
    console.error(err);
    return null;
  }
    
  }
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
        console.log(friendsData)

        // Pending friend requests
        const pendingRes = await fetch("http://localhost:8080/api/user/friends/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pendingData = await pendingRes.json();
        console.log(pendingData)
        setPendingRequests(pendingData.requests || []);
        
      } catch (err) {
        console.error("Failed to fetch friends or requests", err);
      }
    };
    fetchData();
  }, []);


  // For accepting or rejecting a pending request
  const handleRequestAction = async (requesterId, action) => {
    try {
      const token = await auth.currentUser.getIdToken();
      
      if (action === "accept") {
        const myID = auth.currentUser.uid;
        const response =await fetch("http://localhost:8080/api/user/makefriend", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          myID: myID,
          friendID: requesterId 
        })
      });
      if (response.ok) {
        setPendingRequests(prev => prev.filter(r => r !== requesterId));
        await refreshFriends();

      }
      
      }
      else if (action === "reject") {
      setPendingRequests(prev => prev.filter(r => r !== requesterId));
    }
      

      
    } catch (err) {
      console.error("Failed to update request", err);
    }
  };
  if (myUsername ==="defaultUsername"){
    return(<ChooseUsername onClose ={onClose}></ChooseUsername>)
    
  }
  else{
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
        <PendingReqs pendingRequests={pendingRequests} handleRequestAction={handleRequestAction} getUsername={getUsername}/>

        <FriendList friends={friends} onSelectFriend={onSelectFriend} getUsername={getUsername}/>

        {/* Place to add a new friend using UID */}
        <h2>Add Friend by UID</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <FriendFinder></FriendFinder>
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
  
}
