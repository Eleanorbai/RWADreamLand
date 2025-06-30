import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
  id?: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, id = 'mermaid-chart' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chartRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Initialize mermaid only once
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
          themeVariables: {
            primaryColor: '#3B82F6',
            primaryTextColor: '#1F2937',
            primaryBorderColor: '#2563EB',
            lineColor: '#6B7280',
            secondaryColor: '#F3F4F6',
            tertiaryColor: '#FBBF24',
          }
        });

        // Generate unique ID for this chart
        const chartId = `mermaid-${id}-${Date.now()}`;
        
        // Clear the container
        chartRef.current.innerHTML = '';
        
        // Render the chart
        const { svg } = await mermaid.render(chartId, chart);
        chartRef.current.innerHTML = svg;
        
        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('图表渲染失败，请刷新页面重试');
        setIsLoading(false);
      }
    };

    renderChart();
  }, [chart, id]);

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">正在加载图表...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full overflow-x-auto bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-64 text-red-600">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white p-6 rounded-lg shadow-sm border">
      <div ref={chartRef} className="mermaid-chart text-center" />
    </div>
  );
};

export default MermaidChart;
