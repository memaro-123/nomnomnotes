import { useState } from 'react'
import DeleteDiaryButton from './DeleteDiaryButton'
import EditDiaryButton from './EditDiaryButton'
import AddDiaryButton from './AddDiaryButton'
import Entry from './Entry'
import { CircleNotchIcon, BugIcon } from "@phosphor-icons/react";

export default function EntryList({ entries, loading, error, search, cuisineFilters, priceFilters, labelFilters, fetchDiaries, isReadOnly}) {
    const [openEntry, setOpenEntry] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState(null)
    const [openOptionsId, setOpenOptionsId] = useState(null)

    const handleCloseEntry = () => {
        setOpenEntry(prev => !prev)
        setSelectedEntry(null)
    }

    const handleCloseOptions = () => {
        setOpenOptionsId(null)
    }

    if (loading) {
        return(
            <div className="flex items-center justify-center h-full text-gray-500">
                <CircleNotchIcon size={32} className="animate-spin"/>
            </div>
        )
    }

    if (error) {
        return(
            <div className="border-1 rounded-md flex gap-2 items-center justify-center h-full flex-col text-red-500 font-bold">
                <BugIcon size={32}/>
                <span>error fetching entries</span>
                <span>please refresh the page</span>
            </div>
        )
    }

    return (
        <div className="w-full md:h-[calc(100vh-280px)] overflow-y-auto">
            {entries.length <= 0 ? (
                <div className="flex flex-col gap-2 items-center justify-center h-full">
                    <span className="font-semibold">no entries yet... let's fix that!</span>
                    <AddDiaryButton fetchDiaries={fetchDiaries}/>
                </div>
            ) : (
                <div className="w-full h-full border-1">
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
                        entry.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(entry => {
                        return(
                            <div key={entry.id} className="">
                                <button key={entry.id} onClick={() => {setOpenEntry(true); setSelectedEntry(entry);}}>
                                    {entry.title}
                                </button>
                                
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
            )}
        </div>
    )
}