import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('strategy');
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalType, setWalletModalType] = useState('add');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // API配置
  const API_BASE_URL = 'https://api-bot-v1.dbotx.com';
  const API_KEY = 'uber1py2znkw219bo168jh3xm6rnc903';

  // 表单状态
  const [walletForm, setWalletForm] = useState({
    name: '',
    privateKey: '',
    type: 'solana'
  });

  // 获取钱包列表
  const fetchWallets = async () => {
    try {
      setLoading(true);
      
      // 直接访问API，不使用代理
      const url = `${API_BASE_URL}/account/wallets`;
      
      console.log('尝试获取钱包列表:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('获取钱包列表响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的钱包数据:', data);
        console.log('钱包列表详情:', JSON.stringify(data, null, 2));
        
        // 检查不同的数据结构
        let walletList = [];
        if (data.data) {
          walletList = data.data;
        } else if (data.wallets) {
          walletList = data.wallets;
        } else if (Array.isArray(data)) {
          walletList = data;
        } else if (data.result) {
          walletList = data.result;
        }
        
        console.log('解析后的钱包列表:', walletList);
        setWallets(walletList);
      } else {
        console.error('获取钱包列表失败:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('错误详情:', errorData);
        setMessage('获取钱包列表失败');
      }
    } catch (error) {
      console.error('获取钱包列表错误:', error);
      setMessage('网络错误，请检查连接');
    } finally {
      setLoading(false);
    }
  };

  // 导入钱包
  const importWallet = async () => {
    if (!walletForm.name || !walletForm.privateKey) {
      setMessage('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setMessage('正在导入钱包...');
      
      const requestBody = {
        type: walletForm.type,
        name: walletForm.name,
        privateKey: walletForm.privateKey
      };
      
      // 根据API文档，可能需要不同的字段名
      console.log('原始请求体:', requestBody);
      
      console.log('发送导入请求:', requestBody);
      
      // 直接访问API，不使用代理
      const url = `${API_BASE_URL}/account/wallet`;
      
      console.log('导入请求URL:', url);
      console.log('请求头:', {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('导入响应状态:', response.status);
      console.log('响应头:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('导入成功:', data);
        setMessage('钱包导入成功！');
        setShowWalletModal(false);
        setWalletForm({ name: '', privateKey: '', type: 'solana' });
        // 延迟一下再刷新列表，确保服务器处理完成
        setTimeout(() => {
          fetchWallets();
        }, 1000);
              } else {
          let errorMessage = `导入失败 (${response.status})`;
          try {
            const errorData = await response.json();
            console.error('导入失败详情:', errorData);
            
            // 处理特定的错误类型
            if (errorData.res === 'Duplicate Error') {
              errorMessage = '❌ 钱包已存在！请使用不同的钱包名称或私钥。';
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.res) {
              errorMessage = errorData.res;
            }
          } catch (e) {
            console.error('无法解析错误响应:', e);
          }
          setMessage(errorMessage);
        }
    } catch (error) {
      console.error('导入钱包错误:', error);
      setMessage(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除钱包
  const deleteWallet = async (walletId) => {
    try {
      setLoading(true);
      
      // 尝试使用支持DELETE的代理
      const proxyUrl = 'https://thingproxy.freeboard.io/fetch/';
      const targetUrl = `${API_BASE_URL}/account/wallet/${walletId}`;
      const url = `${proxyUrl}${targetUrl}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('钱包删除成功！');
        setShowWalletModal(false);
        fetchWallets();
      } else {
        const data = await response.json();
        setMessage(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除钱包错误:', error);
      setMessage('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取钱包列表
  useEffect(() => {
    fetchWallets();
  }, []);

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
    setMessage('');
  };

  const handleFormChange = (field, value) => {
    setWalletForm(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => handleWalletAction('add')}
            disabled={loading}
          >
            ➕ 导入钱包
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              console.log('手动刷新钱包列表...');
              fetchWallets();
            }}
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
            <div key={wallet.id} className="wallet-card">
              <div className="wallet-header">
                <h3>{wallet.name}</h3>
                <span className="wallet-type">{wallet.type || 'solana'}</span>
              </div>
              <div className="wallet-info">
                <div className="info-item">
                  <span className="label">地址:</span>
                  <span className="value address">
                    {wallet.address ? `${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 8)}` : '未知'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">余额:</span>
                  <span className="value balance">
                    {wallet.balance ? `${wallet.balance} ${wallet.currency || 'SOL'}` : '加载中...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">状态:</span>
                  <span className="value status">
                    <span className="status-badge active">🟢 正常</span>
                  </span>
                </div>
              </div>
              <div className="wallet-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleWalletAction('info', wallet)}
                >
                  📊 详情
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleWalletAction('delete', wallet)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))
        )}
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
                <div className="form-row">
                  <div className="form-field">
                    <label>钱包类型</label>
                    <select 
                      value={walletForm.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                    >
                      <option value="solana">Solana</option>
                      <option value="evm">EVM</option>
                      <option value="tron">Tron</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>钱包名称 *</label>
                    <input 
                      type="text" 
                      placeholder="输入钱包名称"
                      value={walletForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>私钥 *</label>
                  <textarea 
                    placeholder="输入私钥（请确保安全）" 
                    rows="4"
                    value={walletForm.privateKey}
                    onChange={(e) => handleFormChange('privateKey', e.target.value)}
                  ></textarea>
                  <div className="form-help">
                    <p>⚠️ 安全提示：</p>
                    <ul>
                      <li>请确保在安全的环境下输入私钥</li>
                      <li>私钥将加密存储在服务器中</li>
                      <li>请勿在公共场所输入私钥</li>
                    </ul>
                  </div>
                </div>
                {message && (
                  <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                <div className="form-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={importWallet}
                    disabled={loading || !walletForm.name || !walletForm.privateKey}
                  >
                    {loading ? '导入中...' : '导入钱包'}
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowWalletModal(false)}
                    disabled={loading}
                  >
                    取消
                  </button>
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
          <span className="version-badge">v3.8</span>
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
