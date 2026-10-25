import { useCallback, useEffect, useState } from 'react';
import { searchVehicles } from '../api/vehicles';
import type { Pagination, SearchParams, Vehicle } from '../api/types';
import { getErrorMessage } from '../lib/error';

interface State {
  data: Vehicle[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

/** Loads vehicles for the given query and re-loads whenever it changes. */
export function useVehicles(params: SearchParams) {
  const [state, setState] = useState<State>({ data: [], pagination: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify(params); // stable dependency even if the object is recreated

  useEffect(() => {
    let cancelled = false; // ignore responses that arrive after the query changed
    setState((s) => ({ ...s, loading: true, error: null }));
    searchVehicles(JSON.parse(key) as SearchParams)
      .then((page) => {
        if (!cancelled) setState({ data: page.data, pagination: page.pagination, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
      });
    return () => {
      cancelled = true;
    };
  }, [key, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  /** Swaps one vehicle in place, e.g. with the fresh stock returned by purchase. */
  const replaceItem = useCallback((vehicle: Vehicle) => {
    setState((s) => ({ ...s, data: s.data.map((v) => (v.id === vehicle.id ? vehicle : v)) }));
  }, []);

  return { ...state, refetch, replaceItem };
}