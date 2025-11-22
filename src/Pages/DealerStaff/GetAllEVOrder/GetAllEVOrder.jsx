import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import { Space, Spin, App } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";
import { getAllCustomerOrders } from "../../../App/DealerStaff/EVOrders/GetAllCustomerOrders";
import { cancelCustomerOrder } from "../../../App/DealerStaff/EVOrders/CancelCustormerOrder";
import { payCustomerOrder, payDepositCustomerOrder } from "../../../App/DealerStaff/EVOrders/PaymentService";
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
  const { message } = App.useApp();
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
  const fetchOrders = async (page = 1, pageSize = 1000, { silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const params = {
        pageNumber: page,
        pageSize: pageSize,
      };

      const response = await getAllCustomerOrders(params);

      if (response?.isSuccess && response.result) {
        const { data, pagination: serverPaging } = response.result;
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
          response?.message || 
          response?.errors?.[0] || 
          "Không tải được danh sách đơn hàng từ máy chủ"
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
    
    console.log("=== PAYMENT DEBUG START ===");
    console.log("Order data:", payingOrder);
    console.log("Payment method:", method);
    console.log("Order status:", payingOrder.status);
    
    try {
      setPayLoading(true);
      
      const isCash = method === "cash";
      let result;
      
      // Xác định API cần gọi dựa trên trạng thái đơn hàng
      if (payingOrder.status === 4 || payingOrder.status === 8) {
        // Đang cọc - gửi xác nhận (isCash = null)
        console.log("Calling payDepositCustomerOrder for confirmation (status 4 or 8)");
        console.log("API params:", { orderId: payingOrder.id, isCash: null });
        result = await payDepositCustomerOrder(payingOrder.id, null);
      } else if (payingOrder.status === 9) {
        // Chờ thanh toán phần còn lại - thanh toán phần còn lại
        console.log("Calling payDepositCustomerOrder for remaining payment (status 9)");
        console.log("API params:", { orderId: payingOrder.id, isCash });
        result = await payDepositCustomerOrder(payingOrder.id, isCash);
      } else if (payingOrder.status === 0 || payingOrder.status === 3) {
        // Chờ thanh toán toàn phần (0) hoặc chờ cọc (1) - thanh toán mới
        const isPayFull = payingOrder.status === 0; // true nếu thanh toán toàn phần, false nếu chỉ cọc
        console.log("Calling payCustomerOrder for new payment (status 0 or 1)");
        console.log("API params:", { orderId: payingOrder.id, isPayFull, isCash });
        result = await payCustomerOrder(payingOrder.id, isPayFull, isCash);
      }
      
      console.log("=== API RESPONSE ===");
      console.log("Full API result:", result);
      console.log("isSuccess:", result?.isSuccess);
      console.log("message:", result?.message);
      console.log("errors:", result?.errors);
      console.log("result data:", result?.result);
      
      if (result?.isSuccess) {
        let successMsg;
        if (payingOrder.status === 4 || payingOrder.status === 8) {
          // Gửi xác nhận cho khách hàng
          successMsg = "Gửi xác nhận thành công! Vui lòng nhắc nhở khách hàng kiểm tra email để xác nhận thanh toán.";
        } else if (isCash) {
          successMsg = "Ghi nhận thanh toán tiền mặt thành công";
        } else {
          successMsg = "Tạo yêu cầu thanh toán thành công. Kính mong khách hàng kiểm tra thư điện tử để thực hiện thanh toán";
        }
        
        setSuccessMessage(successMsg);
        setSuccessModalVisible(true);
        closePayModal();
        fetchOrders(pagination.current, pagination.pageSize, { silent: true });
      } else {
        console.log("=== PAYMENT FAILED ===");
        console.log("Failed result:", result);
        message.error(result?.message || "Thanh toán thất bại");
      }
    } catch (e) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Error details:", e);
      console.error("Error message:", e.message);
      console.error("Error response:", e.response?.data);
      message.error("Có lỗi xảy ra khi thanh toán");
    } finally {
      setPayLoading(false);
      console.log("=== PAYMENT DEBUG END ===");
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
        <App>
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
        </App>
      </ConfigProvider>
    </DealerStaffLayout>
  );
}

export default OrderListStaffView;
