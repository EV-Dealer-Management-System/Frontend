import React, { useMemo } from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';
import {
    FileTextOutlined,
    CarOutlined,
    ShopOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

function DashboardStats({ feedbackData, deliveryData, dealerData, loading }) {

    // Tính toán thống kê từ dữ liệu thực
    const stats = useMemo(() => {
        if (!feedbackData || !deliveryData || !dealerData) {
            return {
                totalFeedbacks: 0,
                totalDeliveries: 0,
                totalDealers: 0,
                completionRate: 0
            };
        }

        // Tổng số dealer feedback
        const totalFeedbacks = feedbackData.length;

        // Tổng số giao xe
        const totalDeliveries = deliveryData.length;

        // Tổng số đại lý
        const totalDealers = dealerData.length;

        // Tính tỷ lệ hoàn thành giao xe (status = Completed)
        const completedDeliveries = deliveryData.filter(d => d.status === 5 || d.status === 6).length;
        const completionRate = totalDeliveries > 0 ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1) : 0;

        return {
            totalFeedbacks,
            totalDeliveries,
            totalDealers,
            completionRate
        };
    }, [feedbackData, deliveryData, dealerData]);

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {/* Tổng Dealer Feedback */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Số Dealer Feedback"
                        value={stats.totalFeedbacks}
                        prefix={<FileTextOutlined />}
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

            {/* Tổng Giao Xe */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Tổng Giao Xe"
                        value={stats.totalDeliveries}
                        prefix={<CarOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                    <Progress
                        percent={100}
                        strokeColor="#52c41a"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>

            {/* Tổng Đại Lý */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Tổng Đại Lý"
                        value={stats.totalDealers}
                        prefix={<ShopOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                    <Progress
                        percent={100}
                        strokeColor="#722ed1"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>

            {/* Tỷ Lệ Hoàn Thành */}
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable loading={loading}>
                    <Statistic
                        title="Tỷ Lệ Hoàn Thành"
                        value={stats.completionRate}
                        prefix={<CheckCircleOutlined />}
                        suffix="%"
                        valueStyle={{ color: '#faad14' }}
                    />
                    <Progress
                        percent={parseFloat(stats.completionRate)}
                        strokeColor="#faad14"
                        showInfo={false}
                        className="mt-2"
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default DashboardStats;
