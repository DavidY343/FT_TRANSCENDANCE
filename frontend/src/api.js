import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 12000,
});

function readToken(key) {
  const tabValue = sessionStorage.getItem(key);
  if (tabValue) {
    return tabValue;
  }

  // Backward compatibility with older builds that used localStorage.
  const legacyValue = localStorage.getItem(key);
  if (legacyValue) {
    sessionStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return '';
}

export function getAccessToken() {
  return readToken('access_token');
}

export function getRefreshToken() {
  return readToken('refresh_token');
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setTokens(accessToken, refreshToken) {
  sessionStorage.setItem('access_token', accessToken);
  sessionStorage.setItem('refresh_token', refreshToken);
  // Ensure old shared storage does not keep overriding sessions across tabs.
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function clearTokens() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

function detailToMessage(detail) {
  if (!detail) {
    return null;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === 'string') {
      return first;
    }

    if (first && typeof first === 'object') {
      if (typeof first.msg === 'string') {
        return first.msg;
      }
      return JSON.stringify(first);
    }

    return JSON.stringify(detail);
  }

  if (typeof detail === 'object') {
    if (typeof detail.message === 'string') {
      return detail.message;
    }
    return JSON.stringify(detail);
  }

  return String(detail);
}

export function getApiErrorMessage(err, fallback = 'Request failed') {
  const message = detailToMessage(err?.response?.data?.detail);
  return message || fallback;
}
