import { execSync } from 'child_process';

/**
 * 현재 Git 브랜치 정보를 가져옵니다
 * @returns {Object} 브랜치 정보
 */
export const getCurrentBranchInfo = () => {
  try {
    // 현재 브랜치 이름 가져오기
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    // 로컬 브랜치 목록 가져오기
    const localBranches = execSync('git branch --list', { encoding: 'utf8' })
      .split('\n')
      .filter(branch => branch.trim())
      .map(branch => branch.trim().replace(/^\*?\s*/, ''));

    // 리모트 브랜치 확인
    const hasRemote = execSync('git ls-remote --heads origin', { encoding: 'utf8' })
      .split('\n')
      .some(line => line.includes(branchName));

    // 마지막 커밋 해시 가져오기
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

    // 변경된 파일이 있는지 확인
    const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;

    // 대기 중인 커밋이 있는지 확인
    const hasStagedChanges = execSync('git diff --staged --name-only', { encoding: 'utf8' }).trim().length > 0;

    return {
      name: branchName,
      isMain: branchName === 'main',
      isDevelopment: branchName === 'development',
      isProduction: branchName === 'main',
      isFeatureBranch: !['main', 'development'].includes(branchName),
      localExists: localBranches.includes(branchName),
      remoteExists: hasRemote,
      commitHash,
      hasChanges,
      hasStagedChanges,
      isDirty: hasChanges || hasStagedChanges
    };
  } catch (error) {
    console.error('Git 정보를 가져오는 중 오류 발생:', error);
    return {
      name: 'unknown',
      isMain: false,
      isDevelopment: false,
      isProduction: false,
      isFeatureBranch: false,
      localExists: false,
      remoteExists: false,
      commitHash: '',
      hasChanges: false,
      hasStagedChanges: false,
      isDirty: false,
      error: error.message
    };
  }
};

/**
 * 브랜치별 배포 상태를 반환합니다
 * @param {Object} branchInfo - 브랜치 정보
 * @returns {Object} 배포 정보
 */
export const getDeploymentStatus = (branchInfo) => {
  const isDeployable = branchInfo.isMain || branchInfo.isDevelopment;

  return {
    canDeploy: isDeployable,
    deploymentType: branchInfo.isMain ? 'production' : 'preview',
    url: branchInfo.isMain
      ? 'https://j2y7knmi.vercel.app'
      : `https://j2y7knmi-git-${branchInfo.name.replace(/[^a-zA-Z0-9-]/g, '-')}-${branchInfo.commitHash}.vercel.app`,
    status: branchInfo.isMain ? 'production' : 'preview',
    color: branchInfo.isMain ? '#22c55e' : '#3b82f6',
    label: branchInfo.isMain ? 'Production' : 'Preview'
  };
};