import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Progress, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
    PlusOutlined,
    FileTextOutlined,
    UserAddOutlined,
    CarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function QuickActions({ dashboardData, loading }) {
    const navigate = useNavigate();

    // Tính phần trăm hoàn thành mục tiêu dựa trên data thực
    const targetProgress = dashboardData?.totalQuotes
        ? Math.min((dashboardData.totalQuotes / 100) * 100, 100)
        : 0;

    // Các function điều hướng
    const handleCreateQuote = () => {
        navigate('/dealer-staff/quotes/create-quote');
    };

    const handleAddCustomer = () => {
        navigate('/dealer-staff/customers/create-ev-customer');
    };

    const handleManageInventory = () => {
        navigate('/dealer-staff/ev/inventory');
    };

    return (
        <ProCard title="Tác Vụ Nhanh" className="h-full" loading={loading}>
            <Space direction="vertical" className="w-full" size="middle">
                <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    size="large"
                    block
                    onClick={handleCreateQuote}
                    className="h-12 flex items-center justify-center gap-2"
                >
                    Tạo Báo Giá Mới
                </Button>

                <Button
                    icon={<UserAddOutlined />}
                    size="large"
                    block
                    onClick={handleAddCustomer}
                    className="h-12 flex items-center justify-center gap-2"
                >
                    Thêm Khách Hàng
                </Button>

                <Button
                    icon={<CarOutlined />}
                    size="large"
                    block
                    onClick={handleManageInventory}
                    className="h-12 flex items-center justify-center gap-2"
                >
                    Quản Lý Kho Xe
                </Button>


                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <Text strong className="text-blue-600">Thống Kê Hoạt Động</Text>
                    <div className="mt-2">
                        <Progress
                            percent={targetProgress}
                            strokeColor="#1890ff"
                            status="active"
                        />
                        <Text type="secondary" className="text-xs mt-1 block">
                            {dashboardData?.totalQuotes || 0} báo giá đã tạo
                        </Text>
                        <Text type="secondary" className="text-xs block">
                            {dashboardData?.totalCustomers || 0} khách hàng được quản lý
                        </Text>
                    </div>
                </div>
            </Space>
        </ProCard>
    );
}

export default QuickActions;