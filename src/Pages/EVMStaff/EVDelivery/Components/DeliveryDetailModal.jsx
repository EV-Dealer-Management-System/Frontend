import React, { useState } from 'react';
import { Modal, Card, Tag, Row, Col, Divider, Collapse, Button, message, Popconfirm } from 'antd';
import {
    CarOutlined,
    CheckCircleOutlined,
    ToolOutlined,
    SwapOutlined
} from '@ant-design/icons';
import UpdateStatusButton from './UpdateStatusButton';
import InspectAccidentModal from './InspectAccidentModal';
import DeliveryProgressTimeline from './DeliveryProgressTimeline';
import { replaceDamagedEV } from '../../../../App/EVMStaff/EVDelivery/ReplaceDamagedEV';

const { Panel } = Collapse;

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

// Component modal chi tiết đơn giao xe
function DeliveryDetailModal({ visible, onClose, delivery, templateSummary = [], onStatusUpdated }) {
    const [showInspectModal, setShowInspectModal] = useState(false);
    const [hasInspectedAccident, setHasInspectedAccident] = useState(false);
    const [replacingVehicle, setReplacingVehicle] = useState(false);

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

    const totalVehicles = filteredTemplateSummary?.reduce((sum, item) => sum + item.vehicleCount, 0) || 0;

    // Xử lý điều xe thay thế
    const handleReplaceVehicle = async () => {
        setReplacingVehicle(true);
        try {
            const response = await replaceDamagedEV(delivery.id);

            if (response.isSuccess) {
                message.success('Đã điều xe thay thế thành công');
                setHasInspectedAccident(false);
                if (onStatusUpdated) {
                    onStatusUpdated();
                }
                onClose();
            } else {
                message.error(response.message || 'Không thể điều xe thay thế');
            }
        } catch (error) {
            console.error('Error replacing damaged EV:', error);
            message.error('Có lỗi xảy ra khi điều xe thay thế');
        } finally {
            setReplacingVehicle(false);
        }
    };

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
                {/* Trạng thái hiện tại và nút cập nhật */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
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
                            <div className="text-gray-600 text-sm mb-1">Tổng số lượng xe giao:  {totalVehicles} </div>

                        </div>
                    </div>

                    <Divider className="my-3" />

                    {/* Nút cập nhật trạng thái hoặc thông báo đã xác nhận */}
                    <div className="flex justify-between items-center">
                        {/* Bên trái: Nút cập nhật trạng thái */}
                        {delivery.status === 5 ? (
                            <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                                <CheckCircleOutlined className="text-base" />
                                Đơn giao xe đã được bên đại lý xác nhận
                            </div>
                        ) : (
                            <UpdateStatusButton
                                deliveryId={delivery.id}
                                currentStatus={delivery.status}
                                onSuccess={() => {
                                    if (onStatusUpdated) {
                                        onStatusUpdated();
                                    }
                                    onClose();
                                }}
                            />
                        )}

                        {/* Bên phải: Nút kiểm tra xe bị sự cố hoặc điều xe thay thế */}
                        {delivery.status === 6 && !hasInspectedAccident && (
                            <Button
                                type="default"
                                danger
                                icon={<ToolOutlined />}
                                onClick={() => setShowInspectModal(true)}
                                className="flex items-center gap-2"
                            >
                                Kiểm tra xe bị hư hỏng
                            </Button>
                        )}

                        {delivery.status === 6 && hasInspectedAccident && (
                            <Popconfirm
                                title="Xác nhận điều xe thay thế"
                                description="Bạn có chắc chắn muốn điều xe thay thế cho các xe bị hư hỏng?"
                                onConfirm={handleReplaceVehicle}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                okButtonProps={{ loading: replacingVehicle }}
                            >
                                <Button
                                    type="primary"
                                    icon={<SwapOutlined />}
                                    loading={replacingVehicle}
                                    className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                                >
                                    Điều xe thay thế
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                </Card>

                {/* Timeline theo dõi */}
                <DeliveryProgressTimeline deliveryStatus={delivery.status} />

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
                                    <div className="grid grid-cols-1 gap-2">
                                        {summary.vinList.map((vin) => {
                                            // Tìm thông tin chi tiết của xe theo VIN
                                            const vehicleDetail = delivery.vehicleDeliveryDetails?.find(v => v.vin === vin);

                                            return (
                                                <div key={vin} className="bg-white px-3 py-2 border rounded">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="font-mono text-xs font-semibold text-gray-700 mb-1">
                                                                {vin}
                                                            </div>
                                                            {vehicleDetail?.note && (
                                                                <div className="text-xs text-gray-600 italic">
                                                                    <span className="font-medium">Ghi chú:</span> {vehicleDetail.note}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

            {/* Modal kiểm tra xe bị sự cố */}
            <InspectAccidentModal
                visible={showInspectModal}
                onClose={() => setShowInspectModal(false)}
                delivery={delivery}
                templateSummary={templateSummary}
                onSuccess={() => {
                    setHasInspectedAccident(true);
                    if (onStatusUpdated) {
                        onStatusUpdated();
                    }
                }}
            />
        </Modal>
    );
}

export default DeliveryDetailModal;
