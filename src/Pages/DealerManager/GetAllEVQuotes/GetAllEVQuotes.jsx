import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { message } from "antd";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import { getAllEVQuotes } from "../../../App/DealerManager/EVQuotes/GetAllEVQuotes";
import { updateEVQuotesStatus } from "../../../App/DealerManager/EVQuotes/UpdatEVQuotesStatus";

// Import các components
import StatisticsCards from "./Components/StatisticsCards.jsx";
import FilterControls from "./Components/FilterControls.jsx";
import QuotesTable from "./Components/QuotesTable.jsx";
import getPageHeaderConfig from "./Components/PageHeader.jsx";
import LoadingSpinner from "./Components/LoadingSpinner.jsx";
import ErrorDisplay from "./Components/ErrorDisplay.jsx";
import QuoteDetailModal from "./Components/QuoteDetailModal.jsx";

function GetAllEVQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null); // Filter state

  // Fetch quotes data
  const fetchQuotes = async (pageNum = 1, pageSize = 10, statusFilter = null) => {
    try {
      setLoading(true);
      setError(null);
      const quotesData = await getAllEVQuotes(pageNum, pageSize, statusFilter);

      // API trả về mảng trực tiếp sau khi đã xử lý trong service
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      const errorMsg = "Lỗi kết nối server. Vui lòng thử lại sau.";
      setError(errorMsg);
      message.error("Không thể tải danh sách báo giá");
      setQuotes([]); // Set empty array khi có exception
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(1, 10, currentStatus);
  }, [currentStatus]);

  // Filter handlers
  const handleStatusFilter = (status) => {
    setCurrentStatus(status);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    // Đảm bảo quotes là array trước khi xử lý
    const quotesArray = Array.isArray(quotes) ? quotes : [];
    const total = quotesArray.length;

    // Status: 0 = Pending, 1 = Approved, 2 = Rejected
    const pending = quotesArray.filter((q) => q.status === 0).length;
    const approved = quotesArray.filter((q) => q.status === 1).length;
    const rejected = quotesArray.filter((q) => q.status === 2).length;

    // Calculate total amount
    const totalAmount = quotesArray.reduce(
      (sum, quote) => sum + (quote.totalAmount || 0),
      0
    );

    // Calculate approved amount
    const approvedAmount = quotesArray
      .filter((q) => q.status === 1)
      .reduce((sum, quote) => sum + (quote.totalAmount || 0), 0);

    return {
      total,
      pending,
      approved,
      rejected,
      totalAmount,
      approvedAmount,
    };
  }, [quotes]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get quote status
  const getQuoteStatus = (status) => {
    const statusMap = {
      0: { text: "Chờ duyệt", color: "gold" },
      1: { text: "Đã duyệt", color: "green" },
      2: { text: "Từ chối", color: "red" },
    };
    return statusMap[status] || { text: "Không xác định", color: "default" };
  };

  // Handle view quote details
  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuote(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchQuotes(1, 10, currentStatus);
  };

  // Handle create new quote - DealerManager không tạo quotes
  const handleCreateNew = () => {
    message.info("Chức năng tạo báo giá dành cho nhân viên bán hàng");
  };

  // Handle update quote status
  const handleUpdateStatus = async (quoteId, status, note = "") => {
    try {
      console.log("🚀 GetAllEVQuotes - handleUpdateStatus called with:", {
        quoteId,
        status,
        note,
      });
      console.log("🚀 GetAllEVQuotes - typeof status:", typeof status);

      const statusText = status === 1 ? "duyệt" : "từ chối";
      message.loading(`Đang ${statusText} báo giá...`, 0);

      console.log(
        "🚀 GetAllEVQuotes - Calling updateEVQuotesStatus with:",
        quoteId,
        status
      );
      const response = await updateEVQuotesStatus(quoteId, status);
      console.log("🚀 GetAllEVQuotes - API response:", response);

      message.destroy(); // Đóng loading message

      if (response.isSuccess) {
        message.success(
          `${status === 1 ? "Duyệt" : "Từ chối"} báo giá thành công!${note ? ` (Ghi chú: ${note})` : ""
          }`
        );

        // Cập nhật trạng thái trong state local
        setQuotes((prevQuotes) => {
          const quotesArray = Array.isArray(prevQuotes) ? prevQuotes : [];
          return quotesArray.map((quote) =>
            quote.id === quoteId
              ? { ...quote, status, note: note || quote.note }
              : quote
          );
        });
      } else {
        message.error(response.message || `Không thể ${statusText} báo giá`);
      }
    } catch (error) {
      message.destroy();
      console.error("Error updating quote status:", error);
      message.error("Lỗi kết nối server. Vui lòng thử lại sau.");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <DealerManagerLayout>
        <PageContainer title="Quản lý báo giá xe điện">
          <LoadingSpinner />
        </PageContainer>
      </DealerManagerLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <DealerManagerLayout>
        <PageContainer title="Quản lý báo giá xe điện">
          <ErrorDisplay error={error} onRetry={fetchQuotes} />
        </PageContainer>
      </DealerManagerLayout>
    );
  }

  // Get page header configuration
  const headerConfig = getPageHeaderConfig({
    totalQuotes: statistics.total,
    onRefresh: handleRefresh,
    onCreateNew: handleCreateNew,
  });

  return (
    <DealerManagerLayout>
      <PageContainer
        title={headerConfig.title}
        subTitle={headerConfig.subTitle}
        extra={headerConfig.extra}
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen"
      >
        <div className="space-y-6">
          {/* Filter Controls */}
          <FilterControls
            onStatusFilter={handleStatusFilter}
            onRefresh={handleRefresh}
            loading={loading}
          />

          {/* Statistics Overview */}
          <StatisticsCards
            statistics={statistics}
            formatCurrency={formatCurrency}
          />

          {/* Quotes Data Table */}
          <QuotesTable
            quotes={quotes}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getQuoteStatus={getQuoteStatus}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>

        {/* Quote Detail Modal */}
        <QuoteDetailModal
          visible={showDetailModal}
          quote={selectedQuote}
          onClose={handleCloseDetailModal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getQuoteStatus={getQuoteStatus}
        />
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default GetAllEVQuotes;
