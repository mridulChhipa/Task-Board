import '../assets/styles/Navbar.css'

function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="atlassian-logo">
                    <svg width="80" height="48" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24" fill="white" aria-labelledby="jiraTitle">
                        <svg fill="none" height="32" viewBox="0 0 32 32" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#FFFFFF" d="M27.545 24.378 16.96 3.208c-.208-.458-.417-.541-.667-.541-.208 0-.458.083-.708.5-1.5 2.375-2.167 5.125-2.167 8 0 4.001 2.042 7.752 5.042 13.795.334.666.584.791 1.167.791h7.335c.541 0 .833-.208.833-.625 0-.208-.042-.333-.25-.75M12.168 14.377c-.834-1.25-1.084-1.334-1.292-1.334s-.333.083-.708.834L4.875 24.46c-.167.334-.208.459-.208.625 0 .334.291.667.916.667h7.46c.5 0 .875-.416 1.083-1.208.25-1 .334-1.876.334-2.917 0-2.917-1.292-5.751-2.292-7.251"></path>
                        </svg>
                    </svg>
                </div>

                <div className="jira-brand">
                    <span className="brand-name">Jira</span>
                </div>
            </div>

            <div className="nav-right">
                <button className="btn-go-jira">Go to Jira</button>
                <div className="divider"></div>
                <div className="notification-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </div>
                <div className="user-profile">
                    <div className="avatar">MC</div>
                    <span className="user-name">Mridul Chhipa</span>
                </div>
            </div>
        </nav>
    )
}

export default Navbar