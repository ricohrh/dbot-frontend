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

  // 导入钱包
  async importWallet(walletData) {
    try {
      const { type, name, privateKey } = walletData;
      const data = await apiRequest('/account/wallet', {
        method: 'POST',
        body: JSON.stringify({ type, name, privateKey })
      });
      console.log('导入钱包成功:', data);
      return data;
    } catch (error) {
      console.error('导入钱包失败:', error);
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
  }
}; 