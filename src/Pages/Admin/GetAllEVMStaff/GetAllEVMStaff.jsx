import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, message, Space, Statistic, App } from 'antd';
import { ReloadOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { EVMStaffAccountService } from '../../../App/EVMAdmin/EVMStaffAccount/GetAllEVMStaff';
import FilterBar from './Components/FilterBar';
import StaffTable from './Components/StaffTable';
import {ConfigProvider} from "antd";
import viVN from 'antd/lib/locale/vi_VN';



function GetAllEVMStaff() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 1000,
        total: 0,
    });
    const { modal } = App.useApp();

    // Search keyword state
    const [searchKeyword, setSearchKeyword] = useState('');

    // Filter parameters
    const [selectedPage, setSelectedPage] = useState(1);

    // Lấy danh sách EVM Staff
    const fetchStaffList = async (page = 1) => {
        setLoading(false);

        try {
            const response = await EVMStaffAccountService.getAllStaffAccounts({
                filterOn: "",
                filterQuery: "",
                sortBy: "createdAt",
                pageNumber: page,
                isAcending: false,
                pageSize: 1000,
            });

            console.log('Response from service:', response);

            // Xử lý response - API trả về trong response.result
            const staffData = response.result || response.data || [];
            const totalCount = response.totalCount || response.total || staffData.length;

            setStaffList(staffData);
            setPagination({
                current: page,
                pageSize: 1000,
                total: totalCount,
            });

            if (response.isSuccess) {
                message.success(response.message || `Đã tải ${staffData.length} nhân viên EVM`);
            }
        } catch (error) {
            console.error('Error fetching staff list:', error);
            message.error(error.response?.data?.message || 'Không thể tải danh sách nhân viên EVM');
        } finally {
            setLoading(false);
        }
    };

    // Toggle active status for a staff account
    const handleToggleStatus = async (record, isActive) => {
        if (!record || !record.id) return;
        const evcStaffId = record.id;

        const doToggle = async () => {
            setLoading(true);
            try {
                // mark updating on the specific row
                setStaffList(prev => prev.map(s => s.id === evcStaffId ? { ...s, _updating: true } : s));
                    const res = await EVMStaffAccountService.updateEVMStaffStatus(evcStaffId, isActive);
                if (res?.isSuccess) {
                    // backend expects isActive=true to activate, lockoutEnabled maps inversely
                    setStaffList(prev => prev.map(s => s.id === evcStaffId ? { ...s, lockoutEnabled: !isActive, _updating: false } : s));
                    message.success(res.message || 'Cập nhật trạng thái thành công');
                } else {
                    setStaffList(prev => prev.map(s => s.id === evcStaffId ? { ...s, _updating: false } : s));
                    message.error(res?.message || 'Không thể cập nhật trạng thái');
                }
            } catch (err) {
                setStaffList(prev => prev.map(s => s.id === evcStaffId ? { ...s, _updating: false } : s));
                console.error(err);
                message.error('Lỗi khi cập nhật trạng thái');
            } finally {
                setLoading(false);
            }
        };

        // If turning off (isActive === false) ask for confirmation
        if (isActive === false) {
            modal.confirm({
                title: 'Xác nhận vô hiệu hóa',
                content: 'Bạn có chắc muốn vô hiệu hóa tài khoản này?',
                okText: 'Vô hiệu hóa',
                cancelText: 'Hủy',
                onOk: doToggle,
            });
        } else {
            doToggle();
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchStaffList(selectedPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Xử lý thay đổi page
    const handlePageChange = (page) => {
        setSelectedPage(page);
        fetchStaffList(page);
    };

    return (
        
        <AdminLayout>
            <ConfigProvider locale={viVN}>
            <PageContainer
                header={{
                    title: (
                        <Space size="middle">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                <ThunderboltOutlined className="text-white text-2xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">Quản lý nhân viên EVM</div>
                                <div className="text-sm text-gray-500">Hệ thống quản lý xe máy điện</div>
                            </div>
                        </Space>
                    ),
                    extra: [
                        <Button
                            key="reload"
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={() => fetchStaffList(selectedPage)}
                            loading={loading}
                        >
                            Tải lại
                        </Button>,
                    ],
                }}
            >
                {/* Filter Bar Component */}
                <FilterBar
                    selectedPage={selectedPage}
                    onPageChange={handlePageChange}
                    onApply={() => fetchStaffList(selectedPage)}
                    loading={loading}
                    onSearchChange={(value) => setSearchKeyword(value)}
                />

                {/* Staff Table Component */}
                <StaffTable
                dataSource={staffList.filter((staff) => {
                    const keyword = searchKeyword.trim().toLowerCase();
                    if (!keyword) return true;
                    return (
                    staff.fullName?.toLowerCase().includes(keyword) ||
                    staff.email?.toLowerCase().includes(keyword) 
                    );
                })}
                loading={loading}
                onToggleStatus={handleToggleStatus}
                />
            </PageContainer>
            </ConfigProvider>
        </AdminLayout>
    );
}

export default GetAllEVMStaff;
