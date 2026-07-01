# Quản lý Thanh Tùng's Second Brain

Second Brain dùng Quartz v5 và được xuất bản tại:

- `https://www.thanhtung0209.com/brain/`
- Vault mặc định: `C:\Users\NITRO 5\Downloads\LEED_Obsidian_Vault`

Đường dẫn `/brain/` được giữ ổn định để liên kết cũ không bị hỏng. Tên hiển thị trên
menu và trang Quartz là **Second Brain**.

## Ranh giới với blog

Quartz nằm riêng trong `brain/`; không dùng component, CSS hoặc route Astro của blog.
Blog chỉ gọi `scripts/build-brain.mjs` ở cuối quá trình build rồi xuất website tĩnh vào
`dist/brain`.

Muốn đổi tên, màu, font hoặc bố cục Second Brain, sửa `brain/quartz.config.yaml`.
Không cần sửa thư mục `src/` của blog.

## Quy trình cập nhật

1. Viết hoặc sửa ghi chú trong Obsidian.
2. Mở PowerShell tại thư mục blog.
3. Đồng bộ vault:

   ```powershell
   pnpm brain:sync
   ```

4. Xem thử:

   ```powershell
   pnpm brain:dev
   ```

5. Mở `http://localhost:8080/brain/`.
6. Nhấn `Ctrl + C` để dừng server.
7. Chạy `pnpm build`, commit và push lên GitHub.

## Dùng vault khác

```powershell
pnpm brain:sync -- "D:\Obsidian\My Vault"
```

Hoặc đặt biến môi trường `OBSIDIAN_VAULT_PATH` trước khi đồng bộ.

## Giữ ghi chú riêng tư

Những nội dung sau không được sao chép hoặc xuất bản:

- `.obsidian`, `.smart-env`, `.trash`;
- thư mục `private`, `templates`;
- file `.base`;
- ghi chú có `draft: true` trong frontmatter.

## Cấu trúc quan trọng

- `brain/content/`: ghi chú công khai đã đồng bộ.
- `brain/quartz.config.yaml`: tên, màu, URL, plugin và bố cục Second Brain.
- `brain/quartz.lock.json`: khóa đúng phiên bản plugin Quartz v5.
- `scripts/sync-brain-vault.mjs`: đồng bộ vault và tạo trang chủ.
- `scripts/build-brain.mjs`: build Quartz vào website chính.

Không sửa trực tiếp `brain/content/index.md` để đổi lâu dài vì lần chạy
`pnpm brain:sync` tiếp theo sẽ tạo lại file này. Hãy sửa mẫu trong
`scripts/sync-brain-vault.mjs`.

## Push và khôi phục

Vercel không đọc vault trên máy, vì vậy luôn chạy `pnpm brain:sync` trước khi commit.

```powershell
pnpm build
git add brain scripts
git commit -m "Cap nhat Second Brain"
git push origin main
```

Bản Quartz v4 trước khi nâng cấp được giữ tại:

- Branch: `codex/quartz-v4-backup`
- Tag: `quartz-v4-backup-2026-07-01`

Hướng dẫn đầy đủ cho cả blog và Second Brain nằm tại
`docs/HUONG-DAN-TU-CAP-NHAT.md`.
