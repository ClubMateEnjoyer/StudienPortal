import { useState } from 'react';
import { useAppSelector } from './hooks';
import LandingPage from './components/LandingPage';
import StartPage from './components/StartPage';
import LoginDialog from './components/LoginDialog';
import UserManagementPage from './components/UserManagementPage';

function App() {
  // store prüfen ob token vorhanden
  const token = useAppSelector(state => state.auth.token);
  const [showLogin, setShowLogin] = useState(false);

  const [currentPage, setCurrentPage] = useState<'start' |'userManagement'>('start');


  // wenn token da, startpage zeigen
  if (token) {
    if(currentPage === 'userManagement') {
      return <UserManagementPage onBack={() => setCurrentPage('start')} />;
    }
    return <StartPage openUserManagement={() => setCurrentPage('userManagement')} />;
  }

  // ohne token nur die landing page anzeigen
  return (
    <>
      <LandingPage openLogin={() => setShowLogin(true)} />
      
      <LoginDialog 
        show={showLogin} 
        handleClose={() => setShowLogin(false)} 
      />
    </>
  );
}

export default App;