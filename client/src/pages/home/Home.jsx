// HomePage.js
import React from "react";
import { Layout, Carousel, Card, Row, Col, Typography, Button } from "antd";
import { motion } from "framer-motion";
import slide1 from "../../assets/images/slide1.jpg";
import slide2 from "../../assets/images/slide2.jpg";
import slide3 from "../../assets/images/slide3.jpg";
import slide4 from "../../assets/images/slide4.jpg";
import slide5 from "../../assets/images/slide5.jpg";
import slide6 from "../../assets/images/slide6.jpg";
import about1 from "../../assets/images/about1.jpg";
import service1 from "../../assets/images/service1.jpg";
import service2 from "../../assets/images/service2.jpg";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

// Framer Motion animation variant for a "fadeInUp" effect
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

/* -------------------------------------------
   Hero Section: Image slider with overlay text.
-------------------------------------------- */
const HeroSection = () => {
  return (
    <motion.div
      className="hero-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <Carousel autoplay>
        <div>
          <img src={slide1} alt="Therapy Environment" />
        </div>
        <div>
          <img src={slide2} alt="Psychotherapy Session" />
        </div>
        <div>
          <img src={slide3} alt="Mindfulness and Relaxation" />
        </div>
        <div>
          <img src={slide4} alt="Slide 4" />
        </div>
        <div>
          <img src={slide5} alt="Slide 5" />
        </div>
        <div>
          <img src={slide6} alt="Slide 6" />
        </div>
      </Carousel>
      <div className="hero-overlay">
        <Title>Welcome to Master Sports Therapy</Title>
        <Paragraph>
          We provide top-notch therapy services with advanced techniques and
          personalized care.
        </Paragraph>
        <Button size="large" type="primary">
          Learn More..
        </Button>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------
   Services Section: Cards displaying therapy sessions.
-------------------------------------------- */
const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: "Therapy Session 1",
      image: service1,
      description: "Relaxing therapy session tailored for you.",
      price: "100",
      duration: "60",
    },
    {
      id: 2,
      title: "Therapy Session 2",
      image: service2,
      description: "Revitalizing session to rejuvenate your senses.",
      price: "120",
      duration: "75",
    },
    {
      id: 3,
      title: "Therapy Session 3",
      image: service1,
      description: "Rejuvenating therapy for complete relaxation.",
      price: "150",
      duration: "90",
    },
  ];

  return (
    <motion.div
      className="services-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <Title level={2}>OUR SERVICES</Title>
      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col xs={24} sm={12} md={8} key={service.id}>
            <Card
              hoverable
              cover={<img alt={service.title} src={service.image} />}
            >
              <Card.Meta
                title={service.title}
                description={service.description}
              />
              <div className="service-info">
                <Paragraph strong>Price: {service.price} $</Paragraph>
                <Paragraph>Duration: {service.duration} MIN</Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </motion.div>
  );
};

/* -------------------------------------------
   About Section: Two-column layout with an image and detailed about text.
-------------------------------------------- */
const AboutSection = () => {
  return (
    <motion.div
      className="about-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <Row align="middle" gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <img src={about1} alt="Our Facility" />
        </Col>
        <Col xs={24} md={12}>
          <Title level={2}>ABOUT US</Title>
          <Paragraph>
            At Master Sports Therapy, we believe in a holistic approach to
            physical and mental well-being. Our dedicated team of experts is
            committed to empowering individuals to achieve optimal health
            through personalized therapy sessions. With years of experience in
            sports therapy, rehabilitation, and wellness, our mission is to
            provide innovative, evidence-based techniques that enhance recovery
            and performance.
          </Paragraph>
          <Paragraph>
            We value compassion, innovation, and integrity, ensuring that each
            client receives tailored care to unlock their full potential. Our
            state-of-the-art facility is designed to create a nurturing and
            supportive environment where cutting-edge technology meets expert
            care. We are proud to be a part of our clients' journeys toward
            better health, fitness, and overall quality of life.
          </Paragraph>
        </Col>
      </Row>
    </motion.div>
  );
};

/* -------------------------------------------
   Video Section: Embedded video with our story description.
-------------------------------------------- */
const VideoSection = () => {
  return (
    <motion.div
      className="video-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={12}>
          <Title level={2}>OUR STORY</Title>
          <Paragraph>
            Master Sports Therapy was born out of a passion for transforming
            lives through innovative therapy solutions. Founded by leading
            experts in sports medicine and rehabilitation, we set out to create
            a space where cutting-edge technology meets compassionate care.
          </Paragraph>
          <Paragraph>
            Over the years, our journey has been marked by groundbreaking
            advancements and a relentless commitment to excellence. Our team has
            dedicated countless hours to research and training, ensuring that
            every therapy session is tailored to meet your unique needs.
          </Paragraph>
          <Paragraph>
            Watch our video to learn more about our humble beginnings, our
            growth, and our continuous quest to redefine therapy for the modern
            world.
          </Paragraph>
        </Col>
        <Col xs={24} md={12}>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/YAlrBgFqBOE"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Company Video"
            ></iframe>
          </div>
        </Col>
      </Row>
    </motion.div>
  );
};

/* -------------------------------------------
   Testimonials Section: Carousel for testimonials and reviews.
-------------------------------------------- */
const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Doe",
      review:
        "This company changed my life. The therapy sessions were transformative.",
    },
    {
      id: 2,
      name: "Jane Smith",
      review: "A truly professional and caring team. Highly recommended!",
    },
    {
      id: 3,
      name: "Mike Johnson",
      review: "Innovative and effective solutions. I feel better than ever.",
    },
  ];

  return (
    <motion.div
      className="testimonials-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <Title level={2}>TESTIMONIALS</Title>
      <Carousel autoplay>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-slide">
            <Card bordered={false}>
              <Paragraph>"{testimonial.review}"</Paragraph>
              <Paragraph strong>- {testimonial.name}</Paragraph>
            </Card>
          </div>
        ))}
      </Carousel>
    </motion.div>
  );
};

/* -------------------------------------------
   HomePage Component: Assembling all sections.
-------------------------------------------- */
const Home = () => {
  return (
    <Layout className="home-page">
      <Content>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <VideoSection />
        <TestimonialsSection />
      </Content>
    </Layout>
  );
};

export default Home;
