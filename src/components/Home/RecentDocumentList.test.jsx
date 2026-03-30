import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentDocumentList from './RecentDocumentList';
import useFileManagerStore from '../../store/FileManagerStore';

jest.mock('../../utils/StorageManager', () => ({
  StorageManager: {
    loadIndex: jest.fn(),
    saveIndex: jest.fn(),
    loadDocument: jest.fn(),
    saveDocument: jest.fn(),
    deleteDocument: jest.fn(),
    loadLegacyData: jest.fn(),
    clearLegacyData: jest.fn(),
    hasLegacyData: jest.fn(),
    hasIndex: jest.fn()
  }
}));

// DocumentCard 모킹
jest.mock('./DocumentCard', () => {
  return function MockDocumentCard({ document, onClick, onDelete, highlight }) {
    return (
      <div
        data-testid={`doc-card-${document.id}`}
        onClick={() => onClick(document.id)}
      >
        <span>{document.title}</span>
        {highlight && <span data-testid="highlight-active">{highlight}</span>}
        <button
          data-testid={`delete-${document.id}`}
          onClick={(e) => { e.stopPropagation(); onDelete(document.id); }}
        >
          삭제
        </button>
      </div>
    );
  };
});

describe('RecentDocumentList', () => {
  const mockDocuments = [
    {
      id: 'doc-1',
      title: '첫 번째 마인드맵',
      folderId: null,
      createdAt: '2026-03-28T10:00:00.000Z',
      updatedAt: '2026-03-30T10:00:00.000Z',
      nodeCount: 5,
      thumbnail: null
    },
    {
      id: 'doc-2',
      title: '두 번째 마인드맵',
      folderId: null,
      createdAt: '2026-03-29T10:00:00.000Z',
      updatedAt: '2026-03-29T15:00:00.000Z',
      nodeCount: 3,
      thumbnail: null
    },
    {
      id: 'doc-3',
      title: '세 번째 마인드맵',
      folderId: null,
      createdAt: '2026-03-25T10:00:00.000Z',
      updatedAt: '2026-03-25T15:00:00.000Z',
      nodeCount: 8,
      thumbnail: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      documents: mockDocuments,
      initialized: true,
      activeDocumentId: null,
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'recent',
      searchInContent: false
    });
  });

  test('문서 카드를 렌더링한다', () => {
    render(<RecentDocumentList />);
    expect(screen.getByTestId('doc-card-doc-1')).toBeInTheDocument();
    expect(screen.getByTestId('doc-card-doc-2')).toBeInTheDocument();
    expect(screen.getByTestId('doc-card-doc-3')).toBeInTheDocument();
  });

  test('최근 수정순으로 정렬된다', () => {
    render(<RecentDocumentList />);
    const cards = screen.getAllByTestId(/^doc-card-/);
    expect(cards[0]).toHaveAttribute('data-testid', 'doc-card-doc-1');
    expect(cards[1]).toHaveAttribute('data-testid', 'doc-card-doc-2');
    expect(cards[2]).toHaveAttribute('data-testid', 'doc-card-doc-3');
  });

  test('문서가 없으면 빈 상태 메시지를 표시한다', () => {
    useFileManagerStore.setState({ documents: [] });
    render(<RecentDocumentList />);
    expect(screen.getByText('아직 생성된 마인드맵이 없습니다')).toBeInTheDocument();
  });

  test('카드 클릭 시 onOpenDocument가 호출된다', () => {
    const mockOnOpen = jest.fn();
    render(<RecentDocumentList onOpenDocument={mockOnOpen} />);
    fireEvent.click(screen.getByTestId('doc-card-doc-1'));
    expect(mockOnOpen).toHaveBeenCalledWith('doc-1');
  });

  test('삭제 시 FileManagerStore.deleteDocument가 호출된다', () => {
    render(<RecentDocumentList />);
    fireEvent.click(screen.getByTestId('delete-doc-1'));
    const state = useFileManagerStore.getState();
    expect(state.documents.find(d => d.id === 'doc-1')).toBeUndefined();
  });

  test('삭제 시 onDeleteDocument 콜백이 호출된다', () => {
    const mockOnDelete = jest.fn();
    render(<RecentDocumentList onDeleteDocument={mockOnDelete} />);
    fireEvent.click(screen.getByTestId('delete-doc-2'));
    expect(mockOnDelete).toHaveBeenCalledWith('doc-2');
  });

  describe('검색 연동', () => {
    test('검색어가 있으면 매칭 문서만 표시한다', () => {
      useFileManagerStore.setState({ searchQuery: '첫 번째' });
      render(<RecentDocumentList />);
      expect(screen.getByTestId('doc-card-doc-1')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-card-doc-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('doc-card-doc-3')).not.toBeInTheDocument();
    });

    test('검색 결과가 없으면 빈 결과 메시지를 표시한다', () => {
      useFileManagerStore.setState({ searchQuery: '없는키워드' });
      render(<RecentDocumentList />);
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });

    test('검색어가 DocumentCard에 highlight로 전달된다', () => {
      useFileManagerStore.setState({ searchQuery: '마인드맵' });
      render(<RecentDocumentList />);
      const highlights = screen.getAllByTestId('highlight-active');
      expect(highlights).toHaveLength(3);
    });
  });

  describe('정렬 연동', () => {
    test('이름순 정렬 시 올바른 순서로 표시한다', () => {
      useFileManagerStore.setState({ sortBy: 'name' });
      render(<RecentDocumentList />);
      const cards = screen.getAllByTestId(/^doc-card-/);
      // 한글 정렬: 두(ㄷ) < 세(ㅅ) < 첫(ㅊ)
      expect(cards[0]).toHaveAttribute('data-testid', 'doc-card-doc-2');
      expect(cards[1]).toHaveAttribute('data-testid', 'doc-card-doc-3');
      expect(cards[2]).toHaveAttribute('data-testid', 'doc-card-doc-1');
    });
  });
});
