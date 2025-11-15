import api from "../../../api/api";
export const confirmCustomerOrder = async (customerOrderId, email, isAccept) => {
    try {
        const response = await api.post(`/CustomerOrder/confirm-customer-order/${customerOrderId}?email=${encodeURIComponent(email)}&isAccept=${isAccept}`);
        console.log("Response from confirmCustomerOrder:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Error confirming customer order:", error);
        throw error;
    }
};
