// import Button from "../../components/Button/Button";
import styles from "./Homepage.module.css";
import NavBar from "../../components/NavBar/Navbar";
import LandingPhoto from "../../assets/landing_photo.png";

function Message() {
  return (
    <>
      <h1 className={styles.message}>Procrastinating?</h1>
      <h1 className={styles.message}>Make a Task Board for it!</h1>
    </>
  );
}

function HomePage() {
  return (
    <div>
      {<NavBar />}
      <div className={styles.landingPhotoContainer}>
        <img src={LandingPhoto} alt="Task Board Photo" className={styles.landingPhoto}></img>
        {<Message />}
      </div>
    </div>
  );
}

export default HomePage;
