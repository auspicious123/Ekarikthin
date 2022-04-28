import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { UserContext } from "./Context/UserContext";
import Home from "./components/Home/Home";
import Events from "./components/Events/Events";
import Registrations from "./components/Registrations/Registrations";
import Layout from "./components/Layout/Layout";
import RegSuccess from "./components/Registrations/RegSuccess";
import Gallery from "./components/Gallery/Gallery";
import Organisers from "./components/Organisers/Organisers";
import Login from "./components/Admin/Login";
import VerifyToken from "./components/Admin/VerifyToken";
import AllRegistrations from "./components/Admin/AllRegistrations";
import axios from "axios";
import publicIp from "public-ip";
import ReactGA from "react-ga";
import jwt_decode from "jwt-decode";
import { notifyInfo } from "./utils/Notification";
import Webdev from "./components/Webdev/Webdev";

const isExpired = (token) => {
  const decoded = jwt_decode(token);
  const currentTime = Date.now() / 1000;

  return decoded.exp < currentTime;
};

function App() {
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  useEffect(() => {
    const hitCount = async () => {
      const ip = await publicIp.v4();
      await axios.get(`/api/hit?ip=${ip}`);
    };
    ReactGA.initialize(process.env.REACT_APP_GA);
    ReactGA.pageview("/");
    hitCount();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (user) {
      const token = user.token;
      if (isExpired(token)) {
        notifyInfo("Your session has expired. Please login again.");
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <div className="App">
      <ReactNotifications />
      <Router>
        <UserContext.Provider value={{ user, setUser }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="event/webdev" element={<Webdev />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="organisers/" element={<Organisers />} />
              <Route path="registration" element={<Registrations />} />
              <Route path="registration/:id" element={<RegSuccess />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/verify" element={<VerifyToken />} />
              <Route
                path="/admin/allregistrations"
                element={<AllRegistrations />}
              />
            </Routes>
          </Layout>
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
