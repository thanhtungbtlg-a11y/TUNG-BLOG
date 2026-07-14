# Trang quản trị blog

Trang quản trị nằm tại `https://www.thanhtung0209.com/admin/`. Hướng dẫn quy trình
tự cập nhật và push toàn bộ website nằm tại `docs/HUONG-DAN-TU-CAP-NHAT.md`.

## Cấu hình một lần trên Vercel

Mở **Project Settings > Environment Variables** và thêm:

- `GITHUB_TOKEN`: fine-grained personal access token của GitHub.
- `GITHUB_REPOSITORY`: `thanhtungbtlg-a11y/TUNG-BLOG`.
- `GITHUB_BRANCH`: `main`.

Token GitHub chỉ cần cấp quyền **Contents: Read and write** cho repository
`TUNG-BLOG`. Không đặt tên biến token với tiền tố `PUBLIC_`.

Các biến Supabase đang dùng cho comment vẫn giữ nguyên:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY` hoặc `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (khuyên dùng) hoặc `SUPABASE_SERVICE_ROLE_KEY`: lấy ở
  Supabase Project Settings > API Keys; chỉ thêm trên Vercel, tuyệt đối không
  đặt tiền tố `PUBLIC_`.

Để nhận email khi có comment chờ duyệt, thêm:

- `RESEND_API_KEY`: API key tạo tại Resend.
- `COMMENT_NOTIFICATION_TO`: `thanhtungbtlg@gmail.com`.
- `COMMENT_NOTIFICATION_FROM`: địa chỉ gửi thuộc domain đã xác minh; trong lúc
  thử nghiệm có thể dùng `Thanh Tung Blog <onboarding@resend.dev>`.
- `COMMENT_RATE_LIMIT_SECRET`: một chuỗi ngẫu nhiên dài.
- `PUBLIC_SITE_URL`: `https://www.thanhtung0209.com`.

Chạy lại toàn bộ `supabase/comments.sql` trong Supabase SQL Editor để tạo hàm
gửi comment có rate limit. Script có thể chạy lại an toàn.

Để bật tab **Thống kê**, chạy toàn bộ `supabase/analytics.sql` một lần trong
Supabase SQL Editor. Tracker không lưu IP, email hoặc tên người dùng; mã người xem
và phiên truy cập được băm ở API trước khi ghi vào database. Có thể thêm biến
`ANALYTICS_HASH_SECRET` bằng một chuỗi ngẫu nhiên dài để mã băm vẫn ổn định khi
đổi Supabase secret key. Nếu không thêm, hệ thống tự dùng server key hiện có.

Sau khi thêm biến, redeploy website một lần.

## Đăng nhập

1. Mở `https://www.thanhtung0209.com/admin/`.
2. Đăng nhập bằng tài khoản Supabase Auth đã được thêm vào bảng
   `comment_admins`.

## Bài viết

- Nút dấu cộng tạo bài mới.
- Chọn bài ở cột trái để sửa.
- `Ghim` và `Thứ tự ghim` điều khiển nhóm bài nổi bật.
- `Mới nhất` và `Thứ tự mới` điều khiển nhóm bài mới.
- `Bản nháp` ẩn bài khỏi bản production.
- Nút ảnh tự nén ảnh thành WebP, tải lên thư mục bài và chèn Markdown đúng
  vị trí con trỏ.
- Nút lưu tạo commit trên GitHub; Vercel tự triển khai website mới.

Sau khi lưu, chờ Vercel build xong rồi kiểm tra bài trên website production. Nếu
GitHub không nhận thay đổi, kiểm tra lại `GITHUB_TOKEN`, quyền **Contents: Read and
write**, repository và branch trong Environment Variables.

## Bình luận

Chuyển sang tab **Bình luận** để lọc theo trạng thái hoặc bài viết, duyệt và
xóa bình luận. Người đọc không còn thấy phần đăng nhập quản trị trong từng bài.

Nút **Gửi email thử** kiểm tra cấu hình Resend. Email người đọc để lại là tùy chọn,
không hiển thị công khai và chỉ dùng để báo khi bình luận của họ có phản hồi.

Comment mới được gửi qua Vercel API, giới hạn 3 lượt trong 15 phút cho mỗi địa
chỉ IP đã băm, chặn nội dung trùng trong 24 giờ và có honeypot chống bot. IP gốc
không được lưu trong database.

## Media Library

- Mở tab **Kho ảnh** trong `/admin/`.
- Chọn **Kho ảnh công khai** để quản lý trang `/gallery/`: tải ảnh, chọn hoặc tạo
  album, nhập ngày chụp, tiêu đề, mô tả và thứ tự; có thể sửa hoặc xóa ảnh cũ.
- Số thứ tự nhỏ hơn đứng trước trong cùng ngày và album. Khi tải ảnh mới, để thứ
  tự bằng `0` để hệ thống tự đặt ở cuối album.
- Ảnh Kho ảnh được tạo thành bản đầy đủ và thumbnail WebP trong `public/gallery/`;
  metadata nằm tại `src/data/gallery.json`.
- Chọn **Ảnh bài viết** để dùng thư viện `public/media/` cũ: đổi tên, sửa alt text,
  sao chép mã ảnh hoặc chèn vào bài đang mở.
- Mỗi thao tác lưu, tải hoặc xóa tạo một commit GitHub; Vercel tự triển khai bản mới.

## Thống kê

- Tab **Thống kê** theo dõi blog và toàn bộ khu vực `/brain/`.
- Có bộ lọc 24 giờ, 7 ngày, 30 ngày, 90 ngày hoặc khoảng ngày tùy chọn.
- Có thể lọc riêng từng đường dẫn để biết trang nào được xem và thời điểm cụ thể.
- Bảng hiển thị lượt xem, người xem ẩn danh, phiên truy cập, tỷ lệ thoát, thiết bị
  và nguồn giới thiệu. Lịch sử chi tiết giữ tối đa 250 lượt gần nhất của bộ lọc.
- Trang `/admin/`, bot, localhost và trình duyệt bật Do Not Track không được tính.
- Vercel Analytics vẫn hoạt động song song; tab này là dữ liệu riêng để bạn có
  bộ lọc và lịch sử chi tiết ngay trong website.
