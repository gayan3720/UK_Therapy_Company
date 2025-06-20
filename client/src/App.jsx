import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";
import PageLoadingLoader from "./components/reusablecomponents/loaders/PageLoadingLoader";
import AutoScrollTop from "./components/scrolltotopautomatic/AutoScrollTop";
import { jwtDecode } from "jwt-decode";
import { useLazyGetUserByIdQuery } from "./services/apislices/authApiSlice";
import { getUser, setUser } from "./services/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useContainerWidth } from "./components/customhooks/useContainerWidth";

// Lazy load pages
const SignIn = lazy(() => import("./pages/signin/SignIn"));
const SignUp = lazy(() => import("./pages/signup/SignUp"));
const Home = lazy(() => import("./pages/home/Home"));
const AboutUs = lazy(() => import("./pages/aboutus/AboutUs"));
const Services = lazy(() => import("./pages/services/Services"));
const Contact = lazy(() => import("./pages/contact/Contact"));
const Booking = lazy(() => import("./pages/booking/Booking"));
const AdminDashboard = lazy(() =>
  import("./pages/adminpanel/admindashboard/AdminDashboard")
);
const UserManagement = lazy(() =>
  import("./pages/adminpanel/usermanagement/UserManagement")
);
const ServiceManagement = lazy(() =>
  import("./pages/adminpanel/servicemanagement/ServiceManagement")
);
const AppointmentManagement = lazy(() =>
  import("./pages/adminpanel/appointmentmanagement/AppointmentManagement")
);
const TimeslotManagement = lazy(() =>
  import("./pages/adminpanel/timeslotmanagement/TimeslotManagement")
);
const Reports = lazy(() => import("./pages/adminpanel/reports/Reports"));
const Settings = lazy(() => import("./pages/adminpanel/settings/Settings"));
const MainLayout = lazy(() => import("./components/mainlayout/MainLayout"));

const PrivateRoute = ({ redirectPath = "/signin" }) => {
  const user = useSelector(getUser);
  const isAuthenticated = Boolean(user && user.id); // adapt to your user object

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />; // renders child routes
};

const AppWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trigger, { data: user, isLoading, error }] = useLazyGetUserByIdQuery();
  const [containerRef, width] = useContainerWidth();
  const [scrolled, setScrolled] = useState(false);
  const [hideTop, setHideTop] = useState(false);
  const [hideBottom, setHideBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setScrolled(y > 0);
      setHideTop(y > vh * 0.5);
      setHideBottom(y > vh);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Get current time in seconds
      if (decodedToken.exp < currentTime) {
        // Token is expired
        localStorage.removeItem("token"); // Remove token from local storage
        dispatch(setUser({})); // Reset user state
        navigate("/signin"); // Redirect to SignIn page
        return;
      }

      // Otherwise, fetch user data using the decoded token ID
      trigger(decodedToken.id);
    } catch (err) {
      console.error("Token decoding failed:", err);
    }
  }, [trigger, dispatch, navigate]);

  useEffect(() => {
    if (user) {
      dispatch(setUser(user.data));
    } else {
      dispatch(setUser({}));
    }
  }, [dispatch, user]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate page load time
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {loading && <PageLoadingLoader />}
      <AutoScrollTop />
      <Suspense fallback={<PageLoadingLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout
                width={width}
                scrolled={scrolled}
                hideTop={hideTop}
                hideBottom={hideBottom}
              />
            }
          >
            <Route index element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route element={<PrivateRoute />}>
              <Route path="/book" element={<Booking />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/admin/usermanagement"
                element={<UserManagement />}
              />
              <Route
                path="/admin/servicemanagement"
                element={<ServiceManagement />}
              />
              <Route
                path="/admin/appointmentmanagement"
                element={<AppointmentManagement />}
              />
              <Route
                path="/admin/timeslotmanagement"
                element={<TimeslotManagement />}
              />
              <Route path="/admin/reportsdownload" element={<Reports />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;
