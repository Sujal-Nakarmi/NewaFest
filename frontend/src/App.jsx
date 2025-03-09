import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import HomePage from './Pages/HomePage';
import Registration from './Pages/UserRegistration';
import RegistrationPandit from './Pages/PanditRegistration';
import LoginPage from './Pages/UserLogin';
import PanditLoginPage from './Pages/PanditLogin';

// Import other pages as needed

function App() {
  return (
    <Router>
     
      <div className="min-vh-100 d-flex flex-column">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register/user" element={<Registration />} />
          <Route path="/register/pandit" element={<RegistrationPandit />} />
          <Route path="/login/user" element={<LoginPage />} />
          <Route path="/login/pandit" element={<PanditLoginPage />} />
          

        </Routes>
      </div>
    </Router>
  );
}

export default App;