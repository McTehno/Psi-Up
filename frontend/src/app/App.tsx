import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Assessment from '../pages/Assessment/Assessment';
import PathResultPage from '../pages/PathResultPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/path" element={<PathResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;

