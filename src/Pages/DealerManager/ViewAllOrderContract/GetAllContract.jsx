import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Button, message, Tag, Space, Modal, Typography, Tooltip, App } from 'antd';
import { EyeOutlined, ReloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getAllEcontractList, getVnptEcontractById, getEcontractPreview } from '../../../App/DealerManager/GetAllContract/GetAllEcontract';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import PDFModal from '../../Admin/SignContract/Components/PDF/PDFModal';

const { Title } = Typography;

function GetAllContract() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentContract, setCurrentContract] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { message, modal } = App.useApp();

  // Hàm lấy danh sách hợp đồng
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await getAllEcontractList(1, 1000, 3);
      if (response.success) {
        setContracts(response.data);
        // message.success(response.message);
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error('Có lỗi khi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
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

  // Hàm xem chi tiết hợp đồng (có thể mở PDF hoặc HTML)
  const handleViewContract = (contract) => {
    modal.info({
      title: `Chi tiết hợp đồng: ${contract.name}`,
      content: (
        <div className="space-y-2">
          <p><strong>ID:</strong> {contract.id}</p>
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

  // Hàm xem PDF hợp đồng
  const handleViewPDF = async (contract) => {
    setPdfLoading(true);
    try {
      // Lấy thông tin hợp đồng để có downloadUrl
      const contractInfo = await getVnptEcontractById(contract.id);
      if (contractInfo.success && contractInfo.data?.downloadUrl) {
        // Lấy PDF stream từ downloadUrl
        const pdfBlob = await getEcontractPreview(contractInfo.data.downloadUrl);
        if (pdfBlob) {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setCurrentPdfUrl(pdfUrl);
          setCurrentContract(contract);
          setPdfModalVisible(true);
        } else {
          message.error('Không thể tải PDF hợp đồng');
        }
      } else {
        message.error('Không tìm thấy thông tin hợp đồng hoặc link PDF');
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      message.error('Có lỗi khi tải PDF hợp đồng');
    } finally {
      setPdfLoading(false);
    }
  };

  // Hàm đóng PDF modal
  const handleClosePdfModal = () => {
    setPdfModalVisible(false);
    if (currentPdfUrl) {
      URL.revokeObjectURL(currentPdfUrl);
      setCurrentPdfUrl('');
    }
    setCurrentContract(null);
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
      width: 200,
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
          <Tooltip title="Xem PDF">
            <Button
              type="text"
              icon={<FilePdfOutlined />}
              onClick={() => handleViewPDF(record)}
              loading={pdfLoading}
              className="text-red-600 hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Load danh sách khi component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <DealerManagerLayout>
        <App>
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <Title level={3} className="!mb-0">
            Danh sách hợp đồng điện tử
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

      {/* PDF Modal */}
      <PDFModal
        visible={pdfModalVisible}
        onClose={handleClosePdfModal}
        contractNo={currentContract?.id}
        pdfUrl={currentPdfUrl}
        title={currentContract?.name}
      />
    </PageContainer>
    </App>
    </DealerManagerLayout>
  );

}

export default GetAllContract;
