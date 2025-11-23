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
    PercentageOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

function DepositUpdateForm({ form, onUpdate, loading, currentPercentage, depositLimits = { min: 0, max: 100 } }) {
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

    const newPercentage = formValues?.depositPercentage || 0;
    const isChanged = newPercentage !== currentPercentage;

    return (
        <>
            <Card
                className="shadow-md border-0"
                title={
                    <div className="flex items-center gap-2">
                        <SaveOutlined className="text-blue-600" />
                        <span>Cập Nhật Tỷ Lệ Đặt Cọc</span>
                    </div>
                }
                loading={loading}
            >
                <Alert
                    message="Lưu ý quan trọng"
                    description={`Tỷ lệ này là MỨC TỐI ĐA mà bên đối tác có thể đặt cọc. Đối tác có thể chọn đặt cọc từ 0% đến mức tối đa này. Giới hạn cho phép: ${depositLimits.min}% - ${depositLimits.max}%`}
                    type="info"
                    icon={<InfoCircleOutlined />}
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
                        <Col xs={24} md={16}>
                            <Form.Item
                                label="Tỷ Lệ Đặt Cọc Tối Đa (%)"
                                name="depositPercentage"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tỷ lệ đặt cọc!' },
                                    { 
                                        type: 'number', 
                                        min: depositLimits.min, 
                                        max: depositLimits.max, 
                                        message: `Tỷ lệ phải từ ${depositLimits.min}% đến ${depositLimits.max}%!` 
                                    }
                                ]}
                            >
                                <InputNumber
                                    className="w-full"
                                    placeholder={`Nhập tỷ lệ (${depositLimits.min}-${depositLimits.max})`}
                                    suffix="%"
                                    min={depositLimits.min}
                                    max={depositLimits.max}
                                    precision={2}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label=" " className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    size="large"
                                    className="w-full"
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Popup xác nhận */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ExclamationCircleOutlined className="text-orange-500" />
                        <span>Xác Nhận Cập Nhật</span>
                    </div>
                }
                open={confirmVisible}
                onOk={handleConfirmUpdate}
                onCancel={handleCancelUpdate}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                    loading: loading,
                    type: 'primary'
                }}
            >
                <div className="py-4">
                    <Alert
                        message="Cảnh báo"
                        description="Thay đổi này sẽ ảnh hưởng đến tất cả giao dịch mới."
                        type="warning"
                        showIcon
                        className="mb-4"
                    />

                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Hiện tại">
                                <Statistic
                                    value={currentPercentage}
                                    suffix="%"
                                    valueStyle={{ fontSize: '20px' }}
                                />
                            </Card>
                        </Col>

                        <Col span={12}>
                            <Card size="small" title="Mới" className={isChanged ? 'border-orange-300' : ''}>
                                <Statistic
                                    value={newPercentage}
                                    suffix="%"
                                    valueStyle={{
                                        fontSize: '20px',
                                        color: isChanged ? '#fa8c16' : '#666',
                                        fontWeight: isChanged ? 'bold' : 'normal'
                                    }}
                                />
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

export default DepositUpdateForm;