# 🚀 คู่มือการ Deploy PaiNamNae WebApp

## ข้อมูล Server
- **Control Panel**: Hestia (https://ns1.cpkku.com:8083)
- **Domain**: `csgroup41.cpkku.com`
- **Username**: `csse4169`

---

## ขั้นตอนที่ 1: Login เข้า Hestia Control Panel

1. เปิด https://ns1.cpkku.com:8083
2. Login ด้วย username และ password ที่ได้รับ
3. จะเห็นหน้า Dashboard

---

## ขั้นตอนที่ 2: สร้าง Domain

1. ไปที่ **WEB** 
2. คลิก **+ Add Web Domain**
3. กรอก Domain: `csgroup41.cpkku.com`
4. เลือก **Enable SSL** (Let's Encrypt)
5. คลิก **Save**

---

## ขั้นตอนที่ 3: สร้าง Database PostgreSQL

1. ไปที่ **DB** (Database)
2. คลิก **+ Add Database**
3. กรอกข้อมูล:
   - Database: `painamnae`
   - User: `painamnae_user` (หรือใช้ค่าเดิม)
   - Password: สร้างรหัสผ่านที่ปลอดภัย
   - Type: **PostgreSQL**
4. คลิก **Save**
5. **จดบันทึก** ข้อมูลเหล่านี้สำหรับใช้ใน `.env.production`

---

## ขั้นตอนที่ 4: เข้าถึง Server ผ่าน SSH/SFTP

### วิธี A: ใช้ SSH Terminal
```bash
ssh csse4169@ns1.cpkku.com
# หรือ IP ของ server
```

### วิธี B: ใช้ SFTP (FileZilla)
- Host: `ns1.cpkku.com`
- Username: `csse4169`
- Password: (รหัสผ่านที่ได้รับ)
- Port: `22`

---

## ขั้นตอนที่ 5: Upload Code ขึ้น Server

### โครงสร้างโฟลเดอร์บน Server:
```
/home/csse4169/
├── web/
│   └── painamnae.cpkku.com/    # (ชื่อ domain ของคุณ)
│       └── public_html/
│           ├── backend/
│           ├── frontend/
│           ├── ecosystem.config.js
│           └── deploy.sh
```

### วิธี Upload:
1. เปิด FileZilla หรือ WinSCP
2. Connect ไปที่ server
3. Navigate ไปที่ `/home/csse4169/web/YOUR_DOMAIN/public_html/`
4. Upload โฟลเดอร์ `backend`, `frontend` และไฟล์ config

---

## ขั้นตอนที่ 6: ตั้งค่า Environment Variables

### Backend (.env.production)
```bash
cd /home/csse4169/web/YOUR_DOMAIN/public_html/backend

# คัดลอกไฟล์ example
cp .env.production.example .env.production

# แก้ไขไฟล์
nano .env.production
```

**ใส่ค่าจริง:**
```env
DATABASE_URL="postgresql://painamnae_user:YOUR_PASSWORD@localhost:5432/painamnae?schema=public"
JWT_SECRET=RANDOM_64_CHARACTER_STRING
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
ADMIN_EMAIL=admin@painamnae.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
NODE_ENV=production
PORT=3000
```

### Frontend (.env.production)
```bash
cd /home/csse4169/web/YOUR_DOMAIN/public_html/frontend

cp .env.production.example .env.production
nano .env.production
```

**ใส่ค่าจริง:**
```env
NUXT_PUBLIC_API_BASE=https://YOUR_DOMAIN.cpkku.com/api/
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NODE_ENV=production
```

---

## ขั้นตอนที่ 7: ติดตั้ง Node.js และ PM2

```bash
# ตรวจสอบ Node.js version
node -v
npm -v

# ถ้ายังไม่มี PM2
npm install -g pm2
```

---

## ขั้นตอนที่ 8: รัน Deployment Script

```bash
cd /home/csse4169/web/YOUR_DOMAIN/public_html

# ให้สิทธิ์ execute
chmod +x deploy.sh

# รัน deployment
./deploy.sh
```

สคริปต์จะทำสิ่งต่อไปนี้:
1. ✅ ติดตั้ง dependencies
2. ✅ Generate Prisma Client
3. ✅ รัน Database migrations
4. ✅ Seed admin user
5. ✅ Build frontend
6. ✅ Start applications ด้วย PM2

---

## ขั้นตอนที่ 9: ตั้งค่า Nginx Proxy

### ผ่าน Hestia Control Panel:
1. ไปที่ **WEB**
2. คลิก **Edit** ที่ domain ของคุณ
3. ไปที่ **Advanced Options** หรือ **Proxy Templates**
4. เลือก **Custom Nginx Template** หรือ **Proxy Support**
5. ใส่ configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

6. คลิก **Save**

---

## ขั้นตอนที่ 10: ตรวจสอบการทำงาน

### ตรวจสอบ PM2 Status:
```bash
pm2 status
pm2 logs
```

### ตรวจสอบ API:
```bash
curl http://localhost:3000/api/health
```

### เข้าเว็บไซต์:
- เปิด https://YOUR_DOMAIN.cpkku.com

---

## 🔧 คำสั่งที่ใช้บ่อย

```bash
# ดูสถานะ
pm2 status

# ดู logs
pm2 logs
pm2 logs painamnae-backend
pm2 logs painamnae-frontend

# Restart
pm2 restart all
pm2 restart painamnae-backend
pm2 restart painamnae-frontend

# Stop
pm2 stop all

# Delete และเริ่มใหม่
pm2 delete all
pm2 start ecosystem.config.js --env production

# ให้ PM2 รันตอน server reboot
pm2 startup
pm2 save
```

---

## 🐛 Troubleshooting

### ปัญหา: Application ไม่ทำงาน
```bash
pm2 logs --lines 100
```

### ปัญหา: Database connection error
```bash
# ตรวจสอบ PostgreSQL
sudo systemctl status postgresql

# ตรวจสอบ connection
psql -h localhost -U painamnae_user -d painamnae
```

### ปัญหา: 502 Bad Gateway
- ตรวจสอบว่า PM2 รันอยู่: `pm2 status`
- ตรวจสอบ Nginx config
- ตรวจสอบ ports (3000, 3001) ไม่ถูกใช้โดย process อื่น

### ปัญหา: Permission denied
```bash
# ให้สิทธิ์โฟลเดอร์
chmod -R 755 /home/csse4169/web/YOUR_DOMAIN/public_html
```

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ logs: `pm2 logs`
2. ตรวจสอบ Nginx error log: `/var/log/nginx/error.log`
3. ติดต่อเจ้าหน้าที่ที่ดูแล server

---

## ✅ Checklist ก่อน Deploy

- [ ] สร้าง Domain ใน Hestia
- [ ] สร้าง Database PostgreSQL
- [ ] Upload code ขึ้น server
- [ ] ตั้งค่า .env.production (backend)
- [ ] ตั้งค่า .env.production (frontend)
- [ ] รัน deploy.sh
- [ ] ตั้งค่า Nginx proxy
- [ ] ทดสอบเว็บไซต์
- [ ] ตั้งค่า PM2 startup
