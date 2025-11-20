import React from 'react';
import { Card, Descriptions, Tag, Statistic, Row, Col } from 'antd';
import { PercentageOutlined, DollarOutlined, WalletOutlined, ClockCircleOutlined } from '@ant-design/icons';

function EffectivePolicyCard({ effectivePolicy }) {
    if (!effectivePolicy) return null;

    const {
        dealerTierName,
        dealerTierLevel,
        source,
        commissionPercent,
        creditLimit,
        latePenaltyPercent,
        depositPercent,
        overrideNote,
        overrideEffectiveFrom,
        overrideEffectiveTo,
    } = effectivePolicy;

    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <PercentageOutlined className="text-green-600" />
                    <span>Chính Sách Hiệu Lực</span>
                </div>
            }
            extra={
                <Tag color={source === "Tier" ? "blue" : "orange"}>
                    {source === "Tier" ? "Từ Tier" : "Ghi Đè"}
                </Tag>
            }
        >
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={24} sm={12} lg={6}>
                    <Statistic
                        title="Hoa Hồng"
                        value={commissionPercent}
                        precision={2}
                        suffix="%"
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<PercentageOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Statistic
                        title="Hạn Mức Tín Dụng"
                        value={creditLimit}
                        precision={0}
                        suffix="VNĐ"
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<DollarOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Statistic
                        title="Phí Trả Chậm"
                        value={latePenaltyPercent}
                        precision={2}
                        suffix="%"
                        valueStyle={{ color: '#cf1322' }}
                        prefix={<ClockCircleOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Statistic
                        title="Đặt Cọc"
                        value={depositPercent}
                        precision={2}
                        suffix="%"
                        valueStyle={{ color: '#faad14' }}
                        prefix={<WalletOutlined />}
                    />
                </Col>
            </Row>

            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Tier">
                    <Tag color="blue">{dealerTierName}</Tag>
                    <span className="ml-2 text-gray-500">Level {dealerTierLevel}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Nguồn Chính Sách">
                    <Tag color={source === "Tier" ? "blue" : "orange"}>
                        {source === "Tier" ? "Từ Tier" : "Ghi Đè"}
                    </Tag>
                </Descriptions.Item>

                {overrideNote && (
                    <Descriptions.Item label="Ghi Chú Ghi Đè" span={2}>
                        {overrideNote}
                    </Descriptions.Item>
                )}

                {overrideEffectiveFrom && (
                    <Descriptions.Item label="Hiệu Lực Từ">
                        {new Date(overrideEffectiveFrom).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                )}

                {overrideEffectiveTo && (
                    <Descriptions.Item label="Hiệu Lực Đến">
                        {new Date(overrideEffectiveTo).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Card>
    );
}

export default EffectivePolicyCard;
