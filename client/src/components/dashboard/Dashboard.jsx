import { HouseIcon, MapPinIcon, ChartLineIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import ChooseUsername from "../ChooseUsername";
import AddDiaryButton from '../diary/AddDiaryButton';
import ExplorerModal from "../explore/ExplorerModal.jsx";
import Filters from './Filters';
import WishlistModal from "../WishlistModal.jsx";
import BiteBack from './BiteBack';
import Diary from './Diary';
import Sidebar from './Sidebar';
import ExploreButton from "../explore/ExploreButton.jsx";


export default function Dashboard() {

  const [loading, setLoading] = useState()
  const [error, setError] = useState(null)
  const [entries, setEntries] = useState([])

  const [viewingFriendId, setViewingFriendId] = useState(null);
  const [activeView, setActiveView] = useState('diary'); 
  const [myUsername, setMyUsername] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false)
  const [friendUsername, setFriendUsername] = useState("");
  const [openFilter, setOpenFilter] = useState(false)

  const [cuisineFilters, setCuisineFilters] = useState([])
  const [labelFilters, setLabelFilters] = useState([])
  const [priceFilters, setPriceFilters] = useState([])

  const handleCuisineFilter = (filter) => {
    setCuisineFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handleLabelFilter = (filter) => {
    setLabelFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handlePriceFilter = (filter) => {
    setPriceFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }
  
  const onSelectFriend = async (friendID) => {
    try {
      await fetchFriendDiaries(friendID)
      setViewingFriendId(friendID)
      setActiveView('diary')
      console.log(`LOOKING AT ${friendID}`)
    } catch(error) {
      console.log(error)
    }
  }

    const fetchDiaries = useCallback(async () => {
      setLoading(true)
      try {
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
            setViewingFriendId("")
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false);
      }
    }, [setLoading, setEntries, setError]);

    const fetchUsername = async (stateSetter, id) => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`http://localhost:8080/api/user/getUsername?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!res.ok) throw new Error("Failed to fetch username");
  
        const data = await res.json();
        stateSetter(data.username);
      } catch (err) {
        console.error("Failed to fetch my username", err);
        stateSetter(`user_${id.substring(0, 5)}`);
      }
    };

    useEffect(() => {
      if (!viewingFriendId) {
      setFriendUsername("")
      return
      }
      fetchUsername(setFriendUsername, viewingFriendId);
    }, [viewingFriendId]);

    useEffect(() => {
      const id =auth.currentUser.uid
      fetchUsername(setMyUsername, id)
    }, [])


    const fetchFriendDiaries = async (friendId) => {
      setLoading(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`http://localhost:8080/api/diary/friend/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Marking all entries as not owned so that they are read-only
        const entriesWithOwnership = data.diaryData.map(e => ({ ...e, isOwner: false }));
        setEntries(entriesWithOwnership);
        return data;
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    return (
        <div className="w-screen h-screen flex gap-5 p-5">

          {myUsername === 'defaultUsername' && <ChooseUsername handleUsername={setMyUsername}/>}

          {/* friends */}
          {/* <div className="hidden lg:block lg:flex flex-col w-1/4 h-full gap-2"> */}
            {/* <div className=" flex items-center justify-between w-full px-5 py-2 border-2 border-gray-300 rounded-md shadow-md">
              <span className="text-lg font-bold">nomnom notes</span>
              <SettingsButton myUsername={myUsername} handleUsername={handleUsername}/>
            </div> */}
              <Sidebar onSelectFriend={onSelectFriend} openSidebar={openSidebar} 
              myUsername={myUsername} setUsername={setMyUsername} setOpenSidebar={setOpenSidebar}
              wishlist={wishlist} setWishlist={setWishlist} setActiveView={setActiveView}/>

              <Filters handleCuisineFilter={handleCuisineFilter} handleLabelFilter={handleLabelFilter}
              handlePriceFilter={handlePriceFilter} openFilter={openFilter} setOpenFilter={setOpenFilter}
              cuisineFilters={cuisineFilters} labelFilters={labelFilters} priceFilters={priceFilters}/>
              {/* <FriendModal onSelectFriend={onSelectFriend}/> */}
          {/* </div> */}

          {/* diary part */}
          <div className="w-full h-full max-h-full flex flex-col gap-3">

            {/* diary header */}
            <div className="flex flex-col gap-2 pt-3">
              <div className="w-full flex items-center justify-between">

                <div className="flex items-center justify-center gap-3">
                  <div className="lg:hidden hover:cursor-pointer hover:bg-gray-200 p-2 rounded-md transition-all">
                    <CaretRightIcon size={22} weight={'bold'} onClick={() => setOpenSidebar(true)}/>
                  </div>
                  <button className="hover:cursor-pointer hover:bg-gray-200 p-2 rounded-md transition-all" onClick={() => {setActiveView('diary'); setViewingFriendId(null); fetchDiaries();}}><HouseIcon size={22} weight={'fill'}/></button>
                {activeView === 'diary' ? (
                  <span className="text-24 font-bold">{viewingFriendId && friendUsername ? (`${friendUsername}'s diary`) : ('my diary')}</span>
                ) : activeView === 'biteback' ? (
                  <span className="text-24 font-bold">{viewingFriendId ? (`${friendUsername}'s diary`) : 'my biteback'}</span>
                ) : (
                  <span className="text-24 font-bold">my map</span>
                )}
                </div>

                <div className="flex gap-3">
                  {!viewingFriendId && <ExploreButton setActiveView={setActiveView}/>}

                  {!viewingFriendId && <button onClick={() => setActiveView('biteback')} 
                  className="bg-black hover:bg-gray-800 transition-all text-white p-2 md:px-4 md:py-1 rounded-md text-sm hover:cursor-pointer">
                    <ChartLineIcon size={15} weight={"bold"} className="md:hidden"/>
                    <span className="hidden md:block">biteback</span>
                   </button>}
                  {!viewingFriendId && <AddDiaryButton fetchDiaries={fetchDiaries} />}
                </div>

              </div>
              <hr className="border-t-3 border-gray-300 border-dotted"/>
            </div>

            {/* only diary or biteback */}
            {activeView === 'biteback' ? (
              <BiteBack />
            ) : activeView === 'diary' ? ( 
              <Diary entries={entries} fetchDiaries={fetchDiaries} fetchFriendDiaries ={fetchFriendDiaries} 
              loading={loading} error={error} viewingFriendId={viewingFriendId} cuisineFilters={cuisineFilters} labelFilters={labelFilters}
              priceFilters={priceFilters} setOpenFilter={setOpenFilter}/>
            ) : (
              <ExplorerModal wishlist={wishlist} setWishlist={setWishlist}/>
            )}
          </div>
{/*           
          {explorerOpen && (
            <ExplorerModal onClose={() => setExplorerOpen(false)} wishlist={wishlist} setWishlist={setWishlist}/>
          )} */}

          {wishlistOpen && (
            <WishlistModal onClose={() => setWishlistOpen(false)} wishlist={wishlist} setWishlist={setWishlist}/>
          )}
        </div>
    )
  }