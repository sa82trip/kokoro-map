import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';
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

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      searchQuery: '',
      searchInContent: false,
    });
  });

  test('검색 입력창을 렌더링한다', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('문서 검색...')).toBeInTheDocument();
  });

  test('검색 아이콘을 렌더링한다', () => {
    render(<SearchBar />);
    const svg = document.querySelector('.search-icon');
    expect(svg).toBeInTheDocument();
  });

  test('검색어 입력 시 setSearchQuery를 호출한다', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('문서 검색...');
    fireEvent.change(input, { target: { value: '테스트' } });
    expect(useFileManagerStore.getState().searchQuery).toBe('테스트');
  });

  test('store의 searchQuery를 표시한다', () => {
    useFileManagerStore.setState({ searchQuery: '프로젝트' });
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('문서 검색...').value).toBe('프로젝트');
  });

  test('지우기 버튼이 검색어 있을 때만 나타난다', () => {
    const { rerender } = render(<SearchBar />);
    expect(screen.queryByLabelText('검색어 지우기')).not.toBeInTheDocument();

    useFileManagerStore.setState({ searchQuery: '테스트' });
    rerender(<SearchBar />);
    expect(screen.getByLabelText('검색어 지우기')).toBeInTheDocument();
  });

  test('지우기 버튼 클릭 시 검색어를 초기화한다', () => {
    useFileManagerStore.setState({ searchQuery: '테스트' });
    render(<SearchBar />);
    fireEvent.click(screen.getByLabelText('검색어 지우기'));
    expect(useFileManagerStore.getState().searchQuery).toBe('');
  });

  test('내용 검색 토글 체크박스가 있다', () => {
    render(<SearchBar />);
    const toggle = screen.getByLabelText('노드 내용도 검색');
    expect(toggle).toBeInTheDocument();
    expect(toggle.checked).toBe(false);
  });

  test('내용 검색 토글 클릭 시 상태가 변경된다', () => {
    render(<SearchBar />);
    const toggle = screen.getByLabelText('노드 내용도 검색');
    fireEvent.click(toggle);
    expect(useFileManagerStore.getState().searchInContent).toBe(true);
  });

  test('store의 searchInContent 상태를 반영한다', () => {
    useFileManagerStore.setState({ searchInContent: true });
    render(<SearchBar />);
    expect(screen.getByLabelText('노드 내용도 검색').checked).toBe(true);
  });
});
