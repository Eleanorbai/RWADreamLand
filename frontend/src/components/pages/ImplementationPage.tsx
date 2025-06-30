import React, { useState } from 'react';
import { CheckCircle, Circle, Code, Server, Shield, Wrench, AlertTriangle, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ImplementationPage: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const implementationPhases = [
    {
      phase: '阶段一：资产端（Off-Chain）准备',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      steps: [
        {
          title: '资产选择与尽职调查',
          description: '选择具有稳定现金流、价值清晰、法律关系明确的现实世界资产',
          details: [
            '评估资产的现金流稳定性和可预测性',
            '确认资产所有权和法律地位的清晰性',
            '分析资产的市场价值和增值潜力',
            '评估相关的法律和监管风险'
          ]
        },
        {
          title: '资产打包与结构化',
          description: '将选定资产进行打包，设计合理的金融结构',
          details: [
            '设立特殊目的实体（SPV）持有资产',
            '实现风险隔离和破产隔离',
            '设计优先级和次级结构',
            '确定收益分配机制'
          ]
        },
        {
          title: '法律与合规框架搭建',
          description: '建立符合目标市场监管要求的法律结构',
          details: [
            '聘请专业法律顾问团队',
            '起草信托协议和资产转让协议',
            '准备信息披露文件',
            '建立投资者权益保护机制'
          ]
        },
        {
          title: '资产评估与信用增级',
          description: '通过第三方评估和增信措施提高资产信用等级',
          details: [
            '委托独立评估机构进行资产估值',
            '引入保险、担保等增信措施',
            '设立储备账户和超额抵押',
            '建立早期偿付和违约处理机制'
          ]
        }
      ]
    },
    {
      phase: '阶段二：资产上链（Tokenization）技术实现',
      icon: Code,
      color: 'from-purple-500 to-violet-500',
      steps: [
        {
          title: '技术选型与架构设计',
          description: '选择合适的区块链平台并设计整体技术架构',
          details: [
            '评估以太坊、Polygon、BSC等公链平台',
            '考虑联盟链方案如Hyperledger Fabric',
            '设计链上链下数据交互架构',
            '规划扩展性和互操作性方案'
          ]
        },
        {
          title: '资产代币化',
          description: '将SPV持有的资产权益在区块链上表示为代币',
          details: [
            '选择ERC-20（同质化）或ERC-721（非同质化）标准',
            '定义代币的属性、权利和义务',
            '设计代币发行、转让和赎回机制',
            '建立代币与底层资产的映射关系'
          ]
        },
        {
          title: '智能合约开发与部署',
          description: '开发管理代币生命周期和权益分配的智能合约',
          details: [
            '代币发行合约开发',
            '收益分配机制实现',
            '投票治理功能开发',
            '安全审计和测试'
          ]
        },
        {
          title: '预言机集成',
          description: '集成可靠的预言机获取外部数据',
          details: [
            '选择Chainlink等成熟预言机方案',
            '设计数据来源的多样性和可靠性',
            '实现价格、利率等关键数据获取',
            '建立数据异常处理机制'
          ]
        }
      ]
    },
    {
      phase: '阶段三：资金端（On-Chain）发行与流通',
      icon: Server,
      color: 'from-green-500 to-emerald-500',
      steps: [
        {
          title: '发行与募资',
          description: '向合格投资者发行RWA代币并募集资金',
          details: [
            '确定发行规模和定价策略',
            '建立投资者白名单和KYC流程',
            '选择发行平台和销售渠道',
            '执行发行和资金托管'
          ]
        },
        {
          title: '二级市场交易',
          description: '为RWA代币提供流动性和交易便利',
          details: [
            '选择合规的DEX或CEX平台',
            '设计做市商机制',
            '建立交易监控和风控体系',
            '提供投资者教育和支持'
          ]
        },
        {
          title: '投资者关系管理',
          description: '维护投资者关系并保障权益',
          details: [
            '定期发布资产运营报告',
            '建立透明的信息披露机制',
            '实施DAO治理机制',
            '处理投资者咨询和投诉'
          ]
        }
      ]
    },
    {
      phase: '阶段四：存续期管理与风险控制',
      icon: Wrench,
      color: 'from-orange-500 to-red-500',
      steps: [
        {
          title: '资产监控与管理',
          description: '持续监控底层资产运营状况',
          details: [
            '建立实时资产监控体系',
            '监测现金流和收益表现',
            '处理违约和法律风险',
            '实施资产处置和退出机制'
          ]
        },
        {
          title: '技术运维与安全',
          description: '保障区块链系统和智能合约稳定运行',
          details: [
            '监控智能合约执行状态',
            '实施网络安全防护措施',
            '管理私钥和多签安全',
            '准备应急响应和灾备方案'
          ]
        },
        {
          title: '合规与监管沟通',
          description: '确保项目持续符合监管要求',
          details: [
            '跟踪监管政策变化',
            '维护与监管机构的沟通',
            '更新合规流程和文件',
            '应对监管检查和审计'
          ]
        }
      ]
    }
  ];

  const bestPractices = [
    {
      icon: AlertTriangle,
      title: '关键注意事项',
      items: [
        '法律合规是生命线：RWA项目深度嵌入现实世界的法律和金融体系，合规是项目成功的基石',
        '资产质量是核心：底层资产的质量直接决定了RWA项目的价值和风险',
        '技术与业务的深度融合：技术团队需要与金融、法律团队紧密合作',
        '透明度是关键：充分的信息披露是建立投资者信任的关键'
      ]
    },
    {
      icon: Lightbulb,
      title: '开发环境搭建',
      items: [
        '操作系统：Ubuntu 20.04或更高版本',
        'Node.js：使用nvm安装v16或更高版本',
        '开发框架：Hardhat',
        '本地网络：Hardhat Network',
        '代码编辑器：VS Code，并安装Solidity插件'
      ]
    }
  ];

  const smartContractExample = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RWAToken
 * @dev RWA资产代币化智能合约示例
 */
contract RWAToken is ERC20, Ownable, ReentrancyGuard {
    // 资产信息结构
    struct AssetInfo {
        string assetType;
        string location;
        uint256 totalValue;
        uint256 annualYield;
        bool isActive;
    }
    
    // 收益分配记录
    struct YieldDistribution {
        uint256 totalAmount;
        uint256 timestamp;
        uint256 perTokenAmount;
    }
    
    AssetInfo public assetInfo;
    YieldDistribution[] public yieldHistory;
    
    mapping(address => uint256) public lastClaimIndex;
    
    event YieldDistributed(uint256 amount, uint256 perTokenAmount);
    event YieldClaimed(address indexed holder, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        AssetInfo memory _assetInfo,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        assetInfo = _assetInfo;
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    /**
     * @dev 分配收益给所有代币持有者
     */
    function distributeYield() external payable onlyOwner {
        require(msg.value > 0, "Yield amount must be greater than 0");
        require(totalSupply() > 0, "No tokens in circulation");
        
        uint256 perTokenAmount = msg.value / totalSupply();
        
        yieldHistory.push(YieldDistribution({
            totalAmount: msg.value,
            timestamp: block.timestamp,
            perTokenAmount: perTokenAmount
        }));
        
        emit YieldDistributed(msg.value, perTokenAmount);
    }
    
    /**
     * @dev 持有者提取未领取的收益
     */
    function claimYield() external nonReentrant {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No tokens held");
        
        uint256 totalClaimable = 0;
        uint256 startIndex = lastClaimIndex[msg.sender];
        
        for (uint256 i = startIndex; i < yieldHistory.length; i++) {
            totalClaimable += balance * yieldHistory[i].perTokenAmount;
        }
        
        require(totalClaimable > 0, "No yield to claim");
        
        lastClaimIndex[msg.sender] = yieldHistory.length;
        
        (bool success, ) = payable(msg.sender).call{value: totalClaimable}("");
        require(success, "Transfer failed");
        
        emit YieldClaimed(msg.sender, totalClaimable);
    }
    
    /**
     * @dev 查询未领取收益
     */
    function pendingYield(address holder) external view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;
        
        uint256 totalPending = 0;
        uint256 startIndex = lastClaimIndex[holder];
        
        for (uint256 i = startIndex; i < yieldHistory.length; i++) {
            totalPending += balance * yieldHistory[i].perTokenAmount;
        }
        
        return totalPending;
    }
}
`;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RWA项目实施指南</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            从概念到落地的完整实施流程，涵盖法律、技术、业务全方位指导
          </p>
        </div>

        {/* Implementation Phases */}
        <div className="space-y-12">
          {implementationPhases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Phase Header */}
              <div className={`bg-gradient-to-r ${phase.color} p-6`}>
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <phase.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{phase.phase}</h2>
                    <p className="text-white text-opacity-90">
                      {phase.steps.length} 个关键步骤
                    </p>
                  </div>
                </div>
              </div>

              {/* Phase Steps */}
              <div className="p-6">
                <div className="space-y-6">
                  {phase.steps.map((step, stepIndex) => {
                    const globalStepIndex = phaseIndex * 10 + stepIndex;
                    const isCompleted = completedSteps.includes(globalStepIndex);
                    
                    return (
                      <div key={stepIndex} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleStep(globalStepIndex)}
                            className="mt-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              isCompleted ? 'text-green-600 line-through' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{step.description}</p>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-3">实施要点：</h4>
                              <ul className="space-y-2">
                                {step.details.map((detail, detailIndex) => (
                                  <li key={detailIndex} className="text-sm text-gray-700 flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Best Practices */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {bestPractices.map((practice, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <practice.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{practice.title}</h3>
              </div>
              <ul className="space-y-3">
                {practice.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-700 flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Smart Contract Example */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">智能合约开发示例</h2>
            <p className="text-gray-600 mb-6">
              以下是一个RWA代币智能合约的基础实现，包含了代币发行、收益分配和治理功能：
            </p>
            <div className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language="solidity"
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '14px'
                }}
              >
                {smartContractExample}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">实施进度</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{completedSteps.length}</div>
                <div className="text-purple-100">已完成步骤</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {implementationPhases.reduce((total, phase) => total + phase.steps.length, 0)}
                </div>
                <div className="text-purple-100">总步骤数</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {Math.round((completedSteps.length / implementationPhases.reduce((total, phase) => total + phase.steps.length, 0)) * 100)}%
                </div>
                <div className="text-purple-100">完成率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationPage;
