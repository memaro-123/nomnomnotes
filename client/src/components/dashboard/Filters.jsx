import { MagnifyingGlassIcon, SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";
import { useState } from 'react';
import { cuisines, labels, prices } from '../../utils/tags';

export default function Filters({ 
    handleCuisineFilter, handleLabelFilter, handlePriceFilter,
    cuisineFilters, labelFilters, priceFilters
}) {
    const [open, setOpen] = useState(false)
    const [searchCuisine, setSearchCuisine] = useState('')
    const [searchLabel, setSearchLabel] = useState('')

    return(
        <div>
            <button 
            className="bg-black text-white p-1 rounded-md hover:cursor-pointer"
            onClick={() => setOpen(true)}><SlidersHorizontalIcon size={16}/></button>
            {open && 
                <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/50 z-[1000]">
                    <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-start justify-center max-w-lg">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center justify-start gap-2">
                                <SlidersHorizontalIcon size={45}/>
                                <span className="font-pacifico text-3xl">filters</span>
                            </div>
                            <button onClick={() => setOpen(false)}><XIcon/></button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span>price</span>
                            <div className="flex gap-2">
                                {prices.map((p, i) => (
                                    <button 
                                        className={`py-1 px-2 rounded-md hover:cursor-pointer ${priceFilters.includes(p) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                                        key={i} 
                                        onClick={() => handlePriceFilter(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <span>cuisines</span>
                            <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-md w-full p-1 focus-within:shadow-lg transition-shadow">
                                <MagnifyingGlassIcon size={16}/>
                                <input 
                                className="focus:outline-none"
                                type="text" placeholder="search cuisines" value={searchCuisine} onChange={e => setSearchCuisine(e.target.value)}/>
                            </div>
                            <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto">
                                {cuisines
                                .filter(c =>
                                    c.toLowerCase().includes(searchCuisine.toLowerCase())
                                )
                                .map((c, i) => (
                                    <button 
                                        className={`py-1 px-2 rounded-md hover:cursor-pointer h-auto self-start ${cuisineFilters.includes(c) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                                        key={i} 
                                        onClick={() => handleCuisineFilter(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <span>labels</span>
                            <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-md w-full p-1 focus-within:shadow-lg transition-shadow">
                                <MagnifyingGlassIcon size={16}/>
                                <input 
                                className="focus:outline-none"
                                type="text" placeholder="search labels" value={searchLabel} onChange={e => setSearchLabel(e.target.value)}/>
                            </div>
                            <div className="flex flex-wrap gap-1 h-[100px] overflow-y-auto">
                                {labels
                                .filter(l =>
                                    l.toLowerCase().includes(searchLabel.toLowerCase())
                                )
                                .map((l, i) => (
                                    <button 
                                    className={`py-1 px-2 rounded-md hover:cursor-pointer h-auto self-start ${labelFilters.includes(l) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                                        key={i} 
                                        onClick={() => handleLabelFilter(l)}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}