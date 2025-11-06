import api from "../../../api/api";

export const getAllCustomer = async () => {
    try {
        const response = await api.get("/Customer/get-all-customers");
        return response.data;
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        // Log the payload being sent to backend
        console.log('Updating customer payload:', {
            customerId,
            customerData
        });
        
        const response = await api.put(`/Customer/update-customer/${customerId}`, customerData);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error);
        throw error;
    }
};
