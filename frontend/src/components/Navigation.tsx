import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, FileText, Code, Map, User } from 'lucide-react';

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigationItems = [
    { path: '/', icon: Home, label: '首页', description: 'RWA概览与导航' },
    { path: '/concepts', icon: BookOpen, label: '基础知识', description: 'RWA核心概念与技术架构' },
    { path: '/cases', icon: FileText, label: '案例研究', description: '中国RWA项目案例分析' },
    { path: '/implementation', icon: Code, label: '实践指南', description: '项目实施全流程指南' },
    { path: '/learning', icon: Map, label: '学习路径', description: '分层次技能学习路径' },
    { path: '/me', icon: User, label: '用户中心', description: '查看和管理个人信息' },
  ];

  return (
    <div 
      className={`md:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 opacity-50"
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Navigation Panel */}
      <div className="relative max-w-xs w-full bg-white shadow-xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <h2 className="text-xl font-bold text-white">导航菜单</h2>
            <p className="text-blue-100 text-sm mt-1">选择学习模块</p>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
              >
                <item.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              RWA学习平台 © 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
