import React, { useState, useEffect } from "react";
import { Layout, Menu, Input, Avatar, Dropdown, Switch, Button } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getTheme, toggleTheme } from "../../../services/slices/themeSlice";
import logo from "../../../assets/images/logo.jpg";
import Title from "antd/es/typography/Title";
import { getUser, setUser } from "../../../services/slices/authSlice";
import { userRoles } from "../../../utils/enum";
import { Popconfirm } from "antd/lib";

const { Header } = Layout;
const { Search } = Input;

const NavBar = ({ isAdminRoute, isMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector(getTheme);
  const user = useSelector(getUser);
  const [visible, setVisible] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Toggle theme
  const handleThemeToggle = (checked) => {
    dispatch(toggleTheme(checked ? "dark" : "light"));
    document.documentElement.setAttribute(
      "data-theme",
      checked ? "dark" : "light"
    );
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    // Clear the user state
    dispatch(setUser({}));
    navigate("/");
    window.location.reload();
  };
  // User dropdown menu
  const userMenu1 = (
    <Menu>
      <Menu.Item key="username">{user?.username}</Menu.Item>
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="logout">
        <Popconfirm
          title="Are you sure you want to logout?"
          onConfirm={() => handleLogout()}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link">Logout</Button>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );
  const userMenu2 = (
    <Menu>
      <Menu.Item key="signin">
        <Link to={"/signin"}>Signin</Link>
      </Menu.Item>
      <Menu.Item key="signup">
        <Link to={"/signup"}>Signup</Link>
      </Menu.Item>
    </Menu>
  );

  // Use exact route paths as keys for consistency
  const items = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/about", label: <Link to="/about">About Us</Link> },
    { key: "/services", label: <Link to="/services">Services</Link> },
    { key: "/contact", label: <Link to="/contact">Contact</Link> },
    { key: "/book", label: <Link to="/book">Book Now</Link> },
    !isMobile &&
      (user.roleID === userRoles.admin ||
        user.roleID === userRoles.subAdmin) && {
        key: "/admin",
        label: <Link to="/admin">Admin Panel</Link>,
      },
  ].filter(Boolean);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const halfPageHeight = window.innerHeight / 2;
      setNavbarVisible(window.scrollY <= halfPageHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Header className={`navbar ${navbarVisible ? "visible" : ""}`}>
      <div className="logo">
        <img src={logo} alt="MST" style={{ height: "40px", width: "40px" }} />
        <Title level={3}>Master Sports Therapy</Title>
      </div>

      {/* Desktop Menu */}
      <Menu
        theme={theme === "dark" ? "dark" : "light"}
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        className="desktop-menu"
      />

      {/* Search Bar */}
      <Search
        placeholder="Search..."
        className="search-bar"
        onSearch={(value) => console.log(value)}
      />

      {/* Theme Toggle */}
      <Switch
        checked={theme === "dark"}
        onChange={handleThemeToggle}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        className="theme-toggle"
      />

      {/* User Avatar */}
      <Dropdown overlay={token ? userMenu1 : userMenu2} trigger={["click"]}>
        <Avatar
          src={user?.imageUrl || undefined}
          icon={!user?.imageUrl ? <UserOutlined /> : null}
          className="user-avatar"
        />
      </Dropdown>

      {/* Mobile Hamburger Menu */}
      <div className="hamburger-menu" onClick={() => setVisible(!visible)}>
        <MenuOutlined />
      </div>

      {/* Mobile Menu */}
      <Menu
        theme={theme === "dark" ? "dark" : "light"}
        mode="vertical"
        selectedKeys={[location.pathname]}
        items={items}
        className={`mobile-menu ${visible ? "visible" : ""}`}
      />
    </Header>
  );
};

export default NavBar;
