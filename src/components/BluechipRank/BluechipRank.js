import React, { useState, useEffect, useRef } from 'react';
import './BluechipRank.css';
import { apiRequest } from '../../services/api';

const BluechipRank = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('swaps');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedToken, setExpandedToken] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchTokens();
    
    // 设置自动刷新
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchTokens(true); // 静默刷新
      }, 30000); // 每30秒刷新一次
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchTokens = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await apiRequest('/bluechip/tokens?limit=50');
      const rank = Array.isArray(data?.data?.rank)
        ? data.data.rank
        : (Array.isArray(data?.data) ? data.data : []);
      console.log('获取到的代币数据(前3条):', rank.slice(0, 3));
      setTokens(rank);
      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      // 开启自动刷新
      intervalRef.current = setInterval(() => {
        fetchTokens(true);
      }, 30000);
    } else {
      // 关闭自动刷新
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    const n = parseFloat(num);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const p = parseFloat(price);
    if (p < 0.0001) return `$${p.toExponential(2)}`;
    if (p < 0.01) return `$${p.toFixed(6)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(2)}`;
  };

  const calculateSecurityScore = (token) => {
    let score = 0;
    const security = token.security_info || {};
    
    // 燃烧状态 (20分)
    if (security.burn_status === 'burn') score += 20;
    
    // 冻结已放弃 (20分)
    if (security.renounced_freeze_account === 1) score += 20;
    
    // 铸造已放弃 (20分)
    if (security.renounced_mint === 1) score += 20;
    
    // 前10持有者比例 (20分) - 越低越好
    const top10Rate = parseFloat(security.top_10_holder_rate || 1);
    if (top10Rate < 0.3) score += 20;
    else if (top10Rate < 0.5) score += 15;
    else if (top10Rate < 0.7) score += 10;
    
    // 持有者数量 (20分)
    const holderCount = token.holder_count || 0;
    if (holderCount > 5000) score += 20;
    else if (holderCount > 2000) score += 15;
    else if (holderCount > 1000) score += 10;
    
    return Math.min(score, 100);
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const aVal = parseFloat(a[sortBy] || 0);
    const bVal = parseFloat(b[sortBy] || 0);
    return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleExpanded = (tokenAddress) => {
    setExpandedToken(expandedToken === tokenAddress ? null : tokenAddress);
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
        <button onClick={() => fetchTokens()} className="retry-btn">重试</button>
      </div>
    );
  }

  return (
    <div className="bluechip-rank">
      <div className="header">
        <h2>🏆 蓝筹代币排名</h2>
        <div className="controls">
          <button className="refresh-btn" onClick={() => fetchTokens()}>
            🔄 刷新
          </button>
          <button 
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={toggleAutoRefresh}
          >
            {autoRefresh ? '⏸️ 暂停自动刷新' : '▶️ 开启自动刷新'}
          </button>
          <div className="status-info">
            {lastUpdate && (
              <span className="last-update">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {autoRefresh && (
              <span className="refresh-indicator">
                🔄 自动刷新中 ({refreshCount}次)
              </span>
            )}
          </div>
          <div className="sort-controls">
            <span>排序:</span>
            <button 
              className={sortBy === 'swaps' ? 'active' : ''} 
              onClick={() => handleSort('swaps')}
            >
              交易量
            </button>
            <button 
              className={sortBy === 'volume' ? 'active' : ''} 
              onClick={() => handleSort('volume')}
            >
              成交量
            </button>
            <button 
              className={sortBy === 'holder_count' ? 'active' : ''} 
              onClick={() => handleSort('holder_count')}
            >
              持有者
            </button>
            <button 
              className={sortBy === 'market_cap' ? 'active' : ''} 
              onClick={() => handleSort('market_cap')}
            >
              市值
            </button>
            <button 
              className={sortBy === 'price_change_percent_1h' ? 'active' : ''} 
              onClick={() => handleSort('price_change_percent_1h')}
            >
              1h变化
            </button>
          </div>
        </div>
      </div>

      <div className="tokens-grid">
        {sortedTokens.map((token, index) => {
          const securityScore = calculateSecurityScore(token);
          const isExpanded = expandedToken === token.address;
          
          return (
            <div key={token.address} className={`token-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="token-header">
                <div className="rank-badge">#{index + 1}</div>
                <div className="token-info">
                  <div className="token-avatar">
                    <img 
                      src={token.logo || ''} 
                      alt={token.symbol} 
                      onLoad={(e) => {
                        console.log(`✅ 头像加载成功: ${token.symbol}`, token.logo);
                        e.target.style.display = 'block';
                        e.target.nextSibling.style.display = 'none';
                      }}
                      onError={(e) => {
                        console.log(`❌ 头像加载失败: ${token.symbol}`, token.logo);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: token.logo ? 'block' : 'none'
                      }}
                    />
                    <div 
                      className="avatar-fallback" 
                      style={{ 
                        display: token.logo ? 'none' : 'block',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase'
                      }}
                    >
                      {token.symbol?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="token-basic">
                    <h3 className="token-symbol">{token.symbol}</h3>
                    <p className="token-address">{token.address?.slice(0, 8)}...{token.address?.slice(-6)}</p>
                  </div>
                </div>
                <div className="price-info">
                  <div className="price">{formatPrice(token.price)}</div>
                  <div className={`price-change ${parseFloat(token.price_change_percent_1h || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(token.price_change_percent_1h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="token-metrics">
                <div className="metric">
                  <span className="label">市值:</span>
                  <span className="value">${formatNumber(token.market_cap)}</span>
                </div>
                <div className="metric">
                  <span className="label">流动性:</span>
                  <span className="value">${formatNumber(token.liquidity)}</span>
                </div>
                <div className="metric">
                  <span className="label">持有者:</span>
                  <span className="value">{formatNumber(token.holder_count)}</span>
                </div>
                <div className="metric">
                  <span className="label">交易量:</span>
                  <span className="value">{formatNumber(token.swaps)}</span>
                </div>
                <div className="metric">
                  <span className="label">成交量:</span>
                  <span className="value">${formatNumber(token.volume)}</span>
                </div>
                <div className="metric">
                  <span className="label">蓝筹率:</span>
                  <span className="value">{(parseFloat(token.bluechip_rate || 0) * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="security-section">
                <div className="security-score">
                  <span className="label">安全评分:</span>
                  <span 
                    className="score-badge" 
                    style={{ backgroundColor: getSecurityScoreColor(securityScore) }}
                  >
                    {securityScore}%
                  </span>
                </div>
                <div className="security-badges">
                  {(token.security_info?.burn_status === 'burn') && (
                    <span className="security-badge burn">🔥 已燃烧</span>
                  )}
                  {(token.security_info?.renounced_freeze_account === 1) && (
                    <span className="security-badge frozen">🔒 冻结已放弃</span>
                  )}
                  {(token.security_info?.renounced_mint === 1) && (
                    <span className="security-badge mint">🪙 铸造已放弃</span>
                  )}
                </div>
              </div>

              <button 
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleExpanded(token.address)}
              >
                {isExpanded ? '收起详情' : '查看详情'}
              </button>

              {isExpanded && (
                <div className="expanded-details">
                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>📊 技术指标</h4>
                      <div className="detail-item">
                        <span>5分钟变化:</span>
                        <span className={parseFloat(token.price_change_percent_5m || 0) >= 0 ? 'positive' : 'negative'}>
                          {parseFloat(token.price_change_percent_5m || 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>1分钟变化:</span>
                        <span className={parseFloat(token.price_change_percent_1m || 0) >= 0 ? 'positive' : 'negative'}>
                          {parseFloat(token.price_change_percent_1m || 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>买入次数:</span>
                        <span>{formatNumber(token.buys)}</span>
                      </div>
                      <div className="detail-item">
                        <span>卖出次数:</span>
                        <span>{formatNumber(token.sells)}</span>
                      </div>
                      <div className="detail-item">
                        <span>智能买入24h:</span>
                        <span>{formatNumber(token.smart_buys_24h)}</span>
                      </div>
                      <div className="detail-item">
                        <span>智能卖出24h:</span>
                        <span>{formatNumber(token.smart_sells_24h)}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>🔒 安全信息</h4>
                      <div className="detail-item">
                        <span>燃烧比例:</span>
                        <span>{(parseFloat(token.security_info?.burn_ratio || 0) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="detail-item">
                        <span>前10持有者比例:</span>
                        <span>{(parseFloat(token.security_info?.top_10_holder_rate || 0) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="detail-item">
                        <span>开发者代币燃烧:</span>
                        <span>{formatNumber(token.security_info?.dev_token_burn_amount)}</span>
                      </div>
                      <div className="detail-item">
                        <span>洗盘交易:</span>
                        <span className={token.is_wash_trading ? 'negative' : 'positive'}>
                          {token.is_wash_trading ? '是' : '否'}
                        </span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>📅 项目信息</h4>
                      <div className="detail-item">
                        <span>创建者:</span>
                        <span className="address">{token.creator?.slice(0, 8)}...{token.creator?.slice(-6)}</span>
                      </div>
                      <div className="detail-item">
                        <span>启动平台:</span>
                        <span>{token.launchpad_platform || '未知'}</span>
                      </div>
                      <div className="detail-item">
                        <span>CTO标志:</span>
                        <span>{token.cto_flag ? '是' : '否'}</span>
                      </div>
                      <div className="detail-item">
                        <span>创建时间:</span>
                        <span>{new Date(token.open_timestamp * 1000).toLocaleDateString()}</span>
                      </div>
                      {token.token_links?.description && (
                        <div className="detail-item description">
                          <span>项目描述:</span>
                          <span>{token.token_links.description}</span>
                        </div>
                      )}
                    </div>

                    <div className="detail-section">
                      <h4>🔗 相关链接</h4>
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
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BluechipRank;
