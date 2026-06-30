# 🏗️ الهيكل الجديد للمشروع (Project Architecture)

تمت إعادة هيكلة المشروع بالكامل ليصبح جاهزًا للتوسع (Scalable) وسهل الصيانة (Maintainable) وفقًا لأفضل ممارسات **Clean Architecture** في مشاريع React الحديثة.

## 📂 تنظيم المجلدات (Folder Structure)

تم تقسيم `src` إلى طبقات واضحة بحيث يعرف أي مطور مكان كل ملف مباشرة:

```text
src/
├── core/               # الأساسيات التي لا تعتمد على أي ميزة (Domain & Config)
│   ├── constants/      # الثوابت (Routes, Permissions, App Config)
│   ├── types/          # النماذج وأنواع TypeScript المتطابقة مع قاعدة البيانات
│   ├── design/         # نظام التصميم (Design Tokens & Colors)
│   ├── i18n/           # قواميس الترجمة واللغات
│   └── data/           # البيانات الوهمية (Mock Data) للاستخدام المؤقت
│
├── features/           # الميزات مقسمة بناءً على الوظيفة (Feature-based)
│   ├── auth/           # شاشات تسجيل الدخول والتحقق
│   ├── onboarding/     # شاشات الترحيب والبداية
│   ├── setup/          # إعداد النشاط التجاري والفروع
│   └── dashboard/      # لوحة التحكم الرئيسية
│
├── shared/             # المكونات المشتركة بين جميع الميزات
│   ├── components/     # الأزرار، الحقول، والشريط العلوي المشترك
│   │   ├── ui/         # مكونات الواجهة الأساسية (Radix/Shadcn)
│   │   └── figma/      # مكونات مستخرجة من التصميم
│   └── layouts/        # القوالب الأساسية (مثل AppLayout)
│
├── providers/          # مزودات الحالة (Contexts & State Management)
│   └── AppProvider/    # إدارة السمة (Theme) واللغة (Language) والإعدادات العامة
│
├── services/           # طبقة الاتصال الخارجي (API Layer)
│   └── api.ts          # أداة مركزية للاتصال بالخادم (Axios/Fetch Wrapper)
│
├── hooks/              # الـ Hooks المخصصة (Custom Hooks)
│   ├── useAuth.ts      # إدارة تسجيل الدخول والرموز (Tokens)
│   └── usePermissions.ts # التحقق من صلاحيات المستخدم (RBAC)
│
├── router/             # إعدادات التوجيه (React Router) - جاهزة للتبديل
│   └── index.tsx
│
├── App.tsx             # نقطة التجميع الرئيسية للتطبيق
└── main.tsx            # نقطة الإقلاع (Entry Point)
```

## 🛠️ أبرز التغييرات والتحسينات:

1. **النماذج (Models & Types):**
   تم إنشاء `src/core/types/index.ts` ليحتوي على جميع الجداول والعلاقات الموجودة في مجلد `DB` (مثل `Account`, `Business`, `Branch`, `User`, `Role`, `Permission`).
2. **فصل طبقة الاتصال (API Layer):**
   تم تجهيز ملف `src/services/api.ts` ليكون المسؤول الوحيد عن إرسال واستقبال البيانات من الـ Backend مع إدارة الـ Tokens والأخطاء مركزيًا.
3. **الصلاحيات (Permissions):**
   تم إنشاء `usePermissions` و `constants/permissions.ts` للتحقق من وصول المستخدم بناءً على الصلاحيات المعرفة في قاعدة البيانات.
4. **التوجيه (Routing):**
   تم إنشاء `src/router/index.tsx` باستخدام `react-router` ليكون التوجيه جاهزًا للانتقال من الـ State-based (الذي يعمل حاليًا) إلى الـ URL-based بسهولة في المستقبل.
5. **الـ Theme واللغة (i18n):**
   تم استخراج قواميس اللغة ونظام التصميم (Design Tokens) من الملفات المبعثرة ووضعها في `core/i18n` و `core/design` على التوالي، وإدارتها مركزيًا عبر `AppProvider`.

## ✅ حالة المشروع

- المشروع **يعمل بالكامل** الآن بنفس المظهر والتجربة السابقة دون أي مشاكل.
- الأساس أصبح **متينًا وجاهزًا** للبدء في بناء واجهات (المبيعات، المخزون، المالية، إلخ) وربطها مع الـ Backend بسهولة تامة.
