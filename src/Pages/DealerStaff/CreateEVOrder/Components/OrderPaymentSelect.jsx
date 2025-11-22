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
        <Text strong>Hình thức thanh toán</Text>
      </div>

      {/* Hình thức thanh toán */}
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
    </Space>
  );
}
