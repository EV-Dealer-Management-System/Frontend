import React, { useMemo } from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';
import { ClockCircleOutlined, AuditOutlined, FileTextOutlined, ShopOutlined } from '@ant-design/icons';

function BookingOverview({ bookingData, loading }) {

    // Lọc booking chờ dealer ký (status = 1)
    const waitingDealerSign = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];
        return bookingData.filter(booking => booking.status === 1);
    }, [bookingData]);

    // Lọc booking chờ duyệt (status = 2)
    const pendingApproval = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) return [];
        return bookingData.filter(booking => booking.status === 2);
    }, [bookingData]);

    // Đếm số lượng đại lý có booking chờ duyệt
    const dealersWithPendingBookings = useMemo(() => {
        if (!pendingApproval || pendingApproval.length === 0) return 0;

        const uniqueDealerIds = new Set(
            pendingApproval
                .filter(booking => booking.dealerId)
                .map(booking => booking.dealerId)
        );

        return uniqueDealerIds.size;
    }, [pendingApproval]);

    // Tổng số booking cần xử lý
    const totalPending = waitingDealerSign.length + pendingApproval.length;

    // Tính % booking chờ duyệt so với tổng
    const pendingPercentage = bookingData?.length > 0
        ? ((pendingApproval.length / bookingData.length) * 100).toFixed(1)
        : 0;

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {/* Tổng Booking Cần Xử Lý */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Booking Cần Xử Lý"
                        value={totalPending}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                    />
                    <Progress
                        percent={bookingData?.length > 0 ? ((totalPending / bookingData.length) * 100).toFixed(1) : 0}
                        strokeColor="#fa8c16"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>

            {/* Chờ Dealer Ký */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Chờ Dealer Ký"
                        value={waitingDealerSign.length}
                        prefix={<AuditOutlined />}
                        valueStyle={{ color: '#faad14' }}
                    />
                    <Progress
                        percent={bookingData?.length > 0 ? ((waitingDealerSign.length / bookingData.length) * 100).toFixed(1) : 0}
                        strokeColor="#faad14"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>

            {/* Chờ Duyệt */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Chờ Duyệt"
                        value={pendingApproval.length}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Progress
                        percent={parseFloat(pendingPercentage)}
                        strokeColor="#ff4d4f"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>

            {/* Đại Lý Chờ Duyệt */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Đại Lý Chờ Duyệt"
                        value={dealersWithPendingBookings}
                        prefix={<ShopOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                    <Progress
                        percent={100}
                        strokeColor="#1890ff"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default BookingOverview;
