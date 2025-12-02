import { MapPinIcon, StarIcon } from "@phosphor-icons/react";
import StarRating from "./StarRating";

export default function Entry({ entry }) {

    const lineHeight = 25; // pixels per line
    const numberOfLines = Math.ceil(window.innerHeight / lineHeight)

    return ( 
    <div className="hidden md:block md:w-3/5 md:h-[calc(100vh-100px)] shadow-md shrink-0 relative overflow-hidden" >
        {/* <img className="w-full h-full pointer-events-none object-cover object-center"
            src="paper.png" alt="lined paper" /> */}

            <div className="relative w-full h-full bg-gray-100">
            {/* Red vertical line */}
                <div className="absolute left-15 top-0 bottom-0 w-0.5 bg-red-400"></div>
                
                {/* Blue horizontal lines */}
                <div className="absolute inset-0">
                    {[...Array(numberOfLines)].map((_, i) => (
                    <div 
                        key={i} 
                        className="border-b border-blue-400"
                        style={{ height: `${lineHeight}px` }}
                    ></div>
                    ))}
                </div>
            </div>

        <div className="absolute inset-0 p-5 left-15 flex items-start justify-start flex-col overflow-y-auto">
            {/* this is the image container should scroll horizontal */}
            <div className="flex gap-3 overflow-x-auto w-full shrink-0">
                {entry.images.map((image, i) => {
                    return(
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
            <div className="flex flex-col justify-start gap-[2px] mt-[26px]">
                <span className="text-2xl font-bold">{entry.title}</span>
                <div className="flex items-start justify-center gap-2">
                    <span className="md:text-xs">
                    {entry.date}
                    </span>
                    <div className="flex items-start justify-center gap-1">
                        <MapPinIcon size={15} weight={'fill'}/>
                        <span className="text-xs text-left">{entry.location.name}</span>
                    </div>
                </div>
            </div>
            
            {/* notes */}
            {entry.notes.length > 0 &&
            <div className="mt-[30px] h-[125px] overflow-y-auto shrink-0"  
            style={{ lineHeight: `${lineHeight}px` }}>
                {entry.notes}
            </div>
            }

            {/* this is for rating and tags */}
            <div className="flex-col lg:flex-row flex mt-[25px] items-start justify-center gap-5">
                {/* rating */}

                {/* overall rating */}
                <div className="flex items-center justify-center">
                <div className="flex h-full w-full items-center justify-center">
                    <div className={`relative flex items-center justify-center ${entry.taste && entry.service && entry.value ? "text-amber-400" : "text-gray-400"}`}>
                        <StarIcon size={150} weight={'fill'}/>
                        <span className="absolute text-2xl text-center text-white font-semibold">
                            {entry.taste && entry.value && entry.service ? ((entry.taste + entry.value + entry.service) / 3).toFixed(2) : '--'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex flex-col items-center justify-center">
                        <span>taste</span>
                        <StarRating
                        value={entry.taste}
                        size={20}
                        write={false}
                        />
                    </div>
    
                    <div className="flex flex-col items-center justify-center mt-1">
                        <span>service</span>
                        <StarRating
                        value={entry.taste}
                        size={20}
                        write={false}
                        />
                    </div>
    
                    <div className="flex flex-col items-center justify-center mt-1">
                        <span>value</span>
                        <StarRating
                        value={entry.taste}
                        size={20}
                        write={false}
                        />
                    </div>
                </div>
                </div>

                {/* this is tags */}
                {entry.selectedCuisines > 0 || entry.selectedLabels > 0 || entry.selectedPrices && 
                    <div className="flex flex-col items-center justify-center">
                        <span className="font-semibold">tags</span>
                        <div className="flex flex-wrap items-center justify-center">
                            {entry.selectedCuisines
                                .map((c) => {
                                    return(<div className="px-2 py-1 bg-black text-white m-2 rounded-md">{c}</div>)
                                })
                            }
                            <div className="px-2 py-1 bg-black text-white m-2 rounded-md">{entry.selectedPrices}</div>
                            {entry.selectedLabels   
                                .map((l) => {
                                    return(<div className="px-2 py-1 bg-black text-white m-2 rounded-md">{l}</div>)
                                })
                            }
                        </div>
                    </div>
                }

        </div>
        </div>
    </div>
    )
}