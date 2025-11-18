import React from "react";
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { FileTextOutlined, MailOutlined } from "@ant-design/icons";

// Component hiển thị thông tin đơn hàng
function OrderInfoCard({ customerOrderId, email }) {
  return (
    <ProCard
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-blue-600" />
          <span>Thông tin đơn hàng</span>
        </div>
      }
      bordered
      headerBordered
      className="shadow-lg"
    >
      <ProDescriptions
        column={1}
        size="small"
        layout="vertical"
      >
        <ProDescriptions.Item
          label="Mã đơn hàng"
          valueType="text"
          contentStyle={{ fontFamily: "monospace", fontSize: "12px" }}
        >
          {customerOrderId || "N/A"}
        </ProDescriptions.Item>
        <ProDescriptions.Item
          label={
            <div className="flex items-center gap-2">
              <MailOutlined />
              <span>Email liên hệ</span>
            </div>
          }
          valueType="text"
          copyable
        >
          {email || "N/A"}
        </ProDescriptions.Item>
      </ProDescriptions>
    </ProCard>
  );
}

export default OrderInfoCard;
