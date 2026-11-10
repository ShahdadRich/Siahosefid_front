# مستندات جامع API و معماری بک‌اند پلتفرم «سیاه و سفید» (Siah o Sefid — Fine Art Exhibition & Marketplace)

این سند مرجع رسمی و نهایی معماری ارتباطی، قراردادهای RESTful API، مدل‌های داده، و مشخصات اعتبارسنجی سرور پلتفرم **«سیاه و سفید»** است. کلیه مسیرها، مدل‌ها و رفتارهای ذکر شده در این سند به صورت ۱۰۰٪ منطبق با کدبیس فرانت‌اند، نیازمندی‌های توسعه بک‌اند سازمانی (Node.js/Express/NestJS، Go، یا Python/FastAPI) و تجربه کاربری مینیمالیسم سوئیسی تدوین شده‌اند.

---

## فهرست فصول مستندات

- [۰. معماری و قراردادهای سراسری ارتباط (Global API Conventions)](#۰-معماری-و-قراردادهای-سراسری-ارتباط-global-api-conventions)
- [۱. جدول نگاشت مسیرهای فرانت‌اند و کلاینت (SPA Routing Matrix)](#۱-جدول-نگاشت-مسیرهای-فرانت‌اند-و-کلاینت-spa-routing-matrix)
- [۲. احراز هویت، ورود، ثبت‌نام و مدیریت نشست (`/api/v1/auth/*`)](#۲-احراز-هویت-ورود-ثبت‌نام-و-مدیریت-نشست-apiv1auth)
- [۳. پنل اختصاصی هنرمند و مدیریت استودیو (`/api/v1/studio/*` و `/api/v1/artworks/*`)](#۳-پنل-اختصاصی-هنرمند-و-مدیریت-استودیو-apiv1studio-و-apiv1artworks)
- [۴. گالری عمومی، جزئیات اثر، شناسنامه اصالت و خرید (`/api/v1/artworks/*`)](#۴-گالری-عمومی-جزئیات-اثر-شناسنامه-اصالت-و-خرید-apiv1artworks)
- [۵. پنل هنردوست، مدیریت کیف‌پول و تراکنش‌ها (`/api/v1/collector/*`)](#۵-پنل-هنردوست-مدیریت-کیف‌پول-و-تراکنش‌ها-apiv1collector)
- [۶. فهرست عمومی هنرمندان، استعلام اصالت و آمار زنده (`/api/v1/public/*`)](#۶-فهرست-عمومی-هنرمندان-استعلام-اصالت-و-آمار-زنده-apiv1public)
- [۷. کنسول مدیریت ارشد و حاکمیت پلتفرم (`/api/v1/admin/*`)](#۷-کنسول-مدیریت-ارشد-و-حاکمیت-پلتفرم-apiv1admin)
- [۸. کدها و ساختار سراسری خطاها (Standard Error Handling Matrix)](#۸-کدها-و-ساختار-سراسری-خطاها-standard-error-handling-matrix)

---

## ۰. معماری و قراردادهای سراسری ارتباط (Global API Conventions)

### ۰.۱. نشانی پایه‌ای سرور (Base URLs)
- **محیط توسعه محلی (Local Development):** `http://localhost:4000/api/v1` (قابل پیکربندی در فایل `.env` فرانت‌اند از طریق متغیر `VITE_API_BASE_URL`)
- **محیط عملیاتی و ابری (Production CDN & Cluster):** `https://api.siahosefid.art/api/v1`
- **لایه سرویس کلاینت:** فایل `src/services/api.ts` حاوی تمامی توابع اتصال، نگاشتگرهای مدل (Payload Mappers) و مدیریت توکن محلی است.

### ۰.۲. هدرهای استاندارد درخواست و پاسخ (HTTP Headers)
```http
Accept: application/json; charset=utf-8
Content-Type: application/json; charset=utf-8
Authorization: Bearer <access_token>
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
Idempotency-Key: idemp-9a8b7c6d-1234
```
- **هدر `Idempotency-Key`:** برای تمامی درخواست‌های مالی و حساس (نظیر شارژ کیف‌پول یا خرید اثر هنری) جهت جلوگیری از کسر تکراری وجه در قطعی‌های شبکه اجباری است.
- **هدر `Authorization`:** برای تمامی مسیرهای حفاظت‌شده ضروری است. در صورت منقضی شدن یا عدم ارائه، خطای `401 Unauthorized` برگردانده می‌شود.

### ۰.۳. کپسول استاندارد پاسخ سرور (Standard Envelope Format)
تمامی پاسخ‌های سرور درون یک کپسول استاندارد بازگردانده می‌شوند:

#### پاسخ موفق (`200 OK` / `201 Created`):
```json
{
  "status": "success",
  "message": "عملیات با موفقیت انجام شد.",
  "data": { ... }
}
```

#### پاسخ خطا (`4xx` / `5xx`):
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "اطلاعات ورودی نامعتبر است.",
  "errors": {
    "field_name": "شرح خطای اعتبارسنجی فیلد"
  },
  "details": {
    "timestamp": "2026-03-30T14:22:10.150Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## ۱. جدول نگاشت مسیرهای فرانت‌اند و کلاینت (SPA Routing Matrix)

مسیریابی کلاینت به صورت مستقیم با HTML5 History API پیاده‌سازی شده است:

| مسیر مرورگر (Pathname) | نام ویو کلاینت (`AppView`) | سطح دسترسی (`SessionRole`) | کارکرد و توضیحات |
| :--- | :--- | :--- | :--- |
| `/` | `landing` | عمومی (`GUEST` / آزاد) | صفحه اصلی روایت‌محور (Scrollytelling)، بیانیه مانیفست، مقالات، درگاه عضویت دوگانه و ۳ شمارنده زنده |
| `/gallery` | `gallery` | عمومی (`GUEST` / `COLLECTOR`) | نمایشگاه و بازارگاه آثار هنری، نمای اسلایدر و نمای موزه‌ای، فیلترهای چندگانه و خرید آنی با کیف‌پول |
| `/studio` | `artist-panel` | هنرمند (`ARTIST`) | استودیوی اختصاصی هنرمند، ۴ شاخص کلیدی، بارگذاری تصویر و ثبت اثر جدید، ویرایش قیمت و داستان، حذف اثر |
| `/collector` | `collector-panel` | هنردوست (`COLLECTOR`) | مدیریت کیف‌پول، شارژ آنی با بسته‌های پیشنهادی یا مبلغ دلخواه، ویرایش پروفایل، گنجینه آثار و تاریخچه تراکنش‌ها |
| **`/admin`** | `admin-panel` | **مدیر ارشد (`ADMIN`)** | **کنسول مدیریت ارشد و کیوریشن — صرفاً با تایپ مستقیم `/admin` در نوار آدرس قابل دسترس است.** |

---

## ۲. احراز هویت، ورود، ثبت‌نام و مدیریت نشست (`/api/v1/auth/*`)

### ۲.۱. ثبت‌نام هنرمند («هنرمندم»)
ایجاد حساب کاربری هنرمند، راه‌اندازی استودیوی شخصی و هدایت خودکار به مسیر `/studio`.

- **Method & Path:** `POST /api/v1/auth/register/artist`
- **Authentication:** عمومی (Public)
- **فیلدهای ارسالی (`Request Body`):**
  - `fullName` (`string`، الزامی): نام و نام خانوادگی هنرمند (حداقل ۳ کاراکتر)
  - `artisticName` (`string`، الزامی): نام هنری یا امضای حرفه‌ای هنرمند (حداقل ۲ کاراکتر)
  - `artisticStyle` (`string`، الزامی): کد یا عنوان سبک هنری انتخابی:
    - `"MINIMALISM"` (`مینیمالیسم`)
    - `"ABSTRACT"` (`آبستره و خطاطی`)
    - `"SCULPTURE"` (`مجسمه‌سازی`)
    - `"PHOTOGRAPHY"` (`عکاسی هنری`)
    - `"DIGITAL"` (`دیجیتال آرت`)
    - `"OTHER"` (`غیره`)
  - `customStyle` (`string`، شرطی): عنوان سبک هنری در صورتی که گزینه **`OTHER` (`غیره`)** انتخاب شده باشد (حداقل ۲ کاراکتر الزامی است)
  - `phone` (`string`، الزامی): شماره تلفن همراه ایران (فرمت معتبر `09xxxxxxxxx`)
  - `email` (`string`، الزامی): نشانی پست الکترونیکی یکتا
- **Request Body Schema (نمونه با سبک دلخواه):**
  ```json
  {
    "fullName": "کیوان دولتشاهی",
    "artisticName": "KEYVAN / سایه‌نگار",
    "artisticStyle": "OTHER",
    "customStyle": "چیدمان مفهومی و هنر نور",
    "phone": "09123456789",
    "email": "keyvan@siahosefid.art"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "حساب هنرمند با موفقیت ایجاد شد و استودیوی اختصاصی شما آماده است.",
    "data": {
      "user": {
        "id": "artist-1793998800",
        "role": "ARTIST",
        "fullName": "کیوان دولتشاهی",
        "artisticName": "KEYVAN / سایه‌نگار",
        "artisticAlias": "KEYVAN / سایه‌نگار",
        "artisticStyle": "OTHER",
        "customStyle": "چیدمان مفهومی و هنر نور",
        "phone": "09123456789",
        "email": "keyvan@siahosefid.art",
        "walletBalance": 0,
        "status": "ACTIVE",
        "joinedAt": "۱۴۰۵/۰۸/۱۶",
        "totalSalesCount": 0,
        "totalSalesRevenue": 0
      },
      "redirectPath": "/studio",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "d7a8f9c1e2b34a5d..."
    }
  }
  ```

---

### ۲.۲. ثبت‌نام هنردوست / کلکسیونر («هنردوستم»)
ایجاد حساب کاربری هنردوست به همراه شارژ اولیه اختیاری کیف‌پول در لحظه عضویت و هدایت به `/gallery`.

- **Method & Path:** `POST /api/v1/auth/register/collector`
- **Authentication:** عمومی (Public)
- **فیلدهای ارسالی (`Request Body`):**
  - `fullName` (`string`، الزامی): نام و نام خانوادگی هنردوست
  - `email` (`string`، الزامی): نشانی ایمیل
  - `phone` (`string`، الزامی): شماره تلفن همراه (`09xxxxxxxxx`)
  - `initialWalletTopUp` (`number`، اختیاری — پیش‌فرض `50000000`): مبلغ شارژ اولیه کیف‌پول برحسب تومان (`0`، `25000000`، `50000000`، `100000000`، یا `200000000`)
- **Request Body Schema:**
  ```json
  {
    "fullName": "سارا نیازی",
    "email": "sara@collector.ir",
    "phone": "09128889900",
    "initialWalletTopUp": 50000000
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "عضویت هنردوست و شارژ اولیه کیف‌پول با موفقیت انجام شد.",
    "data": {
      "user": {
        "id": "collector-1793998900",
        "role": "COLLECTOR",
        "fullName": "سارا نیازی",
        "email": "sara@collector.ir",
        "phone": "09128889900",
        "walletBalance": 50000000,
        "status": "ACTIVE",
        "joinedAt": "۱۴۰۵/۰۸/۱۶",
        "totalSalesCount": 0,
        "totalSalesRevenue": 0
      },
      "initialTransaction": {
        "id": "tx-9901",
        "referenceCode": "TX-2026-9901",
        "userId": "collector-1793998900",
        "userName": "سارا نیازی",
        "type": "TOP_UP",
        "amount": 50000000,
        "timestamp": "۱۴۰۵/۰۸/۱۶ — اکنون"
      },
      "redirectPath": "/gallery",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "c3e4a5b6f7a8..."
    }
  }
  ```

---

### ۲.۳. ورود کاربران به سیستم با رمز عبور / رمز یکبارمصرف (`Login`)
ورود هنرمند، هنردوست یا مدیر ارشد به حساب کاربری از پیش ثبت‌شده.

- **Method & Path:** `POST /api/v1/auth/login`
- **Authentication:** عمومی (Public)
- **Request Body Schema:**
  ```json
  {
    "identifier": "sohrab@siahosefid.art",
    "password": "SecurePassword123!",
    "otpCode": "849201"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "ورود به حساب کاربری با موفقیت انجام شد.",
    "data": {
      "user": {
        "id": "artist-1",
        "role": "ARTIST",
        "fullName": "سهراب فرزاد",
        "artisticAlias": "سایه‌نگار",
        "email": "sohrab@siahosefid.art",
        "phone": "09123456789",
        "walletBalance": 42000000,
        "status": "ACTIVE"
      },
      "redirectPath": "/studio",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "a1b2c3d4e5f6..."
    }
  }
  ```

---

### ۲.۴. درخواست ارسال کد تایید یکبارمصرف پیامکی (`Request OTP`)
جهت ورود بدون رمز عبور یا بازیابی دسترسی با شماره موبایل.

- **Method & Path:** `POST /api/v1/auth/otp/request`
- **Authentication:** عمومی (Public)
- **Request Body Schema:**
  ```json
  {
    "phone": "09123456789",
    "purpose": "LOGIN"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "کد تایید یکبارمصرف به شماره همراه شما پیامک شد.",
    "data": {
      "expiresInSeconds": 120,
      "resendAvailableIn": 60
    }
  }
  ```

---

### ۲.۵. تمدید توکن نشست منقضی‌شده (`Token Refresh`)
- **Method & Path:** `POST /api/v1/auth/refresh`
- **Authentication:** عمومی با ارائه `refreshToken`
- **Request Body Schema:**
  ```json
  {
    "refreshToken": "a1b2c3d4e5f6..."
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
      "refreshToken": "f6e5d4c3b2a1..."
    }
  }
  ```

---

### ۲.۶. استعلام مشخصات نشست فعلی کاربر (`Session Persistence`)
- **Method & Path:** `GET /api/v1/auth/me`
- **Authentication:** نیازمند توکن `Bearer JWT`
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "authenticated": true,
      "role": "ARTIST",
      "user": {
        "id": "artist-1",
        "role": "ARTIST",
        "fullName": "سهراب فرزاد",
        "artisticName": "سایه‌نگار",
        "artisticAlias": "سایه‌نگار",
        "artisticStyle": "ABSTRACT",
        "phone": "09123456789",
        "email": "sohrab@siahosefid.art",
        "walletBalance": 42000000,
        "status": "ACTIVE",
        "joinedAt": "۱۴۰۴/۱۱/۱۲",
        "totalSalesCount": 4,
        "totalSalesRevenue": 185000000
      }
    }
  }
  ```

---

### ۲.۷. خروج از حساب کاربری (`Logout`)
ابطال نشست و توکن‌های صادرشده در سرور و کلاینت.

- **Method & Path:** `POST /api/v1/auth/logout`
- **Authentication:** نیازمند توکن `Bearer JWT`
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "خروج از حساب کاربری با موفقیت انجام شد.",
    "data": {
      "redirectPath": "/"
    }
  }
  ```

---

## ۳. پنل اختصاصی هنرمند و مدیریت استودیو (`/api/v1/studio/*` و `/api/v1/artworks/*`)

### ۳.۱. دریافت اطلاعات کامل استودیو و ۴ شاخص کلان بالای صفحه
تامین‌کننده ۴ بلوک آماری بالای استودیو (`شناسنامه هنرمند`، `آثار ثبت‌شده`، `آثار فروخته‌شده`، `مجموع عواید فروش`) و کاتالوگ آثار هنرمند.

- **Method & Path:** `GET /api/v1/studio/me`
- **Authentication:** نیازمند توکن هنرمند (`Role: ARTIST`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "artistIdentity": {
        "id": "artist-1",
        "fullName": "سهراب فرزاد",
        "artisticName": "سایه‌نگار",
        "artisticStyle": "ABSTRACT",
        "styleLabel": "آبستره و خطاطی",
        "email": "sohrab@siahosefid.art",
        "phone": "09123456789",
        "joinedAt": "۱۴۰۴/۱۱/۱۲"
      },
      "counters": {
        "registeredArtworksCount": 1,
        "soldArtworksCount": 4,
        "totalSalesRevenue": 185000000
      },
      "artworks": [
        {
          "id": "art-1",
          "accessionCode": "آرشیو ۱۴۰۵-۰۱",
          "title": "سکوت مرکب بر کتان خام",
          "titleEn": "Silence of Sumi Ink on Raw Linen",
          "artistId": "artist-1",
          "artistName": "سهراب فرزاد",
          "artistAlias": "سایه‌نگار",
          "style": "ABSTRACT",
          "styleLabel": "آبستره و خطاطی",
          "price": 48000000,
          "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
          "medium": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
          "technique": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
          "year": "۱۴۰۵",
          "story": "این اثر حاصل هم‌نشینی فرم‌های خوشنویسی سیاه‌مشق ایرانی با زیبایی‌شناسی مینیمالیسم سوئیسی است.",
          "image": "/images/art_charcoal_calligraphy_1793998760531.jpg",
          "imageUrl": "/images/art_charcoal_calligraphy_1793998760531.jpg",
          "aspectRatio": "3/4",
          "featured": true,
          "sold": false,
          "isSold": false
        }
      ]
    }
  }
  ```

---

### ۳.۲. بارگذاری مستقیم تصویر اثر هنری با کیفیت آرشیوی (`Image Upload`)
پشتیبانی از دکمه `بارگذاری تصویر از دستگاه +` در استودیو.

- **Method & Path:** `POST /api/v1/artworks/upload-image`
- **Authentication:** نیازمند توکن هنرمند (`Role: ARTIST`)
- **Content-Type:** `multipart/form-data`
- **Form Data:** فایل `image` با حداکثر حجم ۱۰ مگابایت (`image/jpeg`, `image/png`, `image/webp`)
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "تصویر اثر با کیفیت آرشیوی بارگذاری شد.",
    "data": {
      "imageUrl": "https://cdn.siahosefid.art/uploads/artworks/1793999050-ash-constellation.jpg",
      "fileName": "ash-constellation.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 1843200,
      "width": 2400,
      "height": 3200
    }
  }
  ```

---

### ۳.۳. ثبت و قیمت‌گذاری اثر هنری جدید توسط هنرمند
- **Method & Path:** `POST /api/v1/artworks`
- **Authentication:** نیازمند توکن هنرمند (`Role: ARTIST`)
- **فیلدهای ارسالی (`Request Body`):**
  - `title` (`string`، الزامی): عنوان اثر (حداقل ۲ کاراکتر)
  - `titleEn` (`string`، اختیاری): عنوان انگلیسی اثر
  - `style` (`ArtStyle`، الزامی): `"MINIMALISM" | "ABSTRACT" | "SCULPTURE" | "PHOTOGRAPHY" | "DIGITAL" | "OTHER"`
  - `customStyle` (`string`، شرطی): در صورت انتخاب `"OTHER"` الزامی است
  - `price` (`number`، الزامی): قیمت برحسب تومان (حداقل ۱۰۰,۰۰۰ تومان)
  - `dimensions` (`string`، الزامی): ابعاد اثر (مثال: `"120 × 160 cm"`)
  - `technique` (`string`، الزامی): متریال و تکنیک اجرا
  - `story` (`string`، الزامی): بیانیه و کانسپت اثر (حداقل ۱۰ کاراکتر)
  - `imageUrl` (`string`، الزامی): نشانی تصویر اثر
- **Request Body Schema:**
  ```json
  {
    "title": "منظومه خاکستر شماره ۱۲",
    "titleEn": "Ash Constellation XII",
    "style": "OTHER",
    "customStyle": "چیدمان مفهومی و زغال",
    "price": 55000000,
    "dimensions": "120 × 160 cm",
    "technique": "زغال فشرده و ورق نقره روی بوم کتان",
    "story": "واکاوی مرز میان نور خاکستری و بافت متخلخل زغال روی کتان خام در سکوت استودیو.",
    "imageUrl": "https://cdn.siahosefid.art/uploads/artworks/1793999050-ash-constellation.jpg"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "اثر جدید با موفقیت در نمایشگاه «سیاه و سفید» ثبت شد.",
    "data": {
      "id": "art-1793999100",
      "accessionCode": "آرشیو ۱۴۰۵-۰۷",
      "title": "منظومه خاکستر شماره ۱۲",
      "titleEn": "Ash Constellation XII",
      "artistId": "artist-1",
      "artistName": "سهراب فرزاد",
      "artistAlias": "سایه‌نگار",
      "style": "OTHER",
      "customStyle": "چیدمان مفهومی و زغال",
      "styleLabel": "چیدمان مفهومی و زغال",
      "price": 55000000,
      "dimensions": "120 × 160 cm",
      "medium": "زغال فشرده و ورق نقره روی بوم کتان",
      "technique": "زغال فشرده و ورق نقره روی بوم کتان",
      "year": "۱۴۰۵",
      "story": "واکاوی مرز میان نور خاکستری و بافت متخلخل زغال روی کتان خام در سکوت استودیو.",
      "image": "https://cdn.siahosefid.art/uploads/artworks/1793999050-ash-constellation.jpg",
      "imageUrl": "https://cdn.siahosefid.art/uploads/artworks/1793999050-ash-constellation.jpg",
      "aspectRatio": "3/4",
      "featured": true,
      "sold": false,
      "isSold": false
    }
  }
  ```

---

### ۳.۴. ویرایش مشخصات، قیمت و داستان اثر (`Inline Edit`)
- **Method & Path:** `PATCH /api/v1/artworks/:id`
- **Authentication:** نیازمند توکن هنرمند مالک اثر (`Role: ARTIST`)
- **Request Body Schema:**
  ```json
  {
    "title": "منظومه خاکستر شماره ۱۲ (نسخه موزه)",
    "price": 60000000,
    "story": "نسخه بازنگری‌شده با قاب چوب گردو دست‌ساز و امضای پشت بوم.",
    "style": "MINIMALISM"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "مشخصات و قیمت اثر با موفقیت به‌روزرسانی شد.",
    "data": {
      "id": "art-1793999100",
      "title": "منظومه خاکستر شماره ۱۲ (نسخه موزه)",
      "price": 60000000,
      "story": "نسخه بازنگری‌شده با قاب چوب گردو دست‌ساز و امضای پشت بوم.",
      "style": "MINIMALISM",
      "styleLabel": "مینیمالیسم"
    }
  }
  ```

---

### ۳.۵. حذف اثر هنری توسط هنرمند مالک
- **Method & Path:** `DELETE /api/v1/artworks/:id`
- **Authentication:** نیازمند توکن هنرمند مالک اثر (`Role: ARTIST`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "اثر مورد نظر از کاتالوگ نمایشگاه حذف گردید.",
    "data": {
      "id": "art-1793999100",
      "deleted": true
    }
  }
  ```

---

## ۴. گالری عمومی، جزئیات اثر، شناسنامه اصالت و خرید (`/api/v1/artworks/*`)

### ۴.۱. دریافت کاتالوگ آثار نمایشگاه با فیلترهای پیشرفته
تامین‌کننده آثار در هر دو حالت «نمای اسلایدر» (`carousel`) و «نمای موزه‌ای» (`museum`).

- **Method & Path:** `GET /api/v1/artworks`
- **Authentication:** عمومی (Public)
- **پارامترهای جستجو و صفحه‌بندی (`Query Parameters`):**
  - `?search=` (`string`، اختیاری): جستجوی متنی در عنوان اثر، نام هنرمند، نام هنری یا شناسه آرشیو
  - `?style=` (`string`، اختیاری): فیلتر بر اساس کد سبک هنری (`MINIMALISM`, `ABSTRACT`, `SCULPTURE`, `PHOTOGRAPHY`, `DIGITAL`, `OTHER`)
  - `?priceRange=` (`string`، اختیاری): فیلتر بازه قیمت (`under-45m`, `45m-70m`, `above-70m`)
  - `?artistId=` (`string`، اختیاری): فیلتر آثار یک هنرمند معین
  - `?featured=` (`boolean`، اختیاری): فیلتر آثار برگزیده برای لندینگ (`true` یا `false`)
  - `?page=` (`number`، اختیاری — پیش‌فرض `1`): شماره صفحه
  - `?limit=` (`number`، اختیاری — پیش‌فرض `20`): تعداد در هر صفحه
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "art-1",
        "accessionCode": "آرشیو ۱۴۰۵-۰۱",
        "title": "سکوت مرکب بر کتان خام",
        "titleEn": "Silence of Sumi Ink on Raw Linen",
        "artistId": "artist-1",
        "artistName": "سهراب فرزاد",
        "artistAlias": "سایه‌نگار",
        "style": "ABSTRACT",
        "styleLabel": "آبستره و خطاطی",
        "price": 48000000,
        "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
        "medium": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
        "technique": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
        "year": "۱۴۰۵",
        "story": "این اثر حاصل هم‌نشینی فرم‌های خوشنویسی سیاه‌مشق ایرانی با زیبایی‌شناسی مینیمالیسم سوئیسی است.",
        "image": "/images/art_charcoal_calligraphy_1793998760531.jpg",
        "imageUrl": "/images/art_charcoal_calligraphy_1793998760531.jpg",
        "aspectRatio": "3/4",
        "featured": true,
        "sold": false,
        "isSold": false
      }
    ]
  }
  ```

---

### ۴.۲. دریافت جزئیات تکی یک اثر هنری و تاریخچه مالکیتی (`Artwork Details`)
پشتیبانی از لایت‌باکس بررسی عمیق اثر و باز کردن مستقیم لینک اختصاصی اثر.

- **Method & Path:** `GET /api/v1/artworks/:id`
- **Authentication:** عمومی (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "art-1",
      "accessionCode": "آرشیو ۱۴۰۵-۰۱",
      "title": "سکوت مرکب بر کتان خام",
      "titleEn": "Silence of Sumi Ink on Raw Linen",
      "artistId": "artist-1",
      "artistName": "سهراب فرزاد",
      "artistAlias": "سایه‌نگار",
      "style": "ABSTRACT",
      "styleLabel": "آبستره و خطاطی",
      "price": 48000000,
      "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
      "medium": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
      "technique": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
      "year": "۱۴۰۵",
      "story": "این اثر حاصل هم‌نشینی فرم‌های خوشنویسی سیاه‌مشق ایرانی با زیبایی‌شناسی مینیمالیسم سوئیسی است.",
      "image": "/src/assets/images/art_charcoal_calligraphy_1793998760531.jpg",
      "imageUrl": "/src/assets/images/art_charcoal_calligraphy_1793998760531.jpg",
      "aspectRatio": "3/4",
      "featured": true,
      "sold": false,
      "isSold": false,
      "buyerId": null,
      "ownerId": "artist-1",
      "provenanceHistory": [
        {
          "event": "CREATED",
          "date": "۱۴۰۵/۰۱/۱۵",
          "party": "سهراب فرزاد"
        }
      ]
    }
  }
  ```

---

### ۴.۳. خرید قطعی اثر هنری با موجودی کیف‌پول (`Atomic Artwork Acquisition`)
تراکنش اتمیک که هم‌زمان بررسی موجودی، کسر از خریدار، افزودن به هنرمند، تغییر مالکیت، ثبت تراکنش و صدور شناسنامه اصالت را انجام می‌دهد.

- **Method & Path:** `POST /api/v1/artworks/:id/purchase`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **Headers:** `Idempotency-Key: <unique_uuid>` (توصیه‌شده جهت جلوگیری از خرید تکراری)
- **Request Body Schema:**
  ```json
  {
    "paymentMethod": "WALLET_BALANCE",
    "acceptArchivalTerms": true
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "خرید اثر با موفقیت انجام شد و شناسنامه اصالت دیجیتال به نام شما ثبت گردید.",
    "data": {
      "artwork": {
        "id": "art-1",
        "accessionCode": "آرشیو ۱۴۰۵-۰۱",
        "title": "سکوت مرکب بر کتان خام",
        "price": 48000000,
        "sold": true,
        "isSold": true,
        "buyerId": "collector-1",
        "ownerId": "collector-1"
      },
      "remainingWalletBalance": 77000000,
      "artistTotalSalesRevenue": 233000000,
      "transaction": {
        "id": "tx-1793999800",
        "referenceCode": "TX-2026-7731",
        "userId": "collector-1",
        "userName": "آریا حسینی",
        "type": "PURCHASE",
        "amount": 48000000,
        "artworkId": "art-1",
        "artworkTitle": "سکوت مرکب بر کتان خام",
        "timestamp": "۱۴۰۵/۰۸/۱۶ — اکنون"
      },
      "certificateOfAuthenticity": {
        "certificateId": "COA-2026-01-7731",
        "accessionCode": "آرشیو ۱۴۰۵-۰۱",
        "artworkId": "art-1",
        "artworkTitle": "سکوت مرکب بر کتان خام",
        "artistName": "سهراب فرزاد",
        "artistAlias": "سایه‌نگار",
        "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
        "technique": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
        "ownerId": "collector-1",
        "ownerName": "آریا حسینی",
        "acquiredPrice": 48000000,
        "issuedAt": "۱۴۰۵/۰۸/۱۶"
      }
    }
  }
  ```
- **Error Response (`402 Payment Required` — کسری موجودی کیف‌پول):**
  ```json
  {
    "status": "error",
    "code": "INSUFFICIENT_WALLET_BALANCE",
    "message": "موجودی حساب کافی نیست.",
    "details": {
      "artworkPrice": 48000000,
      "currentWalletBalance": 10000000,
      "deficitAmount": 38000000
    }
  }
  ```

---

### ۴.۴. استعلام شناسنامه اصالت دیجیتال اثر (`Certificate of Authenticity`)
- **Method & Path:** `GET /api/v1/artworks/:id/certificate`
- **Authentication:** عمومی (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "certificateId": "COA-2026-01-7731",
      "accessionCode": "آرشیو ۱۴۰۵-۰۱",
      "artworkId": "art-1",
      "artworkTitle": "سکوت مرکب بر کتان خام",
      "artistName": "سهراب فرزاد",
      "artistAlias": "سایه‌نگار",
      "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
      "technique": "مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت",
      "ownerId": "collector-1",
      "ownerName": "آریا حسینی",
      "acquiredPrice": 48000000,
      "issuedAt": "۱۴۰۵/۰۸/۱۶",
      "verificationHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  }
  ```

---

## ۵. پنل هنردوست، مدیریت کیف‌پول و تراکنش‌ها (`/api/v1/collector/*`)

### ۵.۱. دریافت خلاصه وضعیت کیف‌پول، گنجینه آثار و تاریخچه تراکنش‌ها
- **Method & Path:** `GET /api/v1/collector/wallet`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "collector": {
        "id": "collector-1",
        "role": "COLLECTOR",
        "fullName": "آریا حسینی",
        "email": "aria.collector@siahosefid.art",
        "phone": "09127778899",
        "walletBalance": 125000000,
        "status": "ACTIVE",
        "joinedAt": "۱۴۰۵/۰۱/۱۰"
      },
      "balance": 125000000,
      "purchasedArtworks": [],
      "transactions": [
        {
          "id": "tx-1",
          "referenceCode": "تراکنش ۱۴۰۵-۹۰۱۲",
          "userId": "collector-1",
          "userName": "آریا حسینی",
          "type": "TOP_UP",
          "amount": 125000000,
          "timestamp": "۱۴۰۵/۰۸/۱۴ — ۱۸:۳۰"
        }
      ]
    }
  }
  ```

---

### ۵.۲. دریافت فهرست اختصاصی گنجینه آثار خریداری‌شده هنردوست (`Treasury Collection`)
- **Method & Path:** `GET /api/v1/collector/treasury`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "count": 1,
      "totalValuation": 48000000,
      "artworks": [
        {
          "id": "art-1",
          "accessionCode": "آرشیو ۱۴۰۵-۰۱",
          "title": "سکوت مرکب بر کتان خام",
          "artistName": "سهراب فرزاد",
          "price": 48000000,
          "image": "/src/assets/images/art_charcoal_calligraphy_1793998760531.jpg",
          "acquiredAt": "۱۴۰۵/۰۸/۱۶"
        }
      ]
    }
  }
  ```

---

### ۵.۳. ویرایش مشخصات فردی هنردوست
مطابق با فرم «ویرایش مشخصات فردی هنردوست» در پنل `/collector`.

- **Method & Path:** `PATCH /api/v1/collector/profile`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **Request Body Schema:**
  ```json
  {
    "fullName": "آریا حسینی",
    "email": "aria.collector@siahosefid.art",
    "phone": "09127778899"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "تغییرات پروفایل با موفقیت ذخیره شد.",
    "data": {
      "id": "collector-1",
      "role": "COLLECTOR",
      "fullName": "آریا حسینی",
      "email": "aria.collector@siahosefid.art",
      "phone": "09127778899",
      "walletBalance": 125000000,
      "status": "ACTIVE",
      "joinedAt": "۱۴۰۵/۰۱/۱۰"
    }
  }
  ```

---

### ۵.۴. افزایش اعتبار و شارژ آنی کیف‌پول (`Wallet Top-Up`)
پشتیبانی از بسته‌های شارژ سریع (`25000000`، `50000000`، `100000000`، `250000000` تومان) یا مبلغ دلخواه.

- **Method & Path:** `POST /api/v1/collector/wallet/topup`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **Headers:** `Idempotency-Key: <unique_uuid>`
- **Request Body Schema:**
  ```json
  {
    "amount": 100000000,
    "presetPackage": 100000000,
    "customAmount": null
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "مبلغ ۱۰۰٬۰۰۰٬۰۰۰ تومان با موفقیت به کیف پول شما افزوده شد.",
    "data": {
      "balance": 225000000,
      "transaction": {
        "id": "tx-1793999500",
        "referenceCode": "TX-2026-4812",
        "userId": "collector-1",
        "userName": "آریا حسینی",
        "type": "TOP_UP",
        "amount": 100000000,
        "timestamp": "۱۴۰۵/۰۸/۱۶ — اکنون"
      }
    }
  }
  ```

---

### ۵.۵. دریافت تاریخچه کامل تراکنش‌های کیف‌پول با صفحه‌بندی (`Transaction Ledger`)
- **Method & Path:** `GET /api/v1/collector/transactions`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
- **پارامترهای جستجو (`Query Parameters`):**
  - `?page=1` (`number`، اختیاری)
  - `?limit=15` (`number`، اختیاری)
  - `?type=` (`"TOP_UP" | "PURCHASE"`، اختیاری)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "total": 2,
      "page": 1,
      "limit": 15,
      "transactions": [
        {
          "id": "tx-1793999800",
          "referenceCode": "TX-2026-7731",
          "userId": "collector-1",
          "userName": "آریا حسینی",
          "type": "PURCHASE",
          "amount": 48000000,
          "artworkId": "art-1",
          "artworkTitle": "سکوت مرکب بر کتان خام",
          "timestamp": "۱۴۰۵/۰۸/۱۶ — ۱۱:۲۰"
        },
        {
          "id": "tx-1",
          "referenceCode": "تراکنش ۱۴۰۵-۹۰۱۲",
          "userId": "collector-1",
          "userName": "آریا حسینی",
          "type": "TOP_UP",
          "amount": 125000000,
          "timestamp": "۱۴۰۵/۰۸/۱۴ — ۱۸:۳۰"
        }
      ]
    }
  }
  ```

---

## ۶. فهرست عمومی هنرمندان، استعلام اصالت و آمار زنده (`/api/v1/public/*`)

### ۶.۱. دریافت آمار زنده صفحه اصلی (`Landing Live Counters`)
تامین‌کننده ۳ شمارنده زنده پایین صفحه اصلی (`/`): `تعداد اعضای سایت`، `تعداد هنرمندان` و `تعداد آثار ثبت‌شده`.

- **Method & Path:** `GET /api/v1/public/stats`
- **Authentication:** عمومی (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "totalMembers": 1247,
      "activeArtists": 184,
      "curatedArtworks": 640
    }
  }
  ```

---

### ۶.۲. دریافت فهرست عمومی هنرمندان پلتفرم (`Public Artists Directory`)
جهت پر کردن فیلتر هنرمندان در گالری و معرفی هنرمندان پلتفرم.

- **Method & Path:** `GET /api/v1/public/artists`
- **Authentication:** عمومی (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "artist-1",
        "fullName": "سهراب فرزاد",
        "artisticAlias": "سایه‌نگار",
        "artisticStyle": "ABSTRACT",
        "styleLabel": "آبستره و خطاطی",
        "worksCount": 1
      },
      {
        "id": "artist-2",
        "fullName": "تارا کیانی",
        "artisticAlias": "مونولیت",
        "artisticStyle": "SCULPTURE",
        "styleLabel": "مجسمه‌سازی",
        "worksCount": 2
      }
    ]
  }
  ```

---

### ۶.۳. استعلام عمومی اصالت شناسنامه دیجیتال (`Public Certificate Verification`)
استعلام صحت کد شناسنامه اصالت یا کد آرشیو بدون نیاز به ورود به حساب کاربری.

- **Method & Path:** `GET /api/v1/public/certificates/verify/:certificateId`
- **Authentication:** عمومی (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "verified": true,
      "certificateId": "COA-2026-01-7731",
      "accessionCode": "آرشیو ۱۴۰۵-۰۱",
      "artworkTitle": "سکوت مرکب بر کتان خام",
      "artistName": "سهراب فرزاد",
      "artistAlias": "سایه‌نگار",
      "ownerName": "آریا حسینی",
      "issuedAt": "۱۴۰۵/۰۸/۱۶"
    }
  }
  ```

---

## ۷. کنسول مدیریت ارشد و حاکمیت پلتفرم (`/api/v1/admin/*`)

### ۷.۱. دریافت نمای کلی کنسول مدیریت و ۴ شاخص کلان (`Admin Overview`)
تامین‌کننده ۴ شاخص کلان بالای کنسول `/admin` (`کل اعضای پلتفرم`، `هنرمندان فعال`، `آثار ثبت‌شده در آرشیو`، `نقدینگی و حجم معاملات`) و جداول کاربران و آثار.

- **Method & Path:** `GET /api/v1/admin/overview`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **پارامترهای جستجو (`Query Parameters`):**
  - `?search=` (`string`، اختیاری): جستجو در نام، ایمیل، تلفن، عنوان اثر یا شناسه آرشیو
  - `?role=` (`"ALL" | "ARTIST" | "COLLECTOR"`، اختیاری)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "metrics": {
        "totalMembers": 1247,
        "activeArtists": 184,
        "curatedArtworks": 640,
        "totalLiquidityAndVolume": 870500000
      },
      "users": [
        {
          "id": "artist-1",
          "role": "ARTIST",
          "fullName": "سهراب فرزاد",
          "artisticAlias": "سایه‌نگار",
          "artisticStyle": "ABSTRACT",
          "phone": "09123456789",
          "email": "sohrab@siahosefid.art",
          "walletBalance": 42000000,
          "status": "ACTIVE",
          "joinedAt": "۱۴۰۴/۱۱/۱۲",
          "totalSalesCount": 4,
          "totalSalesRevenue": 185000000
        }
      ],
      "artworks": [
        {
          "id": "art-1",
          "accessionCode": "آرشیو ۱۴۰۵-۰۱",
          "title": "سکوت مرکب بر کتان خام",
          "titleEn": "Silence of Sumi Ink on Raw Linen",
          "artistId": "artist-1",
          "artistName": "سهراب فرزاد",
          "artistAlias": "سایه‌نگار",
          "style": "ABSTRACT",
          "styleLabel": "آبستره و خطاطی",
          "price": 48000000,
          "dimensions": "۱۵۰ × ۲۰۰ سانتی‌متر",
          "featured": true,
          "sold": false
        }
      ]
    }
  }
  ```

---

### ۷.۲. تعلیق یا فعال‌سازی حساب کاربر / هنرمند توسط مدیر ارشد
- **Method & Path:** `PATCH /api/v1/admin/users/:id/status`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **Request Body Schema:**
  ```json
  {
    "status": "SUSPENDED"
  }
  ```
  - مقادیر مجاز `status`: `"ACTIVE"` (`فعال`) | `"SUSPENDED"` (`معلق`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "وضعیت حساب کاربری با موفقیت به‌روزرسانی شد.",
    "data": {
      "userId": "artist-1",
      "status": "SUSPENDED"
    }
  }
  ```

---

### ۷.۳. حذف دائمی حساب کاربر یا هنرمند توسط مدیر ارشد
- **Method & Path:** `DELETE /api/v1/admin/users/:id`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "کاربر مورد نظر از پلتفرم حذف گردید.",
    "data": {
      "userId": "artist-1",
      "deleted": true
    }
  }
  ```

---

### ۷.۴. برگزیده کردن اثر در صفحه اصلی (`Feature on Landing`)
- **Method & Path:** `PATCH /api/v1/admin/artworks/:id/feature`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **Request Body Schema:**
  ```json
  {
    "featured": true
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "وضعیت نمایش برگزیده اثر در صفحه اصلی به‌روزرسانی شد.",
    "data": {
      "artworkId": "art-1",
      "featured": true
    }
  }
  ```

---

### ۷.۵. حذف اثر هنری از آرشیو گالری توسط مدیر ارشد
- **Method & Path:** `DELETE /api/v1/admin/artworks/:id`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "اثر مورد نظر از آرشیو گالری حذف گردید.",
    "data": {
      "artworkId": "art-1",
      "deleted": true
    }
  }
  ```

---

### ۷.۶. دریافت دفتر کل تمامی تراکنش‌های مالی پلتفرم توسط مدیر (`Admin Financial Audit`)
- **Method & Path:** `GET /api/v1/admin/transactions`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **پارامترهای جستجو (`Query Parameters`):**
  - `?page=1` (`number`، اختیاری)
  - `?limit=25` (`number`، اختیاری)
  - `?type=` (`"TOP_UP" | "PURCHASE" | "SALE_PAYOUT"`، اختیاری)
  - `?search=` (`string`، اختیاری)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "totalCount": 2,
      "totalVolumeToman": 210000000,
      "transactions": [
        {
          "id": "tx-1",
          "referenceCode": "تراکنش ۱۴۰۵-۹۰۱۲",
          "userId": "collector-1",
          "userName": "آریا حسینی",
          "type": "TOP_UP",
          "amount": 125000000,
          "timestamp": "۱۴۰۵/۰۸/۱۴ — ۱۸:۳۰"
        },
        {
          "id": "tx-2",
          "referenceCode": "تراکنش ۱۴۰۵-۹۰۴۵",
          "userId": "collector-2",
          "userName": "نیلوفر مجد",
          "type": "TOP_UP",
          "amount": 85000000,
          "timestamp": "۱۴۰۵/۰۸/۱۵ — ۱۱:۱۵"
        }
      ]
    }
  }
  ```

---

## ۸. کدها و ساختار سراسری خطاها (Standard Error Handling Matrix)

| کد وضعیت HTTP | کد متنی خطای سرور (`code`) | شرح و راهنمای رفع در فرانت‌اند / کلاینت |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | فیلدهای الزامی ورودی ناقص یا خارج از فرمت هستند (مشاهده فیلد `errors`). |
| `401 Unauthorized` | `AUTHENTICATION_REQUIRED` | توکن JWT ارائه نشده یا منقضی شده است؛ کاربر به مسیر `/` یا پنجره ورود هدایت شود. |
| `403 Forbidden` | `ACCESS_DENIED` | نقش کاربر برای دسترسی به این منبع مجاز نیست (مثلاً دسترسی کاربر عادی به `/admin`). |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | شناسه اثر، کاربر یا شناسنامه اصالت مورد نظر در پایگاه داده یافت نشد. |
| `409 Conflict` | `EMAIL_OR_PHONE_EXISTS` | ایمیل یا شماره موبایل واردشده پیش‌تر در سامانه ثبت شده است. |
| `402 Payment Required` | `INSUFFICIENT_WALLET_BALANCE` | موجودی کیف‌پول هنردوست کمتر از قیمت اثر است؛ پیشنهاد شارژ سریع باز شود. |
| `409 Conflict` | `ARTWORK_ALREADY_ACQUIRED` | اثر قبلاً توسط کلکسیونر دیگری خریداری شده و دیگر برای فروش آزاد نیست. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | تعداد درخواست‌های ارسالی از این IP فراتر از سقف مجاز است (محدودیت ۱۰۰ درخواست در دقیقه). |
| `500 Server Error` | `INTERNAL_SERVER_ERROR` | خطای غیرمنتظره در سرور؛ شناسه درخواست (`requestId`) به کاربر جهت پیگیری نمایش داده شود. |
