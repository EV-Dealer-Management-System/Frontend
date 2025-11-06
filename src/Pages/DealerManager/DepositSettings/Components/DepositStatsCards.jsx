import React from 'react';
import { Card, Statistic, Progress, Row, Col } from 'antd';
import {
    PercentageOutlined,
    DollarOutlined,
    PieChartOutlined
} from '@ant-design/icons';

function DepositStatsCards({ depositPercentage, loading = false }) {
    const remainingPercentage = 100 - depositPercentage;

    const statsData = [
        {
            title: "Tỷ Lệ Đặt Cọc Tối Đa",
            value: depositPercentage,
            icon: <PercentageOutlined />,
            color: "#1890ff"
        },
        {
            title: "Thanh Toán Tối Thiểu",
            value: remainingPercentage,
            icon: <DollarOutlined />,
            color: "#52c41a"
        },
        {
            title: "Tổng Phân Chia",
            value: 100,
            icon: <PieChartOutlined />,
            color: "#722ed1"
        }
    ];

    return (
        <Row gutter={[16, 16]}>
            {statsData.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                    <Card loading={loading} className="shadow-md border-0">
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            suffix="%"
                            prefix={stat.icon}
                            valueStyle={{
                                color: stat.color,
                                fontSize: '28px',
                                fontWeight: '600'
                            }}
                        />
                        <Progress
                            percent={stat.value}
                            strokeColor={stat.color}
                            showInfo={false}
                            className="mt-3"
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default DepositStatsCards;