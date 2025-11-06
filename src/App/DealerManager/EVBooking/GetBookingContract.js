import api from "../../../api/api";

/**
 * Lấy eContract VNPT theo id
 * @param {string} eContractId - GUID eContract
 * @returns {Promise<object>} response.data từ server
 */
export const getEContractById = async (eContractId) => {
  if (!eContractId) throw new Error("Missing eContractId");
  try {
    const url = `/EContract/get-vnpt-econtract-by-id/${eContractId}`;
    console.log("[API] getEContractById - request url:", url);
    const response = await api.get(url);
    console.log("[API] getEContractById - response:", response?.data);
    return response?.data;
  } catch (error) {
    console.error("[API] getEContractById - error:", error?.response || error);
    throw error;
  }
};

/**
 * Lấy raw PDF stream (blob) từ downloadUrl bằng endpoint preview
 * @param {string} downloadUrl
 * @returns {Promise<Blob>} blob data
 */
export const getEContractPreview = async (downloadUrl) => {
  if (!downloadUrl) throw new Error("Missing downloadUrl");
  try {
    const encoded = encodeURIComponent(downloadUrl);
    const url = `/EContract/preview?downloadURL=${encoded}`;
    console.log("[API] getEContractPreview - url:", url);
    const res = await api.get(url, { responseType: "blob" });
    console.log("[API] getEContractPreview - status:", res.status, "type:", res.data?.type);
    return res.data;
  } catch (err) {
    console.error("[API] getEContractPreview - error:", err?.response || err);
    throw err;
  }
};

export default getEContractById;
