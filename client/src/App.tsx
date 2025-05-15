import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InterviewGenerator from './components/InterviewGenerator';
import { ProfileAnalyticsPage } from './pages/ProfileAnalyticsPage';
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import { Profile } from "./pages/Profile.tsx";
import Home  from "./pages/Home.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/profile" element={<div className="max-w-4xl mx-auto"><Profile /></div>} />
          <Route path="/interview" element={<div className="max-w-4xl mx-auto"><InterviewGenerator /></div>} />

          <Route path="/analytics" element={<div className="max-w-4xl mx-auto"><ProfileAnalyticsPage /></div>} />
          <Route path="/login" element={<div className="max-w-4xl mx-auto"><Login /></div>} />
          <Route path="/register" element={<div className="max-w-4xl mx-auto"><Register /></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
