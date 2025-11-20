import React from 'react';
import { Modal, Space, Card, Tag, Button, Popconfirm, Divider, Typography } from 'antd';
import { DollarOutlined, BankOutlined, WalletOutlined, GiftOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Format tiền VND
const formatVnd = (n = 0) =>
    typeof n === "number"
        ? n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫"
        : "0 ₫";

// Tính tổng báo giá từ quoteDetails
const calcQuoteTotal = (order) => {
    if (!order) return 0;
    const list = order.quoteDetails || [];
    return list.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
};

function PaymentModal({
    open,
    order,
    selectedMethod,
    setSelectedMethod,
    loading,
    onClose,
    onConfirm
}) {
    if (!order) return null;

    const quoteTotalFromDetails = calcQuoteTotal(order);
    const quoteTotal =
        order?.totalAmount && order.totalAmount > 0
            ? order.totalAmount
            : quoteTotalFromDetails;

    const deposited = order?.depositAmount || 0;
    
    // Xác định loại thanh toán dựa trên status
    const isDepositPayment = order.status === 4; // Đang cọc
    const isFullPayment = order.status === 0;    // Chờ thanh toán toàn phần  
    const isNewDepositPayment = order.status === 1; // Chờ cọc
    
    // Tính số tiền cần thanh toán
    let amountToPay = 0;
    let paymentType = "";
    
    if (isDepositPayment) {
        // Thanh toán phần còn lại sau khi đã cọc
        amountToPay = Math.max(quoteTotal - deposited, 0);
        paymentType = "Thanh toán phần còn lại";
    } else if (isFullPayment) {
        // Thanh toán toàn bộ
        amountToPay = quoteTotal;
        paymentType = "Thanh toán toàn bộ";
    } else if (isNewDepositPayment) {
        // Thanh toán cọc mới (thường là một phần của tổng)
        amountToPay = quoteTotal * 0.3; // Giả sử cọc 30%, có thể điều chỉnh
        paymentType = "Thanh toán cọc";
    }
    
    const remain = amountToPay;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={520}
            title={
                <Space align="center">
                    <DollarOutlined />
                    <span>Chọn phương thức thanh toán</span>
                </Space>
            }
            destroyOnClose
        >
            <Space direction="vertical" style={{ width: "100%" }} size={14}>
                <Card
                    size="small"
                    style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}
                    bordered
                >
                    <Space direction="vertical" style={{ width: "100%" }} size={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Đơn hàng
                        </Text>
                        <Space wrap>
                            <Tag color="blue">#{order?.orderNo}</Tag>
                            <Text strong>
                                {order?.quoteDetails?.[0]?.version?.modelName || "Không rõ model"}
                            </Text>
                        </Space>

                        <Space align="baseline" wrap>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Tổng báo giá
                            </Text>
                            <Text strong>{formatVnd(quoteTotal)}</Text>
                        </Space>

                        {isDepositPayment && (
                            <Space align="baseline" wrap>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Đã thu (cọc)
                                </Text>
                                <Text>{formatVnd(deposited)}</Text>
                            </Space>
                        )}

                        <Space align="baseline" wrap>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Loại thanh toán
                            </Text>
                            <Tag color={
                                isDepositPayment ? "geekblue" : 
                                isFullPayment ? "blue" : 
                                "gold"
                            }>
                                {paymentType}
                            </Tag>
                        </Space>

                        <Space
                            align="baseline"
                            wrap
                            style={{ justifyContent: "space-between", width: "100%" }}
                        >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Số tiền thanh toán
                            </Text>
                            <Text
                                strong
                                style={{
                                    fontSize: 18,
                                    color: remain > 0 ? "#1677ff" : "#52c41a",
                                }}
                            >
                                {formatVnd(remain)}
                            </Text>
                        </Space>

                        {remain === 0 && (
                            <Tag color="green" style={{ marginTop: 4 }}>
                                Đã thu đủ
                            </Tag>
                        )}
                    </Space>
                </Card>

                {/* 2 option thanh toán */}
                <Space style={{ width: "100%" }} size={12}>
                    {/* VNPay */}
                    <Card
                        hoverable
                        onClick={() => setSelectedMethod("vnpay")}
                        style={{
                            flex: 1,
                            cursor: remain === 0 ? "not-allowed" : "pointer",
                            opacity: remain === 0 ? 0.4 : 1,
                            borderWidth: selectedMethod === "vnpay" ? 2 : 1,
                            borderColor: selectedMethod === "vnpay" ? "#1677ff" : "var(--ant-color-border)",
                            background: selectedMethod === "vnpay" ? "rgba(22,119,255,0.04)" : "#fff",
                            boxShadow: selectedMethod === "vnpay" ? "0 0 0 2px rgba(22,119,255,0.12)" : "none",
                            transform: selectedMethod === "vnpay" ? "translateY(-2px)" : "none",
                            transition: "all .15s ease-in-out",
                            pointerEvents: remain === 0 ? "none" : "auto",
                        }}
                    >
                        <Space direction="vertical" size={4}>
                            <Space>
                                <BankOutlined style={{ color: "#1677ff", fontSize: 20 }} />
                                <Text strong style={{ color: selectedMethod === "vnpay" ? "#1677ff" : "inherit" }}>
                                    VNPay
                                </Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Thanh toán online
                            </Text>
                        </Space>
                    </Card>

                    {/* Tiền mặt */}
                    <Card
                        hoverable
                        onClick={() => setSelectedMethod("cash")}
                        style={{
                            flex: 1,
                            cursor: remain === 0 ? "not-allowed" : "pointer",
                            opacity: remain === 0 ? 0.4 : 1,
                            borderWidth: selectedMethod === "cash" ? 2 : 1,
                            borderColor: selectedMethod === "cash" ? "#52c41a" : "var(--ant-color-border)",
                            background: selectedMethod === "cash" ? "rgba(82,196,26,0.04)" : "#fff",
                            boxShadow: selectedMethod === "cash" ? "0 0 0 2px rgba(82,196,26,0.12)" : "none",
                            transform: selectedMethod === "cash" ? "translateY(-2px)" : "none",
                            transition: "all .15s ease-in-out",
                            pointerEvents: remain === 0 ? "none" : "auto",
                        }}
                    >
                        <Space direction="vertical" size={4}>
                            <Space>
                                <WalletOutlined style={{ color: "#52c41a", fontSize: 20 }} />
                                <Text strong style={{ color: selectedMethod === "cash" ? "#52c41a" : "inherit" }}>
                                    Tiền mặt
                                </Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Ghi nhận thanh toán tại quầy
                            </Text>
                        </Space>
                    </Card>
                </Space>

                <Divider style={{ margin: "10px 0 0" }} />

                {/* Footer modal */}
                <Space style={{ width: "100%", justifyContent: "flex-end" }} size={8}>
                    <Button onClick={onClose}>Đóng</Button>
                    <Popconfirm
                        title="Xác nhận thanh toán"
                        description={
                            selectedMethod === "cash"
                                ? `Xác nhận khách đã ${paymentType.toLowerCase()} bằng tiền mặt?`
                                : `Tạo yêu cầu thanh toán VNPay cho ${paymentType.toLowerCase()}?`
                        }
                        okText="Xác nhận"
                        cancelText="Hủy"
                        onConfirm={() => onConfirm(selectedMethod)}
                        disabled={!selectedMethod || remain === 0}
                    >
                        <Button
                            type="primary"
                            disabled={!selectedMethod || remain === 0}
                            loading={loading}
                        >
                            Xác nhận thanh toán
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>
        </Modal>
    );
}

export default PaymentModal;
