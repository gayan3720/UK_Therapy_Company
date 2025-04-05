import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  InputNumber,
  Card,
  Carousel,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import slide1 from "../../assets/images/slide1.jpg";
import slide2 from "../../assets/images/slide2.jpg";
import slide3 from "../../assets/images/slide3.jpg";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import Title from "antd/es/typography/Title";

const { Meta } = Card;

const Booking = () => {
  const theme = useSelector(getTheme);
  // Simulate registration status and user data
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);

  // Simulate selected service (if available) or show other services
  const [selectedService, setSelectedService] = useState(null);

  // Dummy time slots data for a week ahead
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, [theme]);

  useEffect(() => {
    // Simulate fetching time slots
    const slots = [];
    for (let i = 0; i < 7; i++) {
      slots.push({
        day: `Day ${i + 1}`,
        times: ["10:00 AM - 12:00 PM", "1:00 PM-3:00 PM", "4:00 PM - 6:00 PM"],
      });
    }
    setTimeSlots(slots);

    // Simulate checking registration status (for demo, default to not registered)
    // Uncomment the lines below to simulate a registered user:
    /*
    setIsRegistered(true);
    setUserData({
      profileImage: "https://via.placeholder.com/100",
      firstName: "John",
      lastName: "Doe",
      age: 30,
      username: "johndoe",
      email: "john@example.com",
      address: "123 Main St",
      location: "City, Country",
    });
    */
  }, []);

  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;

  const onFinish = (values) => {
    console.log("Booking Form Values:", values);
    // Handle booking submission logic here.
  };

  // Dummy services data for the "other services" view
  const otherServices = [
    {
      id: 1,
      images: [slide1],
      title: "Service One",
      description: "Description of Service One",
      duration: "60 mins",
      price: "$99",
    },
    {
      id: 2,
      images: [slide2],
      title: "Service Two",
      description: "Description of Service Two",
      duration: "90 mins",
      price: "$149",
    },
    {
      id: 3,
      images: [slide3],
      title: "Service Three",
      description: "Description of Service Three",
      duration: "45 mins",
      price: "$79",
    },
  ];

  return (
    <div className="booking-page">
      {/* Hero Section */}
      <section
        className="booking-hero"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="hero-overlay">
          <Title>Book Your Service</Title>
        </div>
      </section>

      {/* Booking Form & Service Details Section */}
      <section className="booking-form-section">
        <div className="booking-card">
          <Row gutter={[24, 24]}>
            {/* Left Side: Booking Form */}
            <Col xs={24} md={12}>
              <div className="booking-form">
                <Title level={3}>Your Details</Title>
                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={userData || {}}
                >
                  {/* Profile Image Upload / Display */}
                  <Form.Item name="profileImage">
                    <div className="profile-image-upload">
                      {userData && userData.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="avatar"
                          style={{ width: "100%", borderRadius: "50%" }}
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <UserOutlined style={{ fontSize: 40 }} />
                        </div>
                      )}
                    </div>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your first name!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your first name"
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your last name!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your last name"
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Age"
                        name="age"
                        rules={[
                          { required: true, message: "Please enter your age!" },
                        ]}
                      >
                        <InputNumber
                          placeholder="Enter your age"
                          style={{ width: "100%" }}
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your username!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your username"
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your email!",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your email"
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Address"
                        name="address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your address!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your address"
                          disabled={isRegistered}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Location on Map"
                    name="location"
                    rules={[
                      {
                        required: true,
                        message: "Please mark your location on the map!",
                      },
                    ]}
                  >
                    <div className="map-placeholder">Map goes here</div>
                  </Form.Item>
                </Form>
              </div>
            </Col>

            {/* Right Side: Service Details */}
            <Col xs={24} md={12}>
              <div className="service-details">
                {selectedService ? (
                  <Card
                    className="selected-service-card"
                    hoverable
                    cover={
                      <Carousel autoplay>
                        {selectedService.images.map((img, index) => (
                          <div key={index}>
                            <img
                              src={img}
                              alt={`${selectedService.title} ${index + 1}`}
                              className="card-image"
                            />
                          </div>
                        ))}
                      </Carousel>
                    }
                  >
                    <Meta
                      title={selectedService.title}
                      description={selectedService.description}
                    />
                    <div className="service-meta">
                      <p>
                        <strong>Duration:</strong> {selectedService.duration}
                      </p>
                      <p>
                        <strong>Price:</strong> {selectedService.price}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="other-services">
                    <Title level={3}>Other Services</Title>
                    <Row gutter={[16, 16]}>
                      {otherServices.map((service) => (
                        <Col key={service.id} xs={24} sm={8}>
                          <Card
                            className="service-card"
                            hoverable
                            cover={
                              <img
                                src={service.images[0]}
                                alt={service.title}
                                className="card-image"
                              />
                            }
                          >
                            <Meta
                              title={service.title}
                              description={service.description}
                            />
                            <Button>BOOK NOW</Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    <Button type="default" className="explore-button">
                      Explore More..
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Time Slots Section */}
      <section className="time-slots-section">
        <Title level={3}>Select a Time Slot</Title>
        <div className="time-slots">
          {timeSlots.map((daySlot, idx) => (
            <div key={idx} className="day-slot">
              <h3>{daySlot.day}</h3>
              <div className="slot-buttons">
                {daySlot.times.map((time, tIdx) => (
                  <Button
                    key={tIdx}
                    type={
                      selectedTimeSlot === `${daySlot.day}-${time}`
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      setSelectedTimeSlot(`${daySlot.day}-${time}`)
                    }
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button className="request-service-button">Request Service</Button>
      </section>
    </div>
  );
};

export default Booking;
