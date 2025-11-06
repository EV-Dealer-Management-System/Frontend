
export function getLoginErrorMessage(err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message;

    // Tài khoản bị vô hiệu hóa
    if (status === 403 || msg === "Account is deactivated. Please contact support.") {
        return "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ bộ phận hỗ trợ.";
    }

    // Mật khẩu không đúng
    if (msg?.includes("Password is incorrect")) {
        const match = msg.match(/enter (\d+) incorrectly again.*locked for (\d+) minutes/);
        if (match) {
            const remainingAttempts = match[1];
            const lockMinutes = match[2];
            return `Mật khẩu không đúng. Nếu nhập sai thêm ${remainingAttempts} lần nữa, tài khoản sẽ bị khóa trong ${lockMinutes} phút.`;
        }
        return "Mật khẩu không đúng.";
    }

    // Email không tồn tại
    if (msg === "User not found" || msg === "Email is not exist") {
        return "Email không tồn tại trong hệ thống";
    }

    // Lỗi mặc định
    return msg || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
}
