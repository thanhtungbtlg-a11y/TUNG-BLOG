# THANH TÙNG

Blog cá nhân của Nguyễn Thanh Tùng, viết bằng Astro và triển khai trên Vercel.

- Website: [www.thanhtung0209.com](https://www.thanhtung0209.com)
- Second Brain: [www.thanhtung0209.com/brain/](https://www.thanhtung0209.com/brain/)
- Quản trị: [www.thanhtung0209.com/admin/](https://www.thanhtung0209.com/admin/)

## Bắt đầu nhanh

Yêu cầu: Node.js 22+, pnpm 9+ và Git.

```powershell
pnpm install
pnpm dev
```

Trước khi push:

```powershell
pnpm check
pnpm build
pnpm check:site
```

## Tài liệu

- [Hướng dẫn tự cập nhật blog và Second Brain](docs/HUONG-DAN-TU-CAP-NHAT.md)
- [Hướng dẫn trang quản trị](docs/ADMIN-DASHBOARD.md)
- [Hướng dẫn Quartz Second Brain](docs/QUARTZ-BRAIN.md)
- Bản Word để đọc/in: `docs/huong-dan-su-dung-tung-blog.docx`

## Lệnh thường dùng

```powershell
pnpm new-post        # Tạo bài blog mới
pnpm new-photo       # Thêm ảnh vào Kho ảnh
pnpm music           # Cập nhật danh sách nhạc
pnpm brain:sync      # Đồng bộ Obsidian vào Second Brain
pnpm brain:dev       # Xem thử Second Brain tại localhost:8080/brain/
```

Mỗi lần push lên nhánh `main`, Vercel tự build và xuất bản blog cùng Second Brain.
