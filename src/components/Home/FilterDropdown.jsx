import React from 'react';
import useFileManagerStore from '../../store/FileManagerStore';
import './FilterDropdown.css';

const DATE_OPTIONS = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: '최근 수정순' },
  { value: 'name', label: '이름순' },
  { value: 'created', label: '생성순' },
];

const FilterDropdown = () => {
  const dateFilter = useFileManagerStore((state) => state.dateFilter);
  const sortBy = useFileManagerStore((state) => state.sortBy);
  const setDateFilter = useFileManagerStore((state) => state.setDateFilter);
  const setSortBy = useFileManagerStore((state) => state.setSortBy);

  return (
    <div className="filter-dropdown">
      <select
        className="filter-select"
        aria-label="기간"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        {DATE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        className="filter-select"
        aria-label="정렬"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
