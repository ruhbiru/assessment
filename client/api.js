async function createOrder(formData) {
  try {
    const res = await fetch("/api/flash-sales/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, qty: Number(formData.qty) }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}
