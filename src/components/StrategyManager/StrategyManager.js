import React, { useState } from 'react';
import StrategyCard from './StrategyCard';
import './StrategyManager.css';

const StrategyManager = () => {
  const [strategies] = useState([
    {
      id: 1,
      name: 'Meme币追踪策略',
      type: '追踪',
      status: '运行中',
      profit: '+15.2%',
      balance: '2,450 USDT',
      coins: ['PEPE', 'DOGE', 'SHIB'],
      description: '自动追踪热门Meme币，快速买入卖出'
    },
    {
      id: 2,
      name: '网格交易策略',
      type: '网格',
      status: '暂停',
      profit: '+8.7%',
      balance: '1,200 USDT',
      coins: ['BTC', 'ETH'],
      description: '在价格区间内进行网格交易'
    },
    {
      id: 3,
      name: '趋势跟随策略',
      type: '趋势',
      status: '运行中',
      profit: '+22.1%',
      balance: '3,100 USDT',
      coins: ['SOL', 'AVAX', 'MATIC'],
      description: '跟随市场趋势进行交易'
    }
  ]);

  return (
    <div className="strategy-management">
      <div className="section-header">
        <h2>📊 策略管理</h2>
        <div className="header-actions">
          <button className="btn btn-primary">
            ➕ 创建策略
          </button>
          <button className="btn btn-outline">
            📈 策略分析
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>总收益</h3>
            <p className="stat-value positive">+46.0%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>总资金</h3>
            <p className="stat-value">6,750 USDT</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>运行策略</h3>
            <p className="stat-value">2/3</p>
          </div>
        </div>
      </div>

      <div className="strategy-grid">
        {strategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  );
};

export default StrategyManager; 