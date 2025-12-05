import { MagnifyingGlassIcon, SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";
import { useState } from 'react';
import { cuisines, labels, prices } from '../../utils/tags';

export default function Filters({ 
    handleCuisineFilter, handleLabelFilter, handlePriceFilter,
    cuisineFilters, labelFilters, priceFilters, openFilter, setOpenFilter
}) {
    const [searchCuisine, setSearchCuisine] = useState('')
    const [searchLabel, setSearchLabel] = useState('')

    return(
        <div
        className={`
            fixed left-5 top-5 z-40
            h-[calc(100vh-40px)] bg-white pl-3
            w-[300px] rounded-md shadow-md border border-gray-300
            transform transition-transform duration-300 ease-in-out
            ${openFilter ? 'translate-x-0 pointer-events-auto opacity-100' : '-translate-x-full pointer-events-none opacity-0'}
        `}
        aria-hidden={!openFilter}
        >
            <div className="bg-white rounded-2xl flex flex-col p-8 gap-5 items-start justify-center max-w-lg">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center justify-start gap-2">
                        <SlidersHorizontalIcon size={45}/>
                        <span className="font-pacifico text-3xl">filters</span>
                    </div>
                    <button className="hover:bg-gray-200 transition-all p-2 rounded-full"onClick={() => setOpenFilter(false)}><XIcon/></button>
                </div>

                <div className="flex flex-col gap-1">
                    <span>price</span>
                    <div className="flex gap-2">
                        {prices.map((p, i) => (
                            <button 
                                className={`transition-all py-1 px-2 rounded-md hover:cursor-pointer border-1 border-gray-300 ${priceFilters.includes(p) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
                                key={i} 
                                onClick={() => handlePriceFilter(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 w-full h-full">
                    <span>cuisines</span>
                    <div className="flex items-center justify-start gap-1 border-1 border-solid rounded-md w-full p-1 focus-within:shadow-lg transition-shadow">
                        <MagnifyingGlassIcon size={16}/>
                        <input 
                        className="focus:outline-none"
                        type="text" placeholder="search cuisines" value={searchCuisine} onChange={e => setSearchCuisine(e.target.value)}/>
                    </div>
                    <div className="flex flex-wrap gap-1 h-[150px] overflow-y-auto">
                        {cuisines
                        .filter(c =>
                            c.toLowerCase().includes(searchCuisine.toLowerCase())
                        )
                        .map((c, i) => (
                            <button 
                                className={`transition-all border-1 border-gray-300 py-1 px-2 rounded-md hover:cursor-pointer h-auto self-start ${cuisineFilters.includes(c) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
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
                    <div className="flex flex-wrap gap-1 h-[150px] overflow-y-auto">
                        {labels
                        .filter(l =>
                            l.toLowerCase().includes(searchLabel.toLowerCase())
                        )
                        .map((l, i) => (
                            <button 
                            className={`transition-all border-1 border-gray-300 py-1 px-2 rounded-md hover:cursor-pointer h-auto self-start ${labelFilters.includes(l) ? 'bg-black text-white' : 'hover:bg-gray-400 hover:text-white'}`}
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
    )
}