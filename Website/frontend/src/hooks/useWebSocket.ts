import { useEffect, useState, useRef, useCallback } from "react";
import { Client, type StompSubscription, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Polyfill tương thích SockJS trên trình duyệt với Vite
if (typeof window !== "undefined" && !(window as any).global) {
  (window as any).global = window;
}

const WS_URL = "http://localhost:8080/ws";

type MessageCallback<T = any> = (data: T) => void;

interface ActiveSubscription {
  destination: string;
  callback: MessageCallback;
  stompSubscription?: StompSubscription; // Đã thêm ? để cho phép undefined
}

// Singleton STOMP Client: Chia sẻ 1 kết nối duy nhất toàn ứng dụng
let clientInstance: Client | null = null;
const activeSubscriptions = new Set<ActiveSubscription>();
const connectionListeners = new Set<(connected: boolean) => void>();

function getStompClient(): Client {
  if (!clientInstance) {
    clientInstance = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        if (import.meta.env.DEV) {
          // Bật console log khi cần debug
          // console.log("[STOMP]", msg);
        }
      },
      onConnect: () => {
        console.log("[WebSocket] Đã kết nối STOMP thành công");
        connectionListeners.forEach((listener) => listener(true));

        // Tự động subscribe lại tất cả các topic đang hoạt động khi kết nối / reconnect
        activeSubscriptions.forEach((sub) => {
          if (!sub.stompSubscription && clientInstance?.connected) {
            sub.stompSubscription = clientInstance.subscribe(
              sub.destination,
              (message: IMessage) => {
                try {
                  const parsed = JSON.parse(message.body);
                  sub.callback(parsed);
                } catch {
                  sub.callback(message.body);
                }
              },
            );
          }
        });
      },
      onDisconnect: () => {
        console.log("[WebSocket] Đã ngắt kết nối STOMP");
        connectionListeners.forEach((listener) => listener(false));

        // Đánh dấu để sẵn sàng re-subscribe khi có kết nối trở lại
        activeSubscriptions.forEach((sub) => {
          sub.stompSubscription = undefined;
        });
      },
      onStompError: (frame) => {
        console.error(
          "[WebSocket] Lỗi STOMP Broker:",
          frame.headers["message"],
          frame.body,
        );
        connectionListeners.forEach((listener) => listener(false));
      },
      onWebSocketClose: () => {
        connectionListeners.forEach((listener) => listener(false));
        activeSubscriptions.forEach((sub) => {
          sub.stompSubscription = undefined;
        });
      },
    });

    clientInstance.activate();
  }

  return clientInstance;
}

// Custom Hook: useWebSocket
export function useWebSocket<T = any>(
  topic?: string,
  onMessage?: MessageCallback<T>,
) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return Boolean(clientInstance?.connected);
  });

  // Dùng ref để giữ callback mới nhất mà không gây subscribe/unsubscribe thừa
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Đồng bộ trạng thái kết nối
  useEffect(() => {
    getStompClient();

    const handleConnectionChange = (status: boolean) => {
      setIsConnected(status);
    };

    connectionListeners.add(handleConnectionChange);
    setIsConnected(Boolean(clientInstance?.connected));

    return () => {
      connectionListeners.delete(handleConnectionChange);
    };
  }, []);

  /**
   * Hàm subscribe thủ công vào 1 topic
   * @returns Hàm hủy đăng ký (unsubscribe) để dùng trong cleanup của useEffect
   */
  const subscribe = useCallback(
    <K = T>(
      destination: string,
      callback: MessageCallback<K>,
    ): (() => void) => {
      const client = getStompClient();
      const subRecord: ActiveSubscription = {
        destination,
        callback: callback as MessageCallback,
      };

      activeSubscriptions.add(subRecord);

      if (client.connected) {
        subRecord.stompSubscription = client.subscribe(
          destination,
          (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              callback(data);
            } catch {
              callback(message.body as unknown as K);
            }
          },
        );
      }

      return () => {
        if (subRecord.stompSubscription) {
          subRecord.stompSubscription.unsubscribe();
        }
        activeSubscriptions.delete(subRecord);
      };
    },
    [],
  );

  /**
   * Hàm gửi message tới destination trên server
   */
  const publish = useCallback(
    (destination: string, body: unknown, headers?: Record<string, string>) => {
      const client = getStompClient();
      if (client.connected) {
        client.publish({
          destination,
          body: typeof body === "string" ? body : JSON.stringify(body),
          headers,
        });
      } else {
        console.warn(
          `[WebSocket] Chưa kết nối, không thể gửi tin tới: ${destination}`,
        );
      }
    },
    [],
  );

  // Tự động subscribe nếu truyền topic & onMessage qua tham số hook
  useEffect(() => {
    if (!topic || !onMessageRef.current) return;

    const unsubscribe = subscribe<T>(topic, (data) => {
      onMessageRef.current?.(data);
    });

    return () => {
      unsubscribe();
    };
  }, [topic, subscribe]);

  return {
    client: getStompClient(),
    isConnected,
    subscribe,
    publish,
  };
}

export default useWebSocket;
