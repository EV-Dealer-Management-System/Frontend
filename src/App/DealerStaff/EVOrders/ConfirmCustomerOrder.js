import api from "../../../api/api";

// API xác nhận đơn hàng khách hàng (accept/reject)
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

// API lấy bản xem trước PDF hợp đồng từ downloadURL
export const getEcontractPreview = async (downloadURL) => {
    try {
        // Gửi downloadURL nguyên gốc về BE, không encode thêm - theo pattern ContractPage
        console.log("Raw downloadURL sent to BE:", downloadURL);
        
        const response = await api.get('/Econtract/preview', {
            params: { downloadURL }, // Sử dụng params object như ContractPage
            responseType: 'blob', // Quan trọng: để nhận raw PDF stream
            headers: {
                'Accept': 'application/pdf',
            }
        });
        console.log("Response from getEcontractPreview:", response);
        console.log("Response status:", response.status);
        console.log("Response content length:", response.data?.size);
        
        if (response.status === 200 && response.data) {
            // Tạo blob URL từ response để hiển thị trong iframe
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            console.log("PDF blob created successfully, URL:", pdfUrl.substring(0, 50) + '...');
            return pdfUrl;
        } else {
            throw new Error('Invalid response from server');
        }
    }
    catch (error) {
        console.error("Error getting econtract preview:", error);
        throw error;
    }
};
