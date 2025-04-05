import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PageLoadingLoader from "./components/reusablecomponents/loaders/PageLoadingLoader";
import AutoScrollTop from "./components/scrolltotopautomatic/AutoScrollTop";
import { jwtDecode } from "jwt-decode";
import { useLazyGetUserByIdQuery } from "./services/apislices/authApiSlice";
import { setUser } from "./services/slices/authSlice";
import { useDispatch } from "react-redux";

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

const AppWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [trigger, { data: user, isLoading, error }] = useLazyGetUserByIdQuery();

  useEffect(() => {
    // Use the correct key that you stored, e.g. "authToken"
    const token = localStorage.getItem("token");
    console.log(token, "token from local storage");

    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken, "decoded");
      // Ensure decodedToken has an id property or adjust accordingly
      trigger(decodedToken.id);
    } catch (err) {
      console.error("Token decoding failed:", err);
    }
  }, [trigger]);

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
    <div>
      {loading && <PageLoadingLoader />}
      <AutoScrollTop />
      <Suspense fallback={<PageLoadingLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/usermanagement" element={<UserManagement />} />
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
