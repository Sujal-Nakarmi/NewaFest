import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/registerlogin/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h2 className="text-center">Profile Page</h2>
        <hr />

        {loading && <p>Loading profile...</p>}
        {error && <p className="text-danger">{error}</p>}

        {user && (
          <>
            <p><strong>Full Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.user_role}</p>
            <p><strong>Phone Number:</strong> {user.phone_number}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Country:</strong> {user.country}</p>
          </>
        )}

        <button 
          className="btn btn-danger mt-3" 
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login/user";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
