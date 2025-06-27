import React, { useEffect, useRef, useState } from "react";

const GoogleMapComponent = () => {
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) return initMap();

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
      });

      const autocomplete = new window.google.maps.places.Autocomplete(
        searchBoxRef.current
      );
      autocomplete.bindTo("bounds", mapInstance);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        mapInstance.setCenter(place.geometry.location);
        mapInstance.setZoom(15);

        if (marker) marker.setMap(null);

        const newMarker = new window.google.maps.Marker({
          position: place.geometry.location,
          map: mapInstance,
        });

        setMarker(newMarker);
      });

      setMap(mapInstance);
    };

    loadGoogleMapsScript();
  }, []);

  return (
    <div style={{ width: "100%", height: "500px", position: "relative" }}>
      <input
        ref={searchBoxRef}
        type="text"
        placeholder="Search a location..."
        style={{
          width: "300px",
          height: "40px",
          fontSize: "16px",
          padding: "8px",
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default GoogleMapComponent;
