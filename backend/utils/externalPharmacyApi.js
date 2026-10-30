const https = require('https');

/**
 * Teryak Platform - External Pharmacy API Integration Service
 * Connects to:
 * 1. OpenFDA Drug API (U.S. Food & Drug Administration) for authentic medicines, painkillers & medical ointments
 * 2. Open Skincare & Beauty API (DummyJSON) for creams, ointments, lotions, serums & personal care
 * 3. Curated Authentic Egyptian & Arab Pharmacy Registry for local brands (Mebo, Fucidin, Panthenol, Panadol, Brufen...)
 */

function fetchJson(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(6500, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Curated authentic pharmacy database for top regional medicines & ointments
 */
const CURATED_PHARMACY_PRODUCTS = [
  // --- مراهم وكريمات (Ointments & Creams) ---
  {
    nameAr: 'ميبو مرهم لعلاج الحروق والجروح',
    nameEn: 'MEBO Burn & Wound Ointment',
    activeIngredient: 'بيتا سيتوستيرول + زيت سمسم + شمع عسل (Beta-Sitosterol)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: 'أنبوبة 30 جم',
    price: 85.0,
    manufacturer: 'Julphar Gulf Pharmaceutical',
    description: 'المرهم العشبي الأشهر لعلاج الحروق السطحية والعميقة، الجروح وتجديد خلايا وأنسجة الجلد بدون ندبات.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'فيوسيدين مرهم مضاد حيوي موضعي',
    nameEn: 'Fucidin 2% Ointment',
    activeIngredient: 'حمض الفوسيديك (Sodium Fusidate 2%)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '20 جم',
    price: 45.0,
    manufacturer: 'LEO Pharma / MinaPharm',
    description: 'مرهم مضاد حيوي فعال لعلاج الدمامل، حب الشباب، العدوى البكتيرية الجلدية والتهابات ما بعد الحلاقة والجروح.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'فيوسيكورت كريم مضاد حيوي مع كورتيزون',
    nameEn: 'Fucicort Cream',
    activeIngredient: 'Fusidic Acid 2% + Betamethasone 0.1%',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '15 جم',
    price: 58.0,
    manufacturer: 'LEO Pharma / MinaPharm',
    description: 'كريم مزدوج المفعول لعلاج الإكزيما الحادة، الحكة الجلدية الشديدة، والالتهابات المصحوبة بعدوى بكتيرية.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: true,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'بانثينول كريم مرطب وملطف للجلد',
    nameEn: 'Panthenol 2% Cream',
    activeIngredient: 'دي-بانثينول (Pro-Vitamin B5 2%)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '50 جم',
    price: 25.0,
    manufacturer: 'El Nile Co. for Pharmaceuticals',
    description: 'كريم طبي مرطب عميق للوجه والجسم، يساعد على التئام تشققات الكعبين وحروق الشمس والتهابات الحفاضات.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'بيبانثين كريم مرطب ومجدد للبشرة',
    nameEn: 'Bepanthen Moisturizing Cream',
    activeIngredient: 'ديكسبانثينول (Dexpanthenol 5%)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '30 جم',
    price: 95.0,
    manufacturer: 'Bayer Healthcare',
    description: 'كريم طبي مرطب للبشرة الجافة والمتهيجة، يعيد بناء الحاجز الواقي للجلد ويحافظ على النضارة والترطيب.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'كيناكومب كريم لعلاج التسلخات والالتهابات',
    nameEn: 'Kenacomb Cream',
    activeIngredient: 'تريامسينولون + نيومايسين + جراميسيدين + نيستاتين',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '15 جم',
    price: 36.0,
    manufacturer: 'SmithKline Beecham / Aspen',
    description: 'تركيبة رباعية مضادة للفطريات والبكتيريا والحكة لعلاج تسلخات الجلد وحساسية الثنايا والالتهابات.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'هيموكلار مرهم للكدمات والتجمعات الدموية',
    nameEn: 'Hemoclar 0.5% Ointment',
    activeIngredient: 'بنتوزان بولي سلفات الصوديوم (Pentosan Polysulfate)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '40 جم',
    price: 38.0,
    manufacturer: 'Sanofi Aventis',
    description: 'مرهم فعال لإذابة الكدمات والتجمعات الدموية تحت الجلد الناتجة عن الصدمات والحقن وتسكين آلام الرضوض.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'فولتارين إيمولجل مسكن موضعي لآلام العضلات والمفاصل',
    nameEn: 'Voltaren Emulgel 1.16%',
    activeIngredient: 'ديكلوفيناك داي إيثيل أمين (Diclofenac Diethylamine)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '50 جم',
    price: 65.0,
    manufacturer: 'GSK / Novartis Consumer Health',
    description: 'جل مسكن سريع الامتصاص لتخفيف آلام الظهر، الرقبة، تشنج العضلات والتهاب الأوتار والمفاصل.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'ريباريل جل إن لعلاج التورم والالتهابات',
    nameEn: 'Reparil-Gel N',
    activeIngredient: 'إيسين + داي إيثيل أمين ساليسيلات (Aescin + DEAS)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '40 جم',
    price: 42.0,
    manufacturer: 'Madaus / CID Egypt',
    description: 'جل مهدئ ومضاد للتورم والارتشاح بعد الإصابات الرياضية والكدمات وعلاج آلام الدوالي السطحية.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'بيتادين مرهم مطهر ومضاد للبكتيريا',
    nameEn: 'Betadine 10% Antiseptic Ointment',
    activeIngredient: 'بوفيدون يود (Povidone Iodine 10%)',
    category: 'مراهم وكريمات',
    dosageForm: 'مرهم / كريم',
    concentration: '20 جم',
    price: 32.0,
    manufacturer: 'Mundipharma / Nile',
    description: 'مرهم مطهر واسع المدى للجروح والحروق السطحية والتقرحات لمنع وعلاج العدوى الميكروبية.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },

  // --- مسكنات وخافض حرارة (Painkillers & Analgesics) ---
  {
    nameAr: 'بانادول إكسترا أقراص مسكن وخافض حرارة',
    nameEn: 'Panadol Extra Tablets',
    activeIngredient: 'باراسيتامول 500 مجم + كافيين 65 مجم',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'أقراص',
    concentration: '500 مجم / 65 مجم (24 قرص)',
    price: 45.0,
    manufacturer: 'GlaxoSmithKline (GSK)',
    description: 'مسكن قوي وسريع المفعول لآلام الصداع النصفي، آلام الأسنان، أوجاع العضلات وخفض درجة الحرارة.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'كاتافلام 50 مجم أقراص مسكن ومضاد للالتهاب',
    nameEn: 'Cataflam 50mg Tablets',
    activeIngredient: 'ديكلوفيناك بوتاسيوم 50 مجم',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'أقراص',
    concentration: '50 مجم (20 قرص)',
    price: 52.0,
    manufacturer: 'Novartis Egypt',
    description: 'مسكن قوي لآلام المفاصل، الصداع الحاد، التهاب الأسنان، وآلام الدورة الشهرية والمغص الحاد.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'بروفين 400 مجم أقراص مسكن ومضاد للروماتيزم',
    nameEn: 'Brufen 400mg Tablets',
    activeIngredient: 'إيبوبروفين 400 مجم (Ibuprofen)',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'أقراص',
    concentration: '400 مجم (30 قرص)',
    price: 49.0,
    manufacturer: 'Abbott / Kahira Pharm',
    description: 'مسكن وخافض حرارة ومضاد للالتهاب لعلاج آلام العظام، الأسنان، الصداع وآلام الحلق والبرد.',
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'كيتوفان 50 مجم كبسولات مسكن قوي',
    nameEn: 'Ketofan 50mg Capsules',
    activeIngredient: 'كيتوبروفين 50 مجم (Ketoprofen)',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'كبسولات',
    concentration: '50 مجم (20 كبسولة)',
    price: 30.0,
    manufacturer: 'Amoun Pharmaceutical Co.',
    description: 'مسكن ومضاد للالتهابات مسكن لآلام النقرس، المفاصل، المغص الكلوي وآلام العمود الفقري.',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'كيتولاك أمبولات حقن مسكن فوري شديد المفعول',
    nameEn: 'Ketolac 30mg Ampoules',
    activeIngredient: 'كيتورولاك تروميثامين 30 مجم (Ketorolac Tromethamine)',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'حقن',
    concentration: '30 مجم / 2 مل (5 أمبولات)',
    price: 36.0,
    manufacturer: 'Amriya Pharm',
    description: 'مسكن غير ستيرويدي فائق القوة للسيطرة على الآلام الحادة بعد الجراحة ونوبات المغص الكلوي الشديد.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: true,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'أسبرين بروتكت 100 مجم لحماية القلب والسيولة',
    nameEn: 'Aspirin Protect 100mg Gastro-Resistant',
    activeIngredient: 'حمض أسيتيل ساليسيليك (Acetylsalicylic Acid 100mg)',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'أقراص',
    concentration: '100 مجم (30 قرص)',
    price: 28.0,
    manufacturer: 'Bayer Healthcare',
    description: 'أقراص مغلفة معوياً للحماية القلبية والوقاية من الجلطات الدماغية والقلبية وزيادة سيولة الدم.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },

  // --- مضادات حيوية (Antibiotics) ---
  {
    nameAr: 'أوجمنتين 1 جم أقراص مضاد حيوي واسع المجال',
    nameEn: 'Augmentin 1g Tablets',
    activeIngredient: 'أموكسيسيلين 875 مجم + حمض كلافولانات 125 مجم',
    category: 'مضادات حيوية',
    dosageForm: 'أقراص',
    concentration: '1000 مجم (14 قرص)',
    price: 130.0,
    manufacturer: 'GSK / MUP',
    description: 'المضاد الحيوي الأشهر لعلاج التهابات الجهاز التنفسي والجيوب الأنفية والمسالك البولية والأسنان.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: true,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'كيورام 1 جم أقراص مضاد حيوي',
    nameEn: 'Curam 1g Tablets',
    activeIngredient: 'Amoxicillin + Clavulanic Acid 1000mg',
    category: 'مضادات حيوية',
    dosageForm: 'أقراص',
    concentration: '1 جم (12 قرص)',
    price: 105.0,
    manufacturer: 'Sandoz / Novartis',
    description: 'بديل مكافئ للأوجمنتين عالي الفاعلية في القضاء على البكتيريا المقاومة والتهابات الأذن والحلق.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: true,
    source: 'Teryak Pharmacy Registry'
  },

  // --- أدوية البرد والحساسية ---
  {
    nameAr: 'كونجستال أقراص لنزلات البرد والإنفلونزا',
    nameEn: 'Congestal Tablets',
    activeIngredient: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'أدوية البرد والحساسية',
    dosageForm: 'أقراص',
    concentration: '20 قرص',
    price: 35.0,
    manufacturer: 'Sigma Pharmaceuticals',
    description: 'علاج متكامل لأعراض الرشح والزكام وانسداد الأنف والصداع وارتفاع الحرارة.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'أوتريفين 0.1% بخاخ أنف سريع الفاعلية',
    nameEn: 'Otrivin 0.1% Nasal Spray',
    activeIngredient: 'زيلوميتازولين (Xylometazoline Hydrochloride 0.1%)',
    category: 'أدوية البرد والحساسية',
    dosageForm: 'بخاخ',
    concentration: '10 مل',
    price: 25.0,
    manufacturer: 'GSK Egypt',
    description: 'بخاخ مزيل للاحتقان يفتح مجرى التنفس المسدود خلال دقيقتين ويستمر مفعوله حتى 12 ساعة.',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },

  // --- عناية بالبشرة وتجميل (Skincare & Beauty) ---
  {
    nameAr: 'غسول سيرافي المنظف الرغوي للبشرة 236 مل',
    nameEn: 'CeraVe Foaming Facial Cleanser 236ml',
    activeIngredient: '3 سيراميدات أساسية + حمض الهيالورونيك + نياسيناميد',
    category: 'عناية بالبشرة',
    dosageForm: 'غسول / جل',
    concentration: '236 مل',
    price: 320.0,
    manufacturer: 'CeraVe / L\'Oreal',
    description: 'غسول رغوي طبي ينظف ويزيل الدهون الزائدة والشوائب مع حماية الحاجز الطبيعي للبشرة.',
    image: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'لاروش بوزيه إيفاكلار جل غسول منقي للبشرة 200 مل',
    nameEn: 'La Roche-Posay Effaclar Purifying Gel 200ml',
    activeIngredient: 'زنك بي سي إيه + مياه الينابيع الحرارية الملطفة',
    category: 'عناية بالبشرة',
    dosageForm: 'غسول / جل',
    concentration: '200 مل',
    price: 380.0,
    manufacturer: 'La Roche-Posay France',
    description: 'جل منظف عميق للبشرة المعرضة للحبوب ينقي المسام ويقلل اللمعان بدون جفاف.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  },
  {
    nameAr: 'واقي شمس فيشي كابيتال سوليل لمسة جافة SPF 50+',
    nameEn: 'Vichy Capital Soleil Mattifying Face Dry Touch SPF50+',
    activeIngredient: 'فلاتر حماية واسعة الطيف + مياه فيشي البركانية',
    category: 'عناية بالبشرة',
    dosageForm: 'مرهم / كريم',
    concentration: '50 مل',
    price: 450.0,
    manufacturer: 'Vichy Laboratories France',
    description: 'واقي شمس لمسة جافة غير لامعة ومضاد للماء يوفر حماية فائقة من الأشعة فوق البنفسجية.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
    requiresPrescription: false,
    source: 'Teryak Pharmacy Registry'
  }
];

/**
 * Fetch and map live drugs from OpenFDA API
 */
async function fetchOpenFdaMedicines(query = '', category = '', limit = 10) {
  try {
    let searchTerm = 'openfda.product_type:"HUMAN+OTC+DRUG"+OR+openfda.product_type:"HUMAN+PRESCRIPTION+DRUG"';

    const cleanQuery = (query || '').trim().toLowerCase();
    const cleanCat = (category || '').trim().toLowerCase();

    if (cleanCat.includes('مرهم') || cleanCat.includes('كريم') || cleanCat.includes('ointment') || cleanCat.includes('cream')) {
      searchTerm = 'dosage_and_administration:ointment+OR+dosage_and_administration:cream+OR+openfda.substance_name:hydrocortisone';
    } else if (cleanCat.includes('مسكن') || cleanCat.includes('pain') || cleanCat.includes('analgesic')) {
      searchTerm = 'openfda.substance_name:ibuprofen+OR+openfda.substance_name:paracetamol+OR+openfda.substance_name:aspirin+OR+openfda.substance_name:naproxen';
    }

    if (cleanQuery) {
      searchTerm = `openfda.brand_name:"${encodeURIComponent(cleanQuery)}"+OR+openfda.generic_name:"${encodeURIComponent(cleanQuery)}"+OR+openfda.substance_name:"${encodeURIComponent(cleanQuery)}"`;
    }

    const url = `https://api.fda.gov/drug/label.json?search=${searchTerm}&limit=${Math.min(limit, 15)}`;
    const data = await fetchJson(url);

    if (!data || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item, index) => {
      const brand = item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || 'دواء مسجل عالمياً';
      const generic = item.openfda?.generic_name?.[0] || item.openfda?.substance_name?.[0] || 'Active Substance';
      const manufacturer = item.openfda?.manufacturer_name?.[0] || 'معتمد دولياً (FDA)';
      const purpose = item.purpose?.[0] || item.indications_and_usage?.[0]?.slice(0, 160) || 'علاج دوائي معتمد من هيئة الغذاء والدواء الأمريكية.';
      
      const isTopical = (item.dosage_and_administration?.[0] || '').toLowerCase().includes('cream') ||
                        (item.dosage_and_administration?.[0] || '').toLowerCase().includes('ointment') ||
                        (brand + generic).toLowerCase().includes('cream') ||
                        (brand + generic).toLowerCase().includes('ointment');

      const isPainkiller = (brand + generic + purpose).toLowerCase().includes('pain') ||
                           (brand + generic).toLowerCase().includes('ibuprofen') ||
                           (brand + generic).toLowerCase().includes('paracetamol') ||
                           (brand + generic).toLowerCase().includes('aspirin');

      let resolvedCategory = isTopical ? 'مراهم وكريمات' : (isPainkiller ? 'مسكنات وخافض حرارة' : 'أدوية عامة');
      let dosageForm = isTopical ? 'مرهم / كريم' : 'أقراص';
      let image = isTopical 
        ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

      return {
        id: `fda_${item.id || index}_${Date.now()}`,
        nameAr: `${brand} (${generic})`,
        nameEn: `${brand} - ${generic}`,
        activeIngredient: generic,
        category: resolvedCategory,
        dosageForm,
        concentration: 'معياري',
        price: 35 + ((index * 13) % 85),
        manufacturer,
        description: purpose,
        image,
        requiresPrescription: Boolean(item.openfda?.product_type?.[0]?.includes('PRESCRIPTION')),
        source: 'OpenFDA API (U.S. FDA)'
      };
    });
  } catch (err) {
    console.warn('[OpenFDA] Error querying FDA drug registry:', err.message);
    return [];
  }
}

/**
 * Fetch and map live Skincare & Creams from DummyJSON API
 */
async function fetchSkincareCreams(query = '', limit = 10) {
  try {
    const [skinCareData, beautyData] = await Promise.all([
      fetchJson('https://dummyjson.com/products/category/skin-care?limit=15'),
      fetchJson('https://dummyjson.com/products/category/beauty?limit=10')
    ]);

    const combined = [
      ...(skinCareData?.products || []),
      ...(beautyData?.products || [])
    ];

    let filtered = combined;
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = combined.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      );
    }

    return filtered.slice(0, limit).map((p, index) => {
      const isCream = (p.title + ' ' + p.description).toLowerCase().includes('cream') || 
                      (p.title + ' ' + p.description).toLowerCase().includes('moistur') ||
                      (p.title + ' ' + p.description).toLowerCase().includes('balm');

      return {
        id: `skincare_${p.id}`,
        nameAr: `${p.title} (مستحضر عناية وترطيب)`,
        nameEn: p.title,
        activeIngredient: p.brand ? `تركيبة ${p.brand} للعناية` : 'مركبات ترطيب طبيعية',
        category: isCream ? 'مراهم وكريمات' : 'عناية بالبشرة',
        dosageForm: isCream ? 'مرهم / كريم' : 'سيروم / غسول',
        concentration: p.weight ? `${p.weight} جم` : 'عبوة قياسية',
        price: Math.round(Number(p.price || 15) * 45), // Convert USD to approximate EGP
        manufacturer: p.brand || 'ماركة عالمية',
        description: p.description || 'مستحضر صيدلي مرطب ومغذي للبشرة.',
        image: p.thumbnail || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        requiresPrescription: false,
        source: 'Open Skincare API'
      };
    });
  } catch (err) {
    console.warn('[Skincare API] Error querying skincare database:', err.message);
    return [];
  }
}

/**
 * Unified Search across OpenFDA, Skincare API, and Curated Registry
 */
async function searchUnifiedPharmacyApi({ query = '', category = 'all', limit = 20 } = {}) {
  const cleanQ = (query || '').trim().toLowerCase();
  const cleanCat = (category || '').trim();

  // 1. Filter Curated Regional Products
  let localMatches = CURATED_PHARMACY_PRODUCTS;
  if (cleanCat && cleanCat !== 'all' && cleanCat !== 'الكل') {
    localMatches = localMatches.filter(p => 
      p.category.toLowerCase().includes(cleanCat.toLowerCase()) ||
      (cleanCat.includes('مرهم') && p.dosageForm.includes('مرهم'))
    );
  }

  if (cleanQ) {
    const tokens = cleanQ.split(/\s+/).filter(Boolean);
    localMatches = localMatches.filter(p => {
      const target = `${p.nameAr} ${p.nameEn} ${p.activeIngredient} ${p.category} ${p.dosageForm}`.toLowerCase();
      return tokens.every(t => target.includes(t));
    });
  }

  // 2. Fetch live data from OpenFDA & Skincare APIs concurrently
  const [fdaResults, skincareResults] = await Promise.all([
    fetchOpenFdaMedicines(cleanQ, cleanCat, 10),
    fetchSkincareCreams(cleanQ, 10)
  ]);

  // 3. Assemble and rank
  let combined = [...localMatches];

  // If user searched for creams/ointments or general, append skincare creams
  if (!cleanCat || cleanCat === 'all' || cleanCat.includes('مرهم') || cleanCat.includes('كريم') || cleanCat.includes('عناية')) {
    combined.push(...skincareResults);
  }

  // If user searched for painkillers or general, append OpenFDA
  if (!cleanCat || cleanCat === 'all' || cleanCat.includes('مسكن') || cleanCat.includes('مرهم') || cleanCat.includes('دواء')) {
    combined.push(...fdaResults);
  }

  // Filter combined if specific category
  if (cleanCat && cleanCat !== 'all' && cleanCat !== 'الكل') {
    combined = combined.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pForm = (p.dosageForm || '').toLowerCase();
      if (cleanCat.includes('مرهم') || cleanCat.includes('كريم')) {
        return pCat.includes('مرهم') || pCat.includes('كريم') || pForm.includes('مرهم') || pForm.includes('كريم');
      }
      if (cleanCat.includes('مسكن')) {
        return pCat.includes('مسكن');
      }
      if (cleanCat.includes('مضاد')) {
        return pCat.includes('مضاد');
      }
      if (cleanCat.includes('عناية') || cleanCat.includes('بشرة')) {
        return pCat.includes('عناية') || pCat.includes('بشرة') || pCat.includes('تجميل');
      }
      return pCat.includes(cleanCat.toLowerCase());
    });
  }

  // Deduplicate by nameAr / nameEn
  const seen = new Set();
  const deduped = [];
  for (const item of combined) {
    const key = (item.nameAr || item.nameEn || '').toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
    if (deduped.length >= limit) break;
  }

  return deduped;
}

module.exports = {
  CURATED_PHARMACY_PRODUCTS,
  fetchOpenFdaMedicines,
  fetchSkincareCreams,
  searchUnifiedPharmacyApi
};

