import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./global";
import AnimationReducer from "./animation";

const store = configureStore({
  devTools: true,
  reducer: {
    global: globalReducer,
    animation: AnimationReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
