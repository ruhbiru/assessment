const { useEffect } = React;

function useSSE(orderId, onMessage, onError) {
  useEffect(() => {
    if (!orderId) return;

    console.log("Connecting to SSE...");
    const eventSource = new EventSource(
      `/api/flash-sales/order/${orderId}/status-stream`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE update:", data);
      onMessage(data.status, data.message);
      if (data.status !== "PENDING") {
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE failed:", err);
      onError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);
}
