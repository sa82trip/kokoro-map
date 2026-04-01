import React, { useEffect, useState } from 'react';
import { getCurrentBranchInfo, getDeploymentStatus } from '../utils/GitUtils';
import './FloatingBranchButton.css';

const FloatingBranchButton = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDeployStatus, setShowDeployStatus] = useState(false);

  useEffect(() => {
    // 초기 정보 가져오기
    const updateInfo = () => {
      const info = getCurrentBranchInfo();
      const status = getDeploymentStatus(info);
      setBranchInfo(info);
      setDeploymentStatus(status);
    };

    updateInfo();

    // 5초마다 정보 업데이트
    const interval = setInterval(updateInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!branchInfo || !deploymentStatus) {
    return null;
  }

  // 프로덕션 브랜치는 버튼 표시하지 않음
  if (branchInfo.isMain) {
    return null;
  }

  const getBranchIcon = () => {
    if (branchInfo.isDevelopment) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
      </svg>
    );
  };

  const getBranchColor = () => {
    if (branchInfo.isDevelopment) {
      return '#3b82f6'; // 파란색
    }
    return '#8b5cf6'; // 보라색
  };

  const getStatusText = () => {
    if (branchInfo.isDirty) {
      return '변경된 파일이 있습니다';
    }
    if (branchInfo.remoteExists) {
      return '원격에 업로드됨';
    }
    return '로컬 브랜치';
  };

  return (
    <div className="floating-branch-container">
      {/* 메인 플로팅 버튼 */}
      <div
        className="floating-branch-button"
        style={{ backgroundColor: getBranchColor() }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowDeployStatus(!showDeployStatus)}
      >
        {getBranchIcon()}
        <span className="branch-name">
          {branchInfo.isDevelopment ? 'DEV' : branchInfo.name}
        </span>
        {branchInfo.isDirty && (
          <span className="dirty-indicator">●</span>
        )}
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <div className="branch-tooltip">
          <div className="tooltip-header">
            <strong>{branchInfo.name}</strong>
            <span className="commit-hash">{branchInfo.commitHash}</span>
          </div>
          <div className="tooltip-body">
            <p>{getStatusText()}</p>
            {branchInfo.hasChanges && (
              <p className="changes-text">Uncommitted changes</p>
            )}
          </div>
        </div>
      )}

      {/* 배포 상태 패널 */}
      {showDeployStatus && (
        <div className="deploy-status-panel">
          <div className="panel-header">
            <h3>브랜치 상태</h3>
            <button
              className="close-btn"
              onClick={() => setShowDeployStatus(false)}
            >
              ✕
            </button>
          </div>

          <div className="branch-info">
            <div className="info-item">
              <span className="label">브랜치:</span>
              <span className="value">{branchInfo.name}</span>
            </div>
            <div className="info-item">
              <span className="label">커밋:</span>
              <span className="value">{branchInfo.commitHash}</span>
            </div>
            <div className="info-item">
              <span className="label">상태:</span>
              <span className={`value ${branchInfo.isDirty ? 'dirty' : 'clean'}`}>
                {branchInfo.isDirty ? '수정 중' : '동기화됨'}
              </span>
            </div>
          </div>

          <div className="deploy-info">
            <div className="deploy-item">
              <span className="label">배포 유형:</span>
              <span className={`value ${deploymentStatus.status}`}>
                {deploymentStatus.label}
              </span>
            </div>
            <div className="deploy-item">
              <span className="label">배포 URL:</span>
              <a
                href={deploymentStatus.url}
                target="_blank"
                rel="noopener noreferrer"
                className="deploy-link"
              >
                {deploymentStatus.url}
              </a>
            </div>
          </div>

          <div className="actions">
            <button
              className="copy-url-btn"
              onClick={() => navigator.clipboard.writeText(deploymentStatus.url)}
            >
              URL 복사
            </button>
            {branchInfo.isDevelopment && (
              <button className="deploy-btn">
                배포하기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingBranchButton;