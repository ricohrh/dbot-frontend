import React, { useState, useEffect } from 'react';
import { analysisService } from '../../services/analysisService';
import CopyableAddress from '../common/CopyableAddress';
import './AnalysisCards.css';

const AnalysisCards = ({ tokenAddress, tokenSymbol, tokenName }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const analysisTypes = [
    {
      id: 'community',
      name: '🏘️ 社区分析',
      description: '代币社区情绪和活跃度分析',
      color: '#4ecdc4',
      icon: '🏘️'
    },
    {
      id: 'kol',
      name: '👑 KOL分析',
      description: '关键意见领袖影响力分析',
      color: '#ff6b6b',
      icon: '👑'
    },
    {
      id: 'twitter',
      name: '🐦 Twitter分析',
      description: 'Twitter社交媒体情绪分析',
      color: '#45b7d1',
      icon: '🐦'
    },
    {
      id: 'telegram',
      name: '📱 Telegram分析',
      description: 'Telegram群组活跃度分析',
      color: '#6c5ce7',
      icon: '📱'
    },
    {
      id: 'narrative',
      name: '📖 叙事分析',
      description: '代币故事和营销分析',
      color: '#f9ca24',
      icon: '📖'
    },
    {
      id: 'dev',
      name: '👨‍💻 开发者代币',
      description: '内部人士代币分析',
      color: '#00b894',
      icon: '👨‍💻'
    }
  ];

  const fetchAnalysisData = async (type) => {
    if (analysisData[type]) return; // 如果已有数据，不重复获取
    
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    try {
      let data;
      switch (type) {
        case 'community':
          data = await analysisService.getCommunityAnalysis(tokenAddress);
          break;
        case 'kol':
          data = await analysisService.getKOLAnalysis(tokenAddress);
          break;
        case 'twitter':
          data = await analysisService.getTwitterAnalysis(tokenAddress);
          break;
        case 'telegram':
          data = await analysisService.getTelegramAnalysis(tokenAddress);
          break;
        case 'narrative':
          data = await analysisService.getNarrativeAnalysis(tokenAddress);
          break;
        case 'dev':
          data = await analysisService.getDevTokens(tokenAddress);
          break;
        default:
          throw new Error('未知的分析类型');
      }

      setAnalysisData(prev => ({ ...prev, [type]: data }));
    } catch (err) {
      console.error(`获取${type}分析数据失败:`, err);
      setError(prev => ({ ...prev, [type]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleCardClick = (type) => {
    if (activeCard === type) {
      setActiveCard(null);
    } else {
      setActiveCard(type);
      fetchAnalysisData(type);
    }
  };

  const renderCommunityAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.analysis 或 data.data
    const analysisData = data.analysis || data.data || {};
    const analysis = analysisData.community_analysis || {};
    const signalAnalysis = analysisData.signal_analysis || {};
    const kolAnalysis = analysisData.kol_analysis || {};
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>🏘️ 社区分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>社区关注度</h4>
            <div className="metric">
              <span className="value">{analysis.community_count || 0}</span>
              <span className="label">关注社群数</span>
            </div>
            <div className="metric">
              <span className="value">{analysis.influence_score || 0}</span>
              <span className="label">影响力评分</span>
            </div>
            <div className="metric">
              <span className="value">{analysis.attention_level || '未知'}</span>
              <span className="label">关注等级</span>
            </div>
          </div>

          <div className="analysis-card">
            <h4>信号活跃度</h4>
            <div className="metric">
              <span className="value">{signalAnalysis.signal_count || 0}</span>
              <span className="label">信号数量</span>
            </div>
            <div className="metric">
              <span className="value">{signalAnalysis.activity_score || 0}</span>
              <span className="label">活跃度评分</span>
            </div>
            <div className="metric">
              <span className="value">{signalAnalysis.activity_level || '未知'}</span>
              <span className="label">活跃等级</span>
            </div>
          </div>

          <div className="analysis-card">
            <h4>KOL影响力</h4>
            <div className="metric">
              <span className="value">{kolAnalysis.mention_count || 0}</span>
              <span className="label">提及用户数</span>
            </div>
            <div className="metric">
              <span className="value">{kolAnalysis.influence_score || 0}</span>
              <span className="label">影响力评分</span>
            </div>
          </div>
        </div>

        {analysisData.investment_score && (
          <div className="investment-score">
            <h4>💡 投资评分</h4>
            <div className="score-display">
              <span className="score">{analysisData.investment_score.overall_score || analysisData.investment_score}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderKOLAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const kolData = data.data || data.analysis || {};
    const kolCalls = kolData.kolCalls || [];
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>👑 KOL分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>基础统计</h4>
            <div className="metric">
              <span className="value">{kolData.mentionUserCount || 0}</span>
              <span className="label">提及用户数</span>
            </div>
            <div className="metric">
              <span className="value">{kolCalls.length || 0}</span>
              <span className="label">KOL数量</span>
            </div>
          </div>
        </div>

        {kolCalls.length > 0 && (
          <div className="kol-list">
            <h4>👑 主要KOL</h4>
            <div className="kol-grid">
              {kolCalls.slice(0, 6).map((kol, index) => (
                <div key={index} className="kol-item">
                  <div className="kol-avatar">👤</div>
                  <div className="kol-info">
                    <div className="kol-name">{kol.userName || '未知用户'}</div>
                    <div className="kol-followers">{kol.followerCount || 0} 粉丝</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTwitterAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const twitterData = data.data || data.analysis || {};
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>🐦 Twitter分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>Twitter活跃度</h4>
            <div className="metric">
              <span className="value">{twitterData.tweetCount || 0}</span>
              <span className="label">推文数量</span>
            </div>
            <div className="metric">
              <span className="value">{twitterData.userCount || 0}</span>
              <span className="label">用户数量</span>
            </div>
            <div className="metric">
              <span className="value">{twitterData.sentiment || '中性'}</span>
              <span className="label">情感倾向</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTelegramAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const telegramData = data.data || data.analysis || {};
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>📱 Telegram分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>Telegram活跃度</h4>
            <div className="metric">
              <span className="value">{telegramData.channelCount || 0}</span>
              <span className="label">频道数量</span>
            </div>
            <div className="metric">
              <span className="value">{telegramData.messageCount || 0}</span>
              <span className="label">消息数量</span>
            </div>
            <div className="metric">
              <span className="value">{telegramData.userCount || 0}</span>
              <span className="label">用户数量</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNarrativeAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const narrativeData = data.data || data.analysis || {};
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>📖 叙事分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>叙事分析</h4>
            <div className="metric">
              <span className="value">{narrativeData.narrativeScore || 0}</span>
              <span className="label">叙事评分</span>
            </div>
            <div className="metric">
              <span className="value">{narrativeData.keywords?.length || 0}</span>
              <span className="label">关键词数量</span>
            </div>
          </div>
        </div>

        {narrativeData.keywords && narrativeData.keywords.length > 0 && (
          <div className="keywords-section">
            <h4>🔑 关键词</h4>
            <div className="keywords-grid">
              {narrativeData.keywords.slice(0, 10).map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDevTokens = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const devData = data.data || data.analysis || [];
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>👨‍💻 开发者代币分析</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>开发者代币</h4>
            <div className="metric">
              <span className="value">{devData.length || 0}</span>
              <span className="label">代币数量</span>
            </div>
          </div>
        </div>

        {devData.length > 0 && (
          <div className="dev-tokens-list">
            <h4>📋 开发者代币列表</h4>
            <div className="dev-tokens-grid">
              {devData.slice(0, 5).map((token, index) => (
                <div key={index} className="dev-token-item">
                  <div className="token-symbol">{token.symbol || 'N/A'}</div>
                  <div className="token-name">{token.name || 'N/A'}</div>
                  <CopyableAddress address={token.address} className="token-address-small" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisContent = (type) => {
    const data = analysisData[type];
    
    // 添加调试信息
    console.log(`${type} 分析数据:`, data);
    
    if (loading[type]) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在分析中...</p>
        </div>
      );
    }

    if (error[type]) {
      return (
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>分析失败</h3>
          <p>{error[type]}</p>
        </div>
      );
    }

    switch (type) {
      case 'community':
        return renderCommunityAnalysis(data);
      case 'kol':
        return renderKOLAnalysis(data);
      case 'twitter':
        return renderTwitterAnalysis(data);
      case 'telegram':
        return renderTelegramAnalysis(data);
      case 'narrative':
        return renderNarrativeAnalysis(data);
      case 'dev':
        return renderDevTokens(data);
      default:
        return <div className="error-message">未知的分析类型</div>;
    }
  };

  return (
    <div className="analysis-cards-container">
      <div className="analysis-cards-header">
        <h2>🔍 深度分析</h2>
        <p>基于 ChainInsight 的智能分析</p>
      </div>

      <div className="analysis-cards-grid">
        {analysisTypes.map((type) => (
          <div
            key={type.id}
            className={`analysis-card ${activeCard === type.id ? 'active' : ''}`}
            onClick={() => handleCardClick(type.id)}
            style={{ '--card-color': type.color }}
          >
            <div className="card-header">
              <div className="card-icon">{type.icon}</div>
              <div className="card-info">
                <h3>{type.name}</h3>
                <p>{type.description}</p>
              </div>
              <div className="card-status">
                {loading[type.id] && <div className="loading-spinner-small"></div>}
                {error[type.id] && <div className="error-icon-small">❌</div>}
                {analysisData[type.id] && !loading[type.id] && !error[type.id] && (
                  <div className="success-icon-small">✅</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeCard && (
        <div className="analysis-detail-panel">
          <div className="panel-header">
            <h3>{analysisTypes.find(t => t.id === activeCard)?.name}</h3>
            <button 
              className="close-btn"
              onClick={() => setActiveCard(null)}
            >
              ✕
            </button>
          </div>
          <div className="panel-content">
            {renderAnalysisContent(activeCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisCards; 