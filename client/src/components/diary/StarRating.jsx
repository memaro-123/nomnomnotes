import { useState } from 'react'
import { StarIcon, StarHalfIcon } from "@phosphor-icons/react";

export default function StarRating({ value, onChange}) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (e, starIndex) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const isLeftHalf = x < width / 2;
        
        const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        setHoverRating(newRating);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (e, starIndex) => {
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
        <div>
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
                            <StarIcon size={16} weight={'fill'}/>
                        ) : display === 'half' ? (
                            <div>
                                <StarHalfIcon size={16} weight={'fill'}/>
                            </div>
                        ) : (
                            <StarIcon size={16}/>
                        )}
                    </button>
                )
            })}
        
        </div>
    )
}