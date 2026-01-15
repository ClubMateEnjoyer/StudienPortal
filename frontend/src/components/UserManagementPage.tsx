import { useEffect, useState } from "react";
import { Container, Button, Card, Row, Col, Modal, Form, Badge } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchUsers, deleteUser, type User, updateUser, createUser } from "../slices/userSlice";

interface Props {
    onBack: () => void;
}

export default function UserManagementPage(props: Props) {
    const dispatch = useAppDispatch();
    const {users, isLoading} = useAppSelector(state => state.user);

    //STATE, um delete modal zu steuern
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    //STATE, um edit modal zu steuern
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Formular-Felder
    const [userID, setUserID] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const formPrefix = isEditing ? "EditUserComponent" : "CreateUserComponent";

    //beim laden die user aus dem backend holen
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // delete logik
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    }

    const confirmDelete = async () => {
        if(userToDelete) {
            await dispatch(deleteUser(userToDelete.userID));
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    }

    //create / edit logik

    // create
    const openCreateDialog = () => {
        setIsEditing(false);
        setUserID('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setIsAdmin(false);
        setShowUserDialog(true);
    }

    // update
    const openEditDialog = (user: User) => {
        setIsEditing(true);
        setUserID(user.userID);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setPassword('');
        setIsAdmin(user.isAdministrator);
        setShowUserDialog(true);
    }

    const handleSaveUser = async () => {
        const userData: User = {
            userID,
            firstName,
            lastName,
            isAdministrator: isAdmin,
            password: password
        };

        if(isEditing) {
            await dispatch(updateUser(userData));
        } else {
            await dispatch(createUser(userData));
        }
        setShowUserDialog(false);
    }


    // bootstraphilfe durch Google Gemini: "Schau die meine .tsx und gestalte den html teil durch bootstrap, halt es aber simple" (plus diese datei)
    return (
        <div id="UserManagementPage" className="bg-light min-vh-100 py-5">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb4">
                    <h2 className="text-primary">User-Verwaltung</h2>
                </div>
                
                <Card className="shadow-sm mb-4 p-3">
                    <div className="d-flex justify-content-between">
                        <Button 
                            variant="secondary"
                            id="OpenStartPageButton" 
                            onClick={props.onBack} 
                        >
                            Zurück
                        </Button>

                        <Button 
                            id="UserManagementPageCreateUserButton"
                            variant="success" 
                            onClick={openCreateDialog}
                        >
                            + User anlegen
                        </Button>
                    </div>
                </Card>

                <div id="UserManagementPageListComponent">
                    {isLoading && <p>Lade User...</p>}

                    {users.map(user => (
                        <Card 
                            key={user.userID} 
                            id={`UserItem${user.userID}`}
                            className="mb-3 shadow-sm border-0"
                        >
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col>
                                        <h5 className="mb-1">
                                            <span id={"FirstName"}>{user.firstName}</span>{' '}
                                            <span id={"LastName"}>{user.lastName}</span>
                                        </h5>
                                        <div className="text-muted small">
                                            ID: <span id={"UserID"}>{user.userID}</span>
                                        </div>
                                        <div className="mt-1">
                                            {user.isAdministrator ? (
                                                <Badge bg="danger">Administrator</Badge>
                                            ) : (
                                                <Badge bg="info">User</Badge>
                                            )}
                                        </div>
                                    </Col>


                                    <Col md={4} className="text-end">
                                        <Button 
                                            id={`UserItemEditButton${user.userID}`} 
                                            variant="outline-primary"
                                            className="me-2"
                                            onClick={() => openEditDialog(user)}
                                        >
                                            Edit
                                        </Button>
                                        
                                        <Button 
                                            id={`UserItemDeleteButton${user.userID}`} 
                                            variant="outline-danger" 
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            Delete
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>

                        </Card>
                    ))}
                </div>
            </Container>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}
                id={userToDelete ? `DeleteDialogUser${userToDelete.userID}` : 'DeleteDialog'}
            >
                <Modal.Header closeButton>
                    <Modal.Title>User löschen?</Modal.Title>
                </Modal.Header>
                    
                <Modal.Footer>
                    <Button id="DeleteDialogCancelButton" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>

                    <Button id="DeleteDialogConfirmButton" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>     
            </Modal>

            <Modal show={showUserDialog} 
                   onHide={() => setShowUserDialog(false)} 
                   id={isEditing ? "UserManagementPageEditComponent" : "UserManagementPageCreateComponent"}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "User bearbeiten" : "User anlegen"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>User ID</Form.Label>
                            <Form.Control 
                                id={`${formPrefix}EditUserID`}
                                type="text" 
                                value={userID} 
                                onChange={e => setUserID(e.target.value)}
                                disabled={isEditing} // ID darf beim edit oft nicht geändert werden
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Vorname</Form.Label>
                            <Form.Control 
                                id={`${formPrefix}EditFirstName`}
                                type="text" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nachname</Form.Label>
                            <Form.Control 
                                id={`${formPrefix}EditLastName`}
                                type="text" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Passwort</Form.Label>
                            <Form.Control 
                                id={`${formPrefix}EditPassword`}
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                placeholder={isEditing ? "Leer lassen um nicht zu ändern" : ""}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check 
                                id={`${formPrefix}EditIsAdministrator`}
                                type="checkbox" 
                                label="Administrator" 
                                checked={isAdmin}
                                onChange={e => setIsAdmin(e.target.checked)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        id="OpenUserManagementPageListComponentButton" 
                        variant="secondary" 
                        onClick={() => setShowUserDialog(false)}
                    >
                        Abbrechen
                    </Button>
                    <Button 
                        id={isEditing ? "EditUserComponentSaveUserButton" : "CreateUserComponentCreateUserButton"} 
                        variant="primary" 
                        onClick={handleSaveUser}
                    >
                        Speichern
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}