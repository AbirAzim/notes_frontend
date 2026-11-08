import { useEffect, useState } from 'react';
import { api, ApiError } from './api';

interface State<T> {
  key: string; // which request this result belongs to
  data?: T;
  error?: ApiError | Error;
}

// GET `path` whenever it changes. reload() fetches the same path again.
// `loading` is true until the result for the current path arrives.
export function useFetch<T>(path: string) {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<State<T>>({ key: '' });
  const key = `${path}#${reloadCount}`;

  useEffect(() => {
    let ignore = false; // drop the answer if path changed before it arrived
    api<T>(path)
      .then((data) => {
        if (!ignore) setState({ key, data });
      })
      .catch((error: Error) => {
        if (!ignore) setState({ key, error });
      });
    return () => {
      ignore = true;
    };
  }, [path, key]);

  const loading = state.key !== key;
  return {
    data: state.data,
    error: loading ? undefined : state.error,
    loading,
    reload: () => setReloadCount((n) => n + 1),
  };
}
