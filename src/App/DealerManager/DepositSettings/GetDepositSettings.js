import api from "../../../api/api";
export const getDepositSettings = async () => {
  try {
    const response = await api.get(`/DealerConfiguration/get-current`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deposit settings:", error);
    throw error;
  }
};
export const createDepositSettings = async (maxDepositPercentage) => {
  try {
    const formData = {
      maxDepositPercentage: maxDepositPercentage,
    };
    const response = await api.post(
      `/DealerConfiguration/upsert-configuration`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating deposit settings:", error);
    throw error;
  }
};
