import React from "react";
import { Tag, Table, message } from "antd";
import { getDealerDebtDetail } from "../../../../App/EVMAdmin/DealerTierManagement/GetDealerDebtDetail";

// Component hiển thị modal chi tiết công nợ đại lý
function DealerDebtDetailModal({ modal }) {
    const handleViewDebtDetail = async (dealerId, dealerName) => {
        try {
            const now = new Date();
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0, 23, 59, 59);

            const response = await getDealerDebtDetail(
                dealerId,
                quarterStart.toISOString(),
                quarterEnd.toISOString()
            );

            if (response.isSuccess) {
                const debtColumns = [
                    {
                        title: 'STT',
                        key: 'index',
                        width: 60,
                        align: 'center',
                        render: (_, __, index) => index + 1,
                    },
                    {
                        title: 'Ngày Phát Sinh',
                        dataIndex: 'occurredAtUtc',
                        key: 'occurredAtUtc',
                        width: 150,
                        render: (date) => new Date(date).toLocaleString('vi-VN'),
                    },
                    {
                        title: 'Loại',
                        dataIndex: 'type',
                        key: 'type',
                        width: 120,
                        align: 'center',
                        render: (type) => {
                            const typeConfig = {
                                1: { color: 'orange', text: 'Mua Hàng' },
                                2: { color: 'green', text: 'Thanh Toán' },
                                3: { color: 'purple', text: 'Hoa Hồng' },
                                4: { color: 'red', text: 'Phí Phạt' },
                                5: { color: 'blue', text: 'Điều Chỉnh' },
                            };
                            const config = typeConfig[type] || { color: 'default', text: 'Khác' };
                            return <Tag color={config.color}>{config.text}</Tag>;
                        },
                    },
                    {
                        title: 'Số Tiền',
                        dataIndex: 'amount',
                        key: 'amount',
                        width: 150,
                        align: 'right',
                        render: (amount, record) => (
                            <span className={`font-semibold ${record.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                                {record.isIncrease ? '+' : '-'}{amount?.toLocaleString('vi-VN')} VNĐ
                            </span>
                        ),
                    },
                    {
                        title: 'Mã Đơn',
                        dataIndex: 'sourceNo',
                        key: 'sourceNo',
                        width: 150,
                    },
                    {
                        title: 'Phương Thức',
                        dataIndex: 'method',
                        key: 'method',
                        width: 120,
                        render: (method) => method || '-',
                    },
                    {
                        title: 'Ghi Chú',
                        dataIndex: 'note',
                        key: 'note',
                        ellipsis: true,
                        render: (note) => note || '-',
                    },
                ];

                modal.info({
                    title: `Chi Tiết Công Nợ - ${dealerName}`,
                    width: 1200,
                    content: (
                        <div className="mt-4">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Kỳ: {quarterStart.toLocaleDateString('vi-VN')} - {quarterEnd.toLocaleDateString('vi-VN')}
                                </span>
                                <Tag color="blue">
                                    Tổng: {response.result.pagination.totalItems} giao dịch
                                </Tag>
                            </div>
                            <Table
                                columns={debtColumns}
                                dataSource={response.result.data}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    total: response.result.pagination.totalItems,
                                    showTotal: (total) => `Tổng ${total} giao dịch`,
                                }}
                                size="small"
                                bordered
                                scroll={{ x: 1000 }}
                            />
                        </div>
                    ),
                    okText: 'Đóng',
                });
            } else {
                message.error(response.message || 'Không thể tải chi tiết công nợ');
            }
        } catch (error) {
            console.error('Error fetching dealer debt details:', error);
            message.error('Có lỗi xảy ra khi tải chi tiết công nợ');
        }
    };

    return { handleViewDebtDetail };
}

export default DealerDebtDetailModal;