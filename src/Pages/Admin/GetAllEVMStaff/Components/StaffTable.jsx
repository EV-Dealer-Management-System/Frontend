import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Tag, Space, Avatar, Typography, Empty, Switch } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
 import {ConfigProvider} from "antd";
import viVN from 'antd/lib/locale/vi_VN';
const { Text } = Typography;

function StaffTable({ dataSource, loading, onToggleStatus }) {
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            search: false,
            render: (_, __, index) => (
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                    <Text strong className="text-blue-600 text-base">{index + 1}</Text>
                </div>
            ),
        },
        {
            title: 'Thông tin nhân viên',
            key: 'staff',
            width : 380,
            search: false,
            render: (_, record) => (
                <Space size="middle" className="py-2">
                    <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-blue-500 to-purple-600 shadow-md"
                    />
                    <div className="flex flex-col gap-0">
                        <Text strong className="text-lg text-gray-800">
                            {record.fullName || 'Chưa cập nhật'}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                            <MailOutlined className="text-blue-400" />
                            <Text type="secondary" className="text-sm"> {record.email}</Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width : 140,
            align: 'center',
            search: false,
            render: (__, record) => {
                // backend returns lockoutEnabled: true when locked/disabled
                const isActive = !(record.lockoutEnabled === true);
                return (
                    <Space align="center">
                        <Switch
                            checked={isActive}
                            onChange={(checked) => onToggleStatus && onToggleStatus(record, checked)}
                            loading={!!record._updating}
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Ngưng"
                        />
                    </Space>
                );
            },
        },
    ];

    return (
        <ConfigProvider locale={viVN}>
            <style>{`
                .staff-table .ant-table {
                    table-layout: auto !important;
                    width: 100%;
                }
                .staff-table .ant-table-cell {
                    white-space: normal !important;
                    word-break: break-word !important;
                    padding: 16px 12px;
                }
            `}</style>
            <ProTable
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                rowKey={(record) => record.id || record.email}
                search={false}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                size="large"
                options={{
                    reload: false,
                    density: true,
                    setting: true,
                    fullScreen: true,
                }}
                scroll={{ x: '100%' }}
                headerTitle={
                    <Space size="middle">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
                            <UserOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                            <Text strong className="text-2xl">Danh sách nhân viên EVM</Text>
                            <div className="text-sm text-gray-500">
                                Tổng số: <Text strong className="text-blue-600">{dataSource?.length || 0}</Text> nhân viên
                            </div>
                        </div>
                    </Space>
                }
                toolbar={{ multipleLine: false }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Space direction="vertical" size={4}>
                                    <Text type="secondary">Không có dữ liệu nhân viên</Text>
                                    <Text type="secondary" className="text-xs">Vui lòng chọn trang để tải dữ liệu</Text>
                                </Space>
                            }
                        />
                    ),
                }}
                rowClassName={(_, index) => (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                className="staff-table w-full"
            />
        </ConfigProvider>
    );
}

export default StaffTable;
