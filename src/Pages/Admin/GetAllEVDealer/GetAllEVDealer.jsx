import React, { useState, useEffect, useCallback } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Tag, Badge, message, Input, Switch, Modal, App, Select } from "antd";
import AdminLayout from "../../../Components/Admin/AdminLayout";
import { GetAllEVDealer, updateDealerStatus } from "../../../App/EVMAdmin/GetAllEVDealer/GetAllEVDealer";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
function GetAllEVDealerPage() {
  const [dealerData, setDealerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    filterOn: "",
    filterQuery: "",
    sortBy: "",
    isAscending: true,
    status: undefined, // Thêm status vào searchParams để gọi API
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [originalDealerData, setOriginalDealerData] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [filterStatus, setFilterStatus] = useState(null);

  const { modal } = App.useApp();
  const { Search } = Input;

  // Hàm load dữ liệu đại lý với params
  const loadDealerData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const queryParams = {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          ...searchParams,
          ...params,
        };

        const response = await GetAllEVDealer(queryParams);
        if (response.isSuccess) {
          setDealerData(response.result.data);
          // Chỉ cập nhật originalDealerData khi không có filter để search hoạt động đúng
          if (!queryParams.status) {
            setOriginalDealerData(response.result.data);
          }
          setPagination((prev) => ({
            ...prev,
            total: response.result.pagination.totalItems,
            current: response.result.pagination.pageNumber,
          }));
        } else {
          message.error("Không thể tải dữ liệu đại lý");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu đại lý");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    loadDealerData();
  }, [loadDealerData]);

  // Hàm xử lý sort
  const handleTableChange = (paginationConfig, filters, sorter) => {
    const newPagination = {
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };

    setPagination((prev) => ({ ...prev, ...newPagination }));

    let sortParams = {};
    if (sorter.field) {
      sortParams = {
        sortBy: sorter.field,
        isAscending: sorter.order === "ascend",
      };
      setSearchParams((prev) => ({ ...prev, ...sortParams }));
    }

    loadDealerData({
      pageNumber: newPagination.current,
      pageSize: newPagination.pageSize,
      ...sortParams,
    });
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record, index) => (
        <span className="font-medium text-gray-600">
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Tên Đại Lý",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Tên Quản Lý",
      dataIndex: "managerName",
      key: "managerName",
      sorter: true,
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Email Quản Lý",
      dataIndex: "managerEmail",
      key: "managerEmail",
      sorter: true,
      render: (email) => <span className="text-blue-500">{email}</span>,
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => <span className="text-gray-600">{address}</span>,
    },
    {
      title: "Mã Số Thuế",
      dataIndex: "taxNo",
      key: "taxNo",
      width: 120,
      align: "center",
      render: (taxNo) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {taxNo}
        </span>
      ),
    },
    {
      title: "Cấp Độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: "center",
      render: (level) => {
        const levelConfig = {
          1: { color: "gold", text: "Cấp 1" },
          2: { color: "blue", text: "Cấp 2" },
          3: { color: "green", text: "Cấp 3" },
        };
        const config = levelConfig[level] || {
          color: "default",
          text: `Cấp ${level}`,
        };

        return (
          <Tag color={config.color} className="font-medium">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "dealerStatus",
      key: "dealerStatus",
      width: 180,
      align: "center",
      render: (status, record) => {
        const isActive = status === 0;

        const handleToggle = (checked) => {
          const newStatus = checked ? 0 : 1; // 0 = active, 1 = inactive

          // If deactivating (newStatus === 1) show confirm modal
          if (newStatus === 1) {
            modal.confirm({
              title: 'Xác nhận vô hiệu hóa đại lý',
              content: `Bạn có chắc muốn đặt đại lý "${record.name}" về trạng thái Không hoạt động?`,
              okText: 'Vô hiệu hóa',
              okType: 'danger',
              cancelText: 'Hủy',
              onOk: async () => {
                try {
                  setUpdatingStatus((prev) => ({ ...prev, [record.id]: true }));
                  const res = await updateDealerStatus(record.id, newStatus);
                  if (res && res.isSuccess !== false) {
                    message.success('Cập nhật trạng thái thành công');
                    loadDealerData();
                  } else {
                    message.error(res?.message || 'Không thể cập nhật trạng thái');
                  }
                } catch (err) {
                  console.error('Error updating dealer status:', err);
                  message.error('Lỗi khi cập nhật trạng thái');
                } finally {
                  setUpdatingStatus((prev) => ({ ...prev, [record.id]: false }));
                }
              },
            });
          } else {
            // Activating - call API directly
            (async () => {
              try {
                setUpdatingStatus((prev) => ({ ...prev, [record.id]: true }));
                const res = await updateDealerStatus(record.id, newStatus);
                if (res && res.isSuccess !== false) {
                  message.success('Cập nhật trạng thái thành công');
                  loadDealerData();
                } else {
                  message.error(res?.message || 'Không thể cập nhật trạng thái');
                }
              } catch (err) {
                console.error('Error updating dealer status:', err);
                message.error('Lỗi khi cập nhật trạng thái');
              } finally {
                setUpdatingStatus((prev) => ({ ...prev, [record.id]: false }));
              }
            })();
          }
          
        };

        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Switch
              checked={isActive}
              checkedChildren="Hoạt Động"
              unCheckedChildren="Tạm Ngừng"
              onChange={handleToggle}
              loading={!!updatingStatus[record.id]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
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

            toolBarRender={() => [
              <Search
                key="search"
                placeholder="Tìm kiếm theo tên đại lý hoặc quản lý"
                allowClear
                style={{ width: 300 }}
                value={searchKeyword}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  setSearchKeyword(value);

                  // Nếu đang có filter status thì tìm kiếm trong dữ liệu đã được filter
                  // Nếu không có filter status thì tìm trong originalDealerData
                  const dataToSearch = filterStatus !== null ? dealerData : originalDealerData;

                  if (!value) {
                    // Nếu xóa hết từ khóa search
                    if (filterStatus !== null) {
                      // Nếu đang filter status thì giữ nguyên dữ liệu đã filter
                      return;
                    } else {
                      // Nếu không filter status thì hiển thị lại toàn bộ
                      setDealerData(originalDealerData);
                      return;
                    }
                  }

                  const filtered = dataToSearch.filter(
                    (item) =>
                      item.name?.toLowerCase().includes(value) ||
                      item.managerName?.toLowerCase().includes(value) ||
                      item.managerEmail?.toLowerCase().includes(value)
                  );
                  setDealerData(filtered);
                }}
                
              />,
               <Select
                key="statusFilter"
                placeholder="Lọc trạng thái"
                allowClear
                style={{ width: 160 }}
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);

                  // Cập nhật searchParams với status filter
                  const newSearchParams = {
                    ...searchParams,
                    status: value !== null ? Number(value) : undefined,
                  };
                  setSearchParams(newSearchParams);

                  // Reset về trang đầu khi filter
                  setPagination((prev) => ({ ...prev, current: 1 }));

                  // Gọi API với status filter
                  loadDealerData({
                    pageNumber: 1,
                    pageSize: pagination.pageSize,
                    status: value !== null ? Number(value) : undefined,
                  });
                }}
                options={[
                  { label: "Hoạt động", value: 0 },
                  { label: "Tạm ngừng", value: 1 },
                ]}
              />,
            ]}
            
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
