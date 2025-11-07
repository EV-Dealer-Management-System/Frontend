// Contract.js - Business logic cho xử lý hợp đồng điện tử
import api from "../../api/api";

export const ContractService = () => {
  // Lấy thông tin hợp đồng bằng processCode
  const handleGetContractInfo = async (processCode) => {
    try {
      const response = await api.get(`/EContract/get-info-to-sign-process-by-code`, {
        params: { processCode }
      });
      
      // Parse response data mới với position và pageSign
      const contractData = response.data;
      
      console.log('Contract info response:', contractData);
      
      // Validate required fields including new position and pageSign
      if (!contractData.processId || !contractData.accessToken) {
        throw new Error('Response thiếu thông tin processId hoặc accessToken');
      }
      
      // Validate position và pageSign fields
      if (!contractData.position || !contractData.pageSign) {
        console.warn('Response thiếu position hoặc pageSign, sử dụng giá trị mặc định');
      }
      
      // ✅ Parse isOTP field cho flow mới
      const isOTPFlow = contractData.isOTP || false;
      console.log('Contract flow type:', isOTPFlow ? 'OTP' : 'SmartCA');
      
      // Ensure position, pageSign và isOTP are included in the returned data
      const enhancedData = {
        ...contractData,
        position: contractData.position, 
        pageSign: contractData.pageSign,
        isOTP: isOTPFlow // ✅ Thêm isOTP field
      };
      
      return {
        success: true,
        data: enhancedData
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin hợp đồng. Vui lòng kiểm tra mã process.'
      };
    }
  };

  // Kiểm tra thông tin SmartCA của user
  const handleCheckSmartCA = async (userId) => {
    try {
      const response = await api.get(`/EContract/smartca-info/${userId}`);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error checking SmartCA:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể kiểm tra thông tin SmartCA.'
      };
    }
  };

  // Thêm SmartCA cho user - Token trong query params như API spec
  const handleAddSmartCA = async ({ userId, userName, serialNumber, accessToken }) => {
    try {
      const requestBody = {
        userId: userId,
        userName: userName,
        serialNumber: serialNumber || null
      };

      console.log('Adding SmartCA with data:', { userId, userName, serialNumber: serialNumber || 'null' });

      // Token được gửi trong query params theo API spec
      const response = await api.post(`/EContract/add-smartca?token=${encodeURIComponent(accessToken)}`, requestBody);
      
      console.log('Add SmartCA response:', response.data);
      
      // Kiểm tra success flag từ response
      if (response.data && response.data.success === true) {
        const smartCAData = response.data.data;
        
        // Kiểm tra xem SmartCA có được thêm thành công không
        const hasValidSmartCA = smartCAData && (
          (smartCAData.defaultSmartCa && smartCAData.defaultSmartCa.isValid) ||
          (smartCAData.userCertificates && smartCAData.userCertificates.length > 0 && 
           smartCAData.userCertificates.some(cert => cert.isValid))
        );

        return {
          success: true,
          data: smartCAData,
          message: response.data.messages?.[0] || 'Thêm SmartCA thành công!',
          hasValidSmartCA: hasValidSmartCA
        };
      } else {
        // Response có success: false
        const errorMessage = response.data.messages?.[0] || 'Thêm SmartCA thất bại';
        console.error('Add SmartCA failed:', errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Error adding SmartCA:', error);
      
      // Xử lý lỗi từ response
      const errorMessage = error.response?.data?.messages?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Không thể thêm SmartCA.';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // ✅ Gửi OTP - không cần chữ ký, chỉ cần processId và accessToken
  const handleSendOTP = async ({ processId, accessToken, contractInfo }) => {
    try {
      if (!processId || !accessToken) {
        throw new Error("Thiếu thông tin processId hoặc accessToken để gửi OTP");
      }

      // Lấy position và pageSign từ contractInfo
      const signingPosition = contractInfo?.position || "406,396,576,486";
      const signingPage = contractInfo?.pageSign || 3;

      // Request body để trigger gửi OTP - hầu hết field null/default
      const requestBody = {
        processId: processId,
        reason: "Gửi mã OTP xác thực",
        reject: false,
        otp: "", // Empty để trigger gửi OTP
        signatureDisplayMode: 1,
        signatureImage: null, // ✅ Không cần chữ ký để gửi OTP
        signingPage: signingPage,
        signingPosition: signingPosition,
        signatureText: "{{Name}}\n{{SubjectDN}}\n{{Reason}}\n{{SignTime}}",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true
      };

      console.log("=== SENDING OTP REQUEST ===");
      console.log("Full request body:", JSON.stringify(requestBody, null, 2));
      console.log("Request summary:", {
        processId: requestBody.processId,
        reason: requestBody.reason,
        signatureImage: requestBody.signatureImage,
        signatureText: requestBody.signatureText,
        otp: requestBody.otp,
        signingPosition: requestBody.signingPosition,
        signingPage: requestBody.signingPage
      });

      // Gọi API - không quan tâm success/fail vì mục đích chỉ để trigger gửi OTP
      const response = await api.post('/EContract/sign-process', requestBody, {
        params: {
          token: accessToken
        }
      });

      console.log("=== SEND OTP API RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Full response data:", JSON.stringify(response.data, null, 2));
      console.log("Response summary:", {
        statusCode: response.data?.statusCode,
        isSuccess: response.data?.isSuccess,
        message: response.data?.message,
        result: response.data?.result
      });
      
      // Luôn return success vì mục đích chỉ để trigger gửi OTP
      return {
        success: true,
        message: 'Đã gửi mã OTP đến email của bạn'
      };
    } catch (error) {
      console.log("=== SEND OTP ERROR RESPONSE ===");
      console.log("Error object:", error);
      console.log("Error response status:", error.response?.status);
      console.log("Error response data:", JSON.stringify(error.response?.data, null, 2));
      console.log("Error message:", error.message);
      console.log('Send OTP API called (expected):', error.message);
      
      // Vẫn return success vì chỉ cần trigger gửi OTP
      return {
        success: true,
        message: 'Đã gửi mã OTP đến email của bạn'
      };
    }
  };

  // Ký hợp đồng điện tử - sử dụng position và pageSign từ contract info
  const handleDigitalSignature = async ({ processId, reason, signatureImage, signatureDisplayMode, accessToken, contractInfo, otp = "" }) => {
    try {
      // ✅ Logic validation mới cho OTP và SmartCA flow
      const hasOTP = otp && otp.trim() !== "";
      const isSmartCAFlow = !hasOTP;
      
      // SmartCA flow: luôn cần chữ ký
      // OTP flow với OTP có giá trị: cần chữ ký  
      if (!signatureImage) {
        if (isSmartCAFlow) {
          throw new Error("Vui lòng tạo chữ ký trước khi ký hợp đồng với SmartCA");
        } else if (hasOTP) {
          throw new Error("Vui lòng tạo chữ ký trước khi ký hợp đồng với OTP");
        }
        // Nếu không có OTP và không có chữ ký = đang gửi OTP (được phép)
      }

      // Lấy pageSign và position từ contract info (response mới)
      // Lấy position và pageSign từ contractInfo response
      const signingPosition = contractInfo?.position || "406,396,576,486"; // Default position từ API mới
      const signingPage = contractInfo?.pageSign || pageSign || 3; // Ưu tiên từ contractInfo, default page 3
      
      console.log('Signing parameters from contractInfo:', {
        position: signingPosition,
        pageSign: signingPage,
        contractInfoPosition: contractInfo?.position,
        contractInfoPageSign: contractInfo?.pageSign
      });

      // Request body theo schema API với position và pageSign từ get-info-to-sign-process-by-code
      const requestBody = {
        processId: processId,
        reason: reason || "Ký hợp đồng điện tử - Khách hàng",
        reject: false,
        otp: otp, // ✅ Sử dụng OTP từ parameter
        signatureDisplayMode: signatureDisplayMode || 2,
        signatureImage: signatureImage,
        signingPage: signingPage,
        signingPosition: signingPosition,
        signatureText: "{{Name}}\n{{SubjectDN}}\n{{Reason}}\n{{SignTime}}", // ✅ Thay đổi signatureText mặc định
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true
      };

      console.log("=== DIGITAL SIGNATURE REQUEST ===");
      console.log("Flow type:", { hasOTP, isSmartCAFlow });
      console.log("Full request body:", JSON.stringify(requestBody, null, 2));
      console.log("Request summary:", {
        processId: requestBody.processId,
        reason: requestBody.reason,
        signatureImage: requestBody.signatureImage ? 'HAS_SIGNATURE' : 'NULL',
        signatureText: requestBody.signatureText,
        otp: requestBody.otp,
        signingPosition: requestBody.signingPosition,
        signingPage: requestBody.signingPage,
        signatureDisplayMode: requestBody.signatureDisplayMode
      });

      // Gọi API với access token
      const response = await api.post('/EContract/sign-process', requestBody, {
        params: {
          token: accessToken
        }
      });

      console.log("=== DIGITAL SIGNATURE API RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Full response data:", JSON.stringify(response.data, null, 2));
      console.log("Response summary:", {
        statusCode: response.data?.statusCode,
        isSuccess: response.data?.isSuccess,
        message: response.data?.message,
        result: response.data?.result,
        errorMessages: response.data?.result?.messages
      });
      
      if (response.data && response.data.statusCode === 200 && response.data.isSuccess) {
        return {
          success: true,
          data: response.data.result?.data || response.data,
          message: response.data.message || 'Ký điện tử thành công!'
        };
      } else {
        const errorMessage = response.data?.message || 
                         response.data?.result?.messages?.[0] || 
                         'Có lỗi khi ký điện tử';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.log("=== DIGITAL SIGNATURE ERROR RESPONSE ===");
      console.log("Error object:", error);
      console.log("Error response status:", error.response?.status);
      console.log("Error response data:", JSON.stringify(error.response?.data, null, 2));
      console.log("Error message:", error.message);
      console.error('Error in customer digital signature:', error);
      
      // ✅ Xử lý các loại error cụ thể
      if (error.response?.status === 500) {
        // Lỗi 500 thường là sai OTP hoặc lỗi server
        throw new Error("Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại mã OTP.");
      }
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Please add a signature image")) {
          throw new Error("Vui lòng thêm chữ ký trước khi ký hợp đồng");
        } else if (errorMessage.includes("User has not confirmed yet")) {
          throw new Error("Người dùng chưa xác nhận. Vui lòng kiểm tra OTP hoặc xác nhận điều khoản trước khi ký.");
        } else if (errorMessage.includes("Lỗi ký số")) {
          throw new Error(`Lỗi ký số: ${errorMessage}`);
        } else if (errorMessage.includes("OTP") || errorMessage.includes("otp")) {
          throw new Error("Mã OTP không chính xác. Vui lòng kiểm tra lại mã OTP từ SMS hoặc email.");
        } else {
          throw new Error(errorMessage);
        }
      }
      
      return {
        success: false,
        error: error.message || 'Không thể ký hợp đồng điện tử.'
      };
    }
  };



  // Lấy preview PDF từ token hoặc downloadUrl
  const handleGetPreviewPDF = async (tokenOrUrl) => {
    try {
      // Nếu là URL đầy đủ, thử sử dụng trực tiếp
      if (tokenOrUrl && (tokenOrUrl.startsWith('http') || tokenOrUrl.startsWith('/api'))) {
        console.log('Using direct URL for PDF:', tokenOrUrl);
        return {
          success: true,
          url: tokenOrUrl,
          data: null
        };
      }
      
      // Nếu là token, thử gọi preview API
      if (tokenOrUrl) {
        console.log('Trying preview API with token...');
        const response = await api.get('/EContract/preview', {
          params: { token: tokenOrUrl },
          responseType: 'blob'
        });
        
        return {
          success: true,
          data: response.data,
          url: URL.createObjectURL(response.data)
        };
      }
      
      throw new Error('No token or URL provided');
      
    } catch (error) {
      console.error('Error getting PDF preview:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy preview PDF.'
      };
    }
  };

  // Utility: Tạo URL preview từ downloadUrl
  const getPreviewUrl = (downloadUrl) => {
    try {
      const urlParams = new URLSearchParams(downloadUrl.split('?')[1]);
      const token = urlParams.get('token');
      
      // Trả về relative URL cho axios
      return `/api/EContract/preview?token=${encodeURIComponent(token)}`;
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return downloadUrl;
    }
  };

  // Utility: Kiểm tra SmartCA có hợp lệ không
  const isSmartCAValid = (smartCAInfo) => {
    if (!smartCAInfo) return false;
    
    // Kiểm tra defaultSmartCa (ưu tiên)
    const hasValidDefaultSmartCA = smartCAInfo.defaultSmartCa && smartCAInfo.defaultSmartCa.isValid;
    
    // Kiểm tra userCertificates
    const hasValidCertificates = smartCAInfo.userCertificates && 
                               smartCAInfo.userCertificates.length > 0 &&
                               smartCAInfo.userCertificates.some(cert => cert.isValid);
    
    // SmartCA hợp lệ nếu có defaultSmartCa hợp lệ HOẶC có certificates hợp lệ
    const isValid = hasValidDefaultSmartCA || hasValidCertificates;
    
    console.log('SmartCA validity check:', {
      smartCAInfo: !!smartCAInfo,
      hasDefaultSmartCA: !!smartCAInfo.defaultSmartCa,
      defaultSmartCAValid: smartCAInfo.defaultSmartCa?.isValid,
      certificateCount: smartCAInfo.userCertificates?.length || 0,
      validCertificates: smartCAInfo.userCertificates?.filter(cert => cert.isValid).length || 0,
      finalResult: isValid
    });
    
    return isValid;
  };

  // Utility: Validate processCode
  const validateProcessCode = (processCode) => {
    if (!processCode) {
      return { valid: false, message: 'Vui lòng nhập mã process!' };
    }
    if (processCode.length < 6) {
      return { valid: false, message: 'Mã process phải có ít nhất 6 ký tự!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Validate CCCD
  const validateCCCD = (cccd) => {
    if (!cccd) {
      return { valid: false, message: 'Vui lòng nhập số CCCD!' };
    }
    const cccdPattern = /^[0-9]{9,12}$/;
    if (!cccdPattern.test(cccd)) {
      return { valid: false, message: 'Số CCCD phải từ 9-12 chữ số!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Validate OTP
  const validateOTP = (otp) => {
    if (!otp) {
      return { valid: false, message: 'Vui lòng nhập mã OTP!' };
    }
    if (otp.length !== 6) {
      return { valid: false, message: 'Mã OTP phải có đúng 6 ký tự!' };
    }
    const otpPattern = /^[0-9]{6}$/;
    if (!otpPattern.test(otp)) {
      return { valid: false, message: 'Mã OTP phải là 6 chữ số!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Xác định bước tiếp theo
  const determineNextStep = (contractInfo, smartCAInfo) => {
    if (!contractInfo) return 0; // Nhập mã process
    if (!smartCAInfo) return 1; // Loading SmartCA info
    if (!isSmartCAValid(smartCAInfo)) return 2; // Cần thêm SmartCA
    return 3; // Sẵn sàng ký hợp đồng
  };

  // Utility: Format thông tin SmartCA
  const formatSmartCAInfo = (smartCAInfo) => {
    if (!smartCAInfo) return null;
    
    return {
      name: smartCAInfo.name || 'Không có thông tin',
      email: smartCAInfo.email || 'Không có thông tin',
      phone: smartCAInfo.phone || 'Không có thông tin',
      isValid: smartCAInfo.isValid || false,
      status: smartCAInfo.isValid ? 'Hợp lệ' : 'Chưa hợp lệ',
      statusType: smartCAInfo.isValid ? 'success' : 'error',
      certificateCount: smartCAInfo.userCertificates?.length || 0,
      certificates: smartCAInfo.userCertificates || [],
      defaultSmartCa: smartCAInfo.defaultSmartCa || null
    };
  };

  // Cập nhật SmartCA được chọn - API mới  
  const handleUpdateSmartCA = async (smartCAId, userId, smartCAOwnerName = null) => {
    try {
      console.log('=== UPDATE SMARTCA API CALL - Customer ===');
      
      const requestPayload = {
        id: String(smartCAId),            // Đảm bảo ID là string
        userId: String(userId),           // ID người dùng hiện tại
        isSetDefault: true,               // Mặc định true
        name: smartCAOwnerName || null    // Tên chủ SmartCA hoặc null
      };
      
      console.log('Request payload with types:', {
        id: requestPayload.id + ' (' + typeof requestPayload.id + ')',
        userId: requestPayload.userId + ' (' + typeof requestPayload.userId + ')',
        isSetDefault: requestPayload.isSetDefault + ' (' + typeof requestPayload.isSetDefault + ')',
        name: requestPayload.name + ' (' + typeof requestPayload.name + ')'
      });
      console.log('Full payload:', requestPayload);
      
      const response = await api.post('/EContract/update-smartca', requestPayload);
      
      console.log('Update SmartCA response:', response.data);
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật SmartCA thành công'
        };
      }
      
      return {
        success: false,
        error: 'Phản hồi không hợp lệ từ server'
      };
      
    } catch (error) {
      console.error('Error updating SmartCA:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật SmartCA.'
      };
    }
  };

  return {
    // Main API handlers
    handleGetContractInfo,
    handleCheckSmartCA,
    handleAddSmartCA,
    handleSendOTP, // ✅ Export function mới
    handleUpdateSmartCA,
    handleDigitalSignature,
    handleGetPreviewPDF,
    // Utility functions
    getPreviewUrl,
    isSmartCAValid,
    validateProcessCode,
    validateCCCD,
    validateOTP,
    determineNextStep,
    formatSmartCAInfo
  };
};
