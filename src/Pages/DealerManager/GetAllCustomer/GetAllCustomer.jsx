import React, { useState, useEffect } from 'react';
import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Card, message, Tag, Avatar, Row, Col, Space, Button } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    UserAddOutlined,
    SmileOutlined,
    EditOutlined,
    MailOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import { getAllCustomer } from '../../../App/DealerManager/CustomerManagement/GetAllCustomer';
import CustomerEditModal from './Components/CustomerEditModal';
import dayjs from 'dayjs';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
const { Statistic } = StatisticCard;

function GetAllCustomer() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Fetch customers data
    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const data = await getAllCustomer();
                if (data.isSuccess) {
                    // Đảm bảo customers luôn là array
                    const customersList = Array.isArray(data.result)
                        ? data.result
                        : (data.result?.data || []);
                    setCustomers(customersList);
                    message.success(`Đã tải ${customersList.length} khách hàng thành công`);
                } else {
                    message.error('Không thể tải dữ liệu khách hàng');
                    setCustomers([]);
                }
            } catch (err) {
                console.error('Error fetching customers:', err);
                message.error('Lỗi khi tải dữ liệu khách hàng');
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setEditModalVisible(true);
    };

    // Handle modal success (refresh data)
    const handleEditSuccess = () => {
        // Refetch customers after successful update
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const data = await getAllCustomer();
                if (data.isSuccess) {
                    const customersList = Array.isArray(data.result)
                        ? data.result
                        : (data.result?.data || []);
                    setCustomers(customersList);
                } else {
                    message.error('Không thể tải dữ liệu khách hàng');
                    setCustomers([]);
                }
            } catch (err) {
                console.error('Error fetching customers:', err);
                message.error('Lỗi khi tải dữ liệu khách hàng');
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    };

    // Tính toán thống kê
    const stats = {
        total: Array.isArray(customers) ? customers.length : 0,
        newToday: Array.isArray(customers) ? customers.filter(c =>
            dayjs(c.createdAt).isAfter(dayjs().startOf('day'))
        ).length : 0,
        newThisWeek: Array.isArray(customers) ? customers.filter(c =>
            dayjs(c.createdAt).isAfter(dayjs().startOf('week'))
        ).length : 0,
    };

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
                    onClick={() => handleEditCustomer(record)}
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
        <DealerManagerLayout>
            <ConfigProvider locale={viVN}>
                <PageContainer
                    title="Quản Lý Khách Hàng"
                    subTitle="Hệ thống quản lý khách hàng xe máy điện"
                    className="bg-gradient-to-br from-blue-50 to-indigo-50"
                >
                    {/* Thống kê tổng quan */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={8}>
                            <StatisticCard
                                statistic={{
                                    title: 'Tổng Khách Hàng',
                                    value: stats.total,
                                    icon: (
                                        <TeamOutlined
                                            style={{
                                                fontSize: 40,
                                                color: '#1890ff'
                                            }}
                                        />
                                    ),
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <StatisticCard
                                statistic={{
                                    title: 'Khách Hàng Mới Hôm Nay',
                                    value: stats.newToday,
                                    icon: (
                                        <UserAddOutlined
                                            style={{
                                                fontSize: 40,
                                                color: '#52c41a'
                                            }}
                                        />
                                    ),
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <StatisticCard
                                statistic={{
                                    title: 'Khách Hàng Tuần Này',
                                    value: stats.newThisWeek,
                                    icon: (
                                        <SmileOutlined
                                            style={{
                                                fontSize: 40,
                                                color: '#faad14'
                                            }}
                                        />
                                    ),
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                    </Row>

                    {/* Bảng dữ liệu */}
                    <Card
                        className="shadow-md rounded-lg"
                        bordered={false}
                    >

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
                                    <span className="text-gray-600">
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
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                        <TeamOutlined className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-800">
                                            Danh Sách Khách Hàng
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Quản lý thông tin khách hàng xe máy điện
                                        </div>
                                    </div>
                                </div>
                            }
                            rowClassName={(_, index) => 
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }
                        />
                    </Card>

                    {/* Edit Customer Modal */}
                    <CustomerEditModal
                        visible={editModalVisible}
                        onCancel={() => {
                            setEditModalVisible(false);
                            setSelectedCustomer(null);
                        }}
                        onSuccess={handleEditSuccess}
                        customerData={selectedCustomer}
                    />
                </PageContainer>
            </ConfigProvider>
        </DealerManagerLayout>
    );
}

export default GetAllCustomer;
