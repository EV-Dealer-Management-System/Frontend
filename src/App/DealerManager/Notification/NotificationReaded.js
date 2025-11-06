import api from '../../../api/api';

/**
 * Đánh dấu một thông báo đã đọc
 * @param {string} notificationId - ID của thông báo cần đánh dấu đã đọc
 * @returns {Promise} - Promise chứa response từ API
 */
export const readNotification = async (notificationId) => {
    try {
        const response = await api.post(`/Notification/read-notification?notificationId=${notificationId}`);
        
        console.log(`✅ Mark notification ${notificationId} as read:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error marking notification ${notificationId} as read:`, error);
        throw error;
    }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise} - Promise chứa response từ API
 */
export const readAllNotifications = async () => {
    try {
        const response = await api.post('/Notification/read-all-notification');
        
        console.log('✅ Mark all notifications as read:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        throw error;
    }
};
