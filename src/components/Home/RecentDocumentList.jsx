import React from 'react';
import DocumentCard from './DocumentCard';
import useFileManagerStore from '../../store/FileManagerStore';
import './RecentDocumentList.css';

const RecentDocumentList = ({ onOpenDocument, onDeleteDocument }) => {
  const documents = useFileManagerStore((state) => state.documents);
  const searchQuery = useFileManagerStore((state) => state.searchQuery);
  const getFilteredDocuments = useFileManagerStore((state) => state.getFilteredDocuments);

  const filteredDocuments = getFilteredDocuments();

  const handleClick = (docId) => {
    if (onOpenDocument) {
      onOpenDocument(docId);
    }
  };

  const handleDelete = (docId) => {
    const fm = useFileManagerStore.getState();
    fm.deleteDocument(docId);
    if (onDeleteDocument) {
      onDeleteDocument(docId);
    }
  };

  // 문서가 전혀 없을 때
  if (documents.length === 0) {
    return (
      <div className="recent-documents-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c0c8d4" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p>아직 생성된 마인드맵이 없습니다</p>
        <span>새 마인드맵 버튼을 눌러 시작해보세요</span>
      </div>
    );
  }

  // 검색 결과가 없을 때
  if (filteredDocuments.length === 0) {
    return (
      <div className="recent-documents-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c0c8d4" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <p>검색 결과가 없습니다</p>
        <span>다른 검색어나 필터를 시도해보세요</span>
      </div>
    );
  }

  return (
    <div className="recent-documents">
      <div className="recent-documents-grid">
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onClick={handleClick}
            onDelete={handleDelete}
            highlight={searchQuery || undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentDocumentList;
