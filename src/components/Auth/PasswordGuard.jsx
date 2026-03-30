import React, { useState, useEffect, useCallback } from 'react';
import './PasswordGuard.css';

const SESSION_KEY = 'mindmap-auth-session';
const OLD_HASH_KEY = 'mindmap-auth-hash';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCurrentPassword() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `km${hours}${minutes}`;
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const PasswordGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // 기존 방식 데이터 정리
    localStorage.removeItem(OLD_HASH_KEY);
    sessionStorage.removeItem('mindmap-auth-session');
    sessionStorage.removeItem('mindmap-auth-session-hash');

    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      try {
        const { token, tokenHash, expiresAt } = JSON.parse(sessionData);
        if (Date.now() < expiresAt) {
          const computedHash = await sha256(token);
          if (computedHash === tokenHash) {
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      const expected = getCurrentPassword();
      if (password === expected) {
        const token = crypto.randomUUID();
        const tokenHash = await sha256(token);
        const sessionData = {
          token,
          tokenHash,
          expiresAt: Date.now() + SESSION_DURATION,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setIsAuthenticated(true);
      } else {
        setError('비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    },
    [password]
  );

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4A90E2"
              strokeWidth="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="lock-title">비밀번호 입력</h2>
          <p className="lock-subtitle">
            마인드맵에 접근하려면 비밀번호를 입력하세요.
          </p>
          <form onSubmit={handleLogin} className="lock-form">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="lock-input"
              />
            </div>
            <label className="show-password-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              비밀번호 보기
            </label>
            {error && <p className="lock-error">{error}</p>}
            <button type="submit" className="lock-btn">
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};

export default PasswordGuard;
