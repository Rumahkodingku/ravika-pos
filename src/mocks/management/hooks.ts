"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getState,
  type ManagementState,
  subscribe,
} from "@/mocks/management/store";

export function useManagementStore<T>(selector: (state: ManagementState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}

export function useAsyncData<T>(loader: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  // biome-ignore lint/correctness/useExhaustiveDependencies: key and version are the intended refetch triggers; loader is read from a ref.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Data gagal dimuat. Coba lagi.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [key, version]);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  return { data, error, isLoading, refresh };
}
