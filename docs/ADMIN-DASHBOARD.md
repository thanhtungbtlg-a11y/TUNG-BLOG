# Trang quản trị blog

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

## Bình luận

Chuyển sang tab **Bình luận** để lọc theo trạng thái hoặc bài viết, duyệt và
xóa bình luận. Người đọc không còn thấy phần đăng nhập quản trị trong từng bài.
