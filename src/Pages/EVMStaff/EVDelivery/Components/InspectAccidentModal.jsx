import React, { useState } from 'react';
import { Modal, Table, Button, message, Tag } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EVinspectAccident } from '../../../../App/EVMStaff/EVDelivery/EVDeliveryInspectAccident';

// Component modal kiểm tra xe bị sự cố
function InspectAccidentModal({ visible, onClose, delivery, templateSummary = [], onSuccess }) {
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!delivery) return null;

    // Lọc templateSummary dựa trên VIN của delivery hiện tại
    const deliveryVINs = delivery.vehicleDeliveryDetails?.map(v => v.vin) || [];
    const filteredTemplateSummary = templateSummary
        .map(template => {
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

    // Tạo danh sách xe từ vehicleDeliveryDetails
    const vehicleList = delivery.vehicleDeliveryDetails?.map(detail => ({
        key: detail.electricVehicleId,
        electricVehicleId: detail.electricVehicleId,
        vin: detail.vin,
        // Tìm thông tin template tương ứng
        template: filteredTemplateSummary.find(t => t.vinList.includes(detail.vin))
    })) || [];

    // Cột của bảng
    const columns = [
        {
            title: 'VIN',
            dataIndex: 'vin',
            key: 'vin',
            render: (vin) => <span className="font-mono text-xs">{vin}</span>
        },
        {
            title: 'Mẫu xe',
            key: 'model',
            render: (_, record) => (
                <span className="text-sm">
                    {record.template?.versionName || 'N/A'}
                </span>
            )
        },
        {
            title: 'Màu sắc',
            key: 'color',
            render: (_, record) => (
                <Tag color="blue">{record.template?.colorName || 'N/A'}</Tag>
            )
        }
    ];

    // Cấu hình rowSelection
    const rowSelection = {
        selectedRowKeys: selectedVehicles,
        onChange: (selectedRowKeys) => {
            setSelectedVehicles(selectedRowKeys);
        },
        getCheckboxProps: (record) => ({
            name: record.vin,
        }),
    };

    // Xử lý kiểm tra xe bị hư hỏng
    const handleInspect = async () => {
        if (selectedVehicles.length === 0) {
            message.warning('Vui lòng chọn ít nhất một xe để kiểm tra');
            return;
        }

        setLoading(true);
        try {
            // Gọi API cho từng xe được chọn
            const promises = selectedVehicles.map(electricVehicleId =>
                EVinspectAccident(delivery.id, electricVehicleId)
            );

            const results = await Promise.all(promises);

            // Kiểm tra kết quả
            const allSuccess = results.every(result => result.isSuccess);

            if (allSuccess) {
                message.success(`Đã kiểm tra thành công ${selectedVehicles.length} xe bị hư hỏng`);
                setSelectedVehicles([]);
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                message.error('Một số xe không thể kiểm tra, vui lòng thử lại');
            }
        } catch (error) {
            console.error('Error inspecting accident:', error);
            message.error('Có lỗi xảy ra khi kiểm tra xe bị hư hỏng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <ExclamationCircleOutlined className="text-red-600 text-xl" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold">Kiểm tra xe bị sự cố</div>
                        <div className="text-xs text-gray-500 font-normal">Chọn xe bị hư hỏng trong đơn giao</div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={loading}
                    onClick={handleInspect}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={selectedVehicles.length === 0}
                >
                    Xác nhận xe hư hỏng ({selectedVehicles.length})
                </Button>
            ]}
        >
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <ExclamationCircleOutlined className="text-red-600 text-lg mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-red-800 mb-1">
                                Đơn giao xe đang ở trạng thái sự cố
                            </div>
                            <div className="text-xs text-red-600">
                                Vui lòng chọn các xe bị hư hỏng trong đơn giao này để tiến hành kiểm tra và xử lý
                            </div>
                        </div>
                    </div>
                </div>

                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={vehicleList}
                    pagination={false}
                    scroll={{ y: 400 }}
                    size="small"
                    bordered
                />

                {selectedVehicles.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm text-blue-800">
                            <CheckCircleOutlined className="mr-2" />
                            Đã chọn {selectedVehicles.length} xe để kiểm tra
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default InspectAccidentModal;
