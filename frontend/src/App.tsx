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
import Notes from './pages/Notes';
import NoteView from './pages/NoteView';
import NoteEditor from './pages/NoteEditor';
import ReviewDashboard from './pages/ReviewDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';
import Square from './pages/Square';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import Intelligence from './pages/Intelligence';
import Origin from './pages/Origin';
import Dock from './pages/Dock';
import { Toaster } from './components/ui/toaster';
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
      
      <main className="transition-all duration-300 ease-in-out">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/cases" element={<CaseStudiesPage />} />
          <Route path="/implementation" element={<ImplementationPage />} />
          <Route path="/learning" element={<LearningPathPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<Me />} />
          
          {/* 笔记相关路由 */}
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteView />} />
          <Route path="/notes/:id/edit" element={<NoteEditor />} />
          
          {/* 审核相关路由 */}
          <Route path="/review" element={<ReviewDashboard />} />
          
          {/* 新功能路由 */}
          <Route path="/square" element={<Square />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/origin" element={<Origin />} />
          <Route path="/dock" element={<Dock />} />
          
          {/* 个人设置路由 */}
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
