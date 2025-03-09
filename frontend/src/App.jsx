import HomePage from './Pages/HomePage';
import Registration from './Pages/UserRegistration';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import other pages as needed

function App() {
  return (
    <Router>
     
      <div className="min-vh-100 d-flex flex-column">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registration" element={<Registration />} />
          

        </Routes>
      </div>
    </Router>
  );
}

export default App;