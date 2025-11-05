import React from 'react';
import { Card, Typography } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';

const { Text } = Typography;

function ManagerInfoCard({ dealer }) {
    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-green-600" />
                    <span>Người quản lý</span>
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
                            <UserOutlined className="mr-2" />
                            Họ và tên
                        </Text>
                    }
                >
                    <Text strong className="text-base">
                        {dealer.managerName || 'N/A'}
                    </Text>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            <MailOutlined className="mr-2" />
                            Email
                        </Text>
                    }
                    copyable
                >    
                  <Text strong className="text-base">
                    {dealer.managerEmail || 'N/A'}
                    </Text>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            Manager ID
                        </Text>
                    }
                    span={2}
                    copyable
                >
                    <Text code className="text-xs">
                        {dealer.managerId}
                    </Text>
                </ProDescriptions.Item>
            </ProDescriptions>
        </Card>
    );
}

export default ManagerInfoCard;
