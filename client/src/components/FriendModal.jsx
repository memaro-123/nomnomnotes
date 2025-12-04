import { useEffect, useState } from "react";
import { auth } from "../firebase";
import PendingReqs from "./PendingReqs.jsx"
import FriendList from "./FriendList.jsx"

export default function FriendModal({ onSelectFriend }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newFriendUID, setNewFriendUID] = useState("");
  

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
      }}
      else if (action === "reject") {
        try {
          const myID = auth.currentUser.uid;
          const response =await fetch(`http://localhost:8080/api/user/delete/${requesterId}`
, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        
      });
          setPendingRequests(prev => prev.filter(r => r !== requesterId));
        }
        catch{}
    }
      
    } catch (err) {
      console.error("Failed to update request", err);
    }
  };

    return (
      <div className="flex flex-col w-full h-[calc(100vh-90px)] border-2 border-gray-300 p-5 rounded-md shadow-md">
        <PendingReqs pendingRequests={pendingRequests} handleRequestAction={handleRequestAction} getUsername={getUsername}/>

        <FriendList friends={friends} onSelectFriend={onSelectFriend} getUsername={getUsername}/>
      </div>
  );
  }
  
