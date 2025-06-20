import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Input, Avatar, Button, Popconfirm, Tooltip } from "antd";
import {
  UserOutlined,
  BellOutlined,
  CalendarOutlined,
  GlobalOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTheme, setTheme } from "../../../services/slices/themeSlice";
import { getUser, setUser } from "../../../services/slices/authSlice";
import logo_light from "../../../assets/images/logo-light.png";
import logo_dark from "../../../assets/images/logo-dark.png";
import { userRoles } from "../../../utils/enum";
import { useTranslation } from "react-i18next";
import GBFlag from "../../../assets/images/gb.png"; // Import GB Flag image
import FRFlag from "../../../assets/images/fr.png"; // Import FR Flag image
import ESFlag from "../../../assets/images/es.png"; // Import ES Flag image
import LottieAninationMenu from "../../lottieanimation/LottieAninationMenu";

const { Header } = Layout;
const { Search } = Input;

const UserProfileMenu = ({ user, handleLogout, token }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const toggleDropdown = () => {
    if (token) {
      setDropdownVisible((prev) => !prev);
    }
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };
  return (
    <div
      className="user-avatar-container"
      ref={containerRef}
      onMouseLeave={closeDropdown}
    >
      <Avatar
        className="user-avatar"
        src={user?.imageUrl || undefined}
        icon={!user?.imageUrl && <UserOutlined />}
        onClick={toggleDropdown}
      />
      {token && isDropdownVisible && (
        <div className="user-dropdown-menu show">
          <div className="user-header">
            <Avatar
              size={64}
              src={user?.imageUrl || undefined}
              icon={!user?.imageUrl && <UserOutlined />}
            />
            <div className="user-info">
              <h3>{user?.username || "Guest"}</h3>
            </div>
          </div>
          <Menu theme="light" className="menu-items" mode="vertical">
            <Menu.Item key="profile" icon={<UserOutlined />}>
              {t("profile")}
            </Menu.Item>
            <Menu.Item key="notifications" icon={<BellOutlined />}>
              {t("notifications")}
            </Menu.Item>
            <Menu.Item key="appointments" icon={<CalendarOutlined />}>
              {t("appointments")}
            </Menu.Item>
            <Menu.Item key="settings" icon={<GlobalOutlined />}>
              {t("settings")}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" className="logout-item">
              <Popconfirm
                title={t("logoutConfirmation")}
                onConfirm={handleLogout}
                okText="Yes"
                cancelText="No"
                placement="left"
              >
                <Button className="logout-button" type="primary" danger block>
                  {t("logout")}
                </Button>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        </div>
      )}
    </div>
  );
};

const NavBar = ({ isAdminRoute, scrolled, width, hideTop, hideBottom }) => {
  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector(getTheme);
  const user = useSelector(getUser);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setUser({}));
    navigate("/");
  };

  const items = [
    { key: "/", label: <Link to="/">{t("home")}</Link> },
    { key: "/about", label: <Link to="/about">{t("aboutUs")}</Link> },
    { key: "/services", label: <Link to="/services">{t("services")}</Link> },
    { key: "/contact", label: <Link to="/contact">{t("contact")}</Link> },
    { key: "/book", label: <Link to="/book">{t("bookNow")}</Link> },
    !(width < 768) &&
      (user.roleID === userRoles.admin ||
        user.roleID === userRoles.subAdmin) && {
        key: "/admin",
        label: <Link to="/admin">{t("adminPanel")}</Link>,
      },
    width < 768 &&
      !token && {
        key: "/signin",
        label: <Link to="/signin ">{t("signIn")}</Link>,
      },
    width < 768 &&
      !token && {
        key: "/signup",
        label: <Link to="/signup">{t("signUp")}</Link>,
      },
  ].filter(Boolean);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setPopupVisible(false);
  };

  // Detect clicks outside the language dropdown to close it
  const handleClickOutside = (e) => {
    if (
      buttonRef.current?.contains(e.target) ||
      popupRef.current?.contains(e.target)
    ) {
      return;
    }
    setPopupVisible(false);
  };

  // (3) attach/detach listener on mount/unmount
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <Header
      className={`navbar ${theme} ${scrolled ? "scrolled" : ""} ${
        hideTop ? "hide-top" : ""
      } ${hideBottom ? "hide-bottom" : ""}`}
    >
      {/* Top Row */}
      {width >= 768 && (
        <div className={`navbar-top-row ${scrolled ? "scrolled" : ""}`}>
          <div className="top-left">
            {formattedDate} | {formattedTime}
          </div>
          <div className="top-right">
            {!token ? (
              <>
                <Link to="/signin" className="signin-button">
                  {t("signIn")}
                </Link>
                <Link to="/signup" className="signup-button">
                  {t("signUp")}
                </Link>
              </>
            ) : null}

            <button
              className="language-button"
              onClick={() => setPopupVisible((v) => !v)}
              ref={buttonRef}
            >
              <img
                src={
                  i18n.language === "en"
                    ? GBFlag
                    : i18n.language === "fr"
                    ? FRFlag
                    : ESFlag
                }
                alt="language flag"
                style={{ width: "24px", height: "16px" }}
              />
            </button>
          </div>
        </div>
      )}
      {popupVisible && (
        <div className="language-popup show" ref={popupRef}>
          <ul>
            <li onClick={() => changeLanguage("en")}>
              <img src={GBFlag} alt="GB Flag" /> English
            </li>
            <li onClick={() => changeLanguage("fr")}>
              <img src={FRFlag} alt="FR Flag" /> Français
            </li>
            <li onClick={() => changeLanguage("es")}>
              <img src={ESFlag} alt="ES Flag" /> Español
            </li>
          </ul>
        </div>
      )}

      {/* Bottom Row */}
      <div className={`navbar-bottom-row ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <div className="logo-container">
          <Link to="/" className="logo">
            <img
              src={theme === "light" ? logo_light : logo_dark}
              alt="Master Sports Therapy Logo"
            />
          </Link>
        </div>

        {width < 768 || (768 <= width && width < 1024) ? null : (
          <Menu
            theme="light"
            className="desktop-menu"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={items}
          />
        )}
        {/* Search Bar */}

        <div className="search-wrapper">
          <Search
            placeholder={t("searchPlaceholder") || "Search..."}
            allowClear
            enterButton={<SearchOutlined />}
            className="search-bar"
            onSearch={(val) => console.log("Searching for:", val)}
          />
        </div>
        {width > 768 && (
          <>
            {/* Theme Toggle */}
            <Tooltip
              title={theme === "light" ? t("switchToDark") : t("switchToLight")}
            >
              <Button
                className="theme-toggle-button"
                type="text"
                onClick={() => {
                  const newTheme = theme === "light" ? "dark" : "light";
                  dispatch(setTheme(newTheme));
                }}
              >
                {theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              </Button>
            </Tooltip>

            {/* User Avatar */}
            <UserProfileMenu
              user={user}
              handleLogout={handleLogout}
              token={token}
            />
          </>
        )}
        {/* Mobile Menu */}
        {mobileMenuVisible && (
          <div className="mobile-menu">
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={items}
            />
          </div>
        )}
        {/* Hamburger Button */}
        {width < 768 && (
          <>
            {/* User Avatar */}
            <UserProfileMenu
              user={user}
              handleLogout={handleLogout}
              token={token}
            />
            <Tooltip title={"Menu"}>
              <div onClick={() => setMobileMenuVisible((prev) => !prev)}>
                {" "}
                <LottieAninationMenu isOpen={mobileMenuVisible} />
              </div>
            </Tooltip>
          </>
        )}
      </div>
    </Header>
  );
};

export default NavBar;
