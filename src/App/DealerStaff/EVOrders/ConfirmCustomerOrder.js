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
        
        // Xử lý các loại lỗi cụ thể
        if (error.response?.status === 404) {
            const errorMsg = "Tài liệu không tồn tại hoặc đã hết hạn xem. Vui lòng kiểm tra lại đường link hoặc liên hệ bộ phận hỗ trợ.";
            const notFoundError = new Error(errorMsg);
            notFoundError.isNotFound = true;
            notFoundError.response = error.response;
            throw notFoundError;
        }
        
        if (error.response?.status === 401) {
            const errorMsg = "Không có quyền truy cập tài liệu. Link có thể đã hết hạn hoặc không hợp lệ.";
            const unauthorizedError = new Error(errorMsg);
            unauthorizedError.isUnauthorized = true;
            unauthorizedError.response = error.response;
            throw unauthorizedError;
        }
        
        if (error.response?.status === 403) {
            const errorMsg = "Truy cập bị từ chối. Tài liệu có thể đã bị khóa hoặc hạn chế quyền xem.";
            const forbiddenError = new Error(errorMsg);
            forbiddenError.isForbidden = true;
            forbiddenError.response = error.response;
            throw forbiddenError;
        }
        
        if (error.code === 'ECONNABORTED') {
            const errorMsg = "Timeout khi tải tài liệu. Vui lòng kiểm tra kết nối mạng và thử lại.";
            const timeoutError = new Error(errorMsg);
            timeoutError.isTimeout = true;
            throw timeoutError;
        }
        
        // Lỗi khác
        const genericError = new Error(error.response?.data?.message || "Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại sau.");
        genericError.response = error.response;
        throw genericError;
    }
};
