import { useEffect, useState } from 'react'
import { auth } from '../../firebase'

import DeleteDiaryButton from './DeleteDiaryButton'
import EditDiaryButton from './EditDiaryButton'
import Entry from './Entry'

export default function EntryList() {
    const [entries, setEntries] = useState([])
    const [openEntry, setOpenEntry] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState(null)
    const [openOptionsId, setOpenOptionsId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    useEffect(() => {
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

    const handleCloseEntry = () => {
        setOpenEntry(prev => !prev)
        setSelectedEntry(null)
    }

    const handleCloseOptions = () => {
        setOpenOptionsId(null)
    }

    if (loading) {
    return(<div>Loading...</div>)
    }

    return (
        <div style={{border: '1px solid white'}}>
            <div>
                {entries.map(entry => {
                return(
                    <div key={entry.id}>
                        <button key={entry.id} onClick={() => {setOpenEntry(true); setSelectedEntry(entry);}}>{entry.name}</button>
                        <button onClick={() => setOpenOptionsId((prevId) => (prevId === entry.id ? null : entry.id))}>...</button>
                        {entry.id === openOptionsId && 
                            <div>
                                <EditDiaryButton entry={entry} handleCloseOptions={handleCloseOptions}/>
                                <DeleteDiaryButton entry={entry} handleCloseOptions={handleCloseOptions}/>
                            </div>
                        }
                    </div>
                )
                })}
            </div>
            {openEntry && <Entry handleCloseEntry={handleCloseEntry} entry={selectedEntry}/>}
            {error && <div>{error.message}</div>}
        </div>
    )
}