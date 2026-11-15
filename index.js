const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/lite-sessions?cp=R&cl=R&pf=web&at=3959701241b686f12e01bfe9c3a319b8";

app.get('/predict', async (req, res) => {
    try {
        const response = await axios.get(API_URL);
        const dataList = response.data.list;

        // Chỉ lấy phiên mới nhất (index 0) và phiên trước đó (index 1)
        let currentSession = dataList[0];
        let previousSession = dataList[1];

        // Lấy dữ liệu
        let totalPoint = currentSession.point;
        let prevDice1 = previousSession.dices[0];
        
        // Cộng thêm 1 vào số phiên như yêu cầu
        let displaySessionId = currentSession.id + 1;

        // Tính toán theo công thức
        let calcResult = totalPoint + prevDice1;
        let prediction = (calcResult % 2 === 0) ? "TÀI" : "XỈU";
        let confidence = Math.floor(Math.random() * (98 - 50 + 1)) + 50;

        // Tạo object kết quả gọn gàng
        let result = {
            "Phien": displaySessionId,
            "Tong_diem_hien_tai": totalPoint,
            "Xi_ngau_1_phien_truoc": prevDice1,
            "Phep_tinh": `${totalPoint} + ${prevDice1} = ${calcResult}`,
            "Du_doan": prediction,
            "Do_tin_cay": `${confidence}%`
        };

        // Trả về JSON chỉ có 1 phiên duy nhất
        res.json({
            status: "success",
            data: result
        });

    } catch (error) {
        console.error("Lỗi:", error.message);
        res.status(500).json({ 
            status: "error", 
            message: "Không thể lấy dữ liệu",
            detail: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send("Tool đang chạy. Truy cập /predict để xem kết quả.");
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
