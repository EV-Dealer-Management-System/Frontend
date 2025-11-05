import React from 'react';
import { Modal, Card, Tag, Steps, Row, Col, Divider, Collapse } from 'antd';
import {
    CarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    RocketOutlined,
    ShopOutlined,
    InboxOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

// Ánh xạ trạng thái giao xe
const deliveryStatusMap = {
    1: { text: 'Đang chuẩn bị', color: 'blue' },
    2: { text: 'Đang vận chuyển', color: 'orange' },
    3: { text: 'Đang giao hàng', color: 'cyan' },
    4: { text: 'Đã đến đại lý', color: 'purple' },
    5: { text: 'Giao nhận hoàn tất', color: 'green' },
};

// Component modal chi tiết đơn giao xe
function DeliveryDetailModal({ visible, onClose, delivery, templateSummary = [] }) {
    if (!delivery) return null;

    // Lọc templateSummary dựa trên VIN của delivery hiện tại
    const deliveryVINs = delivery.vehicleDeliveryDetails?.map(v => v.vin) || [];
    const filteredTemplateSummary = templateSummary
        .map(template => {
            // Lọc các VIN thuộc delivery này
            const matchedVINs = template.vinList.filter(vin => deliveryVINs.includes(vin));

            if (matchedVINs.length > 0) {
                return {
                    ...template,
                    vehicleCount: matchedVINs.length,
                    vinList: matchedVINs
                };
            }
            return null;
        })
        .filter(template => template !== null);

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

    const totalVehicles = filteredTemplateSummary?.reduce((sum, item) => sum + item.vehicleCount, 0) || 0;

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
                            <div className="text-gray-600 text-sm mb-1">Tổng số lượng xe</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {totalVehicles}
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
                                Đơn hàng: Gồm {filteredTemplateSummary?.length || 0} mẫu xe
                            </span>
                        </div>
                    }
                    className="shadow-sm"
                >
                    {filteredTemplateSummary?.length > 0 ? (
                        <Collapse
                            className="bg-transparent border-none"
                            expandIconPosition="end"
                        >
                            {filteredTemplateSummary.map((summary) => (
                                <Panel
                                    key={summary.templateId}
                                    header={
                                        <div className="flex items-center justify-between pr-4">
                                            <span className="font-semibold text-sm text-blue-700">
                                                {summary.versionName} - {summary.colorName}
                                            </span>
                                            <Tag color="blue">Số lượng: {summary.vehicleCount}</Tag>
                                        </div>
                                    }
                                    className="mb-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="text-xs text-gray-500 mb-2">Danh sách VIN:</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.vinList.map((vin) => (
                                            <div key={vin} className="font-mono bg-white px-3 py-2 border rounded text-xs">
                                                {vin}
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            ))}
                        </Collapse>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <CarOutlined className="text-5xl text-gray-300 mb-3" />
                            <div className="text-gray-400 text-sm">Không có thông tin tóm tắt xe.</div>
                        </div>
                    )}
                </Card>
            </div>
        </Modal>
    );
}

export default DeliveryDetailModal;
