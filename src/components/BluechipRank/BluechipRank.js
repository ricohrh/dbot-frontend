import React, { useState, useEffect, useRef } from 'react';
import './BluechipRank.css';
import { apiRequest } from '../../services/api';

import TokenDetailCard from "./TokenDetailCard";

const BluechipRank = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('swaps');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedToken, setExpandedToken] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [analysisData, setAnalysisData] = useState({}); // 存储所有代币的分析数据
  const [analysisLoading, setAnalysisLoading] = useState({}); // 存储分析数据的加载状态

  const [showDetailCard, setShowDetailCard] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(null);
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

  // 当tokens更新时，预加载前10个代币的分析数据
  useEffect(() => {
    if (tokens.length > 0) {
      preloadAnalysisData();
    }
  }, [tokens]);

  const preloadAnalysisData = async () => {
    // 预加载前30个代币的分析数据
    const tokensToAnalyze = tokens.slice(0, 30);
    
    for (const token of tokensToAnalyze) {
      if (!analysisData[token.address] && !analysisLoading[token.address]) {
        setAnalysisLoading(prev => ({ ...prev, [token.address]: true }));
        
        try {
          const response = await apiRequest(`/bluechip/token/${token.address}`);
          if (response.success) {
            setAnalysisData(prev => ({ ...prev, [token.address]: response.data }));
          }
        } catch (err) {
          console.error(`获取 ${token.symbol} 分析数据失败:`, err);
        } finally {
          setAnalysisLoading(prev => ({ ...prev, [token.address]: false }));
        }
      }
    }
  };

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

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (e) {
      console.error('复制失败:', e);
    }
  };

  const handleShowDetail = (token) => {
    setSelectedToken(token);
    setShowDetailCard(true);
    // 如果该代币还没有分析数据，则静默后台获取
    if (!analysisData[token.address] && !analysisLoading[token.address]) {
      (async () => {
        try {
          setAnalysisLoading(prev => ({ ...prev, [token.address]: true }));
          const response = await apiRequest(`/bluechip/token/${token.address}`);
          if (response.success) {
            setAnalysisData(prev => ({ ...prev, [token.address]: response.data }));
          }
        } catch (err) {
          console.error(`获取 ${token.symbol} 分析数据失败:`, err);
        } finally {
          setAnalysisLoading(prev => ({ ...prev, [token.address]: false }));
        }
      })();
    }
  };

  const handleCloseDetail = () => {
    setShowDetailCard(false);
    setSelectedToken(null);
  };

  if (loading) {
    return (
      <div className="bluechip-rank">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载蓝筹代币数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bluechip-rank">
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
          <button onClick={() => fetchTokens()} className="retry-btn">重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bluechip-rank">
      <div className="header">
        <h1>🏆 蓝筹代币排行榜</h1>
        <div className="controls">
          <div className="refresh-info">
            <span className="refresh-count">刷新次数: {refreshCount}</span>
            {lastUpdate && (
              <span className="last-update">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={toggleAutoRefresh}
          >
            {autoRefresh ? '⏸️ 暂停自动刷新' : '▶️ 开启自动刷新'}
          </button>
          <button onClick={() => fetchTokens()} className="refresh-btn">
            🔄 手动刷新
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="tokens-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>代币</th>
              <th 
                className={`sortable ${sortBy === 'market_cap' ? 'active' : ''}`}
                onClick={() => handleSort('market_cap')}
              >
                市值 {sortBy === 'market_cap' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className={`sortable ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => handleSort('price')}
              >
                价格 {sortBy === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className={`sortable ${sortBy === 'holder_count' ? 'active' : ''}`}
                onClick={() => handleSort('holder_count')}
              >
                持有者 {sortBy === 'holder_count' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className={`sortable ${sortBy === 'volume' ? 'active' : ''}`}
                onClick={() => handleSort('volume')}
              >
                24h交易量 {sortBy === 'volume' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className={`sortable ${sortBy === 'swaps' ? 'active' : ''}`}
                onClick={() => handleSort('swaps')}
              >
                24h交易次数 {sortBy === 'swaps' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th>安全评分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token, index) => (
              <tr key={token.address} className="token-row">
                <td className="rank">#{index + 1}</td>
                <td className="token-info">
                  <div className="token-details">
                    <img 
                      src={token.logo} 
                      alt={token.symbol} 
                      className="token-logo"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj5EPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <div className="token-text">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-name">{token.token_links?.description || '暂无描述'}</div>
                    </div>
                  </div>
                </td>
                <td className="market-cap">${formatNumber(token.market_cap)}</td>
                <td className="price">{formatPrice(token.price)}</td>
                <td className="holders">{formatNumber(token.holder_count)}</td>
                <td className="volume">${formatNumber(token.volume)}</td>
                <td className="swaps">{formatNumber(token.swaps)}</td>
                <td className="security-score">
                  <div 
                    className="score-badge"
                    style={{ backgroundColor: getSecurityScoreColor(calculateSecurityScore(token)) }}
                  >
                    {calculateSecurityScore(token)}
                  </div>
                </td>
                <td className="actions">
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(token.address)}
                    title="复制地址"
                  >
                    {copiedAddress === token.address ? '✅' : '📋'}
                  </button>
                  <button
                    className="detail-btn"
                    onClick={() => handleShowDetail(token)}
                    title="MEMERADAR分析"
                  >
                    🔍 MEMERADAR分析
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailCard && selectedToken && (
        <TokenDetailCard
          token={selectedToken}
          isExpanded={showDetailCard}
          onClose={handleCloseDetail}
          analysisData={analysisData[selectedToken.address]}
        />
      )}
    </div>
  );
};

export default BluechipRank;
