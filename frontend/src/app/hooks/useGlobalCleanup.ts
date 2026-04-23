import { useEffect } from 'react';

export function useGlobalCleanUp() {
  useEffect(() => {
    // Shared cleanup logic if needed
    return () => {
      // Cleanup
    };
  }, []);
}
