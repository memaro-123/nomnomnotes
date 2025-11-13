import { useEffect, useState } from 'react'
import DeleteDiaryButton from './DeleteDiaryButton'
import EditDiaryButton from './EditDiaryButton'
import Entry from './Entry'

export default function EntryList({ entries, loading, error }) {
    const [openEntry, setOpenEntry] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState(null)
    const [openOptionsId, setOpenOptionsId] = useState(null)

    

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