import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
    Form,
    Button,
    message
} from 'antd';
import {
    GlobalOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { updateAllDepositSettings } from '../../../App/DealerManager/DepositSettings/UpdateDepositSettings';
import GlobalStatsCards from './components/GlobalStatsCards';
import GlobalUpdateForm from './components/GlobalUpdateForm';

function UpdateAllEVDepositSettings() {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [currentSettings, setCurrentSettings] = useState({
        minDepositPercentage: 0,
        maxDepositPercentage: 30
    });

    // Xử lý cập nhật settings
    const handleUpdateSettings = async (values) => {
        try {
            setSaving(true);
            const response = await updateAllDepositSettings(
                values.minDepositPercentage,
                values.maxDepositPercentage
            );

            if (response?.isSuccess) {
                message.success('Cập nhật cài đặt đặt cọc toàn hệ thống thành công!');
                setCurrentSettings(values);
            } else {
                throw new Error(response?.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật cài đặt:', error);
            message.error('Cập nhật thất bại. Vui lòng thử lại!');
        } finally {
            setSaving(false);
        }
    };

    // Load form với giá trị hiện tại
    useEffect(() => {
        form.setFieldsValue(currentSettings);
    }, [form, currentSettings]);

    return (
        <AdminLayout>
            <PageContainer
                title={
                    <div className="flex items-center gap-2">
                        <span>Cài Đặt Đặt Cọc Toàn Hệ Thống</span>
                    </div>
                }
                subTitle="Quản lý cài đặt deposit cho tất cả đại lý"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => form.resetFields()}
                    >
                        Reset
                    </Button>
                }
            >
                <div className="space-y-6">
                    {/* Thống kê */}
                    <GlobalStatsCards
                        minPercentage={currentSettings.minDepositPercentage}
                        maxPercentage={currentSettings.maxDepositPercentage}
                        loading={saving}
                    />

                    {/* Form cập nhật */}
                    <GlobalUpdateForm
                        form={form}
                        onUpdate={handleUpdateSettings}
                        loading={saving}
                        currentSettings={currentSettings}
                    />
                </div>
            </PageContainer>
        </AdminLayout>
    );
}

export default UpdateAllEVDepositSettings;
