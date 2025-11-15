import React from 'react';
import { Drawer, Space, Tag, Descriptions, Divider, Typography, List, Badge } from 'antd';
import {
    CarOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    GiftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    LoadingOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// Format tiền VND
const formatVnd = (n = 0) =>
    typeof n === "number"
        ? n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫"
        : "0 ₫";

// Map trạng thái đơn
const mapStatus = (status) => {
    switch (status) {
        case 0:
            return { text: "Chờ thanh toán toàn phần", color: "blue", icon: <ClockCircleOutlined /> };
        case 1:
            return { text: "Chờ cọc", color: "gold", icon: <ClockCircleOutlined /> };
        case 2:
            return { text: "Đang chờ", color: "orange", icon: <ClockCircleOutlined /> };
        case 4:
            return { text: "Đang cọc", color: "geekblue", icon: <LoadingOutlined /> };
        case 5:
            return { text: "Hoàn tất", color: "green", icon: <CheckCircleOutlined /> };
        case 6:
            return { text: "Đã hủy", color: "red", icon: <StopOutlined /> };
        default:
            return { text: "Không xác định", color: "default", icon: <ClockCircleOutlined /> };
    }
};

// Map trạng thái EV
const mapEVStatus = (status) => {
    switch (status) {
        case 1:
            return { text: "Đang trong kho hãng", status: "success" };
        case 2:
            return { text: "Đang chờ", status: "processing" };
        case 3:
            return { text: "Xe đã được giữ cho đại lý", status: "warning" };
        case 4:
            return { text: "Đang vận chuyển", status: "processing" };
        case 5:
            return { text: "Đã bán", status: "success" };
        case 6:
            return { text: "Xe đang trong kho đại lý", status: "default" };
        case 7:
            return { text: "Bảo trì", status: "error" };
        case 8:
            return { text: "Xe đã được giữ cho khách hàng", status: "warning" };
        case 9:
            return { text: "Đã đặt cọc", status: "processing" };
        default:
            return { text: "Không rõ", status: "default" };
    }
};

// Tính tổng báo giá từ quoteDetails
const calcQuoteTotal = (order) => {
    if (!order) return 0;
    const list = order.quoteDetails || [];
    return list.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
};

// Render danh sách VIN
const renderVinList = (order) => {
    const list = order?.orderDetails || [];
    if (!list.length) {
        return <Text type="secondary">Đơn này chưa có xe / chưa gán VIN.</Text>;
    }
    return (
        <List
            size="small"
            dataSource={list}
            renderItem={(item, idx) => {
                const ev = item.electricVehicle;
                const mapped = mapEVStatus(ev?.status);
                return (
                    <List.Item>
                        <Space direction="vertical" size={0} style={{ width: "100%" }}>
                            <Space align="center" style={{ justifyContent: "space-between" }}>
                                <Text strong>
                                    {idx + 1}. VIN: {ev?.vin || "—"}
                                </Text>
                                <Badge status={mapped.status} text={mapped.text} />
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {ev?.electricVehicleTemplate?.modelName} •{" "}
                                {ev?.electricVehicleTemplate?.versionName}
                            </Text>
                            {ev?.warehouse?.name && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Kho: {ev?.warehouse?.name}
                                </Text>
                            )}
                        </Space>
                    </List.Item>
                );
            }}
        />
    );
};

function OrderDetailDrawer({ open, order, onClose }) {
    if (!order) return null;

    const s = mapStatus(order.status);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={520}
            title={
                <Space>
                    <CarOutlined />
                    <span>Chi tiết đơn hàng</span>
                    {order?.orderNo && <Tag color="blue">#{order.orderNo}</Tag>}
                </Space>
            }
        >
            <Descriptions size="small" column={1} bordered labelStyle={{ width: 140 }}>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={s.color} icon={s.icon}>
                        {s.text}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng báo giá">
                    {formatVnd(
                        order.totalAmount && order.totalAmount > 0
                            ? order.totalAmount
                            : calcQuoteTotal(order)
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Đã cọc">
                    {formatVnd(order.depositAmount || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong>
                    <UserOutlined /> Khách hàng
                </Text>
                <Text>{order.customer?.fullName}</Text>
                <Text type="secondary">
                    <PhoneOutlined /> {order.customer?.phoneNumber}
                </Text>
                <Text type="secondary">
                    <MailOutlined /> {order.customer?.email}
                </Text>
                <Text type="secondary">
                    <EnvironmentOutlined /> {order.customer?.address}
                </Text>
            </Space>

            <Divider />

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text strong>
                    <FileTextOutlined /> Chi tiết báo giá
                </Text>

                {order.quoteDetails?.length ? (
                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300">
                            <Text strong>Báo giá ({order.quoteDetails.length} sản phẩm)</Text>
                            <Text strong className="text-blue-600 text-sm">
                                {formatVnd(
                                    order.totalAmount && order.totalAmount > 0
                                        ? order.totalAmount
                                        : calcQuoteTotal(order)
                                )}
                            </Text>
                        </div>

                        {order.quoteDetails.map((detail, index) => (
                            <div
                                key={detail.id || index}
                                className={`${index < order.quoteDetails.length - 1
                                        ? "mb-3 pb-3 border-b border-dashed border-gray-300"
                                        : ""
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <Text strong className="text-xs">
                                        {detail.version?.modelName} - {detail.version?.versionName}
                                    </Text>
                                    <Text strong className="text-blue-600 text-xs">
                                        {formatVnd(detail.totalPrice)}
                                    </Text>
                                </div>

                                <div className="text-xs text-gray-600 mb-1">
                                    Màu: {detail.color?.colorName || "—"} • Số lượng:{" "}
                                    {detail.quantity} • Đơn giá: {formatVnd(detail.unitPrice)}
                                </div>

                                {detail.promotion?.promotionName && (
                                    <Tag color="purple" icon={<GiftOutlined />} size="small" className="text-xs">
                                        {detail.promotion.promotionName}
                                    </Tag>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <Text type="secondary">Không có chi tiết báo giá</Text>
                )}
            </Space>

            <Divider />

            <Text strong>Danh sách VIN</Text>
            <div style={{ marginTop: 8, maxHeight: 240, overflow: "auto" }}>
                {renderVinList(order)}
            </div>
        </Drawer>
    );
}

export default OrderDetailDrawer;
