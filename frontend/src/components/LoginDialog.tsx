import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../hooks';
import { loginUser } from '../slices/authSlice';

interface Props {
    show: boolean;
    handleClose: () => void;
}

export default function LoginDialog(props: Props) {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(state => state.auth);

    async function performLogin() {
        const actionResult = await dispatch(
            loginUser({
                userID: userID,
                password: password
            })
        );

        if (loginUser.fulfilled.match(actionResult)) {

            // formular zurücksetzen
            setUserID('');
            setPassword('');
            props.handleClose();
        }

    }


    return (
       
        <Modal id="LoginDialog" show={props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>User ID</Form.Label>
                        <Form.Control
                            id="LoginDialogUserIDText"
                            type="text"
                            placeholder="User ID"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control
                            id="LoginDialogPasswordText"
                            type="password"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button 
                    id="PerformLoginButton" 
                    variant="primary" 
                    onClick={performLogin}
                    disabled={isLoading} 
                >
                    {isLoading ? (
                        <>
                            <Spinner size="sm" animation="border" /> Loading...
                        </>
                    ) : (
                        "Login"
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
        
    );
}