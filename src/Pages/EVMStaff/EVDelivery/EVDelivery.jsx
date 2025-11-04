import React, { useState, useEffect } from 'react';
import { Card, message, Input } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import EVMStaffLayout from '../../../Components/EVMStaff/EVMStaffLayout';
import { getAllEVDelivery } from '../../../App/EVMStaff/EVDelivery/GetAllEVDelivery';
import DeliveryTable from './Components/DeliveryTable';
import StatusFilter from './Components/StatusFilter';

const { Search } = Input;

import DeliveryDetailModal from './Components/DeliveryDetailModal';

function EVDelivery() {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Fetch dữ liệu giao xe
    const fetchDeliveries = async (pageNumber = 1, pageSize = 10, status = null) => {
        setLoading(true);
        try {
            const response = await getAllEVDelivery(pageNumber, pageSize, status);

            if (response.isSuccess) {
                setDeliveries(response.result.data);
                setPagination({
                    current: response.result.pagination.pageNumber,
                    pageSize: response.result.pagination.pageSize,
                    total: response.result.pagination.totalItems,
                });
            } else {
                message.error(response.message || 'Không thể tải danh sách giao xe');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries(1, 10, null);
    }, []);

    // Xử lý thay đổi phân trang
    const handleTableChange = (paginationConfig) => {
        fetchDeliveries(paginationConfig.current, paginationConfig.pageSize, selectedStatus);
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

    return (
        <EVMStaffLayout>
            <PageContainer
                title="Theo dõi giao xe"
                subTitle="Quản lý và theo dõi tiến trình giao xe đến đại lý"
                extra={[
                    <Search
                        key="search"
                        placeholder="Tìm kiếm theo mã giao xe hoặc tên đại lý"
                        onSearch={(value) => console.log('Search value:', value)}
                        style={{ width: 300 }}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        allowClear
                    />,
                    <StatusFilter
                        key="status-filter"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                    />
                ]}
            >
                <Card className="shadow-sm">
                    <DeliveryTable
                        data={deliveries.filter(d =>
                            d.bookingEVId?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                            d.description?.toLowerCase().includes(searchKeyword.toLowerCase())
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
                />
            </PageContainer>
        </EVMStaffLayout>
    );
}

export default EVDelivery;
