import React from "react";
import "./Contact.css";

const Contact = () => (
  <section className="contact">
    <div className="contact-wrapper">
      {/* Left - Map */}
      <div className="contact-left">
        <iframe
          title="Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.4995779957234!2d72.57136211526135!3d23.02250518495367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f66e681b71%3A0xdeb6f99d9db6466b!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1617024045054!5m2!1sen!2sin"
          loading="lazy"
          allowFullScreen
          style={{ filter: "grayscale(100%) invert(92%) contrast(83%)" }}
        />
      </div>

      {/* Right - WhatsApp Contact */}
      <div className="contact-right">
        <h2>Contact Me</h2>
        <p>Have an interstellar idea? Let's connect on WhatsApp!</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const message = e.target.message.value;
            window.open(
              `https://wa.me/8160146264?text=${encodeURIComponent(message)}`,
              "_blank"
            );
          }}
        >
          <textarea
            name="message"
            placeholder="Type your message here..."
            required
            rows={2}
          />
          <button className="contact-btn" type="submit">
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  </section>
);

export default Contact;
