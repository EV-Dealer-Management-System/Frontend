import api from "../../../api/api";
export const getDealerStaffDashboard = async()=>{
    try {
        const response = await api.get('/DashBoard/get-dealer-staff-dashboard');
        return response.data;
    }
    catch (error) {
        console.error("Error fetching Dealer Staff dashboard data:", error);
        throw error;
    }
};
