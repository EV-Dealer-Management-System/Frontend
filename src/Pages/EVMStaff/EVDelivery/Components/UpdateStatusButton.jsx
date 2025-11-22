import React, { useState } from 'react';
import { Button, Select, Space, message, Popconfirm, Input } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateEVDeliveryStatus } from '../../../../App/EVMStaff/EVDelivery/UpdateEVDeliveryStatus';

const { TextArea } = Input;

// Enum trạng thái giao xe
const DeliveryStatus = {
    Preparing: 1,     // Đang chuẩn bị
    Packing: 2,       // Đang đóng gói
    InTransit: 3,     // Đang vận chuyển
    Arrived: 4,       // Đã đến đại lý
    Confirmed: 5,     // Đã xác nhận (không được chỉnh sửa)
    Accident: 6,      // Sự cố
    Delayed: 7        // Chậm trễ
};

// Ánh xạ hiển thị trạng thái
const statusOptions = [
    { value: DeliveryStatus.Preparing, label: 'Đang chuẩn bị', color: 'blue' },
    { value: DeliveryStatus.Packing, label: 'Đang đóng gói', color: 'cyan' },
    { value: DeliveryStatus.InTransit, label: 'Đang vận chuyển', color: 'orange' },
    { value: DeliveryStatus.Arrived, label: 'Đã đến đại lý', color: 'green' },
    { value: DeliveryStatus.Accident, label: 'Sự cố', color: 'red' },
    { value: DeliveryStatus.Delayed, label: 'Chậm trễ', color: 'volcano' },
];

// Component nút cập nhật trạng thái
function UpdateStatusButton({ deliveryId, currentStatus, onSuccess }) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const [accidentNote, setAccidentNote] = useState('');
    const [delayNote, setDelayNote] = useState('');
    const [showAccidentError, setShowAccidentError] = useState(false);
    const [showDelayError, setShowDelayError] = useState(false);

    // Không cho phép cập nhật nếu đã xác nhận
    if (currentStatus === DeliveryStatus.Confirmed) {
        return null;
    }

    // Xử lý cập nhật trạng thái
    const handleUpdateStatus = async () => {
        if (selectedStatus === currentStatus) {
            message.warning('Vui lòng chọn trạng thái khác để cập nhật');
            return;
        }

        // Kiểm tra nếu chọn "Sự cố" thì phải nhập ghi chú
        if (selectedStatus === DeliveryStatus.Accident && !accidentNote.trim()) {
            setShowAccidentError(true);
            message.error('Vui lòng nhập ghi chú sự cố');
            return;
        }

        // Kiểm tra nếu chọn "Chậm trễ" thì phải nhập ghi chú
        if (selectedStatus === DeliveryStatus.Delayed && !delayNote.trim()) {
            setShowDelayError(true);
            message.error('Vui lòng nhập lý do chậm trễ');
            return;
        }

        setLoading(true);
        try {
            let statusNote = "";
            if (selectedStatus === DeliveryStatus.Accident) {
                statusNote = accidentNote;
            } else if (selectedStatus === DeliveryStatus.Delayed) {
                statusNote = delayNote;
            }

            const response = await updateEVDeliveryStatus(
                deliveryId,
                selectedStatus,
                statusNote
            );

            if (response.isSuccess) {
                message.success('Cập nhật trạng thái thành công');
                setIsEditing(false);
                setAccidentNote('');
                setDelayNote('');
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    // Hủy chỉnh sửa
    const handleCancel = () => {
        setSelectedStatus(currentStatus);
        setAccidentNote('');
        setDelayNote('');
        setShowAccidentError(false);
        setShowDelayError(false);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
            >
                Cập nhật trạng thái
            </Button>
        );
    }

    return (
        <Space direction="vertical" className="w-full">
            <Space className="w-full">
                <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    className="w-48"
                    options={statusOptions.map(option => ({
                        value: option.value,
                        label: (
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: `var(--ant-${option.color}-6)` }}
                                />
                                {option.label}
                            </span>
                        ),
                    }))}
                />

                <Popconfirm
                    title="Xác nhận cập nhật trạng thái"
                    description={`Bạn có chắc muốn cập nhật trạng thái sang "${statusOptions.find(s => s.value === selectedStatus)?.label}"?`}
                    onConfirm={handleUpdateStatus}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={loading}
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                            // Validate trước khi hiện Popconfirm
                            if (selectedStatus === DeliveryStatus.Accident && !accidentNote.trim()) {
                                e.stopPropagation();
                                setShowAccidentError(true);
                                message.error('Vui lòng nhập ghi chú sự cố');
                                return;
                            }
                            if (selectedStatus === DeliveryStatus.Delayed && !delayNote.trim()) {
                                e.stopPropagation();
                                setShowDelayError(true);
                                message.error('Vui lòng nhập lý do chậm trễ');
                                return;
                            }
                        }}
                    >
                        Lưu
                    </Button>
                </Popconfirm>

                <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Hủy
                </Button>
            </Space>

            {/* Hiển thị textarea khi chọn trạng thái Sự cố */}
            {selectedStatus === DeliveryStatus.Accident && (
                <div className="w-full">
                    <TextArea
                        value={accidentNote}
                        onChange={(e) => {
                            setAccidentNote(e.target.value);
                            if (e.target.value.trim()) {
                                setShowAccidentError(false);
                            }
                        }}
                        placeholder="Nhập mô tả chi tiết về sự cố..."
                        rows={3}
                        className="w-full"
                        maxLength={500}
                        showCount
                        status={showAccidentError ? 'error' : ''}
                        style={showAccidentError ? {
                            borderColor: '#ff4d4f',
                            boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)'
                        } : {}}
                    />
                    {showAccidentError && (
                        <div className="text-red-500 text-xs mt-1 flex items-center gap-1 ">
                            <span>Bắt buộc phải nhập mô tả</span>
                        </div>
                    )}
                </div>
            )}

            {/* Hiển thị textarea khi chọn trạng thái Chậm trễ */}
            {selectedStatus === DeliveryStatus.Delayed && (
                <div className="w-full">
                    <TextArea
                        value={delayNote}
                        onChange={(e) => {
                            setDelayNote(e.target.value);
                            if (e.target.value.trim()) {
                                setShowDelayError(false);
                            }
                        }}
                        placeholder="Nhập lý do chi tiết về việc chậm trễ giao hàng..."
                        rows={3}
                        className="w-full"
                        maxLength={500}
                        showCount
                        status={showDelayError ? 'error' : ''}
                        style={showDelayError ? {
                            borderColor: '#ff4d4f',
                            boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)'
                        } : {}}
                    />
                    {showDelayError && (
                        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Bắt buộc phải nhập lý do chậm trễ để chuyển trạng thái</span>
                        </div>
                    )}
                </div>
            )}
        </Space>
    );
}

export default UpdateStatusButton;
