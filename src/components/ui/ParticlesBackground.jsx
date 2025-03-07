import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
// import { particles, svgParticles } from "../../utils/constant";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      // options={{
      //   fullScreen: { enable: true, zIndex: -1 },
      //   particles: {
      //     number: { value: Object.keys(svgParticles).length },
      //     color: { value: "#00FFFF" },
      //     shape: {
      //       type: "image",
      //       image: particles,
      //     },
      //     opacity: { value: 0.3 },
      //     size: { value: 20 },
      //     move: { enable: true, speed: 0.6 },
      //   },
      //   background: {
      //     color: "#0a0a0a",
      //   },
      // }}
      options={{
        background: {
          color: {
            value: "#121212",
          },
        },
        fullScreen: { enable: true, zIndex: -1 },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#ffdb70",
          },
          links: {
            color: "#ffdb70",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 5,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
