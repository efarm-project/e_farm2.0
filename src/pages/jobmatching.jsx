import React, { useState } from "react";
import Navbar from "../components/navbar";
import "./styles/jobmatching.css"; // CSS for styling the page

const JobMatching = () => {
    // Sample job data (replace with API call or dynamic data in a real app)
    const [jobs, setJobs] = useState([
        { id: 1, title: "Farm Laborer", location: "Nyeri", type: "Full-time" },
        { id: 2, title: "Irrigation Specialist", location: "Murang'a", type: "Part-time" },
        { id: 3, title: "Organic Farm Manager", location: "Nakuru", type: "Full-time" },
        { id: 4, title: "Seasonal Harvester", location: "Kirinyaga", type: "Seasonal" },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    // Filtered jobs based on search
    const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="jobMatchingPage">
            <Navbar />
            <div className="jobMatchingHero">
                <h1>Find Your Next Opportunity in Agriculture</h1>
                <p>Search and apply for jobs in sustainable farming.</p>
                <input
                    type="text"
                    className="searchBar"
                    placeholder="Search by job title or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="jobListings">
                <h2>Available Jobs</h2>
                {filteredJobs.length > 0 ? (
                    <ul className="jobList">
                        {filteredJobs.map((job) => (
                            <li key={job.id} className="jobCard">
                                <h3>{job.title}</h3>
                                <p><strong>Location:</strong> {job.location}</p>
                                <p><strong>Type:</strong> {job.type}</p>
                                <button className="applyButton">Apply Now</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No jobs match your search criteria.</p>
                )}
            </div>
        </div>
    );
};

export default JobMatching;
