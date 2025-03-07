import React from "react";
import "./Hero.css";
const Hero = () => {
  return (
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Welcome to Our Space</h1>
          <h2>Explore the Future</h2>
          <p>
            Discover innovative solutions and cutting-edge technology designed
            to make your journey extraordinary. Join us in shaping tomorrow.
          </p>
        </div>

        <div class="hero-image">
          <img src="/assets/images/logo.png" alt="Futuristic concept" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
