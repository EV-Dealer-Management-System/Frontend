import React from 'react';
import { Button, Tag } from 'antd';
import { EyeOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

// Render trạng thái hợp đồng
export const renderStatus = (status) => {
  const statusConfig = {
    1: { color: 'blue', text: 'Nháp' },
    2: { color: 'processing', text: 'Sẵn sàng' },
    3: { color: 'gold', text: 'Đang thực hiện' },
    4: { color: 'success', text: 'Hoàn tất' },
    5: { color: 'purple', text: 'Đang chỉnh sửa' },
    6: { color: 'green', text: 'Đã chấp nhận' },
    [-1]: { color: 'error', text: 'Từ chối' },
    [-2]: { color: 'default', text: 'Đã xóa' },
    [-3]: { color: 'volcano', text: 'Đã hủy' },
  };

  const config = statusConfig[status] || { color: 'default', text: 'Không xác định' };
  return <Tag color={config.color}>{config.text}</Tag>;
};

// Safe render status component
export const SafeStatus = ({ value }) => {
  if (!value) return <span>-</span>;
  try {
    return renderStatus(value);
  } catch {
    return <span>-</span>;
  }
};

// Tạo columns cho table
export const createBookingColumns = (handleViewContract) => [
  {
    title: 'STT',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    align: 'center',
    render: (_, __, index) => index + 1,
  },
  {
    title: 'Tên hợp đồng',
    dataIndex: 'name',
    key: 'name',
    width: 300,
    ellipsis: true,
  },
  {
    title: 'Chủ sở hữu',
    dataIndex: 'ownerName',
    key: 'ownerName',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    defaultSortOrder: 'descend',
    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    align: 'center',
    render: (_, record) => <SafeStatus value={record.status} />,
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
    align: 'center',
    render: (_, record) => (
      <Button
        type="primary"
        icon={<EyeOutlined />}
        size="small"
        onClick={() => handleViewContract(record)}
      >
        Xem
      </Button>
    ),
  },
];

// Helper function to get SmartCA choices
export const getSmartCAChoices = (info) => {
  if (!info) return { hasDefault: false, hasChoices: false, total: 0 };
  
  const defaultExists = !!info.defaultSmartCa;
  const choices = info.userCertificates?.length || 0;
  const hasChoices = defaultExists || choices > 0;
  
  return { hasDefault: defaultExists, hasChoices, total: choices };
};

export default {
  renderStatus,
  SafeStatus,
  createBookingColumns,
  getSmartCAChoices
};
