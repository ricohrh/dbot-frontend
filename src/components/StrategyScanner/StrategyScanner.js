import React, { useState, useEffect } from 'react';
import { strategyService } from '../../services/strategyService';
import CopyableAddress from '../common/CopyableAddress';
import './StrategyScanner.css';

const StrategyScanner = () => {
  const [strategyConfig, setStrategyConfig] = useState({
    timeRange: '3h-6h',
    minHolders: 1200,
    minVolume: 1000,
    minMarketCap: 50000,
    chain: 'solana'
  });
  
  const [scanResults, setScanResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [walletAnalysis, setWalletAnalysis] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showBundlerList, setShowBundlerList] = useState(false);

  const presets = strategyService.getStrategyPresets();

  const handlePresetChange = (presetKey) => {
    const preset = presets[presetKey];
    setStrategyConfig({
      ...strategyConfig,
      timeRange: preset.timeRange,
      minHolders: preset.minHolders,
      minVolume: preset.minVolume
    });
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setScanResults(null);
    
    try {
      const result = await strategyService.scanStrategyTokens(strategyConfig);
      setScanResults(result);
    } catch (err) {
      setError(err.message || '扫描失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenAnalysis = async (token) => {
    setSelectedToken(token);
    setAnalysisLoading(true);
    setTokenAnalysis(null);
    setWalletAnalysis(null);
    
    try {
      const analysis = await strategyService.analyzeTokenStrategy(token.mint || token._id, strategyConfig.chain);
      setTokenAnalysis(analysis);
    } catch (err) {
      setError(err.message || '分析失败');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleWalletAnalysis = async () => {
    if (!selectedToken) return;
    
    setWalletLoading(true);
    setWalletAnalysis(null);
    
    try {
      const analysis = await strategyService.analyzeHolderWallets(selectedToken.mint || selectedToken._id, strategyConfig.chain);
      setWalletAnalysis(analysis);
    } catch (err) {
      setError(err.message || '钱包分析失败');
    } finally {
      setWalletLoading(false);
    }
  };

  const renderStrategyCard = (token) => {
    const score = token.strategy_score;
    const scoreColor = score.total_score >= 85 ? '#00b894' : 
                      score.total_score >= 75 ? '#fdcb6e' : 
                      score.total_score >= 65 ? '#e17055' : '#d63031';
    
    return (
      <div key={token._id} className="strategy-token-card" onClick={() => handleTokenAnalysis(token)}>
        <div className="token-header">
          <div className="token-info">
            <h3>{token.symbol || token.name}</h3>
            <p>{token.name}</p>
            <CopyableAddress address={token.mint || token._id} className="token-address" />
          </div>
          <div className="score-badge" style={{ backgroundColor: scoreColor }}>
            {score.total_score}
          </div>
        </div>
        
        <div className="token-metrics">
          <div className="metric">
            <span className="label">持有人数</span>
            <span className="value">{token.holders?.toLocaleString()}</span>
            <span className="score">({score.holders_score})</span>
          </div>
          <div className="metric">
            <span className="label">1h交易量</span>
            <span className="value">${token.buyAndSellVolume1h?.toLocaleString()}</span>
            <span className="score">({score.volume_score})</span>
          </div>
          <div className="metric">
            <span className="label">市值</span>
            <span className="value">${token.marketCap?.toLocaleString()}</span>
            <span className="score">({score.market_cap_score})</span>
          </div>
          <div className="metric">
            <span className="label">5m涨跌</span>
            <span className={`value ${token.marketCapChangeRate5m >= 0 ? 'positive' : 'negative'}`}>
              {token.marketCapChangeRate5m?.toFixed(2)}%
            </span>
            <span className="score">({score.blue_chip_score})</span>
          </div>
          <div className="metric">
            <span className="label">MEMERADAR</span>
            <span className="value">{score.memeradar_score || 0}</span>
            <span className="score">({score.memeradar_score || 0})</span>
          </div>
          <div className="metric">
            <span className="label">鲸鱼分析</span>
            <span className="value">{score.whale_analysis_score || 0}</span>
            <span className="score">({score.whale_analysis_score || 0})</span>
          </div>
        </div>
        
        <div className="token-links">
          {token.links?.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="link-btn">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderTokenAnalysis = () => {
    if (!tokenAnalysis) return null;
    
    return (
      <div className="token-analysis-modal">
        <div className="modal-header">
          <h2>📊 {tokenAnalysis.token_info.symbol} 策略分析</h2>
          <div className="header-actions">
            <button 
              type="button"
              className="wallet-analysis-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWalletAnalysis(); }}
              disabled={walletLoading}
            >
              {walletLoading ? '🔍 分析中...' : '🔍 钱包分析'}
            </button>
            <button type="button" className="close-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedToken(null); }}>✕</button>
          </div>
        </div>
        
        <div className="modal-content">
          <div className="analysis-grid">
            <div className="analysis-card">
              <h3>🎯 策略评分</h3>
              <div className="score-breakdown">
                <div className="score-item">
                  <span>总分</span>
                  <span className="score">{tokenAnalysis.strategy_score.total_score}</span>
                </div>
                <div className="score-item">
                  <span>持有人数</span>
                  <span className="score">{tokenAnalysis.strategy_score.holders_score}</span>
                  <span className="actual-data">({tokenAnalysis.token_info?.holders?.toLocaleString() || 0})</span>
                </div>
                <div className="score-item">
                  <span>交易量</span>
                  <span className="score">{tokenAnalysis.strategy_score.volume_score}</span>
                  <span className="actual-data">(${(tokenAnalysis.token_info?.buyAndSellVolume || 0).toLocaleString()})</span>
                </div>
                <div className="score-item">
                  <span>市值</span>
                  <span className="score">{tokenAnalysis.strategy_score.market_cap_score}</span>
                  <span className="actual-data">(${(tokenAnalysis.token_info?.marketCap || 0).toLocaleString()})</span>
                </div>
                <div className="score-item">
                  <span>蓝筹指数</span>
                  <span className="score">{tokenAnalysis.strategy_score.blue_chip_score}</span>
                  <span className="actual-data">({tokenAnalysis.token_info?.rate || 0})</span>
                </div>
                <div className="score-item">
                  <span>MEMERADAR</span>
                  <span className="score">{tokenAnalysis.strategy_score.memeradar_score || 0}</span>
                </div>
                <div className="score-item">
                  <span>鲸鱼分析</span>
                  <span className="score">{tokenAnalysis.strategy_score.whale_analysis_score || 0}</span>
                </div>
                <div className="score-item">
                  <span>社交媒体</span>
                  <span className="score">{tokenAnalysis.strategy_score.social_score || 0}</span>
                </div>
                <div className="score-item">
                  <span>风险</span>
                  <span className="score">{tokenAnalysis.strategy_score.risk_score}</span>
                </div>
              </div>
            </div>
            
            <div className="analysis-card">
              <h3>💡 交易建议</h3>
              <div className="recommendations">
                {tokenAnalysis.trading_recommendations?.map((rec, index) => (
                  <div key={index} className="recommendation-item">{rec}</div>
                ))}
              </div>
            </div>
            
            <div className="analysis-card">
              <h3>⚠️ 风险评估</h3>
              <div className="risk-info">
                <div className="risk-level">
                  <span>风险等级:</span>
                  <span className={`level ${tokenAnalysis.risk_assessment.risk_level.toLowerCase()}`}>
                    {tokenAnalysis.risk_assessment.risk_level}
                  </span>
                </div>
                <div className="risk-factors">
                  {tokenAnalysis.risk_assessment.risk_factors?.map((factor, index) => (
                    <div key={index} className="risk-factor">{factor}</div>
                  ))}
                </div>
                {tokenAnalysis.risk_assessment.age_hours && (
                  <div className="age-info">
                    代币年龄: {tokenAnalysis.risk_assessment.age_hours.toFixed(1)} 小时
                  </div>
                )}
                {tokenAnalysis.risk_assessment.market_per_holder && (
                  <div className="age-info">
                    市值/持有人比例: {tokenAnalysis.risk_assessment.market_per_holder.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="analysis-card">
              <h3>⏰ 市场时机</h3>
              <div className="timing-advice">
                {tokenAnalysis.market_timing}
              </div>
            </div>
          </div>

          {/* 钱包分析结果 */}
          {walletAnalysis && (
            <div className="wallet-analysis-section">
              <h3>🔍 钱包风险分析</h3>
              <div className="wallet-analysis-grid">
                <div className="wallet-analysis-card">
                  <h4>风险等级</h4>
                  <div className={`risk-badge ${(walletAnalysis?.analysis?.risk_level || 'unknown').toLowerCase()}`}>
                    {({ high: '高风险', medium: '中风险', low: '低风险', very_low: '很低', unknown: '未知' }[walletAnalysis?.analysis?.risk_level] || walletAnalysis?.analysis?.risk_level || '未知')}
                  </div>
                </div>
                
                <div className="wallet-analysis-card">
                  <h4>集中度与Bundler</h4>
                  <div className="distribution-stats">
                    <div className="stat-item">
                      <span>Bundler占比:</span>
                      <span>{((walletAnalysis.analysis.metrics?.bundler_ratio || 0) * 100).toFixed(1)}% ({walletAnalysis.analysis.metrics?.bundler_count || 0}/20)</span>
                    </div>
                    <div className="stat-item">
                      <span>Top10占比:</span>
                      <span>{((walletAnalysis.analysis.metrics?.top10_ratio || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="stat-item">
                      <span>Top20占比:</span>
                      <span>{((walletAnalysis.analysis.metrics?.top20_ratio || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="stat-item">
                      <span>HHI:</span>
                      <span>{(walletAnalysis.analysis.metrics?.hhi || 0).toFixed(3)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Gini:</span>
                      <span>{(walletAnalysis.analysis.metrics?.gini || 0).toFixed(3)}</span>
                    </div>
                    {walletAnalysis?.analysis?.suspicious_patterns?.find(p => (p.type === 'high_bundler_ratio' || p.type === 'medium_bundler_ratio')) && (
                      <div className="bundler-addresses">
                        <button className="toggle-btn" onClick={() => setShowBundlerList(!showBundlerList)}>
                          {showBundlerList ? '隐藏Bundler地址' : `显示Bundler地址 (${(walletAnalysis?.analysis?.suspicious_patterns?.find(p => (p.type === 'high_bundler_ratio' || p.type === 'medium_bundler_ratio'))?.details?.bundler_addresses || []).length})`}
                        </button>
                        {showBundlerList && (
                          <div className="address-list">
                            {(walletAnalysis?.analysis?.suspicious_patterns?.find(p => (p.type === 'high_bundler_ratio' || p.type === 'medium_bundler_ratio'))?.details?.bundler_addresses || []).map((addr, i) => (
                              <div key={i} className="address-item">
                                <CopyableAddress address={addr} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="wallet-analysis-card">
                  <h4>持有者分布</h4>
                  {walletAnalysis?.analysis?.wallet_analysis?.distribution ? (
                    <div className="distribution-stats">
                      <div className="stat-item">
                        <span>总持有者:</span>
                        <span>{walletAnalysis.total_holders}</span>
                      </div>
                      <div className="stat-item">
                        <span>鲸鱼数量:</span>
                        <span>{walletAnalysis?.analysis?.wallet_analysis?.distribution?.whale_count ?? 0}</span>
                      </div>
                      <div className="stat-item">
                        <span>中等持有者:</span>
                        <span>{walletAnalysis?.analysis?.wallet_analysis?.distribution?.medium_count ?? 0}</span>
                      </div>
                      <div className="stat-item">
                        <span>小持有者:</span>
                        <span>{walletAnalysis?.analysis?.wallet_analysis?.distribution?.small_count ?? 0}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="distribution-stats">
                      暂无分布数据
                    </div>
                  )}
                </div>
              </div>

              {walletAnalysis.analysis.suspicious_patterns.length > 0 && (
                <div className="suspicious-patterns">
                  <h4>🚨 可疑模式检测</h4>
                  <div className="pattern-list">
                    {walletAnalysis.analysis.suspicious_patterns.map((pattern, index) => (
                      <div key={index} className="pattern-item">
                        ⚠️ {typeof pattern === 'string' ? pattern : (pattern?.description || pattern?.type || '可疑模式')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {walletAnalysis.analysis.risk_factors.length > 0 && (
                <div className="risk-factors-section">
                  <h4>⚠️ 风险因素</h4>
                  <div className="risk-factors-list">
                    {walletAnalysis.analysis.risk_factors.map((factor, index) => (
                      <div key={index} className="risk-factor-item">
                        {typeof factor === 'string' ? factor : (factor?.description || factor?.type || '风险因素')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="wallet-recommendations">
                <h4>💡 钱包分析建议</h4>
                <div className="recommendations-list">
                  {walletAnalysis.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="token-details">
            <h3>📋 代币详情</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span>持有人数:</span>
                <span>{tokenAnalysis.token_info.holders?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>1h交易量:</span>
                <span>${tokenAnalysis.token_info.buyAndSellVolume1h?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>市值:</span>
                <span>${tokenAnalysis.token_info.marketCap?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>24h涨跌:</span>
                <span className={tokenAnalysis.token_info.priceChange24h >= 0 ? 'positive' : 'negative'}>
                  {tokenAnalysis.token_info.priceChange24h?.toFixed(2)}%
                </span>
              </div>
              <div className="detail-item">
                <span>MEMERADAR数据:</span>
                <span>{tokenAnalysis.token_info.holderHasTags ? '✅ 有' : '❌ 无'}</span>
              </div>
              <div className="detail-item">
                <span>社交媒体链接:</span>
                <span>{tokenAnalysis.token_info.links?.length || 0} 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="strategy-scanner">
      <div className="scanner-header">
        <h1>🎯 波段交易策略扫描器</h1>
        <p>基于你的策略自动筛选符合条件的热门代币</p>
      </div>

      <div className="scanner-controls">
        <div className="preset-buttons">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              className={`preset-btn ${strategyConfig.timeRange === preset.timeRange ? 'active' : ''}`}
              onClick={() => handlePresetChange(key)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-desc">{preset.description}</div>
            </button>
          ))}
        </div>

        <div className="custom-config">
          <div className="config-group">
            <label>最小持有人数:</label>
            <input
              type="number"
              value={strategyConfig.minHolders}
              onChange={(e) => setStrategyConfig({...strategyConfig, minHolders: parseInt(e.target.value)})}
            />
          </div>
          <div className="config-group">
            <label>最小交易量:</label>
            <input
              type="number"
              value={strategyConfig.minVolume}
              onChange={(e) => setStrategyConfig({...strategyConfig, minVolume: parseInt(e.target.value)})}
            />
          </div>
          <div className="config-group">
            <label>最小市值:</label>
            <input
              type="number"
              value={strategyConfig.minMarketCap}
              onChange={(e) => setStrategyConfig({...strategyConfig, minMarketCap: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <button className="scan-btn" onClick={handleScan} disabled={loading}>
          {loading ? '🔍 扫描中...' : '🚀 开始扫描'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {scanResults && (
        <div className="scan-results">
          <div className="results-header">
            <h2>📊 扫描结果</h2>
            <div className="results-stats">
              <span>扫描总数: {scanResults.total_scanned}</span>
              <span>符合条件: {scanResults.total_filtered}</span>
            </div>
          </div>
          
          <div className="tokens-grid">
            {scanResults.tokens.map(renderStrategyCard)}
          </div>
        </div>
      )}

      {selectedToken && (
        <div className="modal-overlay" onClick={() => setSelectedToken(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {analysisLoading ? (
              <div className="loading">分析中...</div>
            ) : (
              renderTokenAnalysis()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyScanner; 