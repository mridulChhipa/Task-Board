// import Button from "../../components/Button/Button";
import styles from "./Homepage.module.css";
import NavBar from "../../components/NavBar/Navbar";
import LandingPhoto from "../../assets/landing_photo.png";
import Feature1 from "../../assets/Feature1.png";
import Feature2 from "../../assets/Feature2.png";
import Logo from "../../assets/logo.png";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function Message() {
  return (
    <div className={styles.messageContainer}>
      <h1 className={styles.message}>Procrastinating?</h1>
      <h1 className={styles.message}>Make a Task Board for it!</h1>
    </div>
  );
}

type FeatureProps = {
    children: ReactNode;
    image_url: string;
    img_loc?: "left" | "right";
}

function Features({children, image_url, img_loc = "left"}: FeatureProps) {
  if(img_loc === "left") {
    return (
      <div className={styles.featureContainer}>
        <img src={image_url} alt="Feature Image" className={styles.featureImage}></img>
        <p className={styles.featureText}>{children}</p>
      </div>
    );
  }
  else {
    return (
      <div className={styles.featureContainer}>
        <p className={styles.featureText}>{children}</p>
        <img src={image_url} alt="Feature Image" className={styles.featureImage}></img>
      </div>
    );
  }
}

function Collaboration(){
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

function UsageIntro(){
    return (
      <>
        <h2>Kanban Board</h2>
        <p>A Kanban Board divided big project into smaller tasks</p>
        <p>Each task goes through a workflow, typically To-Do, In Progress, Testing, Done </p>
        <p>Complete tasks to slowly build up your project!</p>
      </>
    );
}

function Notifications(){
    return (
        <>
          <h2>Push Notifications</h2>
          <p>Stay updated with changes in your projects through push notifications.</p>
          <p>Get notified whenever you are mentioned, assigned tasks, or when a task is updated.</p>
          <p><small>User may opt out of push notifications if needed</small></p>
        </>
    );
}

function About(){
    return (
        <div className={styles.aboutContainer}>
            <img src={Logo} alt="About Task Board" style={{width: "40vw"}}></img>
            <div className={styles.aboutText}>
                <h2 style={{textAlign: "center"}}>Project by Mridul Chippa and Ojas Pednekar</h2>
                <p>Github: <a href="https://github.com/mridulchippa/Task-Board">https://github.com/mridulchippa/Task-Board</a></p>
                <p>Entry Numbers: 2024CS10595, 2024CS1XXXX</p>
            </div>
        </div>
    );
}

function End(){
    return <div style={{height: "50px"}}></div>;
}

function HomePage() {
  const navigate = useNavigate();

  function click_sign_up() {
    navigate("/signup");
  }

  function click_sign_in() {
    navigate("/signin");
  }

  function click_feature(){
    document.getElementById("features")?.scrollIntoView({behavior: "smooth"});
  }

  function click_about(){
    document.getElementById("about")?.scrollIntoView({behavior: "smooth"});
  }

  return (  
    <>
      <NavBar feature={click_feature} about={click_about} sign_up={click_sign_up} sign_in={click_sign_in}/>
      <div className={styles.landingPhotoContainer}>
        <img src={LandingPhoto} alt="Task Board Photo" className={styles.landingPhoto}></img>
        {<Message />}
      </div>
      <div style={{height: "30px"}}></div>
      <div id="features">
        {<Features children={<Collaboration />} image_url={Feature1} img_loc="right" />}
        {<Features children={<UsageIntro />} image_url={Feature2} img_loc="left" />}
        {<Features children={<Notifications />} image_url={Feature1} img_loc="right" />}
      </div>
      <div id="about">
        {<About />}
      </div>
      {<End />}
    </>
  );
}

export default HomePage;
