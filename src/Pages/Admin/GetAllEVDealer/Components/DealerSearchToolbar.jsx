import React from "react";
import { Input, Select } from "antd";

// Component thanh công cụ tìm kiếm và bộ lọc
function DealerSearchToolbar({
  searchKeyword,
  setSearchKeyword,
  filterStatus,
  setFilterStatus,
  dealerData,
  setDealerData,
  originalDealerData,
  searchParams,
  setSearchParams,
  pagination,
  loadDealerData,
  setPagination
}) {
  const { Search } = Input;

  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    setSearchKeyword(searchValue);

    const dataToSearch = filterStatus !== null ? dealerData : originalDealerData;

    if (!searchValue) {
      if (filterStatus !== null) {
        return;
      } else {
        setDealerData(originalDealerData);
        return;
      }
    }

    const filtered = dataToSearch.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchValue) ||
        item.managerName?.toLowerCase().includes(searchValue) ||
        item.managerEmail?.toLowerCase().includes(searchValue)
    );
    setDealerData(filtered);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
    const newSearchParams = {
      ...searchParams,
      status: value !== null ? Number(value) : undefined,
    };
    setSearchParams(newSearchParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadDealerData({
      pageNumber: 1,
      pageSize: pagination.pageSize,
      status: value !== null ? Number(value) : undefined,
    });
  };

  return [
    <Search
      key="search"
      placeholder="Tìm kiếm theo tên đại lý hoặc quản lý"
      allowClear
      style={{ width: 300 }}
      value={searchKeyword}
      onChange={(e) => handleSearch(e.target.value)}
    />,
    <Select
      key="statusFilter"
      placeholder="Lọc trạng thái"
      allowClear
      style={{ width: 160 }}
      value={filterStatus}
      onChange={handleStatusFilter}
      options={[
        { label: "Hoạt động", value: 0 },
        { label: "Tạm ngừng", value: 1 },
      ]}
    />,
  ];
}

export default DealerSearchToolbar;