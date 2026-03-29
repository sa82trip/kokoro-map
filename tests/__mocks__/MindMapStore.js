// MindMapStore 모의 객체
const mockStore = {
  updateNodeText: jest.fn(),
  updateNodePosition: jest.fn(),
  setMindMapData: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  addNode: jest.fn(),
  deleteNode: jest.fn(),
  reset: jest.fn()
};

// 실제 스토어 가져오기
jest.mock('../src/store/MindMapStore', () => ({
  useMindMapStore: () => mockStore
}));

export default mockStore;