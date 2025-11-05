import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Space, Typography, Skeleton, message } from "antd";
import { FileTextOutlined, CarOutlined } from "@ant-design/icons";
import api from "../../../../api/api";

const { Text } = Typography;

const formatVnd = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

export default function OrderQuoteSelect({ value, onChange, customerId }) {
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/Quote/get-all-quote?status=1");
        const items = Array.isArray(res?.data)
          ? res.data
          : res?.data?.result || res?.data?.items || [];

        if (alive) setQuotes(items || []);
      } catch (e) {
        console.error("Fetch quotes failed:", e);
        message.error("Không tải được danh sách báo giá");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [customerId]);

  const options = useMemo(() => {
    return (quotes || []).map((q) => {
      const d = q?.quoteDetails?.[0];
      const model = d?.version?.modelName || "—";
      const version = d?.version?.versionName || "—";
      const color = d?.color?.colorName ? ` (${d.color.colorName})` : "";
      const price = formatVnd(q?.totalAmount);
      const promo = d?.promotion?.promotionName
        ? ` • KM: ${d.promotion.promotionName}`
        : "";

      // để Select không bị lòi chữ, dùng whiteSpace + maxWidth ở tag hiển thị
      const label = `${model} - ${version}${color} • ${price}${promo}`;

      return {
        label,
        value: q.id,
        raw: q,
      };
    });
  }, [quotes]);

  const selected = options.find((o) => o.value === value)?.raw;
  const d = selected?.quoteDetails?.[0];

  return (
    <Card size="small" bordered={false} style={{ padding: 0 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Text strong>
            <FileTextOutlined /> Báo giá
          </Text>
          <Select
            allowClear
            showSearch
            value={value}
            onChange={onChange}
            placeholder="Chọn báo giá đã được duyệt"
            style={{ width: "100%" }}
            optionFilterProp="label"
            listHeight={360}
            options={options}
          />

          {selected && (
            <Card size="small" style={{ background: "#edf5ff" }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary">Thông tin báo giá đã chọn</Text>
                <Text strong style={{ lineHeight: 1.35 }}>
                  <CarOutlined /> {d?.version?.modelName} -{" "}
                  {d?.version?.versionName}
                  {d?.color?.colorName ? ` (${d.color.colorName})` : ""}
                </Text>
                <Text>{formatVnd(selected.totalAmount)}</Text>
                {d?.promotion?.promotionName && (
                  <Text type="secondary">
                    Khuyến mãi: {d.promotion.promotionName}
                  </Text>
                )}
              </Space>
            </Card>
          )}
        </Space>
      )}
    </Card>
  );
}
