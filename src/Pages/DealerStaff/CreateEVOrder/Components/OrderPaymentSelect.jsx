import React, { useEffect, useState, useMemo } from "react";
import { Card, Space, Typography, Row, Col, Tag, Alert, message } from "antd";
import {
  DollarOutlined,
  BankOutlined,
  WalletOutlined,
} from "@ant-design/icons";
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
    : "—";

export default function OrderPaymentSelect({
  quoteTotal = 0,
  paymentMethod,
  onChangeMethod,
  isPayFull,
  onChangeType,
}) {
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [rawPercent, setRawPercent] = useState(null); // 3
  const [depositRatio, setDepositRatio] = useState(null); // 0.03

  // lấy % cọc từ api
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingSetting(true);
        const s = await fetchDepositSetting();
        if (!alive) return;
        const raw =
          s?.maxDepositPercentage !== null && s?.maxDepositPercentage !== undefined
            ? s.maxDepositPercentage
            : s?.minDepositPercentage ?? null;
        setRawPercent(typeof raw === "number" ? raw : null);
        setDepositRatio(toRatio(raw));
      } catch (e) {
        message.error("Không tải được thiết lập tiền cọc");
      } finally {
        alive && setLoadingSetting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // tính tiền cọc
  const depositAmount = useMemo(() => {
    if (typeof quoteTotal !== "number") return null;
    if (depositRatio == null) return null;
    return Math.round(quoteTotal * depositRatio);
  }, [quoteTotal, depositRatio]);

  const remainingAmount =
    isPayFull || depositAmount == null ? null : quoteTotal - depositAmount;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <DollarOutlined style={{ color: "#faad14" }} />
        <Text strong>Phương thức thanh toán</Text>
      </div>

      {/* 1. Chọn kênh thanh toán */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => onChangeMethod?.("vnpay")}
            style={{
              border:
                paymentMethod === "vnpay"
                  ? "1.5px solid #1677ff"
                  : "1px solid var(--ant-color-border)",
              boxShadow:
                paymentMethod === "vnpay"
                  ? "0 6px 18px rgba(22,119,255,.12)"
                  : "none",
              borderRadius: 14,
              height: "100%",
            }}
          >
            <Space direction="vertical" size={2}>
              <Space size={6}>
                <BankOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                <Text strong>VNPay</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thanh toán online
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => onChangeMethod?.("cash")}
            style={{
              border:
                paymentMethod === "cash"
                  ? "1.5px solid #52c41a"
                  : "1px solid var(--ant-color-border)",
              boxShadow:
                paymentMethod === "cash"
                  ? "0 6px 18px rgba(82,196,26,.12)"
                  : "none",
              borderRadius: 14,
              height: "100%",
            }}
          >
            <Space direction="vertical" size={2}>
              <Space size={6}>
                <WalletOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                <Text strong>Tiền mặt</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thanh toán tại đại lý
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 2. HÌNH THỨC – làm nổi hơn */}
      {paymentMethod && (
        <Card
          bodyStyle={{ padding: 14 }}
          style={{
            borderRadius: 14,
            background: "#f0f5ff",
            border: "1px solid #d6e4ff",
          }}
        >
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Text strong style={{ fontSize: 14 }}>
              Hình thức
            </Text>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {/* Toàn phần */}
              <div
                onClick={() => onChangeType?.(true)}
                style={{
                  flex: "0 0 180px",
                  cursor: "pointer",
                  background: isPayFull ? "#ffffff" : "#e6efff",
                  border: isPayFull ? "1.5px solid #1677ff" : "1px solid transparent",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: "all .15s",
                }}
              >
                <Text strong>Thanh toán toàn phần</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Khách trả đủ 100%
                </Text>
              </div>

              {/* Cọc */}
              <div
                onClick={() => depositRatio != null && onChangeType?.(false)}
                style={{
                  flex: "0 0 150px",
                  cursor: depositRatio == null ? "not-allowed" : "pointer",
                  background:
                    !isPayFull ? "#ffffff" : "#e6efff",
                  opacity: depositRatio == null ? 0.6 : 1,
                  border:
                    !isPayFull ? "1.5px solid #faad14" : "1px solid transparent",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: "all .15s",
                }}
              >
                <Text strong>
                  {loadingSetting
                    ? "Đang tải..."
                    : depositRatio == null
                    ? "Cọc"
                    : `Cọc ${rawPercent}%`}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Giữ đơn, thanh toán sau
                </Text>
              </div>
            </div>

            {/* cảnh báo nếu chưa cấu hình % */}
            {!isPayFull && depositRatio == null && (
              <Alert
                type="warning"
                showIcon
                message="Đại lý chưa cấu hình % cọc."
              />
            )}
          </Space>
        </Card>
      )}
    </Space>
  );
}
