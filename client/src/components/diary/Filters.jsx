import { useState } from 'react'
import { SlidersHorizontalIcon } from "@phosphor-icons/react";

export default function Filters({ handleCuisineFilter, handleLabelFilter, handlePriceFilter }) {
    const [open, setOpen] = useState(false)

    const cuisines = ['Chinese', 'Indian', 'Italian', 'Mexican', 'Japanese']
    const prices = ['$', '$$', '$$$', '$$$$']
    const labels = ['breakfast', 'lunch', 'dinner', 'cash-only', 'apple pay']

    return(
        <div>
            <button 
            className="bg-black text-white p-1 rounded-sm hover:cursor-pointer"
            onClick={() => setOpen(true)}><SlidersHorizontalIcon size={16}/></button>
            {open && 
                <div>
                    All Filters
                    <button onClick={() => setOpen(false)}>x</button>
                    Cuisines
                    <div>
                        {cuisines.map((cuisine ,i) => {
                            return(<button onClick={() => handleCuisineFilter(cuisine)} key={i}>{cuisine}</button>)
                        })}
                    </div>
                    Prices
                    <div>
                        {prices.map((price ,i) => {
                            return(<button onClick={() => handlePriceFilter(price)} key={i}>{price}</button>)
                        })}
                    </div>
                    Labels
                    <div>
                        {labels.map((label ,i) => {
                            return(<button onClick={() => handleLabelFilter(label)} key={i}>{label}</button>)
                        })}
                    </div>
                </div>
            }
        </div>
    )
}