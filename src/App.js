import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey, setApiKey] = useState('zfes85rvveqscoljgyf372biaddecext');
  const [backendUrl, setBackendUrl] = useState('http://104.129.23.155:8888');

  const [tokens, setTokens] = useState([
    { name: 'PEPE', symbol: 'PEPE', price: '$0.00000123', change: '+15.2%', volume: '$2.5M' },
    { name: 'DOGE', symbol: 'DOGE', price: '$0.085', change: '+8.7%', volume: '$1.8M' },
    { name: 'SHIB', symbol: 'SHIB', price: '$0.00001234', change: '-2.1%', volume: '$950K' }
  ]);

  const [orders, setOrders] = useState([
    { type: 'swap', token: 'PEPE', amount: '1000000', status: 'completed', time: '2024-01-15 14:30:25' },
    { type: 'snipe', token: 'MOON', amount: '500000', status: 'pending', time: '2024-01-15 14:25:10' }
  ]);

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🚀 DBot API 管理系统</h2>
        <button className="btn btn-success update-btn">
          🔄 最新更新: 2025-08-23 17:40
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总代币数</h3>
          <p>1,250</p>
        </div>
        <div className="stat-card">
          <h3>活跃钱包</h3>
          <p>8</p>
        </div>
        <div className="stat-card">
          <h3>API调用次数</h3>
          <p>15,420</p>
        </div>
        <div className="stat-card">
          <h3>成功率</h3>
          <p>98.5%</p>
        </div>
      </div>

      <div className="section">
        <h3>热门代币</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>代币名称</th>
                <th>价格</th>
                <th>24h变化</th>
                <th>交易量</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={index}>
                  <td><strong>{token.name}</strong> <span className="badge">{token.symbol}</span></td>
                  <td>{token.price}</td>
                  <td className={token.change.startsWith('+') ? 'positive' : 'negative'}>{token.change}</td>
                  <td>{token.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDataAPI = () => (
    <div className="data-api">
      <h2>📊 数据API</h2>
      
      <div className="search-section">
        <input 
          type="text" 
          placeholder="搜索代币..." 
          className="search-input"
        />
        <select className="filter-select">
          <option value="hot">热门代币</option>
          <option value="new">最新代币</option>
          <option value="meme">Meme代币</option>
        </select>
        <button className="btn btn-primary">搜索</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>代币名称</th>
              <th>价格</th>
              <th>24h变化</th>
              <th>交易量</th>
              <th>市值</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => (
              <tr key={index}>
                <td><strong>{token.name}</strong> <span className="badge">{token.symbol}</span></td>
                <td>{token.price}</td>
                <td className={token.change.startsWith('+') ? 'positive' : 'negative'}>{token.change}</td>
                <td>{token.volume}</td>
                <td>$45.2M</td>
                <td>
                  <button className="btn btn-sm">查看详情</button>
                  <button className="btn btn-sm btn-secondary">交易</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTradingAPI = () => (
    <div className="trading-api">
      <h2>💼 交易API</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>活跃钱包</h3>
          <p>8</p>
        </div>
        <div className="stat-card">
          <h3>今日交易</h3>
          <p>15</p>
        </div>
        <div className="stat-card">
          <h3>成功率</h3>
          <p>98%</p>
        </div>
        <div className="stat-card">
          <h3>总资产</h3>
          <p>$12.5K</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>交易订单</h3>
          <button className="btn btn-primary">创建订单</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>订单类型</th>
                <th>代币</th>
                <th>数量</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td><span className={`badge ${order.type === 'swap' ? 'badge-primary' : 'badge-danger'}`}>
                    {order.type === 'swap' ? '快速买卖' : '自动狙击'}
                  </span></td>
                  <td>{order.token}</td>
                  <td>{order.amount}</td>
                  <td><span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {order.status === 'completed' ? '已完成' : '进行中'}
                  </span></td>
                  <td>{order.time}</td>
                  <td>
                    <button className="btn btn-sm">查看详情</button>
                    {order.status === 'pending' && <button className="btn btn-sm btn-danger">取消</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings">
      <h2>⚙️ 系统设置</h2>
      
      <div className="settings-grid">
        <div className="setting-card">
          <h3>API配置</h3>
          <div className="form-group">
            <label>API密钥</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>后端地址</label>
            <input 
              type="text" 
              value={backendUrl} 
              onChange={(e) => setBackendUrl(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>系统设置</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> 自动刷新
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> 桌面通知
            </label>
          </div>
          <div className="form-group">
            <label>主题模式</label>
            <select className="form-control">
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
        </div>
      </div>
      
      <button className="btn btn-primary">保存设置</button>
    </div>
  );

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          🚀 DBot API
          <span className="version-badge">v2.1</span>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            仪表板
          </button>
          <button 
            className={`nav-tab ${activeTab === 'data-api' ? 'active' : ''}`}
            onClick={() => setActiveTab('data-api')}
          >
            数据API
          </button>
          <button 
            className={`nav-tab ${activeTab === 'trading-api' ? 'active' : ''}`}
            onClick={() => setActiveTab('trading-api')}
          >
            交易API
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            设置
          </button>
        </div>
        <div className="nav-status">
          <span className="status-indicator">● 后端在线</span>
          <span className="status-indicator">● API正常</span>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'data-api' && renderDataAPI()}
        {activeTab === 'trading-api' && renderTradingAPI()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
}

export default App;
