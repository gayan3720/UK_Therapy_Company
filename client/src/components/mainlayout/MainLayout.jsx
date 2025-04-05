import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import SideBar from "./sidebar/SideBar";
import Footer from "./footer/Footer";
import FloatingButton from "../floatingbutton/FloatingButton";

const { Content } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isSignRoute, setIsSignRoute] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  // Determine route type
  useEffect(() => {
    setIsAdminRoute(location.pathname.startsWith("/admin"));
    setIsSignRoute(
      location.pathname.startsWith("/signup") ||
        location.pathname.startsWith("/signin")
    );
  }, [location]);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout className="main-layout">
      {/* Navbar (visible for all users) */}
      {!isSignRoute && (
        <NavBar isAdminRoute={isAdminRoute} isMobile={isMobile} />
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
          <FloatingButton />
        </Content>
      </Layout>

      {/* Footer (visible for all users) */}
      {!isSignRoute && <Footer />}
    </Layout>
  );
};

export default MainLayout;
