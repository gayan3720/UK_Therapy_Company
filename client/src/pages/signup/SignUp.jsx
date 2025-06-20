import React, { useState } from "react";
import { Form, Input, Button, Typography, Row, Col, Upload } from "antd";
import {
  GoogleOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRegisterUserMutation } from "../../services/apislices/authApiSlice";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import { userRoles } from "../../utils/enum";
import Message from "../../components/reusablecomponents/message/Message";
import { useNavigate } from "react-router-dom";
import logo_light from "../../assets/images/logo-light.png";
import logo_dark from "../../assets/images/logo-dark.png";
import { useSelector } from "react-redux";
import { getTheme } from "../../services/slices/themeSlice";

const { Title, Text } = Typography;

// Helper to convert uploaded image file to base64
const getBase64 = (file, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(file);
};

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useSelector(getTheme);

  const [profileImage, setProfileImage] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm(); // Create an instance of the Form

  // RTK Query mutation hook for registration
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const onFinish = async (values) => {
    console.log("Form values: ", values);
    try {
      // Create FormData to handle multipart/form-data request
      const formData = new FormData();
      if (profileFile) {
        formData.append("image", profileFile);
      }
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("userName", values.username);
      formData.append("password", values.password);
      formData.append("email", values.email);
      formData.append("roleID", userRoles.user);
      formData.append("createdDate", new Date().toISOString());
      formData.append("createdBy", 0);

      //call the registration mutation
      const result = await registerUser(formData).unwrap();
      if (result && result.result === 1) {
        <Message
          type="success"
          message="Successful"
          description={result.message}
          closable
        />;
        form.resetFields(); // Reset form fields after successful registration
        setProfileImage("");
        setProfileFile("");
        navigate("/signin");
      } else {
        <Message
          type="error"
          message="Error"
          description={result.message}
          closable
        />;
      }
    } catch (error) {
      <Message
        type="error"
        message="Error"
        description={error.data || error.message}
        closable
      />;

      console.error(error);
    }
  };
  let content;
  if (isLoading) {
    content = <DataFetchingLoader />;
  }

  return (
    <>
      {content}
      <div className="login-page-container-signup">
        <div className="login-card-signup">
          {/* Add logo above the title */}
          <div className="logo-container">
            <img
              src={theme === "light" ? logo_light : logo_dark}
              alt="Company Logo"
              className="login-logo"
            />
          </div>

          {/* Updated title with custom styling */}
          <Title
            level={2}
            className="login-title"
            style={{
              fontSize: "1.5rem", // Reduced font size
              textTransform: "uppercase", // Uppercase text
              fontWeight: 700, // Bold weight
              color: "var(--primary)", // Primary color
              letterSpacing: "1px", // Add spacing between letters
              marginTop: "10px", // Add space between logo and title
            }}
          >
            Sign Up
          </Title>
          <Form
            name="signup_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={(error) => {
              console.log(error);
            }}
          >
            {/* Inline Profile Image Upload */}
            <Form.Item name="profileImage" getValueFromEvent={(e) => e}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                onChange={(info) => {
                  if (info.file.status === "uploading") {
                    setUploading(true);
                    return;
                  }
                  if (info.file.status === "done") {
                    getBase64(info.file.originFileObj, (url) => {
                      setUploading(false);
                      setProfileImage(url);
                      setProfileFile(info.file.originFileObj);
                    });
                  }
                }}
                customRequest={({ onSuccess }) => {
                  // Simulate instant upload success
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="avatar"
                    style={{ width: "100%", borderRadius: "50%" }}
                  />
                ) : (
                  <div>
                    {uploading ? (
                      <LoadingOutlined style={{ fontSize: 40 }} />
                    ) : (
                      <UserOutlined style={{ fontSize: 40 }} />
                    )}
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your first name.!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your last name.!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your last name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: "Please enter your username.!" },
                  ]}
                >
                  <Input placeholder="Enter your username" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Please enter a valid email.!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Password :"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your password .!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your password]" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Confirm Password :"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your password again.!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your password again" />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="signin-button"
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          {/* Google Sign Up Button */}
          {/* <Button
              type="default"
              icon={<GoogleOutlined />}
              className="google-signup-button"
            >
              Sign up with Google
            </Button> */}

          {/* Link to Sign In */}
          <div className="signup-link">
            <Text>
              Already have an account? <a href="/signin">Sign In</a>
            </Text>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
