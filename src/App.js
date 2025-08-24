import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('strategy');
  const [wallets, setWallets] = useState([
    { id: 1, name: '主钱包', address: '0x1234...5678', balance: '1,234.56', currency: 'USDT' },
    { id: 2, name: '交易钱包', address: '0x8765...4321', balance: '567.89', currency: 'USDT' }
  ]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalType, setWalletModalType] = useState('add');
  const [selectedWallet, setSelectedWallet] = useState(null);

  // 策略数据
  const strategies = [
    { id: 1, name: '网格交易策略', status: 'active', profit: '+12.5%', pairs: 'PEPE/USDT', risk: '低' },
    { id: 2, name: '趋势跟踪策略', status: 'paused', profit: '+8.3%', pairs: 'DOGE/USDT', risk: '中' },
    { id: 3, name: '套利策略', status: 'active', profit: '+15.2%', pairs: 'SHIB/USDT', risk: '低' }
  ];

  // 持仓数据
  const positions = [
    { id: 1, symbol: 'PEPE', amount: '1,000,000', value: '1,234.56', profit: '+12.5%', status: 'long' },
    { id: 2, symbol: 'DOGE', amount: '50,000', value: '567.89', profit: '-2.1%', status: 'short' },
    { id: 3, symbol: 'SHIB', amount: '100,000,000', value: '890.12', profit: '+8.7%', status: 'long' }
  ];

  // 交易记录
  const trades = [
    { id: 1, symbol: 'PEPE', type: 'buy', amount: '500,000', price: '0.00000123', time: '2024-01-15 14:30', status: 'completed' },
    { id: 2, symbol: 'DOGE', type: 'sell', amount: '25,000', price: '0.01145', time: '2024-01-15 13:45', status: 'completed' },
    { id: 3, symbol: 'SHIB', type: 'buy', amount: '50,000,000', price: '0.0000089', time: '2024-01-15 12:20', status: 'pending' }
  ];

  const handleWalletAction = (type, wallet = null) => {
    setWalletModalType(type);
    setSelectedWallet(wallet);
    setShowWalletModal(true);
  };

  const renderStrategyManagement = () => (
    <div className="strategy-management">
      <div className="section-header">
        <h2>📊 策略管理</h2>
        <button className="btn btn-primary">➕ 新建策略</button>
      </div>
      
      <div className="strategy-grid">
        {strategies.map(strategy => (
          <div key={strategy.id} className="strategy-card">
            <div className="strategy-header">
              <h3>{strategy.name}</h3>
              <span className={`status-badge ${strategy.status}`}>
                {strategy.status === 'active' ? '🟢 运行中' : '🟡 暂停'}
              </span>
            </div>
            <div className="strategy-details">
              <div className="detail-item">
                <span className="label">交易对:</span>
                <span className="value">{strategy.pairs}</span>
              </div>
              <div className="detail-item">
                <span className="label">收益率:</span>
                <span className={`value ${strategy.profit.startsWith('+') ? 'profit' : 'loss'}`}>
                  {strategy.profit}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">风险等级:</span>
                <span className={`risk-badge ${strategy.risk}`}>{strategy.risk}</span>
              </div>
            </div>
            <div className="strategy-actions">
              <button className="btn btn-sm btn-outline">📊 详情</button>
              <button className="btn btn-sm btn-outline">
                {strategy.status === 'active' ? '⏸️ 暂停' : '▶️ 启动'}
              </button>
              <button className="btn btn-sm btn-danger">🗑️ 删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPositionOverview = () => (
    <div className="position-overview">
      <div className="section-header">
        <h2>📈 持仓总览</h2>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">总资产</span>
            <span className="stat-value">$2,692.57</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">今日收益</span>
            <span className="stat-value profit">+$156.78</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">持仓数量</span>
            <span className="stat-value">3</span>
          </div>
        </div>
      </div>
      
      <div className="position-table">
        <table>
          <thead>
            <tr>
              <th>币种</th>
              <th>持仓数量</th>
              <th>当前价值</th>
              <th>收益率</th>
              <th>方向</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(position => (
              <tr key={position.id}>
                <td>
                  <div className="coin-info">
                    <span className="coin-symbol">{position.symbol}</span>
                  </div>
                </td>
                <td>{position.amount}</td>
                <td>${position.value}</td>
                <td>
                  <span className={`profit-badge ${position.profit.startsWith('+') ? 'profit' : 'loss'}`}>
                    {position.profit}
                  </span>
                </td>
                <td>
                  <span className={`direction-badge ${position.status}`}>
                    {position.status === 'long' ? '📈 做多' : '📉 做空'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-outline">📊 详情</button>
                    <button className="btn btn-sm btn-danger">平仓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWalletManagement = () => (
    <div className="wallet-management">
      <div className="section-header">
        <h2>💼 我的钱包</h2>
        <button 
          className="btn btn-primary"
          onClick={() => handleWalletAction('add')}
        >
          ➕ 导入钱包
        </button>
      </div>
      
      <div className="wallet-grid">
        {wallets.map(wallet => (
          <div key={wallet.id} className="wallet-card">
            <div className="wallet-header">
              <h3>{wallet.name}</h3>
              <div className="wallet-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleWalletAction('edit', wallet)}
                >
                  ✏️ 编辑
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleWalletAction('delete', wallet)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
            <div className="wallet-info">
              <div className="info-item">
                <span className="label">地址:</span>
                <span className="value address">{wallet.address}</span>
              </div>
              <div className="info-item">
                <span className="label">余额:</span>
                <span className="value balance">{wallet.balance} {wallet.currency}</span>
              </div>
            </div>
            <div className="wallet-actions-bottom">
              <button className="btn btn-sm btn-outline">🔑 导出私钥</button>
              <button className="btn btn-sm btn-outline">🔄 刷新余额</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTradeOverview = () => (
    <div className="trade-overview">
      <div className="section-header">
        <h2>📋 交易总览</h2>
        <div className="trade-stats">
          <div className="stat-item">
            <span className="stat-label">今日交易</span>
            <span className="stat-value">12</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">成功率</span>
            <span className="stat-value">85%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总手续费</span>
            <span className="stat-value">$23.45</span>
          </div>
        </div>
      </div>
      
      <div className="trade-table">
        <table>
          <thead>
            <tr>
              <th>币种</th>
              <th>类型</th>
              <th>数量</th>
              <th>价格</th>
              <th>时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id}>
                <td>
                  <div className="coin-info">
                    <span className="coin-symbol">{trade.symbol}</span>
                  </div>
                </td>
                <td>
                  <span className={`trade-type ${trade.type}`}>
                    {trade.type === 'buy' ? '📈 买入' : '📉 卖出'}
                  </span>
                </td>
                <td>{trade.amount}</td>
                <td>${trade.price}</td>
                <td>{trade.time}</td>
                <td>
                  <span className={`status-badge ${trade.status}`}>
                    {trade.status === 'completed' ? '✅ 已完成' : '⏳ 处理中'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWalletModal = () => {
    if (!showWalletModal) return null;

    const modalTitle = {
      add: '导入钱包',
      edit: '编辑钱包',
      delete: '删除钱包',
      info: '钱包信息'
    }[walletModalType];

    return (
      <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{modalTitle}</h3>
            <button 
              className="modal-close"
              onClick={() => setShowWalletModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            {walletModalType === 'add' && (
              <div className="form-group">
                <label>钱包名称</label>
                <input type="text" placeholder="输入钱包名称" />
                <label>私钥</label>
                <textarea placeholder="输入私钥（请确保安全）" rows="3"></textarea>
                <div className="form-actions">
                  <button className="btn btn-primary">导入</button>
                  <button className="btn btn-outline" onClick={() => setShowWalletModal(false)}>取消</button>
                </div>
              </div>
            )}
            {walletModalType === 'edit' && selectedWallet && (
              <div className="form-group">
                <label>钱包名称</label>
                <input type="text" defaultValue={selectedWallet.name} />
                <div className="form-actions">
                  <button className="btn btn-primary">保存</button>
                  <button className="btn btn-outline" onClick={() => setShowWalletModal(false)}>取消</button>
                </div>
              </div>
            )}
            {walletModalType === 'delete' && selectedWallet && (
              <div className="form-group">
                <p>确定要删除钱包 "{selectedWallet.name}" 吗？</p>
                <p className="warning">⚠️ 此操作不可撤销！</p>
                <div className="form-actions">
                  <button className="btn btn-danger">确认删除</button>
                  <button className="btn btn-outline" onClick={() => setShowWalletModal(false)}>取消</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          🚀 MemeCoin 管理系统
          <span className="version-badge">v3.0</span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'strategy' ? 'active' : ''}`}
            onClick={() => setActiveTab('strategy')}
          >
            📊 策略管理
          </button>
          <button
            className={`nav-tab ${activeTab === 'position' ? 'active' : ''}`}
            onClick={() => setActiveTab('position')}
          >
            📈 持仓总览
          </button>
          <button
            className={`nav-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            💼 我的钱包
          </button>
          <button
            className={`nav-tab ${activeTab === 'trade' ? 'active' : ''}`}
            onClick={() => setActiveTab('trade')}
          >
            📋 交易总览
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'strategy' && renderStrategyManagement()}
        {activeTab === 'position' && renderPositionOverview()}
        {activeTab === 'wallet' && renderWalletManagement()}
        {activeTab === 'trade' && renderTradeOverview()}
      </main>

      {renderWalletModal()}
    </div>
  );
}

export default App;
