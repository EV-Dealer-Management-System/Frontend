import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, FileTextOutlined, IdcardOutlined } from '@ant-design/icons';
import { updateCustomer } from '../../../../App/DealerManager/CustomerManagement/GetAllCustomer';

const { TextArea } = Input;

function CustomerEditModal({ visible, onCancel, onSuccess, customerData }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && customerData) {
            // Pre-fill form with existing customer data
            form.setFieldsValue({
                fullName: customerData.fullName || '',
                phoneNumber: customerData.phoneNumber || '',
                citizenID: customerData.citizenID || '',
                email: customerData.email || '',
                address: customerData.address || '',
                note: customerData.note || ''
            });
        }
    }, [visible, customerData, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            // Prepare payload according to API spec
            const payload = {
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                citizenID: values.citizenID,
                email: values.email,
                address: values.address,
                note: values.note
            };

            console.log('CustomerEditModal - Submitting payload:', payload);
            
            const response = await updateCustomer(customerData.id, payload);
            
            if (response?.isSuccess) {
                message.success('Cập nhật thông tin khách hàng thành công');
                onSuccess?.(); // Callback to refresh data
                onCancel(); // Close modal
                form.resetFields();
            } else {
                message.error(response?.message || 'Không thể cập nhật thông tin khách hàng');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            message.error('Lỗi khi cập nhật thông tin khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 text-lg font-semibold">
                    <UserOutlined className="text-blue-500" />
                    Chỉnh sửa thông tin khách hàng
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Cập nhật"
            cancelText="Hủy"
            width={600}
            className="customer-edit-modal"
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên' },
                        { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Nhập họ và tên khách hàng"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined className="text-gray-400" />}
                        placeholder="Nhập số điện thoại"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    label="Số CMND/CCCD"
                    name="citizenID"
                    rules={[
                        { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD không hợp lệ' }
                    ]}
                >
                    <Input
                        prefix={<IdcardOutlined className="text-gray-400" />}
                        placeholder="Nhập số CMND/CCCD"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-gray-400" />}
                        placeholder="Nhập địa chỉ email"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[
                        { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự' }
                    ]}
                >
                    <TextArea
                        placeholder="Nhập địa chỉ chi tiết"
                        rows={3}
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    label="Ghi chú"
                    name="note"
                >
                    <TextArea
                        placeholder="Nhập ghi chú (tùy chọn)"
                        rows={2}
                        className="rounded-lg"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CustomerEditModal;
