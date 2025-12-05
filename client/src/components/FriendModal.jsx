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

  const getUsernameList= async (ids) =>{
    const token = await auth.currentUser.getIdToken();
    try{
      const res = await fetch(`http://localhost:8080/api/user/getUsernameList`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`,"Content-Type": "application/json" },
      
      body: JSON.stringify({ idArray: ids })
    });
    if (!res.ok) {
      throw new Error("Failed to fetch usernames");
    }
    const data = await res.json();
    return data.usernames;
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
        console.log('accepting api with requeseterId', requesterId)
      console.log('accpeting api with myid', myID)
        const response = await fetch("http://localhost:8080/api/user/makefriend", {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json", 
          },
          body: JSON.stringify({ 
            friendId: requesterId,
            userId: myID
          })
        });
  
        if (!response.ok) {
          throw new Error(`Failed to accept friend request: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("Friend request accepted:", result);
  
        setPendingRequests(prev => prev.filter(req => req.uid !== requesterId));
        
        const newFriend = pendingRequests.find(req => req.uid === requesterId);
        if (newFriend && setFriends) {
          setFriends(prev => [...prev, newFriend]);
        }
  
      } else if (action === "reject") {
        const response = await fetch("http://localhost:8080/api/user/rejectfriend", {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requesterId: requesterId
          })
        });
  
        if (!response.ok) {
          throw new Error(`Failed to reject friend request: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("Friend request rejected:", result);
  

        setPendingRequests(prev => prev.filter(req => req.uid !== requesterId));
      }
  
      console.log(`Friend request ${action}ed successfully`);
      
    } catch (err) {
      console.error(`Failed to ${action} friend request:`, err);

    }
  };

    return (
      <div className="flex flex-col w-full h-full p-5 flex-1">
        <PendingReqs pendingRequests={pendingRequests} handleRequestAction={handleRequestAction} getUsernameList={getUsernameList}/>

        <FriendList refreshFriends={refreshFriends } friends={friends} onSelectFriend={onSelectFriend} getUsernameList={getUsernameList}/>
      </div>
  );
  }
  
