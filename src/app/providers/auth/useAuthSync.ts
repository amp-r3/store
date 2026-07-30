import { useOAuthErrorRedirect } from "./useOAuthErrorRedirect";
import { useSessionSync } from "./useSessionSync";
import { useLocalDataMerge } from "./useLocalDataMerge";

export const useAuthSync = () => {
  useOAuthErrorRedirect();
  useSessionSync();
  useLocalDataMerge();
};
