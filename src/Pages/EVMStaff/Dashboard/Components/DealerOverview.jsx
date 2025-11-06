import React, { useMemo } from 'react';
import { Row, Col, Table, Card, Progress } from 'antd';
import { TrophyOutlined, ShopOutlined } from '@ant-design/icons';

function DealerOverview({ dealerData = [], bookingData, loading }) {

    // Top 5 đại lý có booking nhiều nhất
    const topDealersByBooking = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];

        // Đếm số booking của mỗi đại lý từ createdBy
        const dealerBookingCount = {};

        bookingData.forEach(booking => {
            if (booking.createdBy) {
                dealerBookingCount[booking.createdBy] = (dealerBookingCount[booking.createdBy] || 0) + 1;
            }
        });

        // Tạo danh sách đại lý từ booking data
        const dealersWithBookingCount = Object.entries(dealerBookingCount).map(([dealerName, bookingCount]) => ({
            id: dealerName, // Sử dụng tên làm key
            dealerName: dealerName,
            bookingCount: bookingCount,
            // Tìm thông tin bổ sung từ dealerData nếu có
            ...(dealerData?.find(dealer => dealer.dealerName === dealerName) || {})
        }));

        // Sắp xếp theo số booking giảm dần và lấy top 5
        return dealersWithBookingCount
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 5);
    }, [bookingData, dealerData]);

    // Tính phần trăm booking cho progress bar
    const maxBookingCount = topDealersByBooking.length > 0 ? Math.max(...topDealersByBooking.map(d => d.bookingCount)) : 0;

    const columns = [
        {
            title: 'STT',
            key: 'rank',
            width: 60,
            align: 'center',
            render: (_, __, index) => (
                <span className="font-semibold text-gray-600">{index + 1}</span>
            )
        },
        {
            title: 'Tên Đại Lý',
            dataIndex: 'dealerName',
            key: 'dealerName',
            width: 100,
            render: (text) => <span className="font-medium text-gray-800">{text || 'N/A'}</span>
        },
        {
            title: 'Số Booking',
            dataIndex: 'bookingCount',
            key: 'bookingCount',
            width: 140,
            align: 'center',
            render: (count) => (
                <div className="space-y-1">
                    <div className="font-bold text-blue-600 text-lg">{count}</div>
                    <Progress
                        percent={maxBookingCount > 0 ? (count / maxBookingCount) * 100 : 0}
                        showInfo={false}
                        strokeColor="#1677ff"
                        size="small"
                    />
                </div>
            )
        },
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col span={24}>
                <Card
                    title={
                        <div className="flex items-center gap-2">              
                            <span>Top 5 Đại Lý Có Booking Nhiều Nhất</span>
                        </div>
                    }
                    extra={
                        <div className="text-sm text-gray-500">
                            Tổng: {topDealersByBooking.reduce((sum, dealer) => sum + dealer.bookingCount, 0)} booking
                        </div>
                    }
                    loading={loading}
                    className="shadow-sm"
                >
                    <Table
                        columns={columns}
                        dataSource={topDealersByBooking}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        scroll={{ x: true }}
                        locale={{
                            emptyText: (
                                <div className="py-8 text-center">
                                    <TrophyOutlined className="text-4xl text-gray-300 mb-2" />
                                    <div className="text-gray-400">Chưa có dữ liệu booking</div>
                                </div>
                            )
                        }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default DealerOverview;
