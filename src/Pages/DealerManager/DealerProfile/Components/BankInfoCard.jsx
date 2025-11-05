import React from 'react';
import { Card, Typography } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';

const { Text } = Typography;

function BankInfoCard({ dealer }) {
    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <BankOutlined className="text-purple-600" />
                    <span>Thông tin ngân hàng</span>
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
                            Tên ngân hàng
                        </Text>
                    }
                >
                    {dealer.bankName || <Text type="secondary" italic>Chưa cập nhật</Text>}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            Số tài khoản
                        </Text>
                    }
                    copyable={!!dealer.bankAccount}
                >
                    {dealer.bankAccount || <Text type="secondary" italic>Chưa cập nhật</Text>}
                </ProDescriptions.Item>
            </ProDescriptions>
        </Card>
    );
}

export default BankInfoCard;
