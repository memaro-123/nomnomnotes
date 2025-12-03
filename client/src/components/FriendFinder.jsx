import { auth } from '../firebase'
import React, { useState } from "react";
import { PlusIcon, XIcon, UserCirclePlusIcon, CopySimpleIcon } from "@phosphor-icons/react";
import { toast } from 'react-hot-toast';

export default function FriendFinder () {
  const [friendCode, setFriendCode] = useState("");
  const [codeError, setCodeError] = useState('');
  const [open, setOpen] = useState(false)
  const uid = auth.currentUser?.uid;

  const handleFriendCodeAdd = async () => {
    setCodeError('')

    if (friendCode === '') {
      setCodeError('required')
      return;
    }

    if (friendCode === uid) {
      toast.error('cannot send friend request to yourself')
      setFriendCode('')
      return;
    }

    const toastId = toast.loading('sending request...')

    try {
      const token = await auth.currentUser.getIdToken()
      const addResponse = await fetch(
        `http://localhost:8080/api/diary/sendreq`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            myID: uid,
            friendID: friendCode,
          }),
        }
      )
      const data = await addResponse.json()

      if (addResponse.ok) {
        console.log('request sent successfully')
        toast.success('friend request sent successfully', {id: toastId})
      } else {
        throw new Error(data.message || data.error)
      }

    } catch (error) {
      console.log(error.message)
      toast.error(error.message || 'failed to send friend request', {id: toastId})
    } finally {
        setFriendCode("")
    }
  }

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      toast.success('copied uid')
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('error copying uid')
    }
  };

  return (
    <div>
      <button 
      className="bg-black text-white p-1 rounded-md hover:cursor-pointer"
      onClick={() => setOpen(true)}><PlusIcon size={12} weight={'bold'}/></button>

      {open &&
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
        <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-start justify-center">

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
            <UserCirclePlusIcon size={45} weight={'fill'}/>
            <span className="font-pacifico text-3xl">add friends</span>
            </div>
            <button className="hover:cursor-pointer" onClick={() => {setOpen(false); setFriendCode('')}}><XIcon/></button>
          </div>

          <button 
            onClick={handleCopyUid}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
            title="Copy UID"
          >
            <CopySimpleIcon size={15}/>
            my uid: {uid}
          </button>

          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center">
                <div><span>friend's uid</span><span className="text-red-500">*</span></div>
                {codeError && <span className="text-red-500">{codeError}</span>}
            </div>
            <div className="flex gap-1">
              <div className="border-1 border-solid rounded-md w-full p-2 focus-within:shadow-lg transition-shadow">
                  <input 
                  className="focus:outline-none w-full"
                  value={friendCode} 
                  onChange ={e => setFriendCode(e.target.value)} 
                  type="text" placeholder={'enter your friend\'s uid'}/>
              </div>
              <button 
              className="px-4 py-1 bg-black text-white rounded-md"
              onClick={handleFriendCodeAdd}>send</button>
            </div>
          </div>
        </div>
        </div>
      }
    </div>
  );
};
