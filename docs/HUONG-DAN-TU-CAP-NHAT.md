# Hướng dẫn tự cập nhật blog và Second Brain

Tài liệu này là quy trình chuẩn để tự viết bài, cập nhật ảnh/nhạc, đồng bộ Obsidian,
kiểm tra và push website lên GitHub. Các lệnh bên dưới chạy trong PowerShell tại:

```text
C:\Users\NITRO 5\Desktop\thanhtung0209-blog
```

## 1. Chuẩn bị trước mỗi lần cập nhật

Mở PowerShell trong thư mục dự án rồi chạy:

```powershell
git status
git pull origin main
pnpm install
```

- `git status` cho biết máy đang có file nào đã sửa.
- `git pull origin main` lấy bản mới nhất từ GitHub.
- `pnpm install` chỉ cần thiết khi `package.json` hoặc lockfile vừa thay đổi.
- Không sửa hoặc commit `.env`, `node_modules/`, `dist/`, `brain/.quartz/`.

## 2. Tạo bài blog mới bằng lệnh

Chạy:

```powershell
pnpm new-post
```

Script sẽ lần lượt hỏi tiêu đề, slug, ngày đăng, mô tả, danh mục, tag, ảnh bìa,
ghim, mới nhất và bản nháp. Có thể truyền sẵn tiêu đề:

```powershell
pnpm new-post "Tiêu đề bài viết"
```

Bài được tạo tại:

```text
src/content/posts/<slug>/index.md
```

Frontmatter mẫu:

```yaml
---
title: "Tiêu đề bài viết"
published: 2026-07-01
description: "Mô tả ngắn để hiện trên card và kết quả tìm kiếm."
image: "./cover.jpg"
tags: ["nhật ký", "công việc"]
category: "Nhật ký cá nhân"
pinned: false
pinOrder: 0
latest: true
latestOrder: 1
draft: false
---
```

- `pinned: true`: đưa bài vào nhóm nổi bật. Số `pinOrder` nhỏ hơn đứng trước.
- `latest: true`: đưa bài vào nhóm mới nhất sau các bài ghim.
- `draft: true`: giữ bài ở dạng nháp, không xuất bản trên production.
- Chỉ sửa bài cần ghim; không cần thêm `pinned: true` vào tất cả bài.

## 3. Chèn ảnh đúng vị trí trong bài

Đặt ảnh trong cùng thư mục bài viết, ví dụ:

```text
src/content/posts/chuyen-di-da-lat/
  index.md
  cover.jpg
  ho-xuan-huong.jpg
```

Chèn dòng Markdown đúng chỗ muốn ảnh xuất hiện:

```markdown
Đoạn văn trước ảnh.

![Hồ Xuân Hương vào buổi sáng](./ho-xuan-huong.jpg)

Đoạn văn sau ảnh.
```

Ảnh sẽ nằm đúng giữa hai đoạn văn. Không đặt toàn bộ mã ảnh trong frontmatter;
frontmatter chỉ dùng `image` cho ảnh bìa.

## 4. Ghim bài, đánh dấu mới nhất và bỏ tag

Mở `index.md` của bài cần sửa.

Ghim bài:

```yaml
pinned: true
pinOrder: 1
```

Đưa vào nhóm mới nhất:

```yaml
latest: true
latestOrder: 1
```

Bỏ một tag: xóa đúng tag đó khỏi mảng, giữ nguyên các tag còn lại:

```yaml
tags: ["sự nghiệp", "tài chính cá nhân", "AI", "phát triển bản thân"]
```

## 5. Cập nhật Kho ảnh

Chạy:

```powershell
pnpm new-photo
```

Nhập đường dẫn ảnh, tiêu đề, ngày và mô tả. Script chép ảnh vào `public/gallery/`
và cập nhật `src/data/gallery.json`.

Với ảnh đã nhập hàng loạt, mở `src/data/gallery.json`, tìm ảnh theo `source` hoặc
`title`, rồi điền nội dung vào trường `description`:

```json
{
  "title": "IMG 3640",
  "description": "Một buổi chiều bên bờ sông Hàn.",
  "date": "2025-07-14",
  "album": "14.07.2025"
}
```

Không xóa dấu phẩy giữa các trường. Khi chạy lại `pnpm import-gallery`, mô tả đã
nhập vẫn được giữ lại. Trên web, mô tả xuất hiện dưới tên ảnh ở card Kho ảnh và
dưới tên ảnh trong cửa sổ phóng to; nội dung mô tả cũng được dùng khi tìm kiếm.

Có thể dùng tab **Kho ảnh** tại `/admin/` mà không cần chạy lệnh. Chọn **Kho ảnh
công khai** để upload ảnh lên `/gallery/`, chọn album, nhập mô tả/ngày chụp, sửa
thứ tự hoặc xóa ảnh. Chọn **Ảnh bài viết** để quản lý ảnh dùng trong nội dung blog.

## 6. Cập nhật avatar, logo và giao diện cơ bản

- Avatar hồ sơ: thay `src/assets/images/profile-avatar.png` bằng ảnh mới cùng tên.
- Logo/favicon: thay các file trong `public/favicon/` đúng kích thước hiện có.
- Tên, bio, mạng xã hội và email: sửa `src/config.ts`.
- Màu mặc định: sửa `siteConfig.themeColor.hue` trong `src/config.ts`.
- Nền caro toàn trang: sửa `src/styles/main.css`.

Sau khi thay ảnh, giữ đúng tên file để không phải sửa code. Nếu đổi tên file, cập nhật
đường dẫn tương ứng trong `src/config.ts` hoặc `src/constants/icon.ts`.

## 7. Cập nhật nhạc

Chép MP3 vào `public/music/`. Tên file nên theo dạng:

```text
Tên bài hát - Tên kênh.mp3
```

Nếu tên bài có nhiều dấu `-`, phần sau dấu `-` cuối cùng được xem là tên kênh.
Ảnh bìa tùy chọn đặt trong `public/music/covers/` và trùng tên bài. Sau đó chạy:

```powershell
pnpm music
```

Lưu ý: GitHub chặn file đơn lẻ lớn hơn 100 MB. Hãy nén MP3 hoặc dùng nơi lưu media
riêng nếu file quá lớn.

## 8. Quản trị bài viết và bình luận trên web

Mở:

```text
https://www.thanhtung0209.com/admin/
```

Đăng nhập bằng tài khoản Supabase Admin. Tại đây có thể:

- tạo/sửa bài, đặt ghim, mới nhất hoặc bản nháp;
- tải và tái sử dụng ảnh;
- duyệt, trả lời hoặc xóa bình luận;
- gửi email thử để kiểm tra Resend.

Khi bấm lưu trong Admin, hệ thống tạo commit GitHub và Vercel tự triển khai.
Xem cấu hình chi tiết tại `docs/ADMIN-DASHBOARD.md`.

## 9. Cập nhật Second Brain từ Obsidian

Second Brain dùng Quartz v5, nằm riêng trong `brain/` và được xuất bản tại `/brain/`.
Không cần sửa code Astro trong `src/` khi chỉ cập nhật ghi chú.

Mỗi ghi chú muốn công khai phải có frontmatter:

```yaml
---
publish: true
---
```

Ghi chú không có `publish: true` vẫn nằm trong vault nhưng sẽ không xuất hiện trên
website. Đây là cách an toàn để phân biệt ghi chú công khai và ghi chú riêng.

Quy trình:

```powershell
pnpm brain:sync
pnpm brain:dev
```

Mở `http://localhost:8080/brain/` để xem thử. Khi ổn, nhấn `Ctrl + C` để dừng server.

Nếu dùng vault khác:

```powershell
pnpm brain:sync -- "D:\Obsidian\My Vault"
```

Những mục không được public: `.obsidian`, `.smart-env`, `.trash`, `private`,
`templates`, file `.base`, ghi chú không có `publish: true`, và ghi chú có:

```yaml
---
draft: true
---
```

File `.canvas` được hỗ trợ: tạo thư mục `public-canvas` trong vault và chỉ đặt các
Canvas muốn công khai vào đó. Canvas ở nơi khác sẽ không được sao chép. Trên web,
người đọc có thể kéo và thu phóng sơ đồ. Quartz cũng tự tạo danh sách 5 ghi chú gần
đây và ảnh chia sẻ riêng cho từng trang khi build.

Quan trọng: Vercel không thể đọc vault trên máy. Luôn chạy `pnpm brain:sync` trước
khi commit nếu có thay đổi Obsidian.

Bản vault trước khi bật chế độ xuất bản có kiểm soát nằm tại:

```text
C:\Users\NITRO 5\Downloads\LEED_Obsidian_Vault-backup-before-quartz-v5-plugins-2026-07-02.zip
```

## 10. Xem thử blog trên máy

Chạy:

```powershell
pnpm dev
```

Mở địa chỉ Astro in ra trong terminal, thường là `http://localhost:4321/`.
Kiểm tra ít nhất:

- trang chủ và Kho bài;
- bài vừa sửa trên desktop và mobile;
- ảnh bìa, ảnh trong bài và liên kết;
- nút email mở trang soạn thư Gmail với người nhận đã điền sẵn;
- tìm kiếm `Ctrl + K`;
- player, comment và chế độ sáng/tối;
- liên kết **Second Brain** mở `/brain/`.

## 11. Kiểm tra trước khi push

```powershell
pnpm check
pnpm build
pnpm check:site
```

- `pnpm check`: kiểm tra Astro và TypeScript.
- `pnpm build`: build cả blog và Second Brain giống Vercel.
- `pnpm check:site`: cảnh báo link/ảnh hỏng, bài thiếu mô tả hoặc ảnh bìa.

Nếu một lệnh lỗi, đọc dòng lỗi đầu tiên có tên file và sửa trước khi push.

## 12. Commit và push

Kiểm tra thay đổi:

```powershell
git status
git diff --stat
```

Đưa file vào commit và push:

```powershell
git add .
git commit -m "Cap nhat bai viet va Second Brain"
git push origin main
```

Sau khi push, mở Vercel hoặc GitHub Actions để chờ build xanh. Vào website và nhấn
`Ctrl + F5` nếu trình duyệt vẫn giữ cache cũ.

## 13. Khôi phục khi cập nhật có lỗi

Xem lịch sử:

```powershell
git log --oneline -10
```

Tạo commit đảo ngược một lần cập nhật:

```powershell
git revert <ma-commit>
git push origin main
```

Không dùng `git reset --hard` khi chưa chắc chắn vì có thể làm mất thay đổi local.
Bản Quartz v4 cũ vẫn được giữ tại branch `codex/quartz-v4-backup` và tag
`quartz-v4-backup-2026-07-01`.

## 14. Cấu trúc thư mục cần nhớ

| Đường dẫn | Mục đích |
| --- | --- |
| `src/content/posts/` | Nội dung bài blog |
| `src/assets/images/` | Avatar và ảnh giao diện được Astro xử lý |
| `public/gallery/` | Ảnh Kho ảnh |
| `public/music/` | MP3 và ảnh bìa nhạc |
| `public/favicon/` | Logo và favicon |
| `brain/content/` | Ghi chú công khai đã đồng bộ từ Obsidian |
| `brain/quartz.config.yaml` | Tên, màu, URL và bố cục Second Brain |
| `scripts/` | Lệnh tự động hóa |
| `docs/` | Tài liệu sử dụng |

## 15. Checklist ngắn

Trước khi push:

- [ ] Đã lưu bài/ghi chú và kiểm tra ảnh đúng vị trí.
- [ ] Ghi chú muốn public đã có `publish: true`.
- [ ] Đã chạy `pnpm brain:sync` nếu Obsidian thay đổi.
- [ ] Đã chạy `pnpm check`, `pnpm build`, `pnpm check:site`.
- [ ] Đã xem `git status`, không có `.env` hay file bí mật.
- [ ] Commit có tên dễ hiểu và push lên `main`.
- [ ] Vercel build thành công và website production hiển thị đúng.
