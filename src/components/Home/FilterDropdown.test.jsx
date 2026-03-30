import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterDropdown from './FilterDropdown';
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

describe('FilterDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      dateFilter: 'all',
      sortBy: 'recent',
    });
  });

  test('날짜 필터 드롭다운을 렌더링한다', () => {
    render(<FilterDropdown />);
    expect(screen.getByLabelText('기간')).toBeInTheDocument();
  });

  test('정렬 드롭다운을 렌더링한다', () => {
    render(<FilterDropdown />);
    expect(screen.getByLabelText('정렬')).toBeInTheDocument();
  });

  test('날짜 필터 옵션이 모두 있다', () => {
    render(<FilterDropdown />);
    const select = screen.getByLabelText('기간');
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toEqual(['all', 'today', 'week', 'month']);
  });

  test('정렬 옵션이 모두 있다', () => {
    render(<FilterDropdown />);
    const select = screen.getByLabelText('정렬');
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toEqual(['recent', 'name', 'created']);
  });

  test('날짜 필터 변경 시 setDateFilter를 호출한다', () => {
    render(<FilterDropdown />);
    fireEvent.change(screen.getByLabelText('기간'), { target: { value: 'today' } });
    expect(useFileManagerStore.getState().dateFilter).toBe('today');
  });

  test('정렬 변경 시 setSortBy를 호출한다', () => {
    render(<FilterDropdown />);
    fireEvent.change(screen.getByLabelText('정렬'), { target: { value: 'name' } });
    expect(useFileManagerStore.getState().sortBy).toBe('name');
  });

  test('store 상태를 반영하여 선택값이 표시된다', () => {
    useFileManagerStore.setState({ dateFilter: 'week', sortBy: 'created' });
    render(<FilterDropdown />);
    expect(screen.getByLabelText('기간').value).toBe('week');
    expect(screen.getByLabelText('정렬').value).toBe('created');
  });
});
