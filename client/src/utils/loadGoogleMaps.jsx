export function loadGoogleMaps(libraries = ["places"]) {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
  
    // if script already loaded / loading
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  
    const id = "google-maps-js";
    const existing = document.getElementById(id);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", () => resolve(window.google.maps));
        existing.addEventListener("error", reject);
      });
    }
  
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
  
    document.head.appendChild(script);
  
    return new Promise((resolve, reject) => {
      script.addEventListener("load", () => {
        if (window.google && window.google.maps) resolve(window.google.maps);
        else reject(new Error("Google maps loaded but `google.maps` not available"));
      });
      script.addEventListener("error", (e) => reject(e));
    });
  }
  