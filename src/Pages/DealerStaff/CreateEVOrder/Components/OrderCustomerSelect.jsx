import React, { useEffect, useState } from "react";
import { Card, Select, Space, Typography, Skeleton, message } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import api from "../../../../api/api";

const { Text } = Typography;

export default function OrderCustomerSelect({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/Customer/get-all-customers");
        let items = [];

        if (Array.isArray(res.data)) items = res.data;
        else if (res.data?.result?.items) items = res.data.result.items;
        else if (res.data?.result?.data) items = res.data.result.data;
        else if (res.data?.items) items = res.data.items;
        else items = res.data?.result ?? [];

        if (alive) setCustomers(items);
      } catch (err) {
        console.error("Fetch customers failed:", err);
        message.error("Không tải được danh sách khách hàng");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const options = customers.map((c) => {
    const name = c.fullName || c.name || "—";
    const phone = c.phoneNumber ? ` • ${c.phoneNumber}` : "";
    const email = c.email ? ` • ${c.email}` : "";
    return {
      label: `${name}${phone}${email}`,
      value: c.id || c.customerId,
      raw: c,
    };
  });

  const selected = customers.find(
    (c) => c.id === value || c.customerId === value
  );

  return (
    <Card size="small" bordered={false} style={{ padding: 0 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Text strong>
            <UserOutlined /> Khách hàng
          </Text>
          <Select
            value={value}
            onChange={(val) => {
                const selected = options.find(o => o.value === val)?.raw;
                onChange(val, selected);
            }}
            placeholder="Chọn khách hàng (tên / SĐT / email)"
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            options={options}
          />

          {selected && (
            <Card
              size="small"
              style={{
                background: "#f6ffed",
                borderColor: "#b7eb8f",
              }}
            >
              <Space direction="vertical" size={4}>
                <Text strong>
                  <UserOutlined /> {selected.fullName || selected.name}
                </Text>
                {selected.phoneNumber && (
                  <Text type="secondary">
                    <PhoneOutlined /> {selected.phoneNumber}
                  </Text>
                )}
                {selected.email && (
                  <Text type="secondary">
                    <MailOutlined /> {selected.email}
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
