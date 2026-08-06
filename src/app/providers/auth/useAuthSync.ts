import { useSessionSync } from "./useSessionSync";
import { useLocalDataMerge } from "./useLocalDataMerge";

export const useAuthSync = () => {
  useSessionSync();
  useLocalDataMerge();
};
