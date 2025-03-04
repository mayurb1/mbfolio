import React from "react";
import "./Contact.css";

const Contact = () => (
  <section className="contact">
    <h2 className="glow-text">Contact Me</h2>
    <p className="contact-desc">Have an interstellar idea? Let's connect!</p>
    <a href="mailto:your.email@example.com" className="contact-btn">
      Send Message
    </a>
  </section>
);

export default Contact;
