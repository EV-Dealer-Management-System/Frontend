import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
    TrophyOutlined,
    DollarOutlined,
    PercentageOutlined,
} from "@ant-design/icons";

function TierStatistics({ statistics }) {
    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Tổng Số Tier"
                        value={statistics.totalTiers}
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: "#1890ff", fontSize: 28, fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Hoa Hồng TB"
                        value={statistics.avgCommission}
                        suffix="%"
                        prefix={<PercentageOutlined />}
                        valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Hạn Mức Tối Đa"
                        value={statistics.maxCreditLimit / 1000000000}
                        suffix="B"
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#fa8c16", fontSize: 28, fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Phạt Thấp Nhất"
                        value={statistics.minPenalty}
                        suffix="%"
                        prefix={<PercentageOutlined />}
                        valueStyle={{ color: "#722ed1", fontSize: 28, fontWeight: 700 }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default TierStatistics;
