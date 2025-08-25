// 复制到剪贴板的工具函数
export const copyToClipboard = async (text) => {
  try {
    // 使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: '复制成功！' };
    } else {
      // 降级方案：使用传统的 document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (result) {
        return { success: true, message: '复制成功！' };
      } else {
        throw new Error('复制失败');
      }
    }
  } catch (error) {
    console.error('复制失败:', error);
    return { success: false, message: '复制失败，请手动复制' };
  }
};

// 带反馈的复制函数
export const copyWithFeedback = async (text, callback) => {
  const result = await copyToClipboard(text);
  
  if (callback) {
    callback(result);
  }
  
  return result;
};

// 格式化地址显示（显示前6位和后4位）
export const formatAddress = (address, prefix = 6, suffix = 4) => {
  if (!address || address.length < prefix + suffix) {
    return address;
  }
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
};

// 复制按钮组件
export const CopyButton = ({ text, children, className = '', onCopy }) => {
  const handleCopy = async () => {
    const result = await copyToClipboard(text);
    if (onCopy) {
      onCopy(result);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${className}`}
      title="复制地址"
    >
      {children || '📋'}
    </button>
  );
}; 