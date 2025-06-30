import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const studyMenuItems = [
  { path: '/concepts', label: '基础知识' },
  { path: '/cases', label: '案例研究' },
  { path: '/implementation', label: '实践指南' },
  { path: '/learning', label: '学习路径' },
];

const navItems = [
  { path: '/', label: '首页' },
  { path: '/square', label: '灵感广场' },
  { path: '/intelligence', label: '情报港' },
  { path: '/origin', label: '原点馆' },
  { path: '/dock', label: 'Dock讨论区' },
  { path: '/me', label: '用户中心' },
  { path: '/about', label: '关于我们' },
];

export default function Header({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean; setIsMenuOpen: (isOpen: boolean) => void }) {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                {/* 可替换为你的Logo图标 */}
                <span className="text-white font-bold text-lg">🪐</span>
              </div>
            </div>
            <div>
              <Link 
                to="/" 
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                RWA星球
              </Link>
              <p className="text-sm text-gray-600 hidden sm:block">现实世界资产的Web3协作社区</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item, idx) =>
              item.path === '/' ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : null
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
                  学习社区 <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {studyMenuItems.map(item => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {navItems.map((item, idx) =>
              item.path !== '/' ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : null
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
