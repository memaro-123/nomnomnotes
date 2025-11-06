import { useState, useEffect } from 'react'
import { auth } from '../firebase'

export default function EntryList() {
    const [entries, setEntries] = useState([])
    const [openEntry, setOpenEntry] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    useEffect(() => {
        const fetchDiaries = async () => {
            setLoading(true)
            try {
                auth.onAuthStateChanged(async (user) => {
                    const token = await user.getIdToken();

                    const fetchResponse = await fetch("http://localhost:8080/api/fetch-diaries", {
                        headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }});

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

        fetchDiaries();
    }, [])

    useEffect(() => {
        console.log('fetched entries in entry list', entries)
    }, [entries])

        if (loading) {
        return(<div>Loading...</div>)
        }

      return (
        <div style={{border: '1px solid white'}}>
            <div>
                {entries.map(entry => {
                return(
                    <button key={entry.id} onClick={() => setOpenEntry(prev => !prev)}>{entry.name}</button>
                )
                })}
            </div>
            {openEntry && <div>an entry</div>}
            {error && <div>{error.message}</div>}
        </div>
      )
}