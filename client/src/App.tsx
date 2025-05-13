import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InterviewGenerator from './components/InterviewGenerator';
import { ProfileAnalyticsPage } from './pages/ProfileAnalyticsPage';
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
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
