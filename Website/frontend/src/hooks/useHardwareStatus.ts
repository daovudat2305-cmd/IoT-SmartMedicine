import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useWebSocket } from "./useWebSocket";
import type { SensorStatusResponse } from "../types";

export function useHardwareStatus() {
  const [hardwareStatus, setHardwareStatus] =
    useState<SensorStatusResponse | null>(null);

  const handleStatusUpdate = useCallback((data: SensorStatusResponse) => {
    setHardwareStatus(data);

    if (data.status === "error") {
      let errorMsg = "Cảm biến phần cứng gặp sự cố!";

      toast.error(errorMsg, {
        id: "hardware-sensor-error",
        description: `Thời gian ghi nhận: ${new Date(data.time).toLocaleTimeString("vi-VN")}`,
        duration: 5000,
      });
    }
  }, []);

  const { isConnected } = useWebSocket<SensorStatusResponse>(
    "/topic/hardware-status",
    handleStatusUpdate,
  );

  const clearStatus = () => setHardwareStatus(null);

  return {
    hardwareStatus,
    isConnected,
    clearStatus,
  };
}

export default useHardwareStatus;
