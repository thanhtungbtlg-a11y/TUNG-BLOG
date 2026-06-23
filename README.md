# TUNG-BLOG

Blog cá nhân của Thanh Tùng, viết bằng Astro và deploy trên Vercel.

Website: [www.thanhtung0209.com](https://www.thanhtung0209.com)

## Nội Dung

- Bài viết cá nhân được import từ WordPress.
- Tìm kiếm nhanh bằng Ctrl + K, nạp index khi cần để giảm bundle ban đầu.
- Dark mode, theme presets, reading progress và active TOC.
- Music player nhỏ gọn.
- Bình luận ẩn danh qua Supabase, cần duyệt trước khi hiển thị.
- Phản ứng bài viết dạng emoji và lưu số liệu qua Supabase.
- Trang quản trị bài viết, bình luận và Media Library tại `/admin/`.

## Chạy Local

Yêu cầu:

- Node.js 20+
- pnpm 9+

```sh
pnpm install
pnpm dev
```

Build production:

```sh
pnpm build
```

Kiểm tra Astro:

```sh
pnpm check
```

## Viết Bài Mới

```sh
pnpm new-post
```

Script sẽ hỏi tiêu đề, ngày, category, tag, ảnh bìa, trạng thái ghim và trạng thái mới nhất rồi tạo bài trong `src/content/posts/`.

Có thể truyền nhanh tiêu đề nếu muốn:

```sh
pnpm new-post "Tiêu đề bài viết"
```

Chỉ bài có `pinned: true` mới nằm trong nhóm bài ghim. Chỉ bài có `latest: true` mới nằm trong nhóm mới nhất bên dưới bài ghim.

## Import Từ WordPress

File export WordPress không được commit lên GitHub. Đặt file XML ở máy local rồi chạy:

```sh
pnpm import-wordpress path/to/export.xml
```

Script sẽ tạo bài viết trong `src/content/posts/`, tải ảnh về local và rewrite ảnh trong Markdown.

## Supabase

Bình luận ẩn danh và phản ứng bài viết dùng Supabase.

1. Tạo project Supabase.
2. Thêm biến môi trường:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - Hoặc biến từ Vercel integration:
     `NEXT_PUBLIC_SUPABASE_URL`,
     `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` hoặc `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng ở
     server, không thêm `PUBLIC_`)
3. Chạy SQL trong `supabase/comments.sql`.
4. Tạo admin user trong Supabase Auth.
5. Thêm admin user vào bảng `comment_admins`.

Comment mới sẽ ở trạng thái `pending`; chỉ comment đã duyệt mới hiện công khai.
Việc gửi comment đi qua API để giới hạn tần suất, chống nội dung lặp và bot.

Email báo comment mới dùng Resend. Thêm các biến sau trên Vercel:

- `RESEND_API_KEY`
- `COMMENT_NOTIFICATION_TO=thanhtungbtlg@gmail.com`
- `COMMENT_NOTIFICATION_FROM` (địa chỉ gửi đã xác minh trên Resend)
- `COMMENT_RATE_LIMIT_SECRET` (một chuỗi ngẫu nhiên dài)
- `PUBLIC_SITE_URL=https://www.thanhtung0209.com`

## Deploy

Repo đang deploy bằng Vercel. Mỗi lần push lên `main`, Vercel sẽ tự build và publish bản mới.
