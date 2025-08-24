import React from 'react';

const WalletCard = ({ wallet, onDelete, onInfo }) => {
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
          <span className="value address">{formatAddress(wallet.address)}</span>
        </div>
        <div className="info-item">
          <span className="label">类型:</span>
          <span className="value type">{wallet.type || 'solana'}</span>
        </div>
        <div className="info-item">
          <span className="label">排序:</span>
          <span className="value sort">{wallet.sort || 0}</span>
        </div>
      </div>
      <div className="wallet-actions">
        <button 
          className="btn btn-sm btn-outline"
          onClick={onInfo}
        >
          📊 详情
        </button>
        <button 
          className="btn btn-sm btn-outline"
          onClick={onDelete}
        >
          🗑️ 删除
        </button>
      </div>
    </div>
  );
};

export default WalletCard; 