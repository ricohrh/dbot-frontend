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

  // 获取MEMERADAR信号数据
  const getMemeradarSignals = () => {
    if (!analysisData?.analysis?.community_analysis?.raw_memeradar_data) {
      return {
        signals: [],
        chainzhi_signals: [],
        social_signals: [],
        volume_signals: [],
        holder_signals: [],
        signal_count: 0,
        community_count: 0,
        kol_mention_count: 0,
        investment_score: 0,
        heat_level: 'cold',
        recommendation: '暂无建议'
      };
    }
    
    const memeradar = analysisData.analysis.community_analysis.raw_memeradar_data;
    return {
      signals: memeradar.signals || [],
      chainzhi_signals: memeradar.chainzhi_signals || [],
      social_signals: memeradar.social_signals || [],
      volume_signals: memeradar.volume_signals || [],
      holder_signals: memeradar.holder_signals || [],
      signal_count: memeradar.signal_count || 0,
      community_count: memeradar.community_count || 0,
      kol_mention_count: memeradar.kol_mention_count || 0,
      investment_score: memeradar.investment_score || 0,
      heat_level: memeradar.heat_level || 'cold',
      recommendation: memeradar.recommendation || '暂无建议'
    };
  };

  if (!isExpanded) return null;

  const memeradarData = getMemeradarSignals();

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
                <h4>�� 各模块评分</h4>
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

              {/* MEMERADAR信号分析 - 使用机会扫描的样式 */}
              <div className="memeradar-signals-section">
                <h4>📡 MEMERADAR信号分析</h4>
                
                {/* 信号统计 */}
                <div className="signal-stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{memeradarData.signal_count}</div>
                    <div className="stat-label">信号总数</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{memeradarData.community_count}</div>
                    <div className="stat-label">社群数量</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{memeradarData.kol_mention_count}</div>
                    <div className="stat-label">KOL提及</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.round(memeradarData.investment_score)}</div>
                    <div className="stat-label">投资评分</div>
                  </div>
                </div>

                {/* 检测到的信号 */}
                {memeradarData.signals.length > 0 && (
                  <div className="positive-signals-section">
                    <div className="signals-header">
                      <span className="signals-icon">📡</span>
                      <span className="signals-title">检测到的信号</span>
                    </div>
                    <div className="signals-list">
                      {memeradarData.signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">✅</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 链智权威信号 */}
                {memeradarData.chainzhi_signals.length > 0 && (
                  <div className="positive-signals-section chainzhi">
                    <div className="signals-header">
                      <span className="signals-icon">⭐</span>
                      <span className="signals-title">链智权威信号</span>
                    </div>
                    <div className="signals-list">
                      {memeradarData.chainzhi_signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">⭐</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 社交信号 */}
                {memeradarData.social_signals.length > 0 && (
                  <div className="positive-signals-section social">
                    <div className="signals-header">
                      <span className="signals-icon">👥</span>
                      <span className="signals-title">社交信号</span>
                    </div>
                    <div className="signals-list">
                      {memeradarData.social_signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">👥</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 交易量信号 */}
                {memeradarData.volume_signals.length > 0 && (
                  <div className="positive-signals-section volume">
                    <div className="signals-header">
                      <span className="signals-icon">📈</span>
                      <span className="signals-title">交易量信号</span>
                    </div>
                    <div className="signals-list">
                      {memeradarData.volume_signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">📈</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 持有者信号 */}
                {memeradarData.holder_signals.length > 0 && (
                  <div className="positive-signals-section holder">
                    <div className="signals-header">
                      <span className="signals-icon">👤</span>
                      <span className="signals-title">持有者信号</span>
                    </div>
                    <div className="signals-list">
                      {memeradarData.holder_signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">👤</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热度等级和投资建议 */}
                <div className="heat-recommendation">
                  <div className="heat-level">
                    <span className="heat-label">热度等级:</span>
                    <span className={`heat-value ${memeradarData.heat_level}`}>
                      {memeradarData.heat_level === 'hot' ? '🔥 热度很高' :
                       memeradarData.heat_level === 'warm' ? '🌡️ 热度一般' :
                       memeradarData.heat_level === 'cool' ? '❄️ 热度较低' : '🧊 热度很低'}
                    </span>
                  </div>
                  <div className="recommendation">
                    <span className="rec-label">投资建议:</span>
                    <span className="rec-text">{memeradarData.recommendation}</span>
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
