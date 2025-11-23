import React, { useState, useEffect } from "react";
import {
  Space,
  Badge,
  Dropdown,
  Avatar,
  Button,
  Card,
  List,
  Typography,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import * as signalR from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getAllNotification } from "../../../App/DealerManager/Notification/GetAllNotification";
import {
  readNotification,
  readAllNotifications,
} from "../../../App/DealerManager/Notification/NotificationReaded";
function HeaderBar({ collapsed, isMobile }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt_token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userFullName = decodedToken?.FullName || "Dealer Manager";
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
      onClick: () => navigate("/dealer-manager/settings/dealer-profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/dealer-manager/settings/change-password"),
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
    position: "fixed",
    top: 0,
    right: 0,
    left: isMobile ? 0 : collapsed ? 64 : 280,
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "24px",
    paddingRight: "24px",
    backgroundColor: "white",
    borderBottom: "1px solid #d9d9d9",
    boxShadow:
      "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    transition: "left 0.2s ease",
    zIndex: 30,
  };
  // timeAgo helper
  const timeAgo = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diffM = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffM < 1) return "vừa xong";
    if (diffM < 60) return `${diffM} phút trước`;
    const h = Math.floor(diffM / 60);
    if (h < 24) return `${h} giờ trước`;
    const day = Math.floor(h / 24);
    return `${day} ngày trước`;
  };

  // NotificationBell (in-header, shared across pages)
  function NotificationBell() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const unread = items.filter((x) => !x.isRead).length;

    const fetchNotifications = async () => {
      try {
        const response = await getAllNotification(1, 50);
        if (response?.isSuccess) {
          setItems(response.result?.data || []);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    useEffect(() => {
      let isMounted = true;
      fetchNotifications();
      const base = import.meta.env.VITE_API_URL || "https://localhost:7269";
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${base}/notificationHub`, {
          accessTokenFactory: () => localStorage.getItem("jwt_token") || "",
        })
        .withAutomaticReconnect()
        .build();

      conn
        .start()
        .then(() => {
          if (!isMounted) return;
          conn.on("NotificationChanged", () => {
            fetchNotifications();
          });
          console.log("✅ SignalR connected");
        })
        .catch((err) => console.error("❌ SignalR start error:", err));

      return () => {
        isMounted = false;
        conn.stop().catch(() => {});
      };
    }, []);

    // Gọi API để đánh dấu thông báo đã đọc
    const sendReadUpdate = async (notificationId) => {
      try {
        await readNotification(notificationId);
        return Promise.resolve();
      } catch (err) {
        console.error(
          "Failed to send read update for notification",
          notificationId,
          err
        );
        throw err;
      }
    };

    // Đánh dấu tất cả thông báo đã đọc
    const markAll = async () => {
      try {
        // Gọi API đánh dấu tất cả đã đọc
        await readAllNotifications();
        // Cập nhật UI sau khi API thành công
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
        // Có thể hiển thị thông báo lỗi cho user nếu cần
      }
    };

    return (
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        dropdownRender={() => (
          <Card
            style={{ width: 360, maxHeight: 420, overflowY: "auto" }}
            title={
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Typography.Text strong>Thông báo</Typography.Text>
                {items.length > 0 && (
                  <Button type="link" size="small" onClick={markAll}>
                    Đã đọc hết
                  </Button>
                )}
              </Space>
            }
          >
            <List
              dataSource={items}
              locale={{ emptyText: "Không có thông báo" }}
              renderItem={(item, idx) => (
                // Clicking an item will mark it as read in the UI and attempt a backend update.
                <List.Item
                  key={item.createdAt || idx}
                  onClick={async () => {
                    // optimistic UI update: mark only the clicked item as read
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === item.id ? { ...p, isRead: true } : p
                      )
                    );
                    // try to notify backend (placeholder)
                    try {
                      await sendReadUpdate(item.id);
                    } catch (err) {
                      // swallow errors for now — UI already updated
                      console.error("sendReadUpdate failed", err);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    background: item.isRead ? "#fff" : "#e6f7ff",
                    borderRadius: 10,
                    marginBottom: 6,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      item.title?.toLowerCase().includes("cảnh báo") ? (
                        <WarningOutlined style={{ color: "#faad14" }} />
                      ) : (
                        <InfoCircleOutlined style={{ color: "#1677ff" }} />
                      )
                    }
                    title={
                      <Space>
                        <Typography.Text strong>{item.title}</Typography.Text>
                        {!item.isRead && <Badge color="blue" />}
                      </Space>
                    }
                    description={
                      <>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {item.message}
                        </Typography.Text>
                        <br />
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 11 }}
                        >
                          {timeAgo(item.createdAt)}
                        </Typography.Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      >
        <Badge count={unread} size="small" overflowCount={9}>
          <Button
            icon={<BellOutlined />}
            shape="circle"
            type="text"
            style={{ color: "#1677ff" }}
          />
        </Badge>
      </Dropdown>
    );
  }
  return (
    <div style={headerStyle}>
      {/* Left side - Dealer Name */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-gray-800">
          {" "}
          {userDealerName}
        </span>
      </div>

      {/* Right side - User Info */}
      <Space size="large" align="center">
        <NotificationBell />
        <span className="text-sm text-gray-600">Xin Chào, {userFullName}</span>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Avatar
            className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </div>
  );
}

export default HeaderBar;
