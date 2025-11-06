import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Tag, Avatar, Button } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    EditOutlined,
    MailOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

function CustomerTable({ customers, loading, onEditCustomer }) {
    // Define table columns with improved design
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    backgroundColor: '#f0f5ff',
                    borderRadius: '50%',
                    margin: '0 auto'
                }}>
                    <span style={{ color: '#1890ff', fontWeight: 500, fontSize: '12px' }}>
                        {index + 1}
                    </span>
                </div>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customerInfo',
            width: '25%',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        size={36}
                        style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                        icon={<UserOutlined />}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                            fontWeight: 600, 
                            color: '#262626',
                            fontSize: '14px',
                            marginBottom: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {record.fullName || 'Chưa cập nhật'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <PhoneOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                            <span style={{ 
                                color: '#8c8c8c', 
                                fontSize: '12px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {record.phoneNumber || 'Chưa có'}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: '20%',
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    {record.email && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 6, 
                            marginBottom: 4,
                            overflow: 'hidden'
                        }}>
                            <MailOutlined style={{ color: '#1890ff', flexShrink: 0 }} />
                            <span style={{ 
                                color: '#595959',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {record.email}
                            </span>
                        </div>
                    )}
                    {record.citizenID && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IdcardOutlined style={{ color: '#722ed1', flexShrink: 0 }} />
                            <span style={{ color: '#595959' }}>{record.citizenID}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: '20%',
            ellipsis: true,
            render: (address) => (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <EnvironmentOutlined style={{ 
                        color: '#fa541c', 
                        marginTop: 2,
                        flexShrink: 0,
                        fontSize: '12px'
                    }} />
                    <span style={{ 
                        color: '#8c8c8c', 
                        fontSize: '12px',
                        lineHeight: '1.4'
                    }} title={address}>
                        {address || 'Chưa cập nhật'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            render: (date) => {
                const isNew = dayjs(date).isAfter(dayjs().subtract(7, 'days'));
                return (
                    <div>
                        <div style={{ 
                            color: '#262626', 
                            fontSize: '12px', 
                            fontWeight: 500,
                            marginBottom: 2
                        }}>
                            {dayjs(date).format('DD/MM/YYYY')}
                        </div>
                        <div style={{ 
                            color: '#bfbfbf', 
                            fontSize: '11px',
                            marginBottom: isNew ? 4 : 0
                        }}>
                            {dayjs(date).format('HH:mm')}
                        </div>
                        {isNew && <Tag color="green" size="small">Mới</Tag>}
                    </div>
                );
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: '12%',
            ellipsis: true,
            render: (note) => (
                <span style={{ 
                    color: '#8c8c8c', 
                    fontStyle: 'italic', 
                    fontSize: '12px' 
                }} title={note || 'Không có ghi chú'}>
                    {note || '-'}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '8%',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditCustomer(record)}
                    style={{
                        fontSize: '12px',
                        height: 28,
                        padding: '0 8px'
                    }}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <ProTable
            dataSource={customers}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                    <span style={{ color: '#666' }}>
                        <TeamOutlined /> Hiển thị {range[0]}-{range[1]} trong tổng số <strong>{total}</strong> khách hàng
                    </span>
                ),
                pageSizeOptions: ['8', '15', '30', '50'],
            }}
            search={false}
            options={{
                reload: () => {
                    window.location.reload();
                },
                density: true,
                setting: true,
                fullScreen: true,
            }}
            cardProps={false}
            size="large"
            headerTitle={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        borderRadius: '8px'
                    }}>
                        <TeamOutlined style={{ color: '#fff', fontSize: '20px' }} />
                    </div>
                    <div>
                        <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            color: '#262626',
                            marginBottom: 2
                        }}>
                            Danh Sách Khách Hàng
                        </div>
                        <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                            Quản lý thông tin khách hàng xe máy điện
                        </div>
                    </div>
                </div>
            }
            rowClassName={(_, index) => 
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }
        />
    );
}

export default CustomerTable;
