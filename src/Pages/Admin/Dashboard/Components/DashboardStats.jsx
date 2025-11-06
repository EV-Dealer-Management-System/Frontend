import React, { useMemo } from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';
import {
    FileTextOutlined,
    CarOutlined,
    TrophyOutlined,
    ThunderboltOutlined,
    UserOutlined,
    ShopOutlined,
    HomeOutlined
} from '@ant-design/icons';

function DashboardStats({ inventoryData, bookingData, staffData, dealerData, warehouseData, dashboardData, loading }) {

    // Tính toán thống kê từ dữ liệu thực
    const stats = useMemo(() => {
        // Xử lý inventory data từ API response
        let validInventoryData = [];
        if (inventoryData?.result?.data && Array.isArray(inventoryData.result.data)) {
            validInventoryData = inventoryData.result.data;
        } else if (Array.isArray(inventoryData)) {
            validInventoryData = inventoryData;
        }

        const validBookingData = Array.isArray(bookingData) ? bookingData : [];

        if (validInventoryData.length === 0 && validBookingData.length === 0 && !dashboardData) {
            return {
                totalBookings: 0,
                totalVehicles: 0,
                approvalRate: 0,
                avgVehiclesPerBooking: 0
            };
        }

        // Tổng số booking - ưu tiên từ dashboardData
        const totalBookings = dashboardData?.totalBookings || validBookingData.length;

        // Tổng số xe - ưu tiên từ dashboardData
        const totalVehicles = dashboardData?.totalVehicles || validInventoryData.reduce((sum, item) => {
            return sum + (item?.quantity || 0);
        }, 0);

        // Tính tỷ lệ phê duyệt (approved bookings - status >= 2)
        const approvedCount = validBookingData.filter(b => b?.status >= 2).length;
        const approvalRate = totalBookings > 0 ? ((approvedCount / totalBookings) * 100).toFixed(1) : 0;

        // Trung bình xe/booking
        const totalBookingVehicles = validBookingData.reduce((sum, b) => {
            return sum + (b?.totalQuantity || 0);
        }, 0);
        const avgVehiclesPerBooking = totalBookings > 0 ? (totalBookingVehicles / totalBookings).toFixed(1) : 0;

        return {
            totalBookings,
            totalVehicles,
            approvalRate,
            avgVehiclesPerBooking
        };
    }, [inventoryData, bookingData, dashboardData]);

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Tổng Booking */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tổng eContract"
                            value={stats.totalBookings}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Progress
                            percent={100}
                            strokeColor="#1890ff"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                {/* Tổng Số Xe */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tổng Số Xe"
                            value={stats.totalVehicles}
                            prefix={<CarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix="xe"
                        />
                        <Progress
                            percent={100}
                            strokeColor="#52c41a"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                {/* Tỷ Lệ Phê Duyệt */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tỷ Lệ Phê Duyệt"
                            value={stats.approvalRate}
                            prefix={<TrophyOutlined />}
                            suffix="%"
                            valueStyle={{ color: '#faad14' }}
                        />
                        <Progress
                            percent={parseFloat(stats.approvalRate)}
                            strokeColor="#faad14"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                {/* TB Xe/Booking */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="TB Xe/Booking"
                            value={stats.avgVehiclesPerBooking}
                            prefix={<ThunderboltOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            suffix="xe"
                        />
                        <Progress
                            percent={Math.min(parseFloat(stats.avgVehiclesPerBooking) * 10, 100)}
                            strokeColor="#722ed1"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Row thứ 2 - Tổng Nhân Viên, Đại Lý và Kho */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tổng Nhân Viên EVM"
                            value={dashboardData?.totalEVMStaff || staffData?.length || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                            suffix="người"
                        />
                        <Progress
                            percent={100}
                            strokeColor="#eb2f96"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tổng Đại Lý"
                            value={dashboardData?.totalDealers || dealerData?.length || 0}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                            suffix="đại lý"
                        />
                        <Progress
                            percent={100}
                            strokeColor="#13c2c2"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title="Tổng Kho EVC"
                            value={dashboardData?.totalEVCInventory || warehouseData?.length || 0}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                            suffix="kho"
                        />
                        <Progress
                            percent={100}
                            strokeColor="#f5222d"
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default DashboardStats;