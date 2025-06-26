import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface FlowChartProps {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    category: 'off-chain' | 'bridge' | 'on-chain';
  }>;
}

const FlowChart: React.FC<FlowChartProps> = ({ title, description, steps }) => {
  const getStepColor = (category: string) => {
    switch (category) {
      case 'off-chain':
        return 'from-blue-500 to-cyan-500';
      case 'bridge':
        return 'from-orange-500 to-amber-500';
      case 'on-chain':
        return 'from-purple-500 to-violet-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'off-chain':
        return '链下世界 (Off-Chain)';
      case 'bridge':
        return '关键连接层';
      case 'on-chain':
        return '区块链世界 (On-Chain)';
      default:
        return '';
    }
  };

  const groupedSteps = steps.reduce((acc, step, index) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push({ ...step, index: index + 1 });
    return acc;
  }, {} as Record<string, Array<any>>);

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-sm border">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-8">
        {/* Off-Chain Section */}
        {groupedSteps['off-chain'] && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4 text-center">
              {getCategoryLabel('off-chain')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSteps['off-chain'].map((step, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className={`bg-gradient-to-r ${getStepColor('off-chain')} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                      {step.index}
                    </div>
                    <h5 className="font-semibold text-gray-900">{step.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowDown className="h-8 w-8 text-gray-400" />
        </div>

        {/* Bridge Section */}
        {groupedSteps['bridge'] && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-orange-800 mb-4 text-center">
              {getCategoryLabel('bridge')}
            </h4>
            <div className="flex justify-center">
              {groupedSteps['bridge'].map((step, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-orange-200 max-w-md">
                  <div className="flex items-center mb-2">
                    <div className={`bg-gradient-to-r ${getStepColor('bridge')} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                      {step.index}
                    </div>
                    <h5 className="font-semibold text-gray-900">{step.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowDown className="h-8 w-8 text-gray-400" />
        </div>

        {/* On-Chain Section */}
        {groupedSteps['on-chain'] && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-4 text-center">
              {getCategoryLabel('on-chain')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSteps['on-chain'].map((step, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                  <div className="flex items-center mb-2">
                    <div className={`bg-gradient-to-r ${getStepColor('on-chain')} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                      {step.index}
                    </div>
                    <h5 className="font-semibold text-gray-900">{step.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <ArrowRight className="h-4 w-4 mr-2" />
          <span>循环反馈：链上资产表现影响链下资产管理</span>
        </div>
      </div>
    </div>
  );
};

export default FlowChart;
