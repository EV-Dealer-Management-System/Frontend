import React from "react";
import { Space, Badge, Dropdown, Avatar } from "antd";
import {
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function HeaderBar({ collapsed, isMobile }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");
    const decodedToken = token ? jwtDecode(token) : null;
    const userFullName = decodedToken?.name || "Dealer Staff";
    const userDealerName = decodedToken?.DealerName || "Đại lý không xác định";

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        localStorage.removeItem("userFullName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("refresh_token");
        navigate("/");
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Thông tin cá nhân",
            onClick: () => navigate("/dealer-staff/profile"),
        },
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: "Cài đặt",
            onClick: () => navigate("/dealer-staff/settings/change-password"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
            danger: true,
        },
    ];

    const headerStyle = {
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : collapsed ? 64 : 280,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'left 0.2s ease',
        zIndex: 30,
    };

    return (
        <div style={headerStyle}>
            {/* Left side - Dealer Name with Icon */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <ShopOutlined className="text-white text-base" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">Đại lý</span>
                        <span className="text-sm font-bold text-gray-800">{userDealerName}</span>
                    </div>
                </div>
            </div>

            {/* Right side - User Info */}
            <Space size="large" align="center">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">Xin chào,</span>
                        <span className="text-sm font-semibold text-gray-800">{userFullName}</span>
                    </div>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                        <Avatar
                            size={40}
                            className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-md"
                            style={{ backgroundColor: "#1890ff" }}
                            icon={<UserOutlined />}
                        />
                    </Dropdown>
                </div>
            </Space>
        </div>
    );
}

export default HeaderBar;
