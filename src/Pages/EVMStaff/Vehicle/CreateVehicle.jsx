import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  App,
  Badge,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Spin,
  Tooltip,
  Empty,
  Image,
  Tag,
  Steps,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";
import VehicleTable from "./Components/VehicleTable";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

/** ---- Helpers: normalize API & extract error ---- */
const normalizeApi = (res) => ({
  success: res?.success ?? res?.isSuccess ?? false,
  data: res?.data ?? res?.result,
  message: res?.message ?? res?.error ?? "",
});
const extractErrorMessage = (err) => {
  const status = err?.response?.status;
  const serverMsg =
    err?.response?.data?.message || err?.response?.data?.error || err?.message;

  const errorsObj = err?.response?.data?.errors;
  if (errorsObj && typeof errorsObj === "object") {
    try {
      const parts = [];
      Object.keys(errorsObj).forEach((k) => {
        const v = errorsObj[k];
        if (Array.isArray(v)) parts.push(...v);
        else if (typeof v === "string") parts.push(v);
      });
      if (parts.length) return parts.join("\n");
    } catch { }
  }

  if (err?.code === "ECONNABORTED")
    return "Yêu cầu bị timeout. Vui lòng thử lại.";
  if (status === 400) return serverMsg || "Yêu cầu không hợp lệ (400).";
  if (status === 401) return "Chưa được xác thực (401).";
  if (status === 403) return "Không có quyền thực hiện (403).";
  if (status === 404) return "Không tìm thấy tài nguyên (404).";
  if (status === 500) return serverMsg || "Lỗi máy chủ (500).";
  return serverMsg || "Đã xảy ra lỗi không xác định.";
};

// ✅ Component TẠO XE ĐIỆN (có VIN)
function CreateElectricVehicle() {
  const { message } = App.useApp(); // ✅ Sử dụng message từ App.useApp()
  const [loading, setLoading] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [models, setModels] = useState([]); // ✅ Thêm state cho models
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Search keyword state
  const [searchKeyword, setSearchKeyword] = useState('');

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm(); // Form cho update
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); // Modal update
  const [updatingVehicle, setUpdatingVehicle] = useState(null); // Vehicle đang update
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);

  // Available colors cho version đã chọn
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null); // ✅ Thêm state cho selected model
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  // VIN List Management - ✅ Thêm state để quản lý danh sách VIN
  const [vinList, setVinList] = useState([]);
  const [currentVinInput, setCurrentVinInput] = useState('');
  const [bulkVinInput, setBulkVinInput] = useState(''); // ✅ State for bulk VIN input
  const [isBulkInputMode, setIsBulkInputMode] = useState(false); // ✅ Toggle between single/bulk mode

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Số xe mỗi trang

  useEffect(() => {
    loadAllVehicles();
    loadDropdownData();
  }, []);

  // ✅ Load tất cả VEHICLES (có VIN)
  const loadAllVehicles = async () => {
    try {
      setLoading(true);
      const result = await vehicleApi.getAllVehicles();

      if (result.isSuccess || result.success) {
        const vehiclesData = result.result || result.data || [];
        
        // ✅ Sắp xếp theo id giảm dần (mới nhất trước) để xe mới tạo hiển thị ở đầu
        const sortedVehicles = [...vehiclesData].sort((a, b) => {
          // Sắp xếp theo id giảm dần (id lớn hơn = mới hơn)
          // Hoặc theo createdAt nếu có
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          // Fallback: sắp xếp theo id giảm dần
          return (b.id || 0) - (a.id || 0);
        });
        
        setVehiclesList(sortedVehicles);

        if (sortedVehicles.length === 0) {
          message.info("Chưa có xe nào.");
        }
      } else {
        message.error("Không thể tải danh sách xe!");
        setVehiclesList([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      message.error("Lỗi khi tải danh sách xe!");
      setVehiclesList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      // ✅ Chỉ load models và colors, warehouses lúc đầu
      // Versions sẽ được load khi chọn model
      const [modelsRes, colorsRes, warehousesRes] = await Promise.all([
        vehicleApi.getAllModels(),
        vehicleApi.getAllColors(),
        vehicleApi.getAllWarehouses(),
      ]);

      if (modelsRes.success || modelsRes.isSuccess) {
        const modelsData = modelsRes.data || modelsRes.result || [];
        setModels(modelsData);
      }

      if (colorsRes.success || colorsRes.isSuccess) {
        setColors(colorsRes.data || colorsRes.result || []);
      }
      if (warehousesRes.success || warehousesRes.isSuccess) {
        setWarehouses(warehousesRes.data || warehousesRes.result || []);
      }
    } catch (err) {
      console.error("❌ Error loading dropdown data:", err);
      message.error("Lỗi khi tải dữ liệu dropdown!");
    }
  };

  // ✅ Load versions theo model đã chọn
  const loadVersionsByModelId = async (modelId) => {
    if (!modelId) {
      setVersions([]);
      return;
    }

    try {
      setLoadingTemplate(true);
      const result = await vehicleApi.getVersionByModelId(modelId);

      if (result.success || result.isSuccess) {
        const versionsData = result.data || result.result || [];
        setVersions(versionsData);

        if (versionsData.length === 0) {
          message.warning('Model này chưa có version nào!');
        } else {
          message.success(`Tìm thấy ${versionsData.length} version`);
        }
      } else {
        setVersions([]);
        message.error('Không thể tải danh sách version!');
      }
    } catch (err) {
      console.error('❌ Error loading versions by model:', err);
      setVersions([]);
      message.error('Lỗi khi tải danh sách version!');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Xử lý khi chọn model
  const handleModelChange = async (modelId) => {
    setSelectedModelId(modelId);
    setSelectedVersionId(null);
    setSelectedTemplate(null);
    setAvailableColors([]);

    // Reset các field phụ thuộc
    form.setFieldValue('versionId', undefined);
    form.setFieldValue('colorId', undefined);

    // Load versions cho model này
    await loadVersionsByModelId(modelId);
  };

  // ✅ Load available colors khi chọn version
  const loadAvailableColorsForVersion = async (versionId) => {
    if (!versionId) {
      setAvailableColors([]);
      return;
    }

    try {
      setLoadingTemplate(true);
      // Lấy tất cả colors và check template cho từng color
      const validColors = [];

      for (const color of colors) {
        try {
          const result = await vehicleApi.getTemplateByVersionAndColor(versionId, color.id);

          // API có thể trả về array hoặc single object
          let hasTemplate = false;
          if (result.success || result.isSuccess) {
            const data = result.data || result.result;
            if (Array.isArray(data) && data.length > 0) {
              hasTemplate = true;
            } else if (data && !Array.isArray(data)) {
              hasTemplate = true;
            }
          }

          if (hasTemplate) {
            validColors.push(color);
          }
        } catch (err) {
          // Color này không có template - skip
          console.log(`Color ${color.colorName || color.name} không có template cho version này`);
        }
      }

      setAvailableColors(validColors);

      if (validColors.length === 0) {
        message.warning('Version này chưa có màu nào khả dụng!');
      } else {
        message.success(`Tìm thấy ${validColors.length} màu khả dụng`);
      }
    } catch (err) {
      console.error('Error loading available colors:', err);
      setAvailableColors([]);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Tìm template khi chọn version và color
  const handleVersionChange = async (versionId) => {
    setSelectedVersionId(versionId);
    setSelectedTemplate(null);
    form.setFieldValue('colorId', undefined); // Reset color
    await loadAvailableColorsForVersion(versionId);
  };

  const handleVersionOrColorChange = async () => {
    const versionId = form.getFieldValue('versionId');
    const colorId = form.getFieldValue('colorId');

    console.log("🔍 Looking for template with:", { versionId, colorId });

    if (!versionId || !colorId) {
      setSelectedTemplate(null);
      console.log("⚠️ Missing versionId or colorId");
      return;
    }

    try {
      setLoadingTemplate(true);
      message.loading('Đang tìm template...', 0);

      console.log("📡 Calling API: getTemplateByVersionAndColor");
      const result = await vehicleApi.getTemplateByVersionAndColor(versionId, colorId);
      console.log("📥 API Response:", result);

      message.destroy();

      if ((result.isSuccess || result.success) && (result.result || result.data)) {
        // API trả về array, lấy phần tử đầu tiên
        let templateData = result.result || result.data;

        // Nếu là array, lấy phần tử đầu tiên
        if (Array.isArray(templateData) && templateData.length > 0) {
          templateData = templateData[0];
          console.log("✅ Template found (from array):", templateData);
        } else if (!Array.isArray(templateData)) {
          console.log("✅ Template found (single object):", templateData);
        } else {
          console.warn("⚠️ Empty array in response");
          setSelectedTemplate(null);
          message.warning('⚠️ Không tìm thấy template. Vui lòng tạo template trước!');
          return;
        }

        console.log("📌 Template ID:", templateData.id);

        setSelectedTemplate(templateData);
        message.success(`✅ Đã tìm thấy template! ID: ${templateData.id}`);
      } else {
        console.warn("⚠️ No template found in response:", result);
        setSelectedTemplate(null);
        message.warning('⚠️ Không tìm thấy template. Vui lòng tạo template trước!');
      }
    } catch (error) {
      console.error('❌ Error getting template:', error);
      console.error('❌ Error response:', error.response?.data);
      message.error('Lỗi khi tìm template!');
      setSelectedTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Columns cho bảng VEHICLES 

  const handleCreateModal = () => {
    form.resetFields();
    setSelectedTemplate(null);
    setSelectedModelId(null); // ✅ Reset model selection
    setSelectedVersionId(null);
    setAvailableColors([]);
    setVersions([]); // ✅ Reset versions list
    setVinList([]); // ✅ Reset VIN list
    setCurrentVinInput(''); // ✅ Reset current VIN input
    setBulkVinInput(''); // ✅ Reset bulk VIN input
    setIsBulkInputMode(false); // ✅ Reset to single input mode
    setIsCreateModalVisible(true);
  };

  // ✅ Thêm VIN vào danh sách
  const handleAddVin = async () => {
    const vinValue = currentVinInput.trim().toUpperCase();

    // Validate format VIN
    if (!vinValue) {
      message.warning('Vui lòng nhập VIN!');
      return;
    }

    if (!/^VIN\d{10}$/.test(vinValue)) {
      message.error('VIN phải có format: VIN + 10 số (VD: VIN1234567890)');
      return;
    }

    // Check duplicate trong list hiện tại
    if (vinList.includes(vinValue)) {
      message.warning('VIN này đã có trong danh sách!');
      return;
    }

    // ✅ Kiểm tra VIN đã tồn tại trong database bằng cách gọi API
    try {
      const loadingMsg = message.loading('Đang kiểm tra VIN...', 0);
      
      // Gọi API để lấy danh sách vehicles mới nhất
      const latestVehiclesResult = await vehicleApi.getAllVehicles();
      const latestVehiclesList = latestVehiclesResult.isSuccess || latestVehiclesResult.success
        ? (latestVehiclesResult.result || latestVehiclesResult.data || [])
        : [];

      message.destroy(loadingMsg);

      // Kiểm tra VIN có tồn tại trong database không
      const vinExists = latestVehiclesList.some(v => v.vin === vinValue);
      
      if (vinExists) {
        message.error(`VIN ${vinValue} đã tồn tại trong hệ thống! Vui lòng nhập VIN khác.`);
        return;
      }

      // Thêm VIN vào list
      setVinList([...vinList, vinValue]);
      setCurrentVinInput('');
      message.success(`✅ Đã thêm VIN: ${vinValue}`);
    } catch (error) {
      console.error('❌ Error checking VIN:', error);
      message.error('Lỗi khi kiểm tra VIN. Vui lòng thử lại!');
    }
  };

  // ✅ Xóa VIN khỏi danh sách
  const handleRemoveVin = (vinToRemove) => {
    setVinList(vinList.filter(vin => vin !== vinToRemove));
    message.info(`Đã xóa VIN: ${vinToRemove}`);
  };

  // ✅ Xóa tất cả VIN
  const handleClearAllVins = () => {
    setVinList([]);
    setCurrentVinInput('');
    setBulkVinInput('');
    message.info('Đã xóa tất cả VIN');
  };

  // ✅ Xử lý onChange cho bulk VIN input - Format và validate từng dòng
  const handleBulkVinInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    
    // Tách thành các dòng
    const lines = inputValue.split('\n');
    
    // Format từng dòng: chỉ cho phép VIN + tối đa 10 số
    const formattedLines = lines.map(line => {
      // Loại bỏ khoảng trắng và ký tự đặc biệt (giữ lại VIN và số)
      let cleaned = line.replace(/[^VIN\d]/g, '');
      
      // Nếu bắt đầu bằng VIN
      if (cleaned.startsWith('VIN')) {
        // Lấy phần sau VIN (chỉ số)
        const numbers = cleaned.substring(3).replace(/\D/g, '');
        // Giới hạn tối đa 10 số
        const limitedNumbers = numbers.substring(0, 10);
        return 'VIN' + limitedNumbers;
      } else if (cleaned.startsWith('V')) {
        // Nếu chỉ có V, thêm IN
        const numbers = cleaned.substring(1).replace(/\D/g, '');
        const limitedNumbers = numbers.substring(0, 10);
        return 'VIN' + limitedNumbers;
      } else if (cleaned.startsWith('VI')) {
        // Nếu có VI, thêm N
        const numbers = cleaned.substring(2).replace(/\D/g, '');
        const limitedNumbers = numbers.substring(0, 10);
        return 'VIN' + limitedNumbers;
      } else {
        // Nếu không có VIN ở đầu, chỉ lấy số và giới hạn 10 số
        const numbers = cleaned.replace(/\D/g, '');
        const limitedNumbers = numbers.substring(0, 10);
        return limitedNumbers.length > 0 ? 'VIN' + limitedNumbers : '';
      }
    });
    
    // Ghép lại thành chuỗi với xuống dòng
    const formattedValue = formattedLines.join('\n');
    setBulkVinInput(formattedValue);
  };

  // ✅ Thêm nhiều VIN cùng lúc (bulk add)
  const handleBulkAddVins = () => {
    const inputText = bulkVinInput.trim();

    if (!inputText) {
      message.warning('Vui lòng nhập danh sách VIN!');
      return;
    }

    // Tách VIN theo dấu xuống dòng, dấu phẩy, hoặc khoảng trắng
    const vinsArray = inputText
      .split(/[\n,\s]+/) // Split by newline, comma, or space
      .map(vin => vin.trim().toUpperCase())
      .filter(vin => vin.length > 0); // Remove empty strings

    if (vinsArray.length === 0) {
      message.warning('Không tìm thấy VIN hợp lệ!');
      return;
    }

    // Validate và filter VINs
    const validVins = [];
    const invalidVins = [];
    const duplicateVins = [];
    const existingVins = [];

    vinsArray.forEach(vin => {
      // Check format
      if (!/^VIN\d{10}$/.test(vin)) {
        invalidVins.push(vin);
        return;
      }

      // Check duplicate in current list
      if (vinList.includes(vin)) {
        duplicateVins.push(vin);
        return;
      }

      // Check duplicate in newly added list
      if (validVins.includes(vin)) {
        duplicateVins.push(vin);
        return;
      }

      // Check existing in database
      if (vehiclesList.some(v => v.vin === vin)) {
        existingVins.push(vin);
        return;
      }

      validVins.push(vin);
    });

    // Add valid VINs to list
    if (validVins.length > 0) {
      setVinList([...vinList, ...validVins]);
      setBulkVinInput('');

      let successMsg = `✅ Đã thêm ${validVins.length} VIN`;

      // Show warnings for invalid/duplicate VINs
      if (invalidVins.length > 0) {
        successMsg += `\n⚠️ ${invalidVins.length} VIN không đúng format`;
      }
      if (duplicateVins.length > 0) {
        successMsg += `\n⚠️ ${duplicateVins.length} VIN trùng lặp`;
      }
      if (existingVins.length > 0) {
        successMsg += `\n❌ ${existingVins.length} VIN đã tồn tại trong hệ thống`;
      }

      message.success(successMsg, 5);
    } else {
      // No valid VINs
      let errorMsg = '❌ Không có VIN hợp lệ nào được thêm!\n';

      if (invalidVins.length > 0) {
        errorMsg += `\n⚠️ ${invalidVins.length} VIN không đúng format (phải là VIN + 10 số)`;
      }
      if (duplicateVins.length > 0) {
        errorMsg += `\n⚠️ ${duplicateVins.length} VIN bị trùng lặp`;
      }
      if (existingVins.length > 0) {
        errorMsg += `\n❌ ${existingVins.length} VIN đã tồn tại trong hệ thống`;
      }

      message.error(errorMsg, 6);
    }
  };

  // ✅ Handle tạo vehicle
  const handleCreateVehicle = async (values) => {
    console.log("🚗 handleCreateVehicle called with values:", values);
    console.log("📋 Current selectedTemplate:", selectedTemplate);
    console.log("📋 Current vinList:", vinList);

    // Validation: Template phải được chọn
    if (!selectedTemplate || !selectedTemplate.id) {
      console.error("❌ No template selected!");
      message.error('❌ Chưa chọn template! Vui lòng chọn Version và Color trước.');
      return;
    }

    // Validation: VIN list phải có ít nhất 1 VIN
    if (!vinList || vinList.length === 0) {
      console.error("❌ VIN list is empty!");
      message.error('❌ Vui lòng thêm ít nhất 1 VIN vào danh sách!');
      return;
    }

    // Validation: Warehouse phải được chọn
    if (!values.warehouseId) {
      console.error("❌ Warehouse not selected!");
      message.error('❌ Vui lòng chọn kho!');
      return;
    }

    // ✅ Validation: Kiểm tra VIN trùng lặp với database TRƯỚC KHI submit
    try {
      setLoading(true);
      const loadingMessage = message.loading('Đang kiểm tra VIN...', 0);

      // Reload lại danh sách vehicles để có dữ liệu mới nhất
      const latestVehiclesResult = await vehicleApi.getAllVehicles();
      const latestVehiclesList = latestVehiclesResult.isSuccess || latestVehiclesResult.success
        ? (latestVehiclesResult.result || latestVehiclesResult.data || [])
        : [];

      message.destroy(loadingMessage);

      // Kiểm tra từng VIN trong vinList có trùng với database không
      const duplicateVins = [];
      vinList.forEach(vin => {
        if (latestVehiclesList.some(v => v.vin === vin)) {
          duplicateVins.push(vin);
        }
      });

      if (duplicateVins.length > 0) {
        console.error("❌ Found duplicate VINs:", duplicateVins);
        message.error(
          `❌ Có ${duplicateVins.length} VIN đã tồn tại trong hệ thống:\n${duplicateVins.slice(0, 5).join(', ')}${duplicateVins.length > 5 ? '...' : ''}\nVui lòng xóa các VIN trùng lặp và thử lại!`,
          8
        );
        setLoading(false);
        return;
      }

      console.log("✅ VIN validation passed - no duplicates found!");
    } catch (validationError) {
      console.error("❌ Error validating VINs:", validationError);
      message.destroy();
      message.error('Lỗi khi kiểm tra VIN. Vui lòng thử lại!');
      setLoading(false);
      return;
    }

    console.log("✅ All validations passed!");
    console.log("✅ Template ID:", selectedTemplate.id);
    console.log("✅ VIN List:", vinList);
    console.log("✅ Number of vehicles to create:", vinList.length);
    console.log("✅ Warehouse ID:", values.warehouseId);

    // Tiếp tục với việc tạo vehicle
    try {
      // ✅ Format dates to ISO 8601 with timezone
      const formatDateToISO = (dateString) => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          return date.toISOString(); // ✅ Format: 2025-10-25T06:11:24.201Z
        } catch (err) {
          console.error("❌ Date format error:", err);
          return null;
        }
      };

      // ✅ Payload theo đúng Swagger API schema - Sử dụng vinList từ state
      const vehiclePayload = {
        electricVehicleTemplateId: selectedTemplate.id,
        warehouseId: values.warehouseId,
        vinList: vinList, // ✅ Array of VINs từ state
        status: values.status || 1,
        manufactureDate: formatDateToISO(values.manufactureDate), // ✅ ISO 8601
        importDate: formatDateToISO(values.importDate), // ✅ ISO 8601
        warrantyExpiryDate: formatDateToISO(values.warrantyExpiryDate), // ✅ ISO 8601
      };

      console.log("📦 Vehicle payload prepared (đúng schema):", vehiclePayload);
      console.log("🔑 Template ID in payload:", vehiclePayload.electricVehicleTemplateId);
      console.log("🏢 Warehouse ID in payload:", vehiclePayload.warehouseId);
      console.log("🚗 VIN List in payload:", vehiclePayload.vinList);
      console.log("📊 Total vehicles to create:", vehiclePayload.vinList.length);

      // ✅ Gọi API tạo xe ngay lập tức
      const res = await vehicleApi.createVehicle(vehiclePayload);
      console.log("📥 Create vehicle response:", res);

      const normalized = normalizeApi(res);
      console.log("📊 Normalized response:", normalized);

      if (normalized.success) {
        message.success(normalized.message || `🎉 Tạo thành công ${vinList.length} xe!`);
        setIsCreateModalVisible(false); // ✅ Đóng create modal
        form.resetFields();
        setSelectedTemplate(null);
        setSelectedModelId(null); // ✅ Reset model selection
        setSelectedVersionId(null);
        setAvailableColors([]);
        setVersions([]); // ✅ Reset versions list
        setVinList([]); // ✅ Reset VIN list
        setCurrentVinInput(''); // ✅ Reset current VIN input
        
        // ✅ Reset về trang đầu tiên TRƯỚC KHI load lại danh sách
        setCurrentPage(1);
        
        // ✅ Load lại danh sách (đã được sắp xếp theo mới nhất)
        await loadAllVehicles();

        // ✅ Scroll to top sau khi danh sách đã được load và render
        // Sử dụng setTimeout để đảm bảo DOM đã render xong
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // ✅ Scroll đến phần danh sách xe nếu có
          const vehicleListElement = document.querySelector('.ant-table-wrapper');
          if (vehicleListElement) {
            vehicleListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);

        console.log("✅ Vehicle created successfully, scrolled to top");
      } else {
        console.error("❌ Create failed:", normalized.message);
        message.error(normalized.message || "Không thể tạo xe");
      }
    } catch (error) {
      console.error("❌ Error creating vehicle:", error);
      console.error("❌ Error response:", error.response?.data);
      message.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirm và submit vehicle
  const confirmCreateVehicle = async () => {
    console.log("✅ confirmCreateVehicle called");
    console.log("📦 Vehicle data:", vehicleData);

    try {
      setLoading(true);

      const { _displayInfo, ...apiPayload } = vehicleData;

      console.log("📤 API Payload (without _displayInfo):", apiPayload);
      console.log("🔑 Template ID in payload:", apiPayload.electricVehicleTemplateId);
      console.log("🏢 Warehouse ID in payload:", apiPayload.warehouseId);
      console.log("🚗 VIN List in payload:", apiPayload.vinList);

      const res = await vehicleApi.createVehicle(apiPayload);
      console.log("📥 Create vehicle response:", res);

      const normalized = normalizeApi(res);
      console.log("📊 Normalized response:", normalized);

      if (normalized.success) {
        message.success(normalized.message || "🎉 Tạo xe thành công!");
        setConfirmModalVisible(false); // ✅ Đóng confirm modal
        setIsCreateModalVisible(false); // ✅ Đóng create modal
        form.resetFields();
        setSelectedTemplate(null);
        setSelectedModelId(null); // ✅ Reset model selection
        setSelectedVersionId(null);
        setAvailableColors([]);
        setVersions([]); // ✅ Reset versions list
        await loadAllVehicles();
      } else {
        console.error("❌ Create failed:", normalized.message);
        setConfirmModalVisible(false); // ✅ Đóng confirm modal khi lỗi
        message.error(normalized.message || "Không thể tạo xe");
      }
    } catch (err) {
      console.error("❌ CREATE VEHICLE ERROR:", err);
      console.error("❌ Error response:", err.response?.data);
      setConfirmModalVisible(false); // ✅ Đóng confirm modal khi exception
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Update Vehicle
  const handleUpdateVehicle = async (values) => {
    if (!updatingVehicle) return;

    try {
      setLoading(true);
      console.log("🔄 Updating vehicle:", updatingVehicle.id);
      console.log("📝 Update values:", values);

      // Convert datetime-local format to ISO 8601 with timezone
      const formatDateForApi = (dateString) => {
        if (!dateString) return null;
        // datetime-local format: "2025-10-15T15:16"
        // Convert to ISO: "2025-10-15T15:16:00.000Z"
        return new Date(dateString).toISOString();
      };

      const updatePayload = {
        vin: updatingVehicle.vin,
        status: values.status,
        manufactureDate: updatingVehicle.manufactureDate,
        importDate: formatDateForApi(values.importDate),
        warrantyExpiryDate: formatDateForApi(values.warrantyExpiryDate),
        deliveryDate: formatDateForApi(values.deliveryDate),
        dealerReceivedDate: formatDateForApi(values.dealerReceivedDate),
      };

      console.log("📤 Update payload:", updatePayload);

      const res = await vehicleApi.updateVehicle(updatingVehicle.id, updatePayload);
      console.log("📥 Update response:", res);

      const normalized = normalizeApi(res);

      if (normalized.success) {
        message.success("✅ Cập nhật xe thành công!");
        setIsUpdateModalVisible(false);
        updateForm.resetFields();
        setUpdatingVehicle(null);
        await loadAllVehicles();

        // ✅ KHÔNG scroll và KHÔNG đổi trang - giữ nguyên vị trí hiện tại
        console.log("✅ Vehicle updated successfully, keeping current position");
      } else {
        message.error(normalized.message || "Không thể cập nhật xe");
      }
    } catch (err) {
      console.error("❌ UPDATE VEHICLE ERROR:", err);
      console.error("❌ Error response:", err.response?.data);
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <EVMStaffLayout>
      <div className="w-full -m-4 md:-m-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-4 md:px-6 pt-4 md:pt-6 bg-white">
          <div>
            <Title level={4} className="m-0">
              <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              🚗 Tạo & Quản lý Xe Điện
            </Title>
            <Text type="secondary">Quản lý các xe điện cụ thể (có VIN)</Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadAllVehicles}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateModal}
              size="large"
            >
              Tạo Xe Mới
            </Button>
          </Space>
        </div>

        <div className="w-full px-4 md:px-6 pb-4 md:pb-6 bg-white">
          <VehicleTable
            vehiclesList={vehiclesList}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onEdit={(vehicle) => {
              setUpdatingVehicle(vehicle);
              updateForm.setFieldsValue({
                status: vehicle.status,
                importDate: vehicle.importDate
                  ? vehicle.importDate.split("T")[0]
                  : null,
                warrantyExpiryDate: vehicle.warrantyExpiryDate
                  ? vehicle.warrantyExpiryDate.split("T")[0]
                  : null,
                deliveryDate: vehicle.deliveryDate
                  ? vehicle.deliveryDate.split("T")[0]
                  : null,
                dealerReceivedDate: vehicle.dealerReceivedDate
                  ? vehicle.dealerReceivedDate.split("T")[0]
                  : null,
              });
              setIsUpdateModalVisible(true);
            }}
            onView={(vehicle) => {
              setSelectedVehicle(vehicle);
              setIsViewModalVisible(true);
            }}
          />
        </div>

        {/* Modal tạo xe */}
        <Modal
          open={isCreateModalVisible}
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CarOutlined className="text-white text-lg" />
              </div>
              <div>
                <Typography.Title level={4} className="m-0">Tạo xe điện mới</Typography.Title>
                <Typography.Text type="secondary" className="text-xs">Nhập thông tin để tạo xe điện với VIN</Typography.Text>
              </div>
            </div>
          }
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={1000}
          destroyOnClose
          className="create-vehicle-modal"
          styles={{
            body: {
              padding: '24px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateVehicle}
            onFinishFailed={(errorInfo) => {
              console.error("❌ Form validation failed:", errorInfo);
              message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            }}
            preserve
          >
            {/* Steps Indicator */}
            <Steps
              current={selectedTemplate ? 1 : 0}
              items={[
                {
                  title: 'Chọn Template',
                  description: 'Model → Version → Color',
                  icon: <FileTextOutlined />,
                },
                {
                  title: 'Nhập thông tin',
                  description: 'VIN và thông tin xe',
                  icon: <ShoppingCartOutlined />,
                },
              ]}
              className="mb-6"
            />

            {/* Step 1: Template Selection */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileTextOutlined className="text-blue-600" />
                  </div>
                  <span className="text-base font-semibold">Bước 1: Chọn Template</span>
                </div>
              }
              className="mb-4 shadow-sm"
              headStyle={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderBottom: '2px solid #0ea5e9' }}
            >

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Chọn Model (Mẫu xe)"
                  name="modelId"
                  rules={[{ required: true, message: "Vui lòng chọn model!" }]}
                  tooltip="Chọn model trước để lọc các version phù hợp"
                >
                  <Select
                    placeholder={models.length === 0 ? "Đang tải models..." : "Chọn model xe..."}
                    showSearch
                    onChange={handleModelChange}
                    optionFilterProp="children"
                    size="large"
                    loading={models.length === 0 && loading}
                    notFoundContent={
                      <Empty
                        description="Không có model nào"
                      />
                    }
                  >
                    {models.map((model) => {
                      const modelName = model.name || model.modelName || 'N/A';

                      return (
                        <Option key={model.id} value={model.id}>
                          {modelName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Chọn Version (Phiên bản)"
                  name="versionId"
                  rules={[{ required: true, message: "Vui lòng chọn version!" }]}
                  tooltip={!selectedModelId ? "Vui lòng chọn model trước" : "Chọn version của model"}
                >
                  <Select
                    placeholder={
                      !selectedModelId
                        ? "Vui lòng chọn model trước..."
                        : loadingTemplate
                          ? "Đang tải versions..."
                          : "Chọn version..."
                    }
                    showSearch
                    onChange={handleVersionChange}
                    optionFilterProp="children"
                    disabled={!selectedModelId}
                    loading={loadingTemplate && selectedModelId && versions.length === 0}
                    notFoundContent={
                      <Empty
                        description={
                          !selectedModelId
                            ? "Vui lòng chọn model trước"
                            : "Model này chưa có version"
                        }
                      />
                    }
                  >
                    {versions.map((version) => {
                      // ✅ Lấy đúng tên version từ API response
                      const versionName = version.versionName || version.name || 'N/A';

                      return (
                        <Option key={version.id} value={version.id}>
                          {versionName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Chọn Màu sắc"
                  name="colorId"
                  rules={[{ required: true, message: "Vui lòng chọn màu!" }]}
                  tooltip={availableColors.length === 0 ? "Vui lòng chọn version trước" : "Chỉ hiển thị màu có template"}
                >
                  <Select
                    placeholder={availableColors.length === 0 ? "Vui lòng chọn version trước..." : "Chọn màu khả dụng..."}
                    showSearch
                    disabled={availableColors.length === 0}
                    onChange={handleVersionOrColorChange}
                    notFoundContent={<Empty description="Không có màu khả dụng" />}
                  >
                    {availableColors.map((color) => {
                      const colorName = color.name || color.colorName || 'N/A';
                      const hexCode = color.hexCode || color.colorCode || '#ccc';

                      return (
                        <Option key={color.id} value={color.id}>
                          <Space>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                background: hexCode,
                                borderRadius: "50%",
                                border: "1px solid #d9d9d9",
                                display: "inline-block",
                              }}
                            />
                            {colorName}
                          </Space>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {loadingTemplate && (
              <Alert
                message="Đang tìm template..."
                type="info"
                showIcon
                icon={<Spin size="small" />}
                className="mb-4"
              />
            )}

            {selectedTemplate && (
              <Card
                className="mb-4 border-2 border-green-300 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  {selectedTemplate.imgUrl && Array.isArray(selectedTemplate.imgUrl) && selectedTemplate.imgUrl.length > 0 && (
                    <div className="flex-shrink-0">
                      <Image
                        src={selectedTemplate.imgUrl[0]}
                        alt="Template"
                        width={120}
                        height={120}
                        className="rounded-lg object-cover border-2 border-white shadow-md"
                        preview={{
                          mask: 'Xem ảnh',
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-300">
                      <CheckCircleOutlined className="text-green-600 text-lg" />
                      <Text strong className="text-base">Template đã chọn</Text>
                      <Tag color="success" className="ml-auto">
                        <Text code copyable className="text-xs font-mono bg-white px-2 py-1 rounded">
                          {selectedTemplate.id}
                        </Text>
                      </Tag>
                    </div>

                    {/* Info Grid */}
                    <Row gutter={[16, 12]}>
                      <Col span={12}>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <Text type="secondary" className="text-xs block mb-1">Version</Text>
                          <Text strong className="text-base text-blue-600">
                            {selectedTemplate.version?.versionName || 'N/A'}
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <Text type="secondary" className="text-xs block mb-1">Model</Text>
                          <Text strong className="text-base">
                            {selectedTemplate.version?.modelName || 'N/A'}
                          </Text>
                        </div>
                      </Col>
                      {selectedTemplate.description && (
                        <Col span={24}>
                          <div className="bg-white/60 p-3 rounded-lg">
                            <Text type="secondary" className="text-xs block mb-1">Mô tả</Text>
                            <Text className="text-sm">{selectedTemplate.description}</Text>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                </div>
              </Card>
            )}
            </Card>

            {/* Step 2: Vehicle Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCartOutlined className="text-green-600" />
                  </div>
                  <span className="text-base font-semibold">Bước 2: Nhập thông tin xe</span>
                </div>
              }
              className="mb-4 shadow-sm"
              headStyle={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderBottom: '2px solid #22c55e' }}
            >
            {/* VIN List Input Section */}
            <Row gutter={16}>
              <Col span={24}>
                <Card
                  size="small"
                  className="mb-4"
                  title={
                    <div className="flex items-center gap-2">
                      <CarOutlined className="text-blue-600" />
                      <Text strong className="text-base">Danh sách VIN</Text>
                    </div>
                  }
                  extra={
                    <Radio.Group
                      value={isBulkInputMode}
                      onChange={(e) => setIsBulkInputMode(e.target.value)}
                      size="small"
                      buttonStyle="solid"
                    >
                      <Radio.Button value={false}>
                        <PlusOutlined className="mr-1" />
                        Nhập từng VIN
                      </Radio.Button>
                      <Radio.Button value={true}>
                        <FileTextOutlined className="mr-1" />
                        Nhập hàng loạt
                      </Radio.Button>
                    </Radio.Group>
                  }
                >

                  {/* Single VIN Input Mode */}
                  {!isBulkInputMode && (
                    <Space.Compact style={{ width: '100%' }} className="mb-3">
                      <Input
                        placeholder="Nhập VIN (VD: VIN1234567890)"
                        value={currentVinInput}
                        onChange={(e) => setCurrentVinInput(e.target.value.toUpperCase())}
                        onPressEnter={handleAddVin}
                        maxLength={13}
                        style={{ textTransform: 'uppercase' }}
                        prefix={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
                      />
                      <Button type="primary" onClick={handleAddVin} icon={<PlusOutlined />}>
                        Thêm VIN
                      </Button>
                    </Space.Compact>
                  )}

                  {/* Bulk VIN Input Mode */}
                  {isBulkInputMode && (
                    <div className="mb-3">
                      <Input.TextArea
                        placeholder="Nhập nhiều VIN, mỗi VIN một dòng hoặc cách nhau bởi dấu phẩy&#10;VD:&#10;VIN1234567890&#10;VIN0987654321&#10;VIN1111111111"
                        value={bulkVinInput}
                        onChange={handleBulkVinInputChange}
                        rows={8}
                        style={{ 
                          textTransform: 'uppercase', 
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          lineHeight: '1.8'
                        }}
                        showCount
                        maxLength={10000}
                      />
                      
                      {/* Real-time validation info */}
                      {bulkVinInput && (
                        <div className="mt-2 mb-2">
                          {(() => {
                            const lines = bulkVinInput.split('\n').filter(line => line.trim().length > 0);
                            const validLines = lines.filter(line => /^VIN\d{10}$/.test(line.trim()));
                            const invalidLines = lines.filter(line => !/^VIN\d{10}$/.test(line.trim()));
                            
                            return (
                              <div className="text-xs space-y-1">
                                {validLines.length > 0 && (
                                  <div className="text-green-600">
                                    ✅ {validLines.length} VIN hợp lệ: {validLines.slice(0, 3).join(', ')}{validLines.length > 3 ? '...' : ''}
                                  </div>
                                )}
                                {invalidLines.length > 0 && (
                                  <div className="text-red-600">
                                    ⚠️ {invalidLines.length} VIN không hợp lệ (phải là VIN + đúng 10 số): {invalidLines.slice(0, 3).join(', ')}{invalidLines.length > 3 ? '...' : ''}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      <Button
                        type="primary"
                        onClick={handleBulkAddVins}
                        icon={<PlusOutlined />}
                        className="mt-2 w-full"
                        size="large"
                      >
                        Thêm tất cả VIN
                      </Button>
                      <Alert
                        message="Hướng dẫn"
                        description={
                          <div>
                            <div className="mb-1">• Nhập mỗi VIN trên một dòng, hoặc cách nhau bằng dấu phẩy</div>
                            <div className="mb-1">• Format: <strong>VIN + đúng 10 chữ số</strong> (VD: VIN1234567890)</div>
                            <div className="text-red-600">• Hệ thống sẽ tự động giới hạn mỗi VIN chỉ có 10 số sau "VIN"</div>
                          </div>
                        }
                        type="info"
                        showIcon
                        className="mt-2"
                      />
                    </div>
                  )}

                  {/* VIN List Display */}
                  {vinList.length > 0 && (
                    <Card
                      className="mt-3"
                      size="small"
                      title={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge count={vinList.length} showZero color="#1890ff">
                              <Text strong className="text-base">Danh sách VIN đã thêm</Text>
                            </Badge>
                          </div>
                          <Button
                            size="small"
                            danger
                            onClick={handleClearAllVins}
                            icon={<DeleteOutlined />}
                          >
                            Xóa tất cả
                          </Button>
                        </div>
                      }
                    >
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {vinList.map((vin, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <Badge count={idx + 1} style={{ backgroundColor: '#1890ff' }} />
                              <Text code className="font-mono text-sm font-semibold text-blue-700">
                                {vin}
                              </Text>
                            </div>
                            <Button
                              size="small"
                              danger
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveVin(vin)}
                              className="hover:bg-red-100"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {vinList.length === 0 && (
                    <Alert
                      message="Chưa có VIN nào"
                      description="Vui lòng nhập và thêm ít nhất 1 VIN để tạo xe"
                      type="warning"
                      showIcon
                      className="mt-2"
                      icon={<InfoCircleOutlined />}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <SafetyOutlined className="text-blue-600" />
                      Chọn Kho
                    </span>
                  }
                  name="warehouseId"
                  rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                >
                  <Select 
                    placeholder="Chọn kho..." 
                    showSearch
                    size="large"
                    optionFilterProp="children"
                  >
                    {warehouses.map((warehouse) => (
                      <Option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name || warehouse.warehouseName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Card
                  className="h-full"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b'
                  }}
                >
                  <Statistic
                    title={
                      <span className="text-sm font-medium text-gray-700">
                        Số xe sẽ được tạo
                      </span>
                    }
                    value={vinList.length}
                    suffix="xe"
                    valueStyle={{ 
                      color: '#d97706',
                      fontSize: '32px',
                      fontWeight: 'bold'
                    }}
                    prefix={<CarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-green-600" />
                      Trạng thái
                    </span>
                  }
                  name="status"
                  initialValue={1}
                  rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                  tooltip="Trạng thái ban đầu của xe khi tạo mới"
                >
                  <Select placeholder="Chọn trạng thái..." size="large">
                    <Option value={1}><span className="mr-2">✅</span>Khả dụng</Option>
                    <Option value={2}><span className="mr-2">⏳</span>Đang chờ</Option>
                    <Option value={3}><span className="mr-2">📦</span>Đã đặt</Option>
                    <Option value={4}><span className="mr-2">🚚</span>Đang vận chuyển</Option>
                    <Option value={5}><span className="mr-2">💰</span>Đã bán</Option>
                    <Option value={6}><span className="mr-2">🏢</span>Tại đại lý</Option>
                    <Option value={7}><span className="mr-2">🔧</span>Bảo trì</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue-600" />
                      Ngày sản xuất
                    </span>
                  }
                  name="manufactureDate"
                  rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất!" }]}
                >
                  <Input 
                    type="date" 
                    placeholder="Chọn ngày sản xuất" 
                    size="large"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <CalendarOutlined className="text-green-600" />
                      Ngày nhập kho
                    </span>
                  }
                  name="importDate"
                  rules={[{ required: true, message: "Vui lòng chọn ngày nhập kho!" }]}
                >
                  <Input 
                    type="date" 
                    placeholder="Chọn ngày nhập kho" 
                    size="large"
                    className="w-full"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <SafetyOutlined className="text-orange-600" />
                      Hạn bảo hành
                    </span>
                  }
                  name="warrantyExpiryDate"
                  rules={[{ required: true, message: "Vui lòng chọn hạn bảo hành!" }]}
                >
                  <Input 
                    type="date" 
                    placeholder="Chọn hạn bảo hành" 
                    size="large"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>
            </Card>

            <Divider />

            <Row justify="end" gutter={16} className="mt-6">
              <Col>
                <Button 
                  onClick={() => {
                    setIsCreateModalVisible(false);
                    form.resetFields();
                    setSelectedTemplate(null);
                    setVinList([]);
                    setCurrentVinInput('');
                    setBulkVinInput('');
                    setIsBulkInputMode(false);
                  }}
                  size="large"
                >
                  Hủy
                </Button>
              </Col>
              <Col>
                <Tooltip
                  title={
                    !selectedTemplate
                      ? "Vui lòng chọn Template trước"
                      : vinList.length === 0
                        ? "Vui lòng thêm ít nhất 1 VIN"
                        : `Tạo ${vinList.length} xe`
                  }
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedTemplate || vinList.length === 0}
                    icon={<CarOutlined />}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    Tạo {vinList.length > 0 ? `${vinList.length} ` : ''}Xe
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal xác nhận */}
        <Modal
          title={
            <div className="text-center">
              <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
              Xác nhận tạo xe
            </div>
          }
          open={confirmModalVisible}
          onOk={confirmCreateVehicle}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Xác nhận tạo"
          cancelText="Hủy"
          okButtonProps={{ loading }}
        >
          {vehicleData && (
            <div className="space-y-2">
              <p><Text strong>Template ID:</Text> <Text code className="text-xs">{vehicleData.electricVehicleTemplateId}</Text></p>
              <p><Text strong>Version:</Text> {vehicleData._displayInfo?.versionName}</p>
              <p><Text strong>Màu:</Text> {vehicleData._displayInfo?.colorName}</p>
              <p><Text strong>Kho:</Text> {vehicleData._displayInfo?.warehouseName}</p>
              <p><Text strong>Số lượng xe:</Text> <Text className="text-blue-600 font-bold">{vehicleData._displayInfo?.vinCount}</Text></p>
              <Divider className="my-2" />
              <div className="bg-gray-50 p-3 rounded">
                <Text strong className="block mb-2">VIN List ({vehicleData.vinList?.length}):</Text>
                <div className="max-h-32 overflow-y-auto">
                  {vehicleData.vinList?.map((vin, idx) => (
                    <div key={idx} className="text-xs font-mono bg-white px-2 py-1 mb-1 rounded border">
                      {idx + 1}. <Text code copyable>{vin}</Text>
                    </div>
                  ))}
                </div>
              </div>
              <p><Text strong>Status:</Text> {vehicleData.status === 1 ? 'Khả dụng' : vehicleData.status}</p>
              <Divider className="my-2" />
              <Alert
                message="Payload theo đúng Swagger API schema"
                description={
                  <div className="text-xs">
                    <p> vinList: array of {vehicleData.vinList?.length} VINs</p>
                    <p>manufactureDate, importDate, warrantyExpiryDate: nullable</p>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
          )}
        </Modal>

        {/* Modal cập nhật thông tin xe */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              Cập nhật thông tin xe
            </div>
          }
          open={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            updateForm.resetFields();
            setUpdatingVehicle(null);
          }}
          footer={null}
          width={600}
        >
          {updatingVehicle && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm"><Text strong>VIN:</Text> <Text code>{updatingVehicle.vin}</Text></p>
              <p className="text-sm"><Text strong>Template:</Text> {updatingVehicle.electricVehicleTemplate?.versionName || 'N/A'}</p>
              <p className="text-sm"><Text strong>Màu:</Text> {updatingVehicle.electricVehicleTemplate?.color?.colorName || 'N/A'}</p>
            </div>
          )}

          <Form
            form={updateForm}
            layout="vertical"
            onFinish={handleUpdateVehicle}
          >
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value={1}><span className="mr-2">✅</span>Khả dụng (Available)</Option>
                <Option value={2}><span className="mr-2">⏳</span>Đang xử lý (Pending)</Option>
                <Option value={3}><span className="mr-2">📦</span>Đã đặt (Booked)</Option>
                <Option value={4}><span className="mr-2">🚚</span>Đang vận chuyển (InTransit)</Option>
                <Option value={5}><span className="mr-2">💰</span>Đã bán (Sold)</Option>
                <Option value={6}><span className="mr-2">🏢</span>Tại đại lý (AtDealer)</Option>
                <Option value={7}><span className="mr-2">🔧</span>Bảo trì (Maintenance)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày nhập kho"
              name="importDate"
              tooltip="Ngày xe nhập vào kho"
            >
              <Input type="date" placeholder="Chọn ngày nhập" />
            </Form.Item>

            <Form.Item
              label="Hạn bảo hành"
              name="warrantyExpiryDate"
              tooltip="Ngày hết hạn bảo hành"
            >
              <Input type="date" placeholder="Chọn ngày hết hạn bảo hành" />
            </Form.Item>

            <Form.Item
              label="Ngày giao xe"
              name="deliveryDate"
              tooltip="Ngày giao xe cho khách hàng hoặc đại lý"
            >
              <Input type="date" placeholder="Chọn ngày giao xe" />
            </Form.Item>

            <Form.Item
              label="Ngày đại lý nhận"
              name="dealerReceivedDate"
              tooltip="Ngày đại lý nhận xe"
            >
              <Input type="date" placeholder="Chọn ngày đại lý nhận" />
            </Form.Item>

            <Divider />

            <Row justify="end" gutter={16}>
              <Col>
                <Button onClick={() => {
                  setIsUpdateModalVisible(false);
                  updateForm.resetFields();
                  setUpdatingVehicle(null);
                }}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<EditOutlined />}
                >
                  Cập nhật
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal xem chi tiết */}
        <Modal
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined className="text-blue-500" />
              <span>Chi tiết xe điện</span>
            </div>
          }
          footer={null}
          width={900}
        >
          {selectedVehicle && (() => {
            const template = selectedVehicle.electricVehicleTemplate || {};
            const warehouse = selectedVehicle.warehouse || {};
            const version = template.version || {};
            const model = template.model || {};


            // Status mapping
            const statusMap = {
              1: { color: "success", text: "Khả dụng", icon: "✅" },
              2: { color: "warning", text: "Đang xử lý", icon: "⏳" },
              3: { color: "processing", text: "Đã đặt", icon: "📦" },
              4: { color: "default", text: "Đang vận chuyển", icon: "🚚" },
              5: { color: "error", text: "Đã bán", icon: "💰" },
              6: { color: "cyan", text: "Tại đại lý", icon: "🏢" },
              7: { color: "magenta", text: "Bảo trì", icon: "🔧" },
            };
            const statusConfig = statusMap[selectedVehicle.status] || { color: "default", text: "N/A", icon: "❓" };

            const formatDate = (dateString) => {
              if (!dateString) return <Text type="secondary" italic>Chưa có</Text>;
              return new Date(dateString).toLocaleDateString("vi-VN", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            };

            return (
              <div className="space-y-4">
                {/* Thông tin cơ bản */}
                <Card title=" Thông tin cơ bản" size="small" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong className="block mb-1">VIN:</Text>
                      <Text code copyable className="text-blue-600 font-mono">{selectedVehicle.vin}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Template ID:</Text>
                      <Text code copyable className="font-mono text-xs">{template.evTemplateId || 'N/A'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Trạng thái:</Text>
                      <Badge
                        status={statusConfig.color}
                        text={<Text strong>{statusConfig.icon} {statusConfig.text}</Text>}
                      />
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Kho:</Text>
                      <Text>{warehouse.name || selectedVehicle.warehouseName || 'N/A'}</Text>
                    </Col>
                  </Row>
                </Card>

                {/* Thông tin Template/Vehicle */}
                <Card title=" Thông tin xe" size="small" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong className="block mb-1">Phiên bản:</Text>
                      <Text className="text-base">{template.versionName || version.versionName || 'N/A'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Model:</Text>
                      <Text className="text-base">{template.modelName || model.modelName || 'N/A'}</Text>
                    </Col>


                  </Row>
                </Card>

                {/* Thông tin ngày tháng */}
                <Card title=" Thông tin ngày tháng" size="small" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong className="block mb-1">Ngày sản xuất:</Text>
                      <Text>{formatDate(selectedVehicle.manufactureDate)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Ngày nhập kho:</Text>
                      <Text>{formatDate(selectedVehicle.importDate)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Hạn bảo hành:</Text>
                      <Text>{formatDate(selectedVehicle.warrantyExpiryDate)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Ngày giao xe:</Text>
                      <Text>{formatDate(selectedVehicle.deliveryDate)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong className="block mb-1">Ngày đại lý nhận:</Text>
                      <Text>{formatDate(selectedVehicle.dealerReceivedDate)}</Text>
                    </Col>
                  </Row>
                </Card>

                {/* Hình ảnh (nếu có) */}
                {template.images && template.images.length > 0 && (
                  <Card title=" Hình ảnh" size="small" className="shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      {template.images.slice(0, 6).map((img, idx) => (
                        <Image
                          key={idx}
                          src={img.imageUrl}
                          alt={`Vehicle ${idx + 1}`}
                          width={120}
                          height={120}
                          className="object-cover rounded border"
                          preview={{
                            src: img.imageUrl
                          }}
                        />
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}
        </Modal>
      </div>
    </EVMStaffLayout>
  );
}

export default CreateElectricVehicle;

