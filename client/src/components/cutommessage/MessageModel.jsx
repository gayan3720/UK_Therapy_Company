import React, { useEffect } from "react";
import {
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const MessageModel = ({ messageType, messageText, visible, setVisible }) => {
  const getIcon = (type) => {
    const iconStyle = { fontSize: "28px", marginBottom: "10px" };

    switch (type) {
      case "success":
        return (
          <CheckCircleOutlined style={{ ...iconStyle, color: "#10b981" }} />
        );
      case "error":
        return (
          <CloseCircleOutlined style={{ ...iconStyle, color: "#ef4444" }} />
        );
      case "warning":
        return (
          <ExclamationCircleOutlined
            style={{ ...iconStyle, color: "#f59e0b" }}
          />
        );
      default:
        return <CheckCircleOutlined style={iconStyle} />;
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Close after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [visible, setVisible]);

  if (!visible) return null;

  return (
    <div className="message-overlay">
      <div className={`message-container ${messageType}`}>
        <div className="message-header">
          <button className="close-btn" onClick={handleClose}>
            <CloseOutlined />
          </button>
        </div>
        <div className="message-content">
          {getIcon(messageType)}
          <p>{messageText}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageModel;
