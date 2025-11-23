import api from "../../../api/api";
export const DefaultConfiguration = {
  getDefaultConfiguration: async () => {
    try {
      const response = await api.get(
        "/DealerConfiguration/get-default-configuration"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting default configuration:", error);
      throw error;
    }
  },

  // Lấy giới hạn tỷ lệ đặt cọc từ cấu hình mặc định
  getDepositLimits: async () => {
    try {
      const response = await api.get(
        "/DealerConfiguration/get-default-configuration"
      );
      if (response.data?.isSuccess && response.data?.result) {
        const { minDepositPercentage, maxDepositPercentage } =
          response.data.result;
        return {
          min: minDepositPercentage || 0,
          max: maxDepositPercentage || 100,
        };
      }
      // Giá trị mặc định nếu không lấy được từ API
      return { min: 0, max: 100 };
    } catch (error) {
      console.error("Error getting deposit limits:", error);
      // Trả về giá trị mặc định khi có lỗi
      return { min: 0, max: 100 };
    }
  },
};
