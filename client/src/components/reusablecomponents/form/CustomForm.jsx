import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Upload,
  notification,
  DatePicker,
  TimePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { TextArea } = Input;

const CustomForm = ({ inputs, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize fileList from initialValues if provided (for file input with name "profileImage", adjust if needed)
  const [fileList, setFileList] = useState(() => {
    // If initialValues has a URL for the file input (for example, "profileImage"), use it
    if (initialValues && initialValues.image) {
      return [
        {
          uid: "-1",
          name: initialValues.image.split("/").pop(),
          status: "done",
          url: initialValues.imageUrl, // This should be a full URL (e.g., http://localhost:5000/uploads/images/filename.jpg)
        },
      ];
    }
    return [];
  });

  const onFinish = (values) => {
    setLoading(true);
    console.log("Form values:", values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: "Form Submitted",
        description: "Your form has been submitted successfully!",
      });
      form.resetFields();
      setFileList([]); // Clear file list after submission
      onSubmit(values); // Call the onSubmit prop
    }, 2000);
  };

  const beforeUpload = (file) => {
    const isImageOrVideo =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isImageOrVideo) {
      notification.error({
        message: "Invalid File Type",
        description: "You can only upload images or videos!",
      });
    }
    return isImageOrVideo;
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const renderInput = (input) => {
    switch (input.type) {
      case "text":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={input.rules}
          >
            <Input placeholder={input.placeholder} />
          </Form.Item>
        );
      case "email":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
              ...(input.rules || []),
            ]}
          >
            <Input placeholder={input.placeholder} />
          </Form.Item>
        );
      case "textarea":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={input.rules}
          >
            <TextArea rows={4} placeholder={input.placeholder} />
          </Form.Item>
        );
      case "date":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={input.rules}
          >
            <DatePicker
              disabledDate={input.disabledDate}
              style={{ width: "100%" }}
              format={input.format}
              placeholder={input.placeholder}
            />
          </Form.Item>
        );
      case "time":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={input.rules}
          >
            <TimePicker
              style={{ width: "100%" }}
              format={input.format}
              placeholder={input.placeholder}
            />
          </Form.Item>
        );
      case "file":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            label={input.label}
            rules={input.rules}
          >
            <Upload
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              fileList={fileList} // use the controlled fileList state
              listType="picture"
              accept="image/*,video/*"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        );
      case "checkbox":
        return (
          <Form.Item
            key={input.name}
            name={input.name}
            valuePropName="checked"
            rules={input.rules}
          >
            <Checkbox>{input.label}</Checkbox>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="custom-form"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form
        form={form}
        name="custom-form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={initialValues}
      >
        {inputs.map((input) => renderInput(input))}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="submit-button"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </motion.div>
  );
};

export default CustomForm;
