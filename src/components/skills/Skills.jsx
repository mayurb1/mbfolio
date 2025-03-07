import React from "react";
import Marquee from "react-fast-marquee";
import "./Skills.css";
import { svgParticles, svgParticlesKeys } from "../../utils/constant";

function Skills() {
  const skillBoxStyle = {
    backgroundColor: `linear-gradient(
            to bottom right, 
            hsl(0, 0%, 25%) 0%, 
            hsla(0, 0%, 25%, 0) 50%
          )`,
    boxShadow: `0 16px 30px #00000040`,
  };

  return (
    <div className="skills">
      <div className="skillsHeader">
        <h3 style={{ color: "white" }}>Skills</h3>
      </div>
      <div className="skillsContainer">
        <div className="skill--scroll">
          <Marquee
            gradient={false}
            speed={80}
            pauseOnHover={true}
            pauseOnClick={true}
            delay={0}
            play={true}
            direction="left"
          >
            {svgParticlesKeys.map((skill, id) => (
              <div className="skill--box" key={id} style={skillBoxStyle}>
                <img src={svgParticles[skill]} alt={skill} />
                <h4 style={{ color: "white" }}>{skill}</h4>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}

export default Skills;
