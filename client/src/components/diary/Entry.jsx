import { MapPinIcon} from "@phosphor-icons/react";
import { useEffect, useState } from 'react';

export default function Entry({ entry }) {

    return ( 
    <div className="hidden md:block md:w-3/5 md:h-[calc(100vh-100px)] shadow-md flex-shrink-0 relative" >
        <img className="w-full h-full pointer-events-none"
            src="paper.png" alt="lined paper" />
        <div className="absolute inset-0 p-6 left-[9%] flex items-start justify-start flex-col">
            {/* this is the image container should scroll horizontal */}
            <div className="flex gap-3">
                {entry.images.map((image, i) => {
                    return(
                        // this is the image card
                        <img 
                        key={i}
                        src={image}
                        alt='diary entry image'
                        className="h-[250px] w-auto rounded-md shadow-md "
                        />
                    )
                })}
            </div>

            {/* this is title, date, and location should be col*/}
            <div>
                <span>{entry.title}</span>
                <span className="md:text-xs">
                {entry.date}
                </span>
                <div>
                    <MapPinIcon size={15} weight={'fill'}/>
                    <span 
                    title={entry.location.name}>
                        {entry.location.name}
                    </span>
                </div>
            </div>
            
            {/* notes */}
            <div>
                {entry.notes}
            </div>

            {/* this is for rating and tags */}
            <div>
                {/* rating */}
                <div>
                    <span>rating</span>
                    <div> 
                    <span>{((entry.taste + entry.value + entry.service) / 3).toFixed(2)} / 5</span>
                    </div>
                </div>

                {/* this is tags */}
                <div>
                    hi
                </div>
            </div>

        </div>
    </div>
    )
}