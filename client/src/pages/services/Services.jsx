import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Carousel } from "antd";
import slide1 from "../../assets/images/slide1.jpg";
import slide2 from "../../assets/images/slide2.jpg";
import slide3 from "../../assets/images/slide3.jpg";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import Title from "antd/es/typography/Title";

const { Meta } = Card;

// Sample service data
const services = [
  {
    id: 1,
    images: [slide1, slide2, slide3],
    title: "Service One",
    description:
      "This is a full description of service one. It offers great value and an exceptional experience.",
    duration: "60 mins",
    price: "$99",
  },
  {
    id: 2,
    images: [slide1, slide2, slide3],
    title: "Service Two",
    description:
      "This service focuses on delivering quality and satisfaction in every session.",
    duration: "90 mins",
    price: "$149",
  },
  {
    id: 3,
    images: [slide1, slide2, slide3],
    title: "Service Three",
    description:
      "Enjoy the premium experience and top-notch professional care with this service.",
    duration: "45 mins",
    price: "$79",
  },
  // Add more services if needed...
];

// Sample video data
const videos = [
  {
    id: 1,
    title: "Therapy Session Highlights",
    videoUrl: "/videos/video1.mp4",
  },
  {
    id: 2,
    title: "Client Testimonials",
    videoUrl: "/videos/video2.mp4",
  },
  {
    id: 3,
    title: "Service Overview",
    videoUrl: "/videos/video3.mp4",
  },
];

const ServicePage = () => {
  const theme = useSelector(getTheme);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, [theme]);

  // Choose hero background based on theme
  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;

  return (
    <div className="service-page">
      {/* Hero Section */}
      <section
        className="service-hero"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="hero-overlay">
          <Title>Our Services</Title>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <Title level={2}>What We Offer</Title>
        <Row gutter={[24, 24]}>
          {services.map((service) => (
            <Col key={service.id} xs={24} sm={12} md={8}>
              <Card
                className="service-card"
                hoverable
                cover={
                  <Carousel autoplay>
                    {service.images.map((img, index) => (
                      <div key={index}>
                        <img
                          src={img}
                          alt={`${service.title} ${index + 1}`}
                          className="card-image"
                        />
                      </div>
                    ))}
                  </Carousel>
                }
              >
                <Meta title={service.title} description={service.description} />
                <div className="service-details">
                  <p>
                    <strong>Duration:</strong> {service.duration}
                  </p>
                  <p>
                    <strong>Price:</strong> {service.price}
                  </p>
                </div>
                <Button type="primary" className="book-now-button">
                  Book Now
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <Title level={2}>Our Videos</Title>
        <Row gutter={[24, 24]}>
          {videos.map((video) => (
            <Col key={video.id} xs={24} sm={12} md={8}>
              <Card
                className="video-card"
                hoverable
                cover={
                  <video controls className="video-player">
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                }
              >
                <Meta title={video.title} />
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default ServicePage;
