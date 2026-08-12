import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './frontend/components/AuthContext';
import {Dashboard} from './frontend/pages/dashboard';
import './App.css';
import { Sign_In } from './frontend/pages/auth';
import {Chat} from './frontend/pages/Chat'
import Terms from "./frontend/pages/terms"
import Docs from "./frontend/pages/doc"
import LandingPage from './frontend/pages/landing'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Sign_In/>}/>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:chatbot_id" element={<Chat/>}/>
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/docs" element={<Docs/>}/>
          <Route path="*" element={<div style={{ padding: '20px' }}>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
