import EntryList from './diary/EntryList'
import AddDiaryButton from './diary/AddDiaryButton'
import Logout from './auth/logoutButton'
import Filters from './diary/Filters'
import { auth } from '../firebase';
import { useEffect, useState } from 'react'
import SettingsModal from './SettingsModal';
import { FiSettings } from 'react-icons/fi';
import FriendModal from "./FriendModal";

export default function Dashboard() {

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [cuisineFilters, setCuisineFilters] = useState([])
  const [labelFilters, setLabelFilters] = useState([])
  const [priceFilters, setPriceFilters] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [viewingFriendId, setViewingFriendId] = useState(null);


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


    return (
      <div>
        <input type="text" placeholder="Search Entries" value={search} onChange={e => handleSearch(e.target.value)}/>
        <Filters handleCuisineFilter={handleCuisineFilter} handleLabelFilter={handleLabelFilter} handlePriceFilter={handlePriceFilter}/>
        <AddDiaryButton fetchDiaries={fetchDiaries} />
        <EntryList entries={entries} loading={loading}  error={error} search={search} cuisineFilters={cuisineFilters} priceFilters={priceFilters} labelFilters={labelFilters} fetchDiaries={fetchDiaries}/>
        <Logout/>

        {/* Settings icon in the bottom left right corner*/}
        <button
          onClick={() => setSettingsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            padding: '10px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <FiSettings size={24} />
        </button>

        {/* Settings Modal */}
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

        {/* Friend icon in the top right corner*/}
        <button
          onClick={() => setFriendModalOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            padding: '10px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          👤
        </button>
    
        {/* Friend Modal */}
        {friendModalOpen && (
          <FriendModal
            onClose={() => setFriendModalOpen(false)}
            onSelectFriend={(friendId) => {
              setViewingFriendId(friendId);
              setFriendModalOpen(false);
              fetchFriendDiaries(friendId);
            }}
          />
        )}

      </div>
    )
  }