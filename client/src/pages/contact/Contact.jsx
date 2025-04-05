import React, { useEffect, useState } from "react";
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

const { TextArea } = Input;

const ContactUs = () => {
  const theme = useSelector(getTheme);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, [theme]);

  const onFinish = (values) => {
    console.log("Form values: ", values);
    // Implement email sending logic (e.g., via API) here.
  };

  // Choose hero background based on theme
  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;

  return (
    <div className="contact-us">
      {/* Hero Section */}
      <section
        className="contact-hero"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="hero-overlay">
          <Title>Contact Us</Title>
        </div>
      </section>

      {/* Contact Form & Animated Image Section */}
      <section className="contact-form-section">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="contact-form">
              <Title level={2}>Get in Touch</Title>
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your name" },
                  ]}
                >
                  <Input placeholder="Your Name" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Your Email" />
                </Form.Item>
                <Form.Item
                  label="Message"
                  name="message"
                  rules={[
                    { required: true, message: "Please enter your message" },
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

      {/* Contact Details Section */}
      <section className="contact-details-section">
        <Title level={2}>Our Contact Details</Title>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <EnvironmentOutlined
                style={{ fontSize: "2rem", color: "#fff" }}
              />
              <h3>Address</h3>
              <p>123 Main Street, Suite 100, City, Country</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <PhoneOutlined style={{ fontSize: "2rem", color: "#fff" }} />
              <h3>Phone</h3>
              <p>+1 234 567 890</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="contact-detail-card animated-card">
              <MailOutlined style={{ fontSize: "2rem", color: "#fff" }} />
              <h3>Email</h3>
              <p>info@company.com</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Google Map Section */}
      <section className="google-map-section">
        <Title level={2}>Our Service Locations</Title>
        <div className="map-container">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019132123!2d144.96315761531986!3d-37.81410797975144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43c3f7d53b%3A0x5045675218ce6e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sin!4v1614785402138!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
