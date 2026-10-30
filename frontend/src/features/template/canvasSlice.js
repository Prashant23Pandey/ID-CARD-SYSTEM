import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeSide: 'front',
  zoom: 1,
  gridEnabled: false,
  snapToGrid: true,
  history: [],
  future: [],
  copiedObject: null,
  selectedObjectId: null,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setActiveSide: (state, action) => {
      state.activeSide = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    toggleGrid: (state) => {
      state.gridEnabled = !state.gridEnabled;
    },
    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },
    pushHistory: (state, action) => {
      state.history.push(action.payload);
      state.future = [];
    },
    undoCanvas: (state) => {
      if (!state.history.length) return;
      const last = state.history.pop();
      state.future.unshift(last);
    },
    redoCanvas: (state) => {
      if (!state.future.length) return;
      const item = state.future.shift();
      state.history.push(item);
    },
    setCopiedObject: (state, action) => {
      state.copiedObject = action.payload;
    },
    setSelectedObjectId: (state, action) => {
      state.selectedObjectId = action.payload;
    },
  },
});

export const {
  setActiveSide,
  setZoom,
  toggleGrid,
  toggleSnapToGrid,
  pushHistory,
  undoCanvas,
  redoCanvas,
  setCopiedObject,
  setSelectedObjectId,
} = canvasSlice.actions;
export const selectCanvasState = (state) => state.canvas;
export default canvasSlice.reducer;
