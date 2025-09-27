const { useEffect } = React;

function usePolling(orderId, onUpdate, onError, enabled = false) {
  useEffect(() => {
    if (!orderId || !enabled) return;

    console.log("Polling order status...");
    const id = setInterval(async () => {
      try {
        const res = await fetch(`api/flash-sales/order/${orderId}/status`);
        const data = await res.json();
        console.log("Polled status:", data);

        if (data.data !== "PENDING") {
          onUpdate(data.data, data.message);
          clearInterval(id);
        } else {
          onUpdate("PENDING");
        }
      } catch (err) {
        console.error("Polling failed:", err);
        onError();
        clearInterval(id);
      }
    }, 2000);

    return () => clearInterval(id); // cleanup
  }, [orderId]);
}
