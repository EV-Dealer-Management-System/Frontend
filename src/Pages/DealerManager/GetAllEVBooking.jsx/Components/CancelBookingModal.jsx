import React from "react";
import { Modal, Button } from "antd";
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

function CancelBookingModal({ visible, booking, onClose, onConfirm, loading }) {
    return (
        <Modal
            title={
                <div className="flex items-center">
                    <span className="font-semibold">Xác Nhận Hủy Đơn Booking</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
        >
            <div className="py-6">
                <div className="mb-6">
                    <p className="text-base text-gray-700 mb-4">
                        Bạn có chắc chắn muốn hủy đơn booking này không?
                    </p>

                    {booking && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                            </div>
                            <div className="flex justify-between">
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-red-500 mt-4 font-medium">
                     Lưu ý: Hành động này không thể hoàn tác!
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        icon={<CloseCircleOutlined />}
                        onClick={onClose}
                        size="large"
                        className="flex-1"
                        style={{ height: 48 }}
                    >
                        <span className="font-semibold">Không, giữ lại</span>
                    </Button>

                    <Button
                        type="primary"
                        danger
                        icon={<CheckCircleOutlined />}
                        onClick={onConfirm}
                        loading={loading}
                        size="large"
                        className="flex-1"
                        style={{ height: 48 }}
                    >
                        <span className="font-semibold">Đồng ý hủy</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default CancelBookingModal;
