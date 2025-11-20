import React, { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { GetAllEVDealer } from "../../../../App/EVMAdmin/GetAllEVDealer/GetAllEVDealer";

// Custom hook để quản lý dữ liệu đại lý
function useDealerData() {
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
        status: undefined,
    });
    const [originalDealerData, setOriginalDealerData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [filterStatus, setFilterStatus] = useState(null);

    // Hàm load dữ liệu đại lý
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Hàm xử lý thay đổi bảng (sort, pagination)
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

    return {
        dealerData,
        setDealerData,
        loading,
        pagination,
        setPagination,
        searchParams,
        setSearchParams,
        originalDealerData,
        setOriginalDealerData,
        searchKeyword,
        setSearchKeyword,
        updatingStatus,
        setUpdatingStatus,
        filterStatus,
        setFilterStatus,
        loadDealerData,
        handleTableChange,
    };
}

export default useDealerData;