import "../CSS/UserRegistration.css"
import Design1 from "../Assests/Design1.png"
import Design2 from "../Assests/Design2.png"
import { Link } from "react-router-dom"
import logo from "../Assests/Logo.png"
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaFlag } from "react-icons/fa"

function Registration() {
  return (
    <div>
      <div className="container-fluid">
        <div className="row w-100">
          <div class="col-md-6 registration-left-panel">
            <img src={logo || "/placeholder.svg"} className="register-logo" alt="Logo" />
            <h1>Create your account now</h1>
            <p>Lorem Ispum.</p>
          </div>

          <div class="col-md-6 right-panel">
            <img src={Design1 || "/placeholder.svg"} className="design1" />
            <img src={Design2 || "/placeholder.svg"} className="design2" />
            <h2>Registration Form</h2>
            <p>
                Stay connected with everything that matters to you.
              </p>
            <form>
              <div className="input-group">
                <span className="input-icon">
                  <FaUser />
                </span>
                <input type="text" class="form-control" placeholder="Full Name" />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <input type="email" class="form-control" placeholder="Email" />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <FaLock />
                </span>
                <input type="password" class="form-control" placeholder="Password" />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <FaPhone />
                </span>
                <input type="text" class="form-control" placeholder="Phone Number" />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <FaMapMarkerAlt />
                </span>
                <input type="text" class="form-control" placeholder="Address" />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <FaFlag />
                </span>
                <input type="text" class="form-control" placeholder="Country" value="Nepal" readonly />
              </div>

              <div class="row">
                <div class="col-md-6">
                  <button type="submit" class="btn btn-register w-100">
                    Register
                  </button>
                </div>
                <div class="col-md-6">
                  <button type="button" class="btn btn-outline btn-cancel w-100">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
            <p class="Bottom-Link-Register">
              Already have an account?
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration

