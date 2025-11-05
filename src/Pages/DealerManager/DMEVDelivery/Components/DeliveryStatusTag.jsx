import React from 'react';
import { Tag } from 'antd';

// Ánh xạ trạng thái giao xe theo enum DeliveryStatus
const deliveryStatusMap = {
    1: { text: 'Đang chuẩn bị', color: 'blue' },        // Preparing
    2: { text: 'Đang đóng gói', color: 'cyan' },        // Packing
    3: { text: 'Đang vận chuyển', color: 'orange' },    // InTransit
    4: { text: 'Đã đến đại lý', color: 'purple' },      // Arrived
    5: { text: 'Đã xác nhận', color: 'green' },         // Confirmed
    6: { text: 'Sự cố', color: 'red' },                 // Accident
    7: { text: 'Chậm trễ', color: 'volcano' },          // Delayed
};

// Component hiển thị tag trạng thái giao xe
function DeliveryStatusTag({ status }) {
    const statusInfo = deliveryStatusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
}

export default DeliveryStatusTag;
