import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';

function OrderStats({ stats }) {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="outlined" className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Tổng đơn hàng"
                        value={stats.total}
                        prefix={<ShoppingCartOutlined />}
                        valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="outlined" className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Đang xử lý"
                        value={stats.pending}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="outlined" className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Hoàn tất"
                        value={stats.done}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card variant="outlined" className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Đã hủy"
                        value={stats.cancelled}
                        prefix={<StopOutlined />}
                        valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default OrderStats;