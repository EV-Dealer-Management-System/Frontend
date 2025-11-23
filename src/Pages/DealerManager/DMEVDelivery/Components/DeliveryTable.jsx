import React from "react";
import { Table, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import DeliveryStatusTag from "./DeliveryStatusTag";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

// Component bảng danh sách giao xe
function DeliveryTable({
  data,
  loading,
  pagination,
  onTableChange,
  onViewDetail,
}) {
  const columns = [
    {
      title: "Mã Booking",
      dataIndex: "bookingEVId",
      key: "bookingEVId",
      width: "25%",
      ellipsis: true,
      render: (text) => (
        <span className="font-mono text-xs text-gray-700">{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => <DeliveryStatusTag status={status} />,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "20%",
      ellipsis: true,
      render: (text) => <span className="text-sm text-gray-600">{text}</span>,
    },
    {
      title: "SL xe",
      key: "vehicleCount",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <span className="font-semibold text-blue-600 text-sm">
          {record.vehicleDeliveryDetails?.length || 0}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: "12%",
      render: (date) => (
        <div className="text-xs">
          <div className="font-medium">
            {new Date(date).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-gray-400">
            {new Date(date).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
      defaultSortOrder: "descend",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "12%",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onViewDetail(record)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} đơn giao xe`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={onTableChange}
        className="delivery-table"
      />
    </ConfigProvider>
  );
}

export default DeliveryTable;
