import React from 'react';
import { Modal, Card, Tag, Steps, Row, Col, Divider } from 'antd';
import {
    CarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    RocketOutlined,
    ShopOutlined,
    InboxOutlined
} from '@ant-design/icons';

// Ánh xạ trạng thái giao xe
const deliveryStatusMap = {
    1: { text: 'Đang chuẩn bị', color: 'blue' },
    2: { text: 'Đang vận chuyển', color: 'orange' },
    3: { text: 'Đang giao hàng', color: 'cyan' },
    4: { text: 'Đã đến đại lý', color: 'purple' },
    5: { text: 'Giao nhận hoàn tất', color: 'green' },
};

// Ánh xạ trạng thái chi tiết xe
const vehicleStatusMap = {
    1: { text: 'Chờ xử lý', color: 'default' },
    2: { text: 'Đang vận chuyển', color: 'processing' },
    3: { text: 'Đã giao', color: 'success' },
};

// Component modal chi tiết đơn giao xe
function DeliveryDetailModal({ visible, onClose, delivery }) {
    if (!delivery) return null;

    // Xác định bước hiện tại cho timeline
    const getCurrentStep = (status) => {
        if (status === 5) return 4; // Hoàn tất
        if (status === 4) return 3; // Đã đến đại lý
        if (status === 3) return 2; // Đang giao hàng
        if (status === 2) return 1; // Đang vận chuyển
        return 0; // Đang chuẩn bị
    };

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
        <Modal
            title={
                <div className="flex items-center gap-3 pb-2 border-b">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CarOutlined className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold">Chi tiết đơn giao xe</div>
                        <div className="text-xs text-gray-500 font-normal">Tracking ID: {delivery.id.slice(0, 13)}...</div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            className="delivery-detail-modal"
        >
            <div className="space-y-6 pt-4">
                {/* Trạng thái hiện tại nổi bật */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-600 text-sm mb-1">Trạng thái hiện tại</div>
                            <Tag
                                color={deliveryStatusMap[delivery.status]?.color}
                                className="text-base px-4 py-1"
                            >
                                {deliveryStatusMap[delivery.status]?.text}
                            </Tag>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-600 text-sm mb-1">Số lượng xe</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {delivery.vehicleDeliveryDetails?.length || 0}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Timeline theo dõi */}
                <Card title={<span className="font-semibold"><ClockCircleOutlined className="mr-2" />Tiến trình giao hàng</span>} className="shadow-sm">
                    <Steps
                        current={getCurrentStep(delivery.status)}
                        items={statusSteps}
                        className="px-4"
                    />
                </Card>

                {/* Thông tin chi tiết */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Card
                            title="Thông tin đơn hàng"
                            size="small"
                            className="h-full shadow-sm"
                        >
                            <div className="space-y-3">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Mã Booking</div>
                                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {delivery.bookingEVId}
                                    </div>
                                </div>
                                <Divider className="my-2" />
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Mô tả</div>
                                    <div className="text-sm">{delivery.description}</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card
                            title="Thời gian"
                            size="small"
                            className="h-full shadow-sm"
                        >
                            <div className="space-y-3">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Ngày tạo</div>
                                    <div className="text-sm font-medium">
                                        {new Date(delivery.createdDate).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <Divider className="my-2" />
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Cập nhật lần cuối</div>
                                    <div className="text-sm font-medium text-blue-600">
                                        {new Date(delivery.updateAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Danh sách xe */}
                <Card
                    title={
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">
                                <CarOutlined className="mr-2" />
                                Danh sách xe ({delivery.vehicleDeliveryDetails?.length || 0})
                            </span>
                        </div>
                    }
                    className="shadow-sm"
                >
                    {delivery.vehicleDeliveryDetails?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {delivery.vehicleDeliveryDetails.map((vehicle, index) => (
                                <Card
                                    key={vehicle.id}
                                    size="small"
                                    className="bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                #{index + 1}
                                            </span>
                                            <Tag color={vehicleStatusMap[vehicle.status]?.color}>
                                                {vehicleStatusMap[vehicle.status]?.text}
                                            </Tag>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-blue-100">
                                            <div className="text-xs text-gray-500 mb-1">VIN Number</div>
                                            <div className="font-mono font-bold text-blue-700 text-sm">
                                                {vehicle.vin}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            <span className="font-medium">Mã xe:</span>
                                            <div className="font-mono mt-1 bg-gray-50 px-2 py-1 rounded">
                                                {vehicle.electricVehicleId}
                                            </div>
                                        </div>
                                        {/* {vehicle.note && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                                                <span className="font-medium text-yellow-800">📝 Ghi chú:</span>
                                                <div className="text-gray-700 mt-1">{vehicle.note}</div>
                                            </div>
                                        )} */}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <CarOutlined className="text-5xl text-gray-300 mb-3" />
                            <div className="text-gray-400 text-sm">Chưa có xe nào được gán vào đơn giao này</div>
                        </div>
                    )}
                </Card>
            </div>
        </Modal>
    );
}

export default DeliveryDetailModal;
