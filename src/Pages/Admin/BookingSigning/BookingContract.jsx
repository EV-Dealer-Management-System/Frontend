import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PageContainer
} from '@ant-design/pro-components';
import {
  Table,
  Button,
  Select,
  Input,
  Row,
  Col,
  message
} from 'antd';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
// Import hooks logic
import useFetchContracts from '../../../App/Admin/Booking/useFetchContract';
import useContractDetails from './Components/useContractDetails';

// Import tách components
import { createBookingColumns, getSmartCAChoices } from './Components/BookingTableHelpers';
import { createHandlers } from './Components/BookingContractHandlers';
import BookingContractDrawer from './Components/BookingContractDrawer';

// Reuse SignContract system components
import useContractSigning from '../../Admin/SignContract/useContractSigning';
import SignatureModal from '../../Admin/SignContract/Components/SignatureModal';
import PDFModal from '../../Admin/SignContract/Components/PDF/PDFModal';

// Reuse SmartCA system components
import SmartCAModal from '../../Admin/SignContract/Components/SmartCAModal';
import SmartCASelector from '../../Admin/SignContract/Components/SmartCASelector';

// Reuse Contract service
import { SignContract } from '../../../App/EVMAdmin/SignContractEVM/SignContractEVM';

const { Search } = Input;
const { Option } = Select;

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

  // Tạo handlers từ helper
  const handlers = createHandlers({
    // States
    setDetailDrawerVisible,
    setSelectedContract,
    setSmartCAInfo,
    setSelectedSmartCA,
    setShowSmartCASelector,
    setPdfModalVisible,
    // Data
    detail,
    selectedContract,
    smartCAInfo,
    canSign,
    signProcessId,
    // Services
    fetchContractDetails,
    clearDetails,
    contractSigning,
    loadPdfPreview,
    reload
  });

  // Extract handlers
  const {
    handleViewContract,
    handleCloseDetail,
    handleSmartCAChecked,
    handleOpenSignModal,
    handleSignContract,
    handleSelectSmartCA,
    handleOpenPdfModal
  } = handlers;

  // Tạo columns từ helper
  const columns = createBookingColumns(handleViewContract);

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
        {/* Contract Detail Drawer - Sử dụng component đã tách */}
        <BookingContractDrawer
          visible={detailDrawerVisible}
          onClose={handleCloseDetail}
          selectedContract={selectedContract}
          detail={detail}
          detailLoading={detailLoading}
          canSign={canSign}
          smartCAInfo={smartCAInfo}
          selectedSmartCA={selectedSmartCA}
          evcUser={evcUser}
          onOpenSignModal={handleOpenSignModal}
          onOpenPdfModal={handleOpenPdfModal}
          onSelectSmartCA={handleSelectSmartCA}
          getPreviewUrl={getPreviewUrl}
          pdfBlobUrl={pdfBlobUrl}
          pdfLoading={pdfLoading}
          contractSigning={contractSigning}
          handleSmartCAChecked={handleSmartCAChecked}
          setSmartCAInfo={setSmartCAInfo}
          setShowAddSmartCAModal={setShowAddSmartCAModal}
          setShowSmartCASelector={setShowSmartCASelector}
          showAddSmartCAModal={showAddSmartCAModal}
          contractService={contractService}
        />

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
