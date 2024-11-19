import logo from './logo.svg';
import './App.css';
import LandingPage from './pages/landingPage';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import EdResource from './pages/educationalResource';
import JobMatching from './pages/jobmatching';
import  Registerpage from './pages/registerPage';
import LoginPage from './pages/loginPage';
import Marketplace from './pages/marketPlace';
import ResetPass from './pages/resetpass';
import FarmerDashboard from './pages/dashboardpage';
import VendorDashboard from './pages/dashboardvendor';
import WorkerDashboard from './pages/dashboardworker';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/education' element={<EdResource/>}/>
        <Route path='/jobmatching' element={<JobMatching />} />
        <Route path ='/register' element={< Registerpage />} />
        <Route path ='/login' element={<LoginPage/>}/>
        <Route path ='/resetpasswd' element ={<ResetPass/>} />
        <Route path ='/market' element ={<Marketplace/>} />
        <Route path ='/dashboard/farmer' element={<FarmerDashboard/>}/>
        <Route path ='/dashboard/vendor' element={<VendorDashboard/>}/>
        <Route path ='/dashboard/worker' element={<WorkerDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;

