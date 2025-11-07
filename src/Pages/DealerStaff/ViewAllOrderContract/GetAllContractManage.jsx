import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Button, message, Tag, Space, Modal, Typography, Tooltip, App } from 'antd';
import { EyeOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllEcontractList } from '../../../App/DealerManager/GetAllContract/GetAllEcontract';
import { confirmEcontract } from '../../../App/DealerManager/GetAllContract/ConfirmEcontract';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';

const { Title } = Typography;

function GetAllContractManager() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { message, modal } = App.useApp();

  // Hàm lấy danh sách hợp đồng
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await getAllEcontractList(1, 1000, 3);
      if (response.success) {
        setContracts(response.data);
        message.success(response.message);
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error('Có lỗi khi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm duyệt hợp đồng
  const handleConfirmContract = async (contractId, contractName) => {
    modal.confirm({
      title: 'Xác nhận duyệt hợp đồng',
      content: `Bạn có chắc chắn muốn duyệt hợp đồng "${contractName}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        setConfirmLoading(true);
        try {
          const response = await confirmEcontract(contractId);
          if (response.success) {
            message.success(response.message);
            // Cập nhật status trong danh sách local
            setContracts(prevContracts => 
              prevContracts.map(contract => 
                contract.id === contractId 
                  ? { ...contract, status: 2 }
                  : contract
              )
            );
          } else {
            message.error(response.error);
          }
        } catch (error) {
          message.error('Có lỗi khi duyệt hợp đồng');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // Hàm hiển thị trạng thái hợp đồng
  const getStatusTag = (status) => {
    const statusMap = {
      1: { color: 'orange', text: 'Nháp' },           // Draft
      2: { color: 'blue', text: 'Sẵn sàng' },        // Ready
      3: { color: 'processing', text: 'Đang xử lý' }, // InProgress
      4: { color: 'success', text: 'Hoàn thành' },    // Completed
      5: { color: 'warning', text: 'Đang sửa' },      // Correcting
      6: { color: 'green', text: 'Đã chấp nhận' },    // Accepted
      '-3': { color: 'default', text: 'Đã hủy' },     // Cancelled
      '-2': { color: 'red', text: 'Đã xóa' },         // Deleted
      '-1': { color: 'red', text: 'Bị từ chối' }      // Rejected
    };

    const statusInfo = statusMap[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Hàm xem chi tiết hợp đồng
  const handleViewContract = (contract) => {
    modal.info({
      title: `Chi tiết hợp đồng: ${contract.name}`,
      content: (
        <div className="space-y-2">
          <p><strong>ID:</strong> {contract.id}</p>
          <p><strong>Loại:</strong> {contract.type}</p>
          <p><strong>Trạng thái:</strong> {getStatusTag(contract.status)}</p>
          <p><strong>Người tạo:</strong> {contract.createdBy}</p>
          <p><strong>Chủ sở hữu:</strong> {contract.ownerName}</p>
          <p><strong>Ngày tạo:</strong> {new Date(contract.createdAt).toLocaleString('vi-VN')}</p>
          {contract.customerOrderId && (
            <p><strong>ID Đơn hàng:</strong> {contract.customerOrderId}</p>
          )}
        </div>
      ),
      width: 600,
      okText: 'Đóng'
    });
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
      align: 'center'
    },
    {
      title: 'Tên hợp đồng',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name) => (
        <Tooltip title={name}>
          <span className="font-medium text-blue-600">{name}</span>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Người sở hữu',
      dataIndex: 'ownerName',
      key: 'ownerName',
      ellipsis: true,
      render: (name) => name || 'N/A'
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      ellipsis: true
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewContract(record)}
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          
          {/* Nút duyệt chỉ hiện khi status = 1 (Draft) */}
          {record.status === 1 && (
            <Tooltip title="Duyệt hợp đồng">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleConfirmContract(record.id, record.name)}
                loading={confirmLoading}
                className="bg-green-500 hover:bg-green-600 border-green-500"
              >
                Duyệt
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Load danh sách khi component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <DealerStaffLayout>
      <App>
        <PageContainer
          title={
            <div className="flex items-center gap-2">
              <Title level={3} className="!mb-0">
                Quản lý & Duyệt hợp đồng điện tử
              </Title>
            </div>
          }
          extra={[
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={fetchContracts}
              loading={loading}
              className="flex items-center"
            >
              Làm mới
            </Button>
          ]}
          className="bg-gray-50 min-h-screen"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800 mb-1">
                <strong>Hướng dẫn:</strong> Chỉ các hợp đồng ở trạng thái "Nháp" mới có thể được duyệt.
              </p>
              <p className="text-blue-600 text-sm">
                Sau khi duyệt, trạng thái sẽ chuyển thành "Sẵn sàng" và có thể tiến hành ký kết.
              </p>
            </div>
            
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} hợp đồng`
              }}
              className="w-full"
              size="middle"
            />
          </div>
        </PageContainer>
      </App>
    </DealerStaffLayout>
  );
}

export default GetAllContractManager;