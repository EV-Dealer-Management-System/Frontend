import api from "../../../api/api";
export const GetEVForecastSeries = async (evTemplateId, from, to) => {
    try {
        console.log("🔥 Calling Forecast API with:", { evTemplateId, from, to });

        const response = await api.get(`/Dealer/get-forecast-series`, {
            params: {
                evTemplateId,
                from,
                to
            }
        });
        console.log("✅ EV Forecast Series Response:", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching EV forecast series:", error);
        throw error;
    }
};