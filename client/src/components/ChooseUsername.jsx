import { useState } from "react";
import { auth } from "../firebase";
import { ConfettiIcon } from "@phosphor-icons/react";
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function ChooseUsername({ handleUsername }) {
  const [username, setUsername] = useState("");

  const setNewUsername = async () => {
    if (!username) {
      toast.error('please add a username')
      return;
    }

    const toastId = toast.loading('remembering your username...')

    try {
      const token = await auth.currentUser.getIdToken();
      const myID = auth.currentUser.uid;
      const res = await fetch(`${API_BASE_URL}/api/user/updateUsername`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ myID, newName: username }),
      });

      if (!res.ok) {
        throw new Error('username update failed')
      } else {
        handleUsername(username)
        toast(`hi, ${username}`, {
          id: toastId,
          icon: '👋'
        })
      }
    } catch (err) {
      console.error("Error updating username:", err);
      toast.error(err.message || 'error setting username. try a different name', {id: toastId})
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
        <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-center justify-center w-lg">
          <div className="flex gap-1 items-center justify-center flex-col w-full">
            <ConfettiIcon size={45} weight={'fill'}/>
            <span className="text-3xl">welcome to </span><span className="font-pacifico text-4xl">nomnom notes</span>
          </div>

          <div className="flex flex-col w-full max-w-[375px] items-start justify-center">
            <span>what should we call you?</span>
            <div className="w-full flex gap-2">
              <div className="border-1 border-solid rounded-md flex-1 p-2 focus-within:shadow-lg transition-shadow">
                  <input 
                  className="focus:outline-none w-full"
                  value={username} 
                  onChange ={e => setUsername(e.target.value)} 
                  type="text" placeholder={'enter your username'}/>
              </div>
              <button
              className="bg-black text-white px-4 rounded-md hover:cursor-pointer hover:bg-gray-800"
              onClick={setNewUsername}
              >enter</button>
            </div>
          </div>

        </div>
      </div>
  );
}
