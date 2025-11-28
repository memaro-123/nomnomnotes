import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../../utils/loadGoogleMaps";

export default function LocationAuto({ defaultLocation, onPlaceSelected, inputProps = {} }) {
  const ref = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    loadGoogleMaps(["places"])
      .then(() => {
        if (!mounted || !window.google) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(ref.current, {
          types: ["establishment", "geocode"], // or just ["establishment"]
          fields: ["place_id", "name", "formatted_address", "geometry", "address_components"]
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          onPlaceSelected?.({
            name: place.name ?? "",
            address: place.formatted_address ?? "",
            placeId: place.place_id,
            location: place.geometry?.location?.toJSON?.() ?? null,
            raw: place
          });
        });
      })
      .catch((err) => {
        console.error("Failed to load Google Maps", err);
      });

    if (defaultLocation) {
        ref.current.value = defaultLocation;
    }

    return () => {
      mounted = false;
      // no clean up API for Autocomplete listeners via ref easily; GC handles it when node removed
    };
  }, [onPlaceSelected]);

  return (
    <input
      ref={ref}
      {...inputProps}
      placeholder={inputProps.placeholder ?? "select location"}
      className="border-1 border-solid rounded-sm w-full p-1 focus-within:shadow-lg transition-shadow"
    />
  );
}
