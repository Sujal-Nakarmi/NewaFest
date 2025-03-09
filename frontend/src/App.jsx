import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import HomePage from './Pages/HomePage';
import Registration from './Pages/UserRegistration';
import RegistrationPandit from './Pages/PanditRegistration';
import LoginPage from './Pages/UserLogin';
import PanditLoginPage from './Pages/PanditLogin';
import AdminDashboard from './Pages/AdminDashboard';
import PanditDashboard from './Pages/PanditDashboard';
import VendorDashboard from './Pages/VendorDashboard';
import ProtectedRoute from "./Components/ProtectedRoute";


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

           {/* Protected routes for specific roles */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["pandit"]} />}>
          <Route path="/pandit/dashboard" element={<PanditDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Route>
        
        {/* Protected routes for normal users */}
        <Route element={<ProtectedRoute allowedRoles={["normal_user"]} />}>
          <Route path="/" element={<HomePage />} />
        </Route>
          

        </Routes>
      </div>
    </Router>
  );
}

export default App;