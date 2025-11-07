import React from "react";
import { Modal, Button, Space, Divider } from "antd";
import {
    CheckCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    CloseOutlined,
} from "@ant-design/icons";

function CreateCustomerSuccessModal({ visible, onClose, customerInfo }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={550}
            closable={false}
            className="success-modal"
        >
            <div className="text-center py-6 px-4">

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                     Tạo khách hàng thành công!
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-base">
                    Thông tin khách hàng đã được lưu vào hệ thống.
                    <br />
                    Bạn có thể tiếp tục tạo quote hoặc quản lý thông tin khách hàng.
                </p>

                <Divider className="my-4" />

                {/* Customer Info Display */}


                {/* Action Buttons */}
                <Space size="middle" className="w-full justify-center">
                    <Button
                        type="primary"
                        size="large"
                        onClick={onClose}
                        icon={<CheckCircleOutlined />}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg hover:shadow-xl px-8 font-semibold"
                    >
                        Hoàn tất
                    </Button>

                    <Button
                        size="large"
                        onClick={onClose}
                        icon={<CloseOutlined />}
                        className="border-gray-300 hover:border-gray-400 px-6"
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}

export default CreateCustomerSuccessModal;