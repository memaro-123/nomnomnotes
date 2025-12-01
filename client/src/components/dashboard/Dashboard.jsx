import { HouseIcon } from "@phosphor-icons/react";
import { useCallback, useState } from 'react';
import { auth } from '../../firebase';
import AddDiaryButton from '../diary/AddDiaryButton';
import FriendModal from "../FriendModal";
import BiteBack from './BiteBack';
import Diary from './Diary';
import SettingsButton from './SettingsButton';

export default function Dashboard() {

  const [loading, setLoading] = useState()
  const [error, setError] = useState(null)
  const [entries, setEntries] = useState([])

  const [viewingFriendId, setViewingFriendId] = useState(null);
  const [activeView, setActiveView] = useState('diary'); // or biteback i think


    const fetchDiaries = useCallback(async () => {
      setLoading(true)
      try {
            //change this later so that you can pass the uid into the entrylist to change who's list ur viewing!!
            const user = auth.currentUser;

            if (!user) {
              throw new Error('No user logged in');
            }

            const token = await user.getIdToken();

            const fetchResponse = await fetch("http://localhost:8080/api/diary", {
              
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }})
            if (!fetchResponse.ok) {
                throw new Error ('Error writing diary :/')
            }

            const diaryData = await fetchResponse.json()
            console.log(diaryData)
            setEntries(diaryData.diaryData)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false);
      }
    }, [setLoading, setEntries, setError]);


    const fetchFriendDiaries = async (friendId) => {
      setLoading(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`http://localhost:8080/api/diary/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Marking all entries as not owned so that they are read-only
        const entriesWithOwnership = data.diaryData.map(e => ({ ...e, isOwner: false }));
        setEntries(entriesWithOwnership);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    return (
        <div className="w-screen h-screen flex gap-5 p-5">

          {/* friends */}
          <div className="hidden lg:block lg:flex flex-col w-1/4 h-full gap-2">
            <div className=" flex items-center justify-between w-full px-5 py-2 border-2 border-gray-300 rounded-md shadow-md">
              {/* <span className="text-xl">🐠 🥦 🍎</span> */}
              <span className="text-lg font-bold">nomnom notes</span>
              <SettingsButton/>
            </div>
            <div className=" w-full h-full border-2 border-gray-300 p-5 rounded-md shadow-md">
              <FriendModal/>
            </div>
          </div>

          {/* diary part */}
          <div className="w-full h-full max-h-full flex flex-col gap-3">

            {/* diary header */}
            <div className="flex flex-col gap-2 pt-3">
              <div className="w-full flex items-center justify-between">

                <div className="flex items-center justify-center gap-3">
                  <div className="lg:hidden">
                    <SettingsButton/>
                  </div>
                  <button className="hover:cursor-pointer" onClick={() => setActiveView('diary')}><HouseIcon size={28} weight={'fill'}/></button>
                  <span className="text-24 font-bold">{viewingFriendId ? 'friend\'s diary' : 'my diary'}</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setActiveView('biteback')} 
                  className="bg-black text-white px-4 py-1 rounded-md text-sm hover:cursor-pointer">
                   wrapped </button>
                  {!viewingFriendId && <AddDiaryButton fetchDiaries={fetchDiaries} />}
                </div>

              </div>
              <hr className="border-t-3 border-gray-300 border-dotted"/>
            </div>

            {/* only diary or biteback */}
            {activeView === 'biteback' ? (
              <BiteBack />
            ) : ( 
              <Diary entries={entries} fetchDiaries={fetchDiaries} loading={loading} error={error}/>
            )}
          </div>
        </div>
    )
  }