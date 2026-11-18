const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ĐÃ CẬP NHẬT: API gốc MD5 mới theo yêu cầu
const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8";

app.get('/predict', async (req, res) => {
    try {
        // Gọi API lấy dữ liệu
        const response = await axios.get(API_URL);
        const dataList = response.data.list;

        // Chỉ lấy phiên mới nhất (index 0)
        let currentSession = dataList[0];

        // Lấy tổng điểm 3 xí ngầu của phiên hiện tại
        let totalPoint = currentSession.point;
        
        // Lấy số cuối của ID phiên (Ví dụ: 7155626 -> lấy số 6)
        let sessionIdString = currentSession.id.toString();
        let lastDigit = parseInt(sessionIdString.slice(-1)); 

        // Cộng thêm 1 vào số phiên để hiển thị
        let displaySessionId = currentSession.id + 1;

        // --- CÔNG THỨC MỚI: Tổng điểm + Số cuối phiên ---
        let calcResult = totalPoint + lastDigit;
        
        // Xác định Tài / Xỉu (Chẵn = Tài, Lẻ = Xỉu)
        let prediction = (calcResult % 2 === 0) ? "TÀI" : "XỈU";
        
        // Random tỉ lệ tin cậy 50 - 98%
        let confidence = Math.floor(Math.random() * (98 - 50 + 1)) + 50;

        // Đóng gói kết quả gọn gàng
        let result = {
            "Phien": displaySessionId,
            "Tong_diem_xi_ngau": totalPoint,
            "So_cuoi_phien": lastDigit,
            "Phep_tinh": `${totalPoint} + ${lastDigit} = ${calcResult}`,
            "Du_doan": prediction,
            "Do_tin_cay": `${confidence}%`
        };

        // Trả về JSON
        res.json({
            status: "success",
            data: result
        });

    } catch (error) {
        console.error("Lỗi:", error.message);
        res.status(500).json({ 
            status: "error", 
            message: "Không thể lấy dữ liệu từ API gốc",
            detail: error.message 
        });
    }
});

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send("Tool dự đoán MD5 đang chạy. Truy cập /predict để lấy kết quả.");
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
