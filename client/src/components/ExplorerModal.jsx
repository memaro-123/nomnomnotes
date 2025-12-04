import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

export default function ExplorerModal({ onClose, wishlist, setWishlist }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [placesList, setPlacesList] = useState([]);
  const [visitedPlaceIds, setVisitedPlaceIds] = useState(new Set());
  const [center, setCenter] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);

  useEffect(() => {
    const loadVisited = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(
        "http://localhost:8080/api/wishlist/visited-places",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setVisitedPlaceIds(new Set(data.visited || []));
    };
    loadVisited();
  }, []);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => console.log("Google Maps loaded from utils"))
      .catch((err) => console.error("Failed loading Google Maps:", err));
  }, []);

  useEffect(() => {
    const getUserLocation = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null)
        );
      });
    getUserLocation().then((pos) => {
      if (!pos) pos = { lat: 34.0678214, lng: -118.4464078 }; // fallback to Los Angeles (UCLA)
      setCenter(pos);
    });
  }, []);

  useEffect(() => {
    if (!center || !window.google || !window.google.maps || !mapContainerRef.current) return;

    const map = new window.google.maps.Map(mapContainerRef.current, { center, zoom: 15 });
    mapRef.current = map;
    setMapLoaded(true);

    const service = new window.google.maps.places.PlacesService(map);
    const infoWindow = new window.google.maps.InfoWindow();

    const types = ["restaurant", "cafe", "bakery"];
    const fetchPlaces = (location) => {
      setPlacesLoading(true);
      let allResults = [];

      mapRef.current.markers?.forEach((m) => m.setMap(null));
      mapRef.current.markers = [];

      const requests = types.map(
        (type) =>
          new Promise((resolve) => {
            service.nearbySearch({ location, radius: 2000, type }, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach((r) => {
                  if (!allResults.some((e) => e.place_id === r.place_id)) allResults.push(r);
                });
              }
              resolve();
            });
          })
      );

      Promise.all(requests).then(() => {
        const filtered = allResults.filter((r) => !visitedPlaceIds.has(r.place_id));
        setPlacesList(filtered);
        setPlacesLoading(false);

        filtered.forEach((r) => {
          const marker = new window.google.maps.Marker({
            map,
            position: r.geometry.location,
            title: r.name,
            icon: visitedPlaceIds.has(r.place_id)
              ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
              : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          });

          marker.addListener("click", () => {
            const content = `
              <div style="font-weight:bold;">${r.name}</div>
              <div>Rating: ${r.rating || "—"} • ${Array(r.price_level || 0)
              .fill("$")
              .join("")}</div>
              <div>${r.vicinity || r.formatted_address}</div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          mapRef.current.markers.push(marker);
        });
      });
    };

    fetchPlaces(center);

    map.addListener("idle", () => {
      const newCenter = map.getCenter();
      fetchPlaces({ lat: newCenter.lat(), lng: newCenter.lng() });
    });

    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ["geocode", "establishment"], 
      });
      autocomplete.setFields(["geometry", "name"]);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        }
      });
    }
  }, [center, visitedPlaceIds]);

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

        {/* Map + location input */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 8 }}>
            <input
              ref={autocompleteRef}
              placeholder="Search location or restaurant"
              style={{ padding: 6, width: "70%" }}
            />
          </div>
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

        {/* List of restaurants */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <h3>Nearby Places</h3>
          {placesLoading && <p>Fetching places...</p>}
          {!placesLoading &&
            placesList.map((place) => {
              const alreadyInWishlist = wishlist.some((i) => i.id === place.place_id);
              return (
                <div
                  key={place.place_id}
                  style={{
                    marginBottom: 12,
                    borderBottom: "1px solid #eee",
                    paddingBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {/* Image */}
                  {place.photos && place.photos[0] && (
                    <img
                      src={place.photos[0].getUrl({ maxWidth: 100 })}
                      alt={place.name}
                      style={{ width: 100, height: "auto", objectFit: "cover", borderRadius: 8 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{place.name}</div>
                    <div>{place.vicinity || place.formatted_address}</div>
                    <div>
                      Rating: {place.rating || "—"} •{" "}
                      {Array(place.price_level || 0).fill("$").join("")}
                    </div>
                    <button
                      onClick={() => addToWishlist(place)}
                      disabled={alreadyInWishlist}
                      style={{
                        cursor: alreadyInWishlist ? "not-allowed" : "pointer",
                        background: alreadyInWishlist ? "#ccc" : "#85dcc3ff",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        marginTop: 4,
                      }}
                    >
                      {alreadyInWishlist ? "In Wishlist" : "+ Add to wishlist"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}