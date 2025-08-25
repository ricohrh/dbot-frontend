import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import './PositionOverview.css';

const PositionOverview = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange24h, setTotalChange24h] = useState(0);
  const [sortBy, setSortBy] = useState('value'); // value, change24h, balance
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [inputMode, setInputMode] = useState('manual'); // manual, select

  // 获取钱包列表
  const fetchWallets = async () => {
    try {
      const walletList = await walletService.getWallets();
      setWallets(walletList);
    } catch (error) {
      console.log('获取钱包列表失败:', error.message);
      // 如果获取失败，不影响手动输入模式
    }
  };

  // 获取钱包资产
  const fetchWalletAssets = async () => {
    const address = inputMode === 'select' ? selectedWallet : walletAddress;
    
    if (!address.trim()) {
      setError('请选择或输入钱包地址');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await walletService.getWalletAssets(address);
      
      if (response.err) {
        setError(response.res || '获取钱包资产失败');
        setAssets([]);
        setTotalValue(0);
        setTotalChange24h(0);
        return;
      }

      const formattedAssets = walletService.formatAssetData(response.res || []);
      setAssets(formattedAssets);
      
      const total = walletService.calculateTotalValue(formattedAssets);
      const change = walletService.calculateTotalChange24h(formattedAssets);
      
      setTotalValue(total);
      setTotalChange24h(change);
    } catch (err) {
      setError(err.message || '获取钱包资产失败');
      setAssets([]);
      setTotalValue(0);
      setTotalChange24h(0);
    } finally {
      setLoading(false);
    }
  };

  // 排序资产
  const sortAssets = (assetsToSort) => {
    return [...assetsToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'value':
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        case 'change24h':
          aValue = a.change24h || 0;
          bValue = b.change24h || 0;
          break;
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        default:
          aValue = a.value || 0;
          bValue = b.value || 0;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  // 处理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 渲染排序图标
  const renderSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedAssets = sortAssets(assets);

  // 组件加载时获取钱包列表
  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="position-overview">
      <div className="section-header">
        <h2>📈 持仓总览</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={fetchWalletAssets}
            disabled={loading}
          >
            {loading ? '🔄 加载中...' : '🔄 刷新'}
          </button>
          <button className="btn btn-outline">📊 导出</button>
        </div>
      </div>

      {/* 钱包地址输入 */}
      <div className="wallet-input-section">
        <div className="input-mode-toggle">
          <button 
            className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
          >
            手动输入
          </button>
          <button 
            className={`mode-btn ${inputMode === 'select' ? 'active' : ''}`}
            onClick={() => setInputMode('select')}
          >
            选择钱包
          </button>
        </div>
        
        {inputMode === 'manual' ? (
          <div className="input-group">
            <input
              type="text"
              placeholder="输入钱包地址..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="wallet-input"
              onKeyPress={(e) => e.key === 'Enter' && fetchWalletAssets()}
            />
            <button 
              className="btn btn-primary"
              onClick={fetchWalletAssets}
              disabled={loading || !walletAddress.trim()}
            >
              查询
            </button>
          </div>
        ) : (
          <div className="input-group">
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="wallet-select"
            >
              <option value="">选择钱包...</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet.address}>
                  {wallet.name} ({wallet.address.slice(0, 8)}...{wallet.address.slice(-8)})
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary"
              onClick={fetchWalletAssets}
              disabled={loading || !selectedWallet}
            >
              查询
            </button>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <h3>获取数据失败</h3>
          <p>{error}</p>
          <button 
            className="btn-retry"
            onClick={fetchWalletAssets}
          >
            重试
          </button>
        </div>
      )}

      {/* 总览统计 */}
      {!error && assets.length > 0 && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>总资产</h3>
              <p className="stat-value">{walletService.formatCurrency(totalValue)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>24h变化</h3>
              <p className={`stat-value ${totalChange24h >= 0 ? 'positive' : 'negative'}`}>
                {walletService.formatPercentage(totalChange24h)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🪙</div>
            <div className="stat-content">
              <h3>代币数量</h3>
              <p className="stat-value">{assets.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* 资产列表 */}
      {!error && assets.length > 0 && (
        <div className="assets-section">
          <div className="section-subheader">
            <h3>资产列表</h3>
            <div className="sort-controls">
              <span>排序:</span>
              <button 
                className={`sort-btn ${sortBy === 'value' ? 'active' : ''}`}
                onClick={() => handleSort('value')}
              >
                价值 {renderSortIcon('value')}
              </button>
              <button 
                className={`sort-btn ${sortBy === 'change24h' ? 'active' : ''}`}
                onClick={() => handleSort('change24h')}
              >
                24h变化 {renderSortIcon('change24h')}
              </button>
              <button 
                className={`sort-btn ${sortBy === 'balance' ? 'active' : ''}`}
                onClick={() => handleSort('balance')}
              >
                余额 {renderSortIcon('balance')}
              </button>
            </div>
          </div>

          <div className="assets-table">
            <div className="table-header">
              <div className="header-cell">代币</div>
              <div className="header-cell">余额</div>
              <div className="header-cell">价格</div>
              <div className="header-cell">价值</div>
              <div className="header-cell">24h变化</div>
              <div className="header-cell">市值</div>
            </div>
            
            <div className="table-body">
              {sortedAssets.map((asset) => (
                <div key={asset.id} className="table-row">
                  <div className="cell token-cell">
                    <div className="token-info">
                      {asset.image && (
                        <img src={asset.image} alt={asset.name} className="token-icon" />
                      )}
                      <div className="token-details">
                        <div className="token-name">{asset.name}</div>
                        <div className="token-symbol">{asset.symbol}</div>
                      </div>
                    </div>
                  </div>
                  <div className="cell">{asset.balanceFormatted}</div>
                  <div className="cell">{asset.priceFormatted}</div>
                  <div className="cell value-cell">{asset.valueFormatted}</div>
                  <div className={`cell change-cell ${asset.change24hColor}`}>
                    {asset.change24hFormatted}
                  </div>
                  <div className="cell">{asset.marketCapFormatted}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!error && !loading && assets.length === 0 && walletAddress && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>暂无资产</h3>
          <p>该钱包地址暂无代币资产</p>
        </div>
      )}
    </div>
  );
};

export default PositionOverview; 