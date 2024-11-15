import logo from './logo.svg';
import './App.css';
import LandingPage from './pages/landingPage';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import EdResource from './pages/educationalResource';
import JobMatching from './pages/jobmatching';
import  Registerpage from './pages/registerPage';
import LoginPage from './pages/loginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/education' element={<EdResource/>}/>
        <Route path='/jobmatching' element={<JobMatching />} />
        <Route path ='/register' element={< Registerpage />} />
        <Route path ='/login' element={<LoginPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;

