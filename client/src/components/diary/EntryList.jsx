import { useState, useEffect } from 'react'
import DeleteDiaryButton from './DeleteDiaryButton'
import EditDiaryButton from './EditDiaryButton'
import AddDiaryButton from './AddDiaryButton'
import { CircleNotchIcon, BugIcon, MapPinIcon, DotsThreeVerticalIcon } from "@phosphor-icons/react";

export default function EntryList({ selectedEntry, handleSelectEntry, entries, loading, error, search, cuisineFilters, priceFilters, labelFilters, fetchDiaries, isReadOnly}) {
    const [openOptionsId, setOpenOptionsId] = useState(null)

    const handleCloseOptions = () => {
        setOpenOptionsId(null)
    }

    useEffect(() => {
        console.log('opening options:', { isOpen: selectedEntry?.id === openOptionsId });
    }, [openOptionsId, selectedEntry]);

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
        <div className="w-full h-[calc(100vh-220px)] overflow-y-auto pl-4" style={{ direction: 'rtl' }}>
            {entries.length <= 0 ? (
                <div className="flex flex-col gap-2 items-center justify-center h-full " style={{ direction: 'ltr' }}>
                    <span className="font-semibold">no entries yet... let's fix that!</span>
                    <AddDiaryButton fetchDiaries={fetchDiaries}/>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col gap-2" style={{ direction: 'ltr' }}>
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
                            <div key={entry.id} className="flex">
                                {/* this is the main button */}
                                <div className={` flex items-start justify-between flex-1 border-2 h-[135px] rounded-md p-2 min-w-0 w-full
                                    ${selectedEntry && selectedEntry.id === entry.id ? 'border-black' : 'border-gray-300'}`}>
                                    <button 
                                    key={entry.id} 
                                    onClick={() => handleSelectEntry(entry)}
                                    className="flex-1 flex items-center justify-start gap-5 h-full overflow-hidden hover:cursor-pointer">
                                            {entry.images.length > 0 && <img 
                                            src={entry.images[0]}
                                            alt="entry thumbnail"
                                            className="w-[106px] h-[106px] object-cover rounded-md shrink-0"
                                            />}
                                            {entry.images.length === 0 && 
                                            <div className="w-[106px] h-[106px] bg-gray-200 flex items-center justify-center rounded-md shrink-0"><span className="font-pacifico text-white text-3xl">N</span></div>}
                                            <div className="flex flex-col justify-between w-full h-full">
                                                <div className="flex flex-col items-start justify-center gap-1">
                                                    <span className="flex-wrap text-left font-semibold text-xl">{entry.title}</span>
                                                    <div className="flex items-center justify-start gap-2">
                                                        <span className="md:text-xs">
                                                        {entry.date}
                                                        </span>
                                                        <div className="flex items-center justify-start gap-1 min-w-0 shrink">
                                                            <MapPinIcon size={15} weight={'fill'}/>
                                                            <span 
                                                            title={entry.location.name}
                                                            className="text-xs text-left truncate overflow-hidden min-w-0">
                                                                {entry.location.name}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className='flex w-full items-center justify-end text-3xl font-bold'>
                                                    {((entry.taste + entry.value + entry.service) / 3).toFixed(2)} / 5
                                                </span>
                                            </div>
                                    </button>
                                    
                                    {/* options button */}
                                    {!isReadOnly && (
                                        <button onClick={() => setOpenOptionsId((prevId) => (prevId === entry.id ? null : entry.id))}><DotsThreeVerticalIcon size={20}/></button>
                                    )}
                                </div>

                                {/* options */}
                                {entry.id === openOptionsId && 
                                <div className="w-1/4 flex flex-col px-1 items-center justify-stretch shrink-0">
                                    <EditDiaryButton entry={entry} handleCloseOptions={handleCloseOptions} fetchDiaries={fetchDiaries}  />
                                    <DeleteDiaryButton entry={entry} handleCloseOptions={handleCloseOptions} fetchDiaries={fetchDiaries} />
                                </div>}
                            
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}