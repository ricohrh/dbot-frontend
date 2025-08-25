import { apiRequest } from './api';

// 分析服务 - 基于 ChainInsight API
export const analysisService = {
  // 社区分析
  async getCommunityAnalysis(tokenAddress) {
    try {
      console.log('正在获取社区分析数据:', tokenAddress);
      const data = await apiRequest(`/analysis/community?tokenAddress=${tokenAddress}`);
      console.log('社区分析数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取社区分析数据失败:', error);
      throw error;
    }
  },

  // KOL分析
  async getKOLAnalysis(tokenAddress) {
    try {
      console.log('正在获取KOL分析数据:', tokenAddress);
      const data = await apiRequest(`/analysis/kol?tokenAddress=${tokenAddress}`);
      console.log('KOL分析数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取KOL分析数据失败:', error);
      throw error;
    }
  },

  // Twitter分析
  async getTwitterAnalysis(tokenAddress) {
    try {
      console.log('正在获取Twitter分析数据:', tokenAddress);
      const data = await apiRequest(`/analysis/twitter?tokenAddress=${tokenAddress}`);
      console.log('Twitter分析数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取Twitter分析数据失败:', error);
      throw error;
    }
  },

  // Telegram分析
  async getTelegramAnalysis(tokenAddress) {
    try {
      console.log('正在获取Telegram分析数据:', tokenAddress);
      const data = await apiRequest(`/analysis/telegram?tokenAddress=${tokenAddress}`);
      console.log('Telegram分析数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取Telegram分析数据失败:', error);
      throw error;
    }
  },

  // 叙事分析
  async getNarrativeAnalysis(tokenAddress) {
    try {
      console.log('正在获取叙事分析数据:', tokenAddress);
      const data = await apiRequest(`/analysis/narrative?tokenAddress=${tokenAddress}`);
      console.log('叙事分析数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取叙事分析数据失败:', error);
      throw error;
    }
  },

  // 开发者代币
  async getDevTokens(tokenAddress) {
    try {
      console.log('正在获取开发者代币数据:', tokenAddress);
      const data = await apiRequest(`/analysis/dev?tokenAddress=${tokenAddress}`);
      console.log('开发者代币数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取开发者代币数据失败:', error);
      throw error;
    }
  },

  // KOL警报
  async getKOLAlerts(tokenAddress) {
    try {
      console.log('正在获取KOL警报数据:', tokenAddress);
      const data = await apiRequest(`/analysis/alerts`);
      console.log('KOL警报数据获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取KOL警报数据失败:', error);
      throw error;
    }
  }
}; 