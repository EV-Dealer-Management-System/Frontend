import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Statistic, Tag } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
    DollarOutlined,
    FileTextOutlined,
    CarOutlined,
    TeamOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';

function DealerStaffStats({ dashboardData, loading }) {
    const navigate = useNavigate();

    // Các function điều hướng
    const handleQuotesClick = () => {
        navigate('/dealer-staff/quotes');
    };

    const handleInventoryClick = () => {
        navigate('/dealer-staff/inventory');
    };

    const handleCustomersClick = () => {
        navigate('/dealer-staff/customers');
    };

    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
                <ProCard 
                    className="hover:shadow-lg transition-shadow cursor-pointer" 
                    loading={loading}
                    onClick={handleQuotesClick}
                >
                    <Statistic
                        title={<span className="text-gray-600">Tổng Báo Giá</span>}
                        value={dashboardData?.totalQuotes || 0}
                        valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                        prefix={<FileTextOutlined />}
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <Tag color="processing">
                            Báo giá đã tạo
                        </Tag>
                    </div>
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <ProCard 
                    className="hover:shadow-lg transition-shadow cursor-pointer" 
                    loading={loading}
                    onClick={handleInventoryClick}
                >
                    <Statistic
                        title={<span className="text-gray-600">Xe Trong Kho</span>}
                        value={dashboardData?.totalVehicles || 0}
                        valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                        prefix={<CarOutlined />}
                        suffix="xe"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <Tag color="success">
                            Sẵn sàng bán
                        </Tag>
                    </div>
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <ProCard 
                    className="hover:shadow-lg transition-shadow cursor-pointer" 
                    loading={loading}
                    onClick={handleCustomersClick}
                >
                    <Statistic
                        title={<span className="text-gray-600">Tổng Khách Hàng</span>}
                        value={dashboardData?.totalCustomers || 0}
                        valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
                        prefix={<TeamOutlined />}
                        suffix="khách"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <Tag color="warning">
                            Đã quản lý
                        </Tag>
                    </div>
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <ProCard className="hover:shadow-lg transition-shadow" loading={loading}>
                    <div className="text-center">
                        <div className="text-gray-600 mb-2">Đại Lý</div>
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                            {dashboardData?.dealerName || 'Chưa có tên'}
                        </div>
                        <Tag color="purple">Hoạt động</Tag>
                    </div>
                </ProCard>
            </Col>
        </Row>
    );
}

export default DealerStaffStats;