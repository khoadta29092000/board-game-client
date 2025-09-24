import { useSelector } from "react-redux";
import { GlobalState } from "./slice";

export type GlobalSlector = {
  global: GlobalState;
};

const useGlobal = () => useSelector((state: GlobalSlector) => state.global);
export const useAuth = () =>
  useSelector((state: GlobalSlector) => state.global.auth);

export default useGlobal;
