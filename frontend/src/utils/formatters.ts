/**
 * 数据格式化工具函数 - 仿照 rwa.xyz 风格
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num: number, unit: string = ''): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B${unit}`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M${unit}`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K${unit}`;
  }
  return `${num}${unit}`;
};

export const formatChange = (change: number, showArrow: boolean = true): string => {
  const isPositive = change >= 0;
  const arrow = showArrow ? (isPositive ? '▲' : '▼') : '';
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  
  return `<span class="inline-flex items-center text-sm font-medium ${color}">
    ${arrow && `<span class="mr-1">${arrow}</span>`}
    ${Math.abs(change).toFixed(2)}%
  </span>`;
};

export const formatAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};
