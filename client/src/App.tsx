import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InterviewGenerator from './components/InterviewGenerator';
import { ProfileAnalytics } from './pages/ProfileAnalytics.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import { Profile } from './pages/Profile.tsx';
import Home from './pages/Home.tsx';
import CareerPath from './pages/CareerPath.tsx';
import SessionModalWrapper from './components/SessionModalWrapper.tsx';
import { SessionProvider } from './context/SessionContext.tsx';
import { LearningResources } from "./pages/LearningResources.tsx";

function App() {
  return (
    <Router>
      <SessionProvider>
        <SessionModalWrapper />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<div className="max-w-4xl mx-auto"><Profile /></div>} />
            <Route path="/interview" element={<div className="max-w-4xl mx-auto"><InterviewGenerator /></div>} />
            <Route path="/career-path" element={<div className="max-w-4xl mx-auto"><CareerPath /></div>} />
            <Route path="/analytics" element={<div className="max-w-4xl mx-auto"><ProfileAnalytics /></div>} />
            <Route path="/learning-resources" element={<div className="max-w-6xl mx-auto"><LearningResources /></div>} />
            <Route path="/login" element={<div className="max-w-4xl mx-auto"><Login /></div>} />
            <Route path="/register" element={<div className="max-w-4xl mx-auto"><Register /></div>} />
          </Route>
        </Routes>
      </SessionProvider>
    </Router>
  );
}

export default App;
