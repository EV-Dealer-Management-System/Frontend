import api from "../../../api/api";

// Lấy thông tin eContract theo id (trả về metadata chứa downloadUrl)
export const getEContractById = async (eContractId) => {
  try {
    const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${eContractId}`);
    // trả về response.data để caller xử lý linh hoạt
    return response.data;
  } catch (error) {
    console.error("Error fetching eContract by id:", error);
    throw error;
  }
};

// Gọi API preview để lấy blob PDF từ downloadUrl (downloadUrl được gửi nguyên vẹn)
export const getEContractPreview = async (downloadUrl) => {
  try {
    // Truyền downloadUrl nguyên dạng query param (encodeURIComponent)
    const encoded = encodeURIComponent(downloadUrl);
    const response = await api.get(`/EContract/preview?downloadURL=${encoded}`, {
      responseType: "blob",
    });

    // trả về Blob cho caller
    return response.data;
  } catch (error) {
    console.error("Error previewing eContract:", error);
    throw error;
  }
};

export default { getEContractById, getEContractPreview };
