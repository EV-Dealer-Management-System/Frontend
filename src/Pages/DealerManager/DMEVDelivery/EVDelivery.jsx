import React, { useState, useEffect, useRef } from "react";
import { Card, message, Input } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import { getAllEVDelivery } from "../../../App/DealerManager/EVDelivery/GetAllEVDelivery";
import DeliveryTable from "./Components/DeliveryTable";
import StatusFilter from "./Components/StatusFilter";
import DeliveryDetailModal from "./Components/DeliveryDetailModal";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
import * as signalR from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";

const { Search } = Input;

function DMEVDelivery() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [templateSummary, setTemplateSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Refs to store latest pagination and filter values for SignalR callback
  const paginationRef = useRef(pagination);
  const selectedStatusRef = useRef(selectedStatus);

  // Update refs when state changes
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    selectedStatusRef.current = selectedStatus;
  }, [selectedStatus]);

  // Fetch dữ liệu giao xe
  const fetchDeliveries = async (
    pageNumber = 1,
    pageSize = 10,
    status = null
  ) => {
    setLoading(true);
    try {
      const response = await getAllEVDelivery(pageNumber, pageSize, status);

      if (response.isSuccess) {
        setDeliveries(response.result.data);
        setTemplateSummary(response.result.templateSummary || []);
        setPagination({
          current: response.result.pagination.pageNumber,
          pageSize: response.result.pagination.pageSize,
          total: response.result.pagination.totalItems,
        });
      } else {
        message.error(response.message || "Không thể tải danh sách giao xe");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDeliveries(1, 10, null);
  }, []);

  // Setup SignalR connection for real-time updates
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("jwt_token");
    const decodedToken = token ? jwtDecode(token) : null;
    const dealerId = decodedToken?.DealerId;

    console.log("🔍 Token DealerId:", dealerId);

    if (!dealerId) {
      console.error("❌ DealerId not found in token");
      return;
    }

    const base = import.meta.env.VITE_API_URL || "https://localhost:7269";
    console.log("🌐 Connecting to:", `${base}/notificationHub`);

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${base}/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem("jwt_token") || "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event handler BEFORE starting connection
    conn.on("ReceiveVehicleDeliveryStatusUpdate", (data) => {
      console.log("🔔 ReceiveVehicleDeliveryStatusUpdate received!", data);
      if (!isMounted) {
        console.log("⚠️ Component unmounted, skipping refresh");
        return;
      }
      message.info("Trạng thái giao xe đã được cập nhật", 2);
      // Refresh the delivery list using latest pagination and filter values from refs
      const currentPagination = paginationRef.current;
      const currentStatus = selectedStatusRef.current;
      console.log("📊 Refreshing with:", {
        page: currentPagination.current,
        pageSize: currentPagination.pageSize,
        status: currentStatus,
      });
      fetchDeliveries(
        currentPagination.current,
        currentPagination.pageSize,
        currentStatus
      );
    });

    conn
      .start()
      .then(() => {
        if (!isMounted) {
          console.log("⚠️ Component unmounted during connection");
          return;
        }

        console.log("✅ SignalR Connected - Connection ID:", conn.connectionId);
        console.log(
          `📡 Listening for: ReceiveVehicleDeliveryStatusUpdate (DealerId: ${dealerId})`
        );
        console.log("💡 Backend should auto-join user to group based on token");
      })
      .catch((err) => {
        console.error("❌ SignalR Connection Error:", err);
        console.error("Error details:", err.message);
      });

    return () => {
      console.log("🔌 Cleaning up SignalR connection (EVDelivery)");
      isMounted = false;
      conn.off("ReceiveVehicleDeliveryStatusUpdate");
      conn.stop().catch(() => {});
    };
  }, []);

  // Xử lý thay đổi phân trang
  const handleTableChange = (paginationConfig) => {
    fetchDeliveries(
      paginationConfig.current,
      paginationConfig.pageSize,
      selectedStatus
    );
  };

  // Xử lý lọc theo trạng thái
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    fetchDeliveries(1, pagination.pageSize, value);
  };

  // Hiển thị chi tiết giao xe
  const handleViewDetail = (record) => {
    setSelectedDelivery(record);
    setDetailVisible(true);
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedDelivery(null);
  };

  // Xử lý khi cập nhật trạng thái thành công
  const handleStatusUpdated = () => {
    fetchDeliveries(pagination.current, pagination.pageSize, selectedStatus);
  };

  return (
    <DealerManagerLayout>
      <ConfigProvider locale={viVN}>
        <PageContainer
          title="Theo dõi giao xe"
          subTitle="Theo dõi tiến trình giao xe từ nhà sản xuất đến đại lý"
          extra={[
            <Search
              key="search"
              placeholder="Tìm kiếm theo mã giao xe hoặc mô tả"
              onSearch={(value) => console.log("Search value:", value)}
              style={{ width: 300 }}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />,
            <StatusFilter
              key="status-filter"
              value={selectedStatus}
              onChange={handleStatusChange}
            />,
          ]}
        >
          <Card className="shadow-sm">
            <DeliveryTable
              data={deliveries.filter(
                (d) =>
                  d.bookingEVId
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase()) ||
                  d.description
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase())
              )}
              loading={loading}
              pagination={pagination}
              onTableChange={handleTableChange}
              onViewDetail={handleViewDetail}
            />
          </Card>

          <DeliveryDetailModal
            visible={detailVisible}
            onClose={handleCloseDetail}
            delivery={selectedDelivery}
            templateSummary={templateSummary}
            onStatusUpdated={handleStatusUpdated}
          />
        </PageContainer>
      </ConfigProvider>
    </DealerManagerLayout>
  );
}

export default DMEVDelivery;
