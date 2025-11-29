

export default function Entry({ entry }) {
    return ( 
    <div className="hidden md:block md:w-1/2 md:h-[calc(100vh-170px)] shadow-md flex-shrink-0 relative" >
        <img className="w-full h-full pointer-events-none z-[-1]"
            src="paper.png" alt="lined paper" />
        <div className="absolute inset-0 p-6 left-7">
            {entry ? (<div>{entry.title}</div>) :(<div>no entries</div>)}
        </div>
    </div>
    )
}