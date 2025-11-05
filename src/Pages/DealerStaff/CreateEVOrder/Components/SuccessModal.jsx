import React from "react";
import { Modal, Result, Descriptions, Button } from "antd";
import {
  CheckCircleOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";

function SuccessModal({
  visible,
  onClose,
  onViewOrders,
  onCreateNew,
  orderData = {},
}) {
  const {
    orderCode,
    vehicleName,
    colorName,
    quantity,
    totalAmount,
    paymentStatus, // "PAID" | "PARTIAL" | "UNPAID" (tuỳ backend)
    customerName,
  } = orderData || {};

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnHidden
    >
      <Result
        status="success"
        title="Tạo đơn hàng thành công!"
        subTitle="Đơn hàng đã được ghi nhận. Bạn có thể xem chi tiết hoặc tạo đơn mới."
        icon={<CheckCircleOutlined />}
      />

      <Descriptions
        bordered
        size="middle"
        column={1}
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        {orderCode && (
          <Descriptions.Item label="Mã đơn hàng">
            {orderCode}
          </Descriptions.Item>
        )}
        {customerName && (
          <Descriptions.Item label="Khách hàng">
            {customerName}
          </Descriptions.Item>
        )}
        {vehicleName && (
          <Descriptions.Item label="Xe">
            {vehicleName}
          </Descriptions.Item>
        )}
        {colorName && (
          <Descriptions.Item label="Màu">
            {colorName}
          </Descriptions.Item>
        )}
        {typeof quantity === "number" && (
          <Descriptions.Item label="Số lượng">
            {quantity}
          </Descriptions.Item>
        )}
        {typeof totalAmount === "number" && (
          <Descriptions.Item label="Tổng tiền">
            {new Intl.NumberFormat("vi-VN").format(totalAmount)} VNĐ
          </Descriptions.Item>
        )}
        {paymentStatus && (
          <Descriptions.Item label="Thanh toán">
            {paymentStatus === "PAID"
              ? "Đã thanh toán"
              : paymentStatus === "PARTIAL"
              ? "Thanh toán một phần"
              : "Chưa thanh toán"}
          </Descriptions.Item>
        )}
      </Descriptions>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Button onClick={onClose} icon={<ArrowLeftOutlined />}>
          Đóng
        </Button>

        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onCreateNew} icon={<PlusOutlined />}>
            Tạo đơn mới
          </Button>
          <Button
            type="primary"
            onClick={onViewOrders}
            icon={<ShoppingCartOutlined />}
          >
            Xem danh sách đơn hàng
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SuccessModal;
