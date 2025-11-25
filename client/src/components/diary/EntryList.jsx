import { useEffect, useState } from 'react'
import DeleteDiaryButton from './DeleteDiaryButton'
import EditDiaryButton from './EditDiaryButton'
import Entry from './Entry'

export default function EntryList({ entries, loading, error, search, cuisineFilters, priceFilters, labelFilters, fetchDiaries, isReadOnly}) {
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
                {entries
                .filter(entry => {
                    if (labelFilters.length === 0) return true;
                    return labelFilters.some(filter => entry.selectedLabels.includes(filter));
                })
                .filter(entry => {
                    if (cuisineFilters.length === 0) return true;
                    return cuisineFilters.some(filter => entry.selectedCuisines.includes(filter));
                })
                .filter(entry => {
                    if (priceFilters.length === 0) return true; 
                    return priceFilters.includes(entry.selectedPrices);
                })
                .filter(entry =>
                    entry.name.toLowerCase().includes(search.toLowerCase())
                )
                .map(entry => {
                    return(
                        <div key={entry.id}>
                            <button key={entry.id} onClick={() => {setOpenEntry(true); setSelectedEntry(entry);}}>{entry.name}</button>
                            {entry.selectedCuisines.map((cuisine, i) => {
                                return(<div key={i}>{cuisine}</div>)
                            })}
                            {entry.selectedLabels.map((label, i) => {
                                return(<div key={i}>{label}</div>)
                            })}
                            {entry.selectedPrices}
                            
                            {!isReadOnly && (
                                <>
                                    <button onClick={() => setOpenOptionsId((prevId) => (prevId === entry.id ? null : entry.id))}>...</button>
                                    {entry.id === openOptionsId && 
                                        <div>
                                            <EditDiaryButton entry={entry} handleCloseOptions={handleCloseOptions} fetchDiaries={fetchDiaries}  />
                                            <DeleteDiaryButton entry={entry} handleCloseOptions={handleCloseOptions} fetchDiaries={fetchDiaries} />
                                        </div>
                                    }
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {openEntry && <Entry handleCloseEntry={handleCloseEntry} entry={selectedEntry} isReadOnly={isReadOnly} />}
            {error && <div>{error.message}</div>}
        </div>
    )
}