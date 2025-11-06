import React, { useState } from 'react';
import {
    Card,
    Form,
    InputNumber,
    Button,
    Typography,
    Alert,
    Modal,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    SaveOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

function GlobalUpdateForm({ form, onUpdate, loading, currentSettings }) {
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [formValues, setFormValues] = useState(null);

    const handleFormSubmit = (values) => {
        setFormValues(values);
        setConfirmVisible(true);
    };

    const handleConfirmUpdate = () => {
        onUpdate(formValues);
        setConfirmVisible(false);
        setFormValues(null);
    };

    const handleCancelUpdate = () => {
        setConfirmVisible(false);
        setFormValues(null);
    };

    const currentRange = currentSettings.maxDepositPercentage - currentSettings.minDepositPercentage;
    const newRange = formValues ? formValues.maxDepositPercentage - formValues.minDepositPercentage : 0;

    return (
        <>
            <Card
                className="shadow-md border-0"
                title={
                    <div className="flex items-center gap-2">
                        <SaveOutlined className="text-blue-600" />
                        <span>Cập Nhật Toàn Hệ Thống</span>
                    </div>
                }
                loading={loading}
            >
                <Alert
                    message="⚠️ Cảnh báo quan trọng"
                    description="Thay đổi này sẽ áp dụng cho TẤT CẢ đại lý trong hệ thống."
                    type="warning"
                    className="mb-4"
                    showIcon
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    disabled={loading}
                >
                    <Row gutter={[24, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tỷ Lệ Tối Thiểu (%)"
                                name="minDepositPercentage"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tỷ lệ tối thiểu!' },
                                    { type: 'number', min: 0, max: 100, message: 'Tỷ lệ phải từ 0% đến 100%!' }
                                ]}
                            >
                                <InputNumber
                                    className="w-full"
                                    placeholder="Nhập tỷ lệ tối thiểu"
                                    suffix="%"
                                    min={0}
                                    max={100}
                                    precision={2}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tỷ Lệ Tối Đa (%)"
                                name="maxDepositPercentage"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tỷ lệ tối đa!' },
                                    { type: 'number', min: 0, max: 100, message: 'Tỷ lệ phải từ 0% đến 100%!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('minDepositPercentage') <= value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Tỷ lệ tối đa phải lớn hơn tỷ lệ tối thiểu!'));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber
                                    className="w-full"
                                    placeholder="Nhập tỷ lệ tối đa"
                                    suffix="%"
                                    min={0}
                                    max={100}
                                    precision={2}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Preview */}
                    <Card size="small" className="bg-blue-50 border-blue-200 mb-4">
                        <Form.Item noStyle shouldUpdate>
                            {({ getFieldValue }) => {
                                const minValue = getFieldValue('minDepositPercentage') || 0;
                                const maxValue = getFieldValue('maxDepositPercentage') || 0;
                                const previewRange = maxValue - minValue;

                                return (
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <Text className="block">Tối thiểu</Text>
                                                <Text strong className="text-green-600 text-lg">
                                                    {minValue}%
                                                </Text>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <Text className="block">Tối đa</Text>
                                                <Text strong className="text-blue-600 text-lg">
                                                    {maxValue}%
                                                </Text>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <Text className="block">Khoảng</Text>
                                                <Text strong className="text-purple-600 text-lg">
                                                    {previewRange}%
                                                </Text>
                                            </div>
                                        </Col>
                                    </Row>
                                );
                            }}
                        </Form.Item>
                    </Card>

                    <Row justify="center">
                        <Col>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={loading}
                                size="large"
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật toàn hệ thống'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Modal xác nhận */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ExclamationCircleOutlined className="text-red-500" />
                        <span>⚠️ Xác Nhận Cập Nhật</span>
                    </div>
                }
                open={confirmVisible}
                onOk={handleConfirmUpdate}
                onCancel={handleCancelUpdate}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                    loading: loading,
                    danger: true
                }}
            >
                <div className="py-4">
                    <Alert
                        message="🚨 CẢNH BÁO"
                        description="Thay đổi sẽ áp dụng cho TẤT CẢ đại lý. Không thể hoàn tác!"
                        type="error"
                        showIcon
                        className="mb-4"
                    />

                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Hiện tại">
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <Text>Tối thiểu:</Text>
                                        <Text strong>{currentSettings.minDepositPercentage}%</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Tối đa:</Text>
                                        <Text strong>{currentSettings.maxDepositPercentage}%</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Khoảng:</Text>
                                        <Text strong>{currentRange}%</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col span={12}>
                            <Card size="small" title="Mới" className="border-orange-300">
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <Text>Tối thiểu:</Text>
                                        <Text strong className="text-orange-600">
                                            {formValues?.minDepositPercentage}%
                                        </Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Tối đa:</Text>
                                        <Text strong className="text-orange-600">
                                            {formValues?.maxDepositPercentage}%
                                        </Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Khoảng:</Text>
                                        <Text strong className="text-orange-600">
                                            {newRange}%
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div className="text-center mt-4">
                        <Text className="text-gray-600">
                            Bạn có chắc chắn muốn áp dụng thay đổi này không?
                        </Text>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default GlobalUpdateForm;