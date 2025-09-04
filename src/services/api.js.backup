// API配置
export const API_BASE_URL = 'https://api.ricohrhptop.top/api';
export const API_KEY = 'hwxwzxlpdc6whlt9uwaipnp6jxpdfabw';

// 通用API请求函数
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.error || data?.success === false) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data;
}; 