import React, { useState, useEffect } from 'react';
import './BluechipRank.css';

const BluechipRank = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [sortBy, setSortBy] = useState('swaps');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBluechipTokens();
  }, []);

  const fetchBluechipTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/bluechip/tokens?limit=50');
      const data = await response.json();
      
      if (data.success && data.data.rank) {
        setTokens(data.data.rank);
      } else {
        setError('Failed to fetch tokens');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // 处理数字字符串
    if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
      aVal = parseFloat(aVal);
    }
    if (typeof bVal === 'string' && !isNaN(parseFloat(bVal))) {
      bVal = parseFloat(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatNumber = (num) => {
    if (typeof num === 'string') {
      num = parseFloat(num);
    }
    if (isNaN(num)) return '0';
    
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0';
    if (num < 0.0001) return num.toExponential(2);
    return num.toFixed(6);
  };

  const getPriceChangeColor = (change) => {
    const num = parseFloat(change);
    if (isNaN(num)) return 'neutral';
    return num >= 0 ? 'positive' : 'negative';
  };

  const getSecurityScore = (securityInfo) => {
    let score = 0;
    if (securityInfo.renounced_freeze_account) score += 25;
    if (securityInfo.renounced_mint) score += 25;
    if (securityInfo.burn_status === 'burn') score += 25;
    if (parseFloat(securityInfo.top_10_holder_rate) < 0.5) score += 25;
    return score;
  };

  const getSecurityColor = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="bluechip-rank">
      <div className="section-header">
        <h2>🏆 蓝筹代币排名</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={fetchBluechipTokens}
            disabled={loading}
          >
            {loading ? '🔄 加载中...' : '🔄 刷新'}
          </button>
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="swaps-desc">交易量 ↓</option>
            <option value="swaps-asc">交易量 ↑</option>
            <option value="volume-desc">成交量 ↓</option>
            <option value="volume-asc">成交量 ↑</option>
            <option value="holder_count-desc">持有者 ↓</option>
            <option value="holder_count-asc">持有者 ↑</option>
            <option value="market_cap-desc">市值 ↓</option>
            <option value="market_cap-asc">市值 ↑</option>
            <option value="price_change_percent_1h-desc">1h涨幅 ↓</option>
            <option value="price_change_percent_1h-asc">1h涨幅 ↑</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="tokens-grid">
        {sortedTokens.map((token, index) => (
          <div key={token.address} className="token-card">
            <div className="token-header">
              <div className="token-rank">#{index + 1}</div>
              <img 
                src={token.logo} 
                alt={token.symbol}
                className="token-logo"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/40x40/666/fff?text=?';
                }}
              />
              <div className="token-info">
                <div className="token-symbol">{token.symbol}</div>
                <div className="token-address">
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </div>
              </div>
              <div className="token-actions">
                <button 
                  className="btn-icon"
                  onClick={() => setSelectedToken(selectedToken === token.address ? null : token.address)}
                >
                  {selectedToken === token.address ? '📖' : '📖'}
                </button>
              </div>
            </div>

            <div className="token-stats">
              <div className="stat-row">
                <span className="stat-label">价格:</span>
                <span className="stat-value">${formatPrice(token.price)}</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">1h变化:</span>
                <span className={`stat-value ${getPriceChangeColor(token.price_change_percent_1h)}`}>
                  {parseFloat(token.price_change_percent_1h).toFixed(2)}%
                </span>
              </div>

              <div className="stat-row">
                <span className="stat-label">市值:</span>
                <span className="stat-value">${formatNumber(token.market_cap)}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">流动性:</span>
                <span className="stat-value">${formatNumber(token.liquidity)}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">持有者:</span>
                <span className="stat-value">{formatNumber(token.holder_count)}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">交易量:</span>
                <span className="stat-value">{formatNumber(token.swaps)}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">成交量:</span>
                <span className="stat-value">${formatNumber(token.volume)}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">安全评分:</span>
                <span className={`stat-value security-${getSecurityColor(getSecurityScore(token.security_info))}`}>
                  {getSecurityScore(token.security_info)}%
                </span>
              </div>
            </div>

            {selectedToken === token.address && (
              <div className="token-details">
                <div className="detail-section">
                  <h4>🔗 链接</h4>
                  <div className="links-grid">
                    {token.token_links.website && (
                      <a href={token.token_links.website} target="_blank" rel="noopener noreferrer" className="link-btn">
                        🌐 官网
                      </a>
                    )}
                    {token.token_links.twitter_username && (
                      <a href={`https://twitter.com/${token.token_links.twitter_username}`} target="_blank" rel="noopener noreferrer" className="link-btn">
                        🐦 Twitter
                      </a>
                    )}
                    {token.token_links.telegram && (
                      <a href={token.token_links.telegram} target="_blank" rel="noopener noreferrer" className="link-btn">
                        💬 Telegram
                      </a>
                    )}
                    <a href={token.token_links.gmgn} target="_blank" rel="noopener noreferrer" className="link-btn">
                      📊 GMGN
                    </a>
                    <a href={token.token_links.geckoterminal} target="_blank" rel="noopener noreferrer" className="link-btn">
                      📈 GeckoTerminal
                    </a>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>🔒 安全信息</h4>
                  <div className="security-grid">
                    <div className="security-item">
                      <span className="security-label">放弃冻结权限:</span>
                      <span className={`security-value ${token.security_info.renounced_freeze_account ? 'yes' : 'no'}`}>
                        {token.security_info.renounced_freeze_account ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">放弃铸造权限:</span>
                      <span className={`security-value ${token.security_info.renounced_mint ? 'yes' : 'no'}`}>
                        {token.security_info.renounced_mint ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">销毁状态:</span>
                      <span className="security-value">
                        {token.security_info.burn_status === 'burn' ? '✅ 已销毁' : '❌ 未销毁'}
                      </span>
                    </div>
                    <div className="security-item">
                      <span className="security-label">前10持有者比例:</span>
                      <span className="security-value">
                        {(parseFloat(token.security_info.top_10_holder_rate) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {token.token_links.description && (
                  <div className="detail-section">
                    <h4>📝 描述</h4>
                    <p className="token-description">{token.token_links.description}</p>
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