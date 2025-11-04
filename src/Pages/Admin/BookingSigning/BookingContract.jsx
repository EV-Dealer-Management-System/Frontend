import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PageContainer
} from '@ant-design/pro-components';
import {
  Table,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Drawer,
  Row,
  Col,
  Typography,
  message,
  Alert,
  notification
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  FilePdfOutlined,
  SafetyOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  IdcardOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
// Import hooks logic
import useFetchContracts from '../../../App/Admin/Booking/useFetchContract';
import useContractDetails from './Components/useContractDetails';

// Reuse SignContract system components
import useContractSigning from '../../Admin/SignContract/useContractSigning';
import SignatureModal from '../../Admin/SignContract/Components/SignatureModal';
import PDFModal from '../../Admin/SignContract/Components/PDF/PDFModal';
import PDFViewer from '../../Admin/SignContract/Components/PDF/PDFViewer';

// Reuse SmartCA system components
import SmartCAStatusChecker from '../../Admin/SignContract/Components/SmartCAStatusChecker';
import AddSmartCA from '../../Admin/SignContract/Components/AddSmartCA';
import SmartCAModal from '../../Admin/SignContract/Components/SmartCAModal';
import SmartCASelector from '../../Admin/SignContract/Components/SmartCASelector';

// Reuse Contract service
import { SignContract } from '../../../App/EVMAdmin/SignContractEVM/SignContractEVM';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function BookingContract() {
  const [searchParams] = useSearchParams();

  // State quản lý UI
  const [selectedContract, setSelectedContract] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  // SmartCA States
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [selectedSmartCA, setSelectedSmartCA] = useState(null);
  const [showSmartCASelector, setShowSmartCASelector] = useState(false);
  const [showAddSmartCAModal, setShowAddSmartCAModal] = useState(false);
  // EVC User Info State
  const [evcUser, setEvcUser] = useState({ accessToken: '', userId: '' });

  // Hooks logic
  const { contracts, loading, filters, updateFilter, reload } = useFetchContracts();
  const { detail, loading: detailLoading, canSign, signProcessId, fetchContractDetails, clearDetails, getPreviewUrl, loadPdfPreview, pdfBlobUrl, pdfLoading } = useContractDetails();

  // Reuse Contract Signing system
  const contractSigning = useContractSigning();
  const contractService = useMemo(() => SignContract(), []);

  // Ref để tránh fetch EVC token nhiều lần
  const hasFetchedToken = useRef(false);

  // Lấy EVC AccessToken khi mở trang
  useEffect(() => {
    if (hasFetchedToken.current) return;
    hasFetchedToken.current = true;

    const fetchEVCUser = async () => {
      try {
        const res = await contractService.getAccessTokenForEVC();
        setEvcUser(res);
      } catch (err) {
        console.error('Lỗi lấy EVC token:', err);
      }
    };
    fetchEVCUser();
  }, []);

  // Tự động search khi có bookingId hoặc search từ URL
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const searchQuery = searchParams.get('search');

    if (searchQuery) {
      console.log('Auto-searching for contract name:', searchQuery);
      updateFilter('search', searchQuery);
      message.info(`Đang tìm kiếm hợp đồng: ${searchQuery}`);
    } else if (bookingId) {
      console.log('Auto-searching for booking ID:', bookingId);
      updateFilter('search', bookingId);
      message.info(`Đang tìm kiếm hợp đồng cho Booking ID: ${bookingId.substring(0, 8)}...`);
    }
  }, [searchParams, updateFilter]);

  // Hàm kiểm tra SmartCA có lựa chọn hợp lệ không
  const getSmartCAChoices = (info) => {
    if (!info) return { hasChoices: false, hasValidChoices: false };
    const defaultExists = !!info.defaultSmartCa;
    const userCerts = Array.isArray(info.userCertificates) ? info.userCertificates : [];
    const hasChoices = defaultExists || userCerts.length > 0;
    const hasValidChoices = (info.defaultSmartCa?.isValid) || userCerts.some(c => c.isValid);
    return { hasChoices, hasValidChoices };
  };

  // Hàm xử lý mở chi tiết hợp đồng
  const handleViewContract = async (record) => {
    try {
      setDetailDrawerVisible(true);
      setSelectedContract(record);
      await fetchContractDetails(record.id);


    } catch (error) {
      console.log('Lỗi khi mở chi tiết hợp đồng:', error);
      message.error('Lỗi khi tải chi tiết hợp đồng');
      notification.error({
        message: 'Lỗi tải hợp đồng',
        description: 'Vui lòng kiểm tra kết nối hoặc thử lại.',
      });
      setDetailDrawerVisible(false);
      setSelectedContract(null);
    }
  };

  // Hàm đóng drawer chi tiết
  const handleCloseDetail = () => {
    setDetailDrawerVisible(false);
    setSelectedContract(null);
    clearDetails();
    contractSigning.resetSigningState();
  };
  // Safe render status
  const SafeStatus = ({ value }) => {
    if (!value) return <span>-</span>;
    try {
      return renderStatus(value);
    } catch {
      return <span>-</span>;
    }
  };

  // Hàm kiểm tra SmartCA cho Admin (userId cố định cho hãng)
  const handleSmartCAChecked = (smartCAData) => {
    console.log('SmartCA checked for admin:', smartCAData);
    if (!smartCAInfo) {
      setSmartCAInfo(smartCAData);
    }

    const userCerts = smartCAData?.userCertificates || [];
    if (!selectedSmartCA) {
      if (smartCAData?.defaultSmartCa?.isValid) {
        setSelectedSmartCA(smartCAData.defaultSmartCa);
      } else {
        const validCert = userCerts.find(c => c.isValid);
        if (validCert) setSelectedSmartCA(validCert);
      }
    }
  };

  // Hàm mở signature modal (có SmartCA rồi)
  const handleOpenSignModal = () => {
    if (!canSign || !signProcessId) {
      message.warning('Hợp đồng không thể ký lúc này');
      return;
    }

    if (!selectedSmartCA) {
      message.warning('Vui lòng chọn SmartCA trước khi ký');
      setShowSmartCASelector(true);
      return;
    }

    contractSigning.setShowSignatureModal(true);
  };

  // Hàm xử lý ký hợp đồng - reuse logic từ useContractSigning
  const handleSignContract = async (signatureData, signatureDisplayMode) => {
    if (!signProcessId || !detail) {
      message.error('Thiếu thông tin hợp đồng');
      return;
    }
    const positionToSign = detail.positionB || detail.waitingProcess?.position || "50,110,220,180";
    const pageToSign = detail.pageSign || detail.waitingProcess?.pageSign || 1;
    // Chuẩn bị data cho ký - theo format của EVM Admin
    const waitingProcessData = {
      id: signProcessId,
      pageSign: pageToSign,
      position: positionToSign
    };

    try {
      await contractSigning.handleSignature(
        signatureData,
        signatureDisplayMode,
        signProcessId,
        waitingProcessData,
        detail.downloadUrl,
        positionToSign,
        pageToSign,

      );

      // Reload contract detail sau khi ký thành công
      if (selectedContract) {
        await fetchContractDetails(selectedContract.id);
      }
      reload(); // Reload danh sách

    } catch (error) {
      console.error("Error signing contract:", error);

      const apiResponse = error?.response?.data;
      const serverMessage =
        apiResponse?.message ||
        apiResponse?.result?.messages?.[0] ||
        "Không xác định được lỗi từ server";

      // 🔎 Kiểm tra lỗi đặc biệt (Serial number changed)
      const isSmartCASerialError = serverMessage?.includes(
        "The serial number of the digital certificate has changed"
      );

      if (isSmartCASerialError) {
        // ⚠️ Thông báo đặc biệt cho SmartCA serial lỗi
        notification.warning({
          message: "Chứng thư số SmartCA không hợp lệ",
          description: (
            <div>
              <p>
                Số serial của chứng thư số đã thay đổi (do bạn đổi thiết bị hoặc gia hạn
                chứng thư). Hệ thống không thể ký hợp đồng.
              </p>
              <p style={{ marginTop: 8, fontWeight: 500 }}>
                👉 Vui lòng <b>xóa SmartCA cũ</b> và <b>thêm lại SmartCA</b> để đồng bộ chứng thư mới.
              </p>
            </div>
          ),
          duration: 8,
        });

        // Reset SmartCA state để buộc user chọn lại
        setSelectedSmartCA(null);
        setSmartCAInfo(null);
        setShowSmartCASelector(true);
        return;
      }

      // ⚙️ Còn lại: lỗi chung
      notification.error({
        message: "Ký hợp đồng thất bại",
        description: serverMessage,
        duration: 6,
      });
    }
  };

  // Hàm chọn SmartCA
  const handleSelectSmartCA = (certificate) => {
     // Nếu nhận signal reload SmartCA
      if (certificate?.refreshSmartCAInfo) {
        setSmartCAInfo(certificate.refreshSmartCAInfo);
        return;
      }

      if (!certificate) {
        message.warning('Vui lòng chọn chứng thư số hợp lệ');
        return;
      }
      // Trường hợp chọn certificate thật
      if (certificate) {
        setSelectedSmartCA(certificate);
        setShowSmartCASelector(false);
        message.success(`Đã chọn chứng thư: ${certificate.commonName}`);
      }
  };

  // Hàm mở PDF Modal
  const handleOpenPdfModal = async () => {
    if (detail?.downloadUrl) {
      // Gọi preview trước khi mở modal
      const resultUrl = await loadPdfPreview(detail.downloadUrl);
      if (resultUrl) {
        setPdfModalVisible(true);
      } else {
        message.error('Không thể tải PDF để xem trước');
      }
    } else {
      message.error('Không có đường dẫn PDF');
    }
  };

  // Render trạng thái hợp đồng
  const renderStatus = (status) => {
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

  // Cấu hình columns table
  const columns = [
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

  return (
    <AdminLayout>
      <PageContainer
        title="Quản lý hợp đồng Booking"
        subTitle="Xem và ký hợp đồng booking từ khách hàng"
      >
        {/* Filter Section */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <Row gutter={16}>
            <Col >
              <Search
                placeholder="Tìm theo tên hoặc ID"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                allowClear
              />
            </Col>
            <Col >
              <Select
                placeholder="Lọc theo trạng thái"
                value={filters.status}
                onChange={(value) => updateFilter('status', value)}
                allowClear
              >
                <Option value={1}>Nháp</Option>
                <Option value={2}>Sẵn sàng</Option>
                <Option value={3}>Đang thực hiện</Option>
                <Option value={4}>Hoàn tất</Option>
                <Option value={5}>Đang chỉnh sửa</Option>
                <Option value={6}>Đã chấp nhận</Option>
                <Option value={-1}>Từ chối</Option>
                <Option value={-2}>Đã xóa</Option>
                <Option value={-3}>Đã hủy</Option>
              </Select>
            </Col>
            <Col >
              <Select
                placeholder="Lọc theo ngày tạo"
                value={filters.dateRange}
                onChange={(value) => updateFilter('dateRange', value)}
                allowClear
              >
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="this_week">Tuần này</Select.Option>
                <Select.Option value="this_month">Tháng này</Select.Option>
              </Select>
            </Col>
            <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={reload}>
                Làm mới
              </Button>
            </Col>
          </Row>
        </div>
        <ConfigProvider locale={viVN}>
          {/* Contracts Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              loading={loading}
              scroll={false}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hợp đồng`,
              }}
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
            />
          </div>
        </ConfigProvider>
        {/* Contract Detail Drawer - Modern Beautiful Design */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}>
                    <FileTextOutlined style={{ color: 'white', fontSize: '20px' }} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '16px',
                    height: '16px',
                    background: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }}></div>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    Chi tiết hợp đồng Booking
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: '#dbeafe',
                      color: '#1d4ed8'
                    }}>
                      ID: {selectedContract?.id?.substring(0, 8) || '...'}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      {selectedContract?.name || 'Đang tải thông tin...'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              </div>
            </div>
          }
          width={1400}
          open={detailDrawerVisible}
          onClose={handleCloseDetail}
          loading={detailLoading}
          className="modern-contract-drawer"
          styles={{
            header: {
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderBottom: '1px solid #e2e8f0',
              padding: '20px 24px',
              borderRadius: '0'
            },
            body: {
              padding: 0,
              background: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
              minHeight: '100vh'
            }
          }}
          extra={
            <Space size="middle">
              {detail?.status?.value === 3 && canSign && selectedSmartCA && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleOpenSignModal}
                  loading={contractSigning.signingLoading}
                  size="large"
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                    border: 'none'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Ký hợp đồng</span>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'white',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      marginLeft: '4px'
                    }}></div>
                  </span>
                </Button>
              )}
              {detail?.status?.value === 3 && canSign && !selectedSmartCA && (
                <Button
                  type="default"
                  icon={<SafetyOutlined />}
                  onClick={() => setShowSmartCASelector(true)}
                  size="large"
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    borderColor: '#f59e0b',
                    color: '#d97706',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  }}
                >
                  Chọn SmartCA
                </Button>
              )}
              {detail?.status?.value !== 3 && (
                <Button
                  type="default"
                  disabled
                  size="large"
                  icon={<EditOutlined />}
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    borderRadius: '12px',
                    opacity: 0.6
                  }}
                >
                  Ký hợp đồng
                </Button>
              )}

              <Button
                type="text"
                icon={<DownloadOutlined />}
                size="large"
                title="Tải xuống"
                style={{
                  height: '48px',
                  width: '48px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              />

              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={handleOpenPdfModal}
                loading={pdfLoading}
                size="large"
                title="Mở rộng"
                style={{
                  height: '48px',
                  width: '48px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              />
            </Space>
          }
        >
          {detail && (
            <div style={{
              padding: '32px',
              minHeight: '100vh',
              paddingBottom: '80px'
            }}>
              <Row gutter={32}>
                {/* Left Sidebar - Contract Info & SmartCA */}
                <Col span={8}>
                  {/* Contract Information Card */}
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    marginBottom: '24px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid #f0f0f0',
                      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                          <InfoCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            margin: 0
                          }}>
                            Thông tin hợp đồng
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0,
                            marginTop: '4px'
                          }}>
                            Chi tiết và trạng thái
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      {[
                        { icon: FileTextOutlined, label: 'Số hợp đồng', value: detail.no, color: '#3b82f6' },
                        { icon: UserOutlined, label: 'Chủ đề', value: detail.subject, color: '#10b981' },
                        { icon: CheckCircleOutlined, label: 'Trạng thái', value: <SafeStatus value={detail.status.value} />, color: '#8b5cf6' },
                        { icon: CalendarOutlined, label: 'Ngày tạo', value: dayjs(detail.createdDate).format('DD/MM/YYYY HH:mm'), color: '#f59e0b' }
                      ].map((item, index) => (
                        <div key={index} style={{ marginBottom: index < 3 ? '20px' : 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              <item.icon style={{ fontSize: '18px', color: item.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#9ca3af',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                              }}>
                                {item.label}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1e293b',
                                wordBreak: 'break-words'
                              }}>
                                {item.value}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SmartCA Section */}
                  {detail?.status?.value === 3 && (
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f0f0f0',
                        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}>
                            <SecurityScanOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#1e293b',
                              margin: 0
                            }}>
                              SmartCA
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#64748b',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              Chứng thư số để ký hợp đồng
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '24px' }}>
                        {!smartCAInfo && (
                          <>
                            <SmartCAStatusChecker
                              userId={evcUser.userId}
                              contractService={contractService}
                              onChecked={handleSmartCAChecked}
                            />
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              padding: '16px',
                              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                              borderRadius: '12px',
                              border: '1px solid #93c5fd'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#3b82f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid white',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite'
                                }}></div>
                              </div>
                              <div>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#1e40af',
                                  margin: 0
                                }}>
                                  Đang kiểm tra SmartCA...
                                </p>
                                <p style={{
                                  fontSize: '12px',
                                  color: '#2563eb',
                                  margin: 0,
                                  marginTop: '4px'
                                }}>
                                  Vui lòng đợi trong giây lát
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {smartCAInfo && (() => {
                          const { hasChoices, hasValidChoices } = getSmartCAChoices(smartCAInfo);

                          if (!hasChoices) {
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '16px',
                                  padding: '16px',
                                  background: 'linear-gradient(135deg, #fef3c7, #fecaca)',
                                  borderRadius: '12px',
                                  border: '1px solid #fed7aa'
                                }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: '#f97316',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <WarningOutlined style={{ color: 'white', fontSize: '14px' }} />
                                  </div>
                                  <div>
                                    <p style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#ea580c',
                                      margin: 0
                                    }}>
                                      Không tìm thấy chứng thư số
                                    </p>
                                    <p style={{
                                      fontSize: '12px',
                                      color: '#ea580c',
                                      margin: 0,
                                      marginTop: '4px'
                                    }}>
                                      Bạn có thể thêm SmartCA mới bằng CCCD/CMND
                                    </p>
                                  </div>
                                </div>

                                <Button
                                  type="primary"
                                  onClick={() => setShowAddSmartCAModal(true)}
                                  size="large"
                                  style={{
                                    width: '100%',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                  }}
                                >
                                  + Thêm SmartCA mới
                                </Button>

                                <AddSmartCA
                                  visible={showAddSmartCAModal}
                                  onCancel={() => setShowAddSmartCAModal(false)}
                                  onSuccess={(res) => {
                                    setSmartCAInfo(prev => ({
                                      ...(prev || {}),
                                      userCertificates: [...(prev?.userCertificates || []), res.smartCAData].filter(Boolean),
                                      defaultSmartCa: (prev?.defaultSmartCa) || null,
                                    }));
                                    
                                    setShowAddSmartCAModal(false);
                                    message.success('SmartCA mới đã được thêm!');
                                  }}
                                  contractInfo={{
                                    userId: evcUser.userId,
                                    accessToken: evcUser.accessToken
                                  }}
                                />
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {selectedSmartCA ? (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '16px',
                                  padding: '16px',
                                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                                  borderRadius: '12px',
                                  border: '1px solid #a7f3d0'
                                }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: '#10b981',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <CheckCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#047857',
                                      margin: 0
                                    }}>
                                      SmartCA đã sẵn sàng
                                    </p>
                                    <div style={{
                                      fontSize: '12px',
                                      color: '#059669',
                                      marginTop: '8px'
                                    }}>
                                      <div style={{ marginBottom: '4px' }}>
                                        <strong>Chứng thư:</strong> {selectedSmartCA.commonName}
                                      </div>
                                      <div>
                                        <strong>UID:</strong> {selectedSmartCA.uid}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="small"
                                    onClick={() => setShowSmartCASelector(true)}
                                    style={{
                                      borderColor: '#10b981',
                                      color: '#047857',
                                      borderRadius: '8px'
                                    }}
                                  >
                                    Đổi
                                  </Button>
                                </div>
                              ) : (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '16px',
                                  padding: '16px',
                                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                  borderRadius: '12px',
                                  border: '1px solid #fbbf24'
                                }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: '#f59e0b',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <WarningOutlined style={{ color: 'white', fontSize: '14px' }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#d97706',
                                      margin: 0
                                    }}>
                                      {hasValidChoices ? 'Chưa chọn SmartCA' : 'Chưa có chứng thư hợp lệ'}
                                    </p>
                                    <p style={{
                                      fontSize: '12px',
                                      color: '#d97706',
                                      margin: 0,
                                      marginTop: '4px'
                                    }}>
                                      {hasValidChoices
                                        ? 'Vui lòng chọn chứng thư số để ký hợp đồng'
                                        : 'Hệ thống có chứng thư nhưng chưa hợp lệ'}
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {hasValidChoices ? (
                                      <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => setShowSmartCASelector(true)}
                                        style={{
                                          background: '#3b82f6',
                                          borderRadius: '8px',
                                          border: 'none'
                                        }}
                                      >
                                        Chọn
                                      </Button>
                                    ) : (
                                      <>
                                        <Button
                                          size="small"
                                          onClick={() => setShowSmartCASelector(true)}
                                          style={{
                                            borderRadius: '8px'
                                          }}
                                        >
                                          Danh sách
                                        </Button>
                                        <Button
                                          size="small"
                                          type="primary"
                                          onClick={() => setShowAddSmartCAModal(true)}
                                          style={{
                                            background: '#3b82f6',
                                            borderRadius: '8px',
                                            border: 'none'
                                          }}
                                        >
                                          Thêm
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </Col>

                {/* Right Column - PDF Viewer */}
                <Col span={16}>
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    overflow: 'visible',
                    height: 'auto',
                    minHeight: '800px'
                  }}>
                    <div style={{
                      padding: '24px',
                      borderBottom: '1px solid #f0f0f0',
                      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                          }}>
                            <FileTextOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#1e293b',
                              margin: 0
                            }}>
                              Xem trước hợp đồng
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#64748b',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              Tài liệu PDF và vị trí chữ ký
                            </p>
                          </div>
                        </div>
                        <Space>
                          <Button
                            type="default"
                            size="small"
                            icon={<DownloadOutlined />}
                            style={{
                              borderColor: '#8b5cf6',
                              color: '#8b5cf6',
                              borderRadius: '8px'
                            }}
                          >
                            Tải xuống
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            icon={<FullscreenOutlined />}
                            onClick={handleOpenPdfModal}
                            loading={pdfLoading}
                            style={{
                              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                            }}
                          >
                            Cửa sổ riêng
                          </Button>
                        </Space>
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          minHeight: '800px',
                          maxHeight: '900px',
                          borderRadius: '8px',
                          overflow: 'auto',
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {detail.downloadUrl ? (
                            <PDFViewer
                              contractNo={detail.no || 'Booking'}
                              pdfUrl={getPreviewUrl() || pdfBlobUrl}
                              showAllPages={false}
                              scale={0.9}
                            />
                          ) : (
                            <div style={{
                              height: '120%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                              border: '2px dashed #d1d5db',
                              borderRadius: '8px'

                            }}>
                              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                                <div style={{
                                  width: '64px',
                                  height: '64px',
                                  margin: '0 auto 16px',
                                  background: '#e5e7eb',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FilePdfOutlined style={{ fontSize: '24px', color: '#9ca3af' }} />
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                                  Không có PDF để hiển thị
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                                  Hợp đồng chưa có file đính kèm
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Drawer>

        {/* Custom CSS cho drawer */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .contract-detail-drawer .ant-drawer-body {
                padding: 0 !important;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              }
              
              .contract-detail-drawer .ant-drawer-header {
                background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
                border-bottom: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
              }
              
              .contract-detail-drawer .ant-typography h5 {
                margin-bottom: 0 !important;
              }
              
              /* Smooth transitions */
              .contract-detail-drawer * {
                transition: all 0.2s ease-in-out;
              }
              
              /* Custom scrollbar */
              .contract-detail-drawer .ant-drawer-body::-webkit-scrollbar {
                width: 6px;
              }
              
              .contract-detail-drawer .ant-drawer-body::-webkit-scrollbar-track {
                background: #f1f5f9;
              }
              
              .contract-detail-drawer .ant-drawer-body::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
              }
              
              .contract-detail-drawer .ant-drawer-body::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `
          }}
        />


        {/* Signature Modal - Reuse từ SignContract system */}
        <SignatureModal
          visible={contractSigning.showSignatureModal}
          onCancel={() => contractSigning.setShowSignatureModal(false)}
          onSign={handleSignContract}
          loading={contractSigning.signingLoading}
        />

        {/* SmartCA Modal - Reuse từ SignContract system */}
        <SmartCAModal
          visible={contractSigning.showSmartCAModal}
          onCancel={() => contractSigning.setShowSmartCAModal(false)}
          contractNo={selectedContract?.id?.substring(0, 8) || 'Booking'}
        />

        {/* SmartCA Selector Modal */}
        <SmartCASelector
          visible={showSmartCASelector}
          onCancel={() => setShowSmartCASelector(false)}
          onSelect={handleSelectSmartCA}
          onReloadSmartCA={async (newData) => {
            if (newData) setSmartCAInfo(newData);
            else{
              const refreshed = await contractService.handleCheckSmartCA(Number(evcUser.userId));
              setSmartCAInfo(refreshed);
            }
            message.success('Đã Reload lại danh sách SmartCA')
          }}
          smartCAData={smartCAInfo}
          loading={contractSigning.signingLoading}
          currentSelectedId={selectedSmartCA?.id}
          contractService={contractService}
          userId={evcUser.userId} // Fixed admin user ID for EVM
        />

        {/* PDF Modal - Reuse từ SignContract system */}
        <PDFModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          contractNo={selectedContract?.id?.substring(0, 8) || 'Booking'}
          pdfUrl={pdfBlobUrl || getPreviewUrl()}
          title={`Hợp đồng Booking - ${selectedContract?.name || 'N/A'}`}
        />
      </PageContainer>
    </AdminLayout>
  );

}


export default BookingContract;
