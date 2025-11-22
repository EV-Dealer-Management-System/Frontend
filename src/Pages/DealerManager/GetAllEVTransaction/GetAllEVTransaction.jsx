import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  TransactionOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { GetAllEVTransaction } from "../../../App/DealerManager/GetAllEVTransaction/GetAllEVTransaction";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import moment from "moment";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

function GetAllEVTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} của ${total} giao dịch`,
  });
  const [filters, setFilters] = useState({
    search: "",
    provider: "",
    status: "",
    dateRange: null,
  });
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    averageAmount: 0,
  });

  // Tải dữ liệu giao dịch
  const fetchTransactions = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await GetAllEVTransaction(page, pageSize);

      if (response.isSuccess) {
        const { data, pagination: paginationData } = response.result;
        setTransactions(data);
        setPagination((prev) => ({
          ...prev,
          current: paginationData.pageNumber,
          pageSize: paginationData.pageSize,
          total: paginationData.totalItems,
        }));

        // Tính toán thống kê
        calculateStatistics(data);
      } else {
        message.error("Không thể tải danh sách giao dịch");
      }
    } catch (error) {
      console.error("Lỗi khi tải giao dịch:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const calculateStatistics = (data) => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const successfulTransactions = data.filter(
      (item) => item.status === 1
    ).length;

    setStatistics({
      totalAmount,
      totalTransactions: data.length,
      successfulTransactions,
      averageAmount: data.length > 0 ? totalAmount / data.length : 0,
    });
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy trạng thái giao dịch
  const getStatusTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="success">Thành công</Tag>;
      case 0:
        return <Tag color="warning">Đang xử lý</Tag>;
      case 2:
        return <Tag color="error">Thất bại</Tag>;
      case 3:
        return <Tag color="purple">Đã hoàn tiền</Tag>;
      case 4:
        return <Tag color="default">Đã hủy</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Lấy màu provider
  const getProviderTag = (provider) => {
    const colors = {
      Cash: "green",
      VNPay: "blue",
      Momo: "magenta",
      ZaloPay: "cyan",
    };

    const displayNames = {
      Cash: "Tiền mặt",
      VNPay: "VNPay",
      Momo: "Momo",
      ZaloPay: "ZaloPay",
    };

    return (
      <Tag color={colors[provider] || "default"}>
        {displayNames[provider] || provider}
      </Tag>
    );
  };

  // Định nghĩa cột bảng
  const columns = [
    {
      title: "Mã GD",
      dataIndex: "orderRef",
      key: "orderRef",
      width: 100,
      fixed: "left",
      render: (text) => (
        <span className="font-semibold text-blue-600">#{text}</span>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "provider",
      key: "provider",
      width: 120,
      render: (provider) => getProviderTag(provider),
      filters: [
        { text: "Tiền mặt", value: "Cash" },
        { text: "VNPay", value: "VNPay" },
        { text: "Momo", value: "Momo" },
        { text: "ZaloPay", value: "ZaloPay" },
      ],
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Thành công", value: 1 },
        { text: "Đang xử lý", value: 0 },
        { text: "Thất bại", value: 2 },
        { text: "Đã hoàn tiền", value: 3 },
        { text: "Đã hủy", value: 4 },
      ],
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => (
        <Tooltip title={moment(date).format("DD/MM/YYYY HH:mm:ss")}>
          <div className="text-sm">
            <div>{moment(date).format("DD/MM/YYYY")}</div>
            <div className="text-gray-500">{moment(date).format("HH:mm")}</div>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: {
        showTitle: false,
      },
      render: (note) => (
        <Tooltip title={note} placement="topLeft">
          <span className="text-gray-600 text-sm">{note}</span>
        </Tooltip>
      ),
    },
  ];

  // Xử lý thay đổi bảng
  const handleTableChange = (paginationConfig) => {
    fetchTransactions(paginationConfig.current, paginationConfig.pageSize);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Xử lý reset filter
  const handleReset = () => {
    setFilters({
      search: "",
      provider: "",
      status: "",
      dateRange: null,
    });
    message.success("Đã đặt lại bộ lọc");
    fetchTransactions(1, pagination.pageSize);
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const response = await GetAllEVTransaction(1, 10);

        if (response.isSuccess) {
          const { data, pagination: paginationData } = response.result;
          setTransactions(data);
          setPagination((prev) => ({
            ...prev,
            current: paginationData.pageNumber,
            pageSize: paginationData.pageSize,
            total: paginationData.totalItems,
          }));

          // Tính toán thống kê
          calculateStatistics(data);
        } else {
          message.error("Không thể tải danh sách giao dịch");
        }
      } catch (error) {
        console.error("Lỗi khi tải giao dịch:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  return (
    <DealerManagerLayout>
      <PageContainer
        title="Quản lý giao dịch thanh toán"
        subTitle="Theo dõi và quản lý tất cả giao dịch thanh toán của khách hàng"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchTransactions(1, pagination.pageSize)}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <Statistic
                title="Tổng giao dịch"
                value={statistics.totalTransactions}
                prefix={<TransactionOutlined className="text-blue-500" />}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <Statistic
                title="Thành công"
                value={statistics.successfulTransactions}
                prefix={<TransactionOutlined className="text-green-500" />}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <Statistic
                title="Tổng doanh thu"
                value={statistics.totalAmount}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined className="text-green-500" />}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
              <Statistic
                title="TB/giao dịch"
                value={statistics.averageAmount}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined className="text-orange-500" />}
                valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card className="mb-6" title="Bộ lọc tìm kiếm">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <Search
                placeholder="Tìm kiếm theo mã giao dịch, ghi chú..."
                allowClear
                enterButton="Tìm kiếm"
                onSearch={handleSearch}
                className="w-full"
              />
            </Col>
            {/* <Col xs={12} md={6} lg={4}>
                            <Select
                                placeholder="Phương thức"
                                allowClear
                                className="w-full"
                                value={filters.provider}
                                onChange={(value) => setFilters(prev => ({ ...prev, provider: value }))}
                            >
                                <Option value="Cash">Tiền mặt</Option>
                                <Option value="VNPay">VNPay</Option>
                                <Option value="Momo">Momo</Option>
                                <Option value="ZaloPay">ZaloPay</Option>
                            </Select>
                        </Col> */}
            {/* <Col xs={12} md={6} lg={4}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                className="w-full"
                                value={filters.status}
                                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <Option value={1}>Thành công</Option>
                                <Option value={0}>Đang xử lý</Option>
                                <Option value={-1}>Thất bại</Option>
                            </Select>
                        </Col> */}
            <Col xs={24} md={12} lg={6}>
              <RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                format="DD/MM/YYYY"
                className="w-full"
                value={filters.dateRange}
                onChange={(dates) =>
                  setFilters((prev) => ({ ...prev, dateRange: dates }))
                }
              />
            </Col>
            <Col xs={24} md={12} lg={2}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                className="w-full"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Bảng giao dịch */}
        <Card
          title={`Danh sách giao dịch (${pagination.total || 0})`}
          extra={
            <Space>
              <span className="text-sm text-gray-500">
                Cập nhật: {moment().format("HH:mm DD/MM/YYYY")}
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `Hiển thị ${range[0]}-${range[1]} của ${total} giao dịch`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            size="middle"
            rowClassName={(record) =>
              `hover:bg-blue-50 transition-colors cursor-pointer ${
                record.status === 1
                  ? "bg-green-50"
                  : record.status === 2
                  ? "bg-red-50"
                  : record.status === 3
                  ? "bg-purple-50"
                  : record.status === 4
                  ? "bg-gray-50"
                  : "bg-yellow-50"
              }`
            }
            locale={{
              emptyText: "Không có dữ liệu giao dịch",
              filterTitle: "Bộ lọc",
              filterConfirm: "Áp dụng",
              filterReset: "Đặt lại",
              selectAll: "Chọn tất cả",
              selectInvert: "Đảo ngược",
            }}
          />
        </Card>
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default GetAllEVTransactions;
