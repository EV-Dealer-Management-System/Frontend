import api from '../../../api/api';

/**
 * Lấy danh sách tất cả thông báo
 * @param {number} pageNumber - Số trang (mặc định: 1)
 * @param {number} pageSize - Số item trên mỗi trang (mặc định: 50)
 * @returns {Promise} - Promise chứa response từ API
 */
export const getAllNotification = async (pageNumber = 1, pageSize = 50) => {
    try {
        const response = await api.get('/Notification/get-all-notification', {
            params: {
                pageNumber,
                pageSize
            }
        });
        
        console.log('📧 Get all notifications response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
    }
};
