import React, { useEffect, useState } from "react";
import { Row, Col, Form, Input, Button, Rate, List, Avatar } from "antd";
import CountUp from "react-countup";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import massaging3 from "../../assets/images/massaging3.jpg";
import { useInView } from "react-intersection-observer";
import Title from "antd/es/typography/Title";

const { TextArea } = Input;

const AboutUs = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  // Theme flag (in a real app you might get this from context or props)
  const theme = useSelector(getTheme);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, [theme]);

  // When a review is submitted, add it to our list
  const onFinishReview = (values) => {
    const newReview = {
      id: Date.now(),
      name: values.name,
      message: values.message,
      rating: values.rating,
      avatar: "https://via.placeholder.com/80", // Replace with actual user image if available
    };
    setReviews([newReview, ...reviews]);
  };

  // Choose hero background based on theme
  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;

  return (
    <div className="about-us">
      {/* Hero Section */}
      <section
        className="about-hero"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="hero-overlay">
          <Title>Excellence In Every Step</Title>
        </div>
      </section>

      {/* Company Description Section */}
      <section className="about-company">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="about-description-card animated-card">
              <Title level={2}>About Our Company</Title>
              <p>
                We are dedicated to providing outstanding therapy and wellness
                services. Our mission is to empower individuals to achieve their
                full potential through innovative techniques and compassionate
                care. With years of expertise, we create transformative
                experiences that enrich lives.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="about-image animated-image">
              <img src={massaging3} alt="About Company" />
            </div>
          </Col>
        </Row>
      </section>

      {/* Statistics Section */}
      <section ref={ref} className="about-stats">
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <h3>
                {inView && <CountUp start={0} end={5000} duration={3} />}+
              </h3>
              <p>Customers Treated</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <h3>{inView && <CountUp start={0} end={20} duration={3} />}+</h3>
              <p>States Covered</p>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <h3>
                {inView && <CountUp start={0} end={10000} duration={3} />}+
                Hours
              </h3>
              <p>Therapy Time</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Reviews Section */}
      <section className="about-reviews">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div className="review-form">
              <Title level={3}>Leave a Review</Title>
              <Form layout="vertical" onFinish={onFinishReview}>
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
                  label="Message"
                  name="message"
                  rules={[
                    { required: true, message: "Please enter your review" },
                  ]}
                >
                  <TextArea rows={4} placeholder="Your Review" />
                </Form.Item>
                <Form.Item
                  label="Rate"
                  name="rating"
                  rules={[{ required: true, message: "Please rate us" }]}
                >
                  <Rate
                    style={{
                      width: "100%",
                      height: "40px",
                      background: "white",
                      alignContent: "center",
                      borderRadius: "5px",
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit Review
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="reviews-list">
              <Title level={3}>Customer Reviews</Title>
              <List
                itemLayout="horizontal"
                dataSource={reviews}
                locale={{ emptyText: "No reviews yet." }}
                renderItem={(review) => (
                  <List.Item key={review.id}>
                    <List.Item.Meta
                      avatar={<Avatar src={review.avatar} size={64} />}
                      title={
                        <div>
                          {review.name}{" "}
                          <Rate disabled defaultValue={review.rating} />
                        </div>
                      }
                      description={review.message}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default AboutUs;
