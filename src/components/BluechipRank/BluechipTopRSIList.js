import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import './BluechipRank.css';

const BluechipTopRSIList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [limit, setLimit] = useState(20);
  const [period, setPeriod] = useState(14);
  const [resolution, setResolution] = useState('1m');
  const [klineLimit, setKlineLimit] = useState(120);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        period: String(period),
        resolution,
        kline_limit: String(klineLimit)
      }).toString();
      const res = await apiRequest(`/bluechip/top-rsi?${params}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bluechip-rank">
      <div className="section-header">
        <h2>🏆 蓝筹RSI榜</h2>
        <div className="header-actions">
          <div className="filters">
            <label>
              Limit
              <input type="number" min={1} max={100} value={limit} onChange={e => setLimit(Number(e.target.value))} />
            </label>
            <label>
              Period
              <input type="number" min={2} max={50} value={period} onChange={e => setPeriod(Number(e.target.value))} />
            </label>
            <label>
              Resolution
              <select value={resolution} onChange={e => setResolution(e.target.value)}>
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
              </select>
            </label>
            <label>
              Kline Limit
              <input type="number" min={30} max={504} value={klineLimit} onChange={e => setKlineLimit(Number(e.target.value))} />
            </label>
            <button className="btn btn-primary" onClick={fetchData} disabled={loading}>刷新</button>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">加载中...</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>代币</th>
                <th>地址</th>
                <th>当前价</th>
                <th>RSI</th>
                <th>数据点</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.address + idx}>
                  <td>{idx + 1}</td>
                  <td>{it.symbol || '-'}</td>
                  <td>
                    <span className="mono">{it.address}</span>
                  </td>
                  <td>{it.current_price != null ? Number(it.current_price).toFixed(8) : '-'}</td>
                  <td>{it.current_rsi != null ? it.current_rsi : '-'}</td>
                  <td>{it.data_points || '-'}</td>
                  <td className={it.success ? 'positive' : 'negative'}>
                    {it.success ? 'OK' : (it.message || 'FAIL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BluechipTopRSIList;
