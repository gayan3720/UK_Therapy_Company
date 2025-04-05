import React, { useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import {
  useLazyGetUserByIdQuery,
  useLoginUserMutation,
} from "../../services/apislices/authApiSlice";
import { useNavigate } from "react-router-dom";
import DataFetchingLoader from "../../components/reusablecomponents/loaders/DataFetchingLoader";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../../services/slices/authSlice";

const { Title, Text } = Typography;

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading, data, error, isSuccess }] =
    useLoginUserMutation();
  const [
    trigger,
    { data: user, isLoading: isGetUserByIDLoading, error: getUserByIDError },
  ] = useLazyGetUserByIdQuery();

  useEffect(() => {
    if (isSuccess) {
      localStorage.setItem("token", data.data);
      if (data.data) {
        const decodedToken = jwtDecode(data.data);
        trigger(decodedToken.id);
      }
      message.success(data.message);
      navigate("/");
    }
  }, [isSuccess, navigate, data, dispatch, trigger]);

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
  if (isLoading) return <DataFetchingLoader />;
  if (isGetUserByIDLoading) return <DataFetchingLoader />;

  return (
    <div className="login-page-container">
      <div className="login-card">
        <Title level={2} className="login-title">
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
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="signin-button">
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="default"
          icon={<GoogleOutlined />}
          className="google-signup-button"
        >
          Sign in with Google
        </Button>

        <div className="signup-link">
          <Text>
            Don’t have an account? <a href="/signup">Sign Up</a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
