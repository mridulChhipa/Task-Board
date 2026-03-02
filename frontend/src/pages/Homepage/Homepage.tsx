import Button from '../../components/Button/Button';
import styles from './Homepage.module.css';

function Message(){
    return (
        <>
            <h1 className={styles.message}>Procrastinating?</h1>
            <h1 className={styles.message}>Make a Task Board for it!</h1>
        </>
    );
}

function HomePage(){
    return (
        <div>
            {<Message/>}
            <p>This is the homepage of the Task Board application.</p>
            <Button priority="first">Get Started</Button>
            <Button priority="second">Learn More</Button>
            <Button priority="third">Contact Us</Button>
        </div>
    );
}

export default HomePage;