import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { particles, svgParticles } from "../../utils/constant";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: Object.keys(svgParticles).length * 2 },
          color: { value: "#00FFFF" },
          shape: {
            type: "image",
            image: particles,
          },

          opacity: { value: 0.3 },
          size: { value: 20 },
          move: { enable: true, speed: 0.6 },
        },
        background: {
          color: "#0a0a0a",
        },
      }}
    />
  );
};

export default ParticlesBackground;
