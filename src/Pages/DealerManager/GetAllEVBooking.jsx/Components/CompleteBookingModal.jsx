import React from "react";
import { Modal } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

function CompleteBookingModal({ visible, booking, onClose, onConfirm, loading }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={420}
        >
            <div className="text-center py-4">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Xác Nhận Hoàn Thành?
                </h2>

                <p className="text-gray-600 text-sm mb-4">
                    Bạn có chắc chắn muốn hoàn thành booking này?
                </p>

                {booking && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ngày đặt:</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số lượng:</span>
                                <span className="font-medium text-gray-800">
                                    {booking.totalQuantity || 0} xe
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            minWidth: '100px',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            color: '#374151',
                            backgroundColor: '#ffffff',
                            border: '2px solid #d1d5db',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.borderColor = '#9ca3af';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            minWidth: '100px',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#16a34a',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#15803d';
                                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#16a34a';
                                e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                            }
                        }}
                    >
                        {loading ? "Đang xử lý..." : "Xác Nhận"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default CompleteBookingModal;
