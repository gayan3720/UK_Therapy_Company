import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const { Sider } = Layout;

const SideBar = ({ isTablet }) => {
  const [collapsed, setCollapsed] = useState(isTablet); // Collapsed by default on tablets
  const location = useLocation();

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Update keys to exactly match the route paths
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
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapse}
      className="sidebar"
      trigger={null} // Hide default collapse button
    >
      <div className="sidebar-content">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </div>
      <div className="sidebar-footer">
        <Button
          type="text"
          onClick={toggleCollapse}
          className="collapse-button"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </motion.div>
        </Button>
      </div>
    </Sider>
  );
};

export default SideBar;
