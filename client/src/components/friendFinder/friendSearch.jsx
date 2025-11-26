import { auth } from '../../firebase'
import React, { useState } from "react";
const FriendFinder = () => {
    const [error, setError] = useState("")
  const [friendCode, setFriendCode] = useState("");
  const handleFriendCodeAdd = async (event) => {
    event.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken()
      const myID = auth.currentUser.uid
      const addResponse = await fetch(
        `http://localhost:8080/api/diary/sendreq`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            myID: myID,
            friendID: friendCode,
          }),
        }
      )
      const data = await addResponse.json()
      if (addResponse.ok) {
      alert(data.message || "Request successful!");
    } 
      if (!addResponse.ok) {
      console.error("Error:", data.error);
      alert(data.error)
      return
    }

    } catch (error) {
      setError(error.message)
    } finally {
        setFriendCode("")
        setError("")
    }
  }
  const handleFriendChange = (event) => {
    setFriendCode(event.target.value);
  };
  return (
    <>
        <p>my id: {auth.currentUser?.uid}</p>
      <form onSubmit={handleFriendCodeAdd}>
        <label>
          Add Friend Code for new friend!{" "}
          <input
            onChange={handleFriendChange}
            type="text"
            value={friendCode}
            placeholder="Enter friend's code"
          />
          <button type="submit">Send friend request</button>
        </label>
      </form>
    </>
  );
};
export default FriendFinder;
