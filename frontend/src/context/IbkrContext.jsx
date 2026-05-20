import {
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import { IbkrContext } from "./ibkr-context";

export const IbkrProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const fetchDashboard = async ({ initial = false } = {}) => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;

    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [dashboardRes, positionsRes] =
        await Promise.all([
          api.get("/ibkr/status"),
          api.get("/ibkr/positions"),
        ]);

      if (isMountedRef.current) {
        setDashboardData(dashboardRes.data);
        setPositions(positionsRes.data.positions || []);
        setError("");
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setError(
          error?.response?.data?.error ||
            error?.message ||
            "Unable to load IBKR account data right now."
        );
      }
    } finally {
      inFlightRef.current = false;

      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const timeoutId = setTimeout(() => {
      fetchDashboard({ initial: true });
    }, 0);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <IbkrContext.Provider
      value={{
        dashboardData,
        positions,
        loading,
        refreshing,
        error,
        lastUpdated,
        refreshDashboard: fetchDashboard,
      }}
    >
      {children}
    </IbkrContext.Provider>
  );
};
