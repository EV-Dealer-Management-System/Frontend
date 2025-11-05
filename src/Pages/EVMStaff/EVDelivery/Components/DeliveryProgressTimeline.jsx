import React from 'react';
import { Card, Steps } from 'antd';
import {
    CarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    RocketOutlined,
    ShopOutlined,
    InboxOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

// Component timeline tiến trình giao hàng
function DeliveryProgressTimeline({ deliveryStatus }) {
    // Xác định bước hiện tại cho timeline
    const getCurrentStep = (status) => {
        if (status === 6) return 3; // Sự cố
        if (status === 5) return 4; // Hoàn tất (không có sự cố)
        if (status === 4) return 3; // Đã đến đại lý (không có sự cố)
        if (status === 3) return 2; // Đang giao hàng
        if (status === 2) return 1; // Đang vận chuyển
        return 0; // Đang chuẩn bị
    };

    // Tạo danh sách steps động - chỉ thêm "Sự cố" nếu delivery có status = 6
    const statusSteps = [
        {
            title: 'Chuẩn bị',
            icon: <InboxOutlined />,
            description: 'Đang chuẩn bị xe'
        },
        {
            title: 'Vận chuyển',
            icon: <RocketOutlined />,
            description: 'Xe đang được vận chuyển'
        },
        {
            title: 'Giao hàng',
            icon: <CarOutlined />,
            description: 'Đang giao hàng đến đại lý'
        },
        // Chỉ thêm step "Sự cố" nếu delivery có status = 6
        ...(deliveryStatus === 6 ? [{
            title: 'Sự cố',
            icon: <ExclamationCircleOutlined />,
            description: 'Xe gặp sự cố',
            status: 'error'
        }] : []),
        {
            title: 'Đến đại lý',
            icon: <ShopOutlined />,
            description: 'Xe đã đến đại lý'
        },
        {
            title: 'Hoàn tất',
            icon: <CheckCircleOutlined />,
            description: 'Giao nhận hoàn tất'
        }
    ];

    return (
        <Card
            title={
                <span className="font-semibold">
                    <ClockCircleOutlined className="mr-2" />
                    Tiến trình giao hàng
                </span>
            }
            className="shadow-sm"
        >
            <Steps
                current={getCurrentStep(deliveryStatus)}
                items={statusSteps}
                className="px-4"
                labelPlacement="vertical"
            />
        </Card>
    );
}

export default DeliveryProgressTimeline;
