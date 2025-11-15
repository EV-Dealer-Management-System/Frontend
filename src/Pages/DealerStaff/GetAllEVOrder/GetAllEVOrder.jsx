import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import { Space, message, Spin } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";
import api from "../../../api/api";
import { cancelCustomerOrder } from "../../../App/DealerStaff/EVOrders/CancelCustormerOrder";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

// Import components
import OrderStats from "./Components/OrderStats";
import OrderSearchBar from "./Components/OrderSearchBar";
import OrderTable from "./Components/OrderTable";
import PaymentModal from "./Components/PaymentModal";
import OrderDetailDrawer from "./Components/OrderDetailDrawer";
import SuccessModal from "./Components/SuccessModal";

function OrderListStaffView() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState(null);

  // Modal thanh toán
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState(null);

  // Drawer chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const location = useLocation();

  // Success modal
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Header stats
  const headerStats = useMemo(() => {
    const total = pagination.total || orders.length;
    const pending = orders.filter((o) => [0, 1, 4].includes(o.status)).length;
    const done = orders.filter((o) => o.status === 5).length;
    const cancelled = orders.filter((o) => o.status === 6).length;
    return { total, pending, done, cancelled };
  }, [orders, pagination.total]);

  // Fetch orders
  const fetchOrders = async (page = 1, pageSize = 10, { silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const res = await api.get(
        `/CustomerOrder/get-all-customer-orders?pageNumber=${page}&pageSize=${pageSize}`
      );

      if (res.data?.isSuccess) {
        const { data, pagination: serverPaging } = res.data.result;
        setOrders(data || []);

        if (serverPaging) {
          setPagination({
            current: serverPaging.pageNumber,
            pageSize: serverPaging.pageSize,
            total: serverPaging.totalItems,
          });
        } else {
          setPagination({
            current: page,
            pageSize,
            total: data?.length || 0,
          });
        }
      } else {
        message.error(
          res.data?.message || "Không tải được danh sách đơn hàng từ máy chủ"
        );
      }
    } catch (err) {
      console.error("Fetch orders failed:", err);
      message.error("Lỗi kết nối máy chủ!");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  // Đọc query param phone từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phoneFromQuery = params.get("phone");
    if (phoneFromQuery) setSearchText(phoneFromQuery);
  }, [location.search]);

  // Đổi trang / đổi pageSize
  const handlePageChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
  };

  // Hủy đơn
  const handleCancelOrder = async (record) => {
    const { id } = record;
    try {
      setRowLoadingId(id);

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 6 } : o))
      );

      const res = await cancelCustomerOrder(id);
      if (!res?.isSuccess) {
        message.error(res?.message || "Hủy đơn thất bại");
        fetchOrders(pagination.current, pagination.pageSize, { silent: true });
      } else {
        message.success("Hủy đơn hàng thành công");
        fetchOrders(pagination.current, pagination.pageSize, { silent: true });
      }
    } catch (e) {
      console.error(e);
      message.error("Hủy đơn thất bại");
      fetchOrders(pagination.current, pagination.pageSize, { silent: true });
    } finally {
      setRowLoadingId(null);
    }
  };

  // Mở modal thanh toán
  const openPayModal = (record) => {
    setPayingOrder(record);
    setSelectedPayMethod(null);
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayingOrder(null);
    setSelectedPayMethod(null);
    setPayModalOpen(false);
  };

  // Thanh toán
  const handlePay = async (method) => {
    if (!payingOrder || !method) return;
    try {
      setPayLoading(true);

      await api.put(
        `/CustomerOrder/pay-deposit-customer-order/${payingOrder.id}?isCash=${method === "cash"}`
      );

      const successMsg =
        method === "cash"
          ? "Ghi nhận thanh toán tiền mặt thành công"
          : "Tạo thanh toán VNPay thành công. Vui lòng kiểm tra email khách hàng.";

      setSuccessMessage(successMsg);
      setSuccessModalVisible(true);

      closePayModal();
      fetchOrders(pagination.current, pagination.pageSize, { silent: true });
    } catch (e) {
      console.error(e);
      message.error("Thanh toán thất bại");
    } finally {
      setPayLoading(false);
    }
  };

  // Mở/đóng drawer chi tiết
  const openDetail = (record) => {
    setDetailOrder(record);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOrder(null);
    setDetailOpen(false);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const customer = o.customer || {};
      const search = searchText.trim().toLowerCase();
      const matchSearch =
        !search ||
        (customer.fullName || "").toLowerCase().includes(search) ||
        (customer.phoneNumber || "").toLowerCase().includes(search);
      const matchStatus =
        statusFilter === "" || o.status === Number(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [orders, searchText, statusFilter]);

  return (
    <DealerStaffLayout>
      <ConfigProvider locale={viVN}>
        <PageContainer
          title={
            <Space>
              <ShoppingCartOutlined className="text-blue-600" />
              <span>Danh sách đơn hàng</span>
            </Space>
          }
        >
          {/* Stats */}
          <OrderStats stats={headerStats} />

          {/* Search Bar */}
          <OrderSearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSearch={() => fetchOrders(1, pagination.pageSize)}
            onReload={() => fetchOrders(1, pagination.pageSize)}
          />

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          ) : (
            <OrderTable
              orders={filteredOrders}
              pagination={pagination}
              loading={loading}
              rowLoadingId={rowLoadingId}
              onPageChange={handlePageChange}
              onViewDetail={openDetail}
              onCancelOrder={handleCancelOrder}
              onOpenPayModal={openPayModal}
            />
          )}

          {/* Payment Modal */}
          <PaymentModal
            open={payModalOpen}
            order={payingOrder}
            selectedMethod={selectedPayMethod}
            setSelectedMethod={setSelectedPayMethod}
            loading={payLoading}
            onClose={closePayModal}
            onConfirm={handlePay}
          />

          {/* Success Modal */}
          <SuccessModal
            visible={successModalVisible}
            message={successMessage}
            onClose={() => setSuccessModalVisible(false)}
          />

          {/* Order Detail Drawer */}
          <OrderDetailDrawer
            open={detailOpen}
            order={detailOrder}
            onClose={closeDetail}
          />
        </PageContainer>
      </ConfigProvider>
    </DealerStaffLayout>
  );
}

export default OrderListStaffView;
