import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space } from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { updateEVDeliveryStatus } from '../../../../App/EVMStaff/EVDelivery/UpdateEVDeliveryStatus';

const { TextArea } = Input;

function InspectDelayModal({ visible, onClose, delivery, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Gọi API cập nhật status với delay note
            const response = await updateEVDeliveryStatus(
                delivery.id,
                7, // Status chậm trễ
                values.delayNote || ''
            );

            if (response.isSuccess) {
                message.success('Đã ghi nhận tình trạng chậm trễ thành công');
                form.resetFields();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(response.message || 'Không thể cập nhật tình trạng chậm trễ');
            }
        } catch (error) {
            console.error('Error updating delay status:', error);
            message.error('Có lỗi xảy ra khi cập nhật tình trạng chậm trễ');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <ClockCircleOutlined className="text-orange-600 text-xl" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-orange-700">Ghi nhận chậm trễ giao xe</div>
                        <div className="text-xs text-gray-500 font-normal">
                            Tracking ID: {delivery?.id?.slice(0, 13)}...
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            className="inspect-delay-modal"
        >
            <div className="pt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <ClockCircleOutlined className="text-orange-600 text-xl mt-1" />
                        <div>
                            <div className="font-medium text-orange-800 mb-2">
                                Thông báo chậm trễ giao xe
                            </div>
                            <div className="text-sm text-orange-700">
                                Vui lòng mô tả chi tiết nguyên nhân và tình trạng chậm trễ của đơn giao xe này.
                                Thông tin này sẽ được gửi đến đại lý để họ có thể theo dõi và điều chỉnh kế hoạch.
                            </div>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="space-y-4"
                >
                    <Form.Item
                        name="delayNote"
                        label={
                            <span className="text-base font-semibold flex items-center gap-2">
                                <FileTextOutlined className="text-orange-600" />
                                Mô tả chi tiết tình trạng chậm trễ
                                <span className="text-red-500">*</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập mô tả chi tiết!' },
                            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                            { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                        ]}
                    >
                        <TextArea
                            placeholder="VD: Do thời tiết xấu, xe gặp sự cố trên đường, hoãn lịch vận chuyển..."
                            rows={4}
                            showCount
                            maxLength={500}
                            className="resize-none"
                        />
                    </Form.Item>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Lưu ý:</strong>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                            <li>Mô tả cần rõ ràng, chi tiết về nguyên nhân chậm trễ</li>
                            <li>Nêu thời gian dự kiến hoàn thành (nếu có)</li>
                            <li>Thông tin sẽ được thông báo đến đại lý tương ứng</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button 
                            size="large" 
                            onClick={handleCancel}
                            className="px-6"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={loading}
                            icon={<ClockCircleOutlined />}
                            className="bg-orange-600 hover:bg-orange-700 px-6"
                        >
                            Xác nhận chậm trễ
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}

export default InspectDelayModal;
