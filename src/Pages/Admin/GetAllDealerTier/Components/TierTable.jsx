import React, { useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Tag, Card, Tooltip, Button } from "antd";
import { PercentageOutlined, EditOutlined } from "@ant-design/icons";
import TierLevelDisplay from "./TierLevelDisplay";
import EditTierModal from "./EditTierModal";

function TierTable({ dealerTiers, loading, onReload, onUpdate }) {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);

    const handleEdit = (record) => {
        setSelectedTier(record);
        setEditModalVisible(true);
    };

    const handleEditSuccess = () => {
        setEditModalVisible(false);
        setSelectedTier(null);
        // Gọi onUpdate để reload data ngay lập tức không hiện message
        if (onUpdate) {
            onUpdate();
        }
    };
    // Format currency VND
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Columns configuration
    const columns = [
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
            width: 120,
            align: "center",
            sorter: (a, b) => a.level - b.level,
            render: (level) => <TierLevelDisplay level={level} />,
        },
        {
            title: "Tên Tier",
            dataIndex: "name",
            key: "name",
            width: 160,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span className="font-medium" style={{ fontSize: 12 }}>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: "HH",
            dataIndex: "baseCommissionPercent",
            key: "baseCommissionPercent",
            width: 70,
            align: "center",
            sorter: (a, b) => a.baseCommissionPercent - b.baseCommissionPercent,
            render: (percent) => (
                <Tag
                    color="green"
                    style={{ fontSize: 10, fontWeight: 600, margin: 0 }}
                >
                    {percent}%
                </Tag>
            ),
        },
        {
            title: "Hạn Mức",
            dataIndex: "baseCreditLimit",
            key: "baseCreditLimit",
            width: 90,
            align: "center",
            sorter: (a, b) => a.baseCreditLimit - b.baseCreditLimit,
            render: (amount) => (
                <Tooltip title={formatCurrency(amount)}>
                    <span className="font-semibold" style={{ fontSize: 11, color: "#1890ff" }}>
                        {(amount / 1000000000).toFixed(1)}B
                    </span>
                </Tooltip>
            ),
        },
        {
            title: "Phạt",
            dataIndex: "baseLatePenaltyPercent",
            key: "baseLatePenaltyPercent",
            width: 70,
            align: "center",
            sorter: (a, b) => a.baseLatePenaltyPercent - b.baseLatePenaltyPercent,
            render: (percent) => (
                <Tag color="red" style={{ fontSize: 10, fontWeight: 600, margin: 0 }}>
                    {percent}%
                </Tag>
            ),
        },
        {
            title: "Cọc",
            dataIndex: "baseDepositPercent",
            key: "baseDepositPercent",
            width: 70,
            align: "center",
            sorter: (a, b) => a.baseDepositPercent - b.baseDepositPercent,
            render: (percent) => (
                <Tag color="orange" style={{ fontSize: 10, fontWeight: 600, margin: 0 }}>
                    {percent}%
                </Tag>
            ),
        },
        {
            title: "Mô Tả",
            dataIndex: "description",
            key: "description",
            width: 180,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span style={{ fontSize: 11, color: "#595959" }}>{text || "N/A"}</span>
                </Tooltip>
            ),
        },
        {
            title: "Thao Tác",
            key: "action",
            width: 100,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <>
            <Card bordered={false} className="shadow-md rounded-lg">
                <ProTable
                    columns={columns}
                    dataSource={dealerTiers}
                    rowKey="id"
                    loading={loading}
                    search={false}
                    toolbar={{
                        title: (
                            <span className="text-lg font-semibold">
                                Danh Sách Dealer Tier
                            </span>
                        ),
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => (
                            <span className="text-sm text-gray-600">
                                Tổng <strong>{total}</strong> tier
                            </span>
                        ),
                    }}
                    options={{
                        reload: onReload,
                        density: true,
                        setting: true,
                    }}
                    rowClassName={(record, index) =>
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }
                    className="rounded-lg overflow-hidden"

                />
            </Card>

            <EditTierModal
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onSuccess={handleEditSuccess}
                tierData={selectedTier}
            />
        </>
    );
}

export default TierTable;
