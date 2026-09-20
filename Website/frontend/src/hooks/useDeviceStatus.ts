import { useState, useEffect, useCallback } from "react";
import { deviceApi } from "../api";
import { useWebSocket } from "./useWebSocket";
import type { DeviceResponse } from "../types";

export function useDeviceStatus() {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //nhận trạng thái thiết bị từ websocket
  const handleDeviceStatusUpdate = useCallback(
    (data: DeviceResponse[] | DeviceResponse) => {
      if (Array.isArray(data)) {
        setDevices(data);
      } else if (data && data.id) {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === data.id ? { ...d, status: data.status } : d,
          ),
        );
      }
    },
    [],
  );

  const { isConnected } = useWebSocket<DeviceResponse[] | DeviceResponse>(
    "/topic/device-status",
    handleDeviceStatusUpdate,
  );

  //initial fetch
  useEffect(() => {
    let isMounted = true;

    const fetchDevices = async () => {
      try {
        setIsLoading(true);

        const response = await deviceApi.getAllDevices();
        if (isMounted && response.success && response.data) {
          setDevices(response.data);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error?.message || "Không thể tải danh sách thiết bị");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDevices();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    devices,
    setDevices,
    isConnected,
    isLoading,
    error,
  };
}

export default useDeviceStatus;
