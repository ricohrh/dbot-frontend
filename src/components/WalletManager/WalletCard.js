import React from 'react';
import CopyableAddress from '../common/CopyableAddress';
import { useEffect, useState } from 'react';
import { walletService } from '../../services/walletService';

const WalletCard = ({ wallet, onEdit, onDelete, onInfo }) => {
  const [balance, setBalance] = useState(typeof wallet.balance !== 'undefined' ? wallet.balance : null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (typeof wallet.balance === 'undefined' && wallet.address) {
        try {
          setLoadingBalance(true);
          const resp = await walletService.getWalletBalance(wallet.address, wallet.type || 'solana');
          const uiAmount = (resp && resp.res && (resp.res.uiAmount ?? resp.res.amount)) || 0;
          setBalance(uiAmount);
        } catch (e) {
          setBalance(0);
        } finally {
          setLoadingBalance(false);
        }
      }
    };
    load();
  }, [wallet.address, wallet.balance, wallet.type]);

  const formatAddress = (address) => {
    if (!address) return '未知';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h3>{wallet.name}</h3>
        <span className="wallet-type">{wallet.type || 'solana'}</span>
      </div>
      <div className="wallet-info">
        <div className="info-item">
          <span className="label">钱包ID:</span>
          <span className="value id">{wallet.id || wallet._id}</span>
        </div>
        <div className="info-item">
          <span className="label">地址:</span>
          <CopyableAddress 
            address={wallet.address} 
            className="wallet-address"
            showCopyButton={true}
          />
        </div>
        <div className="info-item">
          <span className="label">类型:</span>
          <span className="value type">{wallet.type || 'solana'}</span>
        </div>
        <div className="info-item">
          <span className="label">排序:</span>
          <span className="value sort">{wallet.sort || 0}</span>
        </div>
        <div className="info-item">
          <span className="label">余额(SOL):</span>
          <span className="value balance">
            {loadingBalance && typeof balance !== 'number' ? '加载中...' : Number(balance || wallet.balance || 0).toFixed(6)}
          </span>
        </div>
      </div>
      <div className="wallet-actions">
        <button 
          className="btn btn-sm btn-outline"
          onClick={onInfo}
          style={{ marginRight: '8px' }}
        >
          📊 详情
        </button>
        <button 
          className="btn btn-sm btn-outline"
          onClick={onEdit}
          style={{ marginRight: '8px', backgroundColor: '#fff', color: '#0066cc', border: '1px solid #0066cc' }}
        >
          ✏️ 编辑
        </button>
        <button 
          className="btn btn-sm btn-outline"
          onClick={onDelete}
          style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545' }}
        >
          🗑️ 删除
        </button>
      </div>
    </div>
  );
};

export default WalletCard; 