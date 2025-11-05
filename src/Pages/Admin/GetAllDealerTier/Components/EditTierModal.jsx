import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { UpdateDealerTier } from "../../../../App/EVMAdmin/DealerTierManagement/UpdateDealerTier";

function EditTierModal({ visible, onCancel, onSuccess, tierData }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && tierData) {
            // Điền dữ liệu vào form khi mở modal
            form.setFieldsValue({
                name: tierData.name,
                level: tierData.level,
                baseCommissionPercent: tierData.baseCommissionPercent,
                baseDepositPercent: tierData.baseDepositPercent,
                baseLatePenaltyPercent: tierData.baseLatePenaltyPercent,
                baseCreditLimit: tierData.baseCreditLimit,
                description: tierData.description,
            });
        }
    }, [visible, tierData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Gọi API update
            const response = await UpdateDealerTier(tierData.id, values);

            if (response && response.isSuccess) {
                // Reload data ngay lập tức ở background
                onSuccess();

                // Hiển thị modal thành công
                Modal.success({
                    title: "Cập Nhật Thành Công",
                    content: (
                        <div>
                            <p>Dealer tier <strong>{values.name}</strong> đã được cập nhật thành công!</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Level: {values.level} | Hoa hồng: {values.baseCommissionPercent}%
                            </p>
                        </div>
                    ),
                    icon: <CheckCircleOutlined className="text-green-500" />,
                    okText: "Đóng",
                    centered: true,
                    onOk: () => {
                        // Sau khi người dùng đóng modal success, đóng modal edit
                        onCancel();
                        form.resetFields();
                    },
                });
            } else {
                // Hiển thị modal lỗi, giữ modal edit mở
                Modal.error({
                    title: "Cập Nhật Thất Bại",
                    content: (
                        <div>
                            <p>{response?.message || "Không thể cập nhật dealer tier"}</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Vui lòng kiểm tra lại thông tin và thử lại
                            </p>
                        </div>
                    ),
                    icon: <CloseCircleOutlined className="text-red-500" />,
                    okText: "Đóng",
                    centered: true,
                });
            }
        } catch (error) {
            if (error.errorFields) {
                message.error("Vui lòng kiểm tra lại thông tin!");
            } else {
                console.error("Error updating tier:", error);
                // Hiển thị modal lỗi hệ thống
                Modal.error({
                    title: "Lỗi Hệ Thống",
                    content: (
                        <div>
                            <p>Có lỗi xảy ra khi cập nhật dealer tier</p>
                            <p className="text-sm text-gray-600 mt-2">
                                {error?.response?.data?.message || error.message || "Vui lòng thử lại sau"}
                            </p>
                        </div>
                    ),
                    icon: <CloseCircleOutlined className="text-red-500" />,
                    okText: "Đóng",
                    centered: true,
                });
            }
        }
    }; const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <span className="text-lg font-semibold">
                    Chỉnh Sửa Dealer Tier
                </span>
            }
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Cập Nhật"
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <Form.Item
                    name="name"
                    label="Tên Tier"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên tier" },
                        { max: 100, message: "Tên tier không quá 100 ký tự" },
                    ]}
                >
                    <Input placeholder="Nhập tên tier" />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="Level"
                    rules={[
                        { required: true, message: "Vui lòng nhập level" },
                        { type: "number", min: 1, message: "Level phải lớn hơn 0" },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập level"
                        className="w-full"
                        min={1}
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="baseCommissionPercent"
                        label="Hoa Hồng (%)"
                        rules={[
                            { required: true, message: "Vui lòng nhập % hoa hồng" },
                            { type: "number", min: 0, max: 100, message: "Hoa hồng từ 0-100%" },
                        ]}
                    >
                        <InputNumber
                            placeholder="0-100"
                            className="w-full"
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="baseDepositPercent"
                        label="Đặt Cọc (%)"
                        rules={[
                            { required: true, message: "Vui lòng nhập % đặt cọc" },
                            { type: "number", min: 0, max: 100, message: "Đặt cọc từ 0-100%" },
                        ]}
                    >
                        <InputNumber
                            placeholder="0-100"
                            className="w-full"
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="baseLatePenaltyPercent"
                        label="Phạt Trễ (%)"
                        rules={[
                            { required: true, message: "Vui lòng nhập % phạt trễ" },
                            { type: "number", min: 0, max: 100, message: "Phạt trễ từ 0-100%" },
                        ]}
                    >
                        <InputNumber
                            placeholder="0-100"
                            className="w-full"
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="baseCreditLimit"
                        label="Hạn Mức Tín Dụng (VNĐ)"
                        rules={[
                            { required: true, message: "Vui lòng nhập hạn mức" },
                            { type: "number", min: 0, message: "Hạn mức phải lớn hơn 0" },
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập số tiền"
                            className="w-full"
                            min={0}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/,/g, "")}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Mô Tả"
                    rules={[
                        { max: 500, message: "Mô tả không quá 500 ký tự" },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Nhập mô tả tier"
                        rows={4}
                        showCount
                        maxLength={500}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditTierModal;
