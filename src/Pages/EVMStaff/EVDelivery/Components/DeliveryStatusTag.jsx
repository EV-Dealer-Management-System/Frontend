import React from 'react';
import { Tag } from 'antd';

// Ánh xạ trạng thái giao xe
const deliveryStatusMap = {
    1: { text: 'Đang chuẩn bị', color: 'blue' },
    2: { text: 'Đang vận chuyển', color: 'orange' },
    3: { text: 'Đang giao hàng', color: 'cyan' },
    4: { text: 'Đã đến đại lý', color: 'purple' },
    5: { text: 'Giao nhận hoàn tất', color: 'green' },
};

// Component hiển thị tag trạng thái giao xe
function DeliveryStatusTag({ status }) {
    const statusInfo = deliveryStatusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
}

export default DeliveryStatusTag;

