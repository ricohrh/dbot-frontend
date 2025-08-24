import React from 'react';

const StrategyCard = ({ strategy }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '运行中': return 'success';
      case '暂停': return 'warning';
      case '停止': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="strategy-card">
      <div className="strategy-header">
        <div className="strategy-info">
          <h3>{strategy.name}</h3>
          <span className={`strategy-type ${strategy.type.toLowerCase()}`}>
            {strategy.type}
          </span>
        </div>
        <span className={`status-badge ${getStatusColor(strategy.status)}`}>
          {strategy.status}
        </span>
      </div>

      <div className="strategy-stats">
        <div className="stat-item">
          <span className="label">收益</span>
          <span className={`value ${strategy.profit.startsWith('+') ? 'positive' : 'negative'}`}>
            {strategy.profit}
          </span>
        </div>
        <div className="stat-item">
          <span className="label">资金</span>
          <span className="value">{strategy.balance}</span>
        </div>
      </div>

      <div className="strategy-coins">
        <span className="label">交易币种:</span>
        <div className="coin-tags">
          {strategy.coins.map(coin => (
            <span key={coin} className="coin-tag">{coin}</span>
          ))}
        </div>
      </div>

      <p className="strategy-description">{strategy.description}</p>

      <div className="strategy-actions">
        <button className="btn btn-sm btn-outline">
          ⚙️ 设置
        </button>
        <button className="btn btn-sm btn-outline">
          📊 详情
        </button>
        {strategy.status === '运行中' ? (
          <button className="btn btn-sm btn-warning">
            ⏸️ 暂停
          </button>
        ) : (
          <button className="btn btn-sm btn-success">
            ▶️ 启动
          </button>
        )}
      </div>
    </div>
  );
};

export default StrategyCard; 