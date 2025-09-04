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

  // 获取所有正面信号
  const getAllPositiveSignals = () => {
    const signals = [];
    
    if (!analysisData) return signals;

    // 基础信号
    signals.push({
      icon: '✅',
      text: `代币年龄符合要求(≥3小时)`,
      type: 'basic'
    });

    // MEMERADAR信号
    const memeradar = analysisData.analysis?.community_analysis?.raw_memeradar_data;
    if (memeradar) {
      const signalCount = memeradar.signal_count || 0;
      if (signalCount >= 3) {
        signals.push({
          icon: '📡',
          text: `MEMERADAR信号充足(${signalCount}个)`,
          type: 'memeradar'
        });
      } else if (signalCount > 0) {
        signals.push({
          icon: '📡',
          text: `MEMERADAR信号良好(${signalCount}个)`,
          type: 'memeradar'
        });
      }

      // 链智信号
      if (memeradar.chainzhi_signals?.length > 0) {
        memeradar.chainzhi_signals.forEach(signal => {
          if (signal.includes('高倍')) {
            signals.push({
              icon: '⭐',
              text: `包含链智-高倍信号`,
              type: 'chainzhi'
            });
          } else if (signal.includes('权威')) {
            signals.push({
              icon: '⭐',
              text: `包含链智权威信号`,
              type: 'chainzhi'
            });
          } else if (signal.includes('精选')) {
            signals.push({
              icon: '⭐',
              text: `包含链智-精选信号`,
              type: 'chainzhi'
            });
          } else {
            signals.push({
              icon: '⭐',
              text: `MEMERADAR: ${signal}`,
              type: 'chainzhi'
            });
          }
        });
      }

      // 社交信号
      if (memeradar.social_signals?.length > 0) {
        memeradar.social_signals.forEach(signal => {
          if (signal.includes('社群')) {
            signals.push({
              icon: '👥',
              text: `社群关注度高(${memeradar.community_count || 0}个)`,
              type: 'social'
            });
          } else {
            signals.push({
              icon: '��',
              text: `MEMERADAR: ${signal}`,
              type: 'social'
            });
          }
        });
      }

      // 交易量信号
      if (memeradar.volume_signals?.length > 0) {
        memeradar.volume_signals.forEach(signal => {
          signals.push({
            icon: '📈',
            text: `MEMERADAR: ${signal}`,
            type: 'volume'
          });
        });
      }

      // 持有者信号
      if (memeradar.holder_signals?.length > 0) {
        memeradar.holder_signals.forEach(signal => {
          signals.push({
            icon: '👤',
            text: `MEMERADAR: ${signal}`,
            type: 'holder'
          });
        });
      }

      // 其他MEMERADAR信号
      if (memeradar.signals?.length > 0) {
        memeradar.signals.forEach(signal => {
          if (signal.includes('CashCash')) {
            signals.push({
              icon: '💰',
              text: `MEMERADAR: CashCash信号`,
              type: 'other'
            });
          } else if (signal.includes('GemTools')) {
            signals.push({
              icon: '🔧',
              text: `MEMERADAR: GemTools信号`,
              type: 'other'
            });
          } else if (signal.includes('橙子')) {
            signals.push({
              icon: '🍊',
              text: `MEMERADAR: 橙子社区信号`,
              type: 'other'
            });
          } else if (signal.includes('MoonBot')) {
            signals.push({
              icon: '🌙',
              text: `MEMERADAR: MoonBot信号`,
              type: 'other'
            });
          } else if (signal.includes('AVE')) {
            signals.push({
              icon: '🎯',
              text: `MEMERADAR: AVE信号`,
              type: 'other'
            });
          } else {
            signals.push({
              icon: '📡',
              text: `MEMERADAR: ${signal}`,
              type: 'other'
            });
          }
        });
      }
    }

    // 社区分析信号
    const community = analysisData.analysis?.community_analysis;
    if (community) {
      if (community.community_count > 0) {
        signals.push({
          icon: '👥',
          text: `有社群关注(${community.community_count}个)`,
          type: 'community'
        });
      }
      if (community.engagement_level && community.engagement_level !== 'low') {
        signals.push({
          icon: '🔥',
          text: `社区活跃度: ${community.engagement_level}`,
          type: 'community'
        });
      }
    }

    // KOL分析信号
    const kol = analysisData.analysis?.kol_analysis;
    if (kol) {
      if (kol.kol_count > 0) {
        signals.push({
          icon: '🌟',
          text: `KOL提及(${kol.kol_count}个)`,
          type: 'kol'
        });
      }
      if (kol.influence_score > 50) {
        signals.push({
          icon: '🌟',
          text: `KOL影响力评分: ${kol.influence_score}`,
          type: 'kol'
        });
      }
    }

    // Twitter分析信号
    const twitter = analysisData.analysis?.twitter_analysis;
    if (twitter) {
      if (twitter.tweet_count > 0) {
        signals.push({
          icon: '🐦',
          text: `Twitter推文(${twitter.tweet_count}条)`,
          type: 'twitter'
        });
      }
      if (twitter.engagement_rate > 5) {
        signals.push({
          icon: '🐦',
          text: `Twitter互动率: ${twitter.engagement_rate}%`,
          type: 'twitter'
        });
      }
    }

    // Telegram分析信号
    const telegram = analysisData.analysis?.telegram_analysis;
    if (telegram) {
      if (telegram.member_count > 0) {
        signals.push({
          icon: '📱',
          text: `Telegram成员(${telegram.member_count}人)`,
          type: 'telegram'
        });
      }
      if (telegram.activity_level && telegram.activity_level !== 'low') {
        signals.push({
          icon: '📱',
          text: `Telegram活跃度: ${telegram.activity_level}`,
          type: 'telegram'
        });
      }
    }

    // 叙事分析信号
    const narrative = analysisData.analysis?.narrative_analysis;
    if (narrative) {
      if (narrative.main_narrative) {
        signals.push({
          icon: '📖',
          text: `主要叙事: ${narrative.main_narrative}`,
          type: 'narrative'
        });
      }
      if (narrative.keywords?.length > 0) {
        signals.push({
          icon: '📖',
          text: `热门关键词: ${narrative.keywords.slice(0, 3).join(', ')}`,
          type: 'narrative'
        });
      }
    }

    // 开发者分析信号
    const dev = analysisData.analysis?.dev_analysis;
    if (dev) {
      if (dev.dev_activity && dev.dev_activity !== 'low') {
        signals.push({
          icon: '👨‍💻',
          text: `开发活跃度: ${dev.dev_activity}`,
          type: 'dev'
        });
      }
      if (dev.code_quality && dev.code_quality !== 'poor') {
        signals.push({
          icon: '👨‍💻',
          text: `代码质量: ${dev.code_quality}`,
          type: 'dev'
        });
      }
    }

    // 持有者分析信号
    const holder = analysisData.analysis?.holder_analysis;
    if (holder) {
      if (holder.distribution_health && holder.distribution_health !== 'poor') {
        signals.push({
          icon: '👤',
          text: `持有者分布: ${holder.distribution_health}`,
          type: 'holder'
        });
      }
      if (holder.whale_ratio < 50) {
        signals.push({
          icon: '👤',
          text: `巨鲸比例: ${holder.whale_ratio}%`,
          type: 'holder'
        });
      }
    }

    return signals;
  };

  if (!isExpanded) return null;

  const positiveSignals = getAllPositiveSignals();

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
              {/* 正面信号分析 */}
              <div className="positive-signals-section">
                <div className="signals-header">
                  <span className="signals-icon">✅</span>
                  <span className="signals-title">正面信号</span>
                </div>
                <div className="signals-list">
                  {positiveSignals.length > 0 ? (
                    positiveSignals.map((signal, index) => (
                      <div key={index} className="signal-item">
                        <span className="signal-checkbox">✅</span>
                        <span className="signal-icon-secondary">{signal.icon}</span>
                        <span className="signal-text">{signal.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-signals">暂无检测到正面信号</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailCard;
