import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function WishlistModal({ onClose, wishlist, setWishlist }) {
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "400px",
          maxHeight: "80vh",
          background: "#fff",
          borderRadius: 12,
          overflowY: "auto",
          padding: 16,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <h3>Wishlist</h3>
        {loading && <p>Loading wishlist...</p>}
        {!loading && wishlist.length === 0 && <p>No items in wishlist</p>}
        {!loading &&
          wishlist.map((i) => (
            <div
              key={i.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{i.name}</div>
                <div>Rating: {i.rating || "—"}</div>
              </div>
              <button onClick={() => removeItem(i.id)}>Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
}