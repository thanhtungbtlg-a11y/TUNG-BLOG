# Quản lý Thanh Tùng's Brain

Brain dùng Quartz v5 và được xuất bản tại:

- `https://www.thanhtung0209.com/brain/`
- Vault hiện tại: `C:\Users\NITRO 5\Downloads\LEED_Obsidian_Vault`

## Ranh giới với blog

Quartz được đặt riêng trong `brain/`. Nó không dùng component, CSS hoặc route của
blog Astro.

Blog chỉ gọi `scripts/build-brain.mjs` ở cuối lệnh build. Script này:

1. Cài dependency Quartz khi `package-lock.json` thay đổi.
2. Khôi phục plugin v5 theo `brain/quartz.lock.json`.
3. Xuất kết quả tĩnh vào `dist/brain` để Vercel phục vụ dưới `/brain`.

Muốn chỉnh giao diện Brain, chỉ cần sửa `brain/quartz.config.yaml`. Không cần sửa
code trong `src/` của blog.

## Cập nhật ghi chú

1. Viết hoặc sửa ghi chú trong Obsidian.
2. Mở PowerShell tại thư mục blog.
3. Đồng bộ vault vào Quartz:

   ```powershell
   pnpm brain:sync
   ```

4. Xem thử Brain trên máy:

   ```powershell
   pnpm brain:dev
   ```

5. Mở `http://localhost:8080/brain/`.
6. Commit và push. Vercel sẽ build blog và Brain trong cùng một lần deploy.

## Dùng vault khác

Truyền đường dẫn vault sau dấu `--`:

```powershell
pnpm brain:sync -- "D:\Obsidian\My Vault"
```

Hoặc đặt biến môi trường `OBSIDIAN_VAULT_PATH` trước khi đồng bộ.

## Giữ ghi chú riêng tư

Những nội dung sau không được sao chép hoặc xuất bản:

- `.obsidian`
- `.smart-env`
- `.trash`
- thư mục `private`
- thư mục `templates`
- file `.base`

Để ẩn một ghi chú riêng lẻ, thêm frontmatter:

```yaml
---
draft: true
---
```

## Cấu trúc quan trọng

- `brain/content/`: ghi chú được public.
- `brain/quartz.config.yaml`: tên, màu, URL, plugin và bố cục Brain.
- `brain/quartz.lock.json`: khóa đúng phiên bản plugin để các lần build giống nhau.
- `scripts/sync-brain-vault.mjs`: đồng bộ vault an toàn.
- `scripts/build-brain.mjs`: cầu nối nhỏ giữa blog và Quartz.

Vercel không đọc trực tiếp vault trên máy. Vì vậy, cần chạy `pnpm brain:sync`
trước khi commit mỗi lần muốn cập nhật Brain.

## Khôi phục Quartz v4

Bản trước khi nâng cấp được giữ trên GitHub tại:

- Branch: `codex/quartz-v4-backup`
- Tag: `quartz-v4-backup-2026-07-01`

Không cần chạm vào các bài blog để khôi phục bản này.
