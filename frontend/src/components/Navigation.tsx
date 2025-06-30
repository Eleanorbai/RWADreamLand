import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, MessageCircle, Users, MessageSquare, User, FileText, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const mainNavItems = [
  { path: '/square', icon: Globe, label: '灵感广场' },
  { path: '/intelligence', icon: MessageCircle, label: '情报港' },
  { path: '/origin', icon: Users, label: '原点馆' },
  { path: '/dock', icon: MessageSquare, label: 'Dock讨论区' },
  { path: '/me', icon: User, label: '用户中心' },
  { path: '/about', icon: FileText, label: '关于我们' },
];

const studyMenuItems = [
  { path: '/concepts', label: '基础知识' },
  { path: '/cases', label: '案例研究' },
  { path: '/implementation', label: '实践指南' },
  { path: '/learning', label: '学习路径' },
];

const Navigation: React.FC<{ isMenuOpen: boolean; setIsMenuOpen: (isOpen: boolean) => void }> = ({ isMenuOpen, setIsMenuOpen }) => {
  const location = useLocation();
  return (
    <nav className="hidden md:flex items-center space-x-2 px-6 h-16 bg-white border-b border-gray-200 shadow-sm">
      {/* 学习社区下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium ${location.pathname.startsWith('/concepts') || location.pathname.startsWith('/cases') || location.pathname.startsWith('/implementation') || location.pathname.startsWith('/learning') ? 'bg-blue-50 text-blue-600' : ''}`}>学习社区 <ChevronDown className="w-4 h-4 ml-1" /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {studyMenuItems.map(item => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* 其它一级入口 */}
      {mainNavItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium ${location.pathname.startsWith(item.path) ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          <item.icon className="h-5 w-5 mr-1" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
