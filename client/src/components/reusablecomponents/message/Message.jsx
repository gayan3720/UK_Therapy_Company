import React from "react";
import { Alert } from "antd";

const Message = ({
  type = "info",
  message,
  description,
  closable = false,
  onClose,
  showIcon = true,
}) => {
  return (
    <Alert
      className="custom-alert"
      type={type}
      message={message}
      description={description}
      closable={closable}
      onClose={onClose}
      showIcon={showIcon}
    />
  );
};

export default Message;
