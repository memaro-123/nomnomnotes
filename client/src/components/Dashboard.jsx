
import EntryList from './diary/EntryList'
import AddDiaryButton from './diary/AddDiaryButton'
import Logout from './auth/LogoutButton'
import Filters from './diary/Filters'
import { auth } from '../firebase';
import { useEffect, useState } from 'react'

export default function Dashboard() {

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [cuisineFilters, setCuisineFilters] = useState([])
  const [labelFilters, setLabelFilters] = useState([])
  const [priceFilters, setPriceFilters] = useState([])

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
      </div>
    )
  }