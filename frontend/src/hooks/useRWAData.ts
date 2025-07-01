import { useState, useEffect } from 'react';

export interface RWAMarketData {
  totalRwaValue: number;
  totalRwaValueChange: number;
  newIssuanceVolume: number;
  newIssuanceChange: number;
  totalAssetHolders: number;
  totalHoldersChange: number;
  totalIssuers: number;
  activeProtocols: number;
  lastUpdated: string;
}

export interface AssetClass {
  name: string;
  value: number;
  change: number;
  percentage: number;
  color: string;
  description: string;
}

export const useRWAData = () => {
  const [marketData, setMarketData] = useState<RWAMarketData | null>(null);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRWAData = async () => {
      try {
        setLoading(true);
        
        // TODO: 替换为真实的API调用
        // const response = await fetch('/api/rwa/market-data');
        // const data = await response.json();
        
        // 模拟数据 - 生产环境请替换为真实API
        const mockData: RWAMarketData = {
          totalRwaValue: 24.44,
          totalRwaValueChange: 5.71,
          newIssuanceVolume: 2.1,
          newIssuanceChange: 12.5,
          totalAssetHolders: 222326,
          totalHoldersChange: 95.77,
          totalIssuers: 196,
          activeProtocols: 85,
          lastUpdated: new Date().toISOString()
        };
        
        const mockAssetClasses: AssetClass[] = [
          { name: 'Stablecoins', value: 240.0, change: 2.22, percentage: 85.2, color: 'bg-blue-500', description: 'USD-pegged digital assets' },
          { name: 'U.S. Treasuries', value: 1.2, change: -1.5, percentage: 4.3, color: 'bg-green-500', description: 'Government securities' },
          { name: 'Private Credit', value: 8.9, change: 12.3, percentage: 3.2, color: 'bg-purple-500', description: 'Corporate lending' },
          { name: 'Commodities', value: 0.8, change: 5.7, percentage: 2.8, color: 'bg-orange-500', description: 'Physical assets' },
          { name: 'Real Estate', value: 2.1, change: 8.4, percentage: 7.5, color: 'bg-indigo-500', description: 'Property tokens' }
        ];
        
        setMarketData(mockData);
        setAssetClasses(mockAssetClasses);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch RWA data');
      } finally {
        setLoading(false);
      }
    };

    fetchRWAData();
    
    // 设置定时更新 (5分钟)
    const interval = setInterval(fetchRWAData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { marketData, assetClasses, loading, error };
};
