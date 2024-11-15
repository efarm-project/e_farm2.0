import React from "react";
import "./styles/HeroSection.css"; // Import the CSS file
import { EdRoute, JobMatchingMarketRoute, MarketRoute } from "../functions/routes";

const HeroSection = () => {
    return (
        <div className="heroSection">
            <div className="heroContainer">
                <h1 className="title">Sustainable Agriculture Hub</h1>
                <div className="linkCardContainer">
                    <div className="card card1">
                        <img 
                            src="https://plus.unsplash.com/premium_photo-1661816189756-29995a1eebaf?q=80&w=1434&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                            alt="Store of Fertilizers" 
                            className="cardBanner" 
                        />
                        <h2 className="cardTitle">Sustainable Marketplace</h2>
                        <p className="cardDescription">
                            Buy and Sell climate-friendly farming products and supplies.
                        </p>
                        <button className="cardButton" onClick={MarketRoute}>Explore Marketplace</button>
                    </div>
                    <div className="card card2">
                        <h2 className="cardTitle">Job Matching</h2>
                        <p className="cardDescription">
                            Connect agricultural workers with farmers needing labor.
                        </p>
                        <button className="cardButton" onClick={JobMatchingMarketRoute}>Explore Job Matching</button>
                    </div>
                    <div className="card card3">
                        <h2 className="cardTitle">Educational Resources</h2>
                        <p className="cardDescription">
                            Learn about sustainable farming techniques and regenerative agriculture.
                        </p>
                        <button className="cardButton" onClick={EdRoute}>Explore Articles</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
