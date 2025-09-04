import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import './TokenDetailCard.css';

const TokenDetailCard = ({ token, isExpanded, onClose }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isExpanded && token?.address) {
      fetchTokenAnalysis();
    }
  }, [isExpanded, token?.address]);

  const fetchTokenAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/bluechip/token/${token.address}`);
      
      if (response.success) {
        setAnalysisData(response.data);
      } else {
        setError(response.message || '获取分析数据失败');
      }
    } catch (err) {
      setError(err.message || '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // 绿色
    if (score >= 60) return '#f59e0b'; // 黄色
    if (score >= 40) return '#f97316'; // 橙色
    return '#ef4444'; // 红色
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'STRONG BUY': return '#10b981';
      case 'BUY': return '#22c55e';
      case 'HOLD/WATCH': return '#f59e0b';
      case 'CAUTION': return '#f97316';
      case 'AVOID': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return '#10b981';
      case 'MEDIUM-LOW': return '#22c55e';
      case 'MEDIUM': return '#f59e0b';
      case 'MEDIUM-HIGH': return '#f97316';
      case 'HIGH': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!isExpanded) return null;

  return (
    <div className="token-detail-overlay" onClick={onClose}>
      <div className="token-detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div className="token-info">
            <img src={token.logo} alt={token.symbol} className="token-logo" />
            <div className="token-basic">
              <h3>{token.symbol}</h3>
              <p className="token-name">{token.token_links?.description || '暂无描述'}</p>
              <p className="token-address">{token.address}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="detail-content">
          {loading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>正在分析代币数据...</p>
            </div>
          )}

          {error && (
            <div className="error-section">
              <p className="error-message">❌ {error}</p>
              <button onClick={fetchTokenAnalysis} className="retry-btn">重试</button>
            </div>
          )}

          {analysisData && (
            <>
              {/* 综合评分卡片 */}
              <div className="score-card">
                <div className="score-header">
                  <h4>🎯 综合评分</h4>
                  <div className="score-badge" style={{ backgroundColor: getScoreColor(analysisData.analysis.comprehensive_score.total_score) }}>
                    {analysisData.analysis.comprehensive_score.total_score}分
                  </div>
                </div>
                <div className="score-details">
                  <div className="grade-info">
                    <span className="grade">{analysisData.analysis.comprehensive_score.grade}</span>
                    <span className="level">{analysisData.analysis.comprehensive_score.level}</span>
                  </div>
                </div>
              </div>

              {/* 投资建议卡片 */}
              <div className="advice-card">
                <h4>💡 投资建议</h4>
                <div className="advice-content">
                  <div className="recommendation" style={{ color: getRecommendationColor(analysisData.analysis.investment_advice.recommendation) }}>
                    {analysisData.analysis.investment_advice.recommendation}
                  </div>
                  <div className="risk-level" style={{ color: getRiskColor(analysisData.analysis.investment_advice.risk_level) }}>
                    风险等级: {analysisData.analysis.investment_advice.risk_level}
                  </div>
                </div>
              </div>

              {/* 各模块评分 */}
              <div className="modules-grid">
                <h4>📊 各模块评分</h4>
                <div className="modules-list">
                  {Object.entries(analysisData.analysis.comprehensive_score.breakdown).map(([module, data]) => (
                    <div key={module} className="module-item">
                      <div className="module-name">
                        {module === 'token_info' && '🏷️ 基础信息'}
                        {module === 'community_analysis' && '👥 社区分析'}
                        {module === 'kol_analysis' && '🌟 KOL分析'}
                        {module === 'twitter_analysis' && '🐦 Twitter分析'}
                        {module === 'telegram_analysis' && '📱 Telegram分析'}
                        {module === 'narrative_analysis' && '📖 叙事分析'}
                        {module === 'dev_analysis' && '👨‍💻 开发者分析'}
                        {module === 'holder_analysis' && '👤 持有者分析'}
                      </div>
                      <div className="module-score">
                        <div className="score-bar">
                          <div 
                            className="score-fill" 
                            style={{ 
                              width: `${data.score}%`,
                              backgroundColor: getScoreColor(data.score)
                            }}
                          ></div>
                        </div>
                        <span className="score-text">{data.score}分</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 行动建议 */}
              {analysisData.analysis.investment_advice.action_items && (
                <div className="action-items">
                  <h4>🎯 行动建议</h4>
                  <ul>
                    {analysisData.analysis.investment_advice.action_items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 优势和劣势 */}
              <div className="strengths-weaknesses">
                {analysisData.analysis.investment_advice.key_strengths && analysisData.analysis.investment_advice.key_strengths.length > 0 && (
                  <div className="strengths">
                    <h4>✅ 优势</h4>
                    <ul>
                      {analysisData.analysis.investment_advice.key_strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisData.analysis.investment_advice.key_weaknesses && analysisData.analysis.investment_advice.key_weaknesses.length > 0 && (
                  <div className="weaknesses">
                    <h4>❌ 劣势</h4>
                    <ul>
                      {analysisData.analysis.investment_advice.key_weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 原始MEMERADAR数据 */}
              <div className="raw-data-section">
                <h4>🔍 原始MEMERADAR数据</h4>
                <div className="raw-data-grid">
                  {/* 社区分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>👥 社区分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.community_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* KOL分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>🌟 KOL分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.kol_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* Twitter分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>🐦 Twitter分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.twitter_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* Telegram分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>📱 Telegram分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.telegram_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* 叙事分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>📖 叙事分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.narrative_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* 开发者分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>👨‍💻 开发者分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.dev_analysis, null, 2)}</pre>
                  </div>
                  
                  {/* 持有者分析原始数据 */}
                  <div className="raw-data-item">
                    <h5>👤 持有者分析原始数据</h5>
                    <pre>{JSON.stringify(analysisData.analysis.holder_analysis, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* 基础信息 */}
              <div className="basic-info">
                <h4>📋 基础信息</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span>市值:</span>
                    <span>${formatNumber(token.market_cap)}</span>
                  </div>
                  <div className="info-item">
                    <span>价格:</span>
                    <span>${parseFloat(token.price || 0).toFixed(8)}</span>
                    </div>
                  <div className="info-item">
                    <span>持有者:</span>
                    <span>{formatNumber(token.holder_count)}</span>
                  </div>
                  <div className="info-item">
                    <span>24h交易量:</span>
                    <span>${formatNumber(token.volume)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 格式化数字的辅助函数
const formatNumber = (num) => {
  if (!num) return '0';
  const number = parseFloat(num);
  if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
  if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
  if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
  return number.toFixed(2);
};

export default TokenDetailCard;
