import { MapPinIcon } from "@phosphor-icons/react";

export default function ExploreButton({ setActiveView }) {
    return(
        <button onClick={() => setActiveView('explore')}
            className="p-2 md:px-4 md:py-1 bg-black text-white text-sm rounded-md hover:cursor-pointer hover:bg-gray-800">
            <MapPinIcon size={15} weight={"fill"} className="md:hidden"/>
            <span className="hidden md:block">explore</span>
        </button>
    )
}