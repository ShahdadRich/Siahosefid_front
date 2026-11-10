# مستندات جامع API و معماری بک‌اند پلتفرم «سیاه و سفید» (Siah o Sefid — Fine Art Exhibition & Marketplace)

این سند حاصل ممیزی خط‌به‌خط (Line-by-Line Audit) کدبیس فرانت‌اند پلتفرم **«سیاه و سفید»** است و تمامی مسیرهای کلاینت (SPA URL Routes)، مدل‌های داده، و نقاط پایانی (REST API Endpoints) مورد نیاز برای پیاده‌سازی بک‌اند در **VS Code** را با جزئیات کامل فارسی و ساختار دقیق JSON تشریح می‌کند.

- **Base URL (محیط توسعه محلی در VS Code):** `http://localhost:4000/api/v1` (قابل تنظیم از طریق متغیر محیطی `VITE_API_BASE_URL` در فایل `.env`)
- **Base URL (محیط عملیاتی):** `https://api.siahosefid.art/api/v1`
- **لایه سرویس فرانت‌اند:** تمامی تایپ‌ها، مبدل‌ها (Payload Mappers) و توابع ارتباط با بک‌اند در فایل **`src/services/api.ts`** پیاده‌سازی و آماده اتصال هستند.
- **Content-Type:** `application/json; charset=utf-8` (و `multipart/form-data` برای بارگذاری مستقیم تصویر اثر هنری)
- **Authentication:** توکن `Bearer JWT` در هدر `Authorization: Bearer <access_token>` برای تمامی مسیرهای محافظت‌شده.

---

## ۰. معماری مسیرهای کلاینت (Browser URL Pathname Routing)

مسیریابی پلتفرم مبتنی بر `window.location.pathname` و History API (`pushState` / `popstate`) طراحی شده است و هیچ دکمه شناور یا میانبر مخفی برای ورود به پنل مدیریت در رابط کاربری وجود ندارد:

| مسیر مرورگر (Pathname) | نمای فعال در برنامه (`AppView`) | سطح دسترسی و توضیح |
| :--- | :--- | :--- |
| `/` | `landing` | صفحه اصلی روایت‌محور (Scrollytelling)، بیانیه مانیفست، مقالات تحلیلی، درگاه عضویت دوگانه و ۳ شمارنده زنده پایین صفحه |
| `/gallery` | `gallery` | گالری آثار و بازارگاه «سیاه و سفید» (نمای اسلایدر تمام‌صفحه و نمای موزه‌ای، فیلترهای پیشرفته و خرید آنی با کیف‌پول) |
| `/studio` | `artist-panel` | پنل اختصاصی هنرمند (۴ شاخص استودیو، بارگذاری تصویر و ثبت اثر جدید، ویرایش آنی قیمت/داستان و حذف اثر + دکمه `خروج از حساب`) |
| `/collector` | `collector-panel` | پنل هنردوست و مدیریت کیف‌پول (موجودی اعتبار، شارژ آنی با بسته‌های پیشنهادی یا مبلغ دلخواه، ویرایش پروفایل، گنجینه آثار خریداری‌شده و تاریخچه تراکنش‌ها + دکمه `خروج از حساب`) |
| **`/admin`** | `admin-panel` | **کنسول مدیریت ارشد «سیاه و سفید»** — **صرفاً از طریق تایپ مستقیم مسیر `/admin` در نوار آدرس مرورگر قابل دسترسی است.** |

---

## ۱. احراز هویت، ثبت‌نام نقش‌محور و مدیریت نشست (`/api/v1/auth/*`)

### ۱.۱. ثبت‌نام هنرمند («هنرمندم»)
ایجاد حساب کاربری هنرمند، راه‌اندازی استودیوی شخصی و هدایت خودکار به مسیر `/studio`.

- **Method & Path:** `POST /api/v1/auth/register/artist`
- **Authentication:** عمومی (Public)
- **فیلدهای ارسالی (`Request Body`):**
  - `fullName` (`string`، الزامی): نام و نام خانوادگی هنرمند (حداقل ۳ کاراکتر)
  - `artisticName` (`string`، الزامی): نام هنری یا امضای حرفه‌ای هنرمند
  - `artisticStyle` (`string`، الزامی): کد یا عنوان سبک هنری انتخاب‌شده از میان ۶ کاشی سبک:
    - `"MINIMALISM"` (`مینیمالیسم`)
    - `"ABSTRACT"` (`آبستره و خطاطی`)
    - `"SCULPTURE"` (`مجسمه‌سازی`)
    - `"PHOTOGRAPHY"` (`عکاسی هنری`)
    - `"DIGITAL"` (`دیجیتال آرت`)
    - `"OTHER"` (`غیره`)
  - `customStyle` (`string`، شرطی): عنوان سبک هنری دلخواه در صورتی که کاربر گزینه **`غیره` (`OTHER`)** را انتخاب کرده باشد (در این حالت حداقل ۲ کاراکتر الزامی است)
  - `phone` (`string`، الزامی): شماره تماس همراه (فرمت استاندارد `09xxxxxxxxx`)
  - `email` (`string`، الزامی): نشانی ایمیل معتبر
- **Request Body Schema (نمونه با انتخاب گزینه «غیره»):**
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (`400 Bad Request` / `409 Conflict`):**
  ```json
  {
    "status": "error",
    "code": "VALIDATION_ERROR",
    "message": "اطلاعات ورودی نامعتبر است.",
    "errors": {
      "artisticName": "لطفاً نام هنری یا امضای حرفه‌ای خود را وارد کنید.",
      "customStyle": "لطفاً نام سبک هنری خود را وارد کنید.",
      "email": "این ایمیل قبلاً در سیستم ثبت شده است."
    }
  }
  ```

---

### ۱.۲. ثبت‌نام هنردوست / کلکسیونر («هنردوستم»)
ایجاد حساب کاربری هنردوست به همراه شارژ اولیه کیف‌پول در لحظه ثبت‌نام و هدایت به `/gallery`.

- **Method & Path:** `POST /api/v1/auth/register/collector`
- **Authentication:** عمومی (Public)
- **فیلدهای ارسالی (`Request Body`):**
  - `fullName` (`string`، الزامی): نام و نام خانوادگی هنردوست
  - `email` (`string`، الزامی): نشانی ایمیل
  - `phone` (`string`، الزامی): شماره تماس همراه (`09xxxxxxxxx`)
  - `initialWalletTopUp` (`number`، اختیاری — پیش‌فرض `50000000`): مبلغ شارژ اولیه کیف‌پول در لحظه ثبت‌نام به تومان. مقادیر کاشی‌های پیشنهادی در فرم:
    - `0` (بدون شارژ اولیه)
    - `25000000` (۲۵ میلیون تومان)
    - `50000000` (۵۰ میلیون تومان)
    - `100000000` (۱۰۰ میلیون تومان)
    - `200000000` (۲۰۰ میلیون تومان)
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### ۱.۳. دریافت وضعیت نشست فعلی کاربر (`Session Persistence`)
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

### ۱.۴. خروج از حساب کاربری (`خروج از حساب`)
پشتیبانی از دکمه `خروج از حساب` در نوار بالای پنل هنرمند (`/studio`) و پنل هنردوست (`/collector`)، ابطال توکن نشست و بازگشت به صفحه اصلی (`/`).

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

## ۲. پنل اختصاصی هنرمند و مدیریت آثار (`/api/v1/studio/*` و `/api/v1/artworks/*`)

### ۲.۱. دریافت اطلاعات کامل استودیوی هنرمند و ۴ شاخص بالای صفحه
تامین‌کننده داده‌های مسیر `/studio` شامل ۴ بلوک آماری بالای استودیو (`شناسنامه هنرمند`، `آثار ثبت‌شده`، `آثار فروخته‌شده`، `مجموع عواید فروش`) و فهرست آثار ثبت‌شده توسط هنرمند.

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

### ۲.۲. بارگذاری مستقیم تصویر اثر هنری از دستگاه (`Upload Artwork Image`)
پشتیبانی از دکمه `بارگذاری تصویر از دستگاه +` در فرم ثبت اثر استودیوی هنرمند.

- **Method & Path:** `POST /api/v1/artworks/upload-image`
- **Authentication:** نیازمند توکن هنرمند (`Role: ARTIST`)
- **Content-Type:** `multipart/form-data`
- **Form Data Field:** `image` (فایل تصویر با فرمت `image/jpeg`, `image/png`, یا `image/webp`)
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "تصویر اثر با کیفیت آرشیوی بارگذاری شد.",
    "data": {
      "imageUrl": "https://cdn.siahosefid.art/uploads/artworks/1793999050-ash-constellation.jpg",
      "fileName": "ash-constellation.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 1843200
    }
  }
  ```

---

### ۲.۳. ثبت و قیمت‌گذاری اثر هنری جدید توسط هنرمند
مطابق با فیلدهای دقیق فرم «ثبت و قیمت‌گذاری اثر هنری جدید» در `/studio`.

- **Method & Path:** `POST /api/v1/artworks`
- **Authentication:** نیازمند توکن هنرمند (`Role: ARTIST`)
- **فیلدهای ارسالی (`Request Body`):**
  - `title` (`string`، الزامی): عنوان اثر هنری (حداقل ۲ کاراکتر)
  - `titleEn` (`string`، اختیاری): عنوان انگلیسی اثر برای آرشیو بین‌المللی
  - `style` (`ArtStyle`، الزامی): `"MINIMALISM" | "ABSTRACT" | "SCULPTURE" | "PHOTOGRAPHY" | "DIGITAL" | "OTHER"`
  - `customStyle` (`string`، شرطی): عنوان سبک دلخواه در صورتی که `style === "OTHER"` («غیره») انتخاب شده باشد
  - `price` (`number`، الزامی): قیمت اثر به تومان (حداقل `100000` تومان)
  - `dimensions` (`string`، الزامی): ابعاد اثر (مثال: `"120 × 160 cm"`)
  - `technique` (`string`، الزامی): تکنیک و متریال اجرا (مثال: `"مرکب و زغال فشرده روی بوم کتان"`)
  - `story` (`string`، الزامی): داستان، کانسپت و توضیحات اثر (حداقل ۱۰ کاراکتر)
  - `imageUrl` (`string`، الزامی): آدرس تصویر بارگذاری‌شده یا تصویر انتخاب‌شده از آرشیو استودیو
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

### ۲.۴. ویرایش آنی مشخصات، قیمت و داستان اثر توسط هنرمند (`Inline Edit`)
پشتیبانی از فرم ویرایش سریع (`ویرایش اثر و قیمت`) روی هر کارت اثر در استودیوی هنرمند.

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

### ۲.۵. حذف اثر هنری از نمایشگاه توسط هنرمند
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

## ۳. گالری آثار و فرآیند خرید آنی (`/api/v1/artworks` و `/api/v1/artworks/:id/purchase`)

### ۳.۱. دریافت فهرست آثار نمایشگاه همراه با فیلترهای نوار گالری
تامین‌کننده آثار در هر دو حالت **«نمای اسلایدر» (`carousel`)** و **«نمای موزه‌ای» (`museum`)** در مسیر `/gallery`.

- **Method & Path:** `GET /api/v1/artworks`
- **Authentication:** عمومی (Public)
- **پارامترهای جستجو و فیلتر (`Query Parameters`):**
  - `?search=` (`string`، اختیاری): جستجوی متنی در عنوان فارسی/انگلیسی اثر، نام هنرمند، نام هنری یا کد آرشیو (`آرشیو ۱۴۰۵-۰۱`)
  - `?style=` (`string`، اختیاری): فیلتر بر اساس سبک هنری (`MINIMALISM`، `ABSTRACT`، `SCULPTURE`، `PHOTOGRAPHY`، `DIGITAL`، یا `OTHER` / `غیره`)
  - `?priceRange=` (`string`، اختیاری): فیلتر بازه قیمتی:
    - `under-45m` (زیر ۴۵ میلیون تومان)
    - `45m-70m` (۴۵ تا ۷۰ میلیون تومان)
    - `above-70m` (بالای ۷۰ میلیون تومان)
  - `?artistId=` (`string`، اختیاری): فیلتر آثار یک هنرمند مشخص (مثال: `artist-1`)
  - `?featured=true` (`boolean`، اختیاری): دریافت صرفاً آثار برگزیده برای نمایش در صفحه اصلی
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

### ۳.۲. خرید قطعی و آنی اثر هنری با موجودی کیف‌پول (`Atomic Wallet Purchase`)
تراکنش اتمیک (Atomic Transaction) که به صورت هم‌زمان:
1. کافی بودن موجودی کیف‌پول هنردوست را بررسی می‌کند.
2. مبلغ اثر را از کیف‌پول خریدار کسر می‌کند.
3. وضعیت اثر را به فروخته‌شده (`sold: true`, `isSold: true`) تغییر داده و مالکیت (`buyerId`, `ownerId`) را به خریدار منتقل می‌کند.
4. مبلغ فروش را به موجودی و مجموع عواید فروش هنرمند خالق اثر (`totalSalesRevenue`, `totalSalesCount`) اضافه می‌کند.
5. رکورد تراکنش خرید (`PURCHASE`) و **شناسنامه اصالت اثر (`certificateOfAuthenticity`)** را صادر و بازمی‌گرداند.

- **Method & Path:** `POST /api/v1/artworks/:id/purchase`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
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

## ۴. پنل هنردوست و مدیریت کیف‌پول (`/api/v1/collector/*`)

### ۴.۱. دریافت اطلاعات کیف‌پول، گنجینه آثار خریداری‌شده و تاریخچه تراکنش‌ها
تامین‌کننده داده‌های مسیر `/collector` شامل موجودی لحظه‌ای (`balance`)، بخش **«گنجینه آثار خریداری‌شده» (`purchasedArtworks`)** و **«تاریخچه تراکنش‌های کیف‌پول» (`transactions`)**.

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

### ۴.۲. ویرایش مشخصات فردی هنردوست
مطابق با فرم «مشخصات فردی هنردوست» در مسیر `/collector`.

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

### ۴.۳. افزایش اعتبار و شارژ آنی کیف‌پول (`Wallet Top-Up`)
پشتیبانی از ۴ کاشی بسته پیشنهادی (`25000000`، `50000000`، `100000000`، `250000000` تومان) و همچنین فیلد **«مبلغ دلخواه (تومان)» (`customAmount`)** در مسیر `/collector`.

- **Method & Path:** `POST /api/v1/collector/wallet/topup`
- **Authentication:** نیازمند توکن هنردوست (`Role: COLLECTOR`)
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

## ۵. آمار زنده صفحه اصلی و کنسول مدیریت ارشد (`/api/v1/public/stats` و `/api/v1/admin/*`)

### ۵.۱. دریافت آمار زنده فوتر صفحه اصلی (`Landing Page Live Counters`)
تامین‌کننده ۳ شمارنده زنده در بخش پایانی صفحه اصلی (`/`): `تعداد اعضای سایت`، `تعداد هنرمندان`، و `تعداد آثار ثبت‌شده`.

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

### ۵.۲. دریافت داده‌های کامل کنسول مدیریت ارشد (`/admin`)
تامین‌کننده ۴ شاخص کلان بالای صفحه `/admin` (`کل اعضای پلتفرم`، `هنرمندان فعال`، `آثار ثبت‌شده در آرشیو`، `نقدینگی و حجم معاملات`) به همراه فهرست قابل جستجوی هر دو تب (**«مدیریت اعضا و هنرمندان»** و **«مدیریت آثار گالری»**).

- **Method & Path:** `GET /api/v1/admin/overview`
- **Authentication:** نیازمند توکن مدیر ارشد (`Role: ADMIN`)
- **پارامترهای جستجو (`Query Parameters`):**
  - `?search=` (`string`، اختیاری): عبارت جستجو در نام کاربر/هنرمند، ایمیل، تلفن، عنوان اثر یا کد آرشیو
  - `?role=` (`"ALL" | "ARTIST" | "COLLECTOR"`، اختیاری): فیلتر نقش در تب اعضا و هنرمندان
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

### ۵.۳. تعلیق یا فعال‌سازی حساب کاربر / هنرمند در کنسول مدیریت
پشتیبانی از دکمه `تعلیق` / `فعال‌سازی` در ردیف‌های تب «مدیریت اعضا و هنرمندان» در مسیر `/admin`.

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

### ۵.۴. حذف کامل کاربر یا هنرمند توسط مدیر ارشد
پشتیبانی از دکمه `حذف` در ردیف‌های تب «مدیریت اعضا و هنرمندان» در مسیر `/admin`.

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

### ۵.۵. برگزیده کردن اثر در صفحه اصلی (`برگزیده در لندینگ`)
پشتیبانی از دکمه `برگزیده در لندینگ` / `برگزیده در لندینگ ✓` در ردیف‌های تب «مدیریت آثار گالری» در مسیر `/admin`.

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

### ۵.۶. حذف اثر هنری از آرشیو گالری توسط مدیر ارشد
پشتیبانی از دکمه `حذف` در ردیف‌های تب «مدیریت آثار گالری» در مسیر `/admin`.

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
