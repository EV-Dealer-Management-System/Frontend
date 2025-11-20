import React from "react";
import { ProTable } from "@ant-design/pro-components";
import { Tag, ConfigProvider, App } from "antd";
import AdminLayout from "../../../Components/Admin/AdminLayout";
import viVN from "antd/lib/locale/vi_VN";
import useDealerData from "./Components/useDealerData";
import useDealerTableColumns from "./Components/DealerTableColumns";
import DealerSearchToolbar from "./Components/DealerSearchToolbar";
import DealerRevenueModal from "./Components/DealerRevenueModal";
import DealerDebtDetailModal from "./Components/DealerDebtDetailModal";
import useDealerPolicyModal from "./Components/DealerPolicyModal";
import useUpdateDealerPolicyModal from "./Components/UpdateDealerPolicyModal";

function GetAllEVDealerPage() {
  const { modal } = App.useApp();

  // Sử dụng custom hook để quản lý dữ liệu
  const {
    dealerData,
    setDealerData,
    loading,
    pagination,
    setPagination,
    searchParams,
    setSearchParams,
    originalDealerData,
    searchKeyword,
    setSearchKeyword,
    updatingStatus,
    setUpdatingStatus,
    filterStatus,
    setFilterStatus,
    loadDealerData,
    handleTableChange,
  } = useDealerData();

  // Sử dụng modal chỉnh sửa policy
  const { handleOpenModal: handleEditPolicy, ModalComponent: UpdatePolicyModal } =
    useUpdateDealerPolicyModal(modal, loadDealerData);

  // Sử dụng các modal components
  const { handleViewRevenue } = DealerRevenueModal({ modal });
  const { handleViewDebtDetail } = DealerDebtDetailModal({ modal });
  const { handleViewPolicy } = useDealerPolicyModal(modal, handleEditPolicy);

  // Sử dụng custom hook để tạo cột bảng
  const columns = useDealerTableColumns({
    pagination,
    updatingStatus,
    setUpdatingStatus,
    loadDealerData,
    modal,
    onViewRevenue: handleViewRevenue,
    onViewDebtDetail: handleViewDebtDetail,
    onViewPolicy: handleViewPolicy,
  });

  return (
    <AdminLayout>
      <UpdatePolicyModal />
      <div className="h-screen flex flex-col">
        <div className="flex-1 bg-white overflow-hidden">
          <ConfigProvider locale={viVN}>
            <ProTable
              columns={columns}
              dataSource={dealerData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} đại lý`,
                pageSizeOptions: ["10", "20", "50", "100"],
                onChange: (page, pageSize) => {
                  const newPagination = { current: page, pageSize };
                  setPagination((prev) => ({ ...prev, ...newPagination }));
                  loadDealerData({ pageNumber: page, pageSize });
                },
              }}
              onChange={handleTableChange}
              scroll={{
                y: "calc(100vh - 240px)",
              }}
              search={false}
              options={{
                reload: () => loadDealerData(),
                density: true,
                fullScreen: true,
                setting: true,
              }}
              headerTitle={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-800">
                    Danh Sách Đại Lý
                  </span>
                  <Tag color="blue" className="ml-1">
                    Tổng: {pagination.total}
                  </Tag>
                </div>
              }
              toolBarRender={() => (
                <DealerSearchToolbar
                  searchKeyword={searchKeyword}
                  setSearchKeyword={setSearchKeyword}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  dealerData={dealerData}
                  setDealerData={setDealerData}
                  originalDealerData={originalDealerData}
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  pagination={pagination}
                  loadDealerData={loadDealerData}
                  setPagination={setPagination}
                />
              )}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }
              size="middle"
              bordered
              tableAlertRender={false}
              cardBordered={false}
              sticky={{
                offsetHeader: 0,
              }}
            />
          </ConfigProvider>
        </div>
      </div>
    </AdminLayout>
  );
}

export default GetAllEVDealerPage;
