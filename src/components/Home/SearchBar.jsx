import React from 'react';
import useFileManagerStore from '../../store/FileManagerStore';
import './SearchBar.css';

const SearchBar = () => {
  const searchQuery = useFileManagerStore((state) => state.searchQuery);
  const searchInContent = useFileManagerStore((state) => state.searchInContent);
  const setSearchQuery = useFileManagerStore((state) => state.setSearchQuery);
  const setSearchInContent = useFileManagerStore((state) => state.setSearchInContent);

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleContentToggle = () => {
    setSearchInContent(!searchInContent);
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e99a4" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="문서 검색..."
          value={searchQuery}
          onChange={handleChange}
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <label className="search-content-toggle">
        <input
          type="checkbox"
          checked={searchInContent}
          onChange={handleContentToggle}
        />
        <span>노드 내용도 검색</span>
      </label>
    </div>
  );
};

export default SearchBar;
