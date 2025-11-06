import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Space, Avatar, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function RecentActivity({ dashboardData, loading }) {
    const navigate = useNavigate();

    // Các function điều hướng
    const handleViewAllActivities = () => {
        navigate('/dealer-staff/activities');
    };

    // Mock data cho hoạt động gần đây dựa trên thông tin từ API
    const recentActivities = useMemo(() => {
        if (!dashboardData) return [];

        return [
            {
                key: '1',
                type: 'quote',
                title: 'Tạo báo giá mới',
                description: 'Báo giá cho khách hàng Nguyễn Văn A',
                time: '2 giờ trước',
                status: 'completed'
            },
            {
                key: '2',
                type: 'customer',
                title: 'Thêm khách hàng mới',
                description: 'Khách hàng Trần Thị B quan tâm VinFast VF8',
                time: '4 giờ trước',
                status: 'processing'
            },
            {
                key: '3',
                type: 'quote',
                title: 'Cập nhật báo giá',
                description: 'Điều chỉnh giá cho báo giá #BG001',
                time: '1 ngày trước',
                status: 'completed'
            },
            {
                key: '4',
                type: 'vehicle',
                title: 'Kiểm tra kho xe',
                description: 'Cập nhật trạng thái xe trong kho',
                time: '2 ngày trước',
                status: 'completed'
            }
        ].slice(0, Math.min(4, dashboardData.totalQuotes || 4));
    }, [dashboardData]);

    const columns = [
        {
            title: 'Hoạt động',
            key: 'activity',
            render: (_, record) => (
                <Space>
                    <Avatar
                        icon={
                            record.type === 'quote' ? <FileTextOutlined /> :
                                record.type === 'customer' ? <UserOutlined /> :
                                    <CheckCircleOutlined />
                        }
                        style={{
                            backgroundColor:
                                record.type === 'quote' ? '#1890ff' :
                                    record.type === 'customer' ? '#52c41a' : '#faad14'
                        }}
                        size="small"
                    />
                    <div>
                        <Text strong>{record.title}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                            {record.description}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
            width: 120,
            render: (time) => (
                <Text type="secondary" className="text-xs">
                    {time}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag
                    icon={status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={status === 'completed' ? 'success' : 'processing'}
                >
                    {status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </Tag>
            ),
        }
    ];

    return (
        <ProCard
            title="Hoạt Động Gần Đây"
            extra={
                <Button type="link" onClick={handleViewAllActivities}>
                    Xem tất cả
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={recentActivities}
                loading={loading}
                pagination={false}
                size="small"
                showHeader={false}
            />
        </ProCard>
    );
}

export default RecentActivity;