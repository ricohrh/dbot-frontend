import React, { useState, useEffect } from 'react';

const WalletModal = ({ type, wallet, onClose, onImport, onEdit, onDelete, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    privateKey: '',
    type: 'solana'
  });

  // 当编辑模式时，初始化表单数据
  useEffect(() => {
    if (type === 'edit' && wallet) {
      setFormData({
        name: wallet.name || '',
        privateKey: '',
        type: wallet.type || 'solana'
      });
    } else if (type === 'add') {
      setFormData({
        name: '',
        privateKey: '',
        type: 'solana'
      });
    }
  }, [type, wallet]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'add') {
      onImport(formData);
    } else if (type === 'edit') {
      onEdit({
        _id: wallet.id || wallet._id,
        name: formData.name
      });
    } else if (type === 'delete') {
      onDelete(wallet.id || wallet._id);
    }
  };

  const renderAddForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>钱包名称</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="输入钱包名称"
          required
        />
      </div>
      <div className="form-group">
        <label>私钥</label>
        <input
          type="password"
          name="privateKey"
          value={formData.privateKey}
          onChange={handleInputChange}
          placeholder="输入私钥"
          required
        />
      </div>
      <div className="form-group">
        <label>钱包类型</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
        >
          <option value="solana">Solana</option>
          <option value="evm">EVM</option>
          <option value="tron">TRON</option>
        </select>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '导入中...' : '导入钱包'}
        </button>
      </div>
    </form>
  );

  const renderEditForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>钱包名称</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="输入新的钱包名称"
          required
        />
      </div>
      <div className="form-group">
        <label>钱包类型</label>
        <input
          type="text"
          value={formData.type}
          disabled
          className="form-control-disabled"
        />
        <small className="form-help">钱包类型不可修改</small>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '保存中...' : '保存修改'}
        </button>
      </div>
    </form>
  );

  const renderDeleteConfirm = () => (
    <div className="delete-confirmation">
      <div className="warning-icon">⚠️</div>
      <h3>确认删除钱包</h3>
      <p>您确定要删除钱包 "{wallet?.name}" 吗？</p>
      <p className="warning-text">此操作不可撤销！</p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>
          取消
        </button>
        <button 
          className="btn btn-danger" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '删除中...' : '确认删除'}
        </button>
      </div>
    </div>
  );

  const renderWalletInfo = () => (
    <div className="wallet-details">
      <h3>钱包详情</h3>
      <div className="detail-row">
        <span className="label">钱包名称:</span>
        <span className="value">{wallet?.name}</span>
      </div>
      <div className="detail-row">
        <span className="label">钱包ID:</span>
        <span className="value">{wallet?.id || wallet?._id}</span>
      </div>
      <div className="detail-row">
        <span className="label">钱包地址:</span>
        <span className="value">{wallet?.address}</span>
      </div>
      <div className="detail-row">
        <span className="label">钱包类型:</span>
        <span className="value">{wallet?.type}</span>
      </div>
      <div className="detail-row">
        <span className="label">排序:</span>
        <span className="value">{wallet?.sort}</span>
      </div>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );

  const getModalTitle = () => {
    switch (type) {
      case 'add': return '导入钱包';
      case 'edit': return '编辑钱包';
      case 'delete': return '删除钱包';
      case 'info': return '钱包信息';
      default: return '钱包操作';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'add': return renderAddForm();
      case 'edit': return renderEditForm();
      case 'delete': return renderDeleteConfirm();
      case 'info': return renderWalletInfo();
      default: return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WalletModal; 