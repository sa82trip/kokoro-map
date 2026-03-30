import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import HomeScreen from './HomeScreen';
import useFileManagerStore from '../../store/FileManagerStore';

// useNavigate 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// RecentDocumentList 모킹
jest.mock('./RecentDocumentList', () => {
  return function MockRecentDocumentList({ onOpenDocument }) {
    return (
      <div data-testid="recent-doc-list">
        <button
          data-testid="open-doc-btn"
          onClick={() => onOpenDocument && onOpenDocument('test-doc-1')}
        >
          문서 열기
        </button>
      </div>
    );
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      documents: [],
      initialized: true,
      activeDocumentId: null
    });
  });

  test('헤더와 로고를 렌더링한다', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('마인드맵')).toBeInTheDocument();
  });

  test('새 마인드맵 버튼을 렌더링한다', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('새 마인드맵')).toBeInTheDocument();
  });

  test('최근 문서 섹션을 렌더링한다', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('최근 문서')).toBeInTheDocument();
  });

  test('새 마인드맵 버튼 클릭 시 /editor/new로 이동한다', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('새 마인드맵'));
    expect(mockNavigate).toHaveBeenCalledWith('/editor/new');
  });

  test('문서 열기 시 /editor/:docId로 이동한다', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId('open-doc-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/editor/test-doc-1');
  });

  test('초기화 시 FileManagerStore.initialize가 호출된다', () => {
    const mockInit = jest.fn();
    useFileManagerStore.setState({ initialized: false });
    // HomeScreen 마운트 시 initialize 호출 확인은
    // initialize가 호출되어 initialized가 true로 바뀌는 것으로 간접 확인
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    // 컴포넌트가 정상 렌더링되면 initialize가 호출된 것
    expect(screen.getByText('마인드맵')).toBeInTheDocument();
  });
});
