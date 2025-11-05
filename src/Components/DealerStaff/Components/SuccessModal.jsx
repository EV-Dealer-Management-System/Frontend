import React from "react";
import { Modal } from "antd";
import {
    CheckCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
} from "@ant-design/icons";

function SuccessModal({ visible, onClose, customerInfo }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={500}
        >
            <div className="text-center py-6">
                <div className="mb-6">
                    <CheckCircleOutlined className="text-6xl text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Đăng ký thành công!
                </h2>

                <p className="text-gray-600 mb-6">
                    Thông tin khách hàng đã được lưu vào hệ thống.
                    <br />
                    Chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất.
                </p>

                {customerInfo && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 text-left">
                        <h4 className="font-semibold text-gray-800 mb-3 text-center">
                            Thông tin đã lưu
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <UserOutlined className="text-blue-600" />
                                <span className="text-sm">
                                    <strong>Họ tên:</strong> {customerInfo.fullName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneOutlined className="text-green-600" />
                                <span className="text-sm">
                                    <strong>SĐT:</strong> {customerInfo.phoneNumber}
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <EnvironmentOutlined className="text-red-600 mt-0.5" />
                                <span className="text-sm">
                                    <strong>Địa chỉ:</strong> {customerInfo.address}
                                </span>
                            </div>
                            {customerInfo.note && (
                                <div className="flex items-start gap-2">
                                    <FileTextOutlined className="text-orange-600 mt-0.5" />
                                    <span className="text-sm">
                                        <strong>Ghi chú:</strong> {customerInfo.note}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    Đóng & tiếp tục
                </button>
            </div>
        </Modal>
    );
}

export default SuccessModal;
