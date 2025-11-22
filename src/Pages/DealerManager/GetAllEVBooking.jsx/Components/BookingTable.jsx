import React, { useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Tag, Button, Tooltip, Space, message } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  AuditOutlined,
  CarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import EVBookingUpdateStatus from "../../../../App/DealerManager/EVBooking/EVBookingUpdateStatus";
import BookingReviewModal from "./BookingReviewModal";
import EContractSuccessModal from "./EContractSuccessModal";
import CancelBookingModal from "./CancelBookingModal";
import CompleteBookingModal from "./CompleteBookingModal";
import { EVBookingConfirmEContract } from "../../../../App/DealerManager/EVBooking/EVBookingConfirm";
import { confirmBookingEContract } from "../../../../App/DealerManager/EVBooking/EVBookingConfirmContract";

function BookingTable({
  dataSource,
  loading,
  onViewDetail,
  formatDateTime,
  onStatusUpdate,
  onOpenPdf,
  pdfLoading = false,
}) {
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [confirmingContract, setConfirmingContract] = useState({});
  const [reviewModal, setReviewModal] = useState({
    visible: false,
    booking: null,
  });
  const [eContractModal, setEContractModal] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    visible: false,
    booking: null,
  });
  const [completeModal, setCompleteModal] = useState({
    visible: false,
    booking: null,
  });

  // Hiển thị modal duyệt đơn
  const showReviewModal = (booking) => {
    setReviewModal({
      visible: true,
      booking: booking,
    });
  };

  // Đóng modal
  const closeReviewModal = () => {
    setReviewModal({
      visible: false,
      booking: null,
    });
  };

  // Hiển thị modal hủy đơn
  const showCancelModal = (booking) => {
    setCancelModal({
      visible: true,
      booking: booking,
    });
  };

  // Đóng modal hủy đơn
  const closeCancelModal = () => {
    setCancelModal({
      visible: false,
      booking: null,
    });
  };

  // Hiển thị modal hoàn thành
  const showCompleteModal = (booking) => {
    setCompleteModal({
      visible: true,
      booking: booking,
    });
  };

  // Đóng modal hoàn thành
  const closeCompleteModal = () => {
    setCompleteModal({
      visible: false,
      booking: null,
    });
  };

  // Xử lý hủy đơn booking
  const handleCancelBooking = async (bookingId) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    closeCancelModal();

    try {
      await EVBookingUpdateStatus(bookingId, 5); // Status 5 = Cancelled
      message.success("Đã hủy booking thành công!");

      // Refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(`Không thể hủy booking: ${error.message}`);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Xử lý hoàn thành booking
  const handleCompleteBooking = async (bookingId) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    closeCompleteModal();

    try {
      await EVBookingUpdateStatus(bookingId, 7); // Status 7 = Completed
      message.success("Đã hoàn thành booking thành công!");

      // Refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(`Không thể hoàn thành booking: ${error.message}`);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Xử lý xác nhận hợp đồng
  const handleConfirmContract = async (record) => {
    if (!record?.eContract?.id) {
      message.error("Không tìm thấy hợp đồng để xác nhận");
      return;
    }

    setConfirmingContract((prev) => ({ ...prev, [record.id]: true }));

    try {
      await confirmBookingEContract(record.eContract.id);
      message.success("Đã xác nhận hợp đồng thành công!");

      // Refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(`Không thể xác nhận hợp đồng: ${error.message}`);
    } finally {
      setConfirmingContract((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  // 
  const handleEVBookingConfirmEContract = async (bookingId) => {
    try {
      const response = await EVBookingConfirmEContract(bookingId);
      console.log("EV booking confirm e-contract created:", response);
      message.success("E-Contract xác nhận booking đã được tạo thành công!");
      return response;
    } catch (error) {
      console.error("Error creating EV booking confirm e-contract:", error);
      message.error(
        `Không thể tạo E-Contract xác nhận booking: ${error.message}`
      );
      throw error;
    }
  };
  // Xử lý cập nhật trạng thái booking
  const handleUpdateStatus = async (bookingId, newStatus, statusText) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    closeReviewModal(); // Đóng modal trước khi xử lý

    try {
      await EVBookingUpdateStatus(bookingId, newStatus);
      message.success(`Đã ${statusText.toLowerCase()} booking thành công!`);

      // Gọi callback để refresh data nếu có
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(
        `Không thể ${statusText.toLowerCase()} booking: ${error.message}`
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Hiển thị trạng thái booking với style nâng cao
  const getStatusTag = (status) => {
    // Mapping theo BookingStatus enum
    const statusMap = {
      0: {
        color: "#8c8c8c",
        bg: "#fafafa",
        text: "Nháp",
        icon: <SyncOutlined />,
      },
      1: {
        color: "#faad14",
        bg: "#fffbe6",
        text: "Chờ Ký",
        icon: <AuditOutlined />,
      },
      2: {
        color: "#fa8c16",
        bg: "#fff7e6",
        text: "Chờ Duyệt",
        icon: <ClockCircleOutlined />,
      },
      3: {
        color: "#52c41a",
        bg: "#f6ffed",
        text: "Đã Duyệt",
        icon: <CheckCircleOutlined />,
      },
      4: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        text: "Từ Chối",
        icon: <CloseCircleOutlined />,
      },
      5: {
        color: "#8c8c8c",
        bg: "#fafafa",
        text: "Đã Hủy",
        icon: <CloseCircleOutlined />,
      },
      6: {
        color: "#13c2c2",
        bg: "#e6fffb",
        text: "Admin Đã Ký",
        icon: <CheckCircleOutlined />,
      },
      7: {
        color: "#1890ff",
        bg: "#e6f7ff",
        text: "Hoàn Thành",
        icon: <CheckCircleOutlined />,
      },
    };

    const statusInfo = statusMap[status] || {
      color: "#d9d9d9",
      bg: "#fafafa",
      text: "Unknown",
      icon: null,
    };

    return (
      <Tag
        icon={statusInfo.icon}
        style={{
          color: statusInfo.color,
          backgroundColor: statusInfo.bg,
          borderColor: statusInfo.color,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 6,
        }}
      >
        {statusInfo.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      valueType: "indexBorder",
      width: 50,
      align: "center",
      fixed: "left",
      render: (text, record, index) => (
        <span style={{ fontWeight: 600, color: "#595959" }}>{index + 1}</span>
      ),
    },
    {
      title: "Ngày Đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 120,
      sorter: (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
      defaultSortOrder: "descend",
      render: (text) => (
        <div style={{ fontSize: 12, color: "#595959" }}>
          {formatDateTime(text)}
        </div>
      ),
    },
    {
      title: "SL Xe",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 80,
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (text) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            backgroundColor: "#e6f7ff",
            borderRadius: 6,
            border: "1px solid #91d5ff",
          }}
        >
          <CarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
          <span style={{ fontWeight: 600, color: "#1890ff", fontSize: 13 }}>
            {text || 0}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người Tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 130,
      ellipsis: true,
      render: (text) => (
        <div style={{ fontSize: 12, color: "#595959" }}>{text || "N/A"}</div>
      ),
    },
    {
      title: "E-Contract",
      dataIndex: "eContract",
      key: "eContract",
      width: 150,
      ellipsis: true,
      render: (eContract, record) => {
        const contract = record.eContract;

        if (!contract) {
          return (
            <Tag color="default" style={{ borderRadius: 6, fontSize: 11 }}>
              Chưa có
            </Tag>
          );
        }

        // Mapping trạng thái hợp đồng
        const contractStatusMap = {
          0: { color: "default", text: "Bản Nháp" },
          1: { color: "gold", text: "Chờ Ký" },
          2: { color: "orange", text: "Chờ Duyệt" },
          3: { color: "green", text: "Đã Duyệt" },
          4: { color: "red", text: "Từ Chối" },
        };

        const statusInfo = contractStatusMap[contract.status] || {
          color: "default",
          text: "N/A",
        };

        const fileName = contract.name || "N/A";

        return (
          <Tooltip
            title={
              <div className="space-y-1">
                <div><strong>Tên file:</strong> {fileName}</div>
                <div><strong>Trạng thái:</strong> {statusInfo.text}</div>
                <div><strong>Người tạo:</strong> {contract.createdName || "System"}</div>
                <div><strong>Chủ sở hữu:</strong> {contract.ownerName || "N/A"}</div>
                <div><strong>Ngày tạo:</strong> {formatDateTime(contract.createdAt)}</div>
              </div>
            }
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#1890ff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {fileName}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isUpdating = updatingStatus[record.id];
        const isConfirming = confirmingContract[record.id];
        const isDraft = record.status === 0;
        const isWaittingDealerSign = record.status === 1;
        const isPending = record.status === 2;
        const isSignedByAdmin = record.status === 6;
        const hasEContractWithStatus1 = record?.eContract?.status === 1;

        return (
          <Space size={4} wrap>
            <Tooltip title="Xem chi tiết">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(record)}
                size="small"
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </Tooltip>

            {/* Xem hợp đồng (PDF) nếu có eContract */}
            {record?.eContract && onOpenPdf && (
              <Tooltip title={pdfLoading ? "Đang tải hợp đồng..." : "Xem Hợp đồng"}>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={() => onOpenPdf(record)}
                  loading={pdfLoading}
                  disabled={pdfLoading}
                  size="small"
                  style={{
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
              </Tooltip>
            )}

            {/* Nút xác nhận hợp đồng - chỉ hiện khi eContract status = 1 */}
            {hasEContractWithStatus1 && (
              <Tooltip title="Xác nhận hợp đồng">
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => handleConfirmContract(record)}
                  loading={isConfirming}
                  size="small"
                  style={{
                    borderRadius: 6,
                    fontSize: 12,
                    backgroundColor: "#13c2c2",
                    borderColor: "#13c2c2",
                  }}
                >
                  Xác Nhận
                </Button>
              </Tooltip>
            )}



            {isDraft && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showReviewModal(record)}
                loading={isUpdating}
                size="small"
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                Xác Nhận
              </Button>
            )}

            {(isWaittingDealerSign || isPending) && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showCancelModal(record)}
                loading={isUpdating}
                size="small"
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <style>
        {`
          .booking-table .ant-table {
            table-layout: auto !important;
          }
          .booking-table .ant-table-cell {
            white-space: normal !important;
            word-break: break-word !important;
          }
        `}
      </style>
      <ProTable
        className="booking-table"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={(record) => record.id || record.bookingCode}
        search={false}
        dateFormatter="string"
        toolbar={false}
        options={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <span style={{ fontSize: 13, color: "#595959" }}>
              Hiển thị{" "}
              <strong>
                {range[0]}-{range[1]}
              </strong>{" "}
              trong tổng số <strong>{total}</strong> booking
            </span>
          ),
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          size: "default",
          style: { marginTop: 16 },
        }}
        cardBordered={false}
        headerTitle={false}
        size="middle"
        rowClassName={(record, index) => {
          const isDraft = record.status === 0; // Status Draft = 0
          const isWaittingDealerSign = record.status === 1; // Status WaittingDealerSign = 1
          const isPending = record.status === 2; // Status Pending = 2
          if (isDraft || isWaittingDealerSign || isPending) {
            return "highlight-pending-row";
          }
          return index % 2 === 0 ? "table-row-even" : "table-row-odd";
        }}
        style={{
          borderRadius: 8,
        }}
        tableStyle={{
          borderRadius: 8,
        }}
      />

      {/* Modal Duyệt Đơn */}
      <BookingReviewModal
        visible={reviewModal.visible}
        booking={reviewModal.booking}
        onClose={closeReviewModal}
        onApprove={async () => {
          const bookingId = reviewModal.booking?.id;
          setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
          closeReviewModal();

          try {
            // Gọi API tạo e-contract confirm
            const eContractResponse = await handleEVBookingConfirmEContract(bookingId);

            console.log("E-Contract Response:", eContractResponse);

            if (eContractResponse?.status === 201) {
              setEContractModal(true);
            } else {
              message.success("Đã xác nhận booking và tạo e-contract thành công!");
            }

            // Refresh data
            if (onStatusUpdate) {
              onStatusUpdate();
            }
          } catch (error) {
            message.error(`Không thể xử lý booking: ${error.message}`);
          } finally {
            setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
          }
        }}
        onReject={() =>
          handleUpdateStatus(reviewModal.booking?.id, 5, "Hủy")
        }
        loading={updatingStatus[reviewModal.booking?.id]}
      />

      <EContractSuccessModal
        visible={eContractModal}
        onClose={() => setEContractModal(false)}
      />

      {/* Modal Hủy Đơn */}
      <CancelBookingModal
        visible={cancelModal.visible}
        booking={cancelModal.booking}
        onClose={closeCancelModal}
        onConfirm={() => handleCancelBooking(cancelModal.booking?.id)}
        loading={updatingStatus[cancelModal.booking?.id]}
      />

      {/* Modal Hoàn Thành */}
      <CompleteBookingModal
        visible={completeModal.visible}
        booking={completeModal.booking}
        onClose={closeCompleteModal}
        onConfirm={() => handleCompleteBooking(completeModal.booking?.id)}
        loading={updatingStatus[completeModal.booking?.id]}
      />
    </>
  );
}

export default BookingTable;
