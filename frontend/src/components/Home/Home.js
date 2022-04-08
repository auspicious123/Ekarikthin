import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import "./queries.css";
import Landing from "./SubComponents/Landing/Landing";
import Features from "./SubComponents/Features/Features";
import Gallery from "./SubComponents/Gallery/Gallery";
// import Sponsors from "./SubComponents/Sponsors/Sponsors";
// import Testimonials from "./SubComponents/Testimonials/Testimonials";
import Nav from "./SubComponents/Nav/Nav";
import Bike from "../Global/Bike/Bike";

export default function Home() {
  const [images, setImages] = useState(null);

  const fetchImages = async () => {
    const { data } = await axios.get("/api/gallery/home");
    setImages(data.images);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="home-comp">
      <Nav />
      <Landing />
      <Features />
      <Bike />
      <Gallery images={images} />
      {/* <Sponsors /> */}
      {/* <Testimonials /> */}
    </div>
  );
}
