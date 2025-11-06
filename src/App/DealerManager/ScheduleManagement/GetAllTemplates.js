import api from "../../../api/api";

export const GetAllTemplates = {
  // Lấy tất cả template xe với pagination và search
  getAllTemplates: async (pageNumber = 1, pageSize = 10, search = "", templateId = "") => {
    try {
      const params = {
        pageNumber,
        pageSize
      };

      // Thêm search parameter nếu được cung cấp
      if (search && search.trim() !== "") {
        params.search = search.trim();
      }

      // Thêm templateId parameter nếu được cung cấp
      if (templateId && templateId.trim() !== "") {
        params.templateId = templateId.trim();
      }

      const response = await api.get("/EVTemplate/Get-all-template-vehicles", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },
};
