import api from "../../../api/api";

export const CreateAppointmentSetting = {
    createAppointmentSetting: async (allowOverlappingAppointments = true, maxConcurrentAppointments = 0, openTime = "string", closeTime = "string", minIntervalBetweenAppointments = 0, breakTimeBetweenAppointments = 0) => {
        const formData = {
            allowOverlappingAppointments,
            maxConcurrentAppointments,
            openTime,
            closeTime,
            minIntervalBetweenAppointments,
            breakTimeBetweenAppointments,
        };
        try {
            const response = await api.post("/DealerConfiguration/upsert-configuration", formData);
            return response.data;
        } catch (error) {
            console.error("Error creating appointment setting:", error);
            throw error;
        }
    }
};