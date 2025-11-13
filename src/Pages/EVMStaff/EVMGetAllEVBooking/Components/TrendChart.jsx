import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Tag } from "antd";
import { Column } from "@ant-design/charts";

function TrendChart({ data }) {
  // Đảm bảo data là array hợp lệ và tất cả items có count là số
  const safeData = Array.isArray(data) ? data.filter(item => 
    item && 
    item.date &&
    typeof item.count === 'number' && 
    !isNaN(item.count)
  ).map(item => ({
    ...item,
    count: item.count >= 0 ? item.count : 0
  })) : [];

  return (
    <ProCard
      title="Xu Hướng 7 Ngày Gần Nhất"
      bordered
      headerBordered
      extra={<Tag color="green">Booking mới</Tag>}
    >
      {safeData.length > 0 ? (
        <Column
          data={safeData}
          xField="date"
          yField="count"
        color="#1890ff"
        columnStyle={{
          radius: [8, 8, 0, 0],
        }}
        label={{
          position: "top",
          style: {
            fill: "#000",
            opacity: 0.6,
          },
        }}
        height={280}
      />
      ) : (
        <div style={{
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}>
          Chưa có dữ liệu
        </div>
      )}
    </ProCard>
  );
}

export default TrendChart;
