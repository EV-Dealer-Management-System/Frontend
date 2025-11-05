import React from 'react';
import { Card, Row, Col, Typography, Tag, Divider } from 'antd';
import { ShopOutlined, EnvironmentOutlined, FileTextOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';

const { Title, Text } = Typography;

function DealerInfoCard({ dealer, memberTotal }) {
    // Map dealer status
    const dealerStatusMap = {
        0: { text: 'Hoạt động', status: 'success' },
        1: { text: 'Tạm ngưng', status: 'warning' },
        2: { text: 'Ngưng hoạt động', status: 'error' },
    };

    const statusConfig = dealerStatusMap[dealer.dealerStatus] || { text: 'N/A', status: 'default' };

    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <ShopOutlined className="text-blue-600" />
                    <span>Thông tin cơ bản</span>
                </div>
            }
        >
            <ProDescriptions
                column={{ xs: 1, sm: 1, md: 2 }}
                layout="vertical"
                colon={false}
            >
                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <ShopOutlined className="mr-2" />
                            Tên đại lý
                        </Text>
                    }
                    span={2}
                >
                    <Title level={4} className="m-0 text-blue-600">
                        {dealer.name}
                    </Title>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <EnvironmentOutlined className="mr-2" />
                            Địa chỉ
                        </Text>
                    }
                    span={2}
                >
                    <Text strong>{dealer.address || 'Chưa cập nhật'}</Text>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <FileTextOutlined className="mr-2" />
                            Mã số thuế
                        </Text>
                    }
                    copyable
                >
                    {dealer.taxNo || 'Chưa cập nhật'}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            Trạng thái
                        </Text>
                    }
                    valueType="badge"
                    valueEnum={{
                        [dealer.dealerStatus]: {
                            text: statusConfig.text,
                            status: statusConfig.status,
                        },
                    }}
                >
                    {dealer.dealerStatus}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <TrophyOutlined className="mr-2" />
                            Cấp độ
                        </Text>
                    }
                >
                    <Tag color="gold" className="text-base px-3 py-1">
                        Level {dealer.level}
                    </Tag>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <TeamOutlined className="mr-2" />
                            Tổng số nhân viên
                        </Text>
                    }
                >
                    <Text strong className="text-lg text-blue-600">
                        {memberTotal} nhân viên
                    </Text>
                </ProDescriptions.Item>
            </ProDescriptions>
        </Card>
    );
}

export default DealerInfoCard;
