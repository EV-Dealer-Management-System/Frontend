import React, { useState, useEffect } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Form, Button, message, Spin } from "antd";
import { PercentageOutlined, ReloadOutlined } from "@ant-design/icons";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import {
  getDepositSettings,
  createDepositSettings,
} from "../../../App/DealerManager/DepositSettings/GetDepositSettings";
import DepositStatsCards from "./Components/DepositStatsCards";
import DepositUpdateForm from "./Components/DepositUpdateForm";

function DepositSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch dữ liệu cài đặt hiện tại
  const fetchDepositSettings = async () => {
    try {
      setLoading(true);
      const response = await getDepositSettings();

      if (response?.isSuccess && response?.data) {
        const depositData = response.data;
        // Sử dụng maxDepositPercentage từ API response
        const currentPercentage = depositData.maxDepositPercentage || 0;

        setCurrentSettings({
          depositPercentage: currentPercentage,
          dealerName: depositData.dealerName,
          managerName: depositData.managerName,
        });
        form.setFieldsValue({
          depositPercentage: currentPercentage,
        });
      } else {
        // Nếu chưa có cài đặt, set mặc định
        setCurrentSettings({ depositPercentage: 0 });
        form.setFieldsValue({ depositPercentage: 0 });
      }
    } catch (error) {
      console.error("Lỗi khi lấy cài đặt đặt cọc:", error);
      message.error("Không thể tải cài đặt đặt cọc. Vui lòng thử lại!");
      setCurrentSettings({ depositPercentage: 0 });
      form.setFieldsValue({ depositPercentage: 0 });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Cập nhật cài đặt đặt cọc
  const handleUpdateSettings = async (values) => {
    try {
      setSaving(true);
      // The createDepositSettings function now handles constructing the full formData internally
      // based on the single maxDepositPercentage argument we pass
      const response = await createDepositSettings(values.depositPercentage);

      if (response?.isSuccess) {
        message.success("Cập nhật tỷ lệ đặt cọc thành công!");
        setCurrentSettings((prev) => ({
          ...prev,
          depositPercentage: values.depositPercentage,
        }));
      } else {
        throw new Error(response?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật cài đặt:", error);
      message.error("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchDepositSettings();
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý refresh
  const handleRefresh = () => {
    fetchDepositSettings();
  };

  // Tính toán thông tin hiển thị
  const displayPercentage = currentSettings?.depositPercentage || 0;

  return (
    <DealerManagerLayout>
      <PageContainer
        title={
          <div className="flex items-center gap-2">
            <span>Cài Đặt Tỷ Lệ Đặt Cọc</span>
          </div>
        }
        subTitle="Quản lý tỷ lệ đặt cọc tối đa"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {initialLoad ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thông tin đại lý */}

            {/* Thống kê */}
            <DepositStatsCards
              depositPercentage={displayPercentage}
              loading={loading}
            />

            {/* Form cập nhật */}
            <DepositUpdateForm
              form={form}
              onUpdate={handleUpdateSettings}
              loading={saving}
              currentPercentage={displayPercentage}
            />
          </div>
        )}
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default DepositSettings;
