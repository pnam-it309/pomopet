# 📱 PomoPet Mobile - Ứng Dụng Quản Lý Thời Gian Pomodoro Kết Hợp Nuôi Thú Ảo (Golang)

**PomoPet Mobile** là ứng dụng di động (Mobile-First PWA & Native Smartphone Layout) kết hợp giữa phương pháp quản lý thời gian **Pomodoro khoa học** và cơ chế **nuôi thú ảo sinh động**, được xây dựng bằng **Golang** backend nguyên bản.

---

## 📱 Trải Nghiệm Mobile Native Đỉnh Cao

1. **Giao diện chuẩn Smartphone**:
   - Tỷ lệ chuẩn điện thoại hiện đại (iPhone / Android) với **Dynamic Island**, **Status Bar** đồng hồ thực, **Khung viền Titanium**.
   - **Thanh điều hướng dưới đáy (Bottom Navigation Bar)**: Cố định 5 màn hình:
     - 🍅 **Học tập**: Khu nuôi thú cưng & Đồng hồ Pomodoro vòng tròn cảm ứng lớn.
     - 📋 **Nhiệm vụ**: Danh sách việc cần làm (To-Do), số cà chua 🍅 hoàn thành.
     - 🛒 **Cửa hàng**: Mua thức ăn, phụ kiện mũ đội đầu, phòng học chủ đề.
     - 🎒 **Túi đồ**: Cho thú ăn hoặc thay đồ/đổi phòng ngay bằng một chạm.
     - 👤 **Hồ sơ**: Chuỗi ngày (Streak 🔥), thống kê, nhiệm vụ ngày và mã QR kết nối điện thoại.
2. **Cảm ứng rung (Haptic Feedback)**:
   - Rung phản hồi (`navigator.vibrate`) khi chạm nút, vuốt ve thú cưng hoặc khi hoàn thành phiên đếm giờ.
3. **Mở trực tiếp trên điện thoại thật (Cùng mạng Wi-Fi)**:
   - Máy chủ Go tự động lắng nghe trên cổng Wi-Fi nội bộ.
   - Ứng dụng cung cấp sẵn **Mã QR** để bạn quét bằng camera điện thoại và mở ngay trên smartphone.
4. **Cài đặt như App Native (PWA - Progressive Web App)**:
   - Tích hợp `manifest.json` và `sw.js` (Service Worker).
   - Trên Safari iOS: Bấm nút **Chia sẻ** ➔ chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** để biến thành app mobile toàn màn hình, không còn thanh địa chỉ trình duyệt!
   - Trên Chrome Android: Bấm menu ➔ **"Cài đặt ứng dụng"**.

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: 1-Click trên Windows
Double click vào file:
```
run_app.bat
```
hoặc chạy file:
```
pomopet.exe
```

### Cách 2: Chạy bằng lệnh Go
```powershell
go run main.go
```

Khi chạy, cửa sổ console sẽ hiển thị:
```
==================================================================
   📱 POMOPET MOBILE - QUẢN LÝ THỜI GIAN & NUÔI THÚ ẢO (GOLANG)   
==================================================================
[+] Máy tính cục bộ : http://localhost:8080
[+] Điện thoại Mobile: http://<IP_WIFI_CUA_BAN>:8080 (cùng Wi-Fi)
==================================================================
```
Bạn chỉ cần lấy điện thoại quét mã QR trong app hoặc gõ địa chỉ Wi-Fi vào trình duyệt điện thoại để trải nghiệm trực tiếp trên smartphone!

---

## 📁 Cấu Trúc Mã Nguồn

```
d:/code/New folder/
├── main.go                       # Máy chủ Go, phát hiện Wi-Fi IP, nhúng web UI
├── pomopet.exe                   # File thực thi độc lập (8MB) nhúng toàn bộ UI
├── run_app.bat                   # File khởi chạy nhanh cho Windows
├── go.mod                        # Cấu hình Go module
├── internal/
│   ├── model/
│   │   └── models.go             # Cấu trúc dữ liệu Mobile: Pet, Pomodoro, Task, Shop
│   ├── store/
│   │   └── store.go              # Lưu trữ JSON bền vững an toàn đa luồng
│   ├── pet/
│   │   ├── pet_service.go        # Logic thú cưng, chỉ số, tiến hóa
│   │   └── pet_test.go           # Unit tests pet
│   ├── pomodoro/
│   │   ├── pomo_service.go       # Logic phiên tập trung, thưởng xu & EXP
│   │   └── pomo_test.go          # Unit tests pomodoro
│   └── api/
│       └── handler.go            # REST API endpoints
└── web/
    ├── manifest.json             # Cấu hình PWA cài đặt lên màn hình điện thoại
    ├── sw.js                     # Service Worker lưu cache offline
    ├── index.html                # Giao diện Mobile App với Bottom Nav & Mockup Chassis
    ├── css/
    │   └── style.css             # CSS Mobile-First, Touch interactions, Animations
    └── js/
        ├── pet.js                # Canvas render hoạt ảnh thú cưng
        ├── timer.js              # Pomodoro timer & Web Audio Synthesizer
        └── app.js                # Điều khiển Bottom Nav, Haptic touch, kết nối Wi-Fi
```
