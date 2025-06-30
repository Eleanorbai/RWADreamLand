import React from 'react';
import { BookOpen, Layers, Link as LinkIcon, TrendingUp } from 'lucide-react';
import FlowChart from '../FlowChart';

const ConceptsPage: React.FC = () => {
  const tokenizationSteps = [
    {
      title: '资产选择与尽调',
      description: '选择具有稳定现金流、价值清晰、法律关系明确的现实世界资产',
      category: 'off-chain' as const
    },
    {
      title: '设立SPV并进行资产隔离',
      description: '建立特殊目的实体，将目标资产与原持有人的其他资产隔离',
      category: 'off-chain' as const
    },
    {
      title: '法律确权与价值评估',
      description: '通过法律程序确认资产权属，并进行专业的价值评估',
      category: 'off-chain' as const
    },
    {
      title: '引入第三方托管与审计',
      description: '委托独立第三方机构进行资产托管和审计，确保透明度',
      category: 'off-chain' as const
    },
    {
      title: '预言机/AIoT同步数据',
      description: '通过预言机或物联网设备将链下资产数据安全传输到链上',
      category: 'bridge' as const
    },
    {
      title: '开发和审计智能合约',
      description: '编写管理代币生命周期的智能合约，并进行安全审计',
      category: 'on-chain' as const
    },
    {
      title: '发行RWA代币',
      description: '在区块链上发行代表资产权益的数字代币',
      category: 'on-chain' as const
    },
    {
      title: '在DeFi协议中发行/交易',
      description: '将代币接入去中心化金融协议，提供交易和流动性',
      category: 'on-chain' as const
    },
    {
      title: '治理与收益分配',
      description: '通过智能合约自动执行收益分配和社区治理',
      category: 'on-chain' as const
    }
  ];

  const techArchitectureSteps = [
    {
      title: '用户层 - 投资者和资产方',
      description: '投资者通过DeFi应用参与，资产方通过管理平台操作',
      category: 'off-chain' as const
    },
    {
      title: '应用层 - 智能合约和数据库',
      description: '智能合约处理链上逻辑，链下数据库存储资产信息',
      category: 'bridge' as const
    },
    {
      title: '协议层 - 区块链和预言机',
      description: '区块链提供底层支持，预言机连接外部数据',
      category: 'on-chain' as const
    },
    {
      title: '资产层 - 现实世界资产',
      description: '房地产、债券、基础设施等实体资产',
      category: 'off-chain' as const
    }
  ];

  const assetTypes = [
    { category: '房地产', examples: ['商业地产', '住宅', '租金收入流'] },
    { category: '私人信贷', examples: ['中小企业贷款', '供应链金融', '发票融资'] },
    { category: '固定收益', examples: ['政府债券', '公司债券'] },
    { category: '自然资源', examples: ['贵金属（黄金、白银）', '原油', '碳信用额度'] },
    { category: '知识产权', examples: ['专利', '版税', '音乐版权'] },
    { category: '其他', examples: ['艺术品', '收藏品', '基础设施项目'] }
  ];

  const coreValues = [
    {
      icon: LinkIcon,
      title: '连接TradFi与DeFi',
      description: 'RWA是连接传统金融（TradFi）与去中心化金融（DeFi）的关键桥梁。它将传统金融市场数十万亿美元的庞大资产带入DeFi世界，极大地扩展了DeFi的资产类别和市场规模。'
    },
    {
      icon: TrendingUp,
      title: '提供可持续的真实收益',
      description: '与许多DeFi原生协议依赖代币投机或复杂的杠杆策略产生的波动性收益不同，RWA的收益来源于现实世界的经济活动，如房地产租金、企业贷款利息等。'
    },
    {
      icon: Layers,
      title: '提高资本效率与流动性',
      description: '通过将非流动性资产（如房地产）代币化和碎片化，RWA可以极大地提高其流动性，并降低投资门槛，使更广泛的投资者能够参与其中。'
    },
    {
      icon: BookOpen,
      title: '丰富DeFi投资组合',
      description: 'RWA为DeFi投资者提供了与加密资产相关性较低的全新资产类别，有助于分散风险，构建更多样化的投资组合。'
    }
  ];

  const techComponents = [
    {
      title: '智能合约',
      description: 'RWA项目的核心，定义了代币的权利、收益分配规则、治理机制等。必须经过严格审计。'
    },
    {
      title: '预言机（Oracle）',
      description: '连接链上与链下世界的桥梁，负责将现实世界的资产数据（如估值、收益率）安全、可靠地传输到链上智能合约中。'
    },
    {
      title: '合规与身份验证（KYC/AML）',
      description: 'RWA项目通常需要遵守金融监管规定，因此需要在链上或通过DApp集成KYC（了解你的客户）和AML（反洗钱）解决方案。'
    },
    {
      title: '资产代币化流程',
      description: '涉及资产打包、法律确权、技术实现和市场流通等多个环节，需要金融、法律和技术团队的紧密协作。'
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RWA基础知识</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            深入了解现实世界资产代币化的核心概念、技术架构与实现原理
          </p>
        </div>

        {/* Definition Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">RWA的定义与核心价值</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                RWA（Real World Assets，现实世界资产）是将存在于区块链下（Off-Chain）的、具有实际价值的物理或非物理资产，
                通过"代币化（Tokenization）"的过程引入到区块链上（On-Chain），使其可以在去中心化金融（DeFi）协议中进行交易、融资和组合。
              </p>
              <p className="text-lg text-gray-700">
                这些资产的范围极为广泛，从房地产、贵金属等有形资产，到政府债券、碳信用、企业应收账款等无形资产，都可以成为RWA。
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">核心价值</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <value.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                </div>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Asset Types */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">RWA的主要类型</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assetTypes.map((type, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{type.category}</h3>
                  <ul className="space-y-2">
                    {type.examples.map((example, idx) => (
                      <li key={idx} className="text-gray-600 text-sm">• {example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tokenization Flow */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">资产代币化流程</h2>
            <p className="text-lg text-gray-600 mb-8">
              RWA的技术实现核心在于资产代币化，这是一个将链下资产的权利和价值映射到链上代币的过程。
              该过程涉及法律、金融和技术的复杂结合。
            </p>
            <FlowChart
              title="RWA资产代币化完整流程"
              description="从链下资产准备到链上代币发行的九个关键步骤"
              steps={tokenizationSteps}
            />
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">技术架构深度分析</h2>
            <p className="text-lg text-gray-600 mb-8">
              RWA项目的技术架构通常是混合式的，需要处理链上和链下两部分的交互。
            </p>
            <FlowChart
              title="RWA技术架构层级结构"
              description="从用户层到资产层的完整技术栈"
              steps={techArchitectureSteps}
            />
          </div>
        </section>

        {/* Core Components */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">核心组件解析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techComponents.map((component, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{component.title}</h3>
                  <p className="text-gray-600">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Summary */}
        <section>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">小结</h2>
            <p className="text-lg leading-relaxed">
              RWA代表了DeFi发展的重要方向，它不仅扩展了数字资产的边界，还为传统金融资产提供了新的流动性和可编程性。
              理解RWA的核心概念和技术架构，是掌握这一领域的基础。在接下来的案例研究中，我们将看到这些概念如何在实际项目中得到应用。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConceptsPage;
