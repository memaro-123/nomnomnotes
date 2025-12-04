import { CircleNotchIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

export default function ExplorerMap({
  center,
  visitedPlaceIds,
  rejectedPlaceIds,
  mapLoaded,
  setMapLoaded,
  setPlacesList,
  setPlacesLoading,
  wishlist,
  mapRef
}) {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!center || !window.google || !window.google.maps || !mapContainerRef.current) return;

    // Gray map style
    const map = new window.google.maps.Map(mapContainerRef.current, { 
      center, 
      zoom: 15,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [{"color": "#f5f5f5"}]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#616161"}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": "#f5f5f5"}]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#bdbdbd"}]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{"color": "#eeeeee"}]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#757575"}]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{"color": "#e5e5e5"}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{"color": "#ffffff"}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#757575"}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{"color": "#dadada"}]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#616161"}]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [{"color": "#e5e5e5"}]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [{"color": "#eeeeee"}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": "#c9c9c9"}]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        }
      ]
    });
    mapRef.current = map;
    setMapLoaded(true);

    const service = new window.google.maps.places.PlacesService(map);
    const infoWindow = new window.google.maps.InfoWindow();

    const isRecentlyRejected = (placeId) => {
      const REJECTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
      const rejectedTime = rejectedPlaceIds[placeId];
      if (!rejectedTime) return false;
      return Date.now() - rejectedTime < REJECTION_PERIOD;
    };

    const types = ["restaurant", "cafe", "bakery"];
    const fetchPlaces = (location) => {
      setPlacesLoading(true);
      let allResults = [];

      // Clear old markers
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
        // Filter out visited AND rejected places
        const filtered = allResults.filter(
          (r) => !visitedPlaceIds.has(r.place_id) && !isRecentlyRejected(r.place_id)
        );
        setPlacesList(filtered);
        setPlacesLoading(false);

        // Add markers to map
        filtered.forEach((r) => {
          const isInWishlist = wishlist?.some(item => item.id === r.place_id);
          
          const marker = new window.google.maps.Marker({
            map,
            position: r.geometry.location,
            title: r.name,
            icon: {
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
              fillColor: isInWishlist ? "#10b981" : "#3b82f6", // green if in wishlist, blue if unseen
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1.5,
              anchor: new window.google.maps.Point(12, 22),
            },
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

    // Refetch when map moves
    // map.addListener("idle", () => {
    //   const newCenter = map.getCenter();
    //   fetchPlaces({ lat: newCenter.lat(), lng: newCenter.lng() });
    // });

  }, [center, visitedPlaceIds]);

  // Add this new useEffect to update marker colors when wishlist changes
useEffect(() => {
  if (!mapRef.current?.markers) return;
  
  mapRef.current.markers.forEach((marker) => {
    const placeId = marker.placeId; // We need to store this on the marker
    const isInWishlist = wishlist?.some(item => item.id === placeId);
    
    marker.setIcon({
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: isInWishlist ? "#10b981" : "#3b82f6",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 22),
    });
  });
}, [wishlist]);

  

  return (
    <div className="hidden md:block md:w-full md:h-full shadow-md rounded-md flex items-center justify-center">
      {!mapLoaded && (
        <div className="flex items-center justify-center h-full text-gray-500 flex-col">
          <CircleNotchIcon size={32} className="animate-spin" />
          <span>loading maps...</span>
        </div>
      )}
      <div className="w-full h-full" ref={mapContainerRef} />
    </div>
  );
}