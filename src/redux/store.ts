import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./global";

const store = configureStore({
  devTools: true,
  reducer: {
    global: globalReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
