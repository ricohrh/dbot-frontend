import { apiRequest } from './api';

// 市场数据服务
export const marketDataService = {
  // 获取热门市场数据
  async getHotMarketData() {
    try {
      const data = await apiRequest('/kline/hot?chain=solana&sortBy=buyAndSellTimes&sort=-1&interval=1h');
      console.log('获取热门市场数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取热门市场数据失败:', error);
      throw error;
    }
  },

  // 获取最新市场数据
  async getLatestMarketData() {
    try {
      const data = await apiRequest('/kline/new?chain=solana&sortBy=createdAt&sort=-1&interval=1h');
      console.log('获取最新市场数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取最新市场数据失败:', error);
      throw error;
    }
  },

  // 获取新创建的Meme币数据
  async getNewMemeData() {
    try {
      const data = await apiRequest('/kline/new?chain=solana&sortBy=buyAndSellTimes&sort=-1&interval=1h&filter={"dexs":["pump","raydium_launchpad","boop"]}');
      console.log('获取新创建Meme币数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取新创建Meme币数据失败:', error);
      throw error;
    }
  },

  // 获取即将完成的Meme币数据
  async getUpcomingMemeData() {
    try {
      const data = await apiRequest('/kline/meme?chain=solana&sortBy=buyAndSellTimes&sort=-1&interval=1h&filter={"dexs":["pump","raydium_launchpad","boop"]}');
      console.log('获取即将完成Meme币数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取即将完成Meme币数据失败:', error);
      throw error;
    }
  },

  // 获取飙升的Meme币数据
  async getSoaringMemeData() {
    try {
      const data = await apiRequest('/kline/meme?chain=solana&sortBy=buyAndSellTimes&sort=-1&interval=1h&filter={"dexs":["pump","raydium_launchpad","boop"]}');
      console.log('获取飙升Meme币数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取飙升Meme币数据失败:', error);
      throw error;
    }
  },

  // 获取已开盘的Meme币数据
  async getOpenedMemeData() {
    try {
      const data = await apiRequest('/kline/meme?chain=solana&sortBy=buyAndSellTimes&sort=-1&interval=1h&filter={"dexs":["pump","raydium_launchpad","boop"]}');
      console.log('获取已开盘Meme币数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取已开盘Meme币数据失败:', error);
      throw error;
    }
  },

  // 通用获取市场数据方法
  async getMarketData(endpoint) {
    try {
      const data = await apiRequest(endpoint);
      console.log('获取市场数据成功:', data);
      return data;
    } catch (error) {
      console.error('获取市场数据失败:', error);
      throw error;
    }
  }
}; 