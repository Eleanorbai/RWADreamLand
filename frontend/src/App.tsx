import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomePage from './components/pages/HomePage';
import ConceptsPage from './components/pages/ConceptsPage';
import CaseStudiesPage from './components/pages/CaseStudiesPage';
import ImplementationPage from './components/pages/ImplementationPage';
import LearningPathPage from './components/pages/LearningPathPage';
import Me from './pages/Me';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';
import { UserPlus, LogIn, User } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/register', icon: UserPlus, label: '注册', description: '新用户注册' },
    { path: '/login', icon: LogIn, label: '登录', description: '已有账号登录' },
    { path: '/me', icon: User, label: '用户中心', description: '查看和管理个人信息' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      <main className="transition-all duration-300 ease-in-out">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/cases" element={<CaseStudiesPage />} />
          <Route path="/implementation" element={<ImplementationPage />} />
          <Route path="/learning" element={<LearningPathPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
