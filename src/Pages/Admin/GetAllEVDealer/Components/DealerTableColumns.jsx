import React from "react";
import { Tag } from "antd";
import DealerStatusSwitch from "./DealerStatusSwitch";
import DealerActionButtons from "./DealerActionButtons";

// Hook tạo cột cho bảng đại lý
function useDealerTableColumns({
  pagination,
  updatingStatus,
  setUpdatingStatus,
  loadDealerData,
  modal,
  onViewRevenue,
  onViewDebtDetail,
  onViewPolicy
}) {
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record, index) => (
        <span className="font-medium text-gray-600">
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Tên Đại Lý",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Tên Quản Lý",
      dataIndex: "managerName",
      key: "managerName",
      sorter: true,
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Email Quản Lý",
      dataIndex: "managerEmail",
      key: "managerEmail",
      sorter: true,
      render: (email) => <span className="text-blue-500">{email}</span>,
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => <span className="text-gray-600">{address}</span>,
    },
    {
      title: "Mã Số Thuế",
      dataIndex: "taxNo",
      key: "taxNo",
      width: 120,
      align: "center",
      render: (taxNo) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {taxNo}
        </span>
      ),
    },
    {
      title: "Cấp Độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: "center",
      render: (level) => {
        const levelConfig = {
          1: { color: "gold", text: "Cấp 1" },
          2: { color: "blue", text: "Cấp 2" },
          3: { color: "green", text: "Cấp 3" },
        };
        const config = levelConfig[level] || {
          color: "default",
          text: `Cấp ${level}`,
        };

        return (
          <Tag color={config.color} className="font-medium">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "dealerStatus",
      key: "dealerStatus",
      width: 180,
      align: "center",
      render: (status, record) => (
        <DealerStatusSwitch
          record={record}
          updatingStatus={updatingStatus}
          setUpdatingStatus={setUpdatingStatus}
          loadDealerData={loadDealerData}
          modal={modal}
        />
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <DealerActionButtons
          record={record}
          onViewRevenue={onViewRevenue}
          onViewDebtDetail={onViewDebtDetail}
          onViewPolicy={onViewPolicy}
        />
      ),
    },
  ];

  return columns;
}

export default useDealerTableColumns;