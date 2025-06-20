import { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  InputNumber,
  Card,
  Carousel,
  DatePicker,
  Modal,
  Typography,
  ConfigProvider,
  Table,
  Space,
  Tooltip,
  message,
} from "antd";
import { UserOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import { useGetAllTimeslotsMutation } from "../../services/apislices/timeslotsApiSlice";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import Lottie from "lottie-react";
import successAnimation from "../../assets/animations/success.json";
import { motion } from "framer-motion";
import Meta from "antd/es/card/Meta";
import { getUser } from "../../services/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useGetUserAppointmentsQuery } from "../../services/apislices/appointmentApiSlice";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import { useLazyGetServiceByIdQuery } from "../../services/apislices/serviceApiSlice";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const disabledDate = (current) => {
  return current && current < dayjs().startOf("day");
};

const Booking = () => {
  const theme = useSelector(getTheme);
  const user = useSelector(getUser);
  const navigate = useNavigate();

  // Declare refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);
  const addressInputRef = useRef(null);
  const placesLoadedRef = useRef(false);

  const [getAllTimeSlots] = useGetAllTimeslotsMutation();
  const { isLoading: isUserAppointmentsLoading, data: userAppointments } =
    useGetUserAppointmentsQuery();
  const [trigger] = useLazyGetServiceByIdQuery();

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userData, setUserData] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState(false);

  const [form] = Form.useForm();

  const heroBgImage = isDarkTheme ? aboutDark : aboutLight;

  // Set user data and form values on mount
  useEffect(() => {
    setIsDarkTheme(theme === "dark");

    if (user) {
      setUserData(user);
      form.setFieldsValue({
        ...user,
        address: user.address || "148 Strand, London WC2R 1JA, UK",
      });
    } else {
      form.setFieldsValue({
        address: "148 Strand, London WC2R 1JA, UK",
      });
    }

    // Load saved service
    const savedService = localStorage.getItem("bookingSelectedService");
    if (savedService) {
      setSelectedService(JSON.parse(savedService));
    }
  }, [user, theme]);

  // Initialize Google Maps
  useEffect(() => {
    if (mapRef.current && !mapInitialized && !placesLoadedRef.current) {
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeMap();
        setMapInitialized(true);
        placesLoadedRef.current = true;
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC3Pw4dNiNII2UntEhDW-BHdNaz1BPkSy0&libraries=places";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        placesLoadedRef.current = true;
        initializeMap();
        setMapInitialized(true);
      };
      script.onerror = () => {
        setMapError(true);
        message.error(
          "Failed to load Google Maps. Please try refreshing the page."
        );
      };
      document.head.appendChild(script);
    }
  }, [mapRef.current]);

  // Initialize Map, Marker, Geocoder, Autocomplete
  const initializeMap = () => {
    if (mapInstanceRef.current || !mapRef.current) return;

    try {
      // Get initial address from form
      const initialAddress =
        form.getFieldValue("address") || "148 Strand, London WC2R 1JA, UK";

      // Create map instance
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 51.5074, lng: -0.1278 }, // London
        zoom: 13,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });

      // Create marker instance
      markerRef.current = new window.google.maps.Marker({
        position: mapInstanceRef.current.getCenter(),
        map: mapInstanceRef.current,
        title: "Master Sports Therapy Location",
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      // Create geocoder instance
      geocoderRef.current = new window.google.maps.Geocoder();

      // Marker dragend event updates form address field
      markerRef.current.addListener("dragend", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              form.setFieldsValue({ address: results[0].formatted_address });
            }
          }
        );
      });

      // Initialize autocomplete
      if (addressInputRef.current) {
        const inputElement = addressInputRef.current.input;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputElement,
          {
            types: ["geocode"],
            componentRestrictions: { country: "uk" },
            fields: ["address_components", "geometry", "formatted_address"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          mapInstanceRef.current.panTo(place.geometry.location);
          markerRef.current.setPosition(place.geometry.location);
          form.setFieldsValue({ address: place.formatted_address });
        });
      }

      // Set initial location
      updateMapLocation(initialAddress);
    } catch (error) {
      console.error("Google Maps initialization error:", error);
      setMapError(true);
    }
  };

  // Update map and marker position by address
  const updateMapLocation = (address) => {
    if (!geocoderRef.current || !mapInstanceRef.current || !markerRef.current) {
      return;
    }

    geocoderRef.current.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        mapInstanceRef.current.panTo(loc);
        mapInstanceRef.current.setZoom(15);
        markerRef.current.setPosition(loc);
      } else {
        console.warn("Geocode failed:", status);
      }
    });
  };

  // Form change handler
  const handleFormValuesChange = (changedValues, allValues) => {
    localStorage.setItem("bookingFormData", JSON.stringify(allValues));

    // Update map when address changes
    if (changedValues.address && mapInitialized) {
      updateMapLocation(changedValues.address);
    }
  };

  // Previous appointments setup
  useEffect(() => {
    if (userAppointments && userAppointments.data) {
      const newList = userAppointments.data.map((item) => ({
        ...item,
        key: item.id,
        status: item.isRejected
          ? "Rejected"
          : item.isCompleted
          ? "Completed"
          : item.isApproved
          ? "Approved"
          : "Pending",
      }));
      setPreviousOrders(newList);
    } else {
      setPreviousOrders([]);
    }
  }, [userAppointments]);

  // Columns for previous appointments
  const columns = [
    {
      title: "Date",
      dataIndex: "appointmentDate",
      key: "date",
      render: (text) =>
        text ? moment(text).format("DD-MM-YYYY HH:mm") : "N/A",
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "service",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Appointment">
            <Button
              className="neon-button"
              icon={<EditOutlined />}
              onClick={() => handleEditAppointment(record.id)}
              type="default"
            />
          </Tooltip>
          <Tooltip title="Select Appointment">
            <Button
              className="neon-button"
              icon={<CheckOutlined />}
              onClick={() =>
                handleUserAppointmentSelect(record.serviceID, record.address)
              }
              type="primary"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEditAppointment = () => {};

  // On selecting an appointment
  const handleUserAppointmentSelect = async (serviceID, appointmentAddress) => {
    if (serviceID) {
      try {
        const result = await trigger(serviceID).unwrap();
        setSelectedService(result?.data || null);
        localStorage.setItem(
          "bookingSelectedService",
          JSON.stringify(result?.data || null)
        );
      } catch (error) {
        message.error("Failed to load service details");
      }
    } else {
      setSelectedService(null);
      localStorage.removeItem("bookingSelectedService");
    }

    const address = appointmentAddress || "148 Strand, London WC2R 1JA, UK";
    form.setFieldsValue({ address });

    if (mapInitialized) {
      updateMapLocation(address);
    }
  };

  // Generate slots grouped by date
  const generateSlotsForDateRange = (from, to, data) => {
    const grouped = [];
    data.forEach((slot) => {
      const formatTime = (time) => time.slice(0, 5);
      const date = slot.dateOftimeslots.split(" ")[0];
      const timeRange = {
        timeRange: `${formatTime(slot.startTime)} - ${formatTime(
          slot.endTime
        )}`,
        isBooked: slot.isBooked,
      };
      const existing = grouped.find((item) => item.date === date);
      if (existing) {
        existing.times.push(timeRange);
      } else {
        grouped.push({ date: date, day: slot.dayOfWeek, times: [timeRange] });
      }
    });
    return grouped;
  };

  // Search for timeslots in range
  const onSearch = async () => {
    setSearchError(null);
    if (dateRange.length === 2) {
      try {
        const response = await getAllTimeSlots({
          fromDate: dateRange[0],
          toDate: dateRange[1],
        }).unwrap();

        const slots = generateSlotsForDateRange(
          dateRange[0],
          dateRange[1],
          response?.data || []
        );

        if (slots.length === 0) {
          setSearchError("No available time slots for the selected dates.");
        }

        setTimeSlots(slots);
      } catch (error) {
        setSearchError("Failed to fetch time slots. Please try again.");
      }
    }
  };

  // Handle search button click
  const handleSearchClick = (e) => {
    e.stopPropagation();
    if (dateRange.length === 2) {
      onSearch();
    } else {
      message.warning("Please select a date range first");
    }
  };

  // Handle time slot selection
  const handleTimeSlotClick = (date, time) => {
    const selected = `${date} - ${time}`;
    setSelectedTimeSlot(selected);
    setSelectedMessage(selected);
    setIsModalVisible(true);
    setTimeout(() => setIsModalVisible(false), 10000);
  };

  // Render time slots
  const renderTimeSlots = () => {
    if (!timeSlots.length)
      return <p>Please select a date range to view available time slots.</p>;

    return timeSlots.map((daySlot, idx) => (
      <motion.div
        key={idx}
        className="day-slot"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
      >
        <h3>
          {daySlot.day} - {daySlot.date}
        </h3>
        <div className="slot-buttons">
          {daySlot.times.map((time, tIdx) => {
            const isBooked = time.isBooked === 1;
            const isSelected =
              selectedTimeSlot === `${daySlot.date} - ${time.timeRange}`;
            return (
              <Button
                key={tIdx}
                type={isSelected ? "primary" : "default"}
                disabled={isBooked}
                onClick={() =>
                  handleTimeSlotClick(daySlot.date, time.timeRange)
                }
                className={`neon-button ${isSelected ? "selected" : ""}`}
                style={{
                  background: isBooked
                    ? "var(--error)"
                    : isSelected
                    ? "var(--primary)"
                    : "var(--success)",
                  color: "var(--text)",
                  margin: "4px",
                }}
              >
                {time.timeRange}
                {isBooked && <span className="booked-badge">Booked</span>}
              </Button>
            );
          })}
        </div>
      </motion.div>
    ));
  };

  // Form validation
  const isFormValid = () => {
    return (
      form.isFieldsTouched(true) &&
      !form.getFieldsError().some(({ errors }) => errors.length)
    );
  };

  const isRequestDisabled = !isFormValid() || !selectedTimeSlot;

  if (isUserAppointmentsLoading) return <DataFetchingLoader />;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "var(--primary)",
          borderRadius: 8,
          colorBgContainer: "var(--surface)",
          colorText: "var(--text)",
          colorTextPlaceholder: "var(--text-soft)",
          colorBgElevated: "var(--surface)",
          colorIcon: "var(--text)",
          colorIconHover: "var(--primary)",
          colorBorder: "var(--border)",
          colorTextHeading: "var(--text)",
          colorTextDescription: "var(--text-soft)",
        },
      }}
    >
      <div className="booking-page">
        <motion.section
          className="booking-hero"
          style={{ backgroundImage: `url(${heroBgImage})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-overlay">
            <Title style={{ textShadow: "var(--neon-glow)" }}>
              Book Your Service
            </Title>
          </div>
        </motion.section>

        <section className="booking-form-section">
          <div className="booking-card">
            <Row gutter={[24, 24]}>
              {/* User Details Form */}
              <Col xs={24} md={12}>
                <motion.div
                  className="booking-form"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                >
                  <Title level={3}>Your Details</Title>
                  <Form
                    layout="vertical"
                    onFinish={() => console.log("Booking submitted")}
                    form={form}
                    onValuesChange={handleFormValuesChange}
                    initialValues={{
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      age: user?.age || "",
                      username: user?.username || "",
                      email: user?.email || "",
                      address:
                        user?.address || "148 Strand, London WC2R 1JA, UK",
                    }}
                  >
                    <Form.Item name="profileImage">
                      <div className="profile-image-upload">
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt="avatar"
                            style={{
                              width: "100%",
                              borderRadius: "50%",
                              height: "100px",
                            }}
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
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Last Name"
                          name="lastName"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Age"
                          name="age"
                          rules={[{ required: true }]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Username"
                          name="username"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[{ required: true, type: "email" }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Address"
                          name="address"
                          rules={[
                            {
                              required: true,
                              message: "Please enter or select an address",
                            },
                          ]}
                        >
                          <Input
                            ref={addressInputRef}
                            id="address-input"
                            placeholder="Type to search…"
                            autoComplete="off"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className="map-container">
                      <div
                        id="map"
                        ref={mapRef}
                        style={{
                          width: "100%",
                          height: "300px",
                          position: "relative",
                        }}
                      />
                      {/* Map loading/error states */}
                      {!mapInitialized && !mapError && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "var(--surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text)",
                            zIndex: 10,
                          }}
                        >
                          Loading map...
                        </div>
                      )}
                      {mapError && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "var(--surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--error)",
                            zIndex: 10,
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          Failed to load Google Maps. Please try refreshing the
                          page.
                        </div>
                      )}
                    </div>
                  </Form>
                </motion.div>
              </Col>

              {/* Service Details and Previous Appointments */}
              <Col xs={24} md={12}>
                <motion.div
                  className="service-details"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedService ? (
                    <Card
                      hoverable
                      cover={
                        <Carousel autoplay>
                          <img
                            key={selectedService.id}
                            src={selectedService.imageUrl}
                            alt={`${selectedService.name}`}
                            className="card-image"
                          />
                        </Carousel>
                      }
                      style={{ border: "1px solid var(--primary)" }}
                    >
                      <Meta
                        title={selectedService.title}
                        description={selectedService.description}
                      />
                      <p>
                        <strong>Duration:</strong> {selectedService.duration}{" "}
                        hrs
                      </p>
                      <p>
                        <strong>Price:</strong> {selectedService.price} $
                      </p>
                    </Card>
                  ) : (
                    <Title level={3}>Please select a service</Title>
                  )}

                  {previousOrders.length > 0 && (
                    <>
                      <Title level={4} style={{ marginTop: 24 }}>
                        Your Previous Appointments
                      </Title>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Table
                          columns={columns}
                          dataSource={previousOrders}
                          rowKey="id"
                          pagination={false}
                          style={{ marginBottom: 24 }}
                        />
                      </motion.div>
                    </>
                  )}

                  <Button
                    className="neon-button"
                    onClick={() => navigate("/services")}
                    style={{ marginTop: 16 }}
                  >
                    Explore More Services
                  </Button>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Time Slots Section */}
        <section className="time-slots-section">
          <Title level={3}>Select a Time Slot</Title>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={6}>
              <RangePicker
                disabledDate={disabledDate}
                onChange={(dates) =>
                  setDateRange(dates?.map((d) => d.format("YYYY-MM-DD")))
                }
                placeholder={["Start Date", "End Date"]}
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  width: "100%",
                }}
              />
            </Col>
            <Col xs={24} md={2}>
              <Button
                className="neon-button date-button"
                type="primary"
                onClick={handleSearchClick}
                style={{ width: "100%" }}
              >
                Search
              </Button>
            </Col>
          </Row>
          {searchError && (
            <p
              style={{
                color: "var(--error)",
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              {searchError}
            </p>
          )}
          {renderTimeSlots()}
        </section>

        {/* Request Service Button */}
        <section
          className="request-service-section"
          style={{ padding: "20px" }}
        >
          <Button
            type="primary"
            className="neon-button"
            disabled={isRequestDisabled}
            onClick={() => console.log("Service Requested!")}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Request Service
          </Button>
        </section>

        {/* Modal for time slot selection */}
        <Modal
          title={null}
          footer={null}
          centered
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          bodyStyle={{
            textAlign: "center",
            padding: "20px 24px",
            width: "400px",
            height: "300px",
            borderRadius: "8px",
          }}
          style={{
            position: "fixed",
            bottom: 0,
            right: "20px",
            zIndex: 9999,
          }}
          className="message-modal"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Lottie
              animationData={successAnimation}
              style={{ height: 100, marginBottom: "16px" }}
              loop={false}
            />
            <Title level={4}>Time Slot Selected</Title>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              You selected: <strong>{selectedMessage}</strong>
            </p>
          </motion.div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Booking;
