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
  
  // 新增状态
  const [tradingDecision, setTradingDecision] = useState(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [qualityTokens, setQualityTokens] = useState(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [opportunities, setOpportunities] = useState(null);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);

  // 新增：RSI 二级筛选配置
  const [rsiFilter, setRsiFilter] = useState('none'); // none | oversold | overbought
  const [rsiThreshold, setRsiThreshold] = useState(35); // 30/35/40
  const [rsiInterval, setRsiInterval] = useState('5m'); // 5m | 15m | 1h

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

  // 新增：扫描优质代币
  const handleScanQuality = async () => {
    setQualityLoading(true);
    setError(null);
    setQualityTokens(null);
    
    try {
      const result = await strategyService.scanQualityTokens(strategyConfig.chain, 60, 10);
      setQualityTokens(result);
    } catch (err) {
      setError(err.message || '优质代币扫描失败');
    } finally {
      setQualityLoading(false);
    }
  };

  // 新增：扫描交易机会
  const handleScanOpportunities = async () => {
    setOpportunitiesLoading(true);
    setError(null);
    setOpportunities(null);
    
    try {
      const result = await strategyService.scanTradingOpportunities(
        strategyConfig.chain,
        '6h',
        rsiFilter,
        rsiInterval,
        rsiThreshold
      );
      setOpportunities(result);
    } catch (err) {
      setError(err.message || '交易机会扫描失败');
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  const handleTokenAnalysis = async (token) => {
    setSelectedToken(token);
    setAnalysisLoading(true);
    setTokenAnalysis(null);
    setWalletAnalysis(null);
    setTradingDecision(null);
    
    try {
      const analysis = await strategyService.analyzeTokenStrategy(token.mint || token._id, strategyConfig.chain);
      setTokenAnalysis(analysis);
    } catch (err) {
      setError(err.message || '分析失败');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 新增：获取交易决策分析
  const handleTradingDecision = async () => {
    if (!selectedToken) return;
    
    setDecisionLoading(true);
    setTradingDecision(null);
    
    try {
      const decision = await strategyService.getTradingDecision(selectedToken.mint || selectedToken._id, strategyConfig.chain);
      setTradingDecision(decision);
    } catch (err) {
      setError(err.message || '交易决策分析失败');
    } finally {
      setDecisionLoading(false);
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

  // 新增：渲染优质代币卡片
  const renderQualityTokenCard = (token) => {
    const confidenceColor = token.confidence >= 80 ? '#00b894' : 
                           token.confidence >= 60 ? '#fdcb6e' : 
                           token.confidence >= 40 ? '#e17055' : '#d63031';
    
    return (
      <div key={token.token_mint} className="strategy-token-card quality-card">
        <div className="token-header">
          <div className="token-info">
            <h3>{token.symbol}</h3>
            <p>{token.name}</p>
            <CopyableAddress address={token.token_mint} className="token-address" />
          </div>
          <div className="score-badge" style={{ backgroundColor: confidenceColor }}>
            {token.confidence}%
          </div>
        </div>
        
        <div className="token-metrics">
          <div className="metric">
            <span className="label">决策</span>
            <span className={`value ${token.decision === 'BUY' ? 'positive' : 'neutral'}`}>
              {token.decision === 'BUY' ? '🟢 买入' : token.decision === 'HOLD' ? '🟡 观望' : '🔴 卖出'}
            </span>
          </div>
          <div className="metric">
            <span className="label">持有人数</span>
            <span className="value">{token.holders?.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="label">市值</span>
            <span className="value">${token.market_cap?.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="label">1h交易量</span>
            <span className="value">${token.volume_1h?.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="token-signals">
          <div className="signals-section">
            <h4>✅ 正面信号</h4>
            <ul>
              {token.signals?.slice(0, 3).map((signal, index) => (
                <li key={index}>{signal}</li>
              ))}
            </ul>
          </div>
          {token.warnings?.length > 0 && (
            <div className="warnings-section">
              <h4>⚠️ 风险警告</h4>
              <ul>
                {token.warnings?.slice(0, 2).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
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
              className="trading-decision-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTradingDecision(); }}
              disabled={decisionLoading}
            >
              {decisionLoading ? '🎯 分析中...' : '🎯 交易决策'}
            </button>
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
          {/* 交易决策分析结果 */}
          {tradingDecision && (
            <div className="trading-decision-section">
              <h3>🎯 综合交易决策分析</h3>
              <div className="decision-summary">
                <div className={`decision-badge ${tradingDecision.decision.decision === 'BUY' ? 'buy' : tradingDecision.decision.decision === 'HOLD' ? 'hold' : 'sell'}`}>
                  {tradingDecision.decision.decision === 'BUY' ? '🟢 建议买入' : 
                   tradingDecision.decision.decision === 'HOLD' ? '🟡 建议观望' : '🔴 建议卖出'}
                </div>
                <div className="confidence-score">
                  置信度: {tradingDecision.decision.confidence}%
                </div>
                <div className="risk-level">
                  风险等级: {tradingDecision.decision.risk_level}
                </div>
              </div>
              
              <div className="decision-details">
                <div className="signals-section">
                  <h4>✅ 正面信号</h4>
                  <ul>
                    {tradingDecision.decision.signals?.map((signal, index) => (
                      <li key={index}>{signal}</li>
                    ))}
                  </ul>
                </div>
                
                {tradingDecision.decision.warnings?.length > 0 && (
                  <div className="warnings-section">
                    <h4>⚠️ 风险警告</h4>
                    <ul>
                      {tradingDecision.decision.warnings?.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="recommendations-section">
                  <h4>💡 交易建议</h4>
                  <ul>
                    {tradingDecision.decision.recommendations?.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="analysis-grid">
            <div className="analysis-card">
              <h3>🎯 策略评分</h3>
              <div className="score-breakdown">
                <div className="score-item">
                  <span>总分</span>
                  <span className="score">
                    {(() => {
                      const score = tokenAnalysis?.strategy_score?.total_score;
                      console.log('渲染总分 - 值:', score, '类型:', typeof score);
                      console.log('tokenAnalysis:', tokenAnalysis);
                      console.log('strategy_score:', tokenAnalysis?.strategy_score);
                      
                      // 强制显示，无论什么情况
                      if (score !== undefined && score !== null) {
                        console.log('显示总分:', score);
                        return score;
                      } else {
                        console.log('显示默认值: 0');
                        return '0 (默认)';
                      }
                    })()}
                  </span>
                </div>
                <div className="score-item">
                  <span>持有人数</span>
                  <span className="score">{tokenAnalysis.strategy_score.holders_score || 0}</span>
                  <span className="actual-data">({tokenAnalysis.token_info?.holders?.toLocaleString() || 0})</span>
                </div>
                <div className="score-item">
                  <span>交易量</span>
                  <span className="score">{tokenAnalysis.strategy_score.volume_score || 0}</span>
                  <span className="actual-data">(${tokenAnalysis.token_info?.buyAndSellVolume1h?.toLocaleString() || 0})</span>
                </div>
                <div className="score-item">
                  <span>市值</span>
                  <span className="score">{tokenAnalysis.strategy_score.market_cap_score || 0}</span>
                  <span className="actual-data">(${tokenAnalysis.token_info?.marketCap?.toLocaleString() || 0})</span>
                </div>
                <div className="score-item">
                  <span>蓝筹</span>
                  <span className="score">{tokenAnalysis.strategy_score.blue_chip_score || 0}</span>
                  <span className="actual-data">({tokenAnalysis.token_info?.marketCapChangeRate5m?.toFixed(2) || 0}%)</span>
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
                  <span>社交</span>
                  <span className="score">{tokenAnalysis.strategy_score.social_score || 0}</span>
                </div>
                <div className="score-item">
                  <span>风险</span>
                  <span className="score">{tokenAnalysis.strategy_score.risk_score || 0}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h3>📈 市场数据</h3>
              <div className="market-data">
                <div className="data-item">
                  <span>当前价格</span>
                  <span>${tokenAnalysis.token_info?.tokenPriceUsd?.toFixed(8) || 'N/A'}</span>
                </div>
                <div className="data-item">
                  <span>24h涨跌</span>
                  <span className={tokenAnalysis.token_info?.priceChange24h >= 0 ? 'positive' : 'negative'}>
                    {tokenAnalysis.token_info?.priceChange24h?.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="data-item">
                  <span>1h涨跌</span>
                  <span className={tokenAnalysis.token_info?.priceChange1h >= 0 ? 'positive' : 'negative'}>
                    {tokenAnalysis.token_info?.priceChange1h?.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="data-item">
                  <span>5m涨跌</span>
                  <span className={tokenAnalysis.token_info?.priceChange5m >= 0 ? 'positive' : 'negative'}>
                    {tokenAnalysis.token_info?.priceChange5m?.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="data-item">
                  <span>代币年龄</span>
                  <span>{tokenAnalysis.token_info?.age_hours?.toFixed(1) || 'N/A'} 小时</span>
                </div>
                <div className="data-item">
                  <span>流动性池</span>
                  <span>${tokenAnalysis.token_info?.currencyReserve?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h3>🔗 社交媒体</h3>
              <div className="social-links">
                <span>官方链接:</span>
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
          {/* 新增：RSI 二级筛选 */}
          <div className="config-group">
            <label>RSI过滤:</label>
            <select value={rsiFilter} onChange={(e) => setRsiFilter(e.target.value)}>
              <option value="none">不筛选</option>
              <option value="oversold">超卖(≤阈值)</option>
              <option value="overbought">超买(≥100-阈值)</option>
            </select>
          </div>
          <div className="config-group">
            <label>RSI阈值:</label>
            <select value={rsiThreshold} onChange={(e) => setRsiThreshold(parseInt(e.target.value))}>
              <option value={30}>30</option>
              <option value={35}>35</option>
              <option value={40}>40</option>
            </select>
          </div>
          <div className="config-group">
            <label>K线周期:</label>
            <select value={rsiInterval} onChange={(e) => setRsiInterval(e.target.value)}>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
            </select>
          </div>
        </div>

        <div className="scan-buttons">
          <button className="scan-btn" onClick={handleScan} disabled={loading}>
            {loading ? '🔍 扫描中...' : '🚀 策略扫描'}
          </button>
          <button className="quality-scan-btn" onClick={handleScanQuality} disabled={qualityLoading}>
            {qualityLoading ? '🔍 扫描中...' : '💎 优质代币'}
          </button>
          <button className="opportunities-btn" onClick={handleScanOpportunities} disabled={opportunitiesLoading}>
            {opportunitiesLoading ? '🔍 扫描中...' : '⏰ 交易机会'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* 策略扫描结果 */}
      {scanResults && (
        <div className="scan-results">
          <div className="results-header">
            <h2>📊 策略扫描结果</h2>
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

      {/* 优质代币扫描结果 */}
      {qualityTokens && (
        <div className="scan-results">
          <div className="results-header">
            <h2>💎 优质代币扫描结果</h2>
            <div className="results-stats">
              <span>扫描总数: {qualityTokens.scanned_count}</span>
              <span>优质代币: {qualityTokens.quality_count}</span>
              <span>最低置信度: {qualityTokens.min_confidence}%</span>
            </div>
          </div>
          
          <div className="tokens-grid">
            {qualityTokens.tokens.map(renderQualityTokenCard)}
          </div>
        </div>
      )}

      {/* 交易机会扫描结果 */}
      {opportunities && (
        <div className="scan-results">
          <div className="results-header">
            <h2>⏰ 交易机会扫描结果</h2>
            <div className="results-stats">
              <span>时间筛选: {opportunities.time_filter}</span>
              <span>RSI筛选: {opportunities.rsi_filter}</span>
              <span>机会数量: {opportunities.opportunities_count}</span>
            </div>
          </div>
          
          <div className="tokens-grid">
            {opportunities.opportunities.map(renderQualityTokenCard)}
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