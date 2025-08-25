import React, { useState } from 'react';
import { copyToClipboard, formatAddress } from '../../utils/clipboard';
import '../../utils/clipboard.css';

const CopyableAddress = ({ 
  address, 
  showFull = false, 
  className = '', 
  showCopyButton = true,
  onCopy 
}) => {
  const [copyStatus, setCopyStatus] = useState('');

  const handleCopy = async () => {
    const result = await copyToClipboard(address);
    
    if (result.success) {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(''), 2000);
    } else {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(''), 2000);
    }
    
    if (onCopy) {
      onCopy(result);
    }
  };

  const displayAddress = showFull ? address : formatAddress(address);

  return (
    <div className={`address-container ${className}`}>
      <span className="address-text" title={address}>
        {displayAddress}
      </span>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`copy-btn ${copyStatus}`}
          title="复制地址"
        >
          {copyStatus === 'success' ? '✅' : copyStatus === 'error' ? '❌' : '📋'}
        </button>
      )}
    </div>
  );
};

export default CopyableAddress; 