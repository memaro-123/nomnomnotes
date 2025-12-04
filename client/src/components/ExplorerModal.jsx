import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

export default function ExplorerModal({ onClose, wishlist, setWishlist }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [placesList, setPlacesList] = useState([]);
  const [visitedPlaceIds, setVisitedPlaceIds] = useState(new Set());
  const [center, setCenter] = useState(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);

  // Load visited places from server
  useEffect(() => {
    const loadVisited = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:8080/api/wishlist/visited-places", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setVisitedPlaceIds(new Set(data.visited || []));
    };

    loadVisited();
  }, []);

  // Load Google Maps using your utility
  useEffect(() => {
    loadGoogleMaps()
      .then(() => console.log("Google Maps loaded from utils"))
      .catch((err) => console.error("Failed loading Google Maps:", err));
  }, []);

  // Get user location
  useEffect(() => {
    const getUserLocation = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null)
        );
      });

    getUserLocation().then((pos) => {
      if (!pos) pos = { lat: 37.7749, lng: -122.4194 };
      setCenter(pos);
    });
  }, []);

  // Initialize map once center + Google Maps are ready
  useEffect(() => {
    if (!center) return;
    if (!window.google || !window.google.maps) return;
    if (!mapContainerRef.current) return;

    setMapLoaded(false);
    setPlacesLoading(true);

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 15,
    });

    mapRef.current = map;
    setMapLoaded(true);

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      { location: center, radius: 2000, type: "restaurant" },
      (results, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results
        ) {
          setPlacesLoading(false);
          return;
        }

        const filtered = results.filter(
          (r) => !visitedPlaceIds.has(r.place_id)
        );
        setPlacesList(filtered);
        setPlacesLoading(false);

        results.forEach((r) => {
          new window.google.maps.Marker({
            map,
            position: r.geometry.location,
            title: r.name,
          });
        });
      }
    );
  }, [center, visitedPlaceIds]);

  // Add to wishlist
  const addToWishlist = async (place) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    const res = await fetch("http://localhost:8080/api/wishlist/add", {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        place_id: place.place_id,
        name: place.name,
        rating: place.rating || null,
        price_level: place.price_level || null,
        types: place.types || [],
        }),
    });

        if (res.ok) {
            alert("Added to wishlist!");
            // update Dashboard's wishlist state
            setWishlist([
            ...wishlist,
            {
                id: place.place_id,
                name: place.name,
                rating: place.rating || null,
                price_level: place.price_level || null,
                types: place.types || [],
            },
            ]);
        }
    };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "80vw",
          height: "80vh",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Close button */}
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
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Map */}
        <div style={{ flex: 2, position: "relative" }}>
          {!mapLoaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#eee",
                zIndex: 1,
              }}
            >
              Loading map...
            </div>
          )}
          <div ref={mapContainerRef} style={{ flex: 1, height: "100%" }} />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <h3>Nearby Restaurants</h3>

          {placesLoading && <p>Fetching restaurants...</p>}

          {!placesLoading &&
            placesList.map((place) => (
              <div
                key={place.place_id}
                style={{
                  marginBottom: 12,
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>{place.name}</div>
                <div>{place.vicinity || place.formatted_address}</div>
                <div>
                  Rating: {place.rating || "—"} •{" "}
                  {Array(place.price_level || 0).fill("$").join("")}
                </div>

                <button onClick={() => addToWishlist(place)}>
                  + Add to wishlist
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}