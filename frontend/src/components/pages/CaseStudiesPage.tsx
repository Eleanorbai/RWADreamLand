import React, { useState } from 'react';
import { Building, Zap, Sun, Gamepad2, Smartphone, ChevronRight, MapPin, DollarSign, Cpu } from 'lucide-react';

const CaseStudiesPage: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState(0);

  const cases = [
    {
      id: 0,
      icon: Building,
      title: '马陆葡萄RWA项目',
      subtitle: '中国首个农业RWA项目',
      category: '农业资产',
      investmentAmount: '1000万元',
      location: '上海',
      description: '通过区块链技术将葡萄种植全流程数据资产化，实现农业资产的数字化和金融化',
      highlights: [
        '物理+数据复合资产模式',
        '项目估值提升2.8倍',
        '年收益权分割为10万份数字证书',
        '最低投资门槛100元',
        '产量预计提升20%以上'
      ],
      details: {
        assetType: [
          '物理资产：葡萄植株、大棚设施等实体资产',
          '数据资产：IoT传感器采集的温湿度、光照、土壤pH等数据',
          '收益权：葡萄的年销售收益权',
          '其他权益：品牌价值、数据使用权等'
        ],
        techArchitecture: [
          '底层区块链：支持以太坊、Polkadot、Conflux等主流公链',
          '数据上链：集成IoT传感器，与上海市数字农业云平台集成',
          '智能合约：包含收益分配、风险对冲、退出机制等模块',
          '硬件支持：RootPhone等智能终端提供硬件级安全保障'
        ],
        businessModel: [
          '股权融资通证化，面向更广泛投资者',
          '跨境投资支持，迪拜投资者使用数字人民币认购',
          '精细化管理，数据驱动提升产量',
          '生态拓展至"农业+文旅+金融"综合生态'
        ],
        compliance: [
          '遵循"资产确权、数据上链、价值评估、交易流通"四层技术流程',
          '引入司法公证、产权登记、资产评估等环节',
          '与地方政府监管沙盒合作',
          '利用区块链证据验证平台提高争议解决效率'
        ]
      }
    },
    {
      id: 1,
      icon: Zap,
      title: '新能源充电桩RWA',
      subtitle: '国内首个新能源RWA项目',
      category: '基础设施',
      investmentAmount: '未披露',
      location: '全国',
      description: '将超过9000个充电桩资产进行RWA化，在香港金管局指导下完成跨境融资',
      highlights: [
        '超过9000个充电桩资产',
        '蚂蚁链与AIoT技术集成',
        '香港金管局指导',
        '实现绿色资产跨境融资',
        '解决重资产行业信用评估难题'
      ],
      details: {
        assetType: [
          '核心资产：新能源充电桩的物理资产及其运营收益权'
        ],
        techArchitecture: [
          '核心技术：蚂蚁数科的区块链技术与AIoT集成方案',
          '数据上链：通过AIoT设备将充电桩实时运营数据上链存证',
          '区块链平台：蚂蚁链提供底层技术支持',
          '数据完整性：确保充电量、使用频率、收入等数据真实不可篡改'
        ],
        businessModel: [
          '跨境融资：充电桩资产打包为RWA产品对接全球资本',
          '信用评估：解决传统重资产行业跨境融资信用评估难题',
          '香港市场：成功对接香港金融市场',
          '绿色金融：符合ESG投资理念'
        ],
        compliance: [
          '香港金融管理局指导',
          '确保跨境交易合规性',
          '符合国际金融监管标准'
        ]
      }
    },
    {
      id: 2,
      icon: Sun,
      title: '光伏实体资产RWA',
      subtitle: '国内首单光伏RWA',
      category: '新能源',
      investmentAmount: '超过2亿人民币',
      location: '全国',
      description: '将光伏电站实体资产进行RWA化，为新能源项目建设和运营提供资金支持',
      highlights: [
        '融资规模超过2亿人民币',
        '协鑫能科与蚂蚁数科合作',
        '基于蚂蚁链技术方案',
        '光伏电站实体资产代币化',
        '支持新能源项目发展'
      ],
      details: {
        assetType: [
          '核心资产：光伏电站的实体资产及其产生的电费收益权'
        ],
        techArchitecture: [
          '核心技术：基于蚂蚁链的实体资产RWA化技术方案',
          '资产映射：将光伏电站物理资产映射为链上代币',
          '收益追踪：实时追踪电站发电量和收益情况'
        ],
        businessModel: [
          '资产代币化：将光伏资产进行代币化面向投资者融资',
          '资金用途：为新能源项目建设和运营提供资金支持',
          '收益分配：投资者按持有代币比例获得电费收益分配'
        ],
        compliance: [
          '符合新能源行业监管要求',
          '满足绿色金融政策导向'
        ]
      }
    },
    {
      id: 3,
      icon: Gamepad2,
      title: 'Beyond Gaming',
      subtitle: '跨链游戏RWA生态',
      category: '游戏生态',
      investmentAmount: '未披露',
      location: '跨国',
      description: '连接链游与现实世界资产的跨链RWA生态项目，建立RWA互操作性联盟',
      highlights: [
        '跨链RWA生态建设',
        'BDG核心代币',
        '联合多国监管机构',
        '链上证券基金产品',
        'RWA互操作性联盟'
      ],
      details: {
        assetType: [
          '游戏资产：链游中的虚拟资产与现实世界资产结合',
          '跨链资产：不同区块链之间的资产互操作'
        ],
        techArchitecture: [
          '跨链技术：支持多个区块链网络的资产交互',
          '互操作性：建立统一的RWA资产标准',
          '智能合约：跨链资产管理和交易合约'
        ],
        businessModel: [
          '标准制定：联合多国监管机构制定跨国资产交易标准',
          '产品推出：计划推出链上证券基金等金融产品',
          '联盟构建：建立RWA互操作性联盟促进资产流动'
        ],
        compliance: [
          '多国监管合作',
          '国际标准制定',
          '跨境合规框架'
        ]
      }
    },
    {
      id: 4,
      icon: Smartphone,
      title: 'RootPhone',
      subtitle: '智能终端硬件',
      category: '硬件设施',
      investmentAmount: '未披露',
      location: '中国',
      description: '为RWA通证化提供硬件级安全支持的智能移动终端，降低零售投资者参与门槛',
      highlights: [
        '国密级安全芯片组',
        'Web3架构硬件支持',
        '降低投资门槛',
        '开源核心中间件',
        'IEEE认可的RWA通信标准'
      ],
      details: {
        assetType: [
          '硬件产品：智能移动终端设备',
          '安全服务：硬件级RWA投资安全保障'
        ],
        techArchitecture: [
          '国密级安全：内置国密级安全芯片组',
          '加密算法：支持SM2、SM4等国家标准加密算法',
          'Web3架构：芯片级Web3架构设计',
          '安全保障：为去中心化应用提供硬件层面安全'
        ],
        businessModel: [
          '门槛降低：降低小型零售投资者参与高价值RWA项目门槛',
          '标准建立：开源核心中间件推动IEEE认可的RWA通信标准',
          '硬件销售：智能终端硬件产品销售',
          '服务提供：RWA投资相关安全服务'
        ],
        compliance: [
          '国家密码标准符合性',
          '金融级安全认证',
          '硬件安全标准'
        ]
      }
    }
  ];

  const currentCase = cases[selectedCase];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">中国RWA案例研究</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            深入分析中国领先的RWA项目案例，了解技术架构、业务模式与合规方案
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">案例列表</h2>
              <div className="space-y-3">
                {cases.map((caseItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCase(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedCase === index
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedCase === index ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        <caseItem.icon className={`h-5 w-5 ${
                          selectedCase === index ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{caseItem.title}</h3>
                        <p className="text-xs text-gray-600">{caseItem.subtitle}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${
                        selectedCase === index ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Case Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Case Header */}
              <div className="flex items-start space-x-4 mb-8">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <currentCase.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentCase.title}</h2>
                  <p className="text-lg text-blue-600 mb-4">{currentCase.subtitle}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{currentCase.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{currentCase.investmentAmount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{currentCase.category}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{currentCase.description}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">项目亮点</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentCase.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-8">
                {/* Asset Type */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">资产类型</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {currentCase.details.assetType.map((asset, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {asset}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technical Architecture */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">技术架构</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {currentCase.details.techArchitecture.map((tech, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Business Model */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">业务模式</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {currentCase.details.businessModel.map((model, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {model}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">合规方案</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {currentCase.details.compliance.map((compliance, index) => (
                        <li key={index} className="text-gray-700 text-sm">• {compliance}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">案例总结</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">共同特点</h3>
                <ul className="space-y-2">
                  <li>• 实体资产与区块链技术深度融合</li>
                  <li>• 注重合规性和监管沙盒探索</li>
                  <li>• 创新的业务模式和技术架构</li>
                  <li>• 显著的经济和社会效益</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">发展趋势</h3>
                <ul className="space-y-2">
                  <li>• 从单一资产向复合资产发展</li>
                  <li>• 跨链和互操作性需求增强</li>
                  <li>• 监管框架逐步完善</li>
                  <li>• 投资门槛持续降低</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesPage;
