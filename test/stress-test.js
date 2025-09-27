import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1000,
  iterations: 1000,
};

export default function () {
  // 1. Place order
  const productId = "d88a7af7-55a7-4fd4-985e-431a9afc76c2";
  const orderRes = http.post(
    "http://localhost:7000/api/flash-sales/order",
    JSON.stringify({
      productId,
      customerId: `user-${__VU}-${__ITER}`,
      qty: 1,
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  const data = orderRes.json();
  const orderId = data?.data?.id;

  console.log(`VU:${__VU} Iter:${__ITER} OrderId: ${orderId}`);

  check(orderRes, {
    "order API status is 201": (r) => r.status === 201,
    "orderId exists": () => !!orderId,
  });

  console.log(`VU:${__VU} Iter:${__ITER} OrderId: ${orderId}`);

  // 2. Poll for status until not pending or timeout
  if (orderId) {
    let status = "PENDING";
    let attempts = 0;
    while (status === "PENDING" && attempts < 10) {
      const statusRes = http.get(
        `http://localhost:7000/api/flash-sales/order/${orderId}/status`
      );
      check(statusRes, { "status check OK": (r) => r.status === 200 });

      status = statusRes.json("data");
      attempts++;
      sleep(1);
    }

    check(status, {
      "order eventually confirmed or failed": (s) => s !== "PENDING",
    });
    console.log(`OrderId: ${orderId}  (${status})`);
  }
}
