import api from "../../../api/api";

/**
 * API thanh toán đơn hàng mới (cho trạng thái "chờ cọc" và "chờ thanh toán toàn phần")
 * POST: /CustomerOrder/pay-customer-order
 */
export const payCustomerOrder = async (customerOrderId, isPayFull, isCash) => {
    try {
        const payload = {
            customerOrderId,
            isPayFull,
            isCash
        };
        
        console.log("Calling payCustomerOrder with payload:", payload);
        
        const response = await api.post('/CustomerOrder/pay-customer-order', payload);
        console.log("Response from payCustomerOrder:", response.data);
        
        return {
            isSuccess: true,
            data: response.data,
            message: response.data?.message || 'Thanh toán thành công'
        };
    }
    catch (error) {
        console.error("Error in payCustomerOrder:", error);
        
        let errorMessage = "Có lỗi xảy ra khi thanh toán";
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = "Đơn hàng không tồn tại";
        } else if (error.response?.status === 400) {
            errorMessage = "Thông tin thanh toán không hợp lệ";
        } else if (error.response?.status === 401) {
            errorMessage = "Không có quyền thực hiện thanh toán";
        }
        
        return {
            isSuccess: false,
            message: errorMessage,
            error: error
        };
    }
};

/**
 * API thanh toán phần còn lại sau khi đã cọc
 * PUT: /CustomerOrder/pay-deposit-customer-order/{customerOrderId}
 */
export const payDepositCustomerOrder = async (customerOrderId, isCash) => {
    try {
        console.log("Calling payDepositCustomerOrder:", { customerOrderId, isCash });
        
        const response = await api.put(
            `/CustomerOrder/pay-deposit-customer-order/${customerOrderId}`, 
            { isCash }
        );
        console.log("Response from payDepositCustomerOrder:", response.data);
        
        return {
            isSuccess: true,
            data: response.data,
            message: response.data?.message || 'Thanh toán thành công'
        };
    }
    catch (error) {
        console.error("Error in payDepositCustomerOrder:", error);
        
        let errorMessage = "Có lỗi xảy ra khi thanh toán";
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = "Đơn hàng không tồn tại";
        } else if (error.response?.status === 400) {
            errorMessage = "Thông tin thanh toán không hợp lệ";
        } else if (error.response?.status === 401) {
            errorMessage = "Không có quyền thực hiện thanh toán";
        }
        
        return {
            isSuccess: false,
            message: errorMessage,
            error: error
        };
    }
};