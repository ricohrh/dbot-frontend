import React, { useState, useEffect } from 'react';
import { marketDataService } from '../../services/marketDataService';
import './MarketData.css';

const MarketData = () => {
  const [activeCategory, setActiveCategory] = useState('hot');
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

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
    } catch (err) {
      console.error(`获取${category}数据失败:`, err);
      setError(prev => ({ ...prev, [category]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  useEffect(() => {
    fetchData(activeCategory);
  }, [activeCategory]);

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
              <th>代币名称</th>
              <th>价格</th>
              <th>24h涨跌</th>
              <th>交易量</th>
              <th>市值</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.res.slice(0, 20).map((item, index) => (
              <tr key={index} className="data-row">
                <td>
                  <div className="token-info">
                    <div className="token-symbol">{item.symbol || item.name || 'N/A'}</div>
                    <div className="token-address">{item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : 'N/A'}</div>
                  </div>
                </td>
                <td className="price-cell">
                  {formatPrice(item.price)}
                </td>
                <td className="change-cell">
                  {formatPercentage(item.priceChange24h)}
                </td>
                <td className="volume-cell">
                  {formatNumber(item.volume24h)}
                </td>
                <td className="market-cap-cell">
                  {formatNumber(item.marketCap)}
                </td>
                <td className="time-cell">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td className="action-cell">
                  <button className="btn-view" onClick={() => window.open(`https://solscan.io/token/${item.address}`, '_blank')}>
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <h2>{categories.find(c => c.id === activeCategory)?.name}</h2>
            <div className="data-actions">
              <button 
                className="btn-refresh"
                onClick={() => fetchData(activeCategory)}
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
                  onClick={() => fetchData(activeCategory)}
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
    </div>
  );
};

export default MarketData; 