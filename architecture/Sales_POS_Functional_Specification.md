# المواصفات الوظيفية المؤسسية لوحدة المبيعات (Sales & POS Functional Specification)
**النطاق:** Smart Merchant ERP
**الوحدة:** Sales & POS Module حصرياً.
**الهدف:** توثيق جميع المتطلبات، العمليات، القيود، والمستندات الخاصة بالمبيعات ونقاط البيع كدليل شامل ومغلق للوحدة.

---

## 1. أهداف الوحدة (Module Objectives)
تمكين الشركة من تنفيذ دورة المبيعات بالكامل (B2B و B2C) بسرعة فائقة، سواء عبر نقاط البيع المباشرة (POS) أو مبيعات التجزئة/الجملة (Back-office)، مع ضمان الامتثال الضريبي (ZATCA) والمحاسبي اللحظي في بيئة متصلة أو منفصلة (Offline).

## 2. النطاق (Scope)
يبدأ النطاق من تسعير المنتج وإصدار عروض الأسعار للعميل المحتمل، ويمر بالطلب والتسليم والفوترة، وينتهي إما بالسداد أو الإرجاع. (التحصيل اللاحق يقع في نطاق المالية، ولكن المبيعات توفر استعراضاً للأرصدة).

## 3. المسؤوليات (Responsibilities)
إصدار وثائق المبيعات المعتمدة، تطبيق الخصومات والتسعير، احتساب ضرائب المبيعات المبدئية، قفل ورديات الكاشير، وبث أحداث (Events) للإدارات الأخرى (كالمخزون والمحاسبة).

## 4. الميزات الرئيسية (Features)
واجهة POS تدعم اللمس السريع (Touch-friendly)، دعم مسدسات الباركود والموازين، الفوترة الآجلة، قوائم أسعار ديناميكية، وإدارة جلسات البيع المتزامنة (Suspend/Resume).

## 5. أدوار المستخدمين (User Roles)
*   `Cashier`: استخدام واجهة POS السريعة فقط.
*   `Sales Rep`: استخدام واجهة المبيعات المعقدة (عروض أسعار، فواتير آجلة).
*   `Sales Manager`: الاعتمادات، إدارة قوائم الأسعار، وتقارير المبيعات.

## 6. الصلاحيات (Permissions)
يُمنع الكاشير من تغيير أسعار المنتجات يدوياً إلا بصلاحية. يُمنع حذف أي فاتورة. البيع بأقل من التكلفة يتطلب صلاحية مخصصة (`allow_sell_below_cost`).

## 7. العمليات التجارية (Business Processes) & 8. سير العمل (Workflow)
1. **دورة B2C (نقاط البيع):** مسح الباركود ➔ استلام النقد ➔ اعتماد الفاتورة وطباعة الإيصال ➔ ترحيل لحظي.
2. **دورة B2B (مبيعات الشركات):** إصدار عرض سعر ➔ تحويله إلى أمر بيع ➔ إصدار إذن تسليم ➔ إصدار فاتورة مبيعات آجلة ➔ ترحيل.

---

## أنواع مستندات المبيعات (Sales Document Types) (9-19)

### 11. عرض السعر (Quotation)
*   **الهدف:** التزام سعري مؤقت للعميل. لا يؤثر على المخزون أو الحسابات. له تاريخ صلاحية (`Expiry Date`).
### 12. أمر البيع (Sales Order)
*   **الهدف:** تأكيد رغبة العميل بالشراء. يحجز المخزون (Reserved Stock) ولا ينشئ قيداً مالياً.
### 13. إذن التسليم (Delivery Note)
*   **الهدف:** وثيقة لشركات الشحن أو المستودع لتسليم البضاعة. يخصم المخزون فيزيائياً دون أثر مالي إيرادي.
### 14. فاتورة المبيعات (Sales Invoice)
*   **الهدف:** وثيقة الاستحقاق المالي والضريبي النهائية. (أنواعها: نقدية، شبكة، آجلة).
### 15. فاتورة المرتجع (Sales Return)
*   **الهدف:** إعادة البضاعة للشركة. تتطلب ربطاً برقم الفاتورة الأصلية (لضمان إعادة نفس الضريبة والتكلفة).
### 16. الإشعار الدائن (Credit Note)
*   **الهدف:** تخفيض مديونية العميل (مثال: خصم مسموح به بعد البيع) دون إرجاع بضاعة.
### 17. الإشعار المدين (Debit Note)
*   **الهدف:** تحميل العميل مبالغ إضافية (مثال: أخطاء تسعير سابقة).
### 18. دفعة العميل المقدمة (Customer Advance)
*   **الهدف:** استلام عربون قبل إصدار الفاتورة النهائية. يُرحل لحساب (دفعات مقدمة من عملاء).
### 19. حجز بضاعة (Customer Reservation)
*   **الهدف:** حجز كمية للعميل دون دفع أو بدفع جزئي.

---

## استراتيجيات التسعير والترويج (Pricing & Promotions) (20-25)

### 20. الخصومات (Discounts)
خصم على مستوى السطر (Line Discount)، أو خصم إجمالي (Invoice Discount). قد يكون نسبة (%) أو مبلغاً (Amount).
### 21. العروض الترويجية (Promotions)
عروض تلقائية (اشتري 2 واحصل على 1 مجاناً)، أو (خصم 20% على قسم الألبان يوم الخميس). تُحسب عبر `Promotion Engine`.
### 22. الكوبونات (Coupons)
أكواد نصية يدخلها الكاشير لتطبيق خصم مقطوع. تستخدم لمرة واحدة أو عدد محدد.
### 23. بطاقات الهدايا (Gift Cards)
بيع رصيد إلكتروني يُستعمل لاحقاً كوسيلة دفع (Payment Method) في الـ POS.
### 24. نقاط الولاء (Loyalty Points)
اكتساب نقاط بناءً على قيمة الفاتورة، وتحويلها لخصم في الفواتير اللاحقة.
### 25. قوائم الأسعار (Price Lists)
قائمة تسعير للجملة، قائمة للتجزئة، وقائمة مخصصة لكبار العملاء (VIP). ترتبط بالعميل تلقائياً وتلغي السعر الافتراضي.

