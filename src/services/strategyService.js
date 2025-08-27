import { apiRequest } from './api';

// 策略服务
export const strategyService = {
  // 扫描符合策略的代币
  async scanStrategyTokens(config) {
    try {
      console.log('正在扫描策略代币:', config);
      const data = await apiRequest('/strategy/scan', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      console.log('策略扫描成功:', data);
      return data;
    } catch (error) {
      console.error('策略扫描失败:', error);
      throw error;
    }
  },

  // 获取单个代币的详细策略分析
  async analyzeTokenStrategy(tokenAddress, chain = 'solana') {
    try {
      console.log('正在分析代币策略:', tokenAddress);
      const data = await apiRequest(`/strategy/analysis/${tokenAddress}?chain=${chain}`);
      console.log('代币策略分析成功:', data);
      return data;
    } catch (error) {
      console.error('代币策略分析失败:', error);
      throw error;
    }
  },

  // 分析持有者钱包风险
  async analyzeHolderWallets(tokenAddress, chain = 'solana') {
    try {
      console.log('正在分析持有者钱包:', tokenAddress);
      const data = await apiRequest(`/strategy/holder-analysis/${tokenAddress}?chain=${chain}`);
      console.log('钱包分析成功:', data);
      return data;
    } catch (error) {
      console.error('钱包分析失败:', error);
      throw error;
    }
  },

  // 获取综合交易决策分析
  async getTradingDecision(tokenAddress, chain = 'solana') {
    try {
      console.log('正在获取交易决策分析:', tokenAddress);
      const data = await apiRequest(`/strategy/trading-decision/${tokenAddress}?chain=${chain}`);
      console.log('交易决策分析成功:', data);
      return data;
    } catch (error) {
      console.error('交易决策分析失败:', error);
      throw error;
    }
  },

  // 批量扫描优质代币
  async scanQualityTokens(chain = 'solana', minConfidence = 60, maxResults = 20) {
    try {
      console.log('正在扫描优质代币:', { chain, minConfidence, maxResults });
      const data = await apiRequest(`/strategy/scan-quality?chain=${chain}&min_confidence=${minConfidence}&max_results=${maxResults}`);
      console.log('优质代币扫描成功:', data);
      return data;
    } catch (error) {
      console.error('优质代币扫描失败:', error);
      throw error;
    }
  },

  // 扫描交易机会（支持 interval 与 rsi_threshold）
  async scanTradingOpportunities(chain = 'solana', timeFilter = '6h', rsiFilter = 'none', interval = '5m', rsiThreshold = 35) {
    try {
      console.log('正在扫描交易机会:', { chain, timeFilter, rsiFilter, interval, rsiThreshold });
      const qs = `chain=${chain}&time_filter=${timeFilter}&rsi_filter=${rsiFilter}&interval=${interval}&rsi_threshold=${rsiThreshold}`;
      const data = await apiRequest(`/strategy/scan-opportunities?${qs}`);
      console.log('交易机会扫描成功:', data);
      return data;
    } catch (error) {
      console.error('交易机会扫描失败:', error);
      throw error;
    }
  },

  // 监控捆绑交易活动
  async monitorBundlerActivity(tokenAddress, chain = 'solana', timeWindow = '1h') {
    try {
      console.log('正在监控捆绑交易活动:', tokenAddress);
      const data = await apiRequest(`/strategy/bundler-monitor/${tokenAddress}?chain=${chain}&time_window=${timeWindow}`);
      console.log('捆绑交易监控成功:', data);
      return data;
    } catch (error) {
      console.error('捆绑交易监控失败:', error);
      throw error;
    }
  },

  // 获取策略配置预设
  getStrategyPresets() {
    return {
      '3h-6h': {
        name: '3-6小时波段',
        timeRange: '3h-6h',
        minHolders: 1200,
        minVolume: 1000,
        description: '适合3-6小时波段交易，持有人数1200+'
      },
      '6h-12h': {
        name: '6-12小时波段',
        timeRange: '6h-12h',
        minHolders: 1500,
        minVolume: 2000,
        description: '适合6-12小时波段交易，持有人数1500+'
      },
      '12h-24h': {
        name: '12-24小时波段',
        timeRange: '12h-24h',
        minHolders: 2000,
        minVolume: 3000,
        description: '适合12-24小时波段交易，持有人数2000+'
      },
      '24h+': {
        name: '24小时以上',
        timeRange: '24h+',
        minHolders: 2500,
        minVolume: 5000,
        description: '适合长期波段，持有人数2500+'
      }
    };
  }
}; 