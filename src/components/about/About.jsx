import { useInView } from "react-intersection-observer";
import "./About.css";
import "./../../styles/animations.css";

const About = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className={`about ${inView ? "visible" : ""}`}>
      <div className="about-content">
        {/* Left side: Text */}
        <div className="about-decor ">
          <div className="personal-image">
            <img src="/assets/images/photo.jpg" alt="" />
          </div>
        </div>
        <div className="about-text">
          <h2>About Me</h2>
          <p className="about-desc">
            I'm a passionate developer crafting futuristic digital experiences
            with a focus on clean design and smooth interactions.
          </p>
          <h3 className="about-subheading">What I Do</h3>
          <ul className="about-skills">
            <li>Frontend Development (React, Next.js)</li>
            <li>Interactive UI Animations</li>
            <li>Responsive Web Design</li>
            <li>Web Performance & Optimization</li>
          </ul>
          <button className="about-btn">View My Projects</button>
        </div>

        {/* Right side: Decorative or empty */}
      </div>
    </section>
  );
};

export default About;