---

## المتطلبات التشغيلية والهندسية (26-40)

### 26. تعدد العملات (Multi Currency)
الفاتورة تُصدر بعملة العميل (مثال: USD)، والنظام يُسجل الأثر المالي بعملة الشركة الأساسية (SAR) استناداً لسعر الصرف اليومي.
### 27. المعالجة الضريبية (Tax Handling)
حساب الـ VAT لكل سطر بناءً على إعداد الصنف (15%، صفري، معفى). توفير معلومات QR الضريبية حسب متطلبات ZATCA.
### 28. السلوك في وضع الأوفلاين (Offline Behavior)
في نقطة البيع (POS): يعمل الكاشير بشكل طبيعي (بحث سريع، إضافة سلة، دفع، طباعة) دون إنترنت. تُحفظ الفواتير في الـ LocalDB كـ `PendingSync`.
### 29. المزامنة (Synchronization)
عند عودة الاتصال، تُرسل حزم הפواتير (Payloads) عبر طابور المزامنة للسيرفر (Client-Wins للمبيعات).
### 30. الأحداث المُطلقة (Events)
*   `SalesInvoicePosted`, `SalesReturnPosted`, `QuotationExpired`, `ShiftClosed`.
### 31. التقارير (Reports)
تقرير مبيعات الكاشير، تقرير أرباح المبيعات (حسب الصنف/الفرع)، تقرير الإرجاعات، وتقرير الضرائب المجمعة.
### 32. مؤشرات الأداء (Dashboard KPIs)
إجمالي مبيعات اليوم، متوسط قيمة الفاتورة (Average Basket Value)، الصنف الأعلى مبيعاً، ونسبة المرتجعات.
### 33. الإشعارات (Notifications)
تنبيه مدير الفرع عند إجراء مرتجع يتجاوز 1000 ريال. تنبيه البائع بقرب انتهاء عرض سعر (Quotation).
### 34. مسار الموافقات (Approval Workflow)
البيع بأقل من هامش الربح الأدنى يتطلب موافقة الإدارة (Manager Override) قبل استكمال الفاتورة.
### 35. سيناريوهات الاستثناء (Exception Scenarios)
نفاد ورق الطابعة: تُحفظ الفاتورة ويمكن إعادة طباعتها من السجل. انقطاع الكهرباء: المتصفح يحتفظ بالسلة النشطة (Draft) في الـ Local Storage وتسترد عند إعادة التشغيل.
### 36. منع الاحتيال (Fraud Prevention)
الدرج النقدي (Cash Drawer) لا يفتح إلا عند ترحيل فاتورة فعلية. يمنع تعديل وقت الفاتورة للتهرب الضريبي. كافة الحذوفات للمسودات تُسجل في Audit Log.
### 37. القواعد الأمنية (Security Rules)
طباعة نسخة ثانية من إيصال المبيعات يجب أن تُدمغ بعلامة مائية "نسخة مكررة - Copy" لمنع تكرار طلب استرداد النقد.
### 38. قواعد التحقق (Validation Rules)
لا يمكن ترحيل الفاتورة إذا كان: (المبلغ المدفوع + الآجل) لا يساوي إجمالي الفاتورة. لا يمكن إضافة صنف موقوف.
### 39. متطلبات الأداء (Performance Requirements)
واجهة الـ POS يجب أن تستجيب لإضافة المنتج للسلة في أقل من 50 مللي ثانية (محلياً). عملية الترحيل والطباعة يجب ألا تتجاوز 2 ثانية كحد أقصى.
### 40. التوسعات المستقبلية (Future Extensions)
دعم بوابات التقسيط (مثل تابي وتمارا) كطرق دفع مدمجة. تكامل مباشر مع مكائن مدى (Payment Terminals) لدفع المبالغ دون إدخال يدوي.


---

## العمليات التشغيلية المتقدمة (Advanced Sales Operations) (41-52)

### 41. دورة حياة وردية نقاط البيع (POS Shift Lifecycle)

**Purpose (الهدف):**
ضبط العهدة النقدية والمسؤولية المالية لكل كاشير طوال فترة عمله، وضمان المطابقة بين النقد الفعلي والنقد الدفتري مع توفير مسار تدقيق كامل لجميع العمليات النقدية.

**Scope (النطاق):**
تشمل دورة الوردية جميع العمليات منذ فتح الوردية وحتى الإغلاق النهائي والمطابقة اليومية.

**Workflow (سير العمل):**
1. **Open Shift**
   - فتح الوردية بواسطة الكاشير.
   - إدخال رصيد الصندوق الافتتاحي (Opening Cash Float).

2. **Cash In / Cash Out**
   - إضافة أو سحب نقد لأغراض إدارية.
   - تسجيل السبب الإجباري لكل حركة.
   - ربط الحركة بالمستخدم والوقت.

3. **Suspend Shift**
   - تعليق الوردية مؤقتاً.
   - إيقاف جميع عمليات البيع.
   - قفل درج النقد.

4. **Resume Shift**
   - استئناف الوردية المعلقة.
   - استعادة جميع البيانات السابقة.

5. **Shift Transfer**
   - نقل عهدة الصندوق إلى كاشير آخر.
   - يتطلب موافقة مدير الفرع.
   - توثيق عملية النقل بالكامل.

6. **Shift Closing**
   - إنهاء عمليات البيع.
   - إدخال النقد الفعلي.
   - بدء المطابقة.

7. **Cash Reconciliation**
   - مقارنة النقد الفعلي بالنقد الدفتري.
   - احتساب الفروقات تلقائياً.

8. **Cash Difference**
   - تسجيل العجز أو الزيادة.
   - إنشاء سجل تدقيق.
   - إشعار الإدارة عند تجاوز الحدود.

9. **End Of Day Closing**
   - إغلاق جميع الورديات المفتوحة.
   - منع بقاء ورديات غير مغلقة.
   - إصدار تقرير الإغلاق اليومي.

**Business Rules (قواعد العمل):**
- لا يمكن تنفيذ أي عملية بيع قبل فتح وردية.
- لا يسمح بأكثر من وردية نشطة للكاشير نفسه.
- لا يمكن فتح وردية جديدة إذا كانت هناك وردية غير مغلقة.
- لا يجوز تعديل بيانات وردية مغلقة.
- النقد الدفتري لا يظهر للكاشير قبل إدخال النقد الفعلي (Blind Close).

**Validation Rules (قواعد التحقق):**
- Opening Cash Float ≥ 0
- Actual Cash ≥ 0
- يجب تسجيل سبب لكل Cash Out.
- لا يسمح بإغلاق وردية تحتوي على معاملات Pending.

**Permissions (الصلاحيات):**
- Open Shift
- Suspend Shift
- Resume Shift
- Close Shift
- Shift Transfer
- Manager Override
- Cash Difference Approval

**Events**
- ShiftOpened
- ShiftSuspended
- ShiftResumed
- ShiftTransferred
- ShiftClosed
- CashDifferenceDetected
- EndOfDayClosed

**Offline Behaviour**
- جميع عمليات الوردية تعمل محلياً.
- تحفظ داخل Local Database.
- تنتظر المزامنة عند عودة الاتصال.

**Synchronization**
- ترسل بيانات الوردية كاملة عند توفر الإنترنت.
- يمنع حذف النسخة المحلية حتى نجاح المزامنة.

**Exception Scenarios**
- انقطاع الكهرباء أثناء الإغلاق.
- تعطل المتصفح.
- فقدان الاتصال.
- فشل الطباعة.
- جميعها تستأنف من آخر حالة محفوظة.

---

### 42. إطار عمل طرق الدفع (Payment Methods Framework)

**Purpose (الهدف):**
توفير نظام دفع مرن يدعم جميع وسائل الدفع الحالية والمستقبلية مع المحافظة على التكامل المحاسبي.

**Supported Payment Methods**
- Cash
- Card
- Bank Transfer
- Mobile Wallet
- Gift Card
- Loyalty Points
- Customer Advance
- Store Credit

**Workflow**
1. إنشاء الفاتورة.
2. اختيار وسيلة الدفع.
3. السماح باستخدام أكثر من وسيلة.
4. تنفيذ الدفع.
5. اعتماد الفاتورة.
6. طباعة الإيصال.

**Split Payment**
يسمح باستخدام عدة وسائل دفع داخل نفس الفاتورة.

مثال:
- Cash 100
- Card 200
- Gift Card 50

**Partial Payment**
يسمح بتحصيل جزء من قيمة الفاتورة وترحيل الباقي كذمة مدينة حسب صلاحيات المستخدم.

**Business Rules**
- مجموع الدفعات يجب أن يساوي إجمالي الفاتورة النقدية.
- Store Credit لا يجوز أن يتجاوز الرصيد.
- Customer Advance يستهلك قبل النقد.
- نقاط الولاء تخضع لسياسة الشركة.
- يمكن إضافة طرق دفع جديدة دون تعديل النظام.

**Validation Rules**
- Sum(Payments)=Invoice Total
- Card Amount > 0
- Cash Amount ≥ 0
- Gift Card Valid
- Loyalty Balance Available

**Permissions**
- Credit Sale
- Split Payment
- Refund
- Manual Approval

**Events**
- PaymentRecorded
- PaymentCaptured
- PaymentFailed
- RefundProcessed

**Offline Behaviour**
- الدفع النقدي يعمل بالكامل.
- البطاقات المتكاملة تحتاج اتصالاً.
- يمكن تسجيل الدفع الخارجي يدوياً.

**Synchronization**
- ترسل جميع الدفعات كمصفوفة Payments داخل Payload الفاتورة.

**Failure Scenarios**
- رفض البطاقة.
- انتهاء مهلة الاتصال.
- انقطاع الإنترنت.
- فشل جهاز الدفع.
- تعود الفاتورة لحالة انتظار الدفع.

---

### 43. سياسة مرتجعات المبيعات (Sales Return Policy)

**Purpose (الهدف):**
تنظيم عمليات الإرجاع والاستبدال والاسترداد المالي مع تقليل مخاطر الاحتيال والمحافظة على التوافق الضريبي.

**Workflow**
1. اختيار الفاتورة الأصلية.
2. اختيار السطور.
3. تحديد الكميات.
4. احتساب الرسوم.
5. اختيار طريقة الاسترداد.
6. اعتماد المرتجع.

**Supported Operations**
- Full Return
- Partial Return
- Exchange
- Refund
- Refund To Original Payment Method

**Business Rules**
- يجب ربط المرتجع بالفاتورة الأصلية.
- يمنع إرجاع كمية أكبر من المباعة.
- الاستبدال يتم داخل معاملة واحدة.
- الاسترداد البنكي يعود لنفس البطاقة.
- لا يسمح بإرجاع فاتورة تجاوزت فترة الإرجاع.
- المنتجات المفتوحة قد تخضع لرسوم إعادة تخزين.

**Return Without Receipt**
- يعتمد أقل سعر بيع خلال آخر 30 يوماً.
- يمنح العميل Store Credit فقط.
- يمنع الاسترداد النقدي.

**Approval Rules**
- المرتجعات الكبيرة تتطلب Manager PIN.
- تجاوز فترة الإرجاع يحتاج صلاحية خاصة.

**Fraud Prevention**
- ختم الفاتورة المرتجعة بحالة Returned.
- منع تكرار المرتجع.
- تسجيل جميع عمليات الإرجاع داخل Audit Log.

**Validation Rules**
- Returned Qty ≤ Sold Qty
- Return Period Valid
- Invoice Posted
- Product Eligible

**Events**
- SalesReturnCreated
- SalesReturnPosted
- RefundProcessed
- ExchangeCompleted

**Offline Behaviour**
- يسمح بإنشاء المرتجع محلياً.
- يحفظ Pending Sync.
- تتم المزامنة لاحقاً.

**Synchronization**
- يرسل المرتجع مع مرجع الفاتورة الأصلية.
- يتم الحفاظ على نفس UUID ونفس علاقات التتبع.

**Exception Scenarios**
- لا يوجد نقد كافٍ للاسترداد.
- الفاتورة غير موجودة.
- الفاتورة ملغاة.
- انتهاء فترة الإرجاع.
- رفض البطاقة أثناء Refund.
---

### 44. سياسة حجز البضائع (Reservation Policy)

**Purpose (الهدف):**
توفير آلية رسمية لحجز المخزون للعملاء قبل إصدار فاتورة المبيعات النهائية، بما يضمن عدم بيع نفس الكمية لأكثر من عميل، مع المحافظة على دقة المخزون وإدارة الحجوزات المؤقتة والدائمة.

**Scope (النطاق):**
تشمل جميع عمليات الحجز في مبيعات التجزئة والجملة والتجارة الإلكترونية، سواء كانت مرتبطة بطلبات بيع، عروض أسعار، أو حجوزات مستقلة.

**Workflow (سير العمل):**

1. إنشاء طلب الحجز.
2. التحقق من توفر الكمية.
3. خصم الكمية من Available Stock.
4. تحويلها إلى Reserved Stock.
5. انتظار الدفع أو اعتماد الطلب.
6. تحويل الحجز إلى فاتورة مبيعات.
7. أو تحرير الحجز عند انتهاء المهلة.

**Reservation Types**

- Customer Reservation
- Sales Order Reservation
- E-Commerce Reservation
- Partial Reservation
- VIP Reservation

**Business Rules**

- لا يمكن حجز كمية أكبر من الرصيد المتاح.
- الكمية المحجوزة لا تظهر ضمن الكمية المتاحة للبيع.
- يمكن تمديد الحجز بواسطة المدير فقط.
- حجوزات عملاء VIP لا تُلغى تلقائياً.
- انتهاء صلاحية الحجز يؤدي إلى تحرير الكمية تلقائياً.
- يمكن تحويل الحجز مباشرة إلى Sales Invoice أو Sales Order.

**Reservation Status**

- Draft
- Reserved
- Partially Reserved
- Expired
- Released
- Converted
- Cancelled

**Validation Rules**

- Reserved Qty ≤ Available Qty
- Expiration Date Required
- Customer Required
- Warehouse Required
- Product Active

**Permissions**

- Create Reservation
- Modify Reservation
- Extend Reservation
- Cancel Reservation
- Convert Reservation
- Override Reservation Expiry

**Events**

- ReservationCreated
- StockReserved
- ReservationExtended
- ReservationReleased
- ReservationExpired
- ReservationConverted

**Security Rules**

- لا يسمح بتعديل الحجز بعد تحويله إلى فاتورة.
- جميع التعديلات تحفظ داخل Audit Log.
- يمنع تغيير العميل بعد اعتماد الحجز.

**Fraud Prevention**

- يمنع إنشاء أكثر من حجز لنفس العميل يتجاوز الحدود المسموحة.
- يمنع الحجز الوهمي لتعطيل المخزون.
- يمكن للنظام إلغاء الحجوزات غير النشطة تلقائياً.

**Offline Behaviour**

- يسمح بإنشاء الحجز محلياً.
- يتم خصم الكمية من المخزون المحلي.
- تحفظ العملية داخل Sync Queue.

**Synchronization**

- إرسال Reservation Payload.
- تحديث الرصيد المركزي.
- معالجة التعارضات وفق سياسة Client-Wins أو Server-Wins حسب نوع العملية.

**Exception Scenarios**

- نفاد المخزون أثناء المزامنة.
- انتهاء صلاحية الحجز.
- حذف العميل.
- إيقاف المنتج.
- إلغاء الفرع.
- فشل المزامنة.

---

### 45. محرك التسعير المؤسسي (Enterprise Pricing Engine)

**Purpose (الهدف):**
إدارة جميع قواعد التسعير والخصومات والعروض الترويجية داخل محرك موحد يمنع تعارض الأسعار ويضمن احتساب السعر النهائي بصورة شفافة وقابلة للتدقيق.

**Scope (النطاق):**

يشمل:

- Price Lists
- Customer Pricing
- Promotions
- Coupons
- Loyalty Discounts
- Manual Discounts
- Taxes

**Pricing Resolution Engine**

يتم احتساب السعر بالترتيب التالي:

1. Base Price
2. Price List
3. Customer Special Price
4. Promotion
5. Coupon
6. Manual Discount
7. Tax
8. Final Price

**Business Rules**

- لا يسمح بتجاوز ترتيب المحرك.
- الخصم اليدوي هو آخر خصم يطبقه المستخدم.
- الضرائب دائماً تحتسب بعد انتهاء جميع الخصومات.
- لا يسمح بأن يصبح السعر النهائي أقل من الصفر.
- البيع تحت التكلفة يتطلب صلاحية خاصة.
- يدعم تعدد العملات.

**Conflict Resolution**

عند تعارض أكثر من خصم:

- Promotion + Coupon
- Promotion + Manual Discount
- Coupon + Manual Discount

يتم تطبيق السياسة المحددة بالنظام:

- Best For Customer
أو

- Best For Company

أو

- Highest Priority Rule

**Supported Pricing Sources**

- Default Product Price
- Branch Price
- Customer Group Price
- Contract Price
- Seasonal Price
- Campaign Price
- VIP Price

**Validation Rules**

- Final Price ≥ 0
- Discount ≤ 100%
- Valid Promotion
- Valid Coupon
- Active Price List

**Permissions**

- Edit Price
- Manual Discount
- Sell Below Cost
- Override Promotion
- Create Price List

**Events**

- PriceCalculated
- PromotionApplied
- CouponApplied
- ManualDiscountApplied
- PriceOverrideApproved

**Security Rules**

- جميع تغييرات الأسعار تحفظ داخل Audit Log.
- لا يسمح بتعديل الأسعار بعد ترحيل الفاتورة.
- تغيير السعر اليدوي يحتاج صلاحيات.

**Fraud Prevention**

- تسجيل جميع الخصومات.
- تسجيل سبب الخصم.
- تسجيل المستخدم.
- تسجيل وقت العملية.

**Offline Behaviour**

- يستخدم آخر نسخة من Price Lists.
- يستخدم آخر نسخة من Promotions.
- يستخدم آخر نسخة من Coupons.
- يحسب السعر بالكامل محلياً.

**Synchronization**

- يتم تنزيل جميع سياسات الأسعار عند الاتصال.
- يتم رفع الخصومات اليدوية مع الفاتورة.

**Exception Scenarios**

- انتهاء صلاحية الكوبون.
- انتهاء العرض.
- عدم وجود قائمة أسعار.
- تضارب أكثر من Promotion.
- فقدان الاتصال أثناء تحديث الأسعار.

---

### 46. تكامل أجهزة نقاط البيع (POS Devices Integration)

**Purpose (الهدف):**

توفير تكامل مباشر وآمن مع جميع أجهزة نقاط البيع لضمان سرعة تنفيذ العمليات وتقليل التدخل اليدوي.

**Supported Devices**

- Barcode Scanner
- QR Scanner
- Electronic Scale
- Receipt Printer
- Label Printer
- Customer Display
- Cash Drawer
- Payment Terminal
- NFC Reader
- RFID Reader

**Workflow**

1. قراءة الباركود.
2. قراءة الوزن (إن وجد).
3. إضافة المنتج للسلة.
4. تنفيذ الدفع.
5. فتح درج النقد.
6. طباعة الإيصال.
7. تحديث شاشة العميل.

**Business Rules**

- يجب أن تدعم الأجهزة USB أو Bluetooth أو LAN.
- يمكن استخدام أكثر من طابعة.
- يمكن تحديد طابعة لكل فرع.
- يمكن تحديد درج نقد لكل نقطة بيع.
- يسمح باستخدام أكثر من جهاز باركود.

**Device Status**

- Connected
- Disconnected
- Busy
- Offline
- Error

**Validation Rules**

- Printer Ready
- Scale Connected
- Scanner Active
- Drawer Available
- Terminal Ready

**Permissions**

- Configure Devices
- Printer Settings
- Cash Drawer Control
- Terminal Configuration

**Events**

- BarcodeScanned
- WeightCaptured
- ReceiptPrinted
- DrawerOpened
- TerminalConnected
- DeviceDisconnected
- PrintFailed

**Security Rules**

- يمنع فتح درج النقد يدوياً إلا بصلاحية.
- تسجيل جميع أوامر فتح الدرج.
- تسجيل جميع أوامر الطباعة.

**Fraud Prevention**

- لا يفتح درج النقد إذا لم يكن هناك دفع نقدي.
- يمنع إعادة طباعة الإيصال دون تسجيل السبب.
- النسخة الثانية تحمل علامة "Copy".

**Offline Behaviour**

- جميع الأجهزة المحلية تعمل دون اتصال.
- جهاز الدفع الإلكتروني قد يتطلب الإنترنت حسب المزود.
- يحتفظ النظام بطلبات الطباعة داخل Spooler.

**Synchronization**

- تتم مزامنة سجلات الأجهزة.
- مزامنة أخطاء الأجهزة.
- مزامنة سجلات الطباعة.
- مزامنة سجلات فتح درج النقد.

**Recovery**

- إعادة إرسال الطباعة تلقائياً.
- إعادة الاتصال بالأجهزة.
- استعادة آخر إعدادات الجهاز.

**Exception Scenarios**

- تعطل الطابعة.
- انقطاع الكهرباء.
- تعطل جهاز الدفع.
- تعطل الماسح.
- تعطل الميزان.
- فقدان اتصال Bluetooth.
- امتلاء قائمة الطباعة.
---

### 47. الحدود التشغيلية (Operational Limits)

**Purpose (الهدف):**
وضع حدود تشغيلية واضحة لمنع الأخطاء البشرية، وتقليل مخاطر الاحتيال، وضمان التزام المستخدمين بسياسات الشركة أثناء تنفيذ عمليات البيع.

**Scope (النطاق):**
تنطبق هذه الحدود على جميع مستخدمي وحدة المبيعات ونقاط البيع، ويمكن تخصيصها حسب الفرع أو المستخدم أو الدور الوظيفي.

**Operational Limits Configuration**

يمكن للنظام ضبط الحدود التالية:

- Maximum Discount Percentage
- Maximum Discount Amount
- Maximum Invoice Amount
- Maximum Refund Amount
- Maximum Return Amount
- Maximum Cash Drawer Balance
- Maximum Offline Invoices
- Maximum Open Reservations
- Maximum Daily Sales
- Maximum Credit Limit
- Maximum Customer Advance
- Maximum Price Override
- Maximum Manual Discount
- Maximum Gift Card Usage
- Maximum Loyalty Redemption

**Business Rules**

- لكل مستخدم حد خصم مختلف حسب صلاحياته.
- يمكن تحديد حدود مختلفة لكل فرع.
- يمكن تحديد حدود مختلفة لكل قائمة أسعار.
- تجاوز أي حد يتطلب موافقة المدير.
- بعض الحدود تؤدي إلى رفض العملية مباشرة دون إمكانية التجاوز.

**Manager Override Thresholds**

يتطلب إدخال Manager PIN عند:

- تجاوز نسبة الخصم.
- تجاوز قيمة المرتجع.
- البيع تحت التكلفة.
- تجاوز الحد الأعلى للفاتورة.
- تجاوز الحد الائتماني.
- تعديل سعر منتج.
- تجاوز سقف السحب النقدي.

**Validation Rules**

- Discount ≤ Maximum Discount
- Refund ≤ Maximum Refund
- Invoice Amount ≤ Maximum Invoice
- Cash Drawer ≤ Configured Limit
- Offline Queue ≤ Configured Limit
- Customer Credit ≤ Credit Limit

**Permissions**

- Configure Operational Limits
- Override Operational Limits
- View Operational Limits
- Edit Operational Limits

**Events**

- OperationalLimitExceeded
- ManagerApprovalRequested
- ManagerApprovalGranted
- ManagerApprovalRejected

**Security Rules**

- جميع التجاوزات تحفظ داخل Audit Log.
- تسجيل المستخدم والوقت والسبب.
- تسجيل المدير الذي وافق على التجاوز.

**Fraud Prevention**

- منع التجاوزات المتكررة.
- إرسال تنبيه عند تجاوز الحدود بصورة غير طبيعية.
- إنشاء تقارير دورية عن جميع التجاوزات.

**Offline Behaviour**

- تستخدم آخر نسخة من الحدود التشغيلية.
- يمنع تعديل الحدود أثناء العمل Offline.

**Synchronization**

- مزامنة الحدود الجديدة.
- مزامنة التجاوزات.
- مزامنة الموافقات.

**Exception Scenarios**

- تجاوز الحد أثناء انقطاع الاتصال.
- تغيير الحدود أثناء وجود فاتورة مفتوحة.
- اختلاف إعدادات الفرع عن الخادم.

---

### 48. سياسات مبيعات الفروع (Branch Sales Policies)

**Purpose (الهدف):**
تنظيم عمليات البيع بين الفروع المختلفة، وضمان تطبيق السياسات التجارية الموحدة مع السماح بمرونة تشغيلية لكل فرع.

**Scope (النطاق):**
تشمل جميع الفروع والمستودعات التابعة للشركة.

**Supported Scenarios**

- Cross Branch Sales
- Cross Branch Delivery
- Cross Branch Inventory Inquiry
- Cross Branch Reservations
- Cross Branch Transfers
- Cross Branch Returns

**Business Rules**

- يمكن للفرع بيع منتج موجود في فرع آخر.
- يمكن تنفيذ التسليم من فرع مختلف.
- يمكن مشاهدة مخزون الفروع الأخرى بصلاحية Read Only.
- لكل فرع قائمة أسعار مستقلة عند الحاجة.
- لكل فرع ضرائب مستقلة إذا تطلب النظام.
- لكل فرع مستودعات مستقلة.

**Cross Branch Pricing**

يمكن للفرع استخدام:

- Default Price
- Branch Price
- Airport Price
- Mall Price
- VIP Branch Price

**Inventory Policies**

- Stock Visibility
- Reserved Stock Visibility
- Available Stock Visibility
- Incoming Stock Visibility

**Branch Transfer Policies**

- طلب تحويل.
- موافقة المدير.
- تجهيز التحويل.
- شحن التحويل.
- استلام التحويل.
- تحديث المخزون.

**Validation Rules**

- يمنع البيع من فرع غير نشط.
- يمنع التسليم من مستودع مغلق.
- يمنع المرتجع بين الفروع إلا بصلاحية Global Return.
- يمنع استخدام قائمة أسعار غير مخصصة للفرع.

**Permissions**

- Cross Branch Sales
- Cross Branch Delivery
- Global Return
- Branch Inventory Inquiry
- Branch Transfer Approval

**Events**

- CrossBranchSaleCreated
- CrossBranchDeliveryCreated
- BranchTransferRequested
- BranchTransferApproved
- BranchTransferCompleted

**Security Rules**

- تسجيل جميع عمليات البيع بين الفروع.
- تسجيل الفرع المصدر والفرع المستقبل.
- تسجيل المستخدم المسؤول.

**Fraud Prevention**

- منع بيع مخزون غير موجود.
- منع التحويلات الوهمية.
- التحقق من الرصيد الحقيقي قبل البيع.

**Offline Behaviour**

- يمكن الاطلاع على آخر نسخة من بيانات الفروع.
- عمليات البيع المحلية تستمر بشكل طبيعي.

**Synchronization**

- تحديث المخزون بين الفروع.
- مزامنة التحويلات.
- مزامنة عمليات البيع المشتركة.

**Exception Scenarios**

- انقطاع الاتصال أثناء التحويل.
- إلغاء التحويل.
- رفض الفرع المستقبل.
- اختلاف الكميات أثناء الاستلام.

---

### 49. سياسات مبيعات العملاء (Customer Sales Policies)

**Purpose (الهدف):**
إدارة سياسات البيع بناءً على تصنيف العميل، ومستوى المخاطر، والاتفاقيات التجارية، بما يضمن تطبيق قواعد موحدة على جميع العملاء.

**Scope (النطاق):**
تنطبق على جميع العملاء سواء أفراد أو شركات.

**Customer Classifications**

- Retail Customer
- Wholesale Customer
- VIP Customer
- Distributor
- Government Customer
- Corporate Customer
- Cash Customer
- Credit Customer
- Blocked Customer
- Suspended Customer

**Customer Groups**

- Retail
- Wholesale
- VIP
- Gold
- Silver
- Platinum
- Government
- Employees

**Business Rules**

- يحدد نوع العميل تلقائياً سياسة البيع.
- العميل المحظور لا يسمح له بالشراء.
- العميل Credit Hold يسمح له بالنقد فقط.
- العميل Cash Only لا يسمح له بالفواتير الآجلة.
- يمكن لكل مجموعة عملاء امتلاك قائمة أسعار مستقلة.
- يمكن لكل مجموعة امتلاك عروض خاصة.
- يمكن تحديد حد ائتماني مستقل لكل عميل.

**Customer Restrictions**

- Credit Hold
- Cash Only
- Sales Block
- Return Block
- Promotion Block
- Coupon Block
- Loyalty Block

**Customer Pricing Policies**

- Default Price
- Customer Price List
- Customer Contract Price
- Customer Discount
- Customer Promotion
- Customer Coupon

**Credit Policies**

- Credit Limit
- Available Credit
- Credit Balance
- Credit Expiry
- Credit Warning

**Validation Rules**

- Credit Balance ≤ Credit Limit
- Customer Active
- Customer Not Blocked
- Customer Not Suspended
- Customer Has Valid Price List

**Permissions**

- Override Customer Restrictions
- Edit Customer Credit
- Override Credit Hold
- Override Customer Pricing

**Events**

- CustomerBlocked
- CustomerUnblocked
- CreditLimitExceeded
- CustomerCreditApproved
- CustomerRestrictionApplied

**Security Rules**

- لا يسمح بتعديل الحالة الائتمانية دون صلاحية.
- جميع التعديلات تحفظ في Audit Log.
- تسجيل سبب تغيير حالة العميل.

**Fraud Prevention**

- اكتشاف العملاء ذوي المرتجعات المرتفعة.
- اكتشاف محاولات تجاوز الحد الائتماني.
- مراقبة الاستخدام المفرط للكوبونات.

**Offline Behaviour**

- تستخدم آخر نسخة من بيانات العميل.
- تستخدم آخر حدود ائتمانية تمت مزامنتها.

**Synchronization**

- مزامنة بيانات العملاء.
- مزامنة الرصيد الائتماني.
- مزامنة القيود.
- مزامنة حدود الائتمان.

**Exception Scenarios**

- حذف العميل أثناء وجود فاتورة.
- تجاوز الحد الائتماني أثناء انقطاع الاتصال.
- تغيير مجموعة العميل أثناء وجود فاتورة مفتوحة.
---

### 50. سياسة إلغاء الفواتير (Invoice Cancellation Policy)

**Purpose (الهدف):**
تنظيم عمليات إلغاء الفواتير ومنع التلاعب بعد اعتماد العمليات المالية، مع ضمان المحافظة على سلامة البيانات المحاسبية والمخزنية.

**Scope (النطاق):**
تنطبق على جميع فواتير المبيعات الصادرة من وحدة المبيعات ونقاط البيع.

**Supported Operations**

- Void Line
- Void Invoice Draft
- Cancel Draft
- Cancel Before Posting
- Cancel Before Printing
- Sales Return After Posting

**Workflow**

1. إنشاء الفاتورة.
2. تعديل السطور عند الحاجة.
3. حذف سطر (Void Line) قبل الاعتماد.
4. إلغاء المسودة بالكامل (Void Invoice).
5. اعتماد وترحيل الفاتورة.
6. بعد الترحيل يمنع الإلغاء نهائياً.
7. في حالة الخطأ بعد الترحيل يتم إنشاء Sales Return فقط.

**Business Rules**

- يسمح بإلغاء المسودات فقط.
- يمنع حذف أي فاتورة مرحلة.
- يمنع حذف أي فاتورة مطبوعة.
- يمنع إعادة استخدام رقم الفاتورة الملغاة.
- جميع عمليات الإلغاء تحفظ في سجل التدقيق.

**Void Line Rules**

- يمكن حذف السطر قبل الترحيل.
- حذف أكثر من ثلاثة أسطر يتطلب Manager PIN.
- يحتفظ النظام بجميع بيانات السطر المحذوف.

**Void Invoice Rules**

- يسمح فقط إذا كانت الفاتورة Draft.
- لا يتم إنشاء أي قيود مالية.
- لا يتم التأثير على المخزون.

**After Posting Policy**

بعد تنفيذ:

- Posting
- Tax Submission
- Inventory Posting

يصبح الإلغاء غير مسموح نهائياً.

ويتم استخدام:

- Sales Return
- Credit Note

بدلاً من الإلغاء.

**Validation Rules**

- Invoice Status = Draft
- Invoice Not Posted
- Invoice Not Closed
- User Has Permission

**Permissions**

- Void Invoice
- Void Line
- Cancel Draft
- Manager Override
- View Voided Items

**Approval Rules**

يتطلب PIN المدير عند:

- حذف أكثر من ثلاثة أسطر.
- حذف فاتورة مرتفعة القيمة.
- حذف فاتورة بعد مرور مدة محددة.

**Events**

- InvoiceVoided
- InvoiceCancelled
- InvoiceLineVoided
- ManagerApprovalRequested
- ManagerApprovalGranted

**Audit Requirements**

يحفظ النظام:

- المستخدم
- المدير الموافق
- التاريخ
- الوقت
- السبب
- عنوان الجهاز
- رقم الفاتورة
- السطر المحذوف

**Fraud Prevention**

- منع حذف الفواتير بعد الترحيل.
- منع حذف جميع السطور دون تسجيل السبب.
- مراقبة المستخدمين أصحاب نسب الإلغاء المرتفعة.
- إصدار تقرير Voided Items Report.

**Offline Behaviour**

- يسمح بإلغاء المسودات المحلية.
- يمنع إلغاء الفواتير التي تمت مزامنتها.

**Synchronization**

- مزامنة عمليات الإلغاء.
- مزامنة سجلات التدقيق.
- مزامنة موافقات المدير.

**Exception Scenarios**

- انقطاع الكهرباء أثناء الإلغاء.
- انقطاع الشبكة أثناء إرسال الإلغاء.
- محاولة إلغاء فاتورة تمت مزامنتها بالفعل.

---

### 51. سيناريوهات الإجهاد المؤسسية (Enterprise Stress Scenarios)

**Purpose (الهدف):**
ضمان قدرة النظام على العمل بثبات وكفاءة أثناء الأحمال العالية، ومواسم الذروة، وانقطاع الخدمات.

**Scope (النطاق):**
تشمل جميع مكونات وحدة المبيعات، ونقاط البيع، والخادم المركزي، وقواعد البيانات.

**Stress Scenarios**

#### High Concurrent Cashiers

- تشغيل أكثر من 100 كاشير في نفس الوقت.
- منع تضارب عمليات البيع.
- استخدام Transaction Locking.

#### Massive Product Catalog

- دعم أكثر من مليون منتج.
- استخدام Full Text Search.
- استخدام الفهارس المناسبة.
- تحسين سرعة البحث.

#### Large Customer Database

- دعم ملايين العملاء.
- البحث الفوري.
- Pagination.
- Lazy Loading.

#### Offline Queue Overflow

- تخزين حتى آلاف الفواتير محلياً.
- استخدام IndexedDB.
- تقسيم المزامنة إلى دفعات (Chunking).

#### Database Failure

- استمرار البيع Offline.
- حفظ جميع العمليات محلياً.
- المزامنة عند عودة الخادم.

#### Network Latency

- استخدام Local Cache.
- التحويل التلقائي إلى Offline Mode.
- Retry Mechanism.

#### Peak Season

- Black Friday
- Ramadan
- Eid
- End of Year
- Promotional Campaigns

#### Printer Failure

- استمرار البيع.
- إعادة الطباعة لاحقاً.
- حفظ الطلب داخل Print Queue.

#### Payment Gateway Failure

- السماح باختيار وسيلة دفع أخرى.
- عدم فقدان السلة.

#### Inventory Race Conditions

- منع بيع آخر قطعة لأكثر من مستخدم.
- استخدام Row Locking.
- استخدام Optimistic أو Pessimistic Locking حسب الإعداد.

**Performance Targets**

- فتح شاشة POS أقل من ثانية.
- البحث عن منتج أقل من 200ms.
- إضافة المنتج للسلة أقل من 50ms.
- اعتماد الفاتورة أقل من ثانيتين.
- المزامنة تعمل بالخلفية دون تعطيل المستخدم.

**Recovery Strategy**

- Auto Retry
- Background Sync
- Local Queue
- Transaction Recovery
- Print Recovery

**Monitoring**

- CPU Usage
- Memory Usage
- Queue Length
- Sync Status
- Response Time
- Error Rate

**Events**

- OfflineModeActivated
- QueueOverflowDetected
- SyncStarted
- SyncCompleted
- ServerRecovered
- HighLoadDetected

**Security Rules**

- حماية البيانات المحلية بالتشفير.
- منع فقدان الفواتير.
- التحقق من سلامة البيانات بعد المزامنة.

---

### 52. مؤشرات مبيعات متقدمة (Advanced Sales KPIs)

**Purpose (الهدف):**
توفير لوحات معلومات متقدمة للإدارة العليا تساعد في اتخاذ القرارات وتحليل أداء الشركة لحظياً.

**Executive Dashboard**

يتضمن النظام لوحات معلومات لحظية تشمل:

- Gross Sales
- Net Sales
- Total Orders
- Total Customers
- Total Returns
- Total Discounts
- Total Taxes
- Average Basket Value
- Average Discount
- Average Margin

**Financial KPIs**

- Gross Margin
- Net Margin
- Cost of Goods Sold (COGS)
- Profit Per Invoice
- Profit Per Product
- Profit Per Branch

**Sales Performance KPIs**

- Sales Per Branch
- Sales Per Store
- Sales Per Cashier
- Sales Per Sales Representative
- Sales Per Hour
- Sales Per Day
- Sales Per Month
- Sales Per Year

**Customer Analytics**

- Customer Retention Rate
- Repeat Customers
- New Customers
- Lost Customers
- Customer Lifetime Value (CLV)
- Average Purchase Frequency

**Product Analytics**

- Best Selling Products
- Worst Selling Products
- Slow Moving Products
- Fast Moving Products
- Most Returned Products
- Highest Margin Products
- Lowest Margin Products

**Promotion Analytics**

- Promotion Usage Rate
- Coupon Usage
- Loyalty Redemption
- Promotion Revenue
- Promotion ROI

**Operational KPIs**

- Open Shifts
- Closed Shifts
- Average Checkout Time
- Average Queue Time
- Offline Sales
- Sync Success Rate

**Branch KPIs**

- Branch Ranking
- Revenue Per Branch
- Profit Per Branch
- Return Rate Per Branch
- Discount Rate Per Branch

**Cashier KPIs**

- Number of Invoices
- Average Invoice
- Average Discount
- Refund Ratio
- Cancellation Ratio
- Shift Difference

**Alerts**

تنبيه الإدارة عند:

- انخفاض المبيعات.
- ارتفاع المرتجعات.
- زيادة الخصومات.
- انخفاض هامش الربح.
- ارتفاع الفروقات النقدية.
- تجاوز الحدود التشغيلية.

**Dashboard Filters**

- Company
- Branch
- Warehouse
- Cashier
- Sales Representative
- Customer
- Customer Group
- Product
- Category
- Brand
- Date Range
- Shift
- Payment Method

**Reports**

- Executive Sales Dashboard
- Branch Performance Report
- Cashier Performance Report
- Customer Analysis Report
- Product Analysis Report
- Promotion Analysis Report
- Profitability Report
- Sales Trend Report
- Return Analysis Report

**Export Options**

- PDF
- Excel
- CSV
- Print

**Events**

- KPICalculated
- DashboardRefreshed
- AlertTriggered
- ReportGenerated

**Performance Requirements**

- تحديث المؤشرات لحظياً أو حسب الإعداد.
- تحميل لوحة المعلومات خلال أقل من ثلاث ثوانٍ.
- دعم ملايين السجلات باستخدام التجميع (Aggregation) والتخزين المؤقت (Caching).

**Future Extensions**

- AI Sales Forecasting.
- Predictive Analytics.
- Customer Behavior Analysis.
- Demand Forecasting.
- Smart Recommendations.
- Executive Mobile Dashboard.