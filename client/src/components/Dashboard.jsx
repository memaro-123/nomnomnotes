import EntryList from './diary/EntryList'
import AddDiaryButton from './diary/AddDiaryButton'
import Filters from './diary/Filters'
import { auth } from '../firebase';
import { useEffect, useState } from 'react'
import SettingsModal from './SettingsModal';
import FriendModal from "./FriendModal";
import Entry from './diary/Entry'
import { GiftIcon, HouseIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { toast } from 'react-hot-toast';
import Wrapped from './Wrapped';

export default function Dashboard() {

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState()
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [cuisineFilters, setCuisineFilters] = useState([])
  const [labelFilters, setLabelFilters] = useState([])
  const [priceFilters, setPriceFilters] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewingFriendId, setViewingFriendId] = useState(null);
  const [activeView, setActiveView] = useState('diary'); // or wrapped i think


    const fetchDiaries = async () => {
      setLoading(true)
      try {
        auth.onAuthStateChanged(async (user) => { 
            //change this later so that you can pass the uid into the entrylist to change who's list ur viewing!!
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
        })
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (entries.length > 0) {
        setSelectedEntry(entries?.[0])
      } else {
        setSelectedEntry(null)
      }
    }, [entries])

    useEffect(() => {
      if (window.innerWidth < 800) {
        toast((t) => (
          <span className="flex items-center justify-center">
            🍳 expand the window to see your diary entry
            <button onClick={() => toast.dismiss(t.id)}>
              <XIcon/>
            </button>
          </span>
        ));
      }
    }, [])

    const handleSelectEntry = ( newEntry ) => {
      setSelectedEntry(newEntry)
    }

    useEffect(() => {console.log('selected:', selectedEntry)}, [selectedEntry])

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

    useEffect(() => {
      fetchDiaries();
    }, []);
    
    const handleSearch = (e) => {
      setSearch(e)
    }

    const handleCuisineFilter = (filter) => {
      setCuisineFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handleLabelFilter = (filter) => {
      setLabelFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }

    const handlePriceFilter = (filter) => {
      setPriceFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }
    
    useEffect(() => {
      console.log('cuisine:', cuisineFilters)
    })

    useEffect(() => {
      console.log('label:', labelFilters)
    })

    useEffect(() => {
      console.log('price:', priceFilters)
    })

    if (activeView === 'wrapped') {
    return (
      <div className="w-screen h-screen flex gap-5 p-5">
        {/* Friends sidebar */}
        <div className="hidden lg:block lg:flex flex-col w-1/4 h-full gap-2">
          <div className="flex items-center justify-between w-full px-5 py-2 border-2 border-gray-300 rounded-md shadow-md">
            <span className="text-lg font-bold">nomnom notes</span>
            <SettingsModal/>
          </div>
          <div className="w-full h-full border-2 border-gray-300 p-5 rounded-md shadow-md">
            <FriendModal/>
          </div>
        </div>

        {/* Wrapped content */}
        <div className="w-full h-full max-h-full flex flex-col gap-3">
          {/* Header */}
          <div className="flex flex-col gap-2 pt-3">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center justify-center gap-3">
                <div className="lg:hidden">
                  <SettingsModal/>
                </div>
                <button 
                  className="hover:cursor-pointer"
                  onClick={() => setActiveView('diary')}
                >
                  <HouseIcon size={28} weight={'fill'}/>
                </button>
                <span className="text-24 font-bold">my wrapped</span>
              </div>
              <button
                onClick={() => setActiveView('diary')}
                className="bg-black text-white px-4 py-1 rounded-md text-sm hover:cursor-pointer"
              >
                Back to Diary
              </button>
            </div>
            <hr className="border-t-3 border-gray-300 border-dotted"/>
          </div>

          {/* Wrapped Component */}
          <div className="flex-1 overflow-y-auto">
            <Wrapped />
          </div>
        </div>
      </div>
    );
  }
    

            // <div className="flex flex-col items-center justify-center w-screen h-screen p-5 gap-5">

          // <div className="h-screen w-screen flex gap-5 p-5">

          // {/* friends */}
          // <div className="flex flex-col">
          //   <div className="hidden md:block w-1/4 border-2 border-gray-300 p-5 rounded-md shadow-md">
          //     <FriendModal/>
          //   </div>
          // </div>


    return (
      // <div className="flex flex-col items-center justify-center w-screen h-screen p-5 gap-5">
      //   {/* header: settings, title, some emojis  */}

        <div className="w-screen h-screen flex gap-5 p-5">

          {/* friends */}
          <div className="hidden lg:block lg:flex flex-col w-1/4 h-full gap-2">
            <div className=" flex items-center justify-between w-full px-5 py-2 border-2 border-gray-300 rounded-md shadow-md">
              {/* <span className="text-xl">🐠 🥦 🍎</span> */}
              <span className="text-lg font-bold">nomnom notes</span>
              <SettingsModal/>
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
                    <SettingsModal/>
                  </div>
                  <button className="hover:cursor-pointer"><HouseIcon size={28} weight={'fill'}/></button>
                  <span className="text-24 font-bold">{viewingFriendId ? 'friend\'s diary' : 'my diary'}</span>
                  <button onClick={() => setActiveView('wrapped')} className="ml-4 px-4 py-2 bg-black text-white rounded-md text-sm hover:cursor-pointer text-white rounded-lg hover:opacity-90 flex items-center gap-2 transition-all">
                <GiftIcon size={18} weight="fill" /> BiteBack </button>
                </div>
                {!viewingFriendId && <AddDiaryButton fetchDiaries={fetchDiaries} />}
              </div>
              <hr className="border-t-3 border-gray-300 border-dotted"/>
            </div>

            <div className="flex items-center justify-center w-full h-full max-h-full gap-4">

              <div className="w-full flex flex-col flex-1 md:w-2/5 h-full gap-2">
                <span className="font-pacifico text-2xl">table of contents</span>
                {/* searching */}
                <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-full w-full px-2 py-1 focus-within:shadow-lg transition-shadow">
                  <MagnifyingGlassIcon size={16}/>
                  <input 
                  className="focus:outline-none w-full"
                  type="text" placeholder="search entries" value={search} onChange={e => handleSearch(e.target.value)}/>
                </div>

                {/* filters */}
                <div className="flex w-full items-center justify-between">
                  <span className="text-gray-500">sort by: recent *to do*</span>
                  <Filters handleCuisineFilter={handleCuisineFilter} handleLabelFilter={handleLabelFilter} handlePriceFilter={handlePriceFilter}/>
                </div>

                <EntryList selectedEntry={selectedEntry} handleSelectEntry={handleSelectEntry} entries={entries} loading={loading}  error={error} search={search} cuisineFilters={cuisineFilters} priceFilters={priceFilters} labelFilters={labelFilters} fetchDiaries={fetchDiaries}/>
              </div>

                <Entry entry={selectedEntry}/>
            </div>
          </div>
        </div>
    )
  }