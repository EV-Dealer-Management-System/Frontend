import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, message, Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import { getDealerDebtDetail } from "../../../../App/DealerManager/DealerDebt/GetDealerDebtDetails";

// Map loại giao dịch
const TRANSACTION_TYPES = {
    1: { text: "Mua hàng", color: "red" },
    2: { text: "Thanh toán", color: "green" },
    3: { text: "Hoa hồng", color: "blue" },
    4: { text: "Phạt", color: "orange" },
};

function DebtDetailModal({ visible, onClose, periodData }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchDebtDetails = async (page = 1, pageSize = 10) => {
        if (!periodData) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const decoded = jwtDecode(token);
            const dealerId = decoded.DealerId || decoded.dealerId || decoded.dealer_id;

            const response = await getDealerDebtDetail(
                dealerId,
                periodData.periodFrom,
                periodData.periodTo,
                page,
                pageSize
            );

            if (response && response.isSuccess) {
                setData(response.result.data);
                setPagination({
                    current: response.result.pagination.pageNumber,
                    pageSize: response.result.pagination.pageSize,
                    total: response.result.pagination.totalItems,
                });
            } else {
                throw new Error(response?.message || "Không thể tải chi tiết công nợ");
            }
        } catch (err) {
            console.error("Error fetching debt details:", err);
            message.error(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && periodData) {
            fetchDebtDetails(1, 10);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, periodData]);

    const handleTableChange = (newPagination) => {
        fetchDebtDetails(newPagination.current, newPagination.pageSize);
    };

    const columns = [
        {
            title: "Thời gian",
            dataIndex: "occurredAtUtc",
            key: "occurredAtUtc",
            width: 180,
            render: (date) => new Date(date).toLocaleString("vi-VN"),
        },
        {
            title: "Loại giao dịch",
            dataIndex: "type",
            key: "type",
            width: 130,
            render: (type) => {
                const typeInfo = TRANSACTION_TYPES[type] || { text: "Khác", color: "default" };
                return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
            },
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            width: 150,
            align: "right",
            render: (amount, record) => {
                const formatted = amount.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                });
                return (
                    <span className={record.isIncrease ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                        {record.isIncrease ? "+" : "-"} {formatted}
                    </span>
                );
            },
        },
        {
            title: "Mã tham chiếu",
            dataIndex: "referenceNo",
            key: "referenceNo",
            width: 180,
        },
        {
            title: "Phương thức",
            dataIndex: "method",
            key: "method",
            width: 120,
            render: (method) => method || "-",
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
            render: (note) => note || "-",
        },
    ];

    return (
        <Modal
            title="Chi Tiết Công Nợ"
            open={visible}
            onCancel={onClose}
            width={1200}
            footer={null}
            centered
        >
            <Spin spinning={loading} tip="Đang tải...">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} giao dịch`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    size="small"
                    className="mt-4"
                />
            </Spin>
        </Modal>
    );
}

export default DebtDetailModal;
