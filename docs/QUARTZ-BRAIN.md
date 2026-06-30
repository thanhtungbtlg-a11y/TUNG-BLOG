# Quản lý Thanh Tùng's Brain

Khu ghi chú Quartz được xuất bản tại:

- `https://www.thanhtung0209.com/brain/`
- Vault hiện tại: `C:\Users\NITRO 5\Downloads\LEED_Obsidian_Vault`

## Cập nhật ghi chú

1. Viết hoặc sửa ghi chú trong Obsidian như bình thường.
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
6. Commit và push các thay đổi lên GitHub. Vercel sẽ build blog và Brain trong cùng một lần deploy.

## Dùng vault khác

Truyền đường dẫn vault sau dấu `--`:

```powershell
pnpm brain:sync -- "D:\Obsidian\My Vault"
```

Hoặc đặt biến môi trường `OBSIDIAN_VAULT_PATH` trước khi chạy lệnh đồng bộ.

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

Quartz sẽ loại ghi chú đó khỏi website khi build.

## Cấu trúc quan trọng

- `brain/content`: bản ghi chú sẽ được commit và public.
- `brain/quartz.config.ts`: tên website, màu sắc, URL và plugin Quartz.
- `brain/quartz.layout.ts`: Explorer, Search, Graph, TOC, Backlinks và footer.
- `scripts/sync-brain-vault.mjs`: đồng bộ vault an toàn.
- `scripts/build-brain.mjs`: build Quartz vào `dist/brain`.

Vercel không đọc trực tiếp vault trên máy. Vì vậy cần chạy `pnpm brain:sync` trước khi commit mỗi lần muốn cập nhật Brain.
