import React, { useMemo } from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';
import {
    CarOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    FileTextOutlined,
    TruckOutlined,
    UserOutlined,
} from '@ant-design/icons';

function DashboardStats({ dashboardData, loading }) {
    // Tính toán thống kê từ dữ liệu thực
    const stats = useMemo(() => {
        if (!dashboardData) {
            return {
                totalBookings: 0,
                totalDeliveries: 0,
                totalQuotes: 0,
                totalVehicles: 0,
                totalCustomers: 0,
                totalActiveStaff: 0,
                deliveryRate: 0,
                quoteConversionRate: 0
            };
        }

        // Tính tỷ lệ giao hàng
        const deliveryRate = dashboardData.totalBookings > 0
            ? ((dashboardData.totalDeliveries / dashboardData.totalBookings) * 100).toFixed(1)
            : 0;

        // Tính tỷ lệ chuyển đổi từ báo giá
        const quoteConversionRate = dashboardData.totalQuotes > 0
            ? ((dashboardData.totalBookings / dashboardData.totalQuotes) * 100).toFixed(1)
            : 0;

        return {
            ...dashboardData,
            deliveryRate,
            quoteConversionRate
        };
    }, [dashboardData]);

    const statsConfig = [
        {
            title: "Tổng Order Đặt Xe",
            value: stats.totalBookings,
            icon: <ShoppingCartOutlined />,
            color: "#1890ff",
            progress: 100
        },
        // {
        //     title: "Xe Đã Giao",
        //     value: stats.totalDeliveries,
        //     icon: <TruckOutlined />,
        //     color: "#52c41a",
        //     progress: parseFloat(stats.deliveryRate) || 0
        // },
        {
            title: "Báo Giá Tạo",
            value: stats.totalQuotes,
            icon: <FileTextOutlined />,
            color: "#faad14",
            progress: parseFloat(stats.quoteConversionRate) || 0
        },
        {
            title: "Xe Trong Kho",
            value: stats.totalVehicles,
            icon: <CarOutlined />,
            color: "#722ed1",
            progress: 100
        },
        {
            title: "Tổng Khách Hàng",
            value: stats.totalCustomers,
            icon: <UserOutlined />,
            color: "#13c2c2",
            progress: 100
        },
        {
            title: "Tổng Nhân Viên",
            value: stats.totalActiveStaff,
            icon: <TeamOutlined />,
            color: "#fa541c",
            progress: 100
        }
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {statsConfig.map((stat, index) => (
                <Col xs={24} sm={12} lg={4} key={index}>
                    <Card bordered={false} hoverable loading={loading}>
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            prefix={stat.icon}
                            valueStyle={{ color: stat.color }}
                        />
                        <Progress
                            percent={stat.progress}
                            strokeColor={stat.color}
                            showInfo={false}
                            className="mt-2"
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default DashboardStats;