/**
 * Hàm dịch các thông báo từ API từ tiếng Anh sang tiếng Việt
 */
const messageTranslations = {
    // Success messages
    'Appointment created successfully': 'Đặt lịch hẹn thành công!',
    'Appointment created': 'Đặt lịch hẹn thành công!',
    'Created successfully': 'Tạo thành công!',
    'Success': 'Thành công!',
    'Status updated successfully': 'Cập nhật trạng thái thành công!',
    'Updated successfully': 'Cập nhật thành công!',

    // Error messages
    'Appointment creation failed': 'Đặt lịch hẹn thất bại!',
    'Failed to create appointment': 'Đặt lịch hẹn thất bại!',
    'Creation failed': 'Tạo thất bại!',
    'Failed': 'Thất bại!',
    'Status update failed': 'Cập nhật trạng thái thất bại!',
    'Update failed': 'Cập nhật thất bại!',
    'Failed to load appointments': 'Không thể tải danh sách lịch hẹn',
    'Failed to load available slots': 'Không thể tải khung giờ có sẵn',
    'Failed to load customers': 'Không thể tải danh sách khách hàng',
    'Failed to load templates': 'Không thể tải danh sách template',
    'Server error': 'Lỗi từ máy chủ',
    'Network error': 'Lỗi kết nối mạng',
    'Connection error': 'Lỗi kết nối',
    'Unknown error': 'Lỗi không xác định',
    'Cannot connect to server': 'Không thể kết nối đến máy chủ',
    'Please select a date': 'Vui lòng chọn ngày hẹn!',
    'Please select a time slot': 'Vui lòng chọn khung giờ!',
    'Please select a status': 'Vui lòng chọn trạng thái!',
    'Please select a customer': 'Vui lòng chọn khách hàng',
    'Please select a template': 'Vui lòng chọn template xe',

    // Validation errors
    'Invalid date': 'Ngày không hợp lệ',
    'Invalid time slot': 'Khung giờ không hợp lệ',
    'Slot not available': 'Khung giờ không còn trống',
    'Time slot already booked': 'Khung giờ đã được đặt',
    'Date is required': 'Ngày là bắt buộc',
    'Time slot is required': 'Khung giờ là bắt buộc',
    'Customer is required': 'Khách hàng là bắt buộc',
    'Template is required': 'Template xe là bắt buộc',
};

/**
 * Dịch thông báo từ tiếng Anh sang tiếng Việt
 * @param {string} message - Thông báo cần dịch
 * @param {string} fallback - Thông báo tiếng Việt mặc định nếu không tìm thấy
 * @returns {string} - Thông báo đã dịch hoặc fallback
 */
export const translateMessage = (message, fallback = '') => {
    if (!message) return fallback;

    // Nếu message đã là tiếng Việt (chứa ký tự tiếng Việt), trả về nguyên bản
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
    if (vietnameseRegex.test(message)) {
        return message;
    }

    // Tìm kiếm trong bảng dịch
    const trimmedMessage = message.trim();
    const translated = messageTranslations[trimmedMessage];

    if (translated) {
        return translated;
    }

    // Nếu không tìm thấy và có fallback, trả về fallback
    if (fallback) {
        return fallback;
    }

    // Nếu không có fallback, trả về nguyên bản
    return message;
};

/**
 * Dịch thông báo thành công
 */
export const translateSuccessMessage = (message, fallback = 'Thao tác thành công!') => {
    return translateMessage(message, fallback);
};

/**
 * Dịch thông báo lỗi
 */
export const translateErrorMessage = (message, fallback = 'Đã xảy ra lỗi!') => {
    return translateMessage(message, fallback);
};

