import api from "../../../api/api";
export const getDealerManagerDashboard = async () => {
    try {
        const response = await api.get("/Dashboard/get-dealer-manager-dashboard");
        return response.data;
    } catch (error) {
        console.error("Error fetching dealer manager dashboard data:", error);
        throw error;
    }
};
