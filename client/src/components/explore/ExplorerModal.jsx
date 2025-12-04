import { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { loadGoogleMaps } from "../../utils/loadGoogleMaps";
import ExplorerMap from "./ExplorerMap";
import ExplorerList from "./ExplorerList";
import { toast } from 'react-hot-toast';

export default function ExplorerModal({ wishlist, setWishlist }) {
  const [placesList, setPlacesList] = useState([]);
  const [visitedPlaceIds, setVisitedPlaceIds] = useState(new Set());
  const [rejectedPlaceIds, setRejectedPlaceIds] = useState({});
  const [center, setCenter] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);

  const mapRef = useRef(null);

  // Load visited places from backend
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

  // Load rejected places from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rejectedPlaces');
    if (stored) {
      setRejectedPlaceIds(JSON.parse(stored));
    }
  }, []);

  // Load Google Maps SDK
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
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null)
        );
      });
    getUserLocation().then((pos) => {
      if (!pos) pos = { lat: 34.0678214, lng: -118.4464078 }; // fallback to UCLA
      setCenter(pos);
    });
  }, []);

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

    const updatedList = placesList.filter(p => p.place_id !== place.place_id);
    setPlacesList(updatedList);
    
    if (updatedList.length > 0 && mapRef.current) {
      mapRef.current.panTo(updatedList[0].geometry.location);
      mapRef.current.setZoom(16);

      setTimeout(() => {
        const marker = mapRef.current.markers?.find(m => m.title === updatedList[0].name);
        if (marker) {
          window.google.maps.event.trigger(marker, 'click');
        }
      }, 500);
    }

    toast.success('added to wishlist')
  };

  const rejectPlace = (placeId) => {
    const updated = { ...rejectedPlaceIds, [placeId]: Date.now() };
    setRejectedPlaceIds(updated);
    localStorage.setItem('rejectedPlaces', JSON.stringify(updated));
    
    // Remove from current list
    const updatedList = placesList.filter(p => p.place_id !== placeId);
    setPlacesList(updatedList);
    
    if (updatedList.length > 0 && mapRef.current) {
      mapRef.current.panTo(updatedList[0].geometry.location);
      mapRef.current.setZoom(16);

      setTimeout(() => {
        const marker = mapRef.current.markers?.find(m => m.title === updatedList[0].name);
        if (marker) {
          window.google.maps.event.trigger(marker, 'click');
        }
      }, 500);
    }
  };

  const centerOnPlace = (place) => {
    if (mapRef.current) {
      mapRef.current.panTo(place.geometry.location);
      mapRef.current.setZoom(17);
      
      const marker = mapRef.current.markers?.find(m => m.title === place.name);
      if (marker) {
        window.google.maps.event.trigger(marker, 'click');
      }
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-100px)] gap-5">
      <div className="flex flex-col w-full flex-1 gap-2">
        <span className="font-pacifico text-2xl">explore restaurants</span>
        <span className="text-sm">click pass and save to find your <span className="font-pacifico">perfect</span> bite</span>
        <ExplorerList
          placesList={placesList}
          placesLoading={placesLoading}
          wishlist={wishlist}
          addToWishlist={addToWishlist}
          rejectPlace={rejectPlace}
          onPlaceClick={centerOnPlace}
        />
      </div>

      <div 
      className="hidden md:block md:w-3/5 md:h-full shadow-md rounded-md flex items-center justify-center">
        <ExplorerMap
          center={center}
          visitedPlaceIds={visitedPlaceIds}
          rejectedPlaceIds={rejectedPlaceIds}
          mapLoaded={mapLoaded}
          setMapLoaded={setMapLoaded}
          setPlacesList={setPlacesList}
          setPlacesLoading={setPlacesLoading}
          wishlist={wishlist}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
}