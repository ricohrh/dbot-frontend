import { apiRequest } from './api';

// 钱包服务
export const walletService = {
  // 获取钱包列表
  async getWallets() {
    try {
      const data = await apiRequest('/account/wallets');
      console.log('获取钱包列表成功:', data);
      return data.res || [];
    } catch (error) {
      console.error('获取钱包列表失败:', error);
      throw error;
    }
  },

  // 获取钱包资产数据
  async getWalletAssets(walletAddress, chain = 'solana') {
    try {
      const data = await apiRequest(`/wallet/assets?chain=${chain}&walletAddress=${walletAddress}`);
      console.log('获取钱包资产成功:', data);
      return data;
    } catch (error) {
      console.error('获取钱包资产失败:', error);
      throw error;
    }
  },

  // 获取钱包资产详情
  async getWalletAssetDetails(walletAddress, tokenAddress, chain = 'solana') {
    try {
      const data = await apiRequest(`/wallet/assets?chain=${chain}&walletAddress=${walletAddress}&token=${tokenAddress}`);
      console.log('获取钱包资产详情成功:', data);
      return data;
    } catch (error) {
      console.error('获取钱包资产详情失败:', error);
      throw error;
    }
  },

  // 格式化资产数据
  formatAssetData(assets) {
    if (!assets || !Array.isArray(assets)) {
      return [];
    }

    return assets.map(asset => ({
      id: asset.id || asset.token,
      token: asset.token,
      name: asset.name || 'Unknown',
      symbol: asset.symbol || 'UNKNOWN',
      balance: asset.balance || 0,
      balanceFormatted: this.formatNumber(asset.balance || 0),
      price: asset.price || 0,
      priceFormatted: this.formatCurrency(asset.price || 0),
      value: asset.value || 0,
      valueFormatted: this.formatCurrency(asset.value || 0),
      change24h: asset.change24h || 0,
      change24hFormatted: this.formatPercentage(asset.change24h || 0),
      change24hColor: (asset.change24h || 0) >= 0 ? 'positive' : 'negative',
      marketCap: asset.marketCap || 0,
      marketCapFormatted: this.formatCurrency(asset.marketCap || 0),
      volume24h: asset.volume24h || 0,
      volume24hFormatted: this.formatCurrency(asset.volume24h || 0),
      image: asset.image || null,
      chain: asset.chain || 'solana',
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    }));
  },

  // 计算总资产价值
  calculateTotalValue(assets) {
    if (!assets || !Array.isArray(assets)) {
      return 0;
    }
    return assets.reduce((total, asset) => total + (asset.value || 0), 0);
  },

  // 计算24小时变化
  calculateTotalChange24h(assets) {
    if (!assets || !Array.isArray(assets)) {
      return 0;
    }
    const totalValue = this.calculateTotalValue(assets);
    if (totalValue === 0) return 0;
    
    const weightedChange = assets.reduce((total, asset) => {
      const weight = (asset.value || 0) / totalValue;
      return total + ((asset.change24h || 0) * weight);
    }, 0);
    
    return weightedChange;
  },

  // 格式化数字
  formatNumber(num) {
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    return (num / 1000000000).toFixed(2) + 'B';
  },

  // 格式化货币
  formatCurrency(amount) {
    if (amount === 0) return '$0.00';
    if (amount < 0.01) return '< $0.01';
    if (amount < 1000) return '$' + amount.toFixed(2);
    if (amount < 1000000) return '$' + (amount / 1000).toFixed(2) + 'K';
    if (amount < 1000000000) return '$' + (amount / 1000000).toFixed(2) + 'M';
    return '$' + (amount / 1000000000).toFixed(2) + 'B';
  },

  // 格式化百分比
  formatPercentage(value) {
    if (value === 0) return '0.00%';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
  }
}; 