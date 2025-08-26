import { apiRequest } from './api';

// 钱包服务
export const walletService = {
  // 获取钱包列表
  async getWallets(includeBalance = false, chain = 'solana') {
    try {
      const data = await apiRequest('/account/wallets');
      const list = data.res || [];

      if (!includeBalance || list.length === 0) {
        return list;
      }

      // 并发请求余额并合并
      const enriched = await Promise.all(list.map(async (w) => {
        try {
          const bal = await this.getWalletBalance(w.address || w.id || w.walletAddress, chain);
          const uiAmount = (bal && bal.res && (bal.res.uiAmount ?? bal.res.amount)) || 0;
          return { ...w, balance: uiAmount };
        } catch (e) {
          return { ...w, balance: 0 };
        }
      }));
      return enriched;
    } catch (error) {
      console.error('获取钱包列表失败:', error);
      throw error;
    }
  },

  // 新增：获取钱包余额
  async getWalletBalance(walletAddress, chain = 'solana') {
    const qs = `chain=${encodeURIComponent(chain)}&walletAddress=${encodeURIComponent(walletAddress)}`;
    return apiRequest(`/wallet/balance?${qs}`);
  },

  // 获取钱包资产数据
  async getWalletAssets(walletAddress, chain = 'solana', opts = {}) {
    try {
      const { page, size, sortBy, sort } = opts || {};
      const qs = new URLSearchParams({ chain, walletAddress });
      if (page !== undefined) qs.set('page', String(page));
      if (size !== undefined) qs.set('size', String(size));
      if (sortBy) qs.set('sortBy', String(sortBy));
      if (sort !== undefined) qs.set('sort', String(sort));
      console.log('正在获取钱包资产，地址:', walletAddress, '链:', chain, '参数:', Object.fromEntries(qs));
      const data = await apiRequest(`/wallet/assets?${qs.toString()}`);
      console.log('获取钱包资产成功:', data);
      
      // 添加调试信息
      if (data.res && Array.isArray(data.res)) {
        console.log('资产数量:', data.res.length);
        if (data.res.length === 0) {
          console.log('该钱包暂无资产');
        } else {
          console.log('资产列表:', data.res);
        }
      }
      
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

  // 导入钱包
  async importWallet(walletData) {
    try {
      const data = await apiRequest('/account/wallet', {
        method: 'POST',
        body: JSON.stringify(walletData)
      });
      console.log('导入钱包成功:', data);
      return data;
    } catch (error) {
      console.error('导入钱包失败:', error);
      throw error;
    }
  },

  // 编辑钱包
  async editWallet(walletData) {
    try {
      const data = await apiRequest('/account/wallet', {
        method: 'PATCH',
        body: JSON.stringify(walletData)
      });
      console.log('编辑钱包成功:', data);
      return data;
    } catch (error) {
      console.error('编辑钱包失败:', error);
      throw error;
    }
  },

  // 删除钱包
  async deleteWallet(walletId) {
    try {
      const data = await apiRequest(`/account/wallet/${walletId}`, {
        method: 'DELETE'
      });
      console.log('删除钱包成功:', data);
      return data;
    } catch (error) {
      console.error('删除钱包失败:', error);
      throw error;
    }
  },

  // 新增：获取浏览器中已连接的钱包地址（Phantom）
  async getConnectedSolanaAddress() {
    try {
      const sol = typeof window !== 'undefined' ? window.solana : null;
      if (!sol || !sol.isPhantom) {
        throw new Error('未检测到 Phantom 钱包');
      }
      const resp = await sol.connect({ onlyIfTrusted: false });
      const address = resp?.publicKey?.toString?.() || '';
      if (!address) throw new Error('连接失败');
      return address;
    } catch (e) {
      throw e;
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