import React, { useMemo } from 'react';
import { Row, Col, Table, Tag, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function ContractCharts({ bookingData, loading }) {
    const navigate = useNavigate();

    // Lọc chỉ lấy booking chờ duyệt (status = 2)
    const pendingBookings = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];
        return bookingData.filter(booking => booking.status === 2);
    }, [bookingData]);

    // Format ngày tháng
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Cột cho bảng booking chờ duyệt
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => <span className="font-semibold text-gray-600">{index + 1}</span>
        },
        {
            title: 'Tên Đại Lý',
            dataIndex: 'createdBy',
            key: 'createdBy',
            ellipsis: true,
            render: (text) => <span className="font-medium text-gray-600">{text || 'N/A'}</span>
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            width: 120,
            render: (date) => <span className="text-gray-600">{formatDate(date)}</span>
        },
        {
            title: 'Số Lượng',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            width: 100,
            align: 'center',
            render: (text) => <span className="font-semibold text-blue-600">{text || 0} xe</span>
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            render: () => (
                <Tag color="orange" className="px-3 py-1 text-sm font-medium">
                    Chờ Duyệt
                </Tag>
            )
        },
        { 
            title: 'Ghi Chú',
            dataIndex: 'note',
            key: 'note',
            width: 100,
            render: (note) => <span className="text-gray-200">{note || 'N/A'}</span>
        }
        // {
        //     title: 'Thao Tác',
        //     key: 'actions',
        //     width: 120,
        //     align: 'center',
        //     render: () => (
        //         <Button
        //             type="link"
        //             icon={<EyeOutlined />}
        //             onClick={() => navigate(`/evm-staff/bookings`)}
        //         >
        //             Chi tiết
        //         </Button>
        //     )
        // }
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {/* Bảng booking chờ duyệt */}
            <Col xs={24}>
                <ProCard
                    title="Booking Chờ Duyệt"
                    bordered
                    headerBordered
                    extra={
                        <div className="flex items-center gap-2">
                            <Tag color="orange">{pendingBookings.length} booking</Tag>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => navigate('/evm-staff/ev/get-all-ev-booking')}
                            >
                                Xem tất cả
                            </Button>
                        </div>
                    }
                    loading={loading}
                >
                    <Table
                        columns={columns}
                        dataSource={pendingBookings.slice(0, 5)}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: true }}
                        locale={{
                            emptyText: (
                                <div className="py-8 text-center">
                                    <FileTextOutlined className="text-4xl text-gray-300 mb-2" />
                                    <div className="text-gray-400">Không có booking chờ duyệt</div>
                                </div>
                            )
                        }}
                    />
                </ProCard>
            </Col>
        </Row>
    );
}

export default ContractCharts;
