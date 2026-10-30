import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import authReducer from '../features/auth/authSlice';
import schoolReducer from '../features/school/schoolSlice';
import { authApi } from '../features/auth/authApi';
import { schoolApi } from '../features/school/schoolApi';
import studentReducer from '../features/student/studentSlice';
import { studentApi } from '../features/student/studentApi';
import teacherReducer from '../features/teacher/teacherSlice';
import { teacherApi } from '../features/teacher/teacherApi';
import sessionReducer from '../features/session/sessionSlice';
import { sessionApi } from '../features/session/sessionApi';
import classReducer from '../features/class/classSlice';
import { classApi } from '../features/class/classApi';
import sectionReducer from '../features/section/sectionSlice';
import { sectionApi } from '../features/section/sectionApi';
import promotionReducer from '../features/promotion/promotionSlice';
import { promotionApi } from '../features/promotion/promotionApi';
import templateReducer from '../features/template/templateSlice';
import canvasReducer from '../features/template/canvasSlice';
import previewReducer from '../features/template/previewSlice';
import versionReducer from '../features/template/versionSlice';

const persistConfig = {
  key: 'multischool-auth',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
  [authApi.reducerPath]: authApi.reducer,
  [schoolApi.reducerPath]: schoolApi.reducer,
  student: studentReducer,
  [studentApi.reducerPath]: studentApi.reducer,
  teacher: teacherReducer,
  [teacherApi.reducerPath]: teacherApi.reducer,
  session: sessionReducer,
  [sessionApi.reducerPath]: sessionApi.reducer,
  class: classReducer,
  [classApi.reducerPath]: classApi.reducer,
  section: sectionReducer,
  [sectionApi.reducerPath]: sectionApi.reducer,
  promotion: promotionReducer,
  [promotionApi.reducerPath]: promotionApi.reducer,
  template: templateReducer,
  canvas: canvasReducer,
  preview: previewReducer,
  version: versionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      schoolApi.middleware,
      studentApi.middleware,
      teacherApi.middleware,
      sessionApi.middleware,
      classApi.middleware,
      sectionApi.middleware,
      promotionApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

