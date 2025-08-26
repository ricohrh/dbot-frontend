import React, { useState, useEffect } from 'react';
import { marketDataService } from '../../services/marketDataService';
import { apiRequest } from '../../services/api';
import CopyableAddress from '../common/CopyableAddress';
import AnalysisCards from '../AnalysisCards/AnalysisCards';
import './MarketData.css';

const MarketData = () => {
  const [activeCategory, setActiveCategory] = useState('hot');
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCount, setShowCount] = useState(20);

  // K线弹窗相关状态
  const [showKline, setShowKline] = useState(false);
  const [klineLoading, setKlineLoading] = useState(false);
  const [klineError, setKlineError] = useState(null);
  const [klineData, setKlineData] = useState([]);
  const [klineInterval, setKlineInterval] = useState('1m');
  const [klineMeta, setKlineMeta] = useState({ symbol: '', name: '', pair: '', chain: 'solana' });

  const categories = [
    {
      id: 'hot',
      name: '🔥 热门交易',
      description: '最活跃的交易对',
      icon: '🔥',
      color: '#ff6b6b'
    },
    {
      id: 'latest',
      name: '🆕 最新创建',
      description: '最新创建的代币',
      icon: '🆕',
      color: '#4ecdc4'
    },
    {
      id: 'newMeme',
      name: '🐕 新Meme币',
      description: '新创建的Meme代币',
      icon: '🐕',
      color: '#45b7d1'
    },
    {
      id: 'upcoming',
      name: '⏰ 即将开盘',
      description: '即将开盘的Meme币',
      icon: '⏰',
      color: '#f9ca24'
    },
    {
      id: 'soaring',
      name: '🚀 飙升代币',
      description: '价格快速上涨的代币',
      icon: '🚀',
      color: '#6c5ce7'
    },
    {
      id: 'opened',
      name: '📈 已开盘',
      description: '已开盘的Meme币',
      icon: '📈',
      color: '#00b894'
    }
  ];

  const fetchData = async (category) => {
    if (marketData[category]) return; // 如果已有数据，不重复获取
    
    setLoading(prev => ({ ...prev, [category]: true }));
    setError(prev => ({ ...prev, [category]: null }));
    // 重置展示数量
    setShowCount(20);

    try {
      let data;
      switch (category) {
        case 'hot':
          data = await marketDataService.getHotMarketData();
          break;
        case 'latest':
          data = await marketDataService.getLatestMarketData();
          break;
        case 'newMeme':
          data = await marketDataService.getNewMemeData();
          break;
        case 'upcoming':
          data = await marketDataService.getUpcomingMemeData();
          break;
        case 'soaring':
          data = await marketDataService.getSoaringMemeData();
          break;
        case 'opened':
          data = await marketDataService.getOpenedMemeData();
          break;
        default:
          throw new Error('未知的数据类别');
      }

      setMarketData(prev => ({ ...prev, [category]: data }));
      // 根据返回数量调整初始展示上限
      const total = (data && Array.isArray(data.res)) ? data.res.length : 0;
      setShowCount(prev => Math.min(prev, total || 20));
    } catch (err) {
      console.error(`获取${category}数据失败:`, err);
      setError(prev => ({ ...prev, [category]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  useEffect(() => {
    // 切换分类时重置展示数量并拉取数据
    setShowCount(20);
    fetchData(activeCategory);
  }, [activeCategory]);

  const handleTokenClick = (token) => {
    setSelectedToken(token);
    setShowAnalysis(true);
  };

  // 打开K线弹窗并加载数据
  const openKlineForItem = async (item, interval = '1m') => {
    setShowKline(true);
    setKlineInterval(interval);
    setKlineError(null);
    setKlineLoading(true);

    try {
      const pair = await resolvePairFromItem(item);
      setKlineMeta({ symbol: item.symbol || '', name: item.name || '', pair, chain: 'solana' });
      await fetchKline(pair, interval);
    } catch (e) {
      console.error('解析交易对失败:', e);
      setKlineError(e?.message || '未找到可用交易对');
      setKlineData([]);
    } finally {
      setKlineLoading(false);
    }
  };

  // 根据条目信息（mint/token/symbol/name）搜索并解析可用的交易对id
  const resolvePairFromItem = async (item) => {
    const keyword = item?.mint || item?.token || item?.symbol || item?.name;
    if (!keyword) throw new Error('缺少搜索关键字');
    const searchParams = new URLSearchParams({ keyword, chain: 'solana', limit: '10' });
    const res = await apiRequest(`/data/search?${searchParams.toString()}`);
    const items = Array.isArray(res?.res) ? res.res : [];
    if (items.length === 0) throw new Error('未搜索到匹配的交易对');
    const dexRegex = /(pump|raydium|meteora|orca|heaven|amm|clmm|cpmm|dlmm|dyn)/i;
    const candidate = items.find(it => it?.id && dexRegex.test(String(it.poolType || '')));
    return (candidate?.id) || (items[0]?.id);
  };

  const fetchKline = async (pair, interval, fallbackInfo = null) => {
    setKlineLoading(true);
    setKlineError(null);
    try {
      const params = new URLSearchParams({ chain: 'solana', pair, interval, limit: '120', end: String(Date.now()) });
      const data = await apiRequest(`/kline/chart?${params.toString()}`);
      const list = Array.isArray(data?.res) ? data.res : [];
      if (list.length > 0) {
        setKlineData(list);
      } else if (fallbackInfo) {
        // 回退：用 mint/token/symbol/name 搜索，取到有效pair再请求
        const kw = fallbackInfo.mint || fallbackInfo.token || fallbackInfo.symbol || fallbackInfo.name;
        if (kw) {
          try {
            const searchParams = new URLSearchParams({ keyword: kw, chain: 'solana', limit: '5' });
            const searchRes = await apiRequest(`/data/search?${searchParams.toString()}`);
            const items = Array.isArray(searchRes?.res) ? searchRes.res : [];
            const candidate = items.find(it => it?.id) || null;
            if (candidate?.id && candidate.id !== pair) {
              setKlineMeta(prev => ({ ...prev, pair: candidate.id, symbol: candidate.symbol || prev.symbol, name: candidate.name || prev.name }));
              const p2 = new URLSearchParams({ chain: 'solana', pair: candidate.id, interval, limit: '120', end: String(Date.now()) });
              const data2 = await apiRequest(`/kline/chart?${p2.toString()}`);
              const list2 = Array.isArray(data2?.res) ? data2.res : [];
              setKlineData(list2);
            } else {
              setKlineData([]);
            }
          } catch (e2) {
            console.error('K线回退搜索失败:', e2);
            setKlineData([]);
          }
        } else {
          setKlineData([]);
        }
      } else {
        setKlineData([]);
      }
    } catch (e) {
      console.error('获取K线失败:', e);
      setKlineError(e?.message || '获取K线失败');
      setKlineData([]);
    } finally {
      setKlineLoading(false);
    }
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    setSelectedToken(null);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(6)}`;
  };

  const formatPercentage = (change) => {
    if (!change) return '0%';
    const value = parseFloat(change);
    const color = value >= 0 ? '#00b894' : '#ff6b6b';
    const sign = value >= 0 ? '+' : '';
    return <span style={{ color }}>{sign}{value.toFixed(2)}%</span>;
  };

  const renderDataTable = (data) => {
    if (!data || !data.res || !Array.isArray(data.res)) {
      return (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <p>暂无数据</p>
        </div>
      );
    }

    return (
      <div className="market-data-table">
        <table>
          <thead>
            <tr>
              <th>代币信息</th>
              <th>价格 (USD)</th>
              <th>24h涨跌</th>
              <th>1h涨跌</th>
              <th>交易量 (1h)</th>
              <th>市值</th>
              <th>持有人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.res.slice(0, showCount).map((item, index) => (
              <tr key={index} className="data-row" onClick={() => handleTokenClick(item)}>
                <td>
                  <div className="token-info">
                    <div className="token-header">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.symbol} 
                          className="token-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="token-details">
                        <div className="token-symbol">{item.symbol || 'N/A'}</div>
                        <div className="token-name">{item.name || 'N/A'}</div>
                        {item.mint && (
                          <CopyableAddress 
                            address={item.mint} 
                            className="token-address"
                            showCopyButton={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="price-cell">
                  {formatPrice(item.tokenPriceUsd)}
                </td>
                <td className="change-cell">
                  {formatPercentage(item.priceChange24h)}
                </td>
                <td className="change-cell">
                  {formatPercentage(item.priceChange1h)}
                </td>
                <td className="volume-cell">
                  {formatNumber(item.buyAndSellVolume1h)}
                </td>
                <td className="market-cap-cell">
                  {formatNumber(item.marketCap)}
                </td>
                <td className="holders-cell">
                  {item.holders ? item.holders.toLocaleString() : 'N/A'}
                </td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn-view" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://solscan.io/token/${item.mint}`, '_blank');
                      }}
                      title="查看代币详情"
                    >
                      🔍
                    </button>
                    <button
                      className="btn-chart"
                      onClick={(e) => {
                        e.stopPropagation();
                        openKlineForItem(item, '1m');
                      }}
                      title="看K线"
                    >
                      📊
                    </button>
                    <button 
                      className="btn-chart" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://dexscreener.com/solana/${item.mint}`, '_blank');
                      }}
                      title="查看图表"
                    >
                      📈
                    </button>
                    <button 
                      className="btn-analysis" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTokenClick(item);
                      }}
                      title="深度分析"
                    >
                      🔍
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-actions" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button 
            className="btn-load-more"
            onClick={() => setShowCount(c => Math.min(c + 20, data.res.length))}
            disabled={showCount >= data.res.length}
          >
            加载更多
          </button>
          <button 
            className="btn-show-all"
            onClick={() => setShowCount(data.res.length)}
            disabled={showCount >= data.res.length}
          >
            显示全部
          </button>
          <div style={{ marginLeft: 'auto', opacity: 0.75 }}>
            显示 {Math.min(showCount, data.res.length)} / {data.res.length}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryCard = (category) => {
    const isActive = activeCategory === category.id;
    const isLoading = loading[category.id];
    const hasError = error[category.id];
    const hasData = marketData[category.id];

    return (
      <div
        key={category.id}
        className={`category-card ${isActive ? 'active' : ''}`}
        onClick={() => setActiveCategory(category.id)}
      >
        <div className="category-header">
          <div className="category-icon" style={{ backgroundColor: category.color }}>
            {category.icon}
          </div>
          <div className="category-info">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div>
          <div className="category-status">
            {isLoading && <div className="loading-spinner"></div>}
            {hasError && <div className="error-icon">❌</div>}
            {hasData && !isLoading && !hasError && <div className="success-icon">✅</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="market-data-container">
      <div className="market-data-header">
        <h1>📈 实时行情数据</h1>
        <p>获取最新的市场动态和交易数据</p>
      </div>

      <div className="market-data-content">
        <div className="categories-sidebar">
          <h3>数据分类</h3>
          <div className="categories-grid">
            {categories.map(renderCategoryCard)}
          </div>
        </div>

        <div className="data-display">
          <div className="data-header">
            <h2>{categories.find(c => c.id === activeCategory)?.name}（{marketData[activeCategory]?.res?.length || 0} 条）</h2>
            <div className="data-actions">
              <button 
                className="btn-refresh"
                onClick={() => { setShowCount(20); fetchData(activeCategory); }}
                disabled={loading[activeCategory]}
              >
                {loading[activeCategory] ? '🔄 加载中...' : '🔄 刷新'}
              </button>
            </div>
          </div>

          <div className="data-content">
            {loading[activeCategory] && (
              <div className="loading-container">
                <div className="loading-spinner-large"></div>
                <p>正在获取数据...</p>
              </div>
            )}

            {error[activeCategory] && (
              <div className="error-container">
                <div className="error-icon-large">❌</div>
                <h3>获取数据失败</h3>
                <p>{error[activeCategory]}</p>
                <button 
                  className="btn-retry"
                  onClick={() => { setShowCount(20); fetchData(activeCategory); }}
                >
                  重试
                </button>
              </div>
            )}

            {!loading[activeCategory] && !error[activeCategory] && (
              renderDataTable(marketData[activeCategory])
            )}
          </div>
        </div>
      </div>

      {/* 分析卡片 */}
      {showAnalysis && selectedToken && (
        <div className="analysis-overlay">
          <div className="analysis-modal">
            <div className="analysis-modal-header">
              <h2>🔍 {selectedToken.symbol || selectedToken.name} 深度分析</h2>
              <button className="close-analysis-btn" onClick={handleCloseAnalysis}>
                ✕
              </button>
            </div>
            <div className="analysis-modal-content">
              <AnalysisCards 
                tokenAddress={selectedToken.mint}
                tokenSymbol={selectedToken.symbol}
                tokenName={selectedToken.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* K线弹窗 */}
      {showKline && (
        <div className="analysis-overlay">
          <div className="analysis-modal" style={{ width: 'min(960px, 96vw)' }}>
            <div className="analysis-modal-header">
              <h2>📊 {klineMeta.symbol || klineMeta.name || 'K线'} — {klineMeta.pair}</h2>
              <button className="close-analysis-btn" onClick={() => setShowKline(false)}>✕</button>
            </div>
            <div className="analysis-modal-content">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {['1m','5m','15m'].map(iv => (
                  <button
                    key={iv}
                    className="btn-refresh"
                    style={{ backgroundColor: iv === klineInterval ? '#4ecdc4' : undefined }}
                    onClick={() => {
                      setKlineInterval(iv);
                      fetchKline(klineMeta.pair, iv);
                    }}
                  >
                    {iv}
                  </button>
                ))}
              </div>

              {klineLoading && (
                <div className="loading-container">
                  <div className="loading-spinner-large"></div>
                  <p>正在加载K线...</p>
                </div>
              )}
              {klineError && (
                <div className="error-container">
                  <div className="error-icon-large">❌</div>
                  <h3>获取K线失败</h3>
                  <p>{klineError}</p>
                </div>
              )}
              {!klineLoading && !klineError && (
                <div style={{ maxHeight: 420, overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <table className="market-data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>时间</th>
                        <th>开</th>
                        <th>高</th>
                        <th>低</th>
                        <th>收</th>
                        <th>量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {klineData.slice(-120).map((c, idx) => (
                        <tr key={idx}>
                          <td>{new Date(c.time).toLocaleString()}</td>
                          <td>{Number(c.open).toPrecision(6)}</td>
                          <td>{Number(c.high).toPrecision(6)}</td>
                          <td>{Number(c.low).toPrecision(6)}</td>
                          <td>{Number(c.close).toPrecision(6)}</td>
                          <td>{Number(c.volume).toFixed(2)}</td>
                        </tr>
                      ))}
                      {(!klineData || klineData.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>暂无K线数据</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketData; 