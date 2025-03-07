import React from "react";
import "./Projects.css";

const projects = [
  {
    title: "Galaxy Explorer",
    description: "A 3D space exploration game.",
    link: "#",
  },
  {
    title: "Neon Dashboard",
    description: "A sci-fi themed admin panel.",
    link: "#",
  },
  {
    title: "Personal portfolioo",
    description: "Personal portfolio website for personal information",
    link: "#",
  },
];

const Projects = () => (
  <section className="projects">
    <h2>Projects</h2>
    <div className="projects-grid">
      {projects.map((project, index) => (
        <div key={index} className="project-card">
          <h3 className="project-card-title">{project.title}</h3>
          <p className="project-card-desc">{project.description}</p>
          <a href={project.link} target="_blank" rel="noopener noreferrer">
            View Project
          </a>
        </div>
      ))}
    </div>
  </section>
);

export default Projects;
