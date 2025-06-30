import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Shield, TrendingUp, BookOpen, FileText, Code, Map } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: '连接TradFi与DeFi',
      description: '将传统金融资产引入去中心化金融世界，扩展DeFi资产类别和市场规模',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: '提供可持续收益',
      description: '基于现实世界经济活动的稳定收益，摆脱投机性代币波动',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: '提高资本效率',
      description: '通过资产代币化和碎片化，提高流动性并降低投资门槛',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: TrendingUp,
      title: '丰富投资组合',
      description: '提供与加密资产相关性较低的新资产类别，助力风险分散',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const learningModules = [
    {
      icon: BookOpen,
      title: '基础知识',
      description: 'RWA核心概念、技术架构与实现原理',
      path: '/concepts',
      color: 'bg-blue-600'
    },
    {
      icon: FileText,
      title: '案例研究',
      description: '马陆葡萄、充电桩等中国RWA项目深度分析',
      path: '/cases',
      color: 'bg-green-600'
    },
    {
      icon: Code,
      title: '实践指南',
      description: '项目实施全流程与开发环境搭建',
      path: '/implementation',
      color: 'bg-purple-600'
    },
    {
      icon: Map,
      title: '学习路径',
      description: '分层次技能学习路径与实践项目推荐',
      path: '/learning',
      color: 'bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              RWA学习平台
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              现实世界资产代币化完整学习指南
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-4xl mx-auto">
              掌握RWA项目全流程知识，从基础概念到实践应用，构建连接传统金融与DeFi的桥梁
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/concepts"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                开始学习
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/cases"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                查看案例
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              RWA核心价值
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              了解现实世界资产代币化为金融领域带来的革命性变化
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Modules Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              学习模块
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              从理论到实践，全面掌握RWA项目开发与实施技能
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningModules.map((module, index) => (
              <Link
                key={index}
                to={module.path}
                className="group block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-lg ${module.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {module.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  开始学习
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5+</div>
              <div className="text-xl text-gray-300">中国RWA案例</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100+</div>
              <div className="text-xl text-gray-300">技术要点解析</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">4</div>
              <div className="text-xl text-gray-300">完整学习路径</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            开始您的RWA学习之旅
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            从基础概念到项目实施，系统掌握现实世界资产代币化的完整知识体系
          </p>
          <Link
            to="/concepts"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            立即开始学习
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
