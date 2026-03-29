#!/bin/bash

# 태스크 파일들 생성 스크립트

tasks=(
    "01-center-node-component:중심 노드 컴포넌트 개발"
    "02-node-text-editing:중심 노드 텍스트 편집 기능 구현"
    "03-basic-layout-system:기본 레이아웃 시스템 구축"
    "04-new-mindmap-button:새로운 마인드맵 생성 버튼 구현"
    "05-mindmap-title:마인드맵 제목 설정 기능"
    "06-state-management:기본적인 상태 저장/로드 기능"
)

# tasks 디렉토리 생성
mkdir -p tasks

# 각 태스크 파일 생성
for task in "${tasks[@]}"; do
    id=$(echo $task | cut -d: -f1)
    title=$(echo $task | cut -d: -f2)
    
    cat > tasks/$id.md << TASK_EOF
# 태스크 $id: $title

## 상세 설명
$title에 대한 상세 구현 사항입니다.

### 구현 사항
- [ ] 핵심 기능 1
- [ ] 핵심 기능 2
- [ ] 보조 기능 1
- [ ] 보조 기능 2

### 기술 요구사항
- [ ] 라이브러리/프레임워크
- [ ] API 연동
- [ ] 데이터 모델
- [ ] 성능 요구사항

### 의존성
- [ ] [다른 태스크 ID]
- [ ] [라이브러리/패키지]

### 테스트 항목
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] UI 테스트

### 참고 자료
- [ ] [관련 문서 링크]
- [ ] [디자인 시안 링크]

## 작업 진행
- [ ] 설계 완료
- [ ] 개발 중
- [ ] 코드 리뷰 대기
- [ ] 테스트 완료
- [ ] 완료

## 작업자
- [ ]

## 작업 기간
- 시작일: [YYYY-MM-DD]
- 완료일: [YYYY-MM-DD]
TASK_EOF
    
    echo "Created: tasks/$id.md"
done

echo "모든 태스크 파일 생성 완료!"
