import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  notification,
  DatePicker,
  TimePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { TextArea } = Input;

const CustomForm = ({ inputs, onSubmit, initialValues = {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Populate form and fileList when initialValues change
  useEffect(() => {
    console.log(initialValues, "init");

    form.setFieldsValue(initialValues);
    if (initialValues.image) {
      const initFile = initialValues.image;
      const initFileUrl = initialValues.imageUrl;
      setFileList([
        {
          uid: initFile.uid || "-1",
          name: initFile.name || initFile.split("/").pop(),
          status: "done",
          url: initFileUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [initialValues, form]);

  const beforeUpload = (file) => {
    const isValid =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isValid) {
      notification.error({
        message: "Invalid File Type",
        description: "You can only upload images or videos!",
      });
    }
    // Prevent auto upload
    return false;
  };

  const handleFileChange = ({ fileList: newList }) => {
    setFileList(newList);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Attach fileList as `image` value for parent
      if (fileList.length > 0) {
        values.image = fileList[0]; // include either originFileObj or url metadata
      }
      console.log(values, "values");

      await onSubmit(values);

      notification.success({
        message: "Success",
        description: "Form submitted successfully!",
      });

      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Submission Error",
        description: "There was a problem submitting the form.",
      });
    } finally {
      setLoading(false);
    }
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
              onWheel={(e) => e.currentTarget.blur()}
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
              fileList={fileList}
              listType="picture"
              accept="image/*,video/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        {inputs.map((input) => renderInput(input))}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </motion.div>
  );
};

export default CustomForm;
