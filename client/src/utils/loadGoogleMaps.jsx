import { auth } from '../firebase'

export async function loadGoogleMaps(libraries = ["places"]) {
  // Get API key from backend
  const key = await fetchApiKey();
  if (!key) return Promise.reject(new Error("Failed to get API key"));

  // Rest of your existing script loading logic
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
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=${libraries.join(',')}&loading=async`;
  script.async = true;
  script.defer = true;

  document.head.appendChild(script);

  return new Promise((resolve, reject) => {
    script.addEventListener("load", () => resolve(window.google.maps));
    script.addEventListener("error", reject);
  });
}


async function fetchApiKey() {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    
    // Add the full backend URL
    const response = await fetch('http://localhost:8080/api/config/maps-key', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await response.text();
    console.log('Response body:', text);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status} - ${text}`);
    }
    const data = JSON.parse(text);
    return data.key;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}