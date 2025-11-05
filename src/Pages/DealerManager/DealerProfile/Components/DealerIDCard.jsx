import React from 'react';
import { Card, Typography } from 'antd';
import { ProDescriptions } from '@ant-design/pro-components';

const { Text } = Typography;

function DealerIDCard({ dealer }) {
    return (
        <Card className="shadow-sm" title="Chi tiết ID">
            <ProDescriptions
                column={{ xs: 1, sm: 1, md: 2 }}
                layout="vertical"
                colon={false}
            >
                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            Dealer ID
                        </Text>
                    }
                    copyable
                >
                    <Text code className="text-xs font-mono">
                        {dealer.id}
                    </Text>
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label={
                        <Text type="secondary" className="text-xs">
                            Dealer Tier ID
                        </Text>
                    }
                    copyable
                >
                    <Text code className="text-xs font-mono">
                        {dealer.dealerTierId}
                    </Text>
                </ProDescriptions.Item>
            </ProDescriptions>
        </Card>
    );
}

export default DealerIDCard;
