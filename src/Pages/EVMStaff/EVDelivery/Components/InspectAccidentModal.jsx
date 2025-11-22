import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message, Tag, Input, Spin } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { EVinspectAccident } from '../../../../App/EVMStaff/EVDelivery/EVDeliveryInspectAccident';
import { getAllEVDelivery } from '../../../../App/EVMStaff/EVDelivery/GetAllEVDelivery';

// Component modal kiểm tra xe bị sự cố
function InspectAccidentModal({ visible, onClose, delivery, templateSummary = [], onSuccess, inspectedVehicles = [] }) {
    const [selectedVehicles, setSelectedVehicles] = useState(inspectedVehicles);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // State for handling isShow=true data
    const [currentDelivery, setCurrentDelivery] = useState(delivery);
    const [currentTemplateSummary, setCurrentTemplateSummary] = useState(templateSummary);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    if (!delivery) return null;

    // Fetch delivery with isShow=true when modal opens
    useEffect(() => {
        if (visible && delivery) {
            const fetchDetails = async () => {
                setFetchingDetails(true);
                try {
                    // Fetch with isShow=true to get vehicles available for inspection
                    // Using large page size to find the delivery
                    const res = await getAllEVDelivery(1, 1000, delivery.status, true);
                    if (res.isSuccess && res.result?.data) {
                        const found = res.result.data.find(d => d.id === delivery.id);
                        if (found) {
                            setCurrentDelivery(found);
                        }
                        if (res.result.templateSummary) {
                            setCurrentTemplateSummary(res.result.templateSummary);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching delivery details for inspection:", error);
                    // Fallback to original delivery if fetch fails
                    setCurrentDelivery(delivery);
                } finally {
                    setFetchingDetails(false);
                }
            };
            fetchDetails();
        } else {
            // Reset to props when closed or changed
            setCurrentDelivery(delivery);
            setCurrentTemplateSummary(templateSummary);
        }
    }, [visible, delivery]);

    // Lọc templateSummary dựa trên VIN của delivery hiện tại
    const deliveryVINs = currentDelivery?.vehicleDeliveryDetails?.map(v => v.vin) || [];
    const filteredTemplateSummary = currentTemplateSummary
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
    const vehicleList = currentDelivery?.vehicleDeliveryDetails?.map(detail => ({
        isShow: true,
        key: detail.electricVehicleId,
        electricVehicleId: detail.electricVehicleId,
        vin: detail.vin,
        // Tìm thông tin template tương ứng
        template: filteredTemplateSummary.find(t => t.vinList.includes(detail.vin))
    })) || [];

    // Lọc danh sách xe theo search text
    const filteredVehicleList = vehicleList.filter(vehicle =>
        vehicle.vin.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.template?.versionName?.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.template?.colorName?.toLowerCase().includes(searchText.toLowerCase())
    );

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

    // Đồng bộ selectedVehicles với inspectedVehicles khi modal mở lại
    React.useEffect(() => {
        if (visible) {
            setSelectedVehicles(inspectedVehicles);
        }
    }, [visible, inspectedVehicles]);

    // Xử lý kiểm tra xe bị hư hỏng
    const handleInspect = async () => {
        if (selectedVehicles.length === 0) {
            message.warning('Vui lòng chọn ít nhất một xe để kiểm tra');
            return;
        }

        setLoading(true);
        try {
            // Gọi API một lần với mảng tất cả electricVehicleIds
            const response = await EVinspectAccident(delivery.id, selectedVehicles);

            if (response.isSuccess) {
                message.success(`Đã kiểm tra thành công ${selectedVehicles.length} xe bị hư hỏng`);

                // Gọi callback để cập nhật dữ liệu
                if (onSuccess) {
                    await onSuccess(selectedVehicles);
                }

                // Đóng modal sau khi cập nhật xong
                onClose();
            } else {
                message.error(response.message || 'Không thể kiểm tra xe, vui lòng thử lại');
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
                <Button key="cancel" onClick={onClose} disabled={loading || fetchingDetails}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={loading}
                    onClick={handleInspect}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={selectedVehicles.length === 0 || fetchingDetails}
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

                {fetchingDetails ? (
                    <div className="flex justify-center py-10">
                        <Spin tip="Đang tải thông tin xe..." />
                    </div>
                ) : (
                    <>
                        {/* Thanh tìm kiếm VIN */}
                        <Input
                            placeholder="Tìm kiếm theo VIN, mẫu xe hoặc màu sắc..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                            className="rounded-lg"
                        />

                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={filteredVehicleList}
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
                                    {inspectedVehicles.length > 0 && (
                                        <span className="ml-2 text-xs text-gray-600">
                                            (Trong đó có {inspectedVehicles.length} xe đã kiểm tra trước đó)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}

export default InspectAccidentModal;
