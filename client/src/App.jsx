import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CandidatesList from './pages/CandidatesList';
import AdminAssignment from './pages/AdminAssignment';
import EvaluationForm from './pages/EvaluationForm';
import AdminUsers from './pages/AdminUsers';
import AdminCandidates from './pages/AdminCandidates';
import AdminItems from './pages/AdminItems';
import AdminMonitoring from './pages/AdminMonitoring';
import AdminResults from './pages/AdminResults';
import MainLayout from './layouts/MainLayout';

// 보호된 라우트
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 메인 레이아웃이 적용되는 보호된 경로들 */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/candidates" replace />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/evaluate/:id" element={<EvaluationForm />} />
          
          {/* 관리자 메뉴 */}
          <Route path="/admin/monitoring" element={<AdminMonitoring />} />
          <Route path="/admin/results" element={<AdminResults />} />
          <Route path="/admin/assign" element={<AdminAssignment />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
          <Route path="/admin/items" element={<AdminItems />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
