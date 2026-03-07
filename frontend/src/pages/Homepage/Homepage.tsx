import styles from "./Homepage.module.css";
import LandingPhoto from "../../assets/landing_photo.png";
import Feature1 from "../../assets/Feature1.png";
import Feature2 from "../../assets/Feature2.png";
import Logo from "../../assets/logo.png";
import type { ReactNode } from "react";
import Button from "../../components/Button/Button";

function LandingHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Where your teams and AI come together
        </h1>

        <p className={styles.subtitle}>
          Organize tasks, collaborate with your team, and track progress
          in one powerful workspace.
        </p>

        <Button>
          Get Started
        </Button>
      </div>

      <div className={styles.heroImageContainer}>
        <img
          src={LandingPhoto}
          alt="Task Board preview"
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}

type FeatureProps = {
  children: ReactNode;
  imgSrc: string;
  imgLoc?: "left" | "right";
};

function Features({ children, imgSrc, imgLoc = "left" }: FeatureProps) {
  const image = (
    <img
      src={imgSrc}
      alt="Feature"
      className={styles.featureImage}
    />
  );

  const text = (
    <p className={styles.featureText}>{children}</p>
  );

  return (
    <div className={styles.featureContainer}>
      {imgLoc === "left" ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          {text}
          {image}
        </>
      )}
    </div>
  );
}

function Collaboration() {
  return (
    <>
      <h2>Team Collaboration</h2>
      <p> Work together in a team to complete big projects one task at a time.</p>
      <p> Task Board offers roles like Global Admin, Project Admin, Project Member, and Project Viewer
        each having different permissions, to maintain smooth workflow and management.
      </p>
    </>
  );
}

function UsageIntro() {
  return (
    <>
      <h2>Kanban Board</h2>
      <p>A Kanban Board divides big project into smaller tasks</p>
      <p>Each task goes through a workflow, typically To-Do, In Progress, Testing, Done </p>
      <p>Complete tasks to slowly build up your project!</p>
    </>
  );
}

function Notifications() {
  return (
    <>
      <h2>Push Notifications</h2>
      <p>Stay updated with changes in your projects through push notifications.</p>
      <p>Get notified whenever you are mentioned, assigned tasks, or when a task is updated.</p>
      <p><small>User may opt out of push notifications if needed</small></p>
    </>
  );
}

function About() {
  return (
    <footer className={styles.aboutContainer}>
      <img
        src={Logo}
        alt="Task Board logo"
        className={styles.aboutLogo}
      />

      <div className={styles.aboutText}>
        <p className={styles.aboutProject}>
          <strong>Task Board</strong> is a lightweight task management web
          application that allows users to organize, track, and manage tasks
          efficiently using an interactive board interface.
        </p>

        <p>
          This project was developed as part of a university coursework project
          by <strong>Mridul Chhipa</strong> and <strong>Ojas Pednekar</strong>.
        </p>

        <p>
          The source code is available on{" "}
          <a
            href="https://github.com/mridulchippa/Task-Board"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.aboutLink}
          >
            GitHub
          </a>{" "}
          where you can explore the implementation, contribute, or report
          issues.
        </p>

        <p className={styles.aboutEntryNumbers}>
          Entry Numbers: 2024CS1XXXX, 2024CS1XXXX
        </p>

        <p className={styles.aboutCopyright}>
          © {new Date().getFullYear()} Task Board Project
        </p>
      </div>
    </footer>
  );
}

// function End() {
//   return <div style={{ height: "50px" }}></div>;
// }

function HomePage() {
  return (
    <>
      <LandingHero />
      <div style={{ height: "30px" }}></div>

      <div id="features">
        {<Features children={<Collaboration />} imgSrc={Feature1} imgLoc="right" />}
        {<Features children={<UsageIntro />} imgSrc={Feature2} imgLoc="left" />}
        {<Features children={<Notifications />} imgSrc={Feature1} imgLoc="right" />}
      </div>

      <div id="about">
        {<About />}
      </div>
      {/* {<End />} */}
    </>
  );
}

export default HomePage;
