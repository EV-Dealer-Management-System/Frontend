import api from "../../../api/api";
export const GetEVForecastSeries = async (evTemplateId, from, to) => {
    try {
        console.log("🔍 Calling Forecast API with:", { evTemplateId, from, to });
        console.log("📍 Full URL:", `/Dealer/get-forecast-series?evTemplateId=${evTemplateId}&from=${from}&to=${to}`);

        const response = await api.get(`/Dealer/get-forecast-series`, {
            params: {
                evTemplateId,
                from,
                to
            }
        });

        console.log("✅ EV Forecast Series Response:", response.data);
        console.log("📊 Result count:", response.data.result?.length || 0);

        return response.data;
    } catch (error) {
        console.error("❌ Error fetching EV forecast series:", error);
        console.error("Error details:", error.response?.data || error.message);
        throw error;
    }
};