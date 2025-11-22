import React, { useEffect, useState } from "react";
import {
  Card,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import api from "../../../../api/api";
import {
  fetchDepositSetting,
  toRatio,
} from "../../../../App/DealerStaff/EVOrders/GetDepositSetting";

const { Text, Title } = Typography;

const formatVnd = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

export default function OrderConfirmation({
  customerId,
  quoteId,
  isPayFull,
}) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [quote, setQuote] = useState(null);
  const [depositRatio, setDepositRatio] = useState(null);
  const [rawPercent, setRawPercent] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!customerId || !quoteId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [cRes, qRes, deposit] = await Promise.all([
          api.get(`/Customer/get-customers-by-id/${customerId}`),
          api.get(`/Quote/get-quote-by-id/${quoteId}`),
          fetchDepositSetting(),
        ]);
        if (!alive) return;

        setCustomer(cRes?.data?.result ?? null);
        setQuote(qRes?.data?.result ?? null);

        const raw =
          deposit?.maxDepositPercentage ?? deposit?.minDepositPercentage ?? null;
        setRawPercent(typeof raw === "number" ? raw : null);
        setDepositRatio(toRatio(raw));
      } catch (e) {
        // bỏ message ở đây cho đỡ spam UI
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [customerId, quoteId]);

  if (loading) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  if (!customer || !quote) {
    // không máy móc
    return (
      <Card>
        <Text type="secondary">
          Chọn khách hàng, báo giá và thanh toán để xem lại thông tin.
        </Text>
      </Card>
    );
  }

  const detail = quote?.quoteDetails?.[0];
  const totalAmount = quote?.totalAmount ?? 0;
  const payNow =
    isPayFull === true
      ? totalAmount
      : depositRatio != null
      ? Math.round(totalAmount * depositRatio)
      : null;

  return (
    <Card
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Xác nhận thông tin đơn hàng</Text>
        </Space>
      }
      style={{ borderRadius: 16 }}
    >
      <Row gutter={[16, 16]}>
        {/* KH */}
        <Col xs={24} md={8}>
          <Card
            size="small"
            style={{ background: "#f6ffed", borderRadius: 12 }}
            title={
              <Space>
                <UserOutlined style={{ color: "#52c41a" }} />
                <Text strong>Khách hàng</Text>
              </Space>
            }
          >
            <Space direction="vertical" size={4}>
              <Text strong>{customer?.fullName}</Text>
              <Text type="secondary">
                <PhoneOutlined /> {customer?.phoneNumber || "Không có"}
              </Text>
              <Text type="secondary">
                <MailOutlined /> {customer?.email || "Không có"}
              </Text>
              <Text type="secondary">
                <EnvironmentOutlined /> {customer?.address || "Không có"}
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Báo giá */}
        <Col xs={24} md={9}>
          <Card
            size="small"
            style={{ background: "#e6f7ff", borderRadius: 12 }}
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1677ff" }} />
                <Text strong>Báo giá</Text>
              </Space>
            }
          >
            <Space direction="vertical" size={4}>
              <Text>
                <CarOutlined /> {detail?.version?.modelName}
              </Text>
              <Text>Phiên bản: {detail?.version?.versionName}</Text>
              <Text>Màu sắc: {detail?.color?.colorName}</Text>
              <Text>Số lượng: {detail?.quantity}</Text>
              <Divider style={{ margin: "8px 0" }} />
              <Space align="center" wrap>
                <Text strong>Tổng cộng:</Text>
                <Title level={4} style={{ margin: 0 }}>
                  {formatVnd(totalAmount)}
                </Title>
                {detail?.promotion?.promotionName && (
                  <Tag color="blue">{detail.promotion.promotionName}</Tag>
                )}
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Thanh toán */}
        <Col xs={24} md={7}>
          <Card
            size="small"
            style={{ background: "#fffbe6", borderRadius: 12 }}
            title={
              <Space>
                <DollarOutlined style={{ color: "#faad14" }} />
                <Text strong>Thanh toán</Text>
              </Space>
            }
          >
            <Space direction="vertical" size={4}>
              <Space>
                <Text>Hình thức:</Text>
                <Tag color={isPayFull ? "green" : "orange"}>
                  {isPayFull
                    ? "Toàn phần"
                    : depositRatio != null
                    ? `Cọc ${rawPercent}%`
                    : "Cọc —"}
                </Tag>
              </Space>

              <Divider style={{ margin: "8px 0" }} />

              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sẽ thanh toán ngay
                </Text>
                <Title level={4} style={{ margin: 0 }}>
                  {payNow != null ? formatVnd(payNow) : "—"}
                </Title>
                {!isPayFull && depositRatio == null && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chưa có % cọc từ đại lý — vui lòng cấu hình.
                  </Text>
                )}
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tag color="green" style={{ fontSize: 14, padding: "6px 12px" }}>
          Tổng giá trị đơn hàng: <Text strong>{formatVnd(totalAmount)}</Text>
        </Tag>
      </div>
    </Card>
  );
}
