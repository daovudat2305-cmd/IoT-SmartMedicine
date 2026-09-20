import { useState, useEffect, useCallback } from "react";
import { sensorApi } from "../api";
import { useWebSocket } from "./useWebSocket";
import type { SensorRealtimeResponse } from "../types";

export function useSensorRealtime() {
  const [sensorData, setSensorData] = useState<SensorRealtimeResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //nhận message từ Websocket STOMP topic /topic/sensor-update
  const handleRealtimeUpdate = useCallback((data: SensorRealtimeResponse) => {
    setSensorData(data);
    setIsLoading(false);
  }, []);

  const { isConnected } = useWebSocket<SensorRealtimeResponse>(
    "/topic/sensor-update",
    handleRealtimeUpdate,
  );

  //initial fetch
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await sensorApi.getLatestData();

        if (isMounted && response.success && response.data) {
          setSensorData(response.data);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error?.message || "Không thể tải dữ liệu cảm biến ban đầu");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    sensorData,
    isConnected,
    isLoading,
    error,
  };
}

export default useSensorRealtime;
