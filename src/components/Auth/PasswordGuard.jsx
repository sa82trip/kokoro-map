import React, { useState, useEffect, useCallback } from 'react';
import './PasswordGuard.css';

const STORAGE_KEY = 'mindmap-auth-hash';
const SESSION_KEY = 'mindmap-auth-session';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionToken() {
  return crypto.randomUUID();
}

const PasswordGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedHash = localStorage.getItem(STORAGE_KEY);
    const session = sessionStorage.getItem(SESSION_KEY);

    if (!storedHash) {
      setNeedsSetup(true);
      setLoading(false);
      return;
    }

    if (session) {
      const hash = await sha256(session);
      const storedSessionHash = sessionStorage.getItem(SESSION_KEY + '-hash');
      if (hash === storedSessionHash) {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  };

  const handleSetup = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (password.length < 4) {
        setError('비밀번호는 4자 이상이어야 합니다.');
        return;
      }
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      const hash = await sha256(password);
      localStorage.setItem(STORAGE_KEY, hash);

      const token = generateSessionToken();
      const tokenHash = await sha256(token);
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(SESSION_KEY + '-hash', tokenHash);

      setIsAuthenticated(true);
    },
    [password, confirmPassword]
  );

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      const hash = await sha256(password);
      const storedHash = localStorage.getItem(STORAGE_KEY);

      if (hash === storedHash) {
        const token = generateSessionToken();
        const tokenHash = await sha256(token);
        sessionStorage.setItem(SESSION_KEY, token);
        sessionStorage.setItem(SESSION_KEY + '-hash', tokenHash);
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

          {needsSetup ? (
            <>
              <h2 className="lock-title">비밀번호 설정</h2>
              <p className="lock-subtitle">
                처음 방문입니다. 비밀번호를 설정하세요.
              </p>
              <form onSubmit={handleSetup} className="lock-form">
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="lock-input"
                  />
                </div>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  설정 완료
                </button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  }

  return children;
};

export default PasswordGuard;
