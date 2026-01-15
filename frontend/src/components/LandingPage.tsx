import { Button, Container } from 'react-bootstrap';

interface Props {
    openLogin: () => void;
}

export default function LandingPage(props: Props) {

    function handleLoginButtonClick() {
        props.openLogin();
    }

    return (
        <div id="LandingPage" className="p-5 bg-light" style={{ height: '100vh' }}>
            <Container>
                <h1>Willkommen beim Studienportal</h1>
                <p>Bitte loggen Sie sich ein, um fortzufahren.</p>
                
                <Button id="OpenLoginDialogButton" variant="primary" onClick={handleLoginButtonClick}>
                    Login
                </Button>
            </Container>
        </div>
    );
}