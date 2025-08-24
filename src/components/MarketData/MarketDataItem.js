import React from 'react';

const MarketDataItem = ({ category, loading, onGetData }) => {
  return (
    <div className="market-item">
      <div className="market-item-content">
        <span className="market-item-name">{category.name}</span>
      </div>
      <div className="market-item-action">
        <button 
          className={`btn-get ${loading ? 'loading' : ''}`}
          onClick={onGetData}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="btn-spinner"></div>
              加载中
            </>
          ) : (
            'GET'
          )}
        </button>
      </div>
    </div>
  );
};

export default MarketDataItem; 