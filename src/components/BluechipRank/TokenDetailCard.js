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

  // 获取所有分析模块的信号
  const getAllSignals = () => {
    const signals = [];
    
    // 社区分析信号
    if (analysisData?.analysis?.community_analysis) {
      const community = analysisData.analysis.community_analysis;
      if (community.summary) signals.push(`社区分析: ${community.summary}`);
      if (community.engagement_level) signals.push(`社区活跃度: ${community.engagement_level}`);
      if (community.community_count > 0) signals.push(`社区数量: ${community.community_count}个`);
    }

    // KOL分析信号
    if (analysisData?.analysis?.kol_analysis) {
      const kol = analysisData.analysis.kol_analysis;
      if (kol.summary) signals.push(`KOL分析: ${kol.summary}`);
      if (kol.kol_count > 0) signals.push(`KOL数量: ${kol.kol_count}个`);
      if (kol.influence_score > 0) signals.push(`影响力评分: ${kol.influence_score}`);
    }

    // Twitter分析信号
    if (analysisData?.analysis?.twitter_analysis) {
      const twitter = analysisData.analysis.twitter_analysis;
      if (twitter.summary) signals.push(`Twitter分析: ${twitter.summary}`);
      if (twitter.tweet_count > 0) signals.push(`推文数量: ${twitter.tweet_count}条`);
      if (twitter.engagement_rate > 0) signals.push(`互动率: ${twitter.engagement_rate}%`);
    }

    // Telegram分析信号
    if (analysisData?.analysis?.telegram_analysis) {
      const telegram = analysisData.analysis.telegram_analysis;
      if (telegram.summary) signals.push(`Telegram分析: ${telegram.summary}`);
      if (telegram.member_count > 0) signals.push(`成员数量: ${telegram.member_count}人`);
      if (telegram.activity_level) signals.push(`活跃度: ${telegram.activity_level}`);
    }

    // 叙事分析信号
    if (analysisData?.analysis?.narrative_analysis) {
      const narrative = analysisData.analysis.narrative_analysis;
      if (narrative.summary) signals.push(`叙事分析: ${narrative.summary}`);
      if (narrative.main_narrative) signals.push(`主要叙事: ${narrative.main_narrative}`);
      if (narrative.keywords?.length > 0) signals.push(`关键词: ${narrative.keywords.join(', ')}`);
    }

    // 开发者分析信号
    if (analysisData?.analysis?.dev_analysis) {
      const dev = analysisData.analysis.dev_analysis;
      if (dev.summary) signals.push(`开发者分析: ${dev.summary}`);
      if (dev.dev_activity) signals.push(`开发活跃度: ${dev.dev_activity}`);
      if (dev.code_quality) signals.push(`代码质量: ${dev.code_quality}`);
    }

    // 持有者分析信号
    if (analysisData?.analysis?.holder_analysis) {
      const holder = analysisData.analysis.holder_analysis;
      if (holder.summary) signals.push(`持有者分析: ${holder.summary}`);
      if (holder.distribution_health) signals.push(`分布健康度: ${holder.distribution_health}`);
      if (holder.whale_ratio > 0) signals.push(`巨鲸比例: ${holder.whale_ratio}%`);
    }

    return signals;
  };

  if (!isExpanded) return null;

  const memeradarData = getMemeradarSignals();
  const allSignals = getAllSignals();

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

                {/* 所有分析信号 */}
                {allSignals.length > 0 && (
                  <div className="positive-signals-section">
                    <div className="signals-header">
                      <span className="signals-icon">📊</span>
                      <span className="signals-title">分析信号</span>
                    </div>
                    <div className="signals-list">
                      {allSignals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-checkbox">✅</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailCard;
