import { useEffect } from "react";

import { JwtStore } from "./jwt-store";

type UseAuthGuardOptions = {
  onAuthenticated?: () => void;
  onUnauthenticated?: () => void;
};

export const useAuthGuard = (options: UseAuthGuardOptions): void => {
  const { onAuthenticated, onUnauthenticated } = options;

  useEffect(() => {
    JwtStore.exists().then(exists => {
      if (exists && onAuthenticated) onAuthenticated();
      else if (!exists && onUnauthenticated) onUnauthenticated();
    });
  }, [onAuthenticated, onUnauthenticated]);
};
