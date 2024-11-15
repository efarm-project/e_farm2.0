import React, { useState } from "react";
import Navbar from "../components/navbar";
import "./styles/jobmatching.css";

const JobMatching = () => {
    // Sample data for job seekers
    const [jobSeekers, setJobSeekers] = useState([
        {
            id: 1,
            name: "John Kamau",
            profilePicture: "https://via.placeholder.com/150",
            jobType: "Farm Laborer",
            location: "Nyeri",
            phone: "072994714",
        },
        {
            id: 2,
            name: "Jane Maina",
            profilePicture: "https://via.placeholder.com/150",
            jobType: "Greenhouse Technician",
            location: "Kirinyaga",
            phone: "0724315673",
        },
        {
            id: 3,
            name: "Peter Maina",
            profilePicture: "https://via.placeholder.com/150",
            jobType: "Irrigation Specialist",
            location: "Murang'a",
            phone: "072644714",
        },
        {
            id: 4,
            name: "Mary Mueni",
            profilePicture: "https://via.placeholder.com/150",
            jobType: "Seasonal Harvester",
            location: "Nakuru",
            phone: "0754535677",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    // Filter job seekers based on search input
    const filteredJobSeekers = jobSeekers.filter(
        (seeker) =>
            seeker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seeker.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seeker.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            </div>

            <div className="jobListings">
                <h2>Job Seekers</h2>
                {filteredJobSeekers.length > 0 ? (
                    <ul className="jobList">
                        {filteredJobSeekers.map((seeker) => (
                            <li key={seeker.id} className="jobCard">
                                <img
                                    src={seeker.profilePicture}
                                    alt={seeker.name}
                                    className="profilePicture"
                                />
                                <h3 className="workerName">{seeker.name}</h3>
                                <p><strong>Job Type:</strong> {seeker.jobType}</p>
                                <p><strong>Location:</strong> {seeker.location}</p>
                                <p><strong>Phone:</strong> {seeker.phone}</p>
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
