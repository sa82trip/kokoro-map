import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecentDocumentList from './RecentDocumentList';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import FolderTree from './FolderTree';
import useFileManagerStore from '../../store/FileManagerStore';
import { version } from '../../../package.json';
import './HomeScreen.css';

const HomeScreen = () => {
  const navigate = useNavigate();
  const initialize = useFileManagerStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  const handleNewDocument = () => {
    navigate('/editor/new');
  };

  const handleOpenDocument = (docId) => {
    navigate(`/editor/${docId}`);
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="21" />
              <line x1="3" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="21" y2="12" />
            </svg>
            <h1>마인드맵</h1>
          </div>
          <button className="new-document-btn" onClick={handleNewDocument}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 마인드맵
          </button>
        </div>
      </header>

      <div className="home-body">
        <FolderTree />
        <main className="home-content">
        <section className="recent-section">
          <h2 className="section-title">최근 문서</h2>
          <div className="search-filter-bar">
            <SearchBar />
            <FilterDropdown />
          </div>
          <RecentDocumentList
            onOpenDocument={handleOpenDocument}
          />
        </section>
      </main>
      </div>

      <footer className="home-footer">
        <span className="version-text">v{version}</span>
      </footer>
    </div>
  );
};

export default HomeScreen;
