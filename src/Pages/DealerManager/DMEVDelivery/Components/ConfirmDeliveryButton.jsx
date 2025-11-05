import React, { useState } from 'react';
import { Button, message, Popconfirm } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { updateEVDeliveryStatus } from '../../../../App/DealerManager/EVDelivery/UpdateEVDeliveryStatus';

// Enum trạng thái giao xe
const DeliveryStatus = {
    Preparing: 1,
    Packing: 2,
    InTransit: 3,
    Arrived: 4,      // Đã đến đại lý - Điều kiện để hiện nút
    Confirmed: 5,    // Đã xác nhận - Trạng thái sẽ update thành
    Accident: 6,
    Delayed: 7
};

// Component nút xác nhận giao xe (chỉ cho DealerManager)
function ConfirmDeliveryButton({ deliveryId, currentStatus, onSuccess }) {
    const [loading, setLoading] = useState(false);

    // Chỉ hiển thị nút khi status = 4 (Đã đến đại lý)
    if (currentStatus !== DeliveryStatus.Arrived) {
        return null;
    }

    // Xử lý xác nhận đã nhận xe
    const handleConfirm = async () => {
        setLoading(true);
        try {
            const response = await updateEVDeliveryStatus(deliveryId, DeliveryStatus.Confirmed);

            if (response.isSuccess) {
                message.success('Đã xác nhận nhận xe thành công');
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(response.message || 'Không thể xác nhận nhận xe');
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
            message.error('Có lỗi xảy ra khi xác nhận nhận xe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popconfirm
            title="Xác nhận đã nhận xe"
            description="Bạn xác nhận đã nhận đủ số lượng xe theo đơn hàng? Hành động này không thể hoàn tác."
            onConfirm={handleConfirm}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: false, className: 'bg-green-600 hover:bg-green-700' }}
        >
            <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
            >
                Xác nhận đã nhận xe
            </Button>
        </Popconfirm>
    );
}

export default ConfirmDeliveryButton;
