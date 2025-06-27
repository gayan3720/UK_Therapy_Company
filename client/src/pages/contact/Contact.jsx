import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Form, Input, Button } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import massaging2 from "../../assets/images/massaging2.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import emailjs from "@emailjs/browser";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import Message from "../../components/reusablecomponents/message/Message";
import { useGetLocationsOfUsersAppointmentCompletedQuery } from "../../services/apislices/authApiSlice";
import { mainTowns } from "../../utils/mainTowns"; // You should import your main towns list

const { TextArea } = Input;

const ContactUs = () => {
  const form = useRef();
  const mapRef = useRef(null);
  const theme = useSelector(getTheme);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [loading, setLoading] = useState(false);
  const [towns, setTowns] = useState([]);
  const { data: locationList } =
    useGetLocationsOfUsersAppointmentCompletedQuery();

  // Function to calculate distance between two lat/lng using the Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in km
  };

  // Function to find the nearest town based on the user's location
  const findNearestTown = (userLat, userLng) => {
    let nearestTown = null;
    let minDistance = Infinity;

    mainTowns.forEach((town) => {
      const distance = calculateDistance(userLat, userLng, town.lat, town.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTown = town;
      }
    });

    return nearestTown;
  };

  // Initialize the map and place markers for each town and user location
  useEffect(() => {
    if (!mapRef.current) return;

    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyC3Pw4dNiNII2UntEhDW-BHdNaz1BPkSy0&libraries=places";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (mapRef.current) initializeMap();
    };
    document.head.appendChild(script);
  }, [mapRef.current]);

  const initializeMap = () => {
    const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    placeMarkers(mapInstance);
    fetchUserLocation(mapInstance);
  };

  const fetchUserLocation = (mapInstance) => {
    if (locationList) {
      locationList.forEach(async (userLocation) => {
        const userAddress = userLocation.address; // The address from the userLocation object

        // Call Google Maps Geocoding API to get lat and lng from the address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: userAddress }, (results, status) => {
          if (status === "OK" && results[0]) {
            const userLat = results[0].geometry.location.lat();
            const userLng = results[0].geometry.location.lng();

            // Add a marker for the user's location
            new window.google.maps.Marker({
              position: { lat: userLat, lng: userLng },
              map: mapInstance,
              title: "User Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#FF0000", // Change color as needed
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 8,
              },
            });
          } else {
            console.log(
              "Geocode was not successful for the following reason: " + status
            );
          }
        });
      });
    }
  };

  const placeMarkers = (mapInstance) => {
    const updatedMarkers = mainTowns.map((town) => {
      const marker = new window.google.maps.Marker({
        position: { lat: town.lat, lng: town.lng },
        map: mapInstance,
        title: town.name,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: isDarkTheme ? "#00ff80" : "#ff4081", // Dynamic color change based on theme
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
          scale: 8,
        },
      });
      return marker;
    });

    setTowns(updatedMarkers);
  };

  useEffect(() => {
    setIsDarkTheme(theme === "dark");
  }, [theme]);

  const onFinish = () => {
    setLoading(true);

    emailjs.init({
      publicKey:
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "1KeeGNrX9UD87sY6-",
    });
    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_ld5wxoj",
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_r9tzp73",
        form.current.getFieldsValue()
      )
      .then((result) => {
        setLoading(false);
        console.log("Email sent:", result.text);
        <Message
          type="success"
          message="Successful"
          description={result.text}
          closable
        />;
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error:", error.text);
        <Message
          type="error"
          message="Error"
          description="Failed to send email.!"
          closable
        />;
      });
  };

  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;
  if (loading) return <DataFetchingLoader />;

  return (
    <div className="contact-us">
      <section
        className="contact-hero"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="hero-overlay">
          <Title>Contact Us</Title>
        </div>
      </section>

      <section className="contact-form-section">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="contact-form">
              <Title level={2}>Get in Touch</Title>
              <Form ref={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your name.!" },
                  ]}
                >
                  <Input placeholder="Your Name" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email.!" },
                    { type: "email", message: "Please enter a valid email.!" },
                  ]}
                >
                  <Input placeholder="Your Email" />
                </Form.Item>
                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[
                    { required: true, message: "Please enter your subject.!" },
                  ]}
                >
                  <Input placeholder="Your Subject" />
                </Form.Item>
                <Form.Item
                  label="Message"
                  name="message"
                  rules={[
                    { required: true, message: "Please enter your message.!" },
                  ]}
                >
                  <TextArea rows={5} placeholder="Your Message" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Send
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="animated-image">
              <img src={massaging2} alt="Contact Animation" />
            </div>
          </Col>
        </Row>
      </section>

      <section className="contact-details-section">
        <Title level={2}>Our Contact Details</Title>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <EnvironmentOutlined
                style={{ fontSize: "2rem", color: "#fff" }}
              />
              <h3>Address</h3>
              <p>189, Penarth Road, Cardiff, United Kingdom</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <PhoneOutlined style={{ fontSize: "2rem", color: "#fff" }} />
              <h3>Phone</h3>
              <p>+44 7479 204852</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <MailOutlined style={{ fontSize: "2rem", color: "#fff" }} />
              <h3>Email</h3>
              <p>mastersportstherapy@gmail.com</p>
            </div>
          </Col>
        </Row>
      </section>

      <section className="google-map-section">
        <Title level={2}>Our Service Locations</Title>
        <div className="map-container">
          <div
            id="map"
            ref={mapRef}
            style={{
              width: "100%",
              height: 500,
              marginTop: 8,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
