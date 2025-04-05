import React from "react";
import { Button } from "antd";

const CustomButton = ({
  type = "default", // default, warning, success, error
  onClick,
  children,
  disabled = false,
  loading = false,
}) => {
  // Determine button text based on functionality
  const getButtonText = () => {
    switch (type) {
      case "warning":
        return "Warning";
      case "success":
        return "Success";
      case "error":
        return "Error";
      default:
        return children || "Default";
    }
  };

  return (
    <Button
      className={`custom-button ${type}`}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      {getButtonText()}
    </Button>
  );
};

export default CustomButton;
