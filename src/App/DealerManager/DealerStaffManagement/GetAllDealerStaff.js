import api from "../../../api/api";

export async function getAllDealerStaff({
  filterOn,
  filterQuery,
  sortBy,
  isAcsending,
  pageNumber = 1,
  pageSize = 10,
}) {
  const response = await api.get("/Dealer/get-all-dealer-staff", {
    params: {
      filterOn,
      filterQuery,
      sortBy,
      isAcsending,
      pageNumber,
      pageSize,
    },
  });
  return response.data;
}

export const createDealerStaff = async (data) => {
    const response = await api.post("/Dealer/create-dealer-staff", data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export const toggleDealerStaffStatus = async (email) => {
  const response = await api.post(`/Dealer/toggle-staff-status`, { email });
  return response.data;
}

/**
 * Cập nhật trạng thái (active / inactive) cho dealer staff theo applicationUserId.
 * Endpoint backend: /Dealer/update-dealer-staff-status?isActive={true|false}&applicationUserId={id}
 * Trả về response.data giống các hàm khác trong file.
 *
 * Lưu ý: hàm này chỉ thêm logic gọi API; UI (component) sẽ gọi hàm này khi cần.
 */
export const updateDealerStaffStatus = async (applicationUserId, isActive) => {
  // ensure params are provided
  const params = {
    isActive: Boolean(isActive),
    applicationUserId,
  };

  try {
    // ✅ Log payload và URL đầy đủ trước khi gọi API
    const fullUrl = `/Dealer/update-dealer-staff-status?isActive=${params.isActive}&applicationUserId=${params.applicationUserId}`;
    console.group("[API CALL] updateDealerStaffStatus");
    console.log("🔹 URL:", fullUrl);
    console.log("🔹 Params:", params);

    const response = await api.put("/Dealer/update-dealer-staff-status", null, {
      params,
    });

    // ✅ Log phản hồi
    console.log("✅ Response:", response?.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    // ❌ Log lỗi chi tiết
    console.group("[API ERROR] updateDealerStaffStatus");
    console.error("❌ Error Message:", error.message);
    console.error("❌ Response Data:", error?.response?.data);
    console.error("❌ Full Error Object:", error);
    console.groupEnd();
    throw error;
  }
};