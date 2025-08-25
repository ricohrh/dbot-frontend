// API配置
export const API_BASE_URL = 'http://104.129.23.155:8888/api/data';
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.res || `HTTP ${response.status}`);
  }

  return response.json();
}; 