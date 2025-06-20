import React from "react";
import Lottie from "react-lottie";
import { Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import footerAnimation from "../../../assets/animations/footer.json"; // Lottie animation

const { Title, Paragraph } = Typography;

const Footer = () => {
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: footerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Lottie options={lottieOptions} height={200} width={200} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={3}>About Us</Title>
            <Paragraph>
              Master Sports Therapy offers personalized therapy sessions
              focusing on sports recovery, performance improvement, and overall
              well-being.
            </Paragraph>
            <Paragraph>
              <Link to="/about">Learn More</Link>
            </Paragraph>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={3}>Quick Links</Title>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/booking">Book Now</Link>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={3}>Contact Us</Title>
            <Paragraph>Email: mastersportstherapy@gmail.com</Paragraph>
            <Paragraph>Phone: +44 7479 204852</Paragraph>
            <Paragraph>
              Address: 189 Penarth Road, Cardiff, United Kingdom
            </Paragraph>
          </Col>
        </Row>
      </div>

      <div className="footer-bottom">
        <Row justify="center">
          <Col xs={24} sm={12} md={6}>
            <Title level={5}>Follow Us</Title>
            <ul className="social-links">
              <li>
                <Link to="#">
                  <i className="fab fa-facebook"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-twitter"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-instagram"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-linkedin"></i>
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        <p>&copy; 2025 Master Sports Therapy. All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
