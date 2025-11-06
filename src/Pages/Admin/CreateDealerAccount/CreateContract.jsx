import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Card,
  Space,
  Typography, 
  App
} from 'antd';
import { 
  UserAddOutlined
} from '@ant-design/icons';
import { locationApi } from '../../../App/APIComponent/Address';
import api from '../../../api/api';
import PDFEdit from '../SignContract/Components/PDF/PDFEdit/PDFEditMain';
import { createAccountApi } from '../../../App/EVMAdmin/DealerContract/CreateDealerContract';
import { PDFUpdateService } from '../../../App/Home/PDFconfig/PDFUpdate';
import EVMStaffLayout from '../../../Components/EVMStaff/EVMStaffLayout';

// New Components
import DealerForm from './Components/DealerForm';
import ContractActions from './Components/ContractActions';

const { Title, Text } = Typography;

const CreateContract = () => {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Contract states
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [waitingProcessData, setWaitingProcessData] = useState(null);

  // Workflow states - mới thêm
  const [updatingContract, setUpdatingContract] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [contractConfirmed, setContractConfirmed] = useState(false);

  // Lưu thông tin vị trí ký từ API response
  const [positionA, setPositionA] = useState(null);
  const [positionB, setPositionB] = useState(null);
  const [pageSign, setPageSign] = useState(null);
  const [originalPositionA, setOriginalPositionA] = useState(null);
  const [originalPositionB, setOriginalPositionB] = useState(null);
  const [originalPageSign, setOriginalPageSign] = useState(null);

  // PDF preview states
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // PDF Template Edit states
  const [showTemplateEdit, setShowTemplateEdit] = useState(false);

  // Lock / Edit flow
  const [isLock, setIsLock] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [updatingEdit, setUpdatingEdit] = useState(false);

  const contractResultRef = useRef(null);
  
  // Initialize services
  const pdfUpdateService = PDFUpdateService();

  // Load PDF preview từ API /EContract/preview
  const loadPdfPreview = React.useCallback(async (downloadUrl) => {
    if (!downloadUrl) return null;
    
    setLoadingPdf(true);
    try {
      // Extract token từ downloadUrl
      const tokenMatch = downloadUrl;
      const token = tokenMatch ? tokenMatch : null;
      if (!token) {
        message.warning('Không tìm thấy url trong response api');
        return null;
      }
      // Gọi API qua backend proxy thay vì fetch trực tiếp
      const response = await api.get(`/EContract/preview`, {
      params: { downloadUrl },        // cách này sạch hơn so với nối string
      responseType: 'blob'
    });
      
      if (response.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        setPdfBlob(pdfBlob);
        setPdfBlobUrl(blobUrl);
        return blobUrl;
      }
    } catch (error) {
      console.log('Lỗi API preview, sử dụng link gốc:', error.message);
  
      return null;
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  // Build a display URL for PDF (ưu tiên blob URL, không thì dùng trực tiếp contractLink)
  const getPdfDisplayUrl = () => {
    // Ưu tiên blob URL từ preview API (không CORS)
    if (pdfBlobUrl) {
      return pdfBlobUrl;
    }
    
    // KHÔNG dùng trực tiếp downloadUrl vì sẽ gây CORS
    // Thay vào đó, hiển thị thông báo cho user
    return null;
  };

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await locationApi.getProvinces();

        // Đảm bảo data là array trước khi set
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.warn('Provinces data is not an array:', data);
          setProvinces([]);
          message.warning('Dữ liệu tỉnh/thành phố không hợp lệ');
        }
      } catch (error) {
        message.error('Không thể tải danh sách tỉnh/thành phố');
        console.error('Error loading provinces:', error);
        setProvinces([]); // Đảm bảo set array rỗng khi có lỗi
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load wards when province changes - GỌI API backend với fallback
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      form.setFieldsValue({ ward: undefined });
      return;
    }

    try {
      setLoadingWards(true);
      // Gọi API backend để lấy wards/districts theo provinceCode (có fallback)
      const wardsList = await locationApi.getWardsByProvinceCode(provinceCode);

      if (Array.isArray(wardsList)) {
        setWards(wardsList);
      } else {
        console.warn('Wards/districts data is not an array:', wardsList);
        setWards([]);
        message.warning('Dữ liệu phường/xã/quận/huyện không hợp lệ');
      }

      form.setFieldsValue({ ward: undefined });
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã/quận/huyện');
      console.error('Error loading wards/districts:', error);
      setWards([]); // Đảm bảo set array rỗng khi có lỗi
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Combine address with province and ward information
      const provinceCode = values.province;
      const wardCode = values.ward;
      let fullAddress = values.address || '';

      // Sử dụng helper functions để lấy tên
      const provinceName = locationApi.getProvinceNameByCode(provinces, provinceCode);
      const wardName = locationApi.getWardNameByCode(wards, wardCode);

      if (wardName && provinceName) {
        fullAddress = `${fullAddress}, ${wardName}, ${provinceName}`.trim().replace(/^,\s+/, '');
      } else {
        console.error('Không thể tìm thấy thông tin phường/xã hoặc tỉnh/thành phố');
      }

      // Chuẩn bị dữ liệu theo schema API mới
      const dealerData = {
        dealerName: values.brandName,
        dealerAddress: fullAddress,
        taxNo: values.taxNo,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        dealerLevel: values.dealerLevel,
        fullNameManager: values.representativeName,
        emailManager: values.email,
        phoneNumberManager: values.phone,
        // ✅ Thêm province và ward vào validation data
        province: values.province,
        ward: values.ward
      };

      // Validate form data (bao gồm province và ward)
      const validation = createAccountApi.validateFormData(dealerData);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setLoading(false);
        return;
      }

      const response = await createAccountApi.createDealerContract(dealerData);

      if (response?.isSuccess) {
        const contractData = response.result?.data;
        
        if (contractData) {
          setContractId(contractData.id);
          setContractLink(contractData.downloadUrl);
          setContractNo(contractData.no);
          
          // Lưu vị trí gốc
          setOriginalPositionA(contractData.positionA);
          setOriginalPositionB(contractData.positionB);
          setOriginalPageSign(contractData.pageSign);
          
          // Set current positions
          setPositionA(contractData.positionA);
          setPositionB(contractData.positionB);
          setPageSign(contractData.pageSign);
          
          await loadPdfPreview(contractData.downloadUrl);

          // Lưu dữ liệu gốc + khóa form
          setOriginalFormData(values);
          setIsLock(true);
          setIsEditing(false);

          setTimeout(() => {
            contractResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
          
          message.success('Hợp đồng đã được tạo thành công!');
        }
      } else {
          const errorMsg = response?.message || response?.data?.message || 'Có lỗi khi tạo hợp đồng';
          message.error(errorMsg);
          setContractLink(null);
          setContractNo(null);
        }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        message.error(errorData.message || 'Có lỗi khi tạo hợp đồng');
      } else {
        message.error('Có lỗi không mong muốn xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
  };

  // Handle update contract workflow - ✅ Cập nhật với thông tin mới từ API
  const handleUpdateContract = async (updateInfo) => {
    if (!contractId || !contractNo) return;
    
    setUpdatingContract(true);
    try {
      // ✅ Cập nhật positions mới từ API response
      if (updateInfo.positionA) {
        setPositionA(updateInfo.positionA);
      }
      if (updateInfo.positionB) {
        setPositionB(updateInfo.positionB);
      }
      if (updateInfo.pageSign) {
        setPageSign(updateInfo.pageSign);
      }
      
      // ✅ Cập nhật downloadUrl mới và gọi lại preview
      if (updateInfo.downloadUrl) {
        setContractLink(updateInfo.downloadUrl);
        await loadPdfPreview(updateInfo.downloadUrl);
      }
      
      message.success('Hợp đồng đã được cập nhật thành công');
      setShowTemplateEdit(false);
      
    } catch (error) {
      console.error('Update contract error:', error);
      message.error(error.message || 'Không thể cập nhật hợp đồng');
    } finally {
      setUpdatingContract(false);
    }
  };

  //handle start edit
  const handleStartEdit = () => {
    if (!contractId) return;
    setIsEditing(true);
  };

  //handle cancel edit
  const handleCancelEdit = () => {
    if (originalFormData) form.setFieldsValue(originalFormData);
    setIsEditing(false);
  };

  //xác nhận sửa hợp đồng
  const handleConfirmEdit = async () => {
    if (!contractId) {
      message.error('Không tìm thấy ID hợp đồng');
      return;
    }
    try {
      setUpdatingEdit(true);

      //xóa hợp đồng cũ
      const deleteResponse = await createAccountApi.deleteDealerContract(contractId);
      if(deleteResponse?.isSuccess === false){
        if(deleteResponse?.message) message.error(deleteResponse.message);
        else message.error('Xóa hợp đồng cũ thất bại');
        return;
      }

      //tạo hợp đồng mới
      const values = form.getFieldsValue(true);

      // Combine address with province and ward information
      const provinceName = locationApi.getProvinceNameByCode(provinces, values.province);
      const wardName = locationApi.getWardNameByCode(wards, values.ward);
      let fullAddress = values.address || '';
      if (wardName && provinceName) {
        fullAddress = `${fullAddress}, ${wardName}, ${provinceName}`.trim().replace(/^,\s+/, '');
      } 
      const dealerData = {
        dealerName: values.brandName,
        dealerAddress: fullAddress,
        taxNo: values.taxNo,
        bankAccount: values.bankAccount,
        bankName: values.bankName,
        dealerLevel: values.dealerLevel,
        fullNameManager: values.representativeName,
        emailManager: values.email,
        phoneNumberManager: values.phone,
        province: values.province,
        ward: values.ward
      };

      //validate form data
      const validation = createAccountApi.validateFormData(dealerData);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setUpdatingEdit(false);
        return;
      }

      //tạo lại hợp đồng
      const response = await createAccountApi.createDealerContract(dealerData);
      if (response?.isSuccess) {
        const contractData = response.result?.data;
        
        setContractId(contractData.id);
        setContractLink(contractData.downloadUrl);
        setContractNo(contractData.no);

        setOriginalFormData(form.getFieldsValue(true));
        setIsEditing(false);
        setIsLock(true);

        if(contractData?.downloadUrl){
          await loadPdfPreview(contractData.downloadUrl);
        }
        message.success('Hợp đồng đã được cập nhật thành công!');
      } else {
        message.error(response.data?.message || 'Có lỗi khi tạo hợp đồng mới');
      }
    } catch (error) {
        console.error("API Error:", error);

        // 🎯 BẮT LỖI TÊN ĐẠI LÝ TRÙNG (409)
        if (error.response?.status === 409 || error.response?.data?.message === "Dealer name is exist") {
          message.error("Tên Đại Lý đã tồn tại");
          form.setFields([
          {
            name: "brandName",
            errors: ["Tên đại lý đã tồn tại. Vui lòng chọn tên khác!"]
          }
        ]);

        setLoading(false);
        return;
        }
        

        // ❗ Lỗi khác từ BE
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Có lỗi không mong muốn xảy ra. Vui lòng liên hệ bộ phận hỗ trợ.");
        }
      } finally {
        setLoading(false);
      }

  };

  // Xác nhận hợp đồng
  const handleConfirmContract = async () => {
    if (!contractId) {
      message.error('Không tìm thấy ID hợp đồng');
      return;
    }
    
    modal.confirm({
      title: 'Xác nhận hợp đồng',
      content: 'Bạn có chắc chắn muốn xác nhận hợp đồng này? Sau khi xác nhận, hợp đồng sẽ được gửi đi xét duyệt.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          setConfirming(true);

          const EContractId = contractId;
          const response = await createAccountApi.confirmDealerContract(EContractId);

          if (response?.isSuccess) {
            setContractConfirmed(true);
            message.success(`Xác nhận hợp đồng thành công! Hợp đồng ${response.result?.data?.no || contractNo} đã sẵn sàng ký số.`);
            
            // Sau 3 giây tự động chuyển về tạo hợp đồng mới
            setTimeout(() => {
              resetFormDirect();
            }, 3000);
          } else {
            message.error(response.data?.message || 'Xác nhận hợp đồng thất bại');
          }
        } catch (error) {
          console.error('Confirm contract error:', error);
          message.error(error.response?.data?.message || error.message || 'Không thể xác nhận hợp đồng');
        } finally {
          setConfirming(false);
        }
      }
    });
  };

  // Download PDF - sử dụng blob data nếu có, không thì dùng contractLink
  const handleDownload = () => {
    if (pdfBlobUrl) {
      // Download từ blob URL (không CORS)
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `${`hop-dong-${contractNo}` || 'unknown'}.pdf`;
      link.click();
    } else if (contractLink) {
      // Mở trong tab mới thay vì download trực tiếp
      window.open(contractLink, '_blank');
      message.info('PDF đã được mở trong tab mới');
    } else {
      message.warning('Không có file PDF để tải xuống');
    }
  };

  // Reset form trực tiếp (không confirm)  
  const resetFormDirect = () => {
    form.resetFields();
    setContractLink(null);
    setContractNo(null);
    setContractId(null);
    setWaitingProcessData(null);
    setWards([]);
    
    // Reset PDF states
    setPdfBlob(null);
    setPdfBlobUrl(null);
    setLoadingPdf(false);
    
    // Reset workflow states
    setUpdatingContract(false);
    setShowTemplateEdit(false);
    setConfirming(false);
    setContractConfirmed(false);
    
    // Reset signing position states
    setPositionA(null);
    setPositionB(null);
    setPageSign(null);
    setOriginalPositionA(null);
    setOriginalPositionB(null);
    setOriginalPageSign(null);

    // Reset lock/edit states
    setIsLock(false);
    setIsEditing(false);
    setOriginalFormData(null);
    setUpdatingEdit(false);
    
    message.success('Đã tạo mới hợp đồng');
  };

  // Reset form with confirmation
  const resetForm = () => {
    modal.confirm({
      title: 'Làm mới biểu mẫu?',
      content: 'Thao tác này sẽ xóa dữ liệu đã nhập và bắt đầu hợp đồng mới.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: resetFormDirect
    });
  };

  const isFormDisabled = !!contractLink && !isEditing && isLock;

  return (
    <EVMStaffLayout>
      <div className="max-w-6xl mx-auto px-4">
        <Card 
          className="shadow-2xl rounded-2xl mb-8 overflow-hidden border-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            {/* Header với gradient background */}
            <div 
              className="text-center py-8 px-6 -mx-6 -mt-6 mb-4"
              style={{
                background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
                color: 'white'
              }}
            >
              <Title
                level={2}
                className="mb-3 flex items-center justify-center gap-3"
                style={{ color: 'black', margin: 0 }}
              >
                <UserAddOutlined className="text-3xl" />
                Tạo Hợp Đồng Đại Lý
              </Title>
              <Text className="text-lg opacity-90" style={{ color: 'black' }}>
                Quản lý và tạo hợp đồng cho các đại lý xe điện
              </Text>
            </div>


            {/* Form */}
            <DealerForm
              form={form}
              provinces={provinces}
              wards={wards}
              loadingProvinces={loadingProvinces}
              loadingWards={loadingWards}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              handleProvinceChange={handleProvinceChange}
              loading={loading}
              contractLink={contractLink}
              resetForm={resetForm}
              isLocked={isLock}
              isEditing={isEditing}
              disabledAll={isFormDisabled}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onConfirmEdit={handleConfirmEdit}
              updatingEdit={updatingEdit}
            />
            <div ref={contractResultRef}>
            <ContractActions
              contractLink={contractLink}
              contractNo={contractNo}
              contractConfirmed={contractConfirmed}
              confirming={confirming}
              loadingPdf={loadingPdf}
              getPdfDisplayUrl={getPdfDisplayUrl}
              onConfirm={handleConfirmContract}
              onEdit={() => setShowTemplateEdit(true)}
              onDownload={handleDownload}
              onReset={resetFormDirect}
            />
            </div>
          </Space>
        </Card>





        {/* Template Edit Modal - FIX: Thêm key để force re-render */}
        <App>
          <PDFEdit
            key={showTemplateEdit ? contractId : 'hidden'} // ✅ Force re-render mỗi lần mở
            visible={showTemplateEdit}
            onCancel={() => setShowTemplateEdit(false)}
            onSave={handleUpdateContract} // ✅ Sử dụng function mới
            contractId={contractId}
            contractNo={contractNo}
          />
        </App>
      </div>
    </EVMStaffLayout>
  );
};

export default CreateContract;