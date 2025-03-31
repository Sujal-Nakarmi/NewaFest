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
import EventCard from './Components/EventSection'
import ScrollToTop from './Components/Scrolltotop';
import UserBookings from './Components/UserBookingHistory';
import PanditReviews from './Components/PanditReview';
import CreateReview from './Components/Review';
import UserReviews from './Components/UserReview';
import RentingPage from './Pages/RentingPage';
import CartPage from './Components/Cart';
import GaiJatra from './Pages/GaiJatra';
import EventRegistrationRouter from './Components/EventRegistrationRouter';
import Checkout from './Components/CheckOut';
import PaymentSuccess from './Components/PaymentSuccess';
import OrderHistory from './Components/OrderHistory';
import RentalItemsAdminPanel from './Components/RentalItemsDashboard';
import BhintunaTicketHistory from './Components/BhintunaTicketHistory';
import TicketPaymentSuccess from './Components/TicketSuccess';
import BhintunaTicketPayment from './Components/BhintunaTicketPayment';
import ContactPage from './Pages/ContactPage';
import GoogleAuthSuccess from './Pages/GoogleAuthSuccess';
import RentalItemForm from './Components/RentalItemadd';
import SizeVariantManager from './Components/SizeVariant';
import VendorOrders from './Components/OrderLists';
// Import other pages as needed

function App() {
  return (
    <Router>
     <ScrollToTop />
      <div className="min-vh-100 d-flex flex-column">
        <Routes>

          <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
          <Route path="vendor/products/add" element={<RentalItemForm />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/register/user" element={<Registration />} />
          <Route path="/register/pandit" element={<RegistrationPandit />} />
          <Route path="/login/user" element={<LoginPage />} />
          <Route path="/login/pandit" element={<PanditLoginPage />} />
          <Route path="/Bhintuna" element={<BhintunaDetail />} />
          <Route path="/Ihi" element={<IhiDetail />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/rent-traditionals" element={<RentingPage />} />
          <Route path="/PanditBookingForm" element={<PanditBookingForm />} />
          <Route path="/cart" element={<CartPage />} /> 

          {/* Dynamic event registration router */}
          <Route path="/register/:eventDetailId" element={<EventRegistrationRouter />} />
          
        
          <Route path="/GaiJatra" element={<GaiJatra />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/ticket/payment/success" element={<TicketPaymentSuccess />} />

          <Route path="/contact" element={<ContactPage />} />
          

          <Route path="/book-pandit/:panditId" element={<PanditBookingForm />} />
          <Route path="/my-bookings" element={<UserBookings />} />

          <Route path="/register-event" element={<EventCard />}/>
          <Route path="/book-pandits" element={<IhiDetail />}/>

          <Route path="/pandit-reviews/:panditId" element={<PanditReviews />} />
          <Route path="/create-review/:bookingId" element={<CreateReview />} />
          <Route path="/my-reviews" element={<UserReviews />} />
  

          <Route path="/orders/history" element={<OrderHistory />} />

          <Route 
          path="/ticket/payment/:eventRegistrationId" 
          element={<BhintunaTicketPayment />} 
        />
        <Route 
          path="/ticket/history" 
          element={<BhintunaTicketHistory />} 
        />
    



           {/* Protected routes for specific roles */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard/users" element={<Users />} />
          <Route path="/admin/dashboard/events" element={<Events />} />
          <Route path="/admin/dashboard/registrations" element={<EventRegistrations />} />
          <Route path="/admin/dashboard/rentals" element={<RentalItemsAdminPanel />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["pandit"]} />}>
          <Route path="/pandit/dashboard" element={<PanditDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/size-variants" element={<SizeVariantManager />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
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