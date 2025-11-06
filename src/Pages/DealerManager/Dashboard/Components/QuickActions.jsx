import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import {
    CarOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    FileTextOutlined,
    TruckOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function QuickActions() {
    const navigate = useNavigate();

    const actionsConfig = [
        {
            icon: <UserOutlined className="text-3xl text-blue-500 mb-2" />,
            title: "Quản lý khách hàng",
            description: "Xem danh sách khách hàng",
            path: "/dealer-manager/customers/get-all-customers",
            hoverColor: "hover:border-blue-400"
        },
        {
            icon: <ShoppingCartOutlined className="text-3xl text-green-500 mb-2" />,
            title: "Quản lý đặt xe",
            description: "Xem đơn đặt xe",
            path: "/dealer-manager/ev/all-ev-booking",
            hoverColor: "hover:border-green-400"
        },
        {
            icon: <FileTextOutlined className="text-3xl text-orange-500 mb-2" />,
            title: "Quản lý báo giá",
            description: "Tạo và theo dõi báo giá",
            path: "/dealer-manager/ev/all-ev-quotes",
            hoverColor: "hover:border-orange-400"
        },
        {
            icon: <CarOutlined className="text-3xl text-purple-500 mb-2" />,
            title: "Quản lý kho xe",
            description: "Xem tình trạng kho",
            path: "/dealer-manager/ev/inventory",
            hoverColor: "hover:border-purple-400"
        },
        {
            icon: <TruckOutlined className="text-3xl text-green-600 mb-2" />,
            title: "Quản lý giao hàng",
            description: "Theo dõi giao xe",
            path: "/dealer-manager/ev/ev-delivery",
            hoverColor: "hover:border-green-400"
        },
        {
            icon: <TeamOutlined className="text-3xl text-red-500 mb-2" />,
            title: "Quản lý nhân viên",
            description: "Quản lý đội ngũ",
            path: "/dealer-manager/staff/staff-list",
            hoverColor: "hover:border-red-400"
        }
    ];

    return (
        <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24}>
                <Title level={4} className="mb-4">
                    Thao tác nhanh
                </Title>
            </Col>

            {actionsConfig.map((action, index) => (
                <Col xs={24} sm={8} md={6} key={index}>
                    <Card
                        className={`text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 ${action.hoverColor}`}
                        onClick={() => navigate(action.path)}
                    >
                        {action.icon}
                        <Title level={5} className="mb-1">
                            {action.title}
                        </Title>
                        <Text type="secondary">{action.description}</Text>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default QuickActions;