import api from "../../../api/api";

export const CreateAppointmentSetting = {
    createAppointmentSetting: async (formData) => {
        try {
            const response = await api.post("/AppointmentSetting/create-appointment-setting", formData);
            return response.data;
        } catch (error) {
            console.error("Error creating appointment setting:", error);
            throw error;
        }
    }
};