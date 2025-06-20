import React, { useState, useEffect, useRef } from "react";
import { Drawer, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  MenuOutlined, // The hamburger icon for opening the menu
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const SideMenu = () => {
  const [visible, setVisible] = useState(false); // Drawer visibility state
  const [collapsed, setCollapsed] = useState(true); // Menu collapsed state
  const location = useLocation(); // To get the current active route
  const menuButtonRef = useRef(null); // Reference for the menu button

  // Toggle the drawer
  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  // Close the drawer when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(e.target)) {
        setVisible(false); // Close drawer when clicking outside
        setCollapsed(true); // Reset the menu button state
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menu Items for navigation
  const menuItems = [
    {
      key: "/admin",
      icon: <HomeOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/usermanagement",
      icon: <UserOutlined />,
      label: <Link to="/admin/usermanagement">User Management</Link>,
    },
    {
      key: "/admin/servicemanagement",
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/servicemanagement">Service Management</Link>,
    },
    {
      key: "/admin/appointmentmanagement",
      icon: <BookOutlined />,
      label: (
        <Link to="/admin/appointmentmanagement">Appointment Management</Link>
      ),
    },
    {
      key: "/admin/timeslotmanagement",
      icon: <ClockCircleOutlined />,
      label: <Link to="/admin/timeslotmanagement">Time-slot Management</Link>,
    },
    {
      key: "/admin/reportsdownload",
      icon: <BarChartOutlined />,
      label: <Link to="/admin/reportsdownload">Reports</Link>,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">Settings</Link>,
    },
  ];

  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        {/* Open Menu Button */}
        <motion.button
          className="open-menu-btn"
          onClick={showDrawer}
          ref={menuButtonRef}
          whileHover={{ scale: 1.1 }}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <MenuOutlined />
        </motion.button>
      </div>

      {/* Drawer Component (Slide-out Menu) */}
      <Drawer
        title="ADMIN MENU"
        placement="left"
        closable={false}
        onClose={closeDrawer}
        visible={visible}
        width={240} // Drawer width
        bodyStyle={{ padding: 0 }}
        className="animated-drawer"
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={closeDrawer} // Close drawer on item click
        />
      </Drawer>
    </>
  );
};

export default SideMenu;
