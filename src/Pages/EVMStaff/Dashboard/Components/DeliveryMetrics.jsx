import React, { useMemo } from 'react';
import { Statistic } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined
} from '@ant-design/icons';

function DeliveryMetrics({ deliveryData, loading }) {

    // Tính toán metrics từ delivery data
    const metrics = useMemo(() => {
        if (!deliveryData || !Array.isArray(deliveryData)) {
            return {
                pending: 0,
                inTransit: 0,
                completed: 0,
                total: 0
            };
        }

        const total = deliveryData.length;
        // Pending = status 0 hoặc 1
        const pending = deliveryData.filter(d => d.status === 0 || d.status === 1).length;
        // In Transit = status 2, 3, 4
        const inTransit = deliveryData.filter(d => d.status === 2 || d.status === 3 || d.status === 4).length;
        // Completed = status 5, 6
        const completed = deliveryData.filter(d => d.status === 5 || d.status === 6).length;

        return { pending, inTransit, completed, total };
    }, [deliveryData]);

    return (
        <ProCard ghost gutter={[16, 16]} className="mb-6">
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Chờ Xử Lý"
                    value={metrics.pending}
                    valueStyle={{ color: '#fa8c16' }}
                    prefix={<ClockCircleOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Đang Vận Chuyển"
                    value={metrics.inTransit}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<CarOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Đã Hoàn Thành"
                    value={metrics.completed}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
        </ProCard>
    );
}

export default DeliveryMetrics;
