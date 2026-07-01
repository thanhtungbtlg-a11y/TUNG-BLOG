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
- Nhập mô tả trước khi tải ảnh để dùng làm alt text.
- Ảnh được thu nhỏ và tạo đồng thời bản WebP cùng AVIF trong `public/media/`.
- Có thể tìm theo tên/mô tả, đổi tên, sửa mô tả, sao chép mã ảnh hoặc chèn vào
  bài đang mở.
- Nút xóa sẽ xóa cả hai định dạng. Kiểm tra các bài đang dùng ảnh trước khi xóa.
- Mỗi thao tác tạo một commit GitHub; Vercel tự triển khai bản mới.
