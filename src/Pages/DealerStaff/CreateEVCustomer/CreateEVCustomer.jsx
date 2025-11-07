import React, { useState } from "react";
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  PageContainer,
} from "@ant-design/pro-components";
import { message, Card, Row, Col, Space } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SaveOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { createCustomer } from "../../../App/DealerStaff/EVCustomerManagement/CreateEVCustomer";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";
import CreateCustomerSuccessModal from "./Components/CreateCustomerSuccessModal";
import dayjs from "dayjs";

function CreateEVCustomer() {
  const [loading, setLoading] = useState(false);
  const [form] = ProForm.useForm();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);

  // Hiển thị popup thành công
  const showSuccessModal = (customerData) => {
    setCustomerInfo(customerData);
    setSuccessModalVisible(true);
  };

  // Đóng popup thành công
  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setCustomerInfo(null);
  };

  // Xử lý tạo khách hàng
  const handleCreateCustomer = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        ...values,
        createdAt: dayjs().toISOString(),
      };

      console.log("Đang gửi dữ liệu:", customerData);
      const response = await createCustomer(customerData);

      if (response?.isSuccess) {
        showSuccessModal(customerData);
        form.resetFields();
      } else {
        throw new Error(response?.message || "Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tạo khách hàng:", error);
      message.error(`Lỗi: ${error.message || "Không thể kết nối đến server"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DealerStaffLayout>
      <PageContainer
        title={
          <Space>
            <UserAddOutlined className="text-blue-600" />
            <span>Thêm khách hàng mới</span>
          </Space>
        }
        subTitle="Tạo hồ sơ khách hàng quan tâm xe điện"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm">
            <ProForm
              form={form}
              onFinish={handleCreateCustomer}
              layout="vertical"
              submitter={{
                searchConfig: {
                  submitText: "Lưu thông tin",
                  resetText: "Xóa form",
                },
                submitButtonProps: {
                  loading,
                  size: "large",
                  icon: <SaveOutlined />,
                  type: "primary",
                  className: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg hover:shadow-xl font-semibold",
                },
                resetButtonProps: {
                  size: "large",
                  icon: <ClearOutlined />,
                  className: "border-gray-300 hover:border-gray-400",
                },
                render: (props, doms) => (
                  <Row gutter={16} className="mt-8">
                    <Col span={12}>{doms[1]}</Col>
                    <Col span={12}>{doms[0]}</Col>
                  </Row>
                ),
              }}
            >
              {/* Họ và tên */}
              <ProFormText
                name="fullName"
                label={
                  <span className="text-base font-semibold">
                    <UserOutlined className="mr-2 text-blue-600" />
                    Họ và tên <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="VD: Nguyễn Văn An"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Tối thiểu 2 ký tự!" },
                  { max: 50, message: "Tối đa 50 ký tự!" },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: "Chỉ được nhập chữ cái và khoảng trắng!",
                  },
                ]}
                fieldProps={{
                  size: "large",
                  prefix: <UserOutlined className="text-gray-400" />,
                }}
              />

              {/* Số điện thoại */}
              <ProFormText
                name="phoneNumber"
                label={
                  <span className="text-base font-semibold">
                    <PhoneOutlined className="mr-2 text-green-600" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="VD: 0901234567"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                  {
                    pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
                fieldProps={{
                  size: "large",
                  prefix: <PhoneOutlined className="text-gray-400" />,
                  maxLength: 10,
                }}
              />
              <ProFormText
                name="email"
                label={
                  <span className="text-base font-semibold">
                    <UserOutlined className="mr-2 text-purple-600" />
                    Email
                  </span>
                }
                placeholder="VD: example@gmail.com"
              />

              {/* Địa chỉ */}
              <ProFormText
                name="address"
                label={
                  <span className="text-base font-semibold">
                    <EnvironmentOutlined className="mr-2 text-red-600" />
                    Địa chỉ <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="VD: 123 Nguyễn Văn Cừ, Q.5, TP.HCM"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                  { min: 10, message: "Địa chỉ quá ngắn!" },
                  { max: 200, message: "Địa chỉ quá dài!" },
                ]}
                fieldProps={{
                  size: "large",
                  prefix: <EnvironmentOutlined className="text-gray-400" />,
                }}
              />

              {/* Ghi chú */}
              <ProFormTextArea
                name="note"
                label={
                  <span className="text-base font-semibold">
                    <FileTextOutlined className="mr-2 text-orange-600" />
                    Ghi chú
                  </span>
                }
                placeholder="Mẫu xe quan tâm, ngân sách, thời gian mua dự kiến..."
                rules={[{ max: 300, message: "Ghi chú không quá 300 ký tự!" }]}
                fieldProps={{
                  rows: 3,
                  size: "large",
                  showCount: true,
                  maxLength: 300,
                }}
              />
            </ProForm>
          </Card>
        </div>

        {/* Success Modal */}
        <CreateCustomerSuccessModal
          visible={successModalVisible}
          onClose={handleCloseSuccessModal}
          customerInfo={customerInfo}
        />
      </PageContainer>
    </DealerStaffLayout>
  );
}

export default CreateEVCustomer;
