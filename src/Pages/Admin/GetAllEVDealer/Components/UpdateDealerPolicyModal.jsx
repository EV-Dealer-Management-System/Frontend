import React, { useState } from "react";
import { Modal, Form, InputNumber, DatePicker, Input, Row, Col } from "antd";
import { PercentageOutlined, DollarOutlined, WalletOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { updateDealerPolicy } from "../../../../App/EVMAdmin/GetAllEVDealer/CreateDealerPolicy";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function useUpdateDealerPolicyModal(modal, onSuccess) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentDealerId, setCurrentDealerId] = useState(null);
    const [currentDealerName, setCurrentDealerName] = useState("");

    const handleOpenModal = (dealerId, dealerName, currentPolicy = null) => {
        setCurrentDealerId(dealerId);
        setCurrentDealerName(dealerName);
        
        // Nếu có policy hiện tại, set giá trị mặc định
        if (currentPolicy) {
            form.setFieldsValue({
                commissionPercent: currentPolicy.commissionPercent,
                creditLimit: currentPolicy.creditLimit,
                latePenaltyPercent: currentPolicy.latePenaltyPercent,
                depositPercent: currentPolicy.depositPercent,
                dateRange: currentPolicy.overrideEffectiveFrom && currentPolicy.overrideEffectiveTo
                    ? [dayjs(currentPolicy.overrideEffectiveFrom), dayjs(currentPolicy.overrideEffectiveTo)]
                    : null,
                note: currentPolicy.overrideNote,
            });
        } else {
            form.resetFields();
        }
        
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentDealerId(null);
        setCurrentDealerName("");
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("Form values:", values);
            setLoading(true);

            const policyData = {
                commissionPercent: values.commissionPercent,
                creditLimit: values.creditLimit,
                latePenaltyPercent: values.latePenaltyPercent,
                depositPercent: values.depositPercent,
                effectiveFrom: values.dateRange?.[0]?.toISOString() || new Date().toISOString(),
                effectiveTo: values.dateRange?.[1]?.toISOString() || new Date().toISOString(),
                note: values.note || "",
            };

            console.log("Sending policy data:", policyData);
            console.log("Dealer ID:", currentDealerId);

            const response = await updateDealerPolicy(currentDealerId, policyData);
            console.log("Update response:", response);
            console.log("Response status:", response?.status);
            
            // API trả về response với status 200 hoặc 201 khi thành công
            if (response && (response.status === 200 || response.status === 201 || (response.status >= 200 && response.status < 300))) {
                handleCancel();
                
                // Hiển thị modal success
                modal.success({
                    title: "Thành Công!",
                    content: (
                        <div className="text-center">
                            <p className="text-lg mb-2">Cập nhật chính sách đại lý thành công!</p>
                            <p className="text-gray-600">Đại lý: <strong>{currentDealerName}</strong></p>
                        </div>
                    ),
                    okText: "Đóng",
                    okButtonProps: {
                        className: "bg-green-500 hover:bg-green-600"
                    },
                    onOk: () => {
                        // Gọi callback để refresh data sau khi đóng modal success
                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                });
            } else {
                console.log("Response not successful, response:", response);
                modal.error({
                    title: "Lỗi!",
                    content: response?.data?.message || "Có lỗi xảy ra khi cập nhật chính sách",
                });
            }
        } catch (error) {
            console.error("Error updating dealer policy:", error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.title ||
                                error.message || 
                                "Có lỗi xảy ra khi cập nhật chính sách đại lý";
            
            // Hiển thị modal error
            modal.error({
                title: "Lỗi!",
                content: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const ModalComponent = () => (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <PercentageOutlined className="text-blue-600" />
                    <span>Chỉnh Sửa Điều Khoản: {currentDealerName}</span>
                </div>
            }
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={700}
            confirmLoading={loading}
            okText="Lưu Thay Đổi"
            cancelText="Hủy"
            okButtonProps={{
                className: "bg-blue-500 hover:bg-blue-600"
            }}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="flex items-center gap-1">
                                    <PercentageOutlined className="text-green-600" />
                                    Hoa Hồng (%)
                                </span>
                            }
                            name="commissionPercent"
                            rules={[
                                { required: true, message: "Vui lòng nhập hoa hồng" },
                                { type: "number", min: 0, max: 100, message: "Hoa hồng từ 0-100%" }
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="Nhập % hoa hồng"
                                precision={2}
                                min={0}
                                max={100}
                                addonAfter="%"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="flex items-center gap-1">
                                    <DollarOutlined className="text-blue-600" />
                                    Hạn Mức Tín Dụng (VNĐ)
                                </span>
                            }
                            name="creditLimit"
                            rules={[
                                { required: true, message: "Vui lòng nhập hạn mức tín dụng" },
                                { type: "number", min: 0, message: "Hạn mức phải lớn hơn 0" }
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="Nhập hạn mức"
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="flex items-center gap-1">
                                    <ClockCircleOutlined className="text-red-600" />
                                    Phí Trả Chậm (%)
                                </span>
                            }
                            name="latePenaltyPercent"
                            rules={[
                                { required: true, message: "Vui lòng nhập phí trả chậm" },
                                { type: "number", min: 0, max: 100, message: "Phí trả chậm từ 0-100%" }
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="Nhập % phí trả chậm"
                                precision={2}
                                min={0}
                                max={100}
                                addonAfter="%"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="flex items-center gap-1">
                                    <WalletOutlined className="text-orange-600" />
                                    Tỷ Lệ Đặt Cọc (%)
                                </span>
                            }
                            name="depositPercent"
                            rules={[
                                { required: true, message: "Vui lòng nhập tỷ lệ đặt cọc" },
                                { type: "number", min: 0, max: 100, message: "Tỷ lệ đặt cọc từ 0-100%" }
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="Nhập % đặt cọc"
                                precision={2}
                                min={0}
                                max={100}
                                addonAfter="%"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            label="Thời Gian Hiệu Lực"
                            name="dateRange"
                            rules={[
                                { required: true, message: "Vui lòng chọn thời gian hiệu lực" }
                            ]}
                        >
                            <RangePicker
                                className="w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder={["Từ ngày", "Đến ngày"]}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            label="Ghi Chú"
                            name="note"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập ghi chú về thay đổi chính sách..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );

    return {
        handleOpenModal,
        ModalComponent,
    };
}

export default useUpdateDealerPolicyModal;
