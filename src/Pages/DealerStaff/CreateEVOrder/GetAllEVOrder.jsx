import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import {
  Table,
  Tag,
  Space,
  Typography,
  message,
  Spin,
  Modal,
  Button,
  Popconfirm,
  Drawer,
  Descriptions,
  Divider,
  List,
  Badge,
  Card,
  Row,
  Col,
  Input,
  Select
} from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  GiftOutlined,
  LoadingOutlined,
  BankOutlined,
  WalletOutlined,
  DollarOutlined,
  CarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";
import api from "../../../api/api";
import { cancelCustomerOrder } from "../../../App/DealerStaff/EVOrders/CancelCustormerOrder";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

const { Text, Title } = Typography;
const { Search } = Input;

// format tiền
const formatVnd = (n = 0) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫"
    : "0 ₫";

// map trạng thái đơn
const mapStatus = (status) => {
  switch (status) {
    case 0:
      return {
        text: "Chờ thanh toán toàn phần",
        color: "blue",
        icon: <ClockCircleOutlined />,
      };
    case 1:
      return {
        text: "Chờ cọc",
        color: "gold",
        icon: <ClockCircleOutlined />,
      };
    case 4:
      return {
        text: "Đang cọc",
        color: "geekblue",
        icon: <LoadingOutlined />,
      };
    case 5:
      return {
        text: "Hoàn tất",
        color: "green",
        icon: <CheckCircleOutlined />,
      };
    case 6:
      return {
        text: "Đã hủy",
        color: "red",
        icon: <StopOutlined />,
      };
    default:
      return {
        text: "Không xác định",
        color: "default",
        icon: <ClockCircleOutlined />,
      };
  }
};

// map trạng thái đơn
const statusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Chờ thanh toán toàn phần", value: 0 },
  { label: "Chờ cọc", value: 1 },
  { label: "Đang cọc", value: 4 },
  { label: "Hoàn tất", value: 5 },
  { label: "Đã hủy", value: 6 },
];

// map trạng thái EV
const mapEVStatus = (status) => {
  switch (status) {
    case 1:
      return { text: "Đang trong kho hãng", status: "success" };
    case 2:
      return { text: "Đang chờ", status: "processing" };
    case 3:
      return { text: "Xe đã được giữ cho đại lý", status: "warning" };
    case 4:
      return { text: "Đang vận chuyển", status: "processing" };
    case 5:
      return { text: "Đã bán", status: "success" };
    case 6:
      return { text: "Xe đang trong kho đại lý", status: "default" };
    case 7:
      return { text: "Bảo trì", status: "error" };
    case 8:
      return { text: "Xe đã được giữ cho khách hàng", status: "warning" };
    case 9:
      return { text: "Đã đặt cọc", status: "processing" };
    default:
      return { text: "Không rõ", status: "default" };
  }
};

