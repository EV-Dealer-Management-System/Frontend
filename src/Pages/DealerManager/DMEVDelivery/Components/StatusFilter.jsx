import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

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

// Component bộ lọc trạng thái
function StatusFilter({ value, onChange }) {
    return (
        <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={onChange}
            value={value}
        >
            {Object.entries(deliveryStatusMap).map(([key, statusInfo]) => (
                <Option key={key} value={parseInt(key)}>
                    {statusInfo.text}
                </Option>
            ))}
        </Select>
    );
}

export default StatusFilter;
