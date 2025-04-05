import React, { useState } from "react";
import { Button } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  HomeOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";

const FloatingButton = () => {
  const [open, setOpen] = useState(false);

  // Handler functions for each button action
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTheme = () => {
    // Your theme toggle logic here
    console.log("Toggle theme");
  };

  const goHome = () => {
    window.location.href = "/"; // Replace with your routing logic if needed
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/yourNumber", "_blank");
  };

  return (
    <div
      className="floating-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={`floating-buttons ${open ? "open" : ""}`}>
        <Button
          className="floating-button scroll-top"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
        />
        <Button
          className="floating-button toggle-theme"
          shape="circle"
          icon={<BulbOutlined />}
          onClick={toggleTheme}
        />
        <Button
          className="floating-button home"
          shape="circle"
          icon={<HomeOutlined />}
          onClick={goHome}
        />
        <Button
          className="floating-button whatsapp"
          shape="circle"
          icon={<WhatsAppOutlined />}
          onClick={openWhatsApp}
        />
      </div>
      <Button
        className="floating-main-button"
        shape="circle"
        icon={<PlusOutlined rotate={open ? 45 : 0} />}
        onClick={() => setOpen(!open)}
      />
    </div>
  );
};

export default FloatingButton;
