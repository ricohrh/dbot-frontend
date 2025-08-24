import React, { useState } from 'react';
import { marketDataService } from '../../services/marketDataService';
import MarketDataItem from './MarketDataItem';
import './MarketData.css';

const MarketData = () => {
  const [marketCategories] = useState([
    {
      id: 'hot',
      name: '热门',
      description: '热门市场数据',
      endpoint: '/market/hot',
      method: marketDataService.getHotMarketData
    },
    {
      id: 'latest',
      name: '最新',
      description: '最新市场数据',
      endpoint: '/market/latest',
      method: marketDataService.getLatestMarketData
    },
    {
      id: 'meme-new',
      name: 'Meme (新创建)',
      description: '新创建的Meme币',
      endpoint: '/market/meme/new',
      method: marketDataService.getNewMemeData
    },
    {
      id: 'meme-upcoming',
      name: 'Meme (即将完成)',
      description: '即将完成的Meme币',
      endpoint: '/market/meme/upcoming',
      method: marketDataService.getUpcomingMemeData
    },
    {
      id: 'meme-soaring',
      name: 'Meme (飙升)',
      description: '价格飙升的Meme币',
      endpoint: '/market/meme/soaring',
      method: marketDataService.getSoaringMemeData
    },
    {
      id: 'meme-opened',
      name: 'Meme (已开盘)',
      description: '已开盘交易的Meme币',
      endpoint: '/market/meme/opened',
      method: marketDataService.getOpenedMemeData
    }
  ]);

  const [loading, setLoading] = useState({});
  const [marketData, setMarketData] = useState({});
  const [error, setError] = useState({});

  const handleGetData = async (category) => {
    try {
      setLoading(prev => ({ ...prev, [category.id]: true }));
      setError(prev => ({ ...prev, [category.id]: null }));
      
      console.log(`获取${category.name}数据:`, category.endpoint);
      
      // 调用对应的API方法
      const data = await category.method();
      
      setMarketData(prev => ({ 
        ...prev, 
        [category.id]: data 
      }));
      
      console.log(`${category.name}数据:`, data);
      
    } catch (error) {
      console.error('获取市场数据失败:', error);
      setError(prev => ({ 
        ...prev, 
        [category.id]: error.message 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [category.id]: false }));
    }
  };

  const renderMarketData = (categoryId, data) => {
    if (!data) return null;
    
    return (
      <div className="market-data-display">
        <h4>📊 {marketCategories.find(c => c.id === categoryId)?.name} 数据</h4>
        <div className="data-content">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="market-data-container">
      <div className="market-data">
        <div className="market-header">
          <h2>📊 实时行情</h2>
          <div className="header-dropdown">
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
        
        <div className="market-list">
          {marketCategories.map(category => (
            <MarketDataItem
              key={category.id}
              category={category}
              loading={loading[category.id]}
              onGetData={() => handleGetData(category)}
            />
          ))}
        </div>
      </div>

      {/* 数据显示区域 */}
      <div className="market-data-results">
        {marketCategories.map(category => (
          <div key={category.id}>
            {loading[category.id] && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>加载 {category.name} 数据中...</span>
              </div>
            )}
            
            {error[category.id] && (
              <div className="error-message">
                ❌ {category.name} 数据获取失败: {error[category.id]}
              </div>
            )}
            
            {marketData[category.id] && renderMarketData(category.id, marketData[category.id])}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketData; 