import { useState } from 'react';
import { message, Modal, notification } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { SignContract } from '../../../App/EVMAdmin/SignContractEVM/SignContractEVM';
import AddSmartCA from './Components/AddSmartCA';

// Custom hook để quản lý logic ký hợp đồng
const useContractSigning = () => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddSmartCA, setShowAddSmartCA] = useState(false);


  const handleSignature = async (signatureData, signatureDisplayMode, contractId, waitingProcessData, contractLink, positionA, pageSign) => {
    try {
      if (!contractId || !signatureData) {
        message.error('Thiếu thông tin hợp đồng hoặc chữ ký.');
        return;
      }

      // Set preview image
      setPreviewImage(signatureData);

      // Chuyển sang trạng thái xác thực
      setShowSignatureModal(false);
      setSigningLoading(true);
      setShowSmartCAModal(true);

      const signContractApi = SignContract();

      // ✅ Ưu tiên sử dụng positionA và pageSign từ API draft-dealer-contracts
      let signingPage = pageSign; 
      let signingPosition = positionA; 

      // Fallback: Sử dụng từ waitingProcessData nếu không có positionA và pageSign
      if (waitingProcessData && !positionA && !pageSign) {
        if (waitingProcessData.pageSign) {
          signingPage = waitingProcessData.pageSign;
        }
        if (waitingProcessData.position) {
          signingPosition = waitingProcessData.position;
        }
        console.log('Sử dụng vị trí ký từ API waitingProcessData:', {
          signingPage,
          signingPosition,
          orderNo: waitingProcessData.orderNo,
          comId: waitingProcessData.comId
        });
      } else {
        console.log('Sử dụng vị trí ký từ API draft-dealer-contracts:', {
          signingPage,
          signingPosition: positionA,
          pageSign
        });
      }

      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureData,
        signingPage: signingPage,
        signingPosition: signingPosition,
        signatureText: "EVM COMPANY",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true,
        signatureDisplayMode: signatureDisplayMode
      };

      console.log('Signature data format:', {
        fullDataURL: signatureData.substring(0, 100) + '...',
        dataURLLength: signatureData.length,
        processId: contractId,
        waitingProcess: waitingProcessData,
        hasCorrectPrefix: signatureData.startsWith('data:image/png;base64,'),
        position: positionA
      });

      const result = await signContractApi.handleSignContract(signData);

      if (result && result.statusCode === 200 && result.isSuccess) {
        setSignatureCompleted(true);
        setShowSmartCAModal(false);
        setShowAppVerifyModal(true);
        message.success('Ký điện tử thành công! Vui lòng xác thực trên ứng dụng.');
      } else {
        const errorMessage = result?.message ||
          result?.result?.messages?.[0] ||
          'Có lỗi khi ký điện tử';
        message.error(errorMessage);
        setShowSmartCAModal(false);
      }
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
        // Note: Các state này cần được quản lý từ component cha
        setShowSmartCAModal(false);
        return;
      }

      // ⚙️ Còn lại: lỗi chung
      notification.error({
        message: "Ký hợp đồng thất bại",
        description: serverMessage,
        duration: 6,
      });
      
      setShowSmartCAModal(false);
    } finally {
      setSigningLoading(false);
    }
  };

  // Handle app verification (Step 2)
  const handleAppVerification = async (contractNo) => {
    if (!signatureCompleted) {
      message.error('Vui lòng hoàn thành ký điện tử trước!');
      return;
    }

    setSigningLoading(true);
    try {
      setShowAppVerifyModal(false);
      setContractSigned(true);

      Modal.success({
        title: (
          <span className="text-green-600 font-semibold flex items-center">
            <CheckOutlined className="mr-2" />
            Ký Hợp Đồng Hoàn Tất!
          </span>
        ),
        content: (
          <div className="py-4">
            <div className="text-base mb-3">🎉 Hợp đồng đã được ký và xác thực thành công!</div>
            <div className="text-sm text-gray-600">
              Hợp đồng số: <strong>{contractNo}</strong>
            </div>
            <div className="text-sm text-gray-600">
              Trạng thái: <strong className="text-green-600">Đã ký và xác thực ✅</strong>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Hợp đồng đã được hoàn tất với chữ ký điện tử và xác thực từ ứng dụng
            </div>
          </div>
        ),
        okText: 'Đóng',
        centered: true,
        width: 450,
        okButtonProps: {
          className: 'bg-green-500 border-green-500 hover:bg-green-600'
        }
      });

      message.success('Xác thực thành công! Hợp đồng đã hoàn tất.');
    } catch (error) {
      console.error('Error in app verification:', error);
      message.error('Có lỗi khi xác thực từ ứng dụng');
    } finally {
      setSigningLoading(false);
    }
  };


  const handleSmartCASuccess = (smartCAData) => {
    console.log('SmartCA added:', smartCAData);
    setShowAddSmartCA(false);
    if (smartCAData.hasValidSmartCA) {
      message.success('SmartCA đã được thêm và kích hoạt thành công!');
    } else {
      message.warning('SmartCA đã được thêm nhưng chưa được kích hoạt. Vui lòng kiểm tra lại.');
    }
  };

  // Reset signing state
  const resetSigningState = () => {
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowAppVerifyModal(false);
    setShowSmartCAModal(false);
    setSignatureCompleted(false);
    setSigningLoading(false);
    setPreviewImage(null);
    setShowAddSmartCA(false);

  };

  return {
    showSignatureModal,
    setShowSignatureModal,
    signingLoading,
    contractSigned,
    signatureCompleted,
    showSmartCAModal,
    setShowSmartCAModal,
    showAppVerifyModal,
    setShowAppVerifyModal,
    previewImage,
    showAddSmartCA,
    setShowAddSmartCA,
    handleSignature,
    handleAppVerification,
    handleSmartCASuccess,
    resetSigningState,
    AddSmartCAComponent: (contractInfo) => (
      <AddSmartCA
        visible={showAddSmartCA}
        onCancel={() => setShowAddSmartCA(false)}
        onSuccess={handleSmartCASuccess}
        contractInfo={contractInfo}
      />
    )
  };
};
export default useContractSigning;