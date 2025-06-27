import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import SideBar from "./sidebar/SideBar";
import Footer from "./footer/Footer";
import FloatingButton from "../floatingbutton/FloatingButton";

const { Content } = Layout;

const MainLayout = ({ width, scrolled, hideTop, hideBottom }) => {
  const location = useLocation();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isSignRoute, setIsSignRoute] = useState(false);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    setIsAdminRoute(location.pathname.startsWith("/admin"));
    setIsSignRoute(
      location.pathname.startsWith("/signup") ||
        location.pathname.startsWith("/signin")
    );
  }, [location]);

  return (
    <Layout className="main-layout">
      {/* Navbar (visible for all users) */}
      {!isSignRoute && (
        <NavBar
          isAdminRoute={isAdminRoute}
          width={width}
          scrolled={scrolled}
          hideTop={hideTop}
          hideBottom={hideBottom}
        />
      )}

      {/* Nested layout for sidebar and main content */}
      <Layout className="content-layout">
        {isAdminRoute && !isMobile && !isSignRoute && (
          <SideBar isTablet={isTablet} />
        )}
        <Content
          className={`${!isSignRoute ? "main-content" : "main-content-sign"}`}
        >
          <Outlet />
          <FloatingButton isSignRoute={isSignRoute} />
        </Content>
      </Layout>

      {/* Footer (visible for all users) */}
      {!isSignRoute && <Footer />}
    </Layout>
  );
};

export default MainLayout;
