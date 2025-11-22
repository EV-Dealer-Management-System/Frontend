import React from 'react';
import { Modal, Space, Card, Tag, Button, Popconfirm, Divider, Typography } from 'antd';
import { DollarOutlined, BankOutlined, WalletOutlined, GiftOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Format tiền VND
const formatVnd = (n = 0) =>
    typeof n === "number"
        ? n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫"
        : "0 ₫";

// Tính tổng báo giá từ nhiều nguồn dữ liệu khác nhau
const calcQuoteTotal = (order) => {
    if (!order) return 0;
    
    // Thử các trường dữ liệu khác nhau
    // 1. Kiểm tra totalAmount trước
    if (order.totalAmount && order.totalAmount > 0) {
        return order.totalAmount;
    }
    
    // 2. Tính từ quoteDetails
    const quoteDetails = order.quoteDetails || [];
    if (quoteDetails.length > 0) {
        const total = quoteDetails.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
        if (total > 0) return total;
    }
    
    // 3. Tính từ orderDetails (nếu có)
    const orderDetails = order.orderDetails || [];
    if (orderDetails.length > 0) {
        const total = orderDetails.reduce((sum, od) => sum + (od?.price || od?.totalPrice || 0), 0);
        if (total > 0) return total;
    }
    
    // 4. Tính từ quote nếu có
    if (order.quote) {
        const quote = order.quote;
        if (quote.totalAmount && quote.totalAmount > 0) {
            return quote.totalAmount;
        }
        
        // Tính từ quote.quoteDetails
        const quoteDetailsFromQuote = quote.quoteDetails || [];
        if (quoteDetailsFromQuote.length > 0) {
            const total = quoteDetailsFromQuote.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
            if (total > 0) return total;
        }
    }
    
    // 5. Fallback - có thể là giá từ vehicle
    console.warn("Không tìm thấy giá trị totalAmount trong order:", order);
    return 0;
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
    
    // Xử lý click chọn phương thức thanh toán
    const handleMethodSelect = (method) => {
        if (setSelectedMethod) {
            setSelectedMethod(method);
        }
    };

    // Tính tổng giá báo giá
    const quoteTotal = calcQuoteTotal(order);
    const deposited = order?.depositAmount || 0;
    
    console.log("PaymentModal - Order data:", {
        order,
        quoteTotal,
        deposited,
        status: order?.status
    });
    
    // Xác định loại thanh toán dựa trên status
    const isConfirmationSend = order.status === 4 || order.status === 8; // Đang cọc - gửi xác nhận (status 4, 8)
    const isRemainingPayment = order.status === 9;  // Chờ thanh toán phần còn lại (có thể chọn payment method)
    const isFullPayment = order.status === 0;       // Chờ thanh toán toàn phần  
    const isNewDepositPayment = order.status === 1; // Chờ cọc
    
    // Tính số tiền cần thanh toán
    let amountToPay = 0;
    let paymentType = "";
    
    if (isConfirmationSend) {
        // Gửi xác nhận cho khách hàng (status 4, 8)
        amountToPay = 0; // Không cần hiển thị số tiền
        paymentType = order.status === 4 ? "Gửi xác nhận thanh toán" : "Gửi xác nhận thanh toán phần còn lại";
    } else if (isRemainingPayment) {
        // Thanh toán phần còn lại sau khi đã cọc
        amountToPay = Math.max(quoteTotal - deposited, 0);
        paymentType = "Thanh toán phần còn lại";
    } else if (isFullPayment) {
        // Thanh toán toàn bộ
        amountToPay = quoteTotal;
        paymentType = "Thanh toán toàn bộ";
    } else if (isNewDepositPayment) {
        // Thanh toán cọc mới
        // Lấy từ depositAmount nếu có, nếu không thì tính 30% tổng
        amountToPay = deposited > 0 ? deposited : (quoteTotal * 0.3);
        paymentType = "Thanh toán cọc";
    } else {
        // Trường hợp khác - mặc định là toàn bộ
        amountToPay = quoteTotal;
        paymentType = "Thanh toán";
    }
    
    const remain = amountToPay;
    
    console.log("Payment calculation:", {
        status: order?.status,
        isConfirmationSend,
        isRemainingPayment,
        isFullPayment,
        isNewDepositPayment,
        quoteTotal,
        deposited,
        amountToPay,
        paymentType
    });

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
            destroyOnHidden
        >
            <Space direction="vertical" style={{ width: "100%" }} size={14}>
                <Card
                    size="small"
                    style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}
                    variant="outlined"
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
                            <Text strong style={{ color: quoteTotal > 0 ? 'inherit' : '#ff4d4f' }}>
                                {quoteTotal > 0 ? formatVnd(quoteTotal) : "Chưa có giá"}
                            </Text>
                        </Space>

                        {(isRemainingPayment || isConfirmationSend) && (
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
                                isConfirmationSend ? "orange" :
                                isRemainingPayment ? "geekblue" : 
                                isFullPayment ? "blue" : 
                                "gold"
                            }>
                                {paymentType}
                            </Tag>
                        </Space>

                        {!isConfirmationSend && (
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
                                        color: remain > 0 ? "#1677ff" : (remain === 0 && quoteTotal > 0 ? "#52c41a" : "#ff4d4f"),
                                    }}
                                >
                                    {remain > 0 ? formatVnd(remain) : (quoteTotal > 0 ? "Đã thanh toán đủ" : "Chưa có giá")}
                                </Text>
                            </Space>
                        )}
                        
                        {isConfirmationSend && (
                            <Space align="baseline" wrap>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Hành động
                                </Text>
                                <Text strong style={{ color: "#fa8c16" }}>
                                    Gửi email xác nhận cho khách hàng
                                </Text>
                            </Space>
                        )}

                        {remain === 0 && (
                            <Tag color="green" style={{ marginTop: 4 }}>
                                Đã thu đủ
                            </Tag>
                        )}
                    </Space>
                </Card>

                {/* 2 option thanh toán - ẩn khi gửi xác nhận */}
                {!isConfirmationSend && (
                <Space style={{ width: "100%" }} size={12}>
                    {/* VNPay */}
                    <Card
                        hoverable
                        onClick={() => handleMethodSelect("vnpay")}
                        style={{
                            flex: 1,
                            cursor: (remain === 0 || quoteTotal === 0) ? "not-allowed" : "pointer",
                            opacity: (remain === 0 || quoteTotal === 0) ? 0.4 : 1,
                            borderWidth: selectedMethod === "vnpay" ? 2 : 1,
                            borderColor: selectedMethod === "vnpay" ? "#1677ff" : "var(--ant-color-border)",
                            background: selectedMethod === "vnpay" ? "rgba(22,119,255,0.04)" : "#fff",
                            boxShadow: selectedMethod === "vnpay" ? "0 0 0 2px rgba(22,119,255,0.12)" : "none",
                            transform: selectedMethod === "vnpay" ? "translateY(-2px)" : "none",
                            transition: "all .15s ease-in-out",
                            pointerEvents: (remain === 0 || quoteTotal === 0) ? "none" : "auto",
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
                        onClick={() => handleMethodSelect("cash")}
                        style={{
                            flex: 1,
                            cursor: (remain === 0 || quoteTotal === 0) ? "not-allowed" : "pointer",
                            opacity: (remain === 0 || quoteTotal === 0) ? 0.4 : 1,
                            borderWidth: selectedMethod === "cash" ? 2 : 1,
                            borderColor: selectedMethod === "cash" ? "#52c41a" : "var(--ant-color-border)",
                            background: selectedMethod === "cash" ? "rgba(82,196,26,0.04)" : "#fff",
                            boxShadow: selectedMethod === "cash" ? "0 0 0 2px rgba(82,196,26,0.12)" : "none",
                            transform: selectedMethod === "cash" ? "translateY(-2px)" : "none",
                            transition: "all .15s ease-in-out",
                            pointerEvents: (remain === 0 || quoteTotal === 0) ? "none" : "auto",
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
                )}

                <Divider style={{ margin: "10px 0 0" }} />

                {/* Footer modal */}
                <Space style={{ width: "100%", justifyContent: "flex-end" }} size={8}>
                    <Button onClick={onClose}>Đóng</Button>
                    {isConfirmationSend ? (
                        <Popconfirm
                            title="Gửi xác nhận"
                            description="Gửi email xác nhận thanh toán cho khách hàng?"
                            okText="Gửi"
                            cancelText="Hủy"
                            onConfirm={() => onConfirm("confirm")}
                        >
                            <Button
                                type="primary"
                                loading={loading}
                            >
                                Gửi xác nhận
                            </Button>
                        </Popconfirm>
                    ) : (
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
                            disabled={!selectedMethod || remain === 0 || quoteTotal === 0}
                        >
                            <Button
                                type="primary"
                                disabled={!selectedMethod || remain === 0 || quoteTotal === 0}
                                loading={loading}
                            >
                                Xác nhận thanh toán
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            </Space>
        </Modal>
    );
}

export default PaymentModal;
