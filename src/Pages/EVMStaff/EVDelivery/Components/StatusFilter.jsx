import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

// Ánh xạ trạng thái giao xe
const deliveryStatusMap = {
    1: { text: 'Đang chuẩn bị', color: 'blue' },
    2: { text: 'Đang vận chuyển', color: 'orange' },
    3: { text: 'Đang giao hàng', color: 'cyan' },
    4: { text: 'Đã đến đại lý', color: 'purple' },
    5: { text: 'Giao nhận hoàn tất', color: 'green' },
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
