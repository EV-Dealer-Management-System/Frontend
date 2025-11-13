import React, { useState, useEffect, useMemo } from "react";
import {
    message,
    Layout,
    Tag,
    Row,
    Col,
    Card,
    Progress,
    Statistic,
} from "antd";
import {
    PageContainer,
    ProCard,
    StatisticCard,
} from "@ant-design/pro-components";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
    FileTextOutlined,
    TrophyOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { getAllEVBookings } from "../../../App/DealerManager/EVBooking/GetAllEVBooking";
import { getBookingById } from "../../../App/DealerManager/EVBooking/GetBookingByID";
import { getEContractById, getEContractPreview } from "../../../App/DealerManager/EVBooking/GetBookingContract";
import PDFModal from "../../../Pages/Admin/SignContract/Components/PDF/PDFModal";
import EVMEContractEditor from './Components/EVMEContractEditor';
import NavigationBar from "../../../Components/EVMStaff/Components/NavigationBar";
import HeaderBar from "../../../Components/EVMStaff/Components/HeaderBar";
import BookingFilters from "./Components/BookingFilters";
import BookingTable from "./Components/BookingTable";
import BookingDetailDrawer from "./Components/BookingDetailDrawer";
import StatusDistributionChart from "./Components/StatusDistributionChart";
import TrendChart from "./Components/TrendChart";

const { Content } = Layout;

function EVMGetAllEVBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [dateRange, setDateRange] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // PDF modal states
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfTitle, setPdfTitle] = useState(null);
    const [pdfBlobObjectUrl, setPdfBlobObjectUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    
    // Template Editor states for EContract editing
    const [templateEditorVisible, setTemplateEditorVisible] = useState(false);
    const [selectedEContract, setSelectedEContract] = useState(null);
    const [templateEditorLoading, setTemplateEditorLoading] = useState(false);

    // Xử lý responsive
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Load danh sách booking khi component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // Lấy danh sách booking từ API
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getAllEVBookings();

            if (response && response.isSuccess) {
                // API trả về: response.result.data (array)
                const data = response.result?.data || response.result || response.data || [];
                const bookingsList = Array.isArray(data) ? data : [];

                // Map data để thêm thông tin từ bookingEVDetails
                const enhancedBookings = bookingsList.map((booking) => {
                    // Tính tổng số lượng xe từ bookingEVDetails
                    const totalQuantity =
                        booking.totalQuantity ||
                        booking.bookingEVDetails?.reduce(
                            (sum, detail) => sum + (detail.quantity || 0),
                            0
                        ) ||
                        0;

                    // Tính tổng giá trị
                    const totalAmount =
                        booking.totalAmount ||
                        booking.bookingEVDetails?.reduce(
                            (sum, detail) => sum + (detail.totalPrice || 0),
                            0
                        ) ||
                        0;

                    return {
                        ...booking,
                        totalQuantity,
                        totalAmount,
                        // Đảm bảo giữ nguyên bookingEVDetails và eContract
                        bookingEVDetails: booking.bookingEVDetails || [],
                        eContract: booking.eContract || null,
                    };
                });

                setBookings(enhancedBookings);
                message.success(`Đã tải ${enhancedBookings.length} booking thành công`);
            } else {
                message.error(response?.message || "Không thể tải danh sách booking");
                setBookings([]);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            message.error("Có lỗi khi tải danh sách booking");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Xem chi tiết booking
    const handleViewDetail = async (record) => {
        setDetailDrawerVisible(true);
        setDetailLoading(true);
        setSelectedBooking(null); // Reset trước khi fetch

        try {
            const response = await getBookingById(record.id);

            if (response && response.isSuccess) {
                setSelectedBooking(response.result);
            } else {
                message.error(response?.message || "Không thể tải chi tiết booking");
                setDetailDrawerVisible(false);
            }
        } catch (error) {
            console.error("Error fetching booking details:", error);
            message.error("Có lỗi khi tải chi tiết booking");
            setDetailDrawerVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    // Reset bộ lọc
    const handleResetFilters = () => {
        setSearchText("");
        setActiveTab("all");
        setDateRange(null);
    };

    // Mở eContract PDF: sử dụng eContract từ booking data
    const handleOpenEContractPdf = async (record) => {
        // Sử dụng eContract đã có trong booking data
        if (!record?.eContract?.id) {
            message.warning("Không có eContract liên kết cho booking này");
            return;
        }

        const eContract = record.eContract;
        console.log('📋 Using eContract from booking for PDF (EVMStaff):', eContract);

        setPdfLoading(true);
        try {
            // Thử gọi API để lấy downloadUrl nếu cần
            const res = await getEContractById(eContract.id);
            // response may have data.downloadUrl
            const downloadUrl = res?.data?.downloadUrl || res?.downloadUrl || res?.result?.data?.downloadUrl || res?.result?.downloadUrl;
            const docNo = eContract.name || `EContract-${eContract.id.slice(0, 8)}`;

            if (!downloadUrl) {
                message.error("Không tìm thấy file PDF từ eContract");
                return;
            }

            // Try preview endpoint to get blob
            try {
                const blob = await getEContractPreview(downloadUrl);
                const objectUrl = URL.createObjectURL(blob);
                setPdfBlobObjectUrl(objectUrl);
                setPdfUrl(objectUrl);
                setPdfTitle(docNo);
            } catch (previewErr) {
                console.warn("Preview API failed, fallback to direct downloadUrl", previewErr);
                // fallback: use direct downloadUrl
                setPdfUrl(downloadUrl);
                setPdfTitle(docNo);
            }

            setPdfModalVisible(true);
        } catch (err) {
            console.error("Error fetching eContract:", err);
            message.error("Lỗi khi tải eContract. Vui lòng thử lại");
        } finally {
            setPdfLoading(false);
        }
    };

    // Mở Template Editor để sửa hợp đồng - chỉ cho EVMStaff khi eContract status = 1
    const handleEditContract = async (record) => {
        setTemplateEditorLoading(true);
        try {
            // Sử dụng eContract đã có trong booking data thay vì gọi API
            if (record.eContract && record.eContract.id) {
                const eContract = record.eContract;
                
                // Kiểm tra status: chỉ cho phép sửa khi eContract status = 1
                if (eContract.status !== 1) {
                    message.warning('Chỉ có thể chỉnh sửa hợp đồng khi trạng thái phù hợp (status = 1)');
                    return;
                }
                
                // Truyền trực tiếp eContract object từ booking data cho EContractPDFEditor
                setSelectedEContract(eContract);
                setTemplateEditorVisible(true);
                message.success('Đã tải nội dung hợp đồng để chỉnh sửa');
            } else {
                message.error('Không tìm thấy hợp đồng điện tử cho booking này');
            }
        } catch (error) {
            console.error('Error loading contract for edit:', error);
            message.error('Lỗi khi tải hợp đồng. Vui lòng thử lại');
        } finally {
            setTemplateEditorLoading(false);
        }
    };

    // Xử lý đóng Template Editor
    const handleCloseTemplateEditor = () => {
        setTemplateEditorVisible(false);
        setSelectedEContract(null);
        // Có thể reload lại danh sách nếu cần
        // fetchBookings();
    };

    // Tính toán thống kê
    const statistics = useMemo(() => {
        const getStatus = (booking) => {
            if (typeof booking.status === "number") return booking.status;
            return 0;
        };

        // Đảm bảo bookings là array hợp lệ
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        
        const stats = {
            total: safeBookings.length || 0,
            draft: safeBookings.filter((b) => getStatus(b) === 0).length || 0,              // Draft = 0
            waittingDealerSign: safeBookings.filter((b) => getStatus(b) === 1).length || 0, // WaittingDealerSign = 1
            pending: safeBookings.filter((b) => getStatus(b) === 2).length || 0,            // Pending = 2
            approved: safeBookings.filter((b) => getStatus(b) === 3).length || 0,           // Approved = 3
            rejected: safeBookings.filter((b) => getStatus(b) === 4).length || 0,           // Rejected = 4
            cancelled: safeBookings.filter((b) => getStatus(b) === 5).length || 0,          // Cancelled = 5
            signedByAdmin: safeBookings.filter((b) => getStatus(b) === 6).length || 0,      // SignedByAdmin = 6
            completed: safeBookings.filter((b) => getStatus(b) === 7).length || 0,          // Completed = 7
            totalVehicles: safeBookings.reduce(
                (sum, b) => sum + (typeof b.totalQuantity === 'number' ? b.totalQuantity : 0),
                0
            ) || 0,
        };

        // Tính tỷ lệ phê duyệt
        stats.approvalRate =
            stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

        // Tính tỷ lệ hoàn thành
        stats.completionRate =
            stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

        // Tính trung bình xe/booking
        stats.avgVehiclesPerBooking =
            stats.total > 0 ? (stats.totalVehicles / stats.total).toFixed(1) : 0;

        return stats;
    }, [bookings]);

    // Dữ liệu cho biểu đồ phân bố trạng thái
    const statusChartData = useMemo(() => {
        // Đảm bảo tất cả values là số và có giá trị mặc định
        const safeValue = (val) => (typeof val === 'number' && !isNaN(val)) ? val : 0;
        
        return [
            { type: "Bản Nháp", value: safeValue(statistics.draft), color: "#8c8c8c" },
            { type: "Chờ Dealer Ký", value: safeValue(statistics.waittingDealerSign), color: "#faad14" },
            { type: "Chờ Duyệt", value: safeValue(statistics.pending), color: "#fa8c16" },
            { type: "Đã Duyệt", value: safeValue(statistics.approved), color: "#52c41a" },
            { type: "Admin Đã Ký", value: safeValue(statistics.signedByAdmin), color: "#13c2c2" },
            { type: "Hoàn Thành", value: safeValue(statistics.completed), color: "#1890ff" },
            { type: "Từ Chối", value: safeValue(statistics.rejected), color: "#ff4d4f" },
            { type: "Đã Hủy", value: safeValue(statistics.cancelled), color: "#bfbfbf" },
        ].filter((item) => item.value > 0);
    }, [statistics]);

    // Dữ liệu cho biểu đồ xu hướng 7 ngày
    const trendChartData = useMemo(() => {
        if (!Array.isArray(bookings) || bookings.length === 0) {
            // Trả về dữ liệu mặc định nếu không có booking
            return Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return {
                    date: date.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                    }),
                    count: 0,
                };
            });
        }

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split("T")[0];
        });

        return last7Days.map((date) => {
            const count = bookings.filter((b) => {
                if (!b.bookingDate) return false;
                try {
                    const bookingDate = new Date(b.bookingDate).toISOString().split("T")[0];
                    return bookingDate === date;
                } catch (error) {
                    console.warn('Invalid booking date:', b.bookingDate);
                    return false;
                }
            }).length;

            return {
                date: new Date(date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                }),
                count: typeof count === 'number' ? count : 0,
            };
        });
    }, [bookings]);

    // Format ngày giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Hiển thị trạng thái booking
    const getStatusTag = (status) => {
        // Mapping theo BookingStatus enum: Draft=0, WaittingDealerSign=1, Pending=2, Approved=3, Rejected=4, Cancelled=5, SignedByAdmin=6, Completed=7
        const statusMap = {
            0: { color: "default", text: "Bản Nháp", icon: <ClockCircleOutlined /> },
            1: { color: "gold", text: "Chờ Dealer Ký", icon: <ClockCircleOutlined /> },
            2: { color: "orange", text: "Chờ Duyệt", icon: <ClockCircleOutlined /> },
            3: { color: "green", text: "Đã Duyệt", icon: <CheckCircleOutlined /> },
            4: { color: "red", text: "Đã Từ Chối", icon: <CloseCircleOutlined /> },
            5: { color: "default", text: "Đã Hủy", icon: <CloseCircleOutlined /> },
            6: { color: "cyan", text: "Admin Đã Ký", icon: <CheckCircleOutlined /> },
            7: { color: "blue", text: "Đã Hoàn Thành", icon: <CheckCircleOutlined /> },
        };

        const statusInfo = statusMap[status] || {
            color: "default",
            text: "Không xác định",
            icon: null,
        };
        return <Tag color={statusInfo.color} icon={statusInfo.icon}>{statusInfo.text}</Tag>;
    };

    // Lọc dữ liệu
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            // Filter by search text
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const toString = (value) => {
                    if (!value) return "";
                    if (typeof value === "string") return value;
                    if (typeof value === "object" && value.value !== undefined)
                        return String(value.value);
                    return String(value);
                };

                const matchesSearch =
                    toString(booking.id).toLowerCase().includes(searchLower) ||
                    toString(booking.dealerId).toLowerCase().includes(searchLower) ||
                    toString(booking.createdBy).toLowerCase().includes(searchLower) ||
                    toString(booking.note).toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;
            }

            // Filter by active tab (status) - Updated mapping theo enum BookingStatus
            if (activeTab && activeTab !== "all") {
                const statusMap = {
                    draft: 0,              // Draft = 0
                    waittingDealerSign: 1, // WaittingDealerSign = 1
                    pending: 2,            // Pending = 2 
                    approved: 3,           // Approved = 3
                    rejected: 4,           // Rejected = 4
                    cancelled: 5,          // Cancelled = 5
                    signedByAdmin: 6,      // SignedByAdmin = 6
                    completed: 7,          // Completed = 7
                };
                const filterStatusValue = statusMap[activeTab];
                const bookingStatus =
                    typeof booking.status === "number" ? booking.status : 0;

                if (bookingStatus !== filterStatusValue) return false;
            }

            // Filter by date range
            if (dateRange && dateRange[0] && dateRange[1]) {
                const bookingDate = new Date(booking.bookingDate);
                const startDate = dateRange[0].startOf("day").toDate();
                const endDate = dateRange[1].endOf("day").toDate();

                if (bookingDate < startDate || bookingDate > endDate) return false;
            }

            return true;
        });
    }, [bookings, searchText, activeTab, dateRange]);

    return (
        <Layout className="min-h-screen" style={{ background: "#f0f2f5" }}>
            <NavigationBar
                collapsed={collapsed}
                onCollapse={setCollapsed}
                isMobile={isMobile}
            />
            <Layout
                className="transition-all duration-200"
                style={{
                    marginLeft: isMobile ? 0 : collapsed ? 64 : 280,
                }}
            >
                <HeaderBar collapsed={collapsed} isMobile={isMobile} />
                <Content style={{ margin: "80px 16px 24px" }}>
                    <PageContainer
                        header={{
                            title: (
                                <span style={{ fontSize: 24, fontWeight: 600 }}>
                                    Dashboard Đại Lý Xe Máy Điện
                                </span>
                            ),
                            subTitle: (
                                <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                                    Quản lý booking và theo dõi hiệu suất bán hàng
                                </span>
                            ),
                            ghost: false,
                            extra: [
                                <Tag
                                    key="pending"
                                    color="orange"
                                    icon={<ClockCircleOutlined />}
                                >
                                    {statistics.pending} Pending
                                </Tag>,
                            ],
                        }}
                    >
                        {/* KPI Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={12} lg={6}>
                                <Card bordered={false} hoverable>
                                    <Statistic
                                        title="Tổng Booking"
                                        value={statistics.total}
                                        prefix={<FileTextOutlined />}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                    <Progress
                                        percent={100}
                                        strokeColor="#1890ff"
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card bordered={false} hoverable>
                                    <Statistic
                                        title="Tổng Số Xe"
                                        value={statistics.totalVehicles}
                                        prefix={<CarOutlined />}
                                        valueStyle={{ color: "#52c41a" }}
                                        suffix="xe"
                                    />
                                    <Progress
                                        percent={100}
                                        strokeColor="#52c41a"
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card bordered={false} hoverable>
                                    <Statistic
                                        title="Tỷ Lệ Phê Duyệt"
                                        value={statistics.approvalRate}
                                        prefix={<TrophyOutlined />}
                                        suffix="%"
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                    <Progress
                                        percent={statistics.approvalRate}
                                        strokeColor="#faad14"
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card bordered={false} hoverable>
                                    <Statistic
                                        title="TB Xe/Booking"
                                        value={statistics.avgVehiclesPerBooking}
                                        prefix={<ThunderboltOutlined />}
                                        valueStyle={{ color: "#722ed1" }}
                                        suffix="xe"
                                    />
                                    <Progress
                                        percent={Math.min(
                                            statistics.avgVehiclesPerBooking * 10,
                                            100
                                        )}
                                        strokeColor="#722ed1"
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Charts Section */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                {statusChartData && statusChartData.length > 0 ? (
                                    <StatusDistributionChart
                                        data={statusChartData}
                                        total={statistics.total || 0}
                                    />
                                ) : (
                                    <ProCard
                                        title="Phân Bố Trạng Thái"
                                        bordered
                                        headerBordered
                                    >
                                        <div style={{ 
                                            height: 280, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#999'
                                        }}>
                                            Chưa có dữ liệu
                                        </div>
                                    </ProCard>
                                )}
                            </Col>

                            <Col xs={24} lg={12}>
                                {trendChartData && trendChartData.length > 0 ? (
                                    <TrendChart data={trendChartData} />
                                ) : (
                                    <ProCard
                                        title="Xu Hướng 7 Ngày Gần Nhất"
                                        bordered
                                        headerBordered
                                    >
                                        <div style={{ 
                                            height: 280, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#999'
                                        }}>
                                            Chưa có dữ liệu
                                        </div>
                                    </ProCard>
                                )}
                            </Col>
                        </Row>

                        {/* Performance Metrics */}
                        <ProCard ghost gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <ProCard colSpan={8} bordered>
                                <Statistic
                                    title="Pending"
                                    value={statistics.pending}
                                    valueStyle={{ color: "#fa8c16" }}
                                    prefix={<ClockCircleOutlined />}
                                    suffix={`/ ${statistics.total}`}
                                />
                            </ProCard>
                            <ProCard colSpan={8} bordered>
                                <Statistic
                                    title="Approved"
                                    value={statistics.approved}
                                    valueStyle={{ color: "#52c41a" }}
                                    prefix={<CheckCircleOutlined />}
                                    suffix={`/ ${statistics.total}`}
                                />
                            </ProCard>
                            <ProCard colSpan={8} bordered>
                                <Statistic
                                    title="Completed"
                                    value={statistics.completed}
                                    valueStyle={{ color: "#1890ff" }}
                                    prefix={<CarOutlined />}
                                    suffix={`/ ${statistics.total}`}
                                />
                            </ProCard>
                        </ProCard>

                        {/* Filters */}
                        <ProCard style={{ marginBottom: 16 }} bordered>
                            <BookingFilters
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                statusFilter={activeTab}
                                onStatusFilterChange={setActiveTab}
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                onReset={handleResetFilters}
                                onReload={fetchBookings}
                                loading={loading}
                            />
                        </ProCard>

                        {/* Booking Table */}
                        <ProCard
                            title="Danh Sách Booking"
                            bordered
                            headerBordered
                            extra={<Tag color="blue">{filteredBookings.length} booking</Tag>}
                        >
                            <BookingTable
                                dataSource={filteredBookings}
                                loading={loading}
                                onViewDetail={handleViewDetail}
                                formatDateTime={formatDateTime}
                                onStatusUpdate={fetchBookings}
                                onOpenPdf={handleOpenEContractPdf}
                                onEditContract={handleEditContract}
                                templateEditorLoading={templateEditorLoading}
                            />
                        </ProCard>
                    </PageContainer>
                </Content>
            </Layout>

            {/* Drawer chi tiết */}
            <BookingDetailDrawer
                visible={detailDrawerVisible}
                onClose={() => setDetailDrawerVisible(false)}
                booking={selectedBooking}
                loading={detailLoading}
                formatDateTime={formatDateTime}
                formatCurrency={formatCurrency}
                getStatusTag={getStatusTag}
            />

            {/* PDF Modal for eContract */}
            <PDFModal
                visible={pdfModalVisible}
                onClose={() => {
                    setPdfModalVisible(false);
                    setPdfUrl(null);
                    setPdfTitle(null);
                    if (pdfBlobObjectUrl) {
                        URL.revokeObjectURL(pdfBlobObjectUrl);
                        setPdfBlobObjectUrl(null);
                    }
                }}
                contractNo={pdfTitle}
                pdfUrl={pdfUrl}
                title={pdfTitle}
            />

            {/* EVMStaff eContract Editor Modal - Restricted editing */}
            <EVMEContractEditor
                visible={templateEditorVisible}
                onClose={handleCloseTemplateEditor}
                eContract={selectedEContract}
                onSaveSuccess={(savedData) => {
                    message.success('Đã cập nhật hợp đồng thành công!');
                    // Có thể reload danh sách nếu cần
                    fetchBookings();
                }}
            />
        </Layout>
    );
}

export default EVMGetAllEVBooking;
