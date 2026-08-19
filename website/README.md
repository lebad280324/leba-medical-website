# Website marketing LEBA Medical

Landing page tĩnh một trang giới thiệu giải pháp chuyển đổi số LEBA Medical cho phòng khám và chuỗi nha khoa.

## Mở website

Có thể mở trực tiếp `index.html` trong trình duyệt. Để các hành vi trình duyệt hoạt động ổn định hơn, chạy một static server đơn giản trong thư mục gốc của repo:

```bash
python3 -m http.server 4173 -d website
```

Sau đó mở `http://localhost:4173`.

Website chỉ dùng HTML5, CSS3 và JavaScript thuần; không có backend, dependency, bước build hay kết nối với hệ thống quản lý.

Bộ font **Be Vietnam Pro** đã được lưu cục bộ trong `website/assets/fonts/`, vì vậy hệ chữ tiếng Việt không phụ thuộc dịch vụ font bên ngoài. Nút **Đăng nhập** ở header, menu mobile và footer dẫn tới `https://clinic.lebamedical.com/login`.

## Cấu hình thông tin liên hệ

Thông tin email và điện thoại chính thức chưa được cung cấp, vì vậy website chủ động hiển thị “Đang cập nhật” và không giả vờ gửi form thành công.

Mở `website/script.js`, cập nhật cấu hình ở đầu tệp:

```js
const CONTACT = {
  email: "tuvan@ten-mien-chinh-thuc.vn",
  phone: "Số điện thoại chính thức",
};
```

Khi `email` được cấu hình, form sẽ hỏi người dùng trước khi mở ứng dụng email với nội dung đã chuẩn bị. Nếu chưa cấu hình, người dùng có thể sao chép nội dung để gửi qua kênh chính thức.

## Việc cần hoàn thiện trước khi công bố

- Thay thông tin email và số điện thoại chính thức trong `script.js`.
- Thay nội dung placeholder của hộp “Chính sách bảo mật” trong `index.html` bằng chính sách đã được phê duyệt.
- Rà soát lại phạm vi tính năng với repo sản phẩm đầy đủ. Tại thời điểm xây dựng, workspace không có `README.md`, `addons/`, `frontend/` hoặc `docs/marketing/`; nội dung hiện bám sát danh sách phân hệ trong đặc tả được cung cấp.
- Nếu có ảnh marketing chính thức, sao chép vào `website/assets/` và sử dụng bằng đường dẫn độc lập với ứng dụng ERP.

## Cấu trúc

- `index.html`: nội dung và cấu trúc landing page.
- `styles.css`: nhận diện, bố cục responsive và trạng thái tương tác.
- `script.js`: menu mobile, FAQ, tab theo vai trò, hiệu ứng cuộn trang, kiểm tra form, sao chép nội dung và cấu hình liên hệ.
- `assets/leba-medical-logo.png`: logo LEBA Medical được lưu cục bộ để website không phụ thuộc đường dẫn ERP.
