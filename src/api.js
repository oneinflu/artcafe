const BASE_URL = 'http://localhost:5005/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['x-auth-token'] = token;
  }
  return headers;
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = options.body instanceof FormData ? {} : getHeaders();

  if (options.body instanceof FormData && localStorage.getItem('token')) {
    headers['x-auth-token'] = localStorage.getItem('token');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || 'API Request failed');
  }

  return response.json();
};

export default BASE_URL;
