import { Button, Container, Navbar, Nav, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout } from '../slices/authSlice';


interface Props {
    openUserManagement: () => void;
}

export default function StartPage(props: Props) {
    const dispatch = useAppDispatch();
    const { userID, isAdministrator } = useAppSelector(state => state.auth);

    return (
        <div id="StartPage" className="d-flex flex-column" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid> 
                    <Navbar.Brand href="#home">Studienportal</Navbar.Brand>
                    
                    <Nav className="ms-auto d-flex flex-row align-items-center gap-3">
                        <span className="text-white">
                            Hallo, <strong>{userID}</strong>
                        </span>
                        
                        {isAdministrator && (
                            <Button
                                id="OpenUserManagementPageButton"
                                variant="info"
                                size = "sm"
                                onClick={props.openUserManagement}
                            >
                                User Managment
                            </Button>
                        )}

                        <Button 
                            id="LogoutButton" 
                            variant="outline-light" 
                            size="sm"
                            onClick={() => dispatch(logout())}
                        >
                            Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>
            
            <Container className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                <div className="text-center">
                    <h1 className="display-4 mb-3">Willkommen!</h1>
                    <p className="lead text-muted mb-4">
                        Sie sind erfolgreich eingeloggt :)
                    </p>
                    
                    <Card className="shadow-sm border-0" style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <Card.Body>
                            <Card.Title>Status</Card.Title>
                            <Card.Text>
                                Benutzer: {userID}<br />
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
}