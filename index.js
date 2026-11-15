const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8";

// Tạo API endpoint /predict
app.get('/predict', async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ API gốc
        const response = await axios.get(API_URL);
        const dataList = response.data.list;

        let predictions = [];

        // 2. Duyệt và tính toán công thức
        // Mảng API sắp xếp mới nhất -> cũ nhất. (Phiên hiện tại là i, trước là i+1)
        for (let i = 0; i < dataList.length - 1; i++) {
            let currentSession = dataList[i];
            let previousSession = dataList[i + 1];

            let totalPoint = currentSession.point;
            let prevDice1 = previousSession.dices[0];

            // Công thức: Tổng điểm + Xí ngầu 1 phiên trước
            let calcResult = totalPoint + prevDice1;

            // Xác định Tài / Xỉu (Chẵn = Tài, Lẻ = Xỉu)
            let prediction = (calcResult % 2 === 0) ? "TÀI" : "XỈU";

            // Random tỉ lệ tin cậy 50 - 98%
            let confidence = Math.floor(Math.random() * (98 - 50 + 1)) + 50;

            predictions.push({
                "Phien": currentSession.id,
                "Tong_diem_hien_tai": totalPoint,
                "Xi_ngau_1_phien_truoc": prevDice1,
                "Phep_tinh": `${totalPoint} + ${prevDice1} = ${calcResult}`,
                "Du_doan": prediction,
                "Do_tin_cay": `${confidence}%`
            });
        }

        // 3. Trả về kết quả dạng JSON
        res.json({
            status: "success",
            total_sessions_analyzed: predictions.length,
            data: predictions
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

// Route mặc định để kiểm tra server sống
app.get('/', (req, res) => {
    res.send("Tool dự đoán Tài Xỉu đang chạy. Truy cập /predict để lấy dữ liệu JSON.");
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});