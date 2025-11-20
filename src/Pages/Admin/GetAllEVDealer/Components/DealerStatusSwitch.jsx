import React from "react";
import { Switch, message } from "antd";
import { updateDealerStatus } from "../../../../App/EVMAdmin/GetAllEVDealer/GetAllEVDealer";

// Component quản lý switch trạng thái đại lý
function DealerStatusSwitch({
    record,
    updatingStatus,
    setUpdatingStatus,
    loadDealerData,
    modal
}) {
    const isActive = record.dealerStatus === 0;

    const handleToggle = (checked) => {
        const newStatus = checked ? 0 : 1;

        if (newStatus === 1) {
            // Hiển thị modal xác nhận khi vô hiệu hóa
            modal.confirm({
                title: 'Xác nhận vô hiệu hóa đại lý',
                content: `Bạn có chắc muốn đặt đại lý "${record.name}" về trạng thái Không hoạt động?`,
                okText: 'Vô hiệu hóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                    await updateStatus(record.id, newStatus);
                },
            });
        } else {
            // Kích hoạt trực tiếp
            updateStatus(record.id, newStatus);
        }
    };

    const updateStatus = async (dealerId, status) => {
        try {
            setUpdatingStatus((prev) => ({ ...prev, [dealerId]: true }));
            const res = await updateDealerStatus(dealerId, status);
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
            setUpdatingStatus((prev) => ({ ...prev, [dealerId]: false }));
        }
    };

    return (
        <div className="flex gap-2 items-center justify-center">
            <Switch
                checked={isActive}
                checkedChildren="Hoạt Động"
                unCheckedChildren="Tạm Ngừng"
                onChange={handleToggle}
                loading={!!updatingStatus[record.id]}
            />
        </div>
    );
}

export default DealerStatusSwitch;