import { CircleNotchIcon, CheckIcon, StarIcon, XIcon } from "@phosphor-icons/react";

export default function ExplorerList({
    placesList,
    placesLoading,
    wishlist,
    addToWishlist,
    rejectPlace,
    onPlaceClick,
  }) {

    if (placesLoading) {
        return(
            <div className="flex items-center justify-center h-full w-full text-gray-500 flex-col">
                <CircleNotchIcon size={32} className="animate-spin" />
                <span>loading feed...</span>
            </div>
        )
    }

    return (
      <div className="flex flex-col w-full h-full overflow-y-auto pl-4" style={{ direction: 'rtl' }}>
      <div className="flex flex-col gap-2 w-full h-full" style={{ direction: 'ltr' }}>
        {!placesLoading &&
          placesList.map((place) => {
            const alreadyInWishlist = wishlist.some((i) => i.id === place.place_id);
            return (
              <div key={place.place_id} 
              className="flex gap-5 border-2 border-gray-300 rounded-md p-3 items-center justify-start w-full"
              onClick={() => onPlaceClick(place)}>

                {/* Image */}
                {place.photos && place.photos[0] && (
                  <img
                    className="w-[106px] h-[106px] object-cover rounded-md shrink-0"
                    src={place.photos[0].getUrl()}
                    alt={place.name}
                  />
                )}

                <div className="flex-1">
                  <div className="font-bold">{place.name}</div>
                  <div className="text-sm text-gray-600">
                    {place.vicinity || place.formatted_address}
                  </div>
                  <div className="text-sm">
                    Rating: {place.rating || "—"} •{" "}
                    {Array(place.price_level || 0).fill("$").join("")}
                  </div>
                  <div className="flex gap-2 mt-2 items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => rejectPlace(place.place_id)}
                      className="flex items-center justify-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <XIcon size={15} weight={'bold'}/> pass
                    </button>
                    <button
                      onClick={() => addToWishlist(place)}
                      disabled={alreadyInWishlist}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      {alreadyInWishlist ? (<div className="flex items-center justify-center gap-2"><CheckIcon/><span>in wishlist</span></div>) : (<div className="flex items-center justify-center gap-2"><StarIcon/><span>save</span></div>)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      </div>
    );
  }