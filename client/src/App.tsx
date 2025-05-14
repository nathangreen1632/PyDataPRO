import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InterviewGenerator from './components/InterviewGenerator';
import { ProfileAnalyticsPage } from './pages/ProfileAnalyticsPage';
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import { Profile } from "./pages/Profile.tsx";
import Home  from "./pages/Home.tsx"; // ✅ import your new landing page

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* ✅ NEW: Public Home page */}
          <Route path="/" element={<Home />} />

          {/* ✅ Private Routes */}
          <Route
            path="/profile"
            element={
              <div className="max-w-4xl mx-auto">
                <Profile />
              </div>
            }
          />
          <Route
            path="/interview"
            element={
              <div className="max-w-4xl mx-auto">
                <InterviewGenerator />
              </div>
            }
          />
          <Route path="/analytics" element={<ProfileAnalyticsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
