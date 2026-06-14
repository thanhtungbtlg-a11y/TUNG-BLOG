# TUNG-BLOG

Blog cá nhân của Thanh Tùng, viết bằng Astro và deploy trên Vercel.

Website: [tung-blog.vercel.app](https://tung-blog.vercel.app)

## Nội Dung

- Bài viết cá nhân được import từ WordPress.
- Tìm kiếm bài viết bằng Pagefind.
- Dark mode, theme presets, reading progress và active TOC.
- Music player nhỏ gọn.
- Bình luận ẩn danh qua Supabase, cần duyệt trước khi hiển thị.
- Phản ứng bài viết dạng emoji và lưu số liệu qua Supabase.

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
pnpm new-post ten-bai-viet
```

Bài viết nằm trong `src/content/posts/`.

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
3. Chạy SQL trong `supabase/comments.sql`.
4. Tạo admin user trong Supabase Auth.
5. Thêm admin user vào bảng `comment_admins`.

Comment mới sẽ ở trạng thái `pending`; chỉ comment đã duyệt mới hiện công khai.

## Deploy

Repo đang deploy bằng Vercel. Mỗi lần push lên `main`, Vercel sẽ tự build và publish bản mới.
