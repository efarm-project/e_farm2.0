import logo from './logo.svg';
import './App.css';
import LandingPage from './pages/landingPage';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import EdResource from './pages/educationalResource';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/education' element={<EdResource/>}/>
      </Routes>
    </Router>
  );
}

export default App;
