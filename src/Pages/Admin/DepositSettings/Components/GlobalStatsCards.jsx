import React from 'react';
import { Card, Statistic, Progress, Row, Col } from 'antd';
import {
    PercentageOutlined,
    SettingOutlined
} from '@ant-design/icons';

function GlobalStatsCards({ minPercentage, maxPercentage, loading = false }) {
    const rangePercentage = maxPercentage - minPercentage;

    const statsData = [
        {
            title: "Tỷ Lệ Tối Thiểu",
            value: minPercentage,
            icon: <PercentageOutlined />,
            color: "#52c41a"
        },
        {
            title: "Tỷ Lệ Tối Đa",
            value: maxPercentage,
            icon: <PercentageOutlined />,
            color: "#1890ff"
        },
        {
            title: "Khoảng Lựa Chọn",
            value: rangePercentage,
            icon: <SettingOutlined />,
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

export default GlobalStatsCards;