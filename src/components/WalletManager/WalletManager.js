import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import WalletCard from './WalletCard';
import WalletModal from './WalletModal';
import './WalletManager.css';

const WalletManager = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedWallet, setSelectedWallet] = useState(null);

  // 获取钱包列表
  const fetchWallets = async () => {
    try {
      setLoading(true);
      const walletList = await walletService.getWallets();
      setWallets(walletList);
    } catch (error) {
      setMessage(`获取钱包列表失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 导入钱包
  const handleImportWallet = async (walletData) => {
    try {
      setLoading(true);
      await walletService.importWallet(walletData);
      setMessage('钱包导入成功！');
      setShowModal(false);
      setTimeout(() => fetchWallets(), 1000);
    } catch (error) {
      setMessage(`导入失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除钱包
  const handleDeleteWallet = async (walletId) => {
    try {
      setLoading(true);
      await walletService.deleteWallet(walletId);
      setMessage('钱包删除成功！');
      setShowModal(false);
      setTimeout(() => fetchWallets(), 500);
    } catch (error) {
      setMessage(`删除失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 打开模态框
  const openModal = (type, wallet = null) => {
    setModalType(type);
    setSelectedWallet(wallet);
    setShowModal(true);
    setMessage('');
  };

  // 组件加载时获取钱包列表
  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="wallet-management">
      <div className="section-header">
        <h2>💼 我的钱包</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => openModal('add')}
            disabled={loading}
          >
            ➕ 导入钱包
          </button>
          <button 
            className="btn btn-outline"
            onClick={fetchWallets}
            disabled={loading}
          >
            🔄 刷新列表
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>加载中...</span>
        </div>
      )}
      
      <div className="wallet-grid">
        {wallets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>暂无钱包</h3>
            <p>点击"导入钱包"按钮添加您的第一个钱包</p>
          </div>
        ) : (
          wallets.map(wallet => (
            <WalletCard
              key={wallet.id || wallet._id}
              wallet={wallet}
              onDelete={() => openModal('delete', wallet)}
              onInfo={() => openModal('info', wallet)}
            />
          ))
        )}
      </div>

      {showModal && (
        <WalletModal
          type={modalType}
          wallet={selectedWallet}
          onClose={() => setShowModal(false)}
          onImport={handleImportWallet}
          onDelete={handleDeleteWallet}
          loading={loading}
        />
      )}
    </div>
  );
};

export default WalletManager; 