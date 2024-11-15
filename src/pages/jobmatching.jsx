import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import "./styles/jobmatching.css";

const JobMatching = () => {
  const [jobSeekers, setJobSeekers] = useState([]); // Dynamic data from backend
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Fetch job seekers from backend
  const fetchJobSeekers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/job-seekers"); // Replace with actual route
      const data = await response.json();

      if (response.ok) {
        setJobSeekers(data);
      } else {
        setError(data.message || "Failed to fetch job seekers.");
      }
    } catch (err) {
      setError("An error occurred while fetching job seekers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  // Filter job seekers based on search input and availability
  const filteredJobSeekers = jobSeekers.filter((seeker) => {
    const matchesSearch =
      seeker.jobSeekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.jobType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = showAvailableOnly ? seeker.available : true;

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="jobMatchingPage">
      <Navbar />
      <div className="jobMatchingHero">
        <h1>Find Agricultural Job Seekers</h1>
        <p>Browse profiles of individuals looking for jobs in agriculture.</p>
        <input
          type="text"
          className="searchBar"
          placeholder="Search by name, job type, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filterContainer">
          <label>
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            Show Available Only
          </label>
        </div>
      </div>

      <div className="jobListings">
        <h2>Job Seekers</h2>
        {loading ? (
          <p className="loadingText">Loading job seekers...</p>
        ) : error ? (
          <p className="errorText">{error}</p>
        ) : filteredJobSeekers.length > 0 ? (
          <ul className="jobList">
            {filteredJobSeekers.map((seeker) => (
              <li key={seeker.jobSeekerID} className="jobCard">
                <img
                  src={seeker.profileImageURL || "https://via.placeholder.com/150"}
                  alt={seeker.jobSeekerName}
                  className="profilePicture"
                />
                <h3 className="workerName">{seeker.jobSeekerName}</h3>
                <p><strong>Location:</strong> {seeker.location || "Not specified"}</p>
                <p><strong>Phone:</strong> {seeker.phonenumber}</p>
                <p>
                  <strong>Available:</strong>{" "}
                  <span
                    style={{
                      color: seeker.available ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {seeker.available ? "Available" : "Not Available"}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="noResults">No job seekers match your search criteria.</p>
        )}
      </div>
    </div>
  );
};

export default JobMatching;
