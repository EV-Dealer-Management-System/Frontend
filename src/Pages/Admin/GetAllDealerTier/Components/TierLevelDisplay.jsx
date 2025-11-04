import React from "react";
import {
    CrownOutlined,
    TrophyOutlined,
    StarOutlined,
    RiseOutlined,
} from "@ant-design/icons";

function TierLevelDisplay({ level }) {
    const tierConfig = {
        1: {
            icon: <CrownOutlined />,
            color: "#ffd700",
            bg: "#fffbe6",
            borderColor: "#ffd700",
            text: "Key/Strategic",
        },
        2: {
            icon: <TrophyOutlined />,
            color: "#fa8c16",
            bg: "#fff7e6",
            borderColor: "#fa8c16",
            text: "Gold",
        },
        3: {
            icon: <StarOutlined />,
            color: "#bfbfbf",
            bg: "#fafafa",
            borderColor: "#bfbfbf",
            text: "Silver",
        },
        4: {
            icon: <RiseOutlined />,
            color: "#1890ff",
            bg: "#e6f7ff",
            borderColor: "#91d5ff",
            text: "Standard",
        },
        5: {
            icon: <StarOutlined />,
            color: "#8c8c8c",
            bg: "#fafafa",
            borderColor: "#d9d9d9",
            text: "Entry",
        },
    };

    const config = tierConfig[level] || {
        icon: <StarOutlined />,
        color: "#d9d9d9",
        bg: "#fafafa",
        borderColor: "#d9d9d9",
        text: "Unknown",
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                    backgroundColor: config.bg,
                    border: `2px solid ${config.borderColor}`,
                }}
            >
                <span style={{ color: config.color, fontSize: 18 }}>{config.icon}</span>
            </div>
            <div>
                <div className="font-semibold text-sm" style={{ color: "#262626" }}>
                    Tier {level}
                </div>
                <div className="text-xs" style={{ color: "#8c8c8c" }}>
                    {config.text}
                </div>
            </div>
        </div>
    );
}

export default TierLevelDisplay;
