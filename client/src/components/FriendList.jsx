import { useState, useEffect } from "react";
import { CaretUpIcon, CaretDownIcon, TrashIcon } from "@phosphor-icons/react";
import FriendFinder from './FriendFinder'
import { auth } from "../firebase.js"; 
import { toast } from "react-hot-toast"; 

export default function FriendList({refreshFriends, friends, onSelectFriend, getUsername }) {
  const [usernames, setUsernames] = useState({});
  const [open, setOpen] = useState(false)
const handleDelete = async (friendID) =>{
    try {
      const token = await auth.currentUser.getIdToken(); // get Firebase auth token
      const res = await fetch(`http://localhost:8080/api/user/friends/${friendID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to remove friend");
      refreshFriends()
      // Optionally update local state after deletion
      toast.success("Friend removed!");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove friend");
    }
}
  useEffect(() => {
    const fetchUsernames = async () => {
      // Fetch all usernames in parallel
      const entries = await Promise.all(
        friends.map(async (uid) => [uid, await getUsername(uid)])
      );
      setUsernames(Object.fromEntries(entries));
    };
    fetchUsernames();
  }, [friends, getUsername]);

  return (
    <div className="flex flex-col py-2 flex-1 min-h-0">
      
      {/* header */}
      <div className="shrink-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-center gap-1">
          {!open && <button onClick={() => {setOpen(true)}}><CaretUpIcon size={16} weight={'bold'}/></button>}
          {open && <button onClick={() => {setOpen(false)}}><CaretDownIcon size={16} weight={'bold'}/></button>}
          <span>my friends({friends.length})</span>
          </div>
        </div>

        <hr className="border-t-3 border-gray-300 border-dotted"/>
      </div>

      {open &&
        <div className="flex-1 min-h-0 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="mt-2 text-center border-2 border-gray-300 flex flex-col items-center justify-center p-5 rounded-md">
            <FriendFinder/>
            add your first friend!
          </div> 
        ) : (
          <div className="py-2 flex flex-col gap-2">
            {friends.map((f) => (
              <div
              className="flex items-center justify-between px-3 py-5 border-2 border-gray-300 rounded-md"
              onClick={() => onSelectFriend(f)}
              key={f}>
                <span>{usernames[f] || "Loading..."}</span>
                <button className="hover:cursor-pointer" onClick={(e) => {e.stopPropagation(); handleDelete(f);}}><TrashIcon size={20} weight={'fill'}/></button>
              </div>
            ))}
          </div>
        )}
        </div>
      }
    </div>
  );
}
