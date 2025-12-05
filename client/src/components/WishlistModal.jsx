import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { CircleNotchIcon, StarIcon, TrashIcon } from "@phosphor-icons/react";
import ExploreButton from "./explore/ExploreButton";


export default function WishlistModal({ wishlist, setWishlist, setActiveView }) {
  const [loading, setLoading] = useState(true);

  // Stop showing loading once the wishlist is received from Dashboard
  useEffect(() => {
    setLoading(false);
  }, [wishlist]);

  const removeItem = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8080/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWishlist(wishlist.filter((i) => i.id !== id));
      } else {
        console.error("Failed to delete wishlist item");
      }
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  if (loading) {
    return (
    <div className="p-5 border-1 w-full h-full flex items-center justify-center text-gray-500">
      <CircleNotchIcon size={32} className="animate-spin" />
    </div>)
  }

  return (
    <div className="p-5 w-full h-full flex flex-col gap-3">

      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center justify-center">
          <StarIcon size={20}/> <StarIcon size={20}/>
          <h1 className="font-pacifico text-xl">wishlist</h1> <StarIcon size={20}/> <StarIcon size={20}/>
        </div>
        <hr className="border-t-3 border-gray-300 border-dotted"/>
      </div>

      {wishlist.length === 0 ? ( 
        <div className="h-full w-full border-2 border-gray-300 rounded-md flex gap-2 items-center justify-center flex-col">
          <span>wishlist empty...</span><span>explore nearby spots!</span><ExploreButton setActiveView={setActiveView}/>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col gap-2 overflow-y-auto pl-4" style={{ direction: 'rtl' }}>
        {wishlist.map((i) => (
          <div
            key={i.id}
            className="p-2 flex items-center justify-between border-2 border-gray-300 rounded-md"
            style={{ direction: 'ltr' }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{i.name}</div>
              <div>Rating: {i.rating || "—"}</div>
            </div>
            <button 
            className="hover:cursor-pointer hover:bg-gray-200 rounded-md transition-all p-2"
            onClick={() => removeItem(i.id)}><TrashIcon size={20} weight={'fill'}/></button>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}