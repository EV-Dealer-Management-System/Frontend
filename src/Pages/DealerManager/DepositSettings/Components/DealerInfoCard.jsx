import React from 'react';
import { Card, Typography, Tag } from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

function DealerInfoCard({ dealerInfo, loading = false }) {
    if (!dealerInfo?.dealerName) {
        return null;
    }

    const { dealerName, managerName } = dealerInfo;

    return (
        <Card
            className="shadow-md border-0"
            loading={loading}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShopOutlined className="text-blue-600 text-xl" />
                    </div>

                    <div>
                        <Title level={4} className="mb-1">
                            {dealerName}
                        </Title>
                        <div className="flex items-center gap-2 text-gray-600">
                            <UserOutlined />
                            <Text>Quản lý: {managerName || 'N/A'}</Text>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                    >
                        Hoạt động
                    </Tag>
                </div>
            </div>
        </Card>
    );
}

export default DealerInfoCard;