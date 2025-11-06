import api from "../../../api/api";
export const getAllWarehouses = async () => {
  try {
    const response = await api.get("/Warehouse/get-all-warehouses");
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
};
