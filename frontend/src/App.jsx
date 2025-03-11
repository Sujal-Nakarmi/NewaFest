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
import BhintunaDetail from "./Pages/BhintunaDetail";
import ProfilePage from './Pages/ProfilePage';
import IhiDetail from './Pages/IhiDetail';
import PanditBookingForm from './Components/PanditBookingForm';
import Events from './Components/EventsAdminPanel';
import Users from './Components/UsersAdminPanel';
import EventRegistrations from './Components/RegistrationAdminPanel';
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
          <Route path="/Bhintuna" element={<BhintunaDetail />} />
          <Route path="/Ihi" element={<IhiDetail />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/PanditBookingForm" element={<PanditBookingForm />} />

          <Route path="/register/:eventDetailId" element={<BhintunaDetail />} />

          <Route path="/book-pandit/:panditId" element={<PanditBookingForm />} />

           {/* Protected routes for specific roles */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard/users" element={<Users />} />
          <Route path="/admin/dashboard/events" element={<Events />} />
          <Route path="/admin/dashboard/registrations" element={<EventRegistrations />} />
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