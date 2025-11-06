import React, { useState, useEffect } from 'react';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { Card, message, Row, Col } from 'antd';
import {
    TeamOutlined,
    UserAddOutlined,
    SmileOutlined
} from '@ant-design/icons';
import { getAllCustomer } from '../../../App/DealerManager/CustomerManagement/GetAllCustomer';
import CustomerEditModal from './Components/CustomerEditModal';
import CustomerTable from './Components/CustomerTable';
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
                        style={{ padding: '24px' }}
                    >
                        <CustomerTable
                            customers={customers}
                            loading={loading}
                            onEditCustomer={handleEditCustomer}
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
