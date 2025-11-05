import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import {
  Steps,
  Button,
  Typography,
  Space,
  Card,
  Divider,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";
import { CreateEVOrder as createEVOrderService } from "../../../App/DealerStaff/EVOrders/CreateCustomerOrder";

import OrderCustomerSelect from "./Components/OrderCustomerSelect";
import OrderQuoteSelect from "./Components/OrderQuoteSelect";
import OrderPaymentSelect from "./Components/OrderPaymentSelect";
import OrderConfirmation from "./Components/OrderConfirmation";
import SuccessModal from "./Components/SuccessModal";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

const { Text } = Typography;

export default function CreateEVOrder() {
  const [step, setStep] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // "vnpay" | "cash"
  const [isPayFull, setIsPayFull] = useState(true); // mặc định full
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const navigate = useNavigate();

  const steps = [
    {
      title: "Chọn thông tin",
      icon: <ShoppingCartOutlined />,
    },
    {
      title: "Xác nhận đơn",
      icon: <CheckCircleOutlined />,
    },
  ];

  const canNext =
    !!selectedCustomerId && !!selectedQuoteId && paymentMethod != null;

  const handleNext = () => setStep((p) => p + 1);
  const handlePrev = () => setStep((p) => p - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        customerId: selectedCustomerId,
        quoteId: selectedQuoteId,
        isPayFull: isPayFull === true,
        isCash: paymentMethod === "cash",
      };

      const res = await createEVOrderService(payload);

      if (res?.isSuccess) {
        message.success("Tạo đơn hàng thành công!");
        setCreatedOrder(res.result);
        setShowSuccess(true);
      } else {
        message.error(res?.message || "Không thể tạo đơn hàng.");
      }
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Yêu cầu không hợp lệ.";
      message.error(apiMsg);
      console.log("create-customer-order error:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DealerStaffLayout>
      <ConfigProvider locale={viVN}>
      <PageContainer
        title={
          <Space>
            <ShoppingCartOutlined className="text-blue-600" />
            <span>Tạo đơn hàng xe điện</span>
          </Space>
        }
        subTitle="Quy trình đơn giản: khách hàng → báo giá → thanh toán → xác nhận"
        className="bg-gray-50 min-h-screen"
      >
        <div
          style={{
            background: "#fff",
            padding: 32,
            borderRadius: 16,
            maxWidth: 960,
            margin: "0 auto",
            boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
          }}
        >
          <Steps
            current={step}
            items={steps}
            style={{ marginBottom: 28 }}
          />

          {step === 0 ? (
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              <Card
                size="small"
                style={{ borderRadius: 14 }}
              >
                <OrderCustomerSelect
                  value={selectedCustomerId}
                  onChange={(id, customer) => {
                    setSelectedCustomerId(id);
                    setSelectedCustomer(customer);
                }}
                />
              </Card>

              {selectedCustomerId && (
                <Card
                  size="small"
                  style={{ borderRadius: 14 }}
                >
                  <OrderQuoteSelect
                    value={selectedQuoteId}
                    onChange={setSelectedQuoteId}
                    customerId={selectedCustomerId}
                  />
                </Card>
              )}

              {selectedQuoteId && (
                <Card
                  size="small"
                  style={{ borderRadius: 14 }}
                >
                  <OrderPaymentSelect
                    quoteTotal={
                      undefined
                    }
                    paymentMethod={paymentMethod}
                    onChangeMethod={setPaymentMethod}
                    isPayFull={isPayFull}
                    onChangeType={setIsPayFull}
                  />
                </Card>
              )}
            </Space>
          ) : (
            <OrderConfirmation
              customerId={selectedCustomerId}
              quoteId={selectedQuoteId}
              isPayFull={isPayFull}
              paymentMethod={paymentMethod}
            />
          )}

          <Divider />

          <div
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={step === 0}
              onClick={handlePrev}
            >
              Quay lại
            </Button>

            {step === 0 ? (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                disabled={!canNext}
                onClick={handleNext}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading}
                onClick={handleSubmit}
              >
                Xác nhận & tạo đơn
              </Button>
            )}
          </div>
        </div>

        <SuccessModal
          visible={showSuccess}
          onClose={() => setShowSuccess(false)}
          onViewOrders={() => {
             const phone =
                createdOrder?.customer?.phoneNumber ||
                createdOrder?.quote?.customer?.phoneNumber ||
                selectedCustomer?.phoneNumber || // nếu bạn giữ được selectedCustomer
                ""; 
            navigate(`/dealer-staff/orders/all-orders?phone=${phone}`);
          }}
          onCreateNew={() => {
            setStep(0);
            setSelectedCustomerId(null);
            setSelectedQuoteId(null);
            setPaymentMethod(null);
            setIsPayFull(true);
            setShowSuccess(false);
          }}
          quoteData={{
            vehicleName: createdOrder?.quote?.versionName,
            colorName: createdOrder?.quote?.colorName,
            totalPrice: createdOrder?.totalAmount,
          }}
        />
      </PageContainer>
      </ConfigProvider>
    </DealerStaffLayout>
  );
}
