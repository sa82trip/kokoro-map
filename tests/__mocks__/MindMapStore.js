// MindMapStore 모의 객체
const mockStore = {
  updateNodeText: jest.fn(),
  updateNodePosition: jest.fn(),
  setMindMapData: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  addNode: jest.fn(),
  deleteNode: jest.fn(),
  reset: jest.fn(),
  viewport: { x: 0, y: 0 },
  panViewport: jest.fn(),
  setViewport: jest.fn(),
  resetViewport: jest.fn(),
  saveNodePositions: jest.fn()
};

// useMindMapStore 함수에 getState 추가
const useMindMapStoreMock = () => mockStore;
useMindMapStoreMock.getState = () => mockStore;

jest.mock('../src/store/MindMapStore', () => ({
  useMindMapStore: useMindMapStoreMock
}));

export default mockStore;