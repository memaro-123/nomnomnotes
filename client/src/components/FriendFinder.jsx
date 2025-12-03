import { auth } from '../firebase'
import React, { useState } from "react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";

export default function FriendFinder () {
  const [error, setError] = useState("")
  const [friendCode, setFriendCode] = useState("");
  const [open, setOpen] = useState(false)

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
    <div>
      <button 
      className="bg-black text-white p-1 rounded-md hover:cursor-pointer"
      onClick={() => setOpen(true)}><PlusIcon size={12} weight={'bold'}/></button>
      {open &&
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
        <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-start justify-center">
          <button className="hover:cursor-pointer" onClick={() => setOpen(false)}><XIcon/></button>
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
        </div>
        </div>
      }
    </div>
  );
};
