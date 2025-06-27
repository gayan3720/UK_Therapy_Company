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
  Typography,
  ConfigProvider,
  Table,
  Space,
  Tooltip,
  message,
  Select,
} from "antd";
import { UserOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import aboutDark from "../../assets/images/about-hero-dark.jpg";
import aboutLight from "../../assets/images/about-hero-light.jpg";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";
import { useGetAllTimeslotsMutation } from "../../services/apislices/timeslotsApiSlice";
import dayjs from "dayjs";

import { motion } from "framer-motion";
import Meta from "antd/es/card/Meta";
import { getUser } from "../../services/slices/authSlice";
import { useNavigate } from "react-router-dom";
import {
  useCreateAppointmentMutation,
  useGetUserAppointmentsQuery,
  useUpdateAppointmentMutation,
} from "../../services/apislices/appointmentApiSlice";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import {
  useGetAllServicesQuery,
  useLazyGetServiceByIdQuery,
} from "../../services/apislices/serviceApiSlice";
import moment from "moment";
import MessageModel from "../../components/cutommessage/MessageModel";
import TextArea from "antd/es/input/TextArea";
import {
  getCountryCodes,
  getDialCode,
  getPhoneNumber,
} from "../../utils/commonFunctions";

import raw from "../../utils/country-codes.json";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const { data: latestServices, isLoading: isAllServicesLoading } =
    useGetAllServicesQuery();
  const [
    createAppointment,
    {
      data: createData,
      isLoading: isCreateLoading,
      isSuccess: isCreateSuccess,
    },
  ] = useCreateAppointmentMutation();
  const [
    updateAppointment,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
    },
  ] = useUpdateAppointmentMutation();

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userData, setUserData] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [dateRange, setDateRange] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState({});

  const [visible, setVisible] = useState(false); // Controls message visibility
  const [messageType, setMessageType] = useState(""); // Sets the type of message (success, error, etc.)
  const [messageText, setMessageText] = useState(""); // Sets the message content
  const [timeSlotsID, setTimeSlotsID] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [showSuffix, setShowSuffix] = useState(true);

  // Function to show the message
  const triggerMessage = (type, text) => {
    setMessageType(type);
    setMessageText(text);
    setVisible(true); // Make message visible
  };

  useEffect(() => {
    if (isCreateSuccess) {
      if (createData.result === 1 && createData.data) {
        triggerMessage("success", createData.message);
        navigate("/");
      } else if (createData.result === 1 && !createData.data) {
        triggerMessage("warning", createData.message);
      } else {
        triggerMessage(
          "error",
          "Internal server error. Please try again later."
        );
      }
    }
  }, [isCreateSuccess, createData]);

  useEffect(() => {
    if (isUpdateSuccess) {
      if (updateData.result === 1 && updateData.data) {
        triggerMessage("success", updateData.message);
        navigate("/");
      } else if (updateData.result === 1 && !updateData.data) {
        triggerMessage("warning", updateData.message);
      } else {
        triggerMessage(
          "error",
          "Internal server error. Please try again later."
        );
      }
    }
  }, [isUpdateSuccess, updateData]);

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
        contactNumber: getPhoneNumber(user.contactNumber || "") || "",
        countryCode: getDialCode(user.contactNumber || "") || "",
      });
    } else {
      form.setFieldsValue({
        address: "148 Strand, London WC2R 1JA, UK",
      });
    }

    // Load saved service
    const savedService = localStorage.getItem("bookingSelectedService");
    if (savedService) {
      setSelectedService(savedService);
    } else {
      setSelectedService(null);
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
    setFormValues(allValues);
    localStorage.setItem("bookingFormData", JSON.stringify(allValues));

    // Update map when address changes
    if (changedValues.address && mapInitialized) {
      updateMapLocation(changedValues.address);
    }
  };

  // Previous appointments setup
  useEffect(() => {
    if (userAppointments && userAppointments.data) {
      const filteredList = userAppointments.data?.filter((i) => {
        return i.isPending !== 1;
      });
      const filteredListPending = userAppointments.data?.filter((i) => {
        return i.isPending === 1;
      });

      const newList = filteredList.map((item) => ({
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
      const pendingAppointment = userAppointments.data?.some(
        (appointment) => appointment.isPending === 1
      );

      setHasPendingAppointment(pendingAppointment);
      if (!pendingAppointment) {
        setSelectedService(null);
        localStorage.removeItem("bookingSelectedService");
      } else {
        setPendingAppointments(
          filteredListPending ? filteredListPending[0] : []
        );
        setSelectedService({
          id: filteredListPending[0].serviceID,
          name: filteredListPending[0].serviceName,
          description: filteredListPending[0].description,
          price: filteredListPending[0].price,
          image: filteredListPending[0].image,
          imageUrl: filteredListPending[0].imageUrl,
        });
        localStorage.setItem(
          "bookingSelectedService",
          JSON.parse(
            filteredListPending[0].serviceID,
            filteredListPending[0].serviceName,
            filteredListPending[0].description,
            filteredListPending[0].price,
            filteredListPending[0].image,
            filteredListPending[0].imageUrl
          )
        );
      }
    } else {
      setPreviousOrders([]);
      setSelectedService(null);
      localStorage.removeItem("bookingSelectedService");
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
          {!record.isCompleted && (
            <Tooltip title="Edit Appointment">
              <Button
                className="neon-button"
                icon={<EditOutlined />}
                onClick={() => handleEditAppointment(record.id)}
                type="default"
              />
            </Tooltip>
          )}
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

  const handleEditAppointment = async () => {};

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
        timeSlotID: slot.id,
        timeRange: `${formatTime(slot.startTime)} - ${formatTime(
          slot.endTime
        )}`,
        isBooked: slot.isBooked,
      };
      const existing = grouped.find((item) => item.date === date);
      if (existing) {
        existing.times.push(timeRange);
      } else {
        grouped.push({
          date: date,
          day: slot.dayOfWeek,
          times: [timeRange],
        });
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
      setSearchError("Please select a valid date range.");
      setTimeSlots([]);
    }
  };

  // Handle time slot selection
  const handleTimeSlotClick = (date, time, slotID) => {
    const selected = `${date} - ${time}`;
    setSelectedTimeSlot(selected);
    triggerMessage("success", `You selected ${selected} timeslot.! `);
    setTimeSlotsID(slotID);
    console.log(slotID, "selected time slot ID");
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
            console.log(daySlot, time, tIdx, "log");

            const isBooked = time.isBooked === 1;
            const isSelected =
              selectedTimeSlot === `${daySlot.date} - ${time.timeRange}`;
            return (
              <Button
                key={tIdx}
                type={isSelected ? "primary" : "default"}
                disabled={isBooked}
                onClick={() =>
                  handleTimeSlotClick(
                    daySlot.date,
                    time.timeRange,
                    time.timeSlotID
                  )
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
    return !form.getFieldsError().some(({ errors }) => errors.length);
  };

  const isRequestDisabled = !isFormValid() || !selectedTimeSlot;

  const handleSaveAppointment = async () => {
    if (!hasPendingAppointment) {
      const data = {
        serviceID: selectedService.id,
        timeslotID: timeSlotsID,
        paymentMethod: "Cash",
        comments: formValues.comment || "",
        age: parseInt(formValues.age, 10) || null,
        address: formValues.address || "148 Strand, London WC2R 1JA, UK",
        serviceRequestedDate: moment(new Date()).format("YYYY-MM-DD HH:mm"),
        contactNumber:
          formValues.countryCode + " " + formValues.contactNumber || null,
      };
      console.log(data, "data to be sent");
      await createAppointment(data).unwrap();
    } else {
      const data = {
        appointmentID: pendingAppointments.id,
        serviceID: selectedService.id,
        timeslotID: timeSlotsID,
        paymentMethod: "Cash",
        comments: formValues.comment || "",
        age: parseInt(formValues.age, 10) || null,
        address: formValues.address || "148 Strand, London WC2R 1JA, UK",
        serviceRequestedDate: moment(new Date()).format("YYYY-MM-DD HH:mm"),
        contactNumber:
          formValues.countryCode + " " + formValues.contactNumber || null,
      };
      await updateAppointment(data).unwrap();
    }
  };

  const onSelectService = (data) => {
    setSelectedService(data);
  };

  const onCountryCodeSearch = (value) => {};

  const handleChange = (value) => {
    // Hide suffix once a value is selected
    setShowSuffix(false);
  };

  const countryArray = getCountryCodes(raw);

  if (
    isUserAppointmentsLoading ||
    isAllServicesLoading ||
    isCreateLoading ||
    isUpdateLoading
  )
    return <DataFetchingLoader />;

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
              {/* Column 1: previous orders + latest services */}
              <Col xs={24} md={12}>
                {previousOrders.length > 0 && (
                  <>
                    <Title
                      level={3}
                      style={{ marginTop: 24, textTransform: "uppercase" }}
                    >
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
              </Col>
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
                        <Form.Item label="First Name" name="firstName">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Last Name" name="lastName">
                          <Input disabled />
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
                        <Form.Item label="Username" name="username">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Comment" name="comment">
                          <TextArea
                            placeholder="Add your comment here.."
                            autoComplete="off"
                            maxLength={200}
                            rows={1}
                            autoSize={{ minRows: 1, maxRows: 2 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        {" "}
                        <Form.Item label="Email" name="email">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Input disabled defaultValue={"Cash"} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        {" "}
                        <Form.Item
                          label="Phone Number"
                          name="contactNumber"
                          rules={[
                            {
                              required: true,
                              message: "Please enter your phone number.!",
                            },
                          ]}
                          style={{ marginBottom: 16 }}
                        >
                          <Input.Group compact>
                            <Form.Item
                              name="countryCode"
                              noStyle
                              rules={[
                                {
                                  required: true,
                                  message: "Select country code.!",
                                },
                              ]}
                            >
                              <Select
                                onChange={handleChange}
                                showSearch
                                popupMatchSelectWidth={false}
                                placement="bottomRight"
                                optionFilterProp="children"
                                // this tells it to filter against the Option's children text
                                filterOption={(input, option) =>
                                  (option?.children ?? "")
                                    .toString()
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                className="prefix-select"
                                style={{ width: 50 }}
                                onSearch={onCountryCodeSearch}
                                suffixIcon={
                                  showSuffix ? (
                                    <span
                                      style={{
                                        fontSize: "16px",
                                        color: "var(--text)",
                                      }}
                                    >
                                      🌐
                                    </span>
                                  ) : null
                                }
                              >
                                {countryArray.map((cc) => (
                                  <Option key={cc.iso2} value={cc.dial_code}>
                                    {cc.iso2.toUpperCase()} {cc.dial_code}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              name="contactNumber"
                              noStyle
                              rules={[
                                {
                                  pattern: /^[0-9]{6,14}$/,
                                  message: "Must be 6–14 digits.!",
                                },
                              ]}
                            >
                              <Input
                                style={{ width: "calc(100% - 50px)" }}
                                placeholder="e.g. 772123456"
                                className="phone-input"
                              />
                            </Form.Item>
                          </Input.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}></Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Address"
                          name="address"
                          rules={[
                            {
                              required: true,
                              message: "Please enter or select an address.!",
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
                        title={selectedService.name}
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
                </motion.div>
              </Col>
              <Col xs={24} md={12}>
                <div className="latest-services">
                  {latestServices &&
                    latestServices.data?.map((s) => (
                      <Card
                        key={s.id}
                        hoverable
                        className={`service-card ${
                          selectedService?.id === s.id ? "selected" : ""
                        }`}
                        cover={<img src={s.imageUrl} alt={s.title} />}
                        onClick={() => onSelectService(s)}
                      >
                        <Meta
                          title={s.name}
                          description={`${s.description} $`}
                        />
                        <p>
                          <strong>Duration:</strong> {s.duration} hrs
                        </p>
                        <p>
                          <strong>Price:</strong> {s.price} $
                        </p>
                      </Card>
                    ))}
                  <Button
                    className="explore-button"
                    onClick={() => navigate("/services")}
                  >
                    Explore More Services
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Time Slots Section */}
        <section className="time-slots-section">
          {hasPendingAppointment ? (
            <Title level={3}>{`You have selected ${
              pendingAppointments.startTime
            } - ${pendingAppointments.endTime} on ${moment(
              pendingAppointments.dateOftimeslots
            ).format("MM/DD/YYYY")}`}</Title>
          ) : (
            <Title level={3}>Select a Time Slot</Title>
          )}
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
            onClick={handleSaveAppointment}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {hasPendingAppointment ? "Edit Appointment" : "Request Appointment"}
          </Button>
        </section>

        {/* Modal for time slot selection */}
      </div>
      <MessageModel
        messageType={messageType}
        messageText={messageText}
        visible={visible}
        setVisible={setVisible}
      />
    </ConfigProvider>
  );
};

export default Booking;
