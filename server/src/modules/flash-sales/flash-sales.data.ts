import * as moment from "moment";

// In a real-world scenario, we would store flash sale data in database.
// But for now, to keep things simple, we’re just localizing the data.
export const initFlashSalesData = () => {
  const now = moment.utc();
  return [
    {
      id: "0faa6354-a1ab-4ae1-8ffc-e8da68ed50be",
      product: { id: "d88a7af7-55a7-4fd4-985e-431a9afc76c2", name: "Banana", stock: 2000 },
      startTime: now.startOf("hour").toDate(),
      endTime: now.startOf("hour").add(1, "hour").toDate(),
    },
    {
      id: "e283871f-aebf-4e3b-88e1-9c2232ff2a9b",
      product: { id: "d88a7af7-55a7-4fd4-985e-431a9afc76c2", name: "Banana", stock: 2000 },
      startTime: now.startOf("hour").subtract(1, "hour").toDate(),
      endTime: now.startOf("hour").toDate(),
    },
    {
      id: "058eea12-d538-465c-a996-a2f218cd6a76",
      product: { id: "d88a7af7-55a7-4fd4-985e-431a9afc76c2", name: "Banana", stock: 2000 },
      startTime: now.startOf("hour").add(1, "hour").toDate(),
      endTime: now.startOf("hour").add(2, "hour").toDate(),
    },
  ];
};
