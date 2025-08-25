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

    // 兼容 0 值显示
    const communityCount = analysis.community_count ?? 0;
    const influenceScore = analysis.influence_score ?? 0;
    const attentionLevel = analysis.attention_level || '未知';

    const signalCount = signalAnalysis.signal_count ?? 0;
    const activityScore = signalAnalysis.activity_score ?? 0;
    const activityLevel = signalAnalysis.activity_level || '未知';

    const kolMention = kolAnalysis.mention_count ?? 0;
    const kolInfluence = kolAnalysis.influence_score ?? 0;
    
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
              <span className="value">{communityCount}</span>
              <span className="label">关注社群数</span>
            </div>
            <div className="metric">
              <span className="value">{influenceScore}</span>
              <span className="label">影响力评分</span>
            </div>
            <div className="metric">
              <span className="value">{attentionLevel}</span>
              <span className="label">关注等级</span>
            </div>
          </div>

          <div className="analysis-card">
            <h4>信号活跃度</h4>
            <div className="metric">
              <span className="value">{signalCount}</span>
              <span className="label">信号数量</span>
            </div>
            <div className="metric">
              <span className="value">{activityScore}</span>
              <span className="label">活跃度评分</span>
            </div>
            <div className="metric">
              <span className="value">{activityLevel}</span>
              <span className="label">活跃等级</span>
            </div>
          </div>

          <div className="analysis-card">
            <h4>KOL影响力</h4>
            <div className="metric">
              <span className="value">{kolMention}</span>
              <span className="label">提及用户数</span>
            </div>
            <div className="metric">
              <span className="value">{kolInfluence}</span>
              <span className="label">影响力评分</span>
            </div>
          </div>
        </div>

        {analysisData.investment_score && (
          <div className="investment-score">
            <h4>💡 投资评分</h4>
            <div className="score-display">
              <span className="score">{analysisData.investment_score.overall || analysisData.investment_score.overall_score || 0}</span>
              <span className="score-label">/ 100</span>
            </div>
            {analysisData.investment_score.score_breakdown && (
              <div className="dev-tokens-list">
                <h4>评分构成</h4>
                <div className="dev-tokens-grid">
                  {Object.entries(analysisData.investment_score.score_breakdown).map(([k,v], idx) => (
                    <div key={idx} className="dev-token-item">
                      <div className="token-symbol">{k}</div>
                      <div className="token-name">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysisData.market_heat && (
          <div className="dev-tokens-list">
            <h4>🔥 市场热度</h4>
            <div className="dev-tokens-grid">
              <div className="dev-token-item">
                <div className="token-symbol">热度等级</div>
                <div className="token-name">{analysisData.market_heat.heat_level || '未知'}</div>
              </div>
              <div className="dev-token-item">
                <div className="token-symbol">热度分数</div>
                <div className="token-name">{analysisData.market_heat.heat_score ?? 0}</div>
              </div>
              <div className="dev-token-item">
                <div className="token-symbol">建议</div>
                <div className="token-name">{analysisData.market_heat.recommendation || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 社群清单 */}
        {analysis.communities && analysis.communities.length > 0 && (
          <div className="dev-tokens-list">
            <h4>📋 社群列表</h4>
            <div className="dev-tokens-grid">
              {analysis.communities.slice(0, 12).map((c, i) => (
                <div key={i} className="dev-token-item">
                  <div className="token-symbol">{c.groupName || c.kolName || 'Community'}</div>
                  <div className="token-name">{c.kolTwitterId || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RawBlock title="原始数据 (community)" obj={data} />
      </div>
    );
  };

  const renderKOLAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const kolData = data.analysis || data.data || {};

    // 映射后端结构到前端展示
    const mentionUserCount = kolData.basic_stats?.total_kols ?? kolData.mentionUserCount ?? 0;
    const holdingStability = kolData.investment_score?.scores?.holding_stability ?? 0;
    const signalStrength = kolData.investment_score?.scores?.signal_strength ?? 0;
    const rating = kolData.investment_score?.rating || kolData.investment_score?.investment_signal || 'N/A';
    const kolCalls = kolData.kolCalls || kolData.investment_signals?.signals || [];
    
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
              <span className="value">{mentionUserCount}</span>
              <span className="label">提及用户数</span>
            </div>
            <div className="metric">
              <span className="value">{holdingStability}</span>
              <span className="label">持仓稳定性</span>
            </div>
            <div className="metric">
              <span className="value">{signalStrength}</span>
              <span className="label">信号强度</span>
            </div>
          </div>

          <div className="analysis-card">
            <h4>评级</h4>
            <div className="metric">
              <span className="value">{rating}</span>
              <span className="label">投资建议/评级</span>
            </div>
          </div>
        </div>

        {kolCalls && kolCalls.length > 0 && (
          <div className="dev-tokens-list">
            <h4>📋 KOL信号</h4>
            <div className="dev-tokens-grid">
              {kolCalls.slice(0, 8).map((sig, index) => (
                <div key={index} className="dev-token-item">
                  <div className="token-symbol">{sig.symbol || sig.type || 'N/A'}</div>
                  <div className="token-name">{sig.name || sig.description || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {kolData.investment_score && (
          <div className="dev-tokens-list">
            <h4>📈 投资评分</h4>
            <div className="dev-tokens-grid">
              <div className="dev-token-item">
                <div className="token-symbol">综合</div>
                <div className="token-name">{kolData.investment_score.overall || kolData.investment_score.overall_score || 0}</div>
              </div>
              <div className="dev-token-item">
                <div className="token-symbol">评级</div>
                <div className="token-name">{kolData.investment_score.rating || kolData.investment_score.investment_signal || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* KOL行为分类 */}
        {kolData.kol_behavior?.categories && (
          <div className="dev-tokens-list">
            <h4>🧭 KOL 行为分类</h4>
            <div className="dev-tokens-grid">
              {Object.entries(kolData.kol_behavior.categories).map(([cat, arr], idx) => (
                <div key={idx} className="dev-token-item">
                  <div className="token-symbol">{cat}</div>
                  <div className="token-name">{Array.isArray(arr) ? arr.length : 0} 人</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RawBlock title="原始数据 (kol)" obj={data} />
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
    
    // 后端返回的数据结构：优先 analysis，再退回 data
    const telegramData = data.analysis || data.data || {};

    // 字段兼容映射
    const channelCount = telegramData.groups?.total_groups ?? telegramData.channelCount ?? 0;
    const messageCount = telegramData.activity?.monthly_messages ?? telegramData.activity?.weekly_messages ?? telegramData.messageCount ?? 0;
    const userCount = telegramData.groups?.member_statistics?.total_members ?? telegramData.userCount ?? 0;
    
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
              <span className="value">{channelCount}</span>
              <span className="label">频道数量</span>
            </div>
            <div className="metric">
              <span className="value">{messageCount}</span>
              <span className="label">消息数量</span>
            </div>
            <div className="metric">
              <span className="value">{userCount}</span>
              <span className="label">用户数量</span>
            </div>
          </div>
        </div>

        {/* 群组清单 */}
        {telegramData.groups?.group_details && telegramData.groups.group_details.length > 0 && (
          <div className="dev-tokens-list">
            <h4>📋 群组调用列表</h4>
            <div className="dev-tokens-grid">
              {telegramData.groups.group_details.slice(0, 12).map((g, i) => (
                <div key={i} className="dev-token-item">
                  <div className="token-symbol">{g.name || 'Group'}</div>
                  <div className="token-name">{g.link || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RawBlock title="原始数据 (telegram)" obj={data} />
      </div>
    );
  };

  const renderNarrativeAnalysis = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 新后端结构：code=0, data: { narrative, source, symbol }
    const fromData = data.data && (data.data.narrative || data.data.symbol)
      ? { narrative: data.data.narrative, source: data.data.source, symbol: data.data.symbol }
      : null;
    const narrativeData = fromData || data.analysis || {};
    const narrativeText = narrativeData.narrative || '暂无叙事';
    const narrativeSymbol = narrativeData.symbol || '';
    
    return (
      <div className="analysis-content">
        <div className="analysis-header">
          <h3>📖 叙事分析结果</h3>
          <CopyableAddress address={tokenAddress} className="token-address" />
        </div>
        
        <div className="analysis-grid">
          <div className="analysis-card" style={{ gridColumn: '1 / -1' }}>
            <h4>叙事内容{narrativeSymbol ? `（${narrativeSymbol}）` : ''}</h4>
            <div className="metric">
              <span className="value" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{narrativeText}</span>
              <span className="label">来源：{narrativeData.source || 'self-ai'}</span>
            </div>
          </div>
        </div>
        <RawBlock title="原始数据 (narrative)" obj={data} />
      </div>
    );
  };

  const renderDevTokens = (data) => {
    if (!data || data.error) return <div className="error-message">暂无数据</div>;
    
    // 后端返回的数据结构：data.data 或 data.analysis
    const devData = data.data || data.analysis || {};
    const devTokensCount = devData.dev_tokens_count || 0;
    const devTokensList = devData.dev_tokens || [];

    // 从 raw 读取历史发盘
    const devHistories = data.raw?.data?.data?.dev_histories || [];
    const balance = data.raw?.data?.data?.balance;
    const devAddress = data.raw?.data?.data?.dev_ca;
    
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
              <span className="value">{devTokensCount}</span>
              <span className="label">代币数量</span>
            </div>
          </div>
          {devAddress && (
            <div className="analysis-card">
              <h4>开发者信息</h4>
              <div className="metric">
                <span className="value">{(balance ?? 0).toLocaleString()}</span>
                <span className="label">余额 (SOL)</span>
              </div>
              <div className="metric">
                <span className="value"><CopyableAddress address={devAddress} /></span>
                <span className="label">开发者地址</span>
              </div>
            </div>
          )}
        </div>

        {devTokensList.length > 0 && (
          <div className="dev-tokens-list">
            <h4>📋 开发者代币列表</h4>
            <div className="dev-tokens-grid">
              {devTokensList.slice(0, 10).map((token, index) => (
                <div key={index} className="dev-token-item">
                  <div className="token-symbol">{token.symbol || 'N/A'}</div>
                  <div className="token-name">{token.name || 'N/A'}</div>
                  <CopyableAddress address={token.address} className="token-address-small" />
                </div>
              ))}
            </div>
          </div>
        )}

        {devHistories.length > 0 && (
          <div className="dev-tokens-list">
            <h4>🕘 历史发盘</h4>
            <div className="dev-tokens-grid">
              {devHistories.slice(0, 12).map((h, i) => (
                <div key={i} className="dev-token-item">
                  <div className="token-symbol">{h.symbol || '—'}</div>
                  <div className="token-name">{h.name || '—'}</div>
                  <CopyableAddress address={h.address} className="token-address-small" />
                </div>
              ))}
            </div>
          </div>
        )}

        {devTokensCount === 0 && devHistories.length === 0 && (
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <h4>暂无开发者代币数据</h4>
            <p>该代币地址在ChainInsight中未找到相关的开发者代币信息</p>
          </div>
        )}

        <RawBlock title="原始数据 (dev)" obj={data} />
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

  const RawBlock = ({ title, obj }) => {
    const [open, setOpen] = useState(false);
    if (!obj) return null;
    return (
      <div className="dev-tokens-list">
        <h4 onClick={() => setOpen(!open)} style={{cursor:'pointer'}}>{open ? '▼' : '▶'} {title}</h4>
        {open && (
          <pre style={{whiteSpace:'pre-wrap', wordBreak:'break-word', background:'rgba(255,255,255,0.05)', padding:12, borderRadius:8}}>
            {JSON.stringify(obj, null, 2)}
          </pre>
        )}
      </div>
    );
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
                {(() => {
                  const d = analysisData[type.id];
                  const hasContent = !!(d && (d.analysis || d.data));
                  return hasContent && !loading[type.id] && !error[type.id] ? (
                    <div className="success-icon-small">✅</div>
                  ) : null;
                })()}
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