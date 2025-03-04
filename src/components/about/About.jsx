import { useInView } from "react-intersection-observer";
import "./About.css";
import "./../../styles/animations.css";

const About = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className={`about ${inView ? "visible" : ""}`}>
      <h2 className="glow-text">About Me</h2>
      <p className="about-desc">
        I'm a passionate developer crafting futuristic digital experiences.
      </p>
    </section>
  );
};

export default About;
