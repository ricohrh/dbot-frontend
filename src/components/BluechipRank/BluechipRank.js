import React, { useState, useEffect } from 'react';
import './BluechipRank.css';

const BluechipRank = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('swaps');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedToken, setExpandedToken] = useState(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bluechip/tokens?limit=50');
      if (!response.ok) {
        throw new Error('Network error: Failed to fetch');
      }
      const data = await response.json();
      setTokens(data.data.rank || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return 'N/A';
    
    if (numValue >= 1e9) return (numValue / 1e9).toFixed(2) + 'B';
    if (numValue >= 1e6) return (numValue / 1e6).toFixed(2) + 'M';
    if (numValue >= 1e3) return (numValue / 1e3).toFixed(2) + 'K';
    return numValue.toFixed(2);
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const numPrice = parseFloat(price);
    if (numPrice < 0.0001) return `$${numPrice.toExponential(2)}`;
    if (numPrice < 0.01) return `$${numPrice.toFixed(6)}`;
    if (numPrice < 1) return `$${numPrice.toFixed(4)}`;
    return `$${numPrice.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    const numValue = parseFloat(value);
    return `${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const calculateSecurityScore = (securityInfo) => {
    if (!securityInfo) return 0;
    let score = 0;
    
    // 燃烧状态
    if (securityInfo.burn_status === 'burn') score += 20;
    if (securityInfo.renounced_freeze_account === 1) score += 20;
    if (securityInfo.renounced_mint === 1) score += 20;
    
    // 开发者代币燃烧
    if (parseFloat(securityInfo.dev_token_burn_ratio) > 0) score += 10;
    
    // 前10持有者比例
    const top10Rate = parseFloat(securityInfo.top_10_holder_rate);
    if (top10Rate < 0.2) score += 15;
    else if (top10Rate < 0.3) score += 10;
    else if (top10Rate < 0.5) score += 5;
    
    // 燃烧比例
    if (parseFloat(securityInfo.burn_ratio) > 0.5) score += 15;
    
    return Math.min(score, 100);
  };

  const getPriceChangeColor = (change) => {
    if (!change) return 'neutral';
    const numChange = parseFloat(change);
    return numChange > 0 ? 'positive' : numChange < 0 ? 'negative' : 'neutral';
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const aValue = parseFloat(a[sortBy] || 0);
    const bValue = parseFloat(b[sortBy] || 0);
    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const toggleExpanded = (address) => {
    setExpandedToken(expandedToken === address ? null : address);
  };

  if (loading) {
    return (
      <div className="bluechip-rank">
        <div className="loading">🔄 加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bluechip-rank">
        <div className="error">❌ {error}</div>
        <button onClick={fetchTokens} className="retry-btn">重试</button>
      </div>
    );
  }

  return (
    <div className="bluechip-rank">
      <div className="header">
        <h2>🏆 蓝筹代币排名</h2>
        <div className="controls">
          <button onClick={fetchTokens} className="refresh-btn">🔄 刷新</button>
          <div className="sort-controls">
            <span>排序: </span>
            <button 
              className={sortBy === 'swaps' ? 'active' : ''} 
              onClick={() => handleSort('swaps')}
            >
              交易量 {sortBy === 'swaps' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={sortBy === 'volume' ? 'active' : ''} 
              onClick={() => handleSort('volume')}
            >
              成交量 {sortBy === 'volume' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={sortBy === 'holder_count' ? 'active' : ''} 
              onClick={() => handleSort('holder_count')}
            >
              持有者 {sortBy === 'holder_count' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={sortBy === 'market_cap' ? 'active' : ''} 
              onClick={() => handleSort('market_cap')}
            >
              市值 {sortBy === 'market_cap' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={sortBy === 'price_change_percent_1h' ? 'active' : ''} 
              onClick={() => handleSort('price_change_percent_1h')}
            >
              1h变化 {sortBy === 'price_change_percent_1h' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      <div className="tokens-grid">
        {sortedTokens.map((token, index) => (
          <div key={token.address} className="token-card">
            <div className="token-header">
              <div className="rank">#{index + 1}</div>
              <div className="token-info">
                <div className="symbol">{token.symbol}</div>
                <div className="address">{token.address.slice(0, 8)}...{token.address.slice(-6)}</div>
              </div>
              <div className="price-info">
                <div className="price">{formatPrice(token.price)}</div>
                <div className={`price-change ${getPriceChangeColor(token.price_change_percent_1h)}`}>
                  {formatPercentage(token.price_change_percent_1h)}
                </div>
              </div>
            </div>

            <div className="token-stats">
              <div className="stat-row">
                <span className="label">市值:</span>
                <span className="value">${formatNumber(token.market_cap)}</span>
              </div>
              <div className="stat-row">
                <span className="label">流动性:</span>
                <span className="value">${formatNumber(token.liquidity)}</span>
              </div>
              <div className="stat-row">
                <span className="label">持有者:</span>
                <span className="value">{formatNumber(token.holder_count)}</span>
              </div>
              <div className="stat-row">
                <span className="label">交易量:</span>
                <span className="value">{formatNumber(token.swaps)}</span>
              </div>
              <div className="stat-row">
                <span className="label">成交量:</span>
                <span className="value">${formatNumber(token.volume)}</span>
              </div>
              <div className="stat-row">
                <span className="label">蓝筹率:</span>
                <span className="value">{(parseFloat(token.bluechip_rate) * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="security-section">
              <div className="security-score">
                <span className="label">安全评分:</span>
                <span className={`score score-${calculateSecurityScore(token.security_info)}`}>
                  {calculateSecurityScore(token.security_info)}%
                </span>
              </div>
              <div className="security-details">
                <span className={`badge ${token.security_info?.burn_status === 'burn' ? 'good' : 'neutral'}`}>
                  🔥 已燃烧
                </span>
                <span className={`badge ${token.security_info?.renounced_freeze_account === 1 ? 'good' : 'bad'}`}>
                  🔒 冻结已放弃
                </span>
                <span className={`badge ${token.security_info?.renounced_mint === 1 ? 'good' : 'bad'}`}>
                  🪙 铸造已放弃
                </span>
              </div>
            </div>

            <div className="token-actions">
              <button 
                className="expand-btn"
                onClick={() => toggleExpanded(token.address)}
              >
                {expandedToken === token.address ? '收起详情' : '查看详情'}
              </button>
            </div>

            {expandedToken === token.address && (
              <div className="token-details">
                <div className="details-section">
                  <h4>📊 详细数据</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">创建者:</span>
                      <span className="value">{token.creator?.slice(0, 8)}...{token.creator?.slice(-6)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">创建时间:</span>
                      <span className="value">{new Date(token.open_timestamp * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">启动平台:</span>
                      <span className="value">{token.launchpad_platform || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">CTO标志:</span>
                      <span className="value">{token.cto_flag === 1 ? '是' : '否'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">5分钟变化:</span>
                      <span className={`value ${getPriceChangeColor(token.price_change_percent_5m)}`}>
                        {formatPercentage(token.price_change_percent_5m)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">1分钟变化:</span>
                      <span className={`value ${getPriceChangeColor(token.price_change_percent_1m)}`}>
                        {formatPercentage(token.price_change_percent_1m)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">买入次数:</span>
                      <span className="value">{formatNumber(token.buys)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">卖出次数:</span>
                      <span className="value">{formatNumber(token.sells)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">前10持有率:</span>
                      <span className="value">{(parseFloat(token.security_info?.top_10_holder_rate || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">洗盘交易:</span>
                      <span className="value">{token.is_wash_trading ? '是' : '否'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>🔗 链接</h4>
                  <div className="links-grid">
                    {token.token_links?.website && (
                      <a href={token.token_links.website} target="_blank" rel="noopener noreferrer" className="link-btn">
                        🌐 官网
                      </a>
                    )}
                    {token.token_links?.telegram && (
                      <a href={token.token_links.telegram} target="_blank" rel="noopener noreferrer" className="link-btn">
                        📱 Telegram
                      </a>
                    )}
                    {token.token_links?.twitter_username && (
                      <a href={`https://twitter.com/${token.token_links.twitter_username}`} target="_blank" rel="noopener noreferrer" className="link-btn">
                        🐦 Twitter
                      </a>
                    )}
                    {token.token_links?.gmgn && (
                      <a href={token.token_links.gmgn} target="_blank" rel="noopener noreferrer" className="link-btn">
                        📈 GMGN
                      </a>
                    )}
                    {token.token_links?.geckoterminal && (
                      <a href={token.token_links.geckoterminal} target="_blank" rel="noopener noreferrer" className="link-btn">
                        📊 GeckoTerminal
                      </a>
                    )}
                  </div>
                </div>

                {token.token_links?.description && (
                  <div className="details-section">
                    <h4>📝 描述</h4>
                    <p className="description">{token.token_links.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BluechipRank; 