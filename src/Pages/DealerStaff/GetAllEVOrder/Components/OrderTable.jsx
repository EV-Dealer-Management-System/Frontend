import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Typography } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    LoadingOutlined,
    DollarOutlined
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

// Tính tổng báo giá từ quoteDetails
const calcQuoteTotal = (order) => {
    if (!order) return 0;
    const list = order.quoteDetails || [];
    return list.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
};

function OrderTable({
    orders,
    pagination,
    loading,
    rowLoadingId,
    onPageChange,
    onViewDetail,
    onCancelOrder,
    onOpenPayModal
}) {
    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "orderNo",
            key: "orderNo",
            align: "center",
            width: 150,
            render: (no) => <Text strong>#{no}</Text>,
        },
        {
            title: "Khách hàng",
            dataIndex: "customer",
            key: "customer",
            width: 700,
            render: (c) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{c?.fullName || "—"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {c?.phoneNumber || "—"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Tổng báo giá",
            key: "quoteTotal",
            align: "center",
            width: 600,
            render: (_, record) => {
                const quoteTotal =
                    typeof record.totalAmount === "number" && record.totalAmount > 0
                        ? record.totalAmount
                        : calcQuoteTotal(record);
                return (
                    <Text strong style={{ color: "#1677ff" }}>
                        {formatVnd(quoteTotal)}
                    </Text>
                );
            },
        },
        {
            title: "Đã cọc",
            dataIndex: "depositAmount",
            key: "depositAmount",
            align: "right",
            width: 600,
            render: (v) => <Text strong>{formatVnd(v || 0)}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 180,
            render: (status) => {
                const s = mapStatus(status);
                return (
                    <Tag color={s.color} icon={s.icon}>
                        {s.text}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            width: 170,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: "descend",
            render: (date) => date ? new Date(date).toLocaleString("vi-VN") : "—",
        },
        {
            title: "Hành động",
            key: "actions",
            align: "center",
            width: 230,
            render: (_, record) => {
                const actionBtns = [];

                actionBtns.push(
                    <Button key="detail" size="small" onClick={() => onViewDetail(record)}>
                        Chi tiết
                    </Button>
                );

                if (record.status === 0 || record.status === 1) {
                    actionBtns.push(
                        <Popconfirm
                            key="cancel"
                            title="Hủy đơn hàng?"
                            description="Bạn chắc chắn muốn hủy đơn này?"
                            onConfirm={() => onCancelOrder(record)}
                            okText="Hủy đơn"
                            okButtonProps={{ danger: true }}
                            cancelText="Không"
                        >
                            <Button danger size="small" loading={rowLoadingId === record.id}>
                                Hủy đơn
                            </Button>
                        </Popconfirm>
                    );
                }

                if (record.status === 4) {
                    actionBtns.push(
                        <Button
                            key="pay"
                            type="primary"
                            size="small"
                            icon={<DollarOutlined />}
                            onClick={() => onOpenPayModal(record)}
                        >
                            Thanh toán
                        </Button>
                    );
                }

                return <Space>{actionBtns}</Space>;
            },
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: onPageChange,
                showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            bordered
            className="shadow-sm rounded-lg overflow-hidden"
        />
    );
}

export default OrderTable;
