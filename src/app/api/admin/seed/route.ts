import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { listCategories, seedCategoriesIfEmpty } from "@/lib/repositories/categories";

// One-time seed endpoint — invoke once to populate Firestore with demo articles.
// Protected by a simple secret so it's not accidentally re-run.
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure categories exist first
  await seedCategoriesIfEmpty();
  const categories = await listCategories();

  const byCatName = (name: string) => categories.find((c) => c.name.az === name) ?? categories[0];

  const now = new Date();
  const ts = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d;
  };

  const ARTICLES = [
    {
      title: { az: "2026-cı ildə ƏDV-nin yeni hesablama qaydaları: Sahibkarlar üçün tam bələdçi", en: "New VAT Calculation Rules in 2026: A Complete Guide for Entrepreneurs" },
      slug: { az: "2026-edv-yeni-hesablama-qaydasi", en: "2026-vat-new-calculation-rules" },
      excerpt: { az: "2026-cı ildən etibarən ƏDV hesablamasında əsaslı dəyişikliklər baş verəcək. Bu məqalədə bütün yenilikləri, istisnaları və praktiki hesablama nümunələrini izah edirik.", en: "Major changes in VAT calculations take effect in 2026. This article explains all the updates, exceptions and practical calculation examples." },
      contentHtml: {
        az: `<p>2026-cı il yanvarın 1-dən etibarən Azərbaycanda Əlavə Dəyər Vergisinin (ƏDV) hesablanması qaydalarında bir sıra mühüm dəyişikliklər qüvvəyə minmişdir. Bu dəyişikliklər xüsusilə kiçik və orta biznes sahiblərini, eləcə də fərdi sahibkarları birbaşa təsir edir.</p>
<h2>ƏDV dərəcəsi: 18% qalır</h2>
<p>2026-cı ildə ƏDV-nin əsas dərəcəsi 18% olaraq qalmağa davam edir. Lakin hesablama bazasının müəyyən edilməsi qaydaları dəqiqləşdirilmişdir. Artıq dövriyyəyə daxil edilən bütün mallara, işlərə və xidmətlərə vahid hesablama metodologiyası tətbiq olunur.</p>
<h2>ƏDV-dən azad olan əməliyyatlar</h2>
<p>Aşağıdakı əməliyyatlar ƏDV-dən azaddır:</p>
<ul>
  <li>Tibbi avadanlıq və dərman preparatlarının idxalı</li>
  <li>Kənd təsərrüfatı məhsullarının birinci həlqəsi üzrə satışı</li>
  <li>Beynəlxalq nəqliyyat xidmətləri (sıfır dərəcə)</li>
  <li>Maliyyə xidmətləri (kredit, depozit, sığorta)</li>
</ul>
<h2>Rüblük bəyannamə verilməsi</h2>
<p>ƏDV ödəyiciləri hər rüb sonrakı ayın 20-nə qədər bəyannamə təqdim etməlidirlər. 2026-cı ildə bu tarixlər aşağıdakı kimidir: I rüb — 20 aprel, II rüb — 20 iyul, III rüb — 20 oktyabr, IV rüb — 20 yanvar 2027.</p>
<h2>Elektron qaimə-faktura tələbi</h2>
<p>2026-cı ildən bütün ƏDV ödəyiciləri əməliyyatlarını e-qaimə sistemi üzərindən rəsmiləşdirməlidirlər. Kağız formatında qaimə-faktura artıq verginin məqsədləri üçün etibarlı sayılmır. E-qaimə sisteminə giriş DOST portalı vasitəsilə həyata keçirilir.</p>
<h2>Praktiki misal: Pərakəndə ticarət</h2>
<p>Tutaq ki, şirkətinizin aylıq dövriyyəsi 50.000 AZN-dir (ƏDV daxil). ƏDV məbləğinin hesablanması: 50.000 × 18/118 = 7.627,12 AZN. Satınalma zamanı ödənilmiş ƏDV (girovda olan) 5.000 AZN olduqda, ödəniləcək ƏDV = 7.627,12 – 5.000 = 2.627,12 AZN.</p>
<p>Hər hansı bir sual yarandıqda TaxIQ mütəxəssisləri ilə əlaqə saxlayın. Düzgün ƏDV hesablaması işinizin gözlənilməz vergi yükündən qorunmasına kömək edir.</p>`,
        en: `<p>As of January 1, 2026, several important changes to Value Added Tax (VAT) calculation have come into effect in Azerbaijan. These changes directly affect small and medium businesses as well as individual entrepreneurs.</p>
<h2>VAT rate remains at 18%</h2>
<p>The standard VAT rate remains at 18% in 2026. However, the rules for determining the tax base have been clarified. A unified calculation methodology now applies to all goods, works and services included in turnover.</p>
<h2>VAT-exempt operations</h2>
<p>The following operations are exempt from VAT: import of medical equipment and pharmaceuticals, first-link sales of agricultural products, international transport services (zero rate), and financial services (credit, deposit, insurance).</p>
<h2>Quarterly returns</h2>
<p>VAT payers must submit returns by the 20th of the month following each quarter. Electronic invoice requirement: all VAT payers must process transactions through the e-invoice system starting in 2026.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80", alt: { az: "ƏDV hesablama", en: "VAT calculation" }, width: 900, height: 600 },
      categoryId: byCatName("Vergi")?.id ?? categories[0].id,
      tags: ["ƏDV", "Vergi", "2026"],
      featured: true,
      readingMinutes: 6,
      publishedAt: ts(0),
    },
    {
      title: { az: "Mənfəət vergisini azaltmağın 7 qanuni yolu: Mühasibinizin bilməli olduğu üsullar", en: "7 Legal Ways to Reduce Profit Tax: Methods Your Accountant Must Know" },
      slug: { az: "menfeеt-vergisini-azaltmaq-7-usul", en: "reduce-profit-tax-7-legal-methods" },
      excerpt: { az: "Vergi planlaşdırması vasitəsilə qanuni olaraq mənfəət vergisi öhdəliyini azaltmaq mümkündür. Bu məqalədə 7 sübut olunmuş metodu ətraflı izah edirik.", en: "Tax planning allows you to legally reduce profit tax liability. This article explains 7 proven methods in detail." },
      contentHtml: {
        az: `<p>Mənfəət vergisi Azərbaycanda hüquqi şəxslər üçün 20%, fərdi sahibkarlar üçün isə 14% dərəcəsindədir. Düzgün vergi planlaşdırması ilə bu yükü qanuni olaraq azaltmaq mümkündür.</p>
<h2>1. Amortizasiya xərclərindən tam istifadə</h2>
<p>Əsas fondlar üzrə amortizasiya xərcləri vergitutma bazasından çıxılır. Sürətləndirilmiş amortizasiya üsulundan istifadə etməklə ilk illərdə daha böyük məbləğ vergidən azad edilə bilər. Texnoloji avadanlıqlar üçün faydalı istifadə müddəti qısaldıla bilər.</p>
<h2>2. Tədqiqat və inkişaf xərcləri</h2>
<p>T&İ xərclərinin 150%-i vergitutma bazasından çıxılır. Bu güzəşt xüsusilə texnologiya şirkətləri üçün əhəmiyyətlidir. Tədqiqat layihələrinin düzgün sənədləşdirilməsi bu üstünlükdən istifadənin əsas şərtidir.</p>
<h2>3. İşçi hazırlığı və təlim xərcləri</h2>
<p>Müəssisənin fəaliyyəti ilə birbaşa əlaqəli olan işçi təlim xərclərinin hamısı vergidən çıxılır. Beynəlxalq sertifikasiya, peşəkar inkişaf proqramları və texniki hazırlıq kurslarına çəkilən xərclər bu kateqoriyaya daxildir.</p>
<h2>4. Ehtiyat fondlarının formalaşdırılması</h2>
<p>Şübhəli borclar üzrə ehtiyat, zəmanət öhdəlikləri üzrə ehtiyat və ixrac risklərinin sığortası üzrə xərclər vergitutma bazasından çıxılır. Bu mexanizmdən düzgün istifadə vergi yükünü 2-5% azalda bilər.</p>
<h2>5. Lizinq maliyyələşdirməsi</h2>
<p>Avadanlıqların alınmasında mülkiyyət əvəzinə lizinq üsulundan istifadə etmək bir sıra vergi üstünlükləri yaradır. Lizinq ödənişlərinin tam məbləği xərc kimi vergidən çıxılır, alış zamanı isə yalnız amortizasiya çıxılır.</p>
<h2>6. Xarici bazarlara ixrac fəaliyyəti</h2>
<p>İxracat gəlirləri üzrə bir sıra güzəştlər mövcuddur. Qeyri-neft sektoru üzrə ixracat edən müəssisələr müəyyən şərtlər daxilində mənfəət vergisinin 75%-i həcmində güzəştdən istifadə edə bilər.</p>
<h2>7. Investisiya vergisi kreditləri</h2>
<p>Yeni istehsal avadanlığına, ekoloji texnologiyalara və müasirləşdirməyə edilən investisiyalar üzrə vergi kreditləri mövcuddur. Bu kreditlər hesablanmış verginin birbaşa azaldılmasına imkan verir.</p>
<p>Vergi planlaşdırması həmişə peşəkar mühasib və ya vergi məsləhətçisinin iştirakı ilə aparılmalıdır. TaxIQ-da bu sahədə sizə kömək edə biləcək mütəxəssislərlə əlaqə saxlaya bilərsiniz.</p>`,
        en: `<p>Profit tax in Azerbaijan is 20% for legal entities and 14% for individual entrepreneurs. Proper tax planning can legally reduce this burden.</p>
<h2>1. Full use of depreciation expenses</h2>
<p>Depreciation on fixed assets is deducted from the tax base. Using accelerated depreciation allows larger amounts to be deducted in early years. Useful life for technological equipment can be shortened.</p>
<h2>2. R&D expenses</h2>
<p>150% of R&D expenses are deducted from the tax base. This is especially significant for technology companies. Proper documentation of research projects is the key condition for using this benefit.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80", alt: { az: "Mənfəət vergisi", en: "Profit tax" }, width: 900, height: 600 },
      categoryId: byCatName("Vergi")?.id ?? categories[0].id,
      tags: ["Mənfəət vergisi", "Vergi planlaşdırması", "Biznes"],
      featured: true,
      readingMinutes: 8,
      publishedAt: ts(1),
    },
    {
      title: { az: "MHBS standartlarına uyğun maliyyə hesabatlarının hazırlanması: 2026 yenilikləri", en: "Preparing Financial Statements According to IFRS Standards: 2026 Updates" },
      slug: { az: "mhbs-maliyye-hesabatlari-2026", en: "ifrs-financial-statements-2026-updates" },
      excerpt: { az: "Beynəlxalq Maliyyə Hesabatlılığı Standartları (MHBS) üzrə 2026-cı ildə qüvvəyə minən yeni standartlar Azərbaycan mühasibləri üçün nə demək edir?", en: "What do the new IFRS standards effective in 2026 mean for Azerbaijani accountants?" },
      contentHtml: {
        az: `<p>Beynəlxalq Maliyyə Hesabatlılığı Standartları (MHBS/IFRS) hər il yenilənir. 2026-cı ildə bir neçə mühüm standart dəyişikliyi qüvvəyə minmişdir ki, bu da Azərbaycanda MHBS tətbiq edən şirkətlər üçün birbaşa əhəmiyyət kəsb edir.</p>
<h2>MHBS 17 — Sığorta müqavilələri</h2>
<p>2026-cı ildən bütün sığorta şirkətləri MHBS 17-ni tam olaraq tətbiq etməyə başlamalıdır. Bu standart sığorta müqavilələrinin uçotu, ölçülməsi və açıqlanması üzrə köklü dəyişikliklər nəzərdə tutur. Əvvəlki MHBS 4 standartından fərqli olaraq, MHBS 17 ölçülmə modelini vahidləşdirir.</p>
<h2>MHBS 9 — Maliyyə alətləri: Əlavə dəqiqləşmələr</h2>
<p>Maliyyə alətlərinin uçotu üzrə standartda texniki dəqiqləşmələr aparılmışdır. Xüsusilə amortizasiya edilmiş dəyərlə ölçülən maliyyə aktivlərinin yenidən təsnifatı zamanı tətbiq edilən qaydalar dəqiqləşdirilmişdir.</p>
<h2>Azərbaycanda MHBS-ın tətbiq dairəsi</h2>
<p>Azərbaycanda aşağıdakı şirkətlər MHBS-a uyğun hesabat verməyə borcludur:</p>
<ul>
  <li>Fond birjasında qeydiyyatlı şirkətlər</li>
  <li>Banklar və kredit təşkilatları</li>
  <li>Sığorta şirkətləri</li>
  <li>İlin əvvəlinə aktivi 50 mln. AZN-dən çox olan müəssisələr</li>
  <li>İlin əvvəlinə dövriyyəsi 75 mln. AZN-dən çox olan müəssisələr</li>
</ul>
<h2>Balans hesabatının strukturu</h2>
<p>MHBS-a uyğun balans hesabatı aşağıdakı əsas elementləri əhatə etməlidir: uzunmüddətli aktivlər (əsas vəsaitlər, qeyri-maddi aktivlər, uzunmüddətli investisiyalar), qısamüddətli aktivlər (inventar, debitor borcları, pul vəsaitləri), öz kapitalı, uzunmüddətli öhdəliklər, qısamüddətli öhdəliklər.</p>
<h2>Açıqlama tələbləri</h2>
<p>MHBS hesabatları əsas maliyyə sənədlərindən əlavə müfəssəl açıqlamalar tələb edir. Bu açıqlamalar mühasibat siyasəti, risklər, müqayisəli dövr məlumatları və fərdi maddələrə aid izahatları əhatə edir.</p>`,
        en: `<p>International Financial Reporting Standards (IFRS) are updated annually. Several important standard changes have come into effect in 2026, directly relevant to companies applying IFRS in Azerbaijan.</p>
<h2>IFRS 17 — Insurance Contracts</h2>
<p>From 2026, all insurance companies must fully apply IFRS 17. This standard introduces fundamental changes to the accounting, measurement and disclosure of insurance contracts.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80", alt: { az: "Maliyyə hesabatı", en: "Financial statements" }, width: 900, height: 600 },
      categoryId: byCatName("Mühasibatlıq")?.id ?? categories[0].id,
      tags: ["MHBS", "IFRS", "Mühasibatlıq", "Hesabat"],
      featured: true,
      readingMinutes: 7,
      publishedAt: ts(2),
    },
    {
      title: { az: "Fərdi sahibkarlar üçün sadələşdirilmiş vergi sistemi: Kimlər keçə bilər?", en: "Simplified Tax System for Individual Entrepreneurs: Who Can Switch?" },
      slug: { az: "ferdi-sahibkar-sadelessdirilmis-vergi", en: "simplified-tax-individual-entrepreneurs" },
      excerpt: { az: "Sadələşdirilmiş vergi rejimi fərdi sahibkarlara vergi öhdəliklərini əhəmiyyətli dərəcədə azaltmağa imkan verir. Bu sistemə keçid şərtlərini öyrənin.", en: "The simplified tax regime allows individual entrepreneurs to significantly reduce tax liabilities. Learn the conditions for switching to this system." },
      contentHtml: {
        az: `<p>Sadələşdirilmiş vergi Azərbaycanda kiçik sahibkarlar üçün nəzərdə tutulmuş xüsusi vergi rejimidir. Bu rejimdə verginin hesablanması əhəmiyyətli dərəcədə sadədir və vergi yükü daha aşağıdır.</p>
<h2>Sadələşdirilmiş verginin dərəcəsi</h2>
<p>2026-cı ildə sadələşdirilmiş vergi dərəcəsi aşağıdakı kimidir: Bakı şəhərindəki fəaliyyət üçün — 2%, digər rayonlarda — 0.5–1%. Bu dərəcə xalis mənfəətdən deyil, ümumi dövriyyədən hesablanır.</p>
<h2>Bu rejimə keçid şərtləri</h2>
<p>Sadələşdirilmiş vergini seçmək üçün aşağıdakı şərtlər yerinə yetirilməlidir:</p>
<ul>
  <li>İllik dövriyyə 200.000 AZN-i keçməməlidir</li>
  <li>Aksizli malların istehsalı ilə məşğul olunmamalıdır</li>
  <li>Mineral ehtiyatların çıxarılması fəaliyyəti aparılmamalıdır</li>
  <li>Əgər ƏDV ödəyicisidirsə, bu statusdan imtina edilməlidir</li>
</ul>
<h2>Sadələşdirilmiş vergi üstünlükləri</h2>
<p>Bu rejimdə fəaliyyət göstərən sahibkar ƏDV, mənfəət vergisi, sosial sığorta ayırmaları (müəyyən istisnalarla) ödəməkdən azaddır. Yalnız sadələşdirilmiş vergi ödənilir.</p>
<h2>Bəyannamə verilməsi</h2>
<p>Sadələşdirilmiş vergi ödəyiciləri aylıq bəyannamə verirlər. Hər ayın 20-nə qədər əvvəlki ayın dövriyyəsi üzrə vergi hesablanıb ödənilməlidir.</p>
<h2>Nə vaxt adi vergi sisteminə keçmək lazımdır?</h2>
<p>İllik dövriyyəniz 200.000 AZN-i keçdikdə siz avtomatik olaraq adi vergi sisteminə keçməlisiniz. Bu keçid həmin dövrdən etibarən tətbiq edilir. Vaxtında keçid etməmək ciddi cəzalara səbəb ola bilər.</p>`,
        en: `<p>Simplified tax is a special tax regime designed for small businesses in Azerbaijan. Tax calculation under this regime is significantly simpler and the tax burden is lower.</p>
<h2>Simplified tax rate</h2>
<p>In 2026, the simplified tax rate is: 2% for activity in Baku, 0.5–1% in other regions. This rate is calculated on total turnover, not net profit.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80", alt: { az: "Fərdi sahibkar", en: "Individual entrepreneur" }, width: 900, height: 600 },
      categoryId: byCatName("Vergi")?.id ?? categories[0].id,
      tags: ["Sadələşdirilmiş vergi", "Fərdi sahibkar", "Vergi"],
      featured: false,
      readingMinutes: 5,
      publishedAt: ts(3),
    },
    {
      title: { az: "Bank kreditinin faizlərini vergidən çıxa bilərsinizmi? Hüquqi bazis", en: "Can You Deduct Bank Loan Interest from Tax? Legal Basis" },
      slug: { az: "bank-kredit-faizi-vergiden-cixilma", en: "bank-loan-interest-tax-deduction" },
      excerpt: { az: "Biznes məqsədləri üçün alınan kreditlər üzrə faiz xərclərinin vergidən çıxılması qaydası haqqında hər şeyi öyrənin.", en: "Learn everything about the procedure for deducting interest expenses on loans taken for business purposes from tax." },
      contentHtml: {
        az: `<p>Müəssisələr fəaliyyətlərini maliyyələşdirmək üçün tez-tez bank kreditlərindən istifadə edirlər. Vergi qanunvericiliyi bu kreditlər üzrə faiz xərclərinin vergitutma bazasından çıxılmasına imkan verir, lakin müəyyən məhdudiyyətlər mövcuddur.</p>
<h2>Hansı faizlər vergidən çıxıla bilər?</h2>
<p>Vergitutma bazasından aşağıdakı faiz xərcləri çıxıla bilər: birbaşa biznes fəaliyyəti ilə bağlı kredit üzrə faizlər, texniki avadanlıq alınması üçün alınan kredit faizləri, işlək kapital kreditlərinin faizləri.</p>
<h2>Məhdudiyyətlər nələrdir?</h2>
<p>Bütün faizlər tam həcmdə çıxıla bilməz. Vergi Məcəlləsinin 109-cu maddəsinə əsasən, xarici kreditlər üzrə faizlər iki dəfə Mərkəzi Bankın uçot dərəcəsini keçdikdə artıq hissə vergidən çıxıla bilmir. 2026-cı ildə Mərkəzi Bankın uçot dərəcəsi 7.25% olduğundan, vergidən çıxıla bilən maksimum faiz dərəcəsi 14.5%-dir.</p>
<h2>Sənədləşdirmə tələbləri</h2>
<p>Faiz xərclərinin vergidən çıxılması üçün aşağıdakı sənədlər lazımdır: kredit müqaviləsi, faizlərin hesablanmasını əks etdirən bank çıxarışları, ödəniş tapşırıqları.</p>
<h2>Kapitallaşdırılmış faizlər</h2>
<p>Tikinti dövrü ərzində kapitallaşdırılan faizlər xərc kimi deyil, aktivin dəyərinə əlavə edilir. Bu faizlər amortizasiya yolu ilə gələcəkdə vergidən çıxılacaq.</p>
<h2>Praktik tövsiyə</h2>
<p>Faiz xərclərini düzgün vergidən çıxmaq üçün kredit müqavilələrini diqqətlə nəzərdən keçirin, faizin hesablanma metodunu anlayın və mühasibinizlə birlikdə optimal strategiya seçin.</p>`,
        en: `<p>Companies often use bank loans to finance their operations. Tax legislation allows interest expenses on these loans to be deducted from the tax base, but certain limitations exist.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80", alt: { az: "Bank krediti", en: "Bank loan" }, width: 900, height: 600 },
      categoryId: byCatName("Maliyyə")?.id ?? categories[0].id,
      tags: ["Bank krediti", "Faiz", "Vergidən çıxılma", "Maliyyə"],
      featured: false,
      readingMinutes: 6,
      publishedAt: ts(4),
    },
    {
      title: { az: "İşçilərin əmək haqqı xərclərinin mühasibat uçotunda düzgün əks etdirilməsi", en: "Proper Accounting of Employee Salary Expenses" },
      slug: { az: "emek-haqqi-xercleri-muhasibat-ucotu", en: "employee-salary-expenses-accounting" },
      excerpt: { az: "Əmək haqqı fondunun düzgün uçotu, sosial sığorta ayırmaları, məzuniyyət hesablamaları — bu məqalədə mühasib üçün ətraflı praktik rəhbər.", en: "Proper accounting of payroll, social insurance deductions, vacation accruals — a detailed practical guide for accountants." },
      contentHtml: {
        az: `<p>Əmək haqqı xərclərinin uçotu mühasibat işinin ən mühüm sahələrindən biridir. Düzgün uçot həm vergi uyğunluğunu, həm də işçi hüquqlarının qorunmasını təmin edir.</p>
<h2>Əmək haqqı fondunun strukturu</h2>
<p>Əmək haqqı fondu aşağıdakı komponentlərdən ibarətdir: əsas əmək haqqı, mükafatlar və bonuslar, məzuniyyət ödənişləri, xəstəlik vərəqəsi ödənişləri, işçinin payına düşən sosial sığorta.</p>
<h2>Gəlir vergisi tutulması</h2>
<p>2026-cı ildə gəlir vergisi aşağıdakı qaydada tutulur: 2.500 AZN-ə qədər əmək haqqının 2.500 AZN-i aşmayan hissəsinə 14%, 2.500 AZN-dən yuxarı olan hissəyə isə 25% tətbiq edilir. Eyni zamanda, aylıq 2.500 AZN-ə qədər əmək haqqı üzrə 200 AZN güzəşt tətbiq edilir.</p>
<h2>Sosial sığorta ayırmaları</h2>
<p>Məcburi dövlət sosial sığortası üzrə: işəgötürən tərəfindən — 22%, işçi tərəfindən — 3%. Bu ayırmalar əmək haqqı hesablandıqdan sonra müvafiq aylarda hesablanıb ödənilir.</p>
<h2>Uçot yazılışları</h2>
<p>Əmək haqqının hesablanması: Dt 20,26,44 — Kt 531. Gəlir vergisinin tutulması: Dt 531 — Kt 521. Sosial sığorta (işçi payı): Dt 531 — Kt 522. Sosial sığorta (işəgötürən payı): Dt 20,26,44 — Kt 522.</p>
<h2>Məzuniyyət ehtiyatı</h2>
<p>MHBS tətbiq edən şirkətlər üçün məzuniyyət öhdəlikləri üzrə ehtiyat formalaşdırılmalıdır. Bu ehtiyat hər ay işçilərin məzuniyyət hüququna uyğun olaraq hesablanır.</p>`,
        en: `<p>Payroll accounting is one of the most important areas of bookkeeping. Proper accounting ensures both tax compliance and protection of employee rights.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=900&q=80", alt: { az: "Əmək haqqı", en: "Salary accounting" }, width: 900, height: 600 },
      categoryId: byCatName("Mühasibatlıq")?.id ?? categories[0].id,
      tags: ["Əmək haqqı", "Mühasibatlıq", "Sosial sığorta"],
      featured: false,
      readingMinutes: 7,
      publishedAt: ts(5),
    },
    {
      title: { az: "ƏDV bəyannaməsini düzgün doldurmaq: Addım-addım bələdçi 2026", en: "Filing a Correct VAT Return: Step-by-Step Guide 2026" },
      slug: { az: "edv-beyanname-doldurma-beledci-2026", en: "vat-return-filing-guide-2026" },
      excerpt: { az: "ƏDV bəyannaməsini doldurmaqda çətinlik çəkirsiniz? Bu addım-addım bələdçi sizə hər sütunu düzgün doldurmağa kömək edəcək.", en: "Having trouble filling out your VAT return? This step-by-step guide will help you correctly complete every column." },
      contentHtml: {
        az: `<p>ƏDV bəyannaməsi Azərbaycanda elektron formatda DOST portalı vasitəsilə təqdim edilir. Bəyannamənin düzgün doldurulması vergi uyğunluğu üçün vacibdir.</p>
<h2>Bəyannaməyə hazırlıq</h2>
<p>Bəyannaməni doldurmadan əvvəl aşağıdakı sənədlər hazır olmalıdır: aylıq satış reyestri (e-qaimə sistemi üzrə), aylıq alış reyestri, idxal ƏDV-si üzrə gömrük bəyannamələri, bank hesabatları.</p>
<h2>I bölmə: Vergitutma bazası</h2>
<p>Bəyannamənin I bölməsini doldurarkən aşağıdakıları qeyd edin: 18% dərəcəli əməliyyatlar üzrə dövriyyə, 0% (sıfır) dərəcəli əməliyyatlar (ixrac), ƏDV-dən azad olan əməliyyatlar.</p>
<h2>II bölmə: Hesablanmış ƏDV</h2>
<p>Bu bölmədə I bölmədə göstərilən bazadan hesablanmış ƏDV məbləği qeyd olunur. Əsas formula: Vergitutma bazası × 18% = Hesablanmış ƏDV.</p>
<h2>III bölmə: Çıxıla bilən ƏDV (girov)</h2>
<p>Girovsaxlama hüququ olan ƏDV-nin məbləği bu bölmədə göstərilir. Diqqət: yalnız biznes məqsədi üçün alınan mallara, işlərə və xidmətlərə dair ƏDV girov kimi çıxıla bilər.</p>
<h2>Ödəniləcək vergi hesablanması</h2>
<p>Ödəniləcək ƏDV = Hesablanmış ƏDV – Çıxıla bilən ƏDV (girov). Bu məbləğ mənfi olarsa, fərq gələcək dövrə keçirilir və ya geri qaytarılması tələb edilə bilər.</p>
<h2>Tez-tez buraxılan səhvlər</h2>
<p>Ən çox rast gəlinən səhvlər bunlardır: əvvəlki dövrdən keçirilmiş girovu unutmaq, idxal ƏDV-sini daxil etməmək, ƏDV-dən azad əməliyyatları vergitutma bazasına daxil etmək.</p>`,
        en: `<p>VAT returns in Azerbaijan are submitted electronically through the DOST portal. Proper completion of the return is essential for tax compliance.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&q=80", alt: { az: "ƏDV bəyannaməsi", en: "VAT return" }, width: 900, height: 600 },
      categoryId: byCatName("Vergi")?.id ?? categories[0].id,
      tags: ["ƏDV", "Bəyannamə", "Vergi uyğunluğu"],
      featured: false,
      readingMinutes: 8,
      publishedAt: ts(6),
    },
    {
      title: { az: "Dividendlərə tətbiq olunan vergi dərəcələri 2026: Ödəmə strategiyası", en: "Tax Rates on Dividends 2026: Payment Strategy" },
      slug: { az: "dividendler-vergi-derecleri-2026", en: "dividend-tax-rates-2026" },
      excerpt: { az: "Şirkət mənfəətini dividend kimi ödəmək qərarı qəbul etməzdən əvvəl vergi nəticələrini başa düşün. 2026-cı ildəki dərəcələr və optimallaşdırma üsulları.", en: "Before deciding to pay company profits as dividends, understand the tax consequences. 2026 rates and optimization methods." },
      contentHtml: {
        az: `<p>Dividend — şirkətin mənfəətindən səhmdarlar arasında bölüşdürülən pay. Vergi qanunvericiliyinə görə dividendlər xüsusi vergi rejiminə tabedir.</p>
<h2>Dividend vergisinin dərəcəsi</h2>
<p>2026-cı ildə Azərbaycan rezidentləri üçün dividend vergisinin dərəcəsi 10%-dir. Qeyri-rezidentlər üçün dərəcə 10%-dir (ikiqat vergitutmanın qarşısının alınması haqqında müqavilə olduqda azaldıla bilər).</p>
<h2>Dividend ödənişinin proseduru</h2>
<p>Dividend ödənilməzdən əvvəl aşağıdakılar tamamlanmalıdır: illik maliyyə hesabatı hazırlanmalı, yığıncaq qərarı qəbul edilməli, bölüşdürüləcək mənfəət müəyyənləşdirilməlidir. Dividend ödənildikdə vergi agent kimi şirkət tərəfindən tutulur.</p>
<h2>Mənfəəti dividend yolu ilə çıxarmaq sərfəlidirmi?</h2>
<p>Bu suala cavab vermək üçün alternativləri müqayisə etmək lazımdır. Əmək haqqı: işçinin 14-25% gəlir vergisi + 22%+3% = 39% sosial sığorta. Dividend: cəmi 10% vergi. Lakin dividenddən əvvəl şirkətin mənfəəti üzərindən 20% mənfəət vergisi ödənilir.</p>
<h2>Hesablama nümunəsi</h2>
<p>Şirkətin vergi öncəsi mənfəəti 100.000 AZN. Mənfəət vergisi (20%): 20.000 AZN. Xalis mənfəət: 80.000 AZN. Dividend vergisi (10%): 8.000 AZN. Səhmdara çatan məbləğ: 72.000 AZN. Effektiv vergi dərəcəsi: 28%.</p>`,
        en: `<p>Dividend — the share of company profit distributed among shareholders. Tax legislation subjects dividends to a special tax regime.</p>
<h2>Dividend tax rate</h2>
<p>In 2026, the dividend tax rate for Azerbaijani residents is 10%. For non-residents, the rate is also 10% (can be reduced under double taxation avoidance treaties).</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80", alt: { az: "Dividendlər", en: "Dividends" }, width: 900, height: 600 },
      categoryId: byCatName("Maliyyə")?.id ?? categories[0].id,
      tags: ["Dividend", "Maliyyə", "Vergi planlaşdırması"],
      featured: false,
      readingMinutes: 6,
      publishedAt: ts(7),
    },
    {
      title: { az: "Əsas vəsaitlərin amortizasiyası: Hansı metodu seçmək lazımdır?", en: "Depreciation of Fixed Assets: Which Method to Choose?" },
      slug: { az: "esasvesait-amortizasiya-metodlari", en: "fixed-asset-depreciation-methods" },
      excerpt: { az: "Düz xətt, azalan qalıq, istehsal həcmi — hər amortizasiya metodunun vergi nəticələri fərqlidir. Müəssisəniz üçün ən optimal seçimi birgə tapaq.", en: "Straight-line, declining balance, units of production — each depreciation method has different tax consequences. Let's find the optimal choice for your company." },
      contentHtml: {
        az: `<p>Əsas vəsaitlərin amortizasiyası onların dəyərinin faydalı istifadə müddəti ərzində xərclərə silinməsi prosesidir. Düzgün metod seçimi həm mühasibat, həm də vergi baxımından əhəmiyyətlidir.</p>
<h2>Düz xətt metodu</h2>
<p>Bu ən geniş yayılmış metoddur. Hər il bərabər məbləğdə amortizasiya hesablanır. Formula: İllik amortizasiya = (İlkin dəyər – Qalıq dəyər) / Faydalı istifadə ili sayı.</p>
<h2>Azalan qalıq metodu</h2>
<p>Bu metodda amortizasiya aktivin balans dəyərindən faiz olaraq hesablanır. İlk illərdə daha yüksək amortizasiya yazılır, sonrakı illərdə azalır. Bu metod vergi planlaşdırması üçün üstündür — vergi yükü gələcəyə köçürülür.</p>
<h2>İstehsal həcmi metodu</h2>
<p>Amortizasiya aktivin istehsalda iştirak payına görə hesablanır. Məsələn, avadanlıq 100.000 ədəd məhsul üçün nəzərdə tutulubsa, hər məhsul üçün dəyərin 1/100.000 hissəsi silinir. Bu metod istehsal həcminin dəyişkən olduğu müəssisələr üçün əlverişlidir.</p>
<h2>Vergi uçotunda amortizasiya</h2>
<p>Azərbaycanda vergi məqsədləri üçün aşağıdakı amortizasiya normativləri tətbiq edilir: binalar — 7%, maşın və avadanlıqlar — 25%, nəqliyyat vasitələri — 25%, kompüter texnikası — 25%, qeyri-maddi aktivlər — 10%.</p>
<h2>MHBS vs. Vergi uçotu fərqləri</h2>
<p>Mühasibat (MHBS) uçotundakı amortizasiya məbləği vergi uçotundakıdan fərqli ola bilər. Bu fərq gecikmə vergisi aktivi/öhdəliyinin yaranmasına səbəb olur ki, bu da mühasib tərəfindən izlənilməlidir.</p>`,
        en: `<p>Depreciation of fixed assets is the process of writing off their value over their useful life to expenses. Choosing the right method is important both from an accounting and tax perspective.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80", alt: { az: "Amortizasiya", en: "Depreciation" }, width: 900, height: 600 },
      categoryId: byCatName("Mühasibatlıq")?.id ?? categories[0].id,
      tags: ["Amortizasiya", "Əsas vəsaitlər", "Mühasibatlıq"],
      featured: false,
      readingMinutes: 6,
      publishedAt: ts(8),
    },
    {
      title: { az: "Transfer qiymətləndirilməsi: Bağlı şirkətlər arasında əməliyyatlar üçün vergi riski", en: "Transfer Pricing: Tax Risk for Transactions Between Related Companies" },
      slug: { az: "transfer-qiymetlendirmesi-bagli-sirketler", en: "transfer-pricing-related-companies-tax-risk" },
      excerpt: { az: "Qrup şirkətləri arasında əməliyyatlarda transfer qiymətləndirilməsi qaydalarına riayət etmək vacibdir. Bu sahədə ən çox rast gəlinən risklər nələrdir?", en: "Compliance with transfer pricing rules is critical in transactions between group companies. What are the most common risks in this area?" },
      contentHtml: {
        az: `<p>Transfer qiymətləndirilməsi (Transfer Pricing) bağlı tərəflər arasında mal, xidmət və ya qeyri-maddi aktivlərin satışında tətbiq edilən qiymətlərdir. Bu qiymətlər bazar şərtlərini əks etdirməlidir.</p>
<h2>Azhi prinsipi</h2>
<p>"Azhi prinsipi" (Arm's length principle) transfer qiymətləndirilməsinin əsasını təşkil edir. Bu prinsipə görə, bağlı tərəflər arasındakı əməliyyatlardakı qiymətlər müstəqil tərəflər arasında bərabər şərtlər altında müəyyənləşəcək qiymətlərə uyğun olmalıdır.</p>
<h2>Azərbaycanda transfer qiymətləndirilməsi qaydaları</h2>
<p>Vergi Məcəlləsinin 14-cü maddəsinə əsasən, vergi orqanları bağlı tərəflər arasındakı əməliyyatların qiymətlərini yenidən müəyyənləşdirə bilər. Bu yenidən müəyyənləşdirmə ardıcıl üç üsuldan biri ilə həyata keçirilir.</p>
<h2>Risk sahələri</h2>
<p>Aşağıdakı əməliyyatlar yüksək risk daşıyır: xidmət haqları (menecment fee), royalti ödənişləri, qrup daxili kreditlər, xammal alışı/satışı. Bu əməliyyatlar üçün bazar qiymətlərini təsdiqləyən sənədlər saxlanılmalıdır.</p>
<h2>Cəzalar</h2>
<p>Transfer qiymətləndirilməsi qaydalarının pozulması ciddi maliyyə sanksiyalarına səbəb ola bilər. Azaldılmış vergi məbləğinin 40%-i həcmində cərimə tətbiq edilə bilər.</p>`,
        en: `<p>Transfer pricing refers to prices applied in the sale of goods, services, or intangible assets between related parties. These prices must reflect market conditions.</p>`
      },
      coverImage: { url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80", alt: { az: "Transfer qiymətləndirilməsi", en: "Transfer pricing" }, width: 900, height: 600 },
      categoryId: byCatName("Vergi")?.id ?? categories[0].id,
      tags: ["Transfer qiymətləndirilməsi", "Beynəlxalq vergi", "Korporativ"],
      featured: false,
      readingMinutes: 7,
      publishedAt: ts(9),
    },
  ];

  let created = 0;
  const errors: string[] = [];

  for (const a of ARTICLES) {
    try {
      const ref = adminDb.collection("articles").doc();
      await ref.set({
        ...a,
        status: "published",
        views: 0,
        aiSummary: {},
        seo: {
          metaTitle: a.title,
          metaDescription: a.excerpt,
        },
        authorId: "seed",
        publishedAt: a.publishedAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      created++;
    } catch (e) {
      errors.push(String(e));
    }
  }

  return NextResponse.json({ ok: true, created, errors });
}
