import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography } from "antd";
// import { GoogleOutlined } from "@ant-design/icons";
import {
  useLazyGetUserByIdQuery,
  useLoginUserMutation,
} from "../../services/apislices/authApiSlice";
import { useNavigate } from "react-router-dom";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../../services/slices/authSlice";
import MessageModel from "../../components/cutommessage/MessageModel";
import { getTheme } from "../../services/slices/themeSlice";
import logo_light from "../../assets/images/logo-light.png";
import logo_dark from "../../assets/images/logo-dark.png";

const { Title, Text } = Typography;

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(getTheme);

  const [loginUser, { isLoading, data, isSuccess }] = useLoginUserMutation();
  const [trigger, { data: user, isLoading: isGetUserByIDLoading }] =
    useLazyGetUserByIdQuery();

  const [visible, setVisible] = useState(false); // Controls message visibility
  const [messageType, setMessageType] = useState(""); // Sets the type of message (success, error, etc.)
  const [messageText, setMessageText] = useState(""); // Sets the message content

  // Function to show the message
  const triggerMessage = (type, text) => {
    setMessageType(type);
    setMessageText(text);
    setVisible(true); // Make message visible
  };

  useEffect(() => {
    if (data) {
      if (data.result === 1 && data.data) {
        triggerMessage("success", data.message);
        localStorage.setItem("token", data.data);
        const decodedToken = jwtDecode(data.data);
        trigger(decodedToken.id);
        navigate("/");
      } else if (data.result === 1 && !data.data) {
        triggerMessage("warning", data.message);
      } else {
        triggerMessage("error", data.message);
      }
    }
  }, [data]);

  useEffect(() => {
    if (user !== null && user !== undefined) {
      dispatch(setUser(user.data));
    } else {
      dispatch(setUser({}));
    }
  }, [user, dispatch]);

  const onFinish = async (values) => {
    const data = {
      username: values.username,
      password: values.password,
    };

    await loginUser(data).unwrap();
  };

  let content;

  if (isLoading) {
    content = <DataFetchingLoader />;
  }
  if (isGetUserByIDLoading) {
    content = <DataFetchingLoader />;
  }

  return (
    <div className="main-login-container">
      {content}
      <div className="login-page-container">
        <div className="login-card">
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
              color: "var(--text)", // Primary color
              letterSpacing: "1px", // Add spacing between letters
            }}
          >
            Sign In
          </Title>
          <Form
            name="login_form"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ remember: true }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input placeholder="Enter your username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="signin-button"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* <Button
            type="default"
            icon={<GoogleOutlined />}
            className="google-signup-button"
          >
            Sign in with Google
          </Button> */}

          <div className="signup-link">
            <Text>
              Don’t have an account? <a href="/signup">Sign Up</a>
            </Text>
          </div>
        </div>
      </div>
      {/* MessageModel triggered inside App.js */}
      <MessageModel
        messageType={messageType}
        messageText={messageText}
        visible={visible}
        setVisible={setVisible}
      />
    </div>
  );
};

export default SignIn;
