import React, { useEffect, useState } from "react";
import { Typography, Avatar, Space, Alert, App, Button, Divider } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  LoginForm,
  ProFormText,
  ProFormCheckbox,
  ProCard,
} from "@ant-design/pro-components";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../../../utils/auth";
import { getLoginErrorMessage } from "./loginErrorHandler";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const API_BASE = import.meta.env.VITE_API_URL;

  // 👉 Set nền thiên nhiên cho body & html
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;

    document.documentElement.style.backgroundColor = "#e8f5e9";
    document.body.style.backgroundColor = "#e8f5e9";

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  const testAccounts = [
    {
      note: "Bạn có thể dùng https://yopmail.com/en rồi điền email dưới để có thể xem những email được gửi về. Nếu bạn muốn test những luồng cần chữ ký SmartCA hoặc cần hỗ trợ vui lòng zalo: 0326336224 (Hiệu) để được hỗ trợ.",
    },
    {
      role: "Admin",
      email: "Email: adminevsystem@yopmail.com",
      password: "Mật Khẩu: 123456Admin@",
    },
    {
      role: "EVMStaff",
      email: "Email: preullulluppeiza-5629@yopmail.com",
      password: "Mật Khẩu: EVMStaff@E34F44",
    },
    {
      role: "DealerManager",
      email: "Email: dealerevsystem@yopmail.com",
      password: "Mật Khẩu: 123456@Admin",
      note: "Đây là tài khoản đã dùng lâu có rất nhiều dữ liệu, tuy nhiên vì tài khoản này dùng để test chính (thay đổi dữ liệu database) nên có nhiều dữ liệu sai dẫn đến có thể có một vài chức năng không hoạt động",
    },
    {
      role: "DealerStaff",
      email: "Email: gresacreinoffu-9429@yopmail.com",
      password: "Mật Khẩu: 123456Admin@",
      note: "Tài khoản nhân viên của đại lý có nhiều dữ liệu có thể một vài chức năng không hoạt động",
    },
    {
      role: "DealerManager",
      email: "Email: vigeilaleippo-5096@yopmail.com",
      password: "Mật Khẩu: Dealer@f33dc9",
      note: "Tài khoản mới ít dữ liệu",
    },
    {
      role: "DealerStaff",
      email: "Email: pupoureuwuhe-2339@yopmail.com",
      password: "Mật Khẩu: Staff@88A0AF",
      note: "Tài khoản nhân viên của đại lý ít dữ liệu",
    },
  ];

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const from = sp.get("fromOAuth");
    const err = sp.get("oauthError");
    if (from && err) {
      setLoginError(err);
      const url = new URL(window.location.href);
      url.searchParams.delete("oauthError");
      url.searchParams.delete("fromOAuth");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [location.search]);

  const handleLogin = async (values) => {
    const { email, password, autoLogin } = values || {};
    if (!email || !password) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const cleanedEmail = String(email).trim();
    const cleanedPassword = String(password).trim();
    try {
      setLoading(true);
      const res = await login(cleanedEmail, cleanedPassword, autoLogin);

      const tokenStr = res?.result?.accessToken;
      const refresh = res?.result?.refreshToken;
      if (!tokenStr) throw new Error("Token không hợp lệ.");

      localStorage.setItem("jwt_token", tokenStr);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      localStorage.setItem(
        "userFullName",
        res?.result?.userData?.fullName || ""
      );

      const decoded = jwtDecode(tokenStr);
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        decoded.role ||
        (Array.isArray(decoded.roles) ? decoded.roles[0] : undefined);

      message.success(`Chào mừng ${res?.result?.userData?.fullName || ""}!`);

      switch (role) {
        case "Admin":
          navigate("/admin", { replace: true });
          break;
        case "DealerManager":
          navigate("/dealer-manager", { replace: true });
          break;
        case "DealerStaff":
          navigate("/dealer-staff", { replace: true });
          break;
        case "EVMStaff":
          navigate("/evm-staff", { replace: true });
          break;
        default:
          navigate("/customer", { replace: true });
      }
    } catch (err) {
      const vi = getLoginErrorMessage(err);
      setLoginError(vi);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const returnUrl = `${window.location.origin}/login-success`;
    window.location.href = `${API_BASE}/Auth/signin-google?returnUrl=${encodeURIComponent(
      returnUrl
    )}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        <ProCard bordered style={{ width: "100%" }} bodyStyle={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar
              size={80}
              style={{
                background: "linear-gradient(90deg,#1677ff,#722ed1)",
                marginBottom: 14,
              }}
              icon={<UserOutlined style={{ fontSize: 34, color: "#fff" }} />}
            />
            <Title level={3} style={{ margin: 0 }}>
              EV Dealer Management System
            </Title>
            <Text type="secondary">Đăng nhập để tiếp tục sử dụng hệ thống</Text>
          </div>

          <LoginForm
            onFinish={handleLogin}
            submitter={{
              searchConfig: { submitText: "Đăng nhập" },
              submitButtonProps: { size: "large", loading },
            }}
            initialValues={{ autoLogin: true }}
            message={
              loginError ? (
                <Alert message={loginError} type="error" showIcon />
              ) : null
            }
          >
            <ProFormText
              name="email"
              fieldProps={{ size: "large", prefix: <UserOutlined /> }}
              placeholder="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{ size: "large", prefix: <LockOutlined /> }}
              placeholder="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: -8,
                marginBottom: 8,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                Ghi nhớ đăng nhập
              </ProFormCheckbox>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </LoginForm>

          <Divider plain>Hoặc</Divider>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
            >
              Đăng nhập với Google
            </Button>
          </Space>

          <Divider />

          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Hệ thống chỉ dành cho nội bộ.
            </Text>
          </div>

          <div style={{ textAlign: "center" }}>
            <Button
              type="text"
              onClick={() => setShowTestAccounts((prev) => !prev)}
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#1677ff",
                padding: "8px 0",
              }}
            >
              {showTestAccounts
                ? "Ẩn danh sách tài khoản test"
                : "Xem danh sách tài khoản test"}
            </Button>

            {showTestAccounts && (
              <div
                style={{
                  marginTop: 8,
                  textAlign: "left",
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: "#fafafa",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Text strong style={{ fontSize: 13 }}>
                  Tài khoản dùng thử:
                </Text>
                <div style={{ marginTop: 8 }}>
                  {testAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #eaeaea",
                      }}
                    >
                      <Text strong style={{ fontSize: 14 }}>
                        {acc.role}
                      </Text>

                      <br />

                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {acc.email}
                      </Text>

                      <br />

                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {acc.password}
                      </Text>

                      {acc.note && (
                        <div
                          style={{
                            marginTop: 6,
                            padding: "6px 10px",
                            background: "#f6f9ff",
                            border: "1px solid #d6e4ff",
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#1d39c4" }}>
                            📝 {acc.note}
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ProCard>
      </div>
    </div>
  );
}
