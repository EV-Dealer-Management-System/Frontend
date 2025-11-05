import React from 'react';
import { Card, Tag, Typography, Empty, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';

const { Text } = Typography;

function ContractListCard({ econtractDealer = [] }) {
    // Map contract status
    const contractStatusMap = {
        1: { text: 'Nháp', status: 'default' },
        2: { text: 'Chờ ký', status: 'processing' },
        3: { text: 'Đã ký', status: 'success' },
        4: { text: 'Hoàn tất', status: 'success' },
        5: { text: 'Đã hủy', status: 'error' },
    };

    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-orange-600" />
                    <span>Hợp đồng điện tử ({econtractDealer.length})</span>
                </div>
            }
        >
            {econtractDealer.length > 0 ? (
                <ProList
                    dataSource={econtractDealer}
                    rowKey="id"
                    metas={{
                        title: {
                            dataIndex: 'name',
                            render: (_, record) => (
                                <div className="text-center">
                                    <div style={{ width: '80px' }}></div>
                                    <Text strong className="text-center">{record.name}</Text>
                                    <Tag color={contractStatusMap[record.status]?.status || 'default'}>
                                        {contractStatusMap[record.status]?.text || 'N/A'}
                                    </Tag>
                                </div>
                            ),
                        },
                        // description: {
                        //     render: (_, record) => (
                        //         <div className="text-center">
                        //             <Space split={<span className="text-gray-300">•</span>} size="small">
                        //                 {/* <Text type="secondary" className="text-center-xs">
                        //                     Người tạo: <Text className="text-xs">{record.ownerName || 'N/A'}</Text>
                        //                 </Text> */}
                        //                 {/* <Text type="secondary" className="text-xs">
                        //                     Ngày tạo: <Text className="text-xs">{new Date(record.createdAt).toLocaleString('vi-VN')}</Text>
                        //                 </Text> */}
                        //             </Space>
                        //         </div>
                        //     ),
                        // },
                    }}
                    split
                />
            ) : (
                <Empty
                    image={<FileTextOutlined className="text-6xl text-gray-300" />}
                    description={<Text type="secondary">Chưa có hợp đồng điện tử nào</Text>}
                />
            )}
        </Card>
    );
}

export default ContractListCard;
