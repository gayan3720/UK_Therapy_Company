import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const OfficeMap = () => {
  const position = [51.481583, -3.17909]; // Melbourne

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={position}>
        <Popup>
          Our Office <br /> 189,Penarth Road, Cardiff, United Kingdom
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default OfficeMap;
