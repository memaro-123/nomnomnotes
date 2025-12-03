import { useState } from 'react'
import { StarIcon, StarHalfIcon } from "@phosphor-icons/react";

export default function StarRating({ value, onChange, size = 32, write = true }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (e, starIndex) => {
        if (!write) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const isLeftHalf = x < width / 2;
        
        const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        setHoverRating(newRating);
    };

    const handleMouseLeave = () => {
        if (!write) return;
        setHoverRating(0);
    };

    const handleClick = (e, starIndex) => {
        if(!write) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const isLeftHalf = x < width / 2;
        
        const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        onChange(newRating);
    };

    const getStarDisplay = (starIndex) => {
        const displayRating = hoverRating || value;
        
        if (displayRating >= starIndex + 1) {
          return 'full';
        } else if (displayRating > starIndex && displayRating < starIndex + 1) {
          return 'half';
        }
        return 'empty';
    };

    return(
        <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((starIndex) => {
                const display = getStarDisplay(starIndex);

                return (
                    <button
                        key={starIndex}
                        onMouseMove={(e) => handleMouseMove(e, starIndex)}
                        onMouseLeave={(handleMouseLeave)}
                        onClick={(e) => handleClick(e, starIndex)}
                    >
                        {display === 'full' ? (
                            <div className="text-amber-400"><StarIcon size={size} weight={'fill'}/></div>
                        ) : display === 'half' ? (
                            <div className="text-amber-400"><StarHalfIcon size={size} weight={'fill'}/></div>
                        ) : (
                            <div className="text-gray-400"><StarIcon size={size}/></div>
                        )}
                    </button>
                )
            })}
        
        </div>
    )
}