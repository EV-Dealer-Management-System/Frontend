// BookingContractHandlers.js - Event handlers cho BookingContract
import { message, notification } from 'antd';

// Export các handler functions
export const createHandlers = ({
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
}) => {

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

  // Hàm kiểm tra SmartCA cho Admin (userId cố định cho hãng)
  const handleSmartCAChecked = (smartCAData) => {
    console.log('SmartCA checked for admin:', smartCAData);
    if (!smartCAInfo) {
      setSmartCAInfo(smartCAData);
    }

    const userCerts = smartCAData?.userCertificates || [];
    if (!setSelectedSmartCA.current) {
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

    if (!setSelectedSmartCA.current) {
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
      message.success(`Đã chọn chứng thư: ${certificate.commonName || certificate.name || 'SmartCA'}`);
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

  return {
    handleViewContract,
    handleCloseDetail,
    handleSmartCAChecked,
    handleOpenSignModal,
    handleSignContract,
    handleSelectSmartCA,
    handleOpenPdfModal
  };
};

export default createHandlers;