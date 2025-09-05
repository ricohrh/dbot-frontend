import React, { useState, useEffect } from 'react';
import './KlineData.css';

const KlineData = () => {
  const [klineData, setKlineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenAddress, setTokenAddress] = useState('Dp8fc49A73C1ycnTzRet8oEWNRSpUymqcCbYsse5pump');
  const [consoleOutput, setConsoleOutput] = useState('');

  // 获取K线数据
  const fetchKlineData = async () => {
    try {
      setLoading(true);
      setError(null);
      setConsoleOutput('开始请求K线数据...\n');
      
      const url = `https://gmgn.ai/api/v1/token_candles/sol/${tokenAddress}?tz_offset=28800&resolution=1m&from=0&to=1756858560000&limit=504`;
      
      setConsoleOutput(prev => prev + `请求URL: ${url}\n`);
      
      const response = await fetch(url);
      setConsoleOutput(prev => prev + `响应状态: ${response.status} ${response.statusText}\n`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConsoleOutput(prev => prev + `数据获取成功，数据长度: ${JSON.stringify(data).length} 字符\n`);
      
      console.log('K线数据:', data);
      setKlineData(data);
      
      // 分析数据
      if (data && data.data) {
        analyzeKlineData(data.data);
      }
      
    } catch (err) {
      const errorMsg = `获取K线数据失败: ${err.message}`;
      setError(errorMsg);
      setConsoleOutput(prev => prev + `错误: ${errorMsg}\n`);
      console.error('K线数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 分析K线数据
  const analyzeKlineData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      setConsoleOutput(prev => prev + '数据为空或格式不正确\n');
      return;
    }

    setConsoleOutput(prev => prev + `开始分析 ${data.length} 条K线数据...\n`);

    // 价格统计
    const prices = data.map(item => parseFloat(item.close || 0)).filter(price => price > 0);
    const volumes = data.map(item => parseFloat(item.volume || 0)).filter(vol => vol > 0);
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      setConsoleOutput(prev => prev + 
        `价格统计:\n` +
        `  最低价: ${minPrice}\n` +
        `  最高价: ${maxPrice}\n` +
        `  平均价: ${avgPrice.toFixed(6)}\n` +
        `  价格数量: ${prices.length}\n`
      );
    }

    if (volumes.length > 0) {
      const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
      const avgVolume = totalVolume / volumes.length;
      
      setConsoleOutput(prev => prev + 
        `交易量统计:\n` +
        `  总交易量: ${totalVolume.toFixed(2)}\n` +
        `  平均交易量: ${avgVolume.toFixed(2)}\n` +
        `  有交易量的K线数量: ${volumes.length}\n`
      );
    }

    // 时间范围
    if (data.length > 0) {
      const firstTime = new Date(data[0].timestamp * 1000);
      const lastTime = new Date(data[data.length - 1].timestamp * 1000);
      
      setConsoleOutput(prev => prev + 
        `时间范围:\n` +
        `  开始时间: ${firstTime.toLocaleString()}\n` +
        `  结束时间: ${lastTime.toLocaleString()}\n` +
        `  时间跨度: ${((lastTime - firstTime) / (1000 * 60 * 60)).toFixed(2)} 小时\n`
      );
    }

    setConsoleOutput(prev => prev + '数据分析完成\n');
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    const n = parseFloat(num);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(6);
  };

  // 格式化价格
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const p = parseFloat(price);
    if (p < 0.0001) return `$${p.toExponential(2)}`;
    if (p < 0.01) return `$${p.toFixed(6)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(2)}`;
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  useEffect(() => {
    // 页面加载时自动获取数据
    fetchKlineData();
  }, []);

  return (
    <div className="kline-data">
      <div className="header">
        <h1>📊 K线数据测试</h1>
        <div className="controls">
          <input
            type="text"
            className="token-input"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="输入代币地址"
          />
          <button 
            className="refresh-btn" 
            onClick={fetchKlineData}
            disabled={loading}
          >
            {loading ? '🔄 获取中...' : '🔄 获取数据'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>正在获取K线数据...</p>
        </div>
      )}

      {error && (
        <div className="error-section">
          <p className="error-message">❌ {error}</p>
          <button onClick={fetchKlineData} className="retry-btn">重试</button>
        </div>
      )}

      {klineData && (
        <div className="data-content">
          {/* 数据概览 */}
          <div className="data-overview">
            <h3>📈 数据概览</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <span className="label">数据状态:</span>
                <span className="value">✅ 成功</span>
              </div>
              <div className="overview-item">
                <span className="label">代币地址:</span>
                <span className="value">{tokenAddress}</span>
              </div>
              <div className="overview-item">
                <span className="label">数据长度:</span>
                <span className="value">{klineData.data ? klineData.data.length : 0} 条</span>
              </div>
              <div className="overview-item">
                <span className="label">请求时间:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 最新数据 */}
          {klineData.data && klineData.data.length > 0 && (
            <div className="latest-data">
              <h3>🕒 最新K线数据</h3>
              <div className="data-card">
                <div className="data-row">
                  <span className="label">时间:</span>
                  <span className="value">{formatTime(klineData.data[klineData.data.length - 1].timestamp)}</span>
                </div>
                <div className="data-row">
                  <span className="label">开盘价:</span>
                  <span className="value">{formatPrice(klineData.data[klineData.data.length - 1].open)}</span>
                </div>
                <div className="data-row">
                  <span className="label">最高价:</span>
                  <span className="value">{formatPrice(klineData.data[klineData.data.length - 1].high)}</span>
                </div>
                <div className="data-row">
                  <span className="label">最低价:</span>
                  <span className="value">{formatPrice(klineData.data[klineData.data.length - 1].low)}</span>
                </div>
                <div className="data-row">
                  <span className="label">收盘价:</span>
                  <span className="value">{formatPrice(klineData.data[klineData.data.length - 1].close)}</span>
                </div>
                <div className="data-row">
                  <span className="label">交易量:</span>
                  <span className="value">{formatNumber(klineData.data[klineData.data.length - 1].volume)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 价格统计 */}
          {klineData.data && klineData.data.length > 0 && (
            <div className="price-stats">
              <h3>💰 价格统计</h3>
              <div className="stats-grid">
                {(() => {
                  const prices = klineData.data.map(item => parseFloat(item.close || 0)).filter(price => price > 0);
                  const volumes = klineData.data.map(item => parseFloat(item.volume || 0)).filter(vol => vol > 0);
                  
                  if (prices.length === 0) return <div>暂无价格数据</div>;
                  
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                  const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
                  
                  return (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{formatPrice(minPrice)}</div>
                        <div className="stat-label">最低价</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{formatPrice(maxPrice)}</div>
                        <div className="stat-label">最高价</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{formatPrice(avgPrice)}</div>
                        <div className="stat-label">平均价</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{formatNumber(totalVolume)}</div>
                        <div className="stat-label">总交易量</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 原始数据表格 */}
          {klineData.data && klineData.data.length > 0 && (
            <div className="raw-data">
              <h3>📋 原始数据 (前10条)</h3>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>开盘价</th>
                      <th>最高价</th>
                      <th>最低价</th>
                      <th>收盘价</th>
                      <th>交易量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {klineData.data.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{formatTime(item.timestamp)}</td>
                        <td>{formatPrice(item.open)}</td>
                        <td>{formatPrice(item.high)}</td>
                        <td>{formatPrice(item.low)}</td>
                        <td>{formatPrice(item.close)}</td>
                        <td>{formatNumber(item.volume)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 控制台输出 */}
          <div className="console-output">
            <h3>🖥️ 控制台输出</h3>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '6px', 
              textAlign: 'left',
              maxHeight: '300px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontSize: '12px'
            }}>
              {consoleOutput || '暂无输出'}
            </pre>
            <button 
              className="console-btn" 
              onClick={() => setConsoleOutput('')}
            >
              清空输出
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KlineData;