function OrderListStaffView() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // loading từng dòng khi hủy
  const [rowLoadingId, setRowLoadingId] = useState(null);

  // modal thanh toán
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState(null);

  // drawer chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  //search
  const [searchText, setSearchText] = useState("");

  // filter trạng thái
  const [statusFilter, setStatusFilter] = useState("");
  // đọc location để lấy query param
  const location = useLocation();

  //
  const [ successModalVisible, setSuccessModalVisible ] = useState(false);
  const [ successMessage, setSuccessMessage ] = useState("");

  // tổng báo giá từ quoteDetails
  const calcQuoteTotal = (order) => {
    if (!order) return 0;
    const list = order.quoteDetails || [];
    return list.reduce((sum, qd) => sum + (qd?.totalPrice || 0), 0);
  };

  // fetch list từ BE (đã có phân trang)
  const fetchOrders = async (
    page = 1,
    pageSize = 10,
    { silent = false } = {}
  ) => {
    try {
      if (!silent) setLoading(true);

      const res = await api.get(
        `/CustomerOrder/get-all-customer-orders?pageNumber=${page}&pageSize=${pageSize}`
      );

      if (res.data?.isSuccess) {
        const { data, pagination: serverPaging } = res.data.result;

        setOrders(data || []);

        // BE của bạn có phân trang -> dùng luôn
        if (serverPaging) {
          setPagination({
            current: serverPaging.pageNumber,
            pageSize: serverPaging.pageSize,
            total: serverPaging.totalItems,
          });
        } else {
          // fallback
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

  // đổi trang / đổi pageSize
  const handlePageChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
  };

  // hủy đơn
  const handleCancelOrder = async (record) => {
    const { id } = record;
    try {
      setRowLoadingId(id);

      // optimistic
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 6 } : o))
      );

      const res = await cancelCustomerOrder(id);
      if (!res?.isSuccess) {
        message.error(res?.message || "Hủy đơn thất bại");
        // reload trang hiện tại
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

  // mở modal thanh toán
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

  // thanh toán
  const handlePay = async (method) => {
    if (!payingOrder || !method) return;
    try {
      setPayLoading(true);

     await api.put(
      `/CustomerOrder/pay-deposit-customer-order/${payingOrder.id}?isCash=${method === "cash"}`
    );

      message.success(
        method === "cash"
          ? "Ghi nhận thanh toán tiền mặt thành công"
          : "Tạo thanh toán VNPay thành công. Vui lòng kiểm tra email khách hàng."
      );
      const successMsg =
        method === "cash"
          ? "Ghi nhận thanh toán tiền mặt thành công"
          : "Tạo thanh toán VNPay thành công. Vui lòng kiểm tra email khách hàng.";
      setSuccessMessage(successMsg);
      setSuccessModalVisible(true);

      closePayModal();
      // refresh âm thầm
      fetchOrders(pagination.current, pagination.pageSize, { silent: true });
    } catch (e) {
      console.error(e);
      message.error("Thanh toán thất bại");
    } finally {
      setPayLoading(false);
    }
  };

  // mở/đóng drawer chi tiết
  const openDetail = (record) => {
    setDetailOrder(record);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setDetailOrder(null);
    setDetailOpen(false);
  };

  // header stats
  const headerStats = useMemo(() => {
    const total = pagination.total || orders.length;
    const pending = orders.filter((o) => [0, 1, 4].includes(o.status)).length;
    const done = orders.filter((o) => o.status === 5).length;
    const cancelled = orders.filter((o) => o.status === 6).length;
    return { total, pending, done, cancelled };
  }, [orders, pagination.total]);

  // list VIN
  const renderVinList = (order) => {
    const list = order?.orderDetails || [];
    if (!list.length) {
      return <Text type="secondary">Đơn này chưa có xe / chưa gán VIN.</Text>;
    }
    return (
      <List
        size="small"
        dataSource={list}
        renderItem={(item, idx) => {
          const ev = item.electricVehicle;
          const mapped = mapEVStatus(ev?.status);
          return (
            <List.Item>
              <Space direction="vertical" size={0} style={{ width: "100%" }}>
                <Space
                  align="center"
                  style={{ justifyContent: "space-between" }}
                >
                  <Text strong>
                    {idx + 1}. VIN: {ev?.vin || "—"}
                  </Text>
                  <Badge status={mapped.status} text={mapped.text} />
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {ev?.electricVehicleTemplate?.modelName} •{" "}
                  {ev?.electricVehicleTemplate?.versionName}
                </Text>
                {ev?.warehouse?.name && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Kho: {ev?.warehouse?.name}
                  </Text>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
    );
  };

  // columns
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderNo",
      key: "orderNo",
      align: "center",
      width: 150,
      render: (no) => <Text strong>#{no}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 700,
      render: (c) => (
        <Space direction="vertical" size={0}>
          <Text strong>{c?.fullName || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {c?.phoneNumber || "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tổng báo giá",
      key: "quoteTotal",
      align: "center",
      width: 600,
      render: (_, record) => {
        // ưu tiên totalAmount từ BE nếu > 0
        const quoteTotal =
          typeof record.totalAmount === "number" && record.totalAmount > 0
            ? record.totalAmount
            : calcQuoteTotal(record);
        return (
          <Text strong style={{ color: "#1677ff" }}>
            {formatVnd(quoteTotal)}
          </Text>
        );
      },
    },
    {
      title: "Đã cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      align: "right",
      width: 600,
      render: (v) => <Text strong>{formatVnd(v || 0)}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 180,
      render: (status) => {
        const s = mapStatus(status);
        return (
          <Tag color={s.color} icon={s.icon}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 170,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 230,
      render: (_, record) => {
        const actionBtns = [];

        // chi tiết
        actionBtns.push(
          <Button key="detail" size="small" onClick={() => openDetail(record)}>
            Chi tiết
          </Button>
        );

        // status 0,1 -> được hủy
        if (record.status === 0 || record.status === 1) {
          actionBtns.push(
            <Popconfirm
              key="cancel"
              title="Hủy đơn hàng?"
              description="Bạn chắc chắn muốn hủy đơn này?"
              onConfirm={() => handleCancelOrder(record)}
              okText="Hủy đơn"
              okButtonProps={{ danger: true }}
              cancelText="Không"
            >
              <Button
                danger
                size="small"
                loading={rowLoadingId === record.id}
              >
                Hủy đơn
              </Button>
            </Popconfirm>
          );
        }

        // status 4 -> thanh toán
        if (record.status === 4) {
          actionBtns.push(
            <Button
              key="pay"
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => openPayModal(record)}
            >
              Thanh toán
            </Button>
          );
        }

        return <Space>{actionBtns}</Space>;
      },
    },
  ];

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
        {/* THANH SEARCH + NÚT RELOAD */}
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col flex="auto">
            <Input.Search
            placeholder="Tìm theo tên hoặc SĐT khách hàng"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => fetchOrders(1, pagination.pageSize)}
            />
        </Col>
        <Col>
            <Select
            placeholder="Trạng thái"
            style={{ width: 180 }}
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => {
              // nếu người dùng clear => về "Tất cả"
              if (v === undefined) {
                setStatusFilter("");
              } else {
                setStatusFilter(v);
              }
            }}
            allowClear={statusFilter !== ""}
            />
        </Col>
        <Col>
            <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchOrders(1, pagination.pageSize)}
            >
            Tải lại
            </Button>
        </Col>
        </Row>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spin size="large" />
            
          </div>
        ) : (
            
          <Table
            rowKey="id"
            columns={columns}
            dataSource={orders.filter((o) => {
                const customer = o.customer || {};
                const search = searchText.trim().toLowerCase();
                const matchSearch =
                    !search ||
                    (customer.fullName || "").toLowerCase().includes(search) ||
                    (customer.phoneNumber || "").toLowerCase().includes(search);
                const matchStatus = statusFilter === "" || o.status === Number(statusFilter);
                return matchSearch && matchStatus;
            })}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            bordered
            className="shadow-sm rounded-lg overflow-hidden"
          />
        )}

        {/* MODAL THANH TOÁN */}
        <Modal
          open={payModalOpen}
          onCancel={closePayModal}
          footer={null}
          width={520}
          title={
            <Space align="center">
              <DollarOutlined />
              <span>Chọn phương thức thanh toán</span>
            </Space>
          }
          destroyOnHidden
        >
          {(() => {
            const quoteTotalFromDetails = calcQuoteTotal(payingOrder);
            const quoteTotal =
              payingOrder?.totalAmount && payingOrder.totalAmount > 0
                ? payingOrder.totalAmount
                : quoteTotalFromDetails;

            const deposited = payingOrder?.depositAmount || 0;
            const remain = Math.max(quoteTotal - deposited, 0);

            return (
              <Space direction="vertical" style={{ width: "100%" }} size={14}>
                <Card
                  size="small"
                  style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}
                  bordered
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={4}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Đơn hàng
                    </Text>
                    <Space wrap>
                      <Tag color="blue">#{payingOrder?.orderNo}</Tag>
                      <Text strong>
                        {payingOrder?.quoteDetails?.[0]?.version?.modelName ||
                          "Không rõ model"}
                      </Text>
                    </Space>

                    <Space align="baseline" wrap>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tổng báo giá
                      </Text>
                      <Text strong>{formatVnd(quoteTotal)}</Text>
                    </Space>

                    <Space align="baseline" wrap>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Đã thu (cọc)
                      </Text>
                      <Text>{formatVnd(deposited)}</Text>
                    </Space>

                    <Space
                      align="baseline"
                      wrap
                      style={{
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Cần thanh toán
                      </Text>
                      <Text
                        strong
                        style={{
                          fontSize: 18,
                          color: remain > 0 ? "#1677ff" : "#52c41a",
                        }}
                      >
                        {formatVnd(remain)}
                      </Text>
                    </Space>

                    {remain === 0 && (
                      <Tag color="green" style={{ marginTop: 4 }}>
                        Đã thu đủ
                      </Tag>
                    )}
                  </Space>
                </Card>

                {/* 2 option thanh toán */}
                <Space style={{ width: "100%" }} size={12}>
                  {/* VNPay */}
                  <Card
                    hoverable
                    onClick={() => setSelectedPayMethod("vnpay")}
                    style={{
                      flex: 1,
                      cursor: remain === 0 ? "not-allowed" : "pointer",
                      opacity: remain === 0 ? 0.4 : 1,
                      borderWidth: selectedPayMethod === "vnpay" ? 2 : 1,
                      borderColor:
                        selectedPayMethod === "vnpay"
                          ? "#1677ff"
                          : "var(--ant-color-border)",
                      background:
                        selectedPayMethod === "vnpay"
                          ? "rgba(22,119,255,0.04)"
                          : "#fff",
                      boxShadow:
                        selectedPayMethod === "vnpay"
                          ? "0 0 0 2px rgba(22,119,255,0.12)"
                          : "none",
                      transform:
                        selectedPayMethod === "vnpay"
                          ? "translateY(-2px)"
                          : "none",
                      transition: "all .15s ease-in-out",
                      pointerEvents: remain === 0 ? "none" : "auto",
                    }}
                  >
                    <Space direction="vertical" size={4}>
                      <Space>
                        <BankOutlined
                          style={{ color: "#1677ff", fontSize: 20 }}
                        />
                        <Text
                          strong
                          style={{
                            color:
                              selectedPayMethod === "vnpay"
                                ? "#1677ff"
                                : "inherit",
                          }}
                        >
                          VNPay
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Thanh toán online
                      </Text>
                    </Space>
                  </Card>

                  {/* Tiền mặt */}
                  <Card
                    hoverable
                    onClick={() => setSelectedPayMethod("cash")}
                    style={{
                      flex: 1,
                      cursor: remain === 0 ? "not-allowed" : "pointer",
                      opacity: remain === 0 ? 0.4 : 1,
                      borderWidth: selectedPayMethod === "cash" ? 2 : 1,
                      borderColor:
                        selectedPayMethod === "cash"
                          ? "#52c41a"
                          : "var(--ant-color-border)",
                      background:
                        selectedPayMethod === "cash"
                          ? "rgba(82,196,26,0.04)"
                          : "#fff",
                      boxShadow:
                        selectedPayMethod === "cash"
                          ? "0 0 0 2px rgba(82,196,26,0.12)"
                          : "none",
                      transform:
                        selectedPayMethod === "cash"
                          ? "translateY(-2px)"
                          : "none",
                      transition: "all .15s ease-in-out",
                      pointerEvents: remain === 0 ? "none" : "auto",
                    }}
                  >
                    <Space direction="vertical" size={4}>
                      <Space>
                        <WalletOutlined
                          style={{ color: "#52c41a", fontSize: 20 }}
                        />
                        <Text
                          strong
                          style={{
                            color:
                              selectedPayMethod === "cash"
                                ? "#52c41a"
                                : "inherit",
                          }}
                        >
                          Tiền mặt
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Ghi nhận thanh toán tại quầy
                      </Text>
                    </Space>
                  </Card>
                </Space>

                <Divider style={{ margin: "10px 0 0" }} />

                {/* Footer modal */}
                <Space
                  style={{ width: "100%", justifyContent: "flex-end" }}
                  size={8}
                >
                  <Button onClick={closePayModal}>Đóng</Button>
                  <Popconfirm
                    title="Xác nhận thanh toán"
                    description={
                      selectedPayMethod === "cash"
                        ? "Xác nhận khách đã thanh toán phần còn lại?"
                        : "Tạo yêu cầu VNPay cho phần còn lại?"
                    }
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => handlePay(selectedPayMethod)}
                    disabled={!selectedPayMethod || remain === 0}
                  >
                    <Button
                      type="primary"
                      disabled={!selectedPayMethod || remain === 0}
                      loading={payLoading}
                    >
                      Xác nhận thanh toán
                    </Button>
                  </Popconfirm>
                </Space>
              </Space>
            );
          })()}
        </Modal>
        <Modal
        open={successModalVisible}
          onCancel={() => setSuccessModalVisible(false)}
          footer={[
            <Button key="ok" type="primary" onClick={() => setSuccessModalVisible(false)}>
              Đóng
            </Button>,
        ]}
        title="Thông báo"
        >
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          <Text strong style={{ fontSize: 16, textAlign: "center" }}>
            {successMessage}
          </Text>
        </Space>
        </Modal>

        {/* DRAWER CHI TIẾT */}
        <Drawer
          open={detailOpen}
          onClose={closeDetail}
          width={520}
          title={
            <Space>
              <CarOutlined />
              <span>Chi tiết đơn hàng</span>
              {detailOrder?.orderNo && (
                <Tag color="blue">#{detailOrder.orderNo}</Tag>
              )}
            </Space>
          }
        >
          {detailOrder ? (
            <>
              <Descriptions
                size="small"
                column={1}
                bordered
                labelStyle={{ width: 140 }}
              >
                <Descriptions.Item label="Trạng thái">
                  {(() => {
                    const s = mapStatus(detailOrder.status);
                    return (
                      <Tag color={s.color} icon={s.icon}>
                        {s.text}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng báo giá">
                  {formatVnd(
                    detailOrder.totalAmount && detailOrder.totalAmount > 0
                      ? detailOrder.totalAmount
                      : calcQuoteTotal(detailOrder)
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Đã cọc">
                  {formatVnd(detailOrder.depositAmount || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {detailOrder.createdAt
                    ? new Date(detailOrder.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong>
                  <UserOutlined /> Khách hàng
                </Text>
                <Text>{detailOrder.customer?.fullName}</Text>
                <Text type="secondary">
                  <PhoneOutlined /> {detailOrder.customer?.phoneNumber}
                </Text>
                <Text type="secondary">
                  <MailOutlined /> {detailOrder.customer?.email}
                </Text>
                <Text type="secondary">
                  <EnvironmentOutlined /> {detailOrder.customer?.address}
                </Text>
              </Space>

              <Divider />

              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text strong>
                  <FileTextOutlined /> Chi tiết báo giá
                </Text>
                
                {detailOrder.quoteDetails?.length ? (
                  <div style={{ 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 6, 
                    padding: 12,
                    background: '#fafafa'
                  }}>
                    {/* Header tổng quan */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <Text strong>
                        Báo giá ({detailOrder.quoteDetails.length} sản phẩm)
                      </Text>
                      <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
                        {formatVnd(
                          detailOrder.totalAmount && detailOrder.totalAmount > 0
                            ? detailOrder.totalAmount
                            : calcQuoteTotal(detailOrder)
                        )}
                      </Text>
                    </div>
                    
                    {/* Danh sách sản phẩm */}
                    {detailOrder.quoteDetails.map((detail, index) => (
                      <div 
                        key={detail.id || index}
                        style={{
                          marginBottom: index < detailOrder.quoteDetails.length - 1 ? 12 : 0,
                          paddingBottom: index < detailOrder.quoteDetails.length - 1 ? 12 : 0,
                          borderBottom: index < detailOrder.quoteDetails.length - 1 ? '1px dashed #d9d9d9' : 'none'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: 4 
                        }}>
                          <Text strong style={{ fontSize: 13 }}>
                            {detail.version?.modelName} - {detail.version?.versionName}
                          </Text>
                          <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
                            {formatVnd(detail.totalPrice)}
                          </Text>
                        </div>
                        
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                          Màu: {detail.color?.colorName || '—'} • 
                          Số lượng: {detail.quantity} • 
                          Đơn giá: {formatVnd(detail.unitPrice)}
                        </div>
                        
                        {detail.promotion?.promotionName && (
                          <Tag 
                            color="purple" 
                            icon={<GiftOutlined />}
                            size="small"
                            style={{ fontSize: 11 }}
                          >
                            {detail.promotion.promotionName}
                          </Tag>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Không có chi tiết báo giá</Text>
                )}
              </Space>

              <Divider />

              <Text strong>Danh sách VIN</Text>
              <div style={{ marginTop: 8, maxHeight: 240, overflow: "auto" }}>
                {renderVinList(detailOrder)}
              </div>
            </>
          ) : (
            <Text type="secondary">Không có dữ liệu</Text>
          )}
        </Drawer>
      </PageContainer>
        </ConfigProvider>
    </DealerStaffLayout>
  );
}

export default OrderListStaffView;
