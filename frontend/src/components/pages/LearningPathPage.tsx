import React, { useState } from 'react';
import { Star, Clock, Users, BookOpen, Code, Zap, Target, ChevronRight, Play, CheckCircle2 } from 'lucide-react';

const LearningPathPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);

  const toggleSkillCompletion = (skillId: string) => {
    setCompletedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const learningLevels = [
    {
      id: 'beginner',
      title: '初级入门',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      duration: '4-6周',
      difficulty: 'beginner',
      description: '从零开始学习RWA基础概念和区块链技术',
      prerequisites: '无特殊要求，具备基本计算机操作能力即可'
    },
    {
      id: 'intermediate',
      title: '中级进阶',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      duration: '8-12周',
      difficulty: 'intermediate',
      description: '深入学习智能合约开发和DeFi协议',
      prerequisites: '完成初级课程，具备基础编程经验'
    },
    {
      id: 'advanced',
      title: '高级实战',
      icon: Zap,
      color: 'from-purple-500 to-violet-500',
      duration: '12-16周',
      difficulty: 'advanced',
      description: '掌握完整RWA项目开发和实施',
      prerequisites: '完成中级课程，具备智能合约开发经验'
    }
  ];

  const skillCategories = {
    beginner: [
      {
        category: '区块链基础',
        priority: '高优先级',
        skills: [
          {
            id: 'blockchain-basics',
            title: '区块链基本原理',
            description: '理解分布式账本、共识机制、密码学基础',
            duration: '1-2周',
            resources: ['《精通以太坊》', '以太坊官方文档', 'ConsenSys Academy'],
            projects: ['搭建本地以太坊节点', '创建第一个钱包', '进行第一笔交易']
          },
          {
            id: 'ethereum-basics',
            title: '以太坊和智能合约',
            description: '了解以太坊生态系统和智能合约概念',
            duration: '2-3周',
            resources: ['Ethereum.org', 'Solidity官方文档', 'CryptoZombies'],
            projects: ['部署简单智能合约', '与智能合约交互', '理解Gas机制']
          }
        ]
      },
      {
        category: 'RWA基础概念',
        priority: '高优先级',
        skills: [
          {
            id: 'rwa-concepts',
            title: 'RWA核心概念',
            description: '掌握现实世界资产代币化的基本理念',
            duration: '1周',
            resources: ['RWA研究报告', 'DeFi Pulse', 'Messari RWA报告'],
            projects: ['分析RWA案例', '绘制RWA生态图', '撰写RWA分析报告']
          },
          {
            id: 'tokenization-basics',
            title: '资产代币化基础',
            description: '理解代币化流程和法律合规要求',
            duration: '1-2周',
            resources: ['证券化基础教程', '法律合规指南', '监管政策解读'],
            projects: ['设计代币化方案', '分析合规要求', '制定风险控制策略']
          }
        ]
      },
      {
        category: '金融与法律知识',
        priority: '中优先级',
        skills: [
          {
            id: 'finance-basics',
            title: '基础金融概念',
            description: '了解估值、风险、收益等基本金融概念',
            duration: '2-3周',
            resources: ['Coursera金融课程', '《金融学原理》', 'Khan Academy'],
            projects: ['资产估值练习', '风险分析报告', '投资组合设计']
          },
          {
            id: 'legal-basics',
            title: '基础法律概念',
            description: '掌握合同法、证券法等相关法律知识',
            duration: '2-3周',
            resources: ['法律基础教程', '证券法解读', '合规案例分析'],
            projects: ['起草智能合约条款', '分析法律风险', '制定合规流程']
          }
        ]
      }
    ],
    intermediate: [
      {
        category: '智能合约开发',
        priority: '高优先级',
        skills: [
          {
            id: 'solidity-development',
            title: 'Solidity语言精通',
            description: '熟练掌握Solidity语言和OpenZeppelin库',
            duration: '3-4周',
            resources: ['Solidity官方文档', 'OpenZeppelin文档', 'Hardhat教程'],
            projects: ['ERC-20代币合约', 'ERC-721 NFT合约', '多签钱包合约']
          },
          {
            id: 'smart-contract-security',
            title: '智能合约安全',
            description: '了解常见漏洞和安全最佳实践',
            duration: '2-3周',
            resources: ['智能合约安全指南', 'SWC漏洞库', '审计报告案例'],
            projects: ['漏洞检测工具使用', '安全审计实践', '安全合约开发']
          }
        ]
      },
      {
        category: 'DeFi协议理解',
        priority: '中优先级',
        skills: [
          {
            id: 'defi-protocols',
            title: '主流DeFi协议',
            description: '深入理解Uniswap、Aave、MakerDAO等协议',
            duration: '3-4周',
            resources: ['Finematics YouTube', 'DeFi Pulse', '协议官方文档'],
            projects: ['流动性挖矿实践', 'Flash Loan开发', 'AMM机制实现']
          },
          {
            id: 'yield-farming',
            title: '收益耕作策略',
            description: '理解收益优化和风险管理策略',
            duration: '2-3周',
            resources: ['Yearn Finance文档', '收益策略分析', 'TVL数据分析'],
            projects: ['收益策略设计', '风险评估模型', '自动化策略实现']
          }
        ]
      },
      {
        category: '预言机技术',
        priority: '中优先级',
        skills: [
          {
            id: 'oracle-integration',
            title: 'Chainlink预言机',
            description: '掌握预言机集成和数据获取',
            duration: '2-3周',
            resources: ['Chainlink文档', '预言机最佳实践', 'Web3数据源'],
            projects: ['价格预言机集成', '随机数生成', '外部API调用']
          },
          {
            id: 'iot-integration',
            title: 'IoT数据集成',
            description: '学习物联网设备与区块链的集成',
            duration: '2-3周',
            resources: ['IoT区块链案例', 'MQTT协议', '边缘计算'],
            projects: ['传感器数据上链', '设备认证系统', '实时监控面板']
          }
        ]
      }
    ],
    advanced: [
      {
        category: '完整项目开发',
        priority: '高优先级',
        skills: [
          {
            id: 'full-stack-dapp',
            title: '全栈DApp开发',
            description: '构建完整的去中心化应用',
            duration: '4-6周',
            resources: ['React官方文档', 'Web3.js/Ethers.js', 'IPFS集成'],
            projects: ['RWA交易平台', '投资者门户', '资产管理面板']
          },
          {
            id: 'cross-chain-development',
            title: '跨链技术实现',
            description: '掌握多链部署和跨链桥接技术',
            duration: '3-4周',
            resources: ['Polygon文档', 'Layer 2解决方案', '跨链桥原理'],
            projects: ['多链代币部署', '跨链资产转移', '流动性聚合器']
          }
        ]
      },
      {
        category: '企业级实施',
        priority: '高优先级',
        skills: [
          {
            id: 'enterprise-architecture',
            title: '企业级架构设计',
            description: '设计可扩展的企业级RWA解决方案',
            duration: '3-4周',
            resources: ['企业架构指南', '微服务设计', '云原生架构'],
            projects: ['架构设计文档', '技术选型报告', '扩展性测试']
          },
          {
            id: 'compliance-implementation',
            title: '合规体系实施',
            description: '建立完整的合规监管体系',
            duration: '3-4周',
            resources: ['监管政策分析', 'KYC/AML实施', '隐私保护技术'],
            projects: ['合规流程设计', 'KYC系统开发', '监管报告自动化']
          }
        ]
      },
      {
        category: '项目管理与运营',
        priority: '中优先级',
        skills: [
          {
            id: 'project-management',
            title: '项目管理实践',
            description: '掌握RWA项目的全生命周期管理',
            duration: '2-3周',
            resources: ['敏捷开发方法', '项目管理工具', '团队协作'],
            projects: ['项目计划制定', '风险管理体系', '质量保证流程']
          },
          {
            id: 'tokenomics-design',
            title: '代币经济学设计',
            description: '设计可持续的代币经济模型',
            duration: '2-3周',
            resources: ['代币经济学理论', '激励机制设计', '治理模型'],
            projects: ['代币分配方案', '治理机制设计', '激励模型优化']
          }
        ]
      }
    ]
  };

  const practiceProjects = [
    {
      title: '模拟房地产RWA项目',
      description: '将房产租金收益权代币化，开发包含NFT所有权和租金收集金库的DApp',
      difficulty: 'intermediate',
      duration: '3-4周',
      skills: ['智能合约开发', '前端开发', '收益分配'],
      steps: [
        '编写房产评估报告和法律文件',
        '开发ERC-721合约代表房产所有权',
        '开发金库合约收集和分配租金',
        '构建用户界面和投资者门户'
      ]
    },
    {
      title: '供应链金融平台',
      description: '将企业应收账款作为RWA进行融资，实现电子凭证转让和抵押',
      difficulty: 'advanced',
      duration: '4-6周',
      skills: ['复杂合约开发', '企业级架构', '合规实施'],
      steps: [
        '设计应收账款登记流程',
        '开发电子凭证NFT系统',
        '实现保理公司融资机制',
        '集成KYC和风控系统'
      ]
    },
    {
      title: '农业资产代币化',
      description: '基于马陆葡萄案例，构建农业资产RWA平台',
      difficulty: 'advanced',
      duration: '6-8周',
      skills: ['IoT集成', '数据分析', '复合资产管理'],
      steps: [
        '设计物理+数据复合资产模型',
        '集成IoT传感器数据上链',
        '实现精细化收益分配',
        '构建投资者和管理者双端界面'
      ]
    }
  ];

  const currentSkills = skillCategories[selectedLevel as keyof typeof skillCategories] || [];
  const currentLevel = learningLevels.find(level => level.id === selectedLevel);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RWA学习路径</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            分层次的技能学习路径，从基础概念到项目实战，系统掌握RWA开发技能
          </p>
        </div>

        {/* Level Selection */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`text-left p-6 rounded-xl transition-all transform hover:scale-105 ${
                  selectedLevel === level.id
                    ? 'ring-2 ring-blue-500 shadow-xl'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`bg-gradient-to-r ${level.color} p-4 rounded-lg mb-4`}>
                  <level.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{level.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {level.duration}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {level.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Level Details */}
        {currentLevel && (
          <div className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`bg-gradient-to-r ${currentLevel.color} p-3 rounded-lg`}>
                <currentLevel.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentLevel.title}</h2>
                <p className="text-gray-600">{currentLevel.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">学习时长</h3>
                <p className="text-gray-600">{currentLevel.duration}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">前置要求</h3>
                <p className="text-gray-600">{currentLevel.prerequisites}</p>
              </div>
            </div>
          </div>
        )}

        {/* Skills Categories */}
        <div className="space-y-8">
          {currentSkills.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{category.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    category.priority === '高优先级' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {category.priority}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {category.skills.map((skill) => {
                  const isCompleted = completedSkills.includes(skill.id);
                  
                  return (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleSkillCompletion(skill.id)}
                            className="mt-1"
                          >
                            <CheckCircle2 className={`h-6 w-6 ${
                              isCompleted ? 'text-green-600' : 'text-gray-300'
                            }`} />
                          </button>
                          <div>
                            <h4 className={`text-lg font-semibold mb-2 ${
                              isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {skill.title}
                            </h4>
                            <p className="text-gray-600 mb-3">{skill.description}</p>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <Clock className="h-4 w-4 mr-1" />
                              {skill.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">推荐资源</h5>
                          <ul className="space-y-1">
                            {skill.resources.map((resource, index) => (
                              <li key={index} className="text-sm text-gray-600">• {resource}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="lg:col-span-2">
                          <h5 className="font-medium text-gray-900 mb-2">实践项目</h5>
                          <ul className="space-y-1">
                            {skill.projects.map((project, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <Play className="h-3 w-3 mr-2 text-blue-600" />
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Practice Projects */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">实践项目推荐</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {practiceProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.difficulty === 'advanced' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.difficulty === 'advanced' ? '高级' : '中级'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {project.duration}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">所需技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">实施步骤</h4>
                  <ul className="space-y-1">
                    {project.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">学习进度</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{completedSkills.length}</div>
                <div className="text-green-100">已掌握技能</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {currentSkills.reduce((total, category) => total + category.skills.length, 0)}
                </div>
                <div className="text-green-100">当前级别技能</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {Math.round((completedSkills.length / Math.max(currentSkills.reduce((total, category) => total + category.skills.length, 0), 1)) * 100)}%
                </div>
                <div className="text-green-100">完成率</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">3</div>
                <div className="text-green-100">实践项目</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;
