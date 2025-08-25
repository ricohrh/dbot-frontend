import React, { useState } from 'react';
import WalletManager from './components/WalletManager/WalletManager';
import StrategyManager from './components/StrategyManager/StrategyManager';
import MarketData from './components/MarketData/MarketData';
import PositionOverview from './components/PositionOverview/PositionOverview';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('strategy');

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy':
        return <StrategyManager />;
      case 'position':
        return <PositionOverview />;
      case 'wallet':
        return <WalletManager />;
      case 'trade':
        return <TradeOverview />;
      case 'market':
        return <MarketData />;
      default:
        return <StrategyManager />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          🚀 MemeCoin 管理系统
          <span className="version-badge">v4.4</span>
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
            💰 交易总览
          </button>
          <button
            className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            📈 实时行情
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};



const TradeOverview = () => (
  <div className="trade-overview">
    <div className="section-header">
      <h2>💰 交易总览</h2>
      <div className="header-actions">
        <button className="btn btn-primary">📊 分析</button>
        <button className="btn btn-outline">📄 导出</button>
      </div>
    </div>

    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>总交易次数</h3>
          <p className="stat-value">156</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <h3>总交易额</h3>
          <p className="stat-value">$45,230</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>胜率</h3>
          <p className="stat-value positive">68.5%</p>
        </div>
      </div>
    </div>

    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>币种</th>
            <th>类型</th>
            <th>价格</th>
            <th>数量</th>
            <th>金额</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2024-01-15 14:30</td>
            <td>PEPE</td>
            <td className="positive">买入</td>
            <td>$0.000010</td>
            <td>500,000</td>
            <td>$5.00</td>
            <td className="positive">成功</td>
          </tr>
          <tr>
            <td>2024-01-15 15:45</td>
            <td>DOGE</td>
            <td className="negative">卖出</td>
            <td>$0.087</td>
            <td>1,000</td>
            <td>$87.00</td>
            <td className="positive">成功</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default App;
