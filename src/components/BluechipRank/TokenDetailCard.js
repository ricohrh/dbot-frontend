import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import './TokenDetailCard.css';

const TokenDetailCard = ({ token, isExpanded, onClose, analysisData }) => {
  const [error, setError] = useState(null);

  const fetchTokenAnalysis = async () => {
    try {
      setError(null);
      const response = await apiRequest(`/bluechip/token/${token.address}`);
      if (response.success) {
        // 静默获取，不阻塞展示
        setError(null);
      } else {
        setError(response.message || '获取分析数据失败');
      }
    } catch (err) {
      setError(err.message || '网络请求失败');
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
          {error && (
            <div className="error-section">
              <p className="error-message">❌ {error}</p>
              <button onClick={fetchTokenAnalysis} className="retry-btn">重试</button>
            </div>
          )}

          {analysisData && (
            <>
              {/* MEMERADAR信号分析 */}
              <div className="memeradar-signals-section">
                <h4>📡 MEMERADAR信号分析</h4>
                {/* 信号总览 */}
                <div className="signals-overview">
                  <div className="signal-stats">
                    <div className="stat-item">
                      <span className="stat-label">信号总数</span>
                      <span className="stat-value">{analysisData.analysis.community_analysis?.raw_memeradar_data?.signal_count || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">社群数量</span>
                      <span className="stat-value">{analysisData.analysis.community_analysis?.raw_memeradar_data?.community_count || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">KOL提及</span>
                      <span className="stat-value">{analysisData.analysis.community_analysis?.raw_memeradar_data?.kol_mention_count || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">投资评分</span>
                      <span className="stat-value">{Math.round(analysisData.analysis.community_analysis?.raw_memeradar_data?.investment_score || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 信号列表 */}
                <div className="signals-list">
                  <h5>🎯 检测到的信号</h5>
                  {analysisData.analysis.community_analysis?.raw_memeradar_data?.signals?.length > 0 ? (
                    <div className="signals-grid">
                      {analysisData.analysis.community_analysis.raw_memeradar_data.signals.map((signal, index) => (
                        <div key={index} className="signal-item">
                          <span className="signal-icon">📡</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-signals">暂无检测到信号</div>
                  )}
                </div>

                {/* 链智信号 */}
                {analysisData.analysis.community_analysis?.raw_memeradar_data?.chainzhi_signals?.length > 0 && (
                  <div className="chainzhi-signals">
                    <h5>⭐ 链智权威信号</h5>
                    <div className="signals-grid">
                      {analysisData.analysis.community_analysis.raw_memeradar_data.chainzhi_signals.map((signal, index) => (
                        <div key={index} className="signal-item chainzhi">
                          <span className="signal-icon">⭐</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 社交信号 */}
                {analysisData.analysis.community_analysis?.raw_memeradar_data?.social_signals?.length > 0 && (
                  <div className="social-signals">
                    <h5>👥 社交信号</h5>
                    <div className="signals-grid">
                      {analysisData.analysis.community_analysis.raw_memeradar_data.social_signals.map((signal, index) => (
                        <div key={index} className="signal-item social">
                          <span className="signal-icon">👥</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 交易量信号 */}
                {analysisData.analysis.community_analysis?.raw_memeradar_data?.volume_signals?.length > 0 && (
                  <div className="volume-signals">
                    <h5>📈 交易量信号</h5>
                    <div className="signals-grid">
                      {analysisData.analysis.community_analysis.raw_memeradar_data.volume_signals.map((signal, index) => (
                        <div key={index} className="signal-item volume">
                          <span className="signal-icon">📈</span>
                          <span className="signal-text">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热度等级和推荐 */}
                <div className="heat-recommendation">
                  <div className="heat-level">
                    <span className="heat-label">热度等级:</span>
                    <span className={`heat-value ${analysisData.analysis.community_analysis?.raw_memeradar_data?.heat_level || 'cold'}`}>
                      {analysisData.analysis.community_analysis?.raw_memeradar_data?.heat_level === 'hot' ? '🔥 热度很高' :
                       analysisData.analysis.community_analysis?.raw_memeradar_data?.heat_level === 'warm' ? '🌡️ 热度一般' :
                       analysisData.analysis.community_analysis?.raw_memeradar_data?.heat_level === 'cool' ? '❄️ 热度较低' : '🧊 热度很低'}
                    </span>
                  </div>
                  <div className="recommendation">
                    <span className="rec-label">投资建议:</span>
                    <span className="rec-text">{analysisData.analysis.community_analysis?.raw_memeradar_data?.recommendation || '暂无建议'}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!analysisData && !error && (
            <div className="no-data-section">
              <p>暂无分析数据</p>
              <button onClick={fetchTokenAnalysis} className="fetch-btn">后台获取</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailCard;
