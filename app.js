var lang = 'en';

// Cami chat is launching later. When false: tab shows a "Coming soon" placeholder,
// all per-surface "Ask Cami" CTAs are hidden, and the tutorial skips the Cami step.
// Flip to true to bring the chat back.
var CAMI_AVAILABLE = false;

var LANGUAGES = [
  {code:'en', native:'English',           flagIcon:'flagUS',    fullyTranslated:true},
  {code:'es', native:'Español',           flagIcon:'flagWorld', fullyTranslated:true}
  // v1 ships EN/ES only. The zh/vi/tl/ht/ar beta entries rendered "undefined" on
  // untranslated surfaces (paywall, FAQ, journeys) — restore only with full coverage.
];

// Returns an inline SVG string for the given country code's flag.
function flagSVG(countryCode, size){
  size = size || 24;
  var map = {
    'Mexico':'flagMX', 'India':'flagIN', 'China':'flagCN',
    'Philippines':'flagPH', 'Vietnam':'flagVN', 'USA':'flagUS', 'United States':'flagUS',
    'Other':'flagWorld'
  };
  var name = map[countryCode] || 'flagWorld';
  return iconSVG(name, '#1d1d22', size);
}

function langInfo(code){
  for(var i=0;i<LANGUAGES.length;i++) if(LANGUAGES[i].code === (code||lang)) return LANGUAGES[i];
  return LANGUAGES[0];
}

// Time-of-day-aware greeting in each supported language.
var GREETINGS = {
  en: {morning: 'Good morning',   afternoon: 'Good afternoon',     evening: 'Good evening'},
  es: {morning: 'Buenos días',    afternoon: 'Buenas tardes',      evening: 'Buenas noches'},
  zh: {morning: '早上好',          afternoon: '下午好',              evening: '晚上好'},
  vi: {morning: 'Chào buổi sáng', afternoon: 'Chào buổi chiều',   evening: 'Chào buổi tối'}
};

function getGreeting(){
  var hour = new Date().getHours();
  var period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  var g = GREETINGS[lang] || GREETINGS.en;
  return g[period];
}

function updateGreeting(){
  var el = document.getElementById('heroGreeting');
  if(el) el.textContent = getGreeting();
}

// The user's non-English preference (set in onboarding / Me tab). The hero toggle
// flips between EN and this. Defaults to 'es' for backwards compatibility.
function preferredNonEnLang(){
  if(user && user.preferredLang && user.preferredLang !== 'en'){
    if(GREETINGS[user.preferredLang]) return user.preferredLang;
  }
  // If the current lang itself is non-EN, that's their preference
  if(lang && lang !== 'en' && GREETINGS[lang]) return lang;
  return 'es';
}

function renderHeroLang(){
  var el = document.getElementById('heroLang');
  if(!el) return;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'Language');
  var pref = preferredNonEnLang();
  var prefInfo = langInfo(pref);
  var prefLabel = pref.toUpperCase();
  el.innerHTML = ''
    + '<button class="'+(lang==='en'?'on':'')+'" onclick="setLang(\'en\',this)" aria-pressed="'+(lang==='en'?'true':'false')+'" aria-label="English">EN</button>'
    + '<button class="'+(lang===pref?'on':'')+'" onclick="setLang(\''+pref+'\',this)" aria-pressed="'+(lang===pref?'true':'false')+'" aria-label="'+prefInfo.native+'" title="'+prefInfo.native+'">'+prefLabel+'</button>';
}

// ===== ZH + VI TRANSLATION OVERRIDES =====
// Translations for civics Unit 1, stage names, and key UI strings.
// Units 2-4 + N-400 walkthrough fall back to English via backfillTranslations().
var TRANSLATIONS = {
  zh: {
    civics_q: {
      p1:'美国的最高法律是什么？',
      p2:'宪法的作用是什么？',
      p3:'宪法的前三个字体现了自治的理念。这三个字是什么？',
      p4:'什么是修正案？',
      p5:'我们把宪法的前十条修正案称为什么？',
      r1:'什么是法治？',
      r2:'《第一修正案》中的一项权利或自由是什么？',
      r3:'什么是宗教自由？',
      r4:'美国的经济体制是什么？',
      r5:'什么能防止政府的某一分支变得过于强大？',
      c1:'"我们人民"是什么意思？',
      c2:'宪法是哪一年写成的？',
      c3:'谁被称为"国父"？',
      c4:'宪法的序言叫什么？',
      c5:'说出宪法做的一件事。',
      t1:'政府的一个分支或部分是什么？',
      t2:'谁制定联邦法律？',
      t3:'美国国会的两个部分是什么？',
      t4:'谁是军队的总司令？',
      t5:'谁否决法案？',
      rf1:'《独立宣言》中的两项权利是什么？',
      rf2:'仅属于美国公民的责任是什么？',
      rf3:'说出仅属于美国公民的一项权利。',
      rf4:'成为美国公民时你做出的一个承诺是什么？',
      rf5:'居住在美国的每个人都有的两项权利是什么？'
    },
    civics_opts: {
      p1:['宪法','独立宣言','权利法案','联邦法规'],
      p2:['建立政府并保护基本权利','列出所有美国法律','为每位总统命名','设定所得税率'],
      p3:['我们人民','为了形成','人民的','由人民'],
      p4:['对宪法的修改或补充','联邦法院的裁决','总统令','一种税'],
      p5:['权利法案','宣言','条款','序言'],
      r1:['每个人都必须遵守法律,包括领导人','只有公民遵守法律','警察制定所有法律','只有法官遵守法律'],
      r2:['言论自由','投票权','政府工作','免费旅行'],
      r3:['你可以信奉任何宗教,或不信奉任何宗教','每个人都必须去教堂','只允许一种宗教','宗教必须由国会批准'],
      r4:['资本主义/市场经济','社会主义经济','计划经济','物物交换经济'],
      r5:['制衡/三权分立','只有总统','全国投票','军队'],
      c1:['自治 — 人民管理自己','只有富人统治','外国统治者统治','无人统治'],
      c2:['1787','1776','1812','1865'],
      c3:['乔治·华盛顿','亚伯拉罕·林肯','托马斯·杰斐逊','本杰明·富兰克林'],
      c4:['序言','前言','权利法案','索引'],
      c5:['保护基本权利','设定州界','选择国定假日','为学校命名'],
      t1:['国会(立法)','你所在州的最高法院','车辆管理局','联合国'],
      t2:['国会','只有总统','最高法院','州长'],
      t3:['参议院和众议院','参议院和最高法院','总统和副总统','联邦和州'],
      t4:['总统','一位将军','众议院议长','首席大法官'],
      t5:['总统','国会','最高法院','副总统'],
      rf1:['生命和自由','投票和驾驶','上学和工作','旅行和贸易'],
      rf2:['担任陪审员','纳税','遵守法律','上公立学校'],
      rf3:['在联邦选举中投票','信仰宗教','言论自由','公正审判'],
      rf4:['放弃对其他国家的效忠','在家只说英语','加入政党','搬到华盛顿特区'],
      rf5:['言论和宗教自由','投票和担任联邦公职','免费大学和住房','免税收入']
    },
    explain: {
      p1:'宪法是美国最高的法律 — 所有其他法律都必须与之一致。',
      p2:'宪法建立了政府,定义了其权力,并列出了基本权利。',
      p3:'"我们人民"开启了序言 — 意味着人民,而不是国王,拥有权力。',
      p4:'修正案是宪法可以被修改的方式。迄今为止共有27条。',
      p5:'前十条修正案 — 权利法案 — 保护个人自由。',
      r1:'没有人凌驾于法律之上 — 总统、国会、警察都不行。',
      r2:'第一修正案保护言论、宗教、出版、集会和请愿。',
      r3:'你可以信奉任何宗教,改变宗教,或完全不信宗教。',
      r4:'在资本主义或市场经济中,企业和个人做出自己的经济选择。',
      r5:'三权分立和制衡防止任何一个分支变得过于强大。',
      c1:'"我们人民"表达了自治 — 公民选择如何被治理。',
      c2:'宪法于1787年写成,1787年9月17日在费城签署。',
      c3:'乔治·华盛顿主持了制宪会议,是美国第一任总统。',
      c4:'序言是开篇段落 — 以"我们人民"开始。',
      c5:'宪法保护基本权利,建立政府,并限制其权力。',
      t1:'三个分支是立法(国会)、行政(总统)和司法(法院)。',
      t2:'国会制定联邦法律。总统签署它们;法院解释它们。',
      t3:'国会由两部分组成:参议院(100名成员)和众议院(435名成员)。',
      t4:'总统是总司令,即使军队由将军们运作。',
      t5:'当总统签署时,法案就成为法律。总统也可以否决。',
      rf1:'《独立宣言》将"生命、自由和追求幸福"列为不可剥夺的权利。',
      rf2:'只有美国公民可以在联邦陪审团任职并在联邦选举中投票。',
      rf3:'在联邦选举中投票仅限于公民 — 非公民不能投票。',
      rf4:'新公民承诺放弃对其他国家的效忠,并捍卫宪法。',
      rf5:'言论和宗教自由适用于在美国生活的每个人,不仅仅是公民。'
    },
    stages: {
      sponsorship:    {name:'已提交担保',           short:'申请',     headline:'担保已在案'},
      'visa-available':{name:'签证可用',             short:'签证',     headline:'你的签证可用了'},
      'aos-interview':{name:'I-485 + 面试',          short:'调整',     headline:'调整面试即将到来'},
      'permanent-resident':{name:'永久居民',         short:'绿卡',     headline:'你是永久居民'},
      'residency-met':{name:'已满5年居住',           short:'5年',      headline:'5年居住期已达到'},
      'file-n400':    {name:'提交N-400表',           short:'申请',     headline:'有资格申请 — 提交N-400'},
      interview:      {name:'生物识别 + 面试',       short:'面试',     headline:'面试准备时间'},
      oath:           {name:'忠诚宣誓',             short:'宣誓',     headline:'距离公民身份还差一步'}
    },
    ui: {
      Today:'今天', Journey:'历程', Learn:'学习', Docs:'文件', Me:'我',
      Continue:'继续', Back:'返回', Next:'下一个', Check:'检查', Finish:'完成',
      Start:'开始', Cancel:'取消', Yes:'是', No:'否', Save:'保存', Exit:'退出'
    }
  },

  vi: {
    civics_q: {
      p1:'Luật tối cao của đất nước là gì?',
      p2:'Hiến pháp làm gì?',
      p3:'Ý tưởng tự quản nằm trong ba từ đầu tiên của Hiến pháp. Đó là gì?',
      p4:'Tu chính án là gì?',
      p5:'Chúng ta gọi mười tu chính án đầu tiên là gì?',
      r1:'Pháp quyền là gì?',
      r2:'Một quyền hay tự do từ Tu chính án thứ nhất là gì?',
      r3:'Tự do tôn giáo là gì?',
      r4:'Hệ thống kinh tế của Hoa Kỳ là gì?',
      r5:'Điều gì ngăn một nhánh chính phủ trở nên quá mạnh?',
      c1:'"Chúng tôi nhân dân" nghĩa là gì?',
      c2:'Hiến pháp được viết vào năm nào?',
      c3:'Ai là "Cha của Tổ quốc"?',
      c4:'Phần mở đầu của Hiến pháp gọi là gì?',
      c5:'Nêu một điều mà Hiến pháp làm.',
      t1:'Một nhánh hoặc bộ phận của chính phủ là gì?',
      t2:'Ai làm luật liên bang?',
      t3:'Hai phần của Quốc hội Hoa Kỳ là gì?',
      t4:'Ai là Tổng tư lệnh của quân đội?',
      t5:'Ai phủ quyết dự luật?',
      rf1:'Hai quyền trong Tuyên ngôn Độc lập là gì?',
      rf2:'Một trách nhiệm chỉ dành cho công dân Hoa Kỳ là gì?',
      rf3:'Nêu một quyền chỉ dành cho công dân Hoa Kỳ.',
      rf4:'Một lời hứa bạn đưa ra khi trở thành công dân Hoa Kỳ là gì?',
      rf5:'Hai quyền của mọi người sống ở Hoa Kỳ là gì?'
    },
    civics_opts: {
      p1:['Hiến pháp','Tuyên ngôn Độc lập','Tuyên ngôn Nhân quyền','Quy định liên bang'],
      p2:['Thiết lập chính phủ và bảo vệ quyền cơ bản','Liệt kê mọi luật của Mỹ','Đặt tên mọi tổng thống','Đặt mức thuế thu nhập'],
      p3:['Chúng tôi nhân dân','Để hình thành','Của nhân dân','Bởi nhân dân'],
      p4:['Một thay đổi hoặc bổ sung cho Hiến pháp','Phán quyết của tòa liên bang','Lệnh tổng thống','Một loại thuế'],
      p5:['Tuyên ngôn Nhân quyền','Tuyên ngôn','Các điều khoản','Lời mở đầu'],
      r1:['Mọi người phải tuân thủ luật, kể cả lãnh đạo','Chỉ công dân tuân thủ luật','Cảnh sát làm tất cả luật','Chỉ thẩm phán tuân thủ luật'],
      r2:['Tự do ngôn luận','Quyền bầu cử','Việc làm chính phủ','Đi lại miễn phí'],
      r3:['Bạn có thể theo bất kỳ tôn giáo nào, hoặc không theo gì','Mọi người phải đi nhà thờ','Chỉ cho phép một tôn giáo','Tôn giáo phải được Quốc hội chấp thuận'],
      r4:['Kinh tế tư bản / thị trường','Kinh tế xã hội chủ nghĩa','Kinh tế chỉ huy','Kinh tế trao đổi'],
      r5:['Kiểm tra và cân bằng / phân chia quyền lực','Chỉ riêng Tổng thống','Bầu cử toàn quốc','Quân đội'],
      c1:['Tự quản — nhân dân tự cai trị','Chỉ người giàu cai trị','Người ngoại quốc cai trị','Không ai cai trị'],
      c2:['1787','1776','1812','1865'],
      c3:['George Washington','Abraham Lincoln','Thomas Jefferson','Benjamin Franklin'],
      c4:['Lời mở đầu','Lời nói đầu','Tuyên ngôn Nhân quyền','Mục lục'],
      c5:['Bảo vệ quyền cơ bản','Đặt biên giới các bang','Chọn ngày lễ quốc gia','Đặt tên trường'],
      t1:['Quốc hội (lập pháp)','Tòa án Tối cao bang của bạn','Sở Quản lý phương tiện cơ giới','Liên Hợp Quốc'],
      t2:['Quốc hội','Chỉ Tổng thống','Tòa án Tối cao','Thống đốc bang'],
      t3:['Thượng viện và Hạ viện','Thượng viện và Tòa án Tối cao','Tổng thống và Phó Tổng thống','Liên bang và Bang'],
      t4:['Tổng thống','Một tướng','Chủ tịch Hạ viện','Chánh án'],
      t5:['Tổng thống','Quốc hội','Tòa án Tối cao','Phó Tổng thống'],
      rf1:['Cuộc sống và tự do','Bầu cử và lái xe','Trường học và việc làm','Đi lại và thương mại'],
      rf2:['Tham gia bồi thẩm đoàn','Đóng thuế','Tuân thủ luật','Đi học trường công'],
      rf3:['Bỏ phiếu trong cuộc bầu cử liên bang','Theo tôn giáo','Tự do ngôn luận','Phiên tòa công bằng'],
      rf4:['Từ bỏ lòng trung thành với nước khác','Chỉ nói tiếng Anh ở nhà','Tham gia đảng phái','Chuyển đến Washington, D.C.'],
      rf5:['Tự do ngôn luận và tôn giáo','Bầu cử và giữ chức vụ liên bang','Đại học và nhà ở miễn phí','Thu nhập miễn thuế']
    },
    explain: {
      p1:'Hiến pháp là luật cao nhất ở Mỹ — mọi luật khác phải phù hợp với nó.',
      p2:'Hiến pháp thiết lập chính phủ, xác định quyền hạn của nó và liệt kê các quyền cơ bản.',
      p3:'"Chúng tôi nhân dân" mở đầu Lời mở đầu — nghĩa là nhân dân, không phải vua, nắm giữ quyền lực.',
      p4:'Tu chính án là cách Hiến pháp có thể được thay đổi. Đã có 27 tu chính án.',
      p5:'Mười tu chính án đầu tiên — Tuyên ngôn Nhân quyền — bảo vệ tự do cá nhân.',
      r1:'Không ai đứng trên luật pháp — không phải Tổng thống, không phải Quốc hội, không phải cảnh sát.',
      r2:'Tu chính án thứ nhất bảo vệ ngôn luận, tôn giáo, báo chí, hội họp và kiến nghị.',
      r3:'Bạn có thể theo bất kỳ tôn giáo nào, đổi tôn giáo, hoặc không theo tôn giáo nào cả.',
      r4:'Trong nền kinh tế tư bản hoặc thị trường, doanh nghiệp và mọi người tự đưa ra lựa chọn kinh tế.',
      r5:'Phân chia quyền lực + kiểm tra và cân bằng giữ cho bất kỳ nhánh nào không trở nên quá mạnh.',
      c1:'"Chúng tôi nhân dân" thể hiện sự tự quản — công dân chọn cách họ được cai trị.',
      c2:'Hiến pháp được viết năm 1787 và ký ngày 17 tháng 9 năm 1787 tại Philadelphia.',
      c3:'George Washington chủ trì Hội nghị Lập hiến và là Tổng thống đầu tiên của Hoa Kỳ.',
      c4:'Lời mở đầu là đoạn mở đầu — bắt đầu với "Chúng tôi nhân dân".',
      c5:'Hiến pháp bảo vệ quyền cơ bản, thiết lập chính phủ và giới hạn quyền lực của nó.',
      t1:'Ba nhánh là Lập pháp (Quốc hội), Hành pháp (Tổng thống), và Tư pháp (Tòa án).',
      t2:'Quốc hội viết luật liên bang. Tổng thống ký chúng; tòa án giải thích chúng.',
      t3:'Quốc hội có hai phần: Thượng viện (100 thành viên) và Hạ viện (435 thành viên).',
      t4:'Tổng thống là Tổng tư lệnh, mặc dù quân đội do các tướng chỉ huy.',
      t5:'Một dự luật trở thành luật khi Tổng thống ký. Tổng thống cũng có thể phủ quyết.',
      rf1:'Tuyên ngôn nêu "cuộc sống, tự do và mưu cầu hạnh phúc" là các quyền không thể chuyển nhượng.',
      rf2:'Chỉ công dân Hoa Kỳ có thể tham gia bồi thẩm đoàn liên bang và bỏ phiếu trong các cuộc bầu cử liên bang.',
      rf3:'Bỏ phiếu trong các cuộc bầu cử liên bang chỉ dành cho công dân — người không phải công dân không thể bỏ phiếu.',
      rf4:'Công dân mới hứa từ bỏ lòng trung thành với các nước khác và bảo vệ Hiến pháp.',
      rf5:'Tự do ngôn luận và tôn giáo áp dụng cho mọi người sống ở Mỹ, không chỉ công dân.'
    },
    stages: {
      sponsorship:    {name:'Đã nộp đơn bảo lãnh',      short:'Đơn',       headline:'Đơn bảo lãnh đã được nộp'},
      'visa-available':{name:'Visa có sẵn',              short:'Visa',      headline:'Visa của bạn đã có sẵn'},
      'aos-interview':{name:'I-485 + phỏng vấn',         short:'Điều chỉnh',headline:'Phỏng vấn điều chỉnh sắp tới'},
      'permanent-resident':{name:'Thường trú nhân',      short:'Thẻ xanh',  headline:'Bạn là thường trú nhân'},
      'residency-met':{name:'Đã đủ 5 năm thường trú',    short:'5 năm',     headline:'Đã đạt mốc 5 năm cư trú'},
      'file-n400':    {name:'Nộp Đơn N-400',             short:'Nộp đơn',   headline:'Đủ điều kiện nộp đơn — Đơn N-400'},
      interview:      {name:'Sinh trắc học + phỏng vấn', short:'Phỏng vấn', headline:'Chế độ chuẩn bị phỏng vấn'},
      oath:           {name:'Lễ tuyên thệ',              short:'Tuyên thệ', headline:'Chỉ còn một bước nữa đến quốc tịch'}
    },
    ui: {
      Today:'Hôm nay', Journey:'Hành trình', Learn:'Học', Docs:'Tài liệu', Me:'Tôi',
      Continue:'Tiếp tục', Back:'Quay lại', Next:'Tiếp', Check:'Kiểm tra', Finish:'Hoàn thành',
      Start:'Bắt đầu', Cancel:'Hủy', Yes:'Có', No:'Không', Save:'Lưu', Exit:'Thoát'
    }
  }
};

function applyTranslationOverrides(){
  ['zh','vi'].forEach(function(L){
    var t = TRANSLATIONS[L];
    if(!t) return;

    if(t.civics_q && typeof CIVICS !== 'undefined'){
      Object.keys(t.civics_q).forEach(function(qid){
        var q = findQ(qid);
        if(q && q.q) q.q[L] = t.civics_q[qid];
      });
    }
    if(t.civics_opts && typeof CIVICS !== 'undefined'){
      Object.keys(t.civics_opts).forEach(function(qid){
        var q = findQ(qid);
        if(q && q.options){
          var arr = t.civics_opts[qid];
          for(var i=0;i<arr.length;i++) if(q.options[i]) q.options[i][L] = arr[i];
        }
      });
    }
    if(t.explain && typeof EXPLAIN !== 'undefined'){
      Object.keys(t.explain).forEach(function(qid){
        if(EXPLAIN[qid]) EXPLAIN[qid][L] = t.explain[qid];
      });
    }
    if(t.stages && typeof STAGES !== 'undefined'){
      Object.keys(t.stages).forEach(function(sid){
        var s = null;
        for(var i=0;i<STAGES.length;i++) if(STAGES[i].id === sid){ s = STAGES[i]; break; }
        if(!s) return;
        var entry = t.stages[sid];
        if(entry.name && s.name) s.name[L] = entry.name;
        if(entry.short && s.short) s.short[L] = entry.short;
        if(entry.headline && s.home && s.home.headline) s.home.headline[L] = entry.headline;
      });
    }
  });
}

// Patch every Object's [lang] access to fall back to English if missing.
// Applied to all translation-shaped objects { en, es, ... } at boot.
function backfillTranslations(){
  function tryFill(obj){
    if(obj && typeof obj === 'object' && typeof obj.en === 'string'){
      LANGUAGES.forEach(function(L){ if(obj[L.code] === undefined) obj[L.code] = obj.en; });
      return true;
    }
    return false;
  }
  function walk(node, depth){
    if(depth > 8 || !node) return;
    if(Array.isArray(node)){ node.forEach(function(n){ walk(n, depth+1); }); return; }
    if(typeof node === 'object'){
      if(tryFill(node)) return;
      for(var k in node){ if(node.hasOwnProperty(k)) walk(node[k], depth+1); }
    }
  }
  // Apply on demand; called after all data is defined (at boot).
  if(typeof STAGES !== 'undefined')      walk(STAGES, 0);
  if(typeof CIVICS !== 'undefined')      walk(CIVICS, 0);
  if(typeof LESSONS !== 'undefined')     walk(LESSONS, 0);
  if(typeof EXPLAIN !== 'undefined')     walk(EXPLAIN, 0);
  if(typeof DOC_CATS !== 'undefined')    walk(DOC_CATS, 0);
  if(typeof DOCUMENTS !== 'undefined')   walk(DOCUMENTS, 0);
  if(typeof PROVIDERS !== 'undefined')   walk(PROVIDERS, 0);
  if(typeof UNITS !== 'undefined')       walk(UNITS, 0);
  if(typeof ACHIEVEMENTS !== 'undefined')walk(ACHIEVEMENTS, 0);
  if(typeof N400_SECTIONS !== 'undefined')walk(N400_SECTIONS, 0);
  if(typeof PHASES !== 'undefined')      walk(PHASES, 0);
}

var user = {
  name: 'María',
  greenCardDate: '2020-03-03',
  marriedToCitizen: false,
  currentStageId: 'file-n400',
  onboarded: false,
  dailyMinutes: 5,
  countryOfBirth: 'Other',
  petitionType: null,
  marriageDate: null,
  monthsOutside: 'lt6',
  criminalHistory: false,
  testVersion: '2025',       // '2008' (legacy 100q test) or '2025' (current 128q, 12-of-20 to pass)
  plan: 'free',              // 'free' | 'trial' | 'plus' | 'expired'
  trialStartedAt: null,      // ISO date string
  trialEndsAt: null,         // ISO date string
  planSelected: null,        // 'monthly' | 'annual'
  planRenewsAt: null,        // ISO date string
  mockTestsTodayCount: 0,
  mockTestsTodayDate: null,
  progress: { completedLessons: [], xp: 0, streak: 0, lastLessonDate: null, mastered: 0 },
  documents: {},
  eligibility: null,
  n400Progress: null,
  notifications: { enabled: false, time: '09:00' }
};

var STORAGE_KEY = 'camino.user.v1';
function saveUser(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, user, {lang: lang}))); } catch(e){}
}
function loadUser(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e){ return null; }
}

var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function parseISO(s){ var p=s.split('-'); return new Date(Date.UTC(+p[0], +p[1]-1, +p[2])); }
function today(){ var d=new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
function addYears(d,n){ var x=new Date(d.getTime()); x.setUTCFullYear(x.getUTCFullYear()+n); return x; }
function addDays(d,n){ var x=new Date(d.getTime()); x.setUTCDate(x.getUTCDate()+n); return x; }
function fmtDate(d,l){
  if(typeof d==='string') d=parseISO(d);
  if(l==='es') return d.getUTCDate()+' de '+MONTHS_ES[d.getUTCMonth()]+' de '+d.getUTCFullYear();
  return MONTHS_EN[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear();
}
function residencyYears(u){ return u.marriedToCitizen ? 3 : 5; }
function residencyMark(u){ return addYears(parseISO(u.greenCardDate), residencyYears(u)); }
function earliestFiling(u){ return addDays(residencyMark(u), -90); }
function eligibleNow(u){ return today() >= earliestFiling(u); }

var STAGES = [
  {
    id: 'sponsorship',
    name: {en:'Sponsorship filed', es:'Patrocinio presentado'},
    short: {en:'Petition', es:'Petición'},
    meta: function(u,l,st){
      if(st==='done') return l==='es' ? 'Petición aprobada por USCIS' : 'Petition approved by USCIS';
      return l==='es' ? 'Tu caso está en cola con USCIS' : 'Your case is in line with USCIS';
    },
    home: {
      headline: {en:'Petition is on file', es:'Tu petición está presentada'},
      pill: {en:'Wait time', es:'Tiempo de espera'},
      title: {en:'Track your priority date', es:'Sigue tu fecha de prioridad'},
      sub: function(u,l){
        return l==='es'
          ? 'Tu I-130, I-140 o I-589 está en cola. El tiempo de espera depende de tu categoría y país. Revisa el Boletín de Visas cada mes.'
          : 'Your I-130, I-140, or I-589 is in line. Wait time depends on your category and country. Check the Visa Bulletin each month.';
      },
      cta: {en:'Petition approved', es:'Petición aprobada'}
    },
    upcomingTag: {en:'Step 1', es:'Paso 1'}
  },
  {
    id: 'visa-available',
    name: {en:'Visa available', es:'Visa disponible'},
    short: {en:'Visa', es:'Visa'},
    meta: function(u,l,st){
      if(st==='done') return l==='es' ? 'Fecha de prioridad vigente' : 'Priority date became current';
      return l==='es' ? 'Esperando que tu fecha esté vigente' : 'Waiting for your priority date';
    },
    home: {
      headline: {en:'Your visa is available', es:'Tu visa está disponible'},
      pill: {en:'Action needed', es:'Acción requerida'},
      title: {en:'File I-485 (adjustment of status)', es:'Presenta el I-485 (ajuste de estatus)'},
      sub: function(u,l){
        return l==='es'
          ? 'Tu fecha de prioridad está vigente. Si ya estás en EE.UU., presenta el Formulario I-485. Si estás fuera, procesa en el consulado.'
          : "Your priority date is current. If you're in the U.S., file Form I-485. If you're abroad, process at the consulate.";
      },
      cta: {en:'I filed I-485', es:'Presenté el I-485'}
    },
    upcomingTag: {en:'Up next', es:'Sigue'}
  },
  {
    id: 'aos-interview',
    name: {en:'I-485 + interview', es:'I-485 + entrevista'},
    short: {en:'Adjust', es:'Ajuste'},
    meta: function(u,l,st){
      if(st==='done') return l==='es' ? 'Estatus ajustado a residente' : 'Status adjusted to resident';
      return l==='es' ? 'USCIS revisa tu I-485 y te entrevista' : 'USCIS reviews your I-485 and interviews you';
    },
    home: {
      headline: {en:'Adjustment interview ahead', es:'Entrevista de ajuste pendiente'},
      pill: {en:'Prep time', es:'A prepararse'},
      title: {en:'Gather documents for your interview', es:'Reúne documentos para la entrevista'},
      sub: function(u,l){
        return l==='es'
          ? 'Lleva pasaporte, acta de nacimiento, evidencia de relación o trabajo, y todos los I-94. Una decisión llega después de la entrevista.'
          : 'Bring your passport, birth certificate, relationship or employment evidence, and all I-94 records. A decision follows the interview.';
      },
      cta: {en:'Interview complete', es:'Entrevista terminada'}
    },
    upcomingTag: {en:'Up next', es:'Sigue'}
  },
  {
    id: 'permanent-resident',
    name: {en:'Permanent resident', es:'Residente permanente'},
    short: {en:'Green card', es:'Residencia'},
    meta: function(u,l){ return fmtDate(u.greenCardDate, l); },
    home: {
      headline: {en:"You're a permanent resident", es:'Eres residente permanente'},
      pill: {en:'Track the clock', es:'Cuenta el tiempo'},
      title: {en:'Plan your path to filing', es:'Planifica el camino a aplicar'},
      sub: function(u,l){
        var early = earliestFiling(u);
        return l==='es'
          ? 'Podrás presentar tu N-400 a partir del '+fmtDate(early,'es')+' (90 días antes de los '+residencyYears(u)+' años).'
          : "You'll be eligible to file your N-400 starting "+fmtDate(early,'en')+' (90 days before your '+residencyYears(u)+'-year mark).';
      },
      cta: {en:'Verify my residency clock', es:'Verificar mi reloj de residencia'}
    },
    upcomingTag: {en:'Step 1', es:'Paso 1'}
  },
  {
    id: 'residency-met',
    name: {en:'5-year residency met', es:'5 años de residencia'},
    short: {en:'5 years', es:'5 años'},
    meta: function(u,l,st){
      if(st==='done') return l==='es' ? 'Residencia continua verificada' : 'Continuous residence verified';
      return l==='es' ? 'Llega: '+fmtDate(residencyMark(u),'es') : 'Reaches: '+fmtDate(residencyMark(u),'en');
    },
    home: {
      headline: {en:'5-year mark reached', es:'Alcanzaste los 5 años'},
      pill: {en:'Almost there', es:'Casi listo'},
      title: {en:'You can apply 90 days early', es:'Puedes aplicar 90 días antes'},
      sub: function(u,l){
        var early = earliestFiling(u);
        return l==='es'
          ? 'Fecha más temprana para presentar: '+fmtDate(early,'es')+'.'
          : 'Earliest you can file: '+fmtDate(early,'en')+'.';
      },
      cta: {en:"I'm ready to apply", es:'Estoy listo para aplicar'}
    },
    upcomingTag: {en:'Up next', es:'Sigue'}
  },
  {
    id: 'file-n400',
    name: {en:'File Form N-400', es:'Presentar N-400'},
    short: {en:'Apply', es:'Aplicar'},
    meta: function(u,l){
      var prefix = eligibleNow(u)
        ? (l==='es' ? 'Elegible ahora' : 'Eligible now')
        : (l==='es' ? 'Elegible desde '+fmtDate(earliestFiling(u),'es') : 'Eligible from '+fmtDate(earliestFiling(u),'en'));
      return prefix + (l==='es' ? ' · $760 ($710 en línea) · posible exención' : ' · $760 fee ($710 online) · fee waiver may apply');
    },
    home: {
      headline: {en:'Eligible to apply — file Form N-400', es:'Listo para aplicar — Formulario N-400'},
      pill: {en:'Action needed', es:'Acción requerida'},
      title: {en:'Confirm your eligibility date', es:'Confirma tu fecha de elegibilidad'},
      sub: function(u,l){
        var early = earliestFiling(u);
        return l==='es'
          ? 'Te hiciste residente el '+fmtDate(u.greenCardDate,'es')+'. Puedes presentar el N-400 desde el '+fmtDate(early,'es')+' (90 días antes de los '+residencyYears(u)+' años). Verifiquemos antes de empezar.'
          : 'You became a permanent resident on '+fmtDate(u.greenCardDate,'en')+'. You can file Form N-400 starting '+fmtDate(early,'en')+' (90 days before your '+residencyYears(u)+'-year mark). Let’s verify before you start.';
      },
      cta: {en:'Check my eligibility', es:'Verificar elegibilidad'},
      ctaAction: 'eligibility'
    },
    upcomingTag: {en:'Up next', es:'Sigue'}
  },
  {
    id: 'interview',
    name: {en:'Biometrics + interview', es:'Biométricos + entrevista'},
    short: {en:'Interview', es:'Entrevista'},
    meta: function(u,l){ return l==='es' ? 'Aquí es el examen de cívica e inglés' : 'Civics + English test happens here'; },
    home: {
      headline: {en:'Interview prep mode', es:'Modo preparación'},
      pill: {en:'Prep time', es:'A prepararse'},
      title: {en:'Practice 5 civics questions today', es:'Practica 5 preguntas hoy'},
      sub: function(u,l){ return l==='es'
        ? 'Mantén tu racha — el repaso diario te lleva a las 100 dominadas antes de tu cita.'
        : 'Keep your streak — daily review gets you to 100 mastered before your appointment.'; },
      cta: {en:'I finished my interview', es:'Terminé mi entrevista'}
    },
    upcomingTag: {en:'Up next', es:'Sigue'}
  },
  {
    id: 'oath',
    name: {en:'Oath of Allegiance', es:'Juramento de lealtad'},
    short: {en:'Oath', es:'Juramento'},
    meta: function(u,l){ return l==='es' ? 'Te conviertes en ciudadano 🎉' : 'You become a U.S. citizen 🎉'; },
    home: {
      headline: {en:'One step from citizenship', es:'A un paso de la ciudadanía'},
      pill: {en:'Final step', es:'Paso final'},
      title: {en:'Bring ID, green card, and N-445', es:'Lleva ID, residencia y N-445'},
      sub: function(u,l){ return l==='es'
        ? 'El día del juramento entregas tu residencia y recibes tu certificado de ciudadanía.'
        : 'On oath day you turn in your green card and receive your Certificate of Citizenship.'; },
      cta: {en:'I took the oath 🎉', es:'Hice el juramento 🎉'}
    },
    upcomingTag: {en:'Final', es:'Final'}
  }
];

function stageIndex(id){
  for(var i=0;i<STAGES.length;i++) if(STAGES[i].id===id) return i;
  return -1;
}

// Returns the USCIS form keys relevant at a given stage, tailored to the user's
// petition type. Drives the inline "download the form" chips on each step card.
function formsForStage(stageId, u){
  u = u || user;
  var pet = u && u.petitionType || '';
  switch(stageId){
    case 'sponsorship':
      if(pet === 'employment')                   return ['I-140'];
      if(pet === 'employment-nonimmigrant')      return ['I-129'];
      if(pet === 'asylum')                       return ['I-589'];
      return ['I-130'];
    case 'visa-available':
      // If they're already in the U.S., they file I-485; abroad, DS-260 at consulate
      return (u && u.insideUS === false) ? ['DS-260'] : ['I-485', 'DS-260'];
    case 'aos-interview':
      return ['I-485', 'I-765'];
    case 'permanent-resident':
      // Replacement if lost + remove conditions if 2-year GC from marriage
      var perm = ['I-90'];
      if(u && u.marriedToCitizen) perm.push('I-751');
      return perm;
    case 'residency-met':
      return [];
    case 'file-n400':
      return ['N-400', 'I-912', 'G-1450'];
    case 'interview':
      return ['N-648'];
    case 'oath':
      return [];
  }
  return [];
}

// ===== TIMELINE PROJECTION =====
var ONE_MONTH_MS = 30.44 * 24 * 3600 * 1000;
// Realistic ranges based on current USCIS processing times + Visa Bulletin trends (late 2025).
// Sources: USCIS published processing times; State Dept Visa Bulletin priority dates.
var STAGE_DURATIONS_MO = {
  'visa-available': {low: 3,  high: 8},    // I-485 prep + filing time, biometrics
  'aos-interview':  {low: 12, high: 24},   // USCIS adjustment-of-status interview wait
  'file-n400':      {low: 1,  high: 6},    // doc prep + N-400 filing
  'interview':      {low: 8,  high: 16},   // current N-400 processing
  'oath':           {low: 1,  high: 4}     // oath ceremony scheduling
};

function petitionDuration(p, c){
  // Family — immediate relative of a U.S. citizen (IR-1/2/5): no quota wait, just processing
  if(p === 'family-ir') return {low: 10, high: 20};

  // Family — preference categories (F1/F3/F4) — heavy backlog, varies by country chargeability
  if(p === 'family-pref'){
    if(c === 'Mexico')      return {low: 240, high: 420};   // 20–35 years (F3/F4 especially)
    if(c === 'Philippines') return {low: 168, high: 360};   // 14–30 years
    if(c === 'India')       return {low: 132, high: 240};   // 11–20 years
    if(c === 'China')       return {low: 96,  high: 180};   // 8–15 years
    return {low: 84, high: 180};                            // ~7–15 years for other countries
  }

  // Family — through an LPR (F2A — spouse/minor child of GC holder)
  if(p === 'family-lpr') return {low: 24, high: 60};         // 2–5 years currently

  // Employment-based GC (EB-2/EB-3 dominant cases by country)
  if(p === 'employment'){
    if(c === 'India') return {low: 96, high: 600};            // EB-3 ~8 yrs, EB-2 ~50+ yrs
    if(c === 'China') return {low: 36, high: 120};            // EB-2/3 ~3–10 yrs
    return {low: 14, high: 42};                              // EB-1/2/3 most countries
  }

  // Asylum — I-589 affirmative interview backlog, then 1-yr wait + I-485 processing
  if(p === 'asylum') return {low: 24, high: 84};             // 2–7 years total to GC currently

  // Other (DV winners, VAWA, U-visa)
  return {low: 18, high: 72};
}

function projectTimeline(u){
  u = u || user;
  var curIdx = stageIndex(u.currentStageId);
  if(curIdx < 0) return null;
  var nowMs = today().getTime();
  var lowMs = nowMs, highMs = nowMs;
  var milestones = [];
  for(var i = curIdx; i < STAGES.length; i++){
    var s = STAGES[i];
    var endLow = lowMs, endHigh = highMs;
    if(s.id === 'permanent-resident'){
      // Residency clock: 5 years (or 3 if married to citizen) from when the user actually
      // becomes a permanent resident. For pre-GC users, the stored greenCardDate is a
      // placeholder — the real start of the clock is when AOS finishes (current low/highMs
      // at this point in the projection).
      var curStageIdx = stageIndex(u.currentStageId);
      var hasRealGCDate = u.phase === 'hasGC' || curStageIdx >= stageIndex('permanent-resident');
      var yearsMs = residencyYears(u) * 365.25 * 24 * 3600 * 1000;
      var lowMark, highMark;
      if(hasRealGCDate){
        var stored = residencyMark(u).getTime();
        lowMark = stored;
        highMark = stored;
      } else {
        lowMark = lowMs + yearsMs;
        highMark = highMs + yearsMs;
      }
      endLow = Math.max(lowMs, lowMark);
      endHigh = Math.max(highMs, highMark);
    } else if(s.id === 'residency-met'){
      var curStageIdx2 = stageIndex(u.currentStageId);
      var hasReal2 = u.phase === 'hasGC' || curStageIdx2 >= stageIndex('residency-met');
      if(hasReal2){
        var stored2 = residencyMark(u).getTime();
        endLow = Math.max(lowMs, stored2); endHigh = Math.max(highMs, stored2);
      } else {
        // residency-met is the boundary right after permanent-resident — instant marker
        endLow = lowMs; endHigh = highMs;
      }
    } else if(s.id === 'sponsorship'){
      var pd = petitionDuration(u.petitionType, u.countryOfBirth);
      endLow = lowMs + pd.low * ONE_MONTH_MS;
      endHigh = highMs + pd.high * ONE_MONTH_MS;
    } else if(STAGE_DURATIONS_MO[s.id]){
      var d = STAGE_DURATIONS_MO[s.id];
      endLow = lowMs + d.low * ONE_MONTH_MS;
      endHigh = highMs + d.high * ONE_MONTH_MS;
    }
    milestones.push({stageId: s.id, endLow: new Date(endLow), endHigh: new Date(endHigh)});
    lowMs = endLow; highMs = endHigh;
  }
  var totalLow = Math.max(0, Math.round((lowMs - nowMs) / ONE_MONTH_MS));
  var totalHigh = Math.max(0, Math.round((highMs - nowMs) / ONE_MONTH_MS));
  return {milestones: milestones, totalMonthsLow: totalLow, totalMonthsHigh: totalHigh};
}

var MONTHS_EN_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_ES_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function fmtMonthYear(d, l){
  if(typeof d === 'string') d = parseISO(d);
  var m = (l==='es' ? MONTHS_ES_SHORT : MONTHS_EN_SHORT)[d.getUTCMonth()];
  return m + ' ' + d.getUTCFullYear();
}
function fmtMonthRange(low, high, l){
  if(low.getUTCFullYear()===high.getUTCFullYear() && low.getUTCMonth()===high.getUTCMonth()) return fmtMonthYear(low, l);
  if(low.getUTCFullYear() === high.getUTCFullYear()){
    var months = l==='es' ? MONTHS_ES_SHORT : MONTHS_EN_SHORT;
    return months[low.getUTCMonth()]+'–'+months[high.getUTCMonth()]+' '+low.getUTCFullYear();
  }
  return fmtMonthYear(low, l) + ' – ' + fmtMonthYear(high, l);
}
function getImportantDates(u){
  u = u || user;
  var dates = [];
  var now = today();
  var yrs = residencyYears(u);

  if(u.greenCardDate){
    var gcD = parseISO(u.greenCardDate);
    dates.push({
      title: {en:'Became a permanent resident', es:'Te hiciste residente permanente'},
      date: gcD,
      status: gcD <= now ? 'past' : 'future',
      stageId: 'permanent-resident',
      note: {en:'Your green-card start date — the clock begins here.', es:'Tu fecha de residencia — el reloj empieza aquí.'}
    });
  }

  var mark = residencyMark(u);
  dates.push({
    title: {en: yrs + '-year residency mark', es: yrs + ' años de residencia'},
    date: mark,
    status: mark <= now ? 'past' : 'future',
    stageId: 'residency-met',
    note: {en:'When you meet the residency requirement for filing N-400.', es:'Cuando cumples el requisito de residencia para presentar el N-400.'}
  });

  var earliest = earliestFiling(u);
  var curStageIdx = stageIndex(u.currentStageId);
  var fileStageIdx = stageIndex('file-n400');
  var fileWindowOpen = earliest <= now && curStageIdx <= fileStageIdx;
  dates.push({
    title: {en:'90-day early filing window opens', es:'Se abre la ventana de presentar (90 días antes)'},
    date: earliest,
    status: earliest <= now ? 'past' : 'future',
    stageId: 'file-n400',
    note: {en:'Earliest day you can mail or submit Form N-400.', es:'El día más temprano para presentar el Formulario N-400.'},
    urgent: fileWindowOpen
  });

  if(u.marriageDate){
    var marD = parseISO(u.marriageDate);
    dates.push({
      title: {en:'Marriage date', es:'Fecha de matrimonio'},
      date: marD,
      status: marD <= now ? 'past' : 'future',
      note: {en:'Used to confirm 3-year-rule eligibility (must be married 3+ years).', es:'Para confirmar la regla de 3 años (debe estar casado/a 3+ años).'}
    });
  }

  var timeline = projectTimeline(u);
  if(timeline){
    timeline.milestones.forEach(function(m){
      if(m.stageId === 'permanent-resident' || m.stageId === 'residency-met') return;
      if(m.stageId === 'sponsorship' || m.stageId === 'visa-available' || m.stageId === 'aos-interview' || m.stageId === 'file-n400' || m.stageId === 'interview' || m.stageId === 'oath'){
        var stage = STAGES[stageIndex(m.stageId)];
        if(!stage) return;
        if(m.stageId === 'file-n400' && earliest <= now) return; // already covered by window above
        dates.push({
          title: stage.name,
          date: m.endLow,
          dateHigh: m.endHigh,
          status: 'estimated',
          stageId: m.stageId,
          note: stage.meta(u, lang, 'upcoming'),
          isRange: true
        });
      }
    });
  }

  dates.sort(function(a, b){ return a.date.getTime() - b.date.getTime(); });
  return dates;
}

function fmtMonthsTotal(low, high, l){
  if(high === 0) return l==='es' ? 'menos de 1 mes' : 'less than a month';
  if(high < 24){
    if(low === high) return low + ' ' + (l==='es' ? 'meses' : 'months');
    return '~' + low + '–' + high + ' ' + (l==='es' ? 'meses' : 'months');
  }
  var lowYrs = Math.round((low / 12) * 2) / 2;
  var highYrs = Math.round((high / 12) * 2) / 2;
  var yrsTxt = (l==='es' ? 'años' : 'years');
  if(lowYrs === highYrs) return lowYrs + ' ' + yrsTxt;
  return '~' + lowYrs + '–' + highYrs + ' ' + yrsTxt;
}

// ===== CIVICS QUESTION BANK =====
function Q(id,qEn,qEs,opts){ return {id:id, q:{en:qEn,es:qEs}, options:opts}; }
function O(en,es,correct){ return {en:en, es:es, correct:!!correct}; }

var CIVICS = [
  Q('p1','What is the supreme law of the land?','¿Cuál es la ley suprema del país?',[
    O('The Constitution','La Constitución',true),
    O('The Declaration of Independence','La Declaración de Independencia'),
    O('The Bill of Rights','La Carta de Derechos'),
    O('Federal regulations','Reglas federales')]),
  Q('p2','What does the Constitution do?','¿Qué hace la Constitución?',[
    O('Sets up the government and protects basic rights','Establece el gobierno y protege derechos básicos',true),
    O('Lists every U.S. law','Lista todas las leyes de EE.UU.'),
    O('Names every president','Nombra a cada presidente'),
    O('Sets income tax rates','Fija tasas de impuestos')]),
  Q('p3','The idea of self-government is in the first three words of the Constitution. What are they?','La idea del autogobierno está en las primeras tres palabras. ¿Cuáles son?',[
    O('We the People','Nosotros el Pueblo',true),
    O('In Order to','Para Formar'),
    O('Of the People','Del Pueblo'),
    O('By the People','Por el Pueblo')]),
  Q('p4','What is an amendment?','¿Qué es una enmienda?',[
    O('A change or addition to the Constitution','Un cambio o adición a la Constitución',true),
    O('A federal court ruling','Un fallo de la corte federal'),
    O('A presidential order','Una orden presidencial'),
    O('A type of tax','Un tipo de impuesto')]),
  Q('p5','What do we call the first ten amendments?','¿Cómo se llaman las primeras diez enmiendas?',[
    O('The Bill of Rights','La Carta de Derechos',true),
    O('The Declaration','La Declaración'),
    O('The Articles','Los Artículos'),
    O('The Preamble','El Preámbulo')]),

  Q('r1','What is the rule of law?','¿Qué es el estado de derecho?',[
    O('Everyone must follow the law, including leaders','Todos deben seguir la ley, incluso los líderes',true),
    O('Only citizens follow the law','Solo los ciudadanos siguen la ley'),
    O('Police make all the laws','La policía hace todas las leyes'),
    O('Only judges follow the law','Solo los jueces siguen la ley')]),
  Q('r2','What is one right or freedom from the First Amendment?','¿Cuál es un derecho de la Primera Enmienda?',[
    O('Speech','Expresión',true),
    O('The right to vote','Derecho al voto'),
    O('A government job','Un empleo de gobierno'),
    O('Free travel','Viaje gratis')]),
  Q('r3','What is freedom of religion?','¿Qué es la libertad de religión?',[
    O('You can practice any religion, or none','Puedes practicar cualquier religión, o ninguna',true),
    O('Everyone must attend church','Todos deben ir a la iglesia'),
    O('Only one religion is allowed','Solo se permite una religión'),
    O('Religion must be approved by Congress','La religión la aprueba el Congreso')]),
  Q('r4','What is the economic system in the United States?','¿Cuál es el sistema económico de EE.UU.?',[
    O('Capitalist / market economy','Economía capitalista / de mercado',true),
    O('Socialist economy','Economía socialista'),
    O('Command economy','Economía de mando'),
    O('Barter economy','Economía de trueque')]),
  Q('r5','What stops one branch of government from becoming too powerful?','¿Qué evita que una rama del gobierno sea demasiado poderosa?',[
    O('Checks and balances / separation of powers','Frenos y contrapesos / separación de poderes',true),
    O('The President alone','Solo el presidente'),
    O('A national vote','Un voto nacional'),
    O('The military','El ejército')]),

  Q('c1','What does "We the People" mean?','¿Qué significa "Nosotros el Pueblo"?',[
    O('Self-government — the people govern themselves','Autogobierno — el pueblo se gobierna a sí mismo',true),
    O('Only the wealthy govern','Solo los ricos gobiernan'),
    O('Foreign rulers govern','Gobernantes extranjeros'),
    O('No one governs','Nadie gobierna')]),
  Q('c2','In what year was the Constitution written?','¿En qué año se escribió la Constitución?',[
    O('1787','1787',true),
    O('1776','1776'),
    O('1812','1812'),
    O('1865','1865')]),
  Q('c3','Who is the "Father of Our Country"?','¿Quién es el "Padre de Nuestro País"?',[
    O('George Washington','George Washington',true),
    O('Abraham Lincoln','Abraham Lincoln'),
    O('Thomas Jefferson','Thomas Jefferson'),
    O('Benjamin Franklin','Benjamin Franklin')]),
  Q('c4','What is the introduction to the Constitution called?','¿Cómo se llama la introducción de la Constitución?',[
    O('The Preamble','El Preámbulo',true),
    O('The Foreword','El Prólogo'),
    O('The Bill of Rights','La Carta de Derechos'),
    O('The Index','El Índice')]),
  Q('c5','Name one thing the Constitution does.','Nombra una cosa que hace la Constitución.',[
    O('Protects basic rights','Protege derechos básicos',true),
    O('Sets state borders','Fija fronteras estatales'),
    O('Selects national holidays','Elige feriados nacionales'),
    O('Names schools','Nombra escuelas')]),

  Q('t1','What is one branch or part of the government?','¿Cuál es una rama o parte del gobierno?',[
    O('Congress (Legislative)','Congreso (Legislativo)',true),
    O('Your state Supreme Court','La Corte Suprema de tu estado'),
    O('The Department of Motor Vehicles','El Departamento de Vehículos'),
    O('The United Nations','Las Naciones Unidas')]),
  Q('t2','Who makes federal laws?','¿Quién hace las leyes federales?',[
    O('Congress','El Congreso',true),
    O('The President alone','Solo el presidente'),
    O('The Supreme Court','La Corte Suprema'),
    O('State governors','Los gobernadores estatales')]),
  Q('t3','What are the two parts of the U.S. Congress?','¿Cuáles son las dos partes del Congreso?',[
    O('Senate and House of Representatives','Senado y Cámara de Representantes',true),
    O('Senate and Supreme Court','Senado y Corte Suprema'),
    O('President and Vice President','Presidente y Vicepresidente'),
    O('Federal and State','Federal y Estatal')]),
  Q('t4','Who is the Commander in Chief of the military?','¿Quién es el Comandante en Jefe del ejército?',[
    O('The President','El presidente',true),
    O('A general','Un general'),
    O('The Speaker of the House','El presidente de la Cámara'),
    O('The Chief Justice','El presidente de la Corte Suprema')]),
  Q('t5','Who vetoes bills?','¿Quién veta los proyectos de ley?',[
    O('The President','El presidente',true),
    O('Congress','El Congreso'),
    O('The Supreme Court','La Corte Suprema'),
    O('The Vice President','El vicepresidente')]),

  Q('rf1','What are two rights in the Declaration of Independence?','¿Cuáles son dos derechos en la Declaración de Independencia?',[
    O('Life and liberty','Vida y libertad',true),
    O('Voting and driving','Votar y conducir'),
    O('School and work','Escuela y trabajo'),
    O('Travel and trade','Viaje y comercio')]),
  Q('rf2','What is one responsibility only for U.S. citizens?','¿Cuál es una responsabilidad solo de los ciudadanos?',[
    O('Serve on a jury','Servir en un jurado',true),
    O('Pay taxes','Pagar impuestos'),
    O('Obey the law','Obedecer la ley'),
    O('Attend public school','Asistir a la escuela pública')]),
  Q('rf3','Name one right only for U.S. citizens.','Nombra un derecho solo de los ciudadanos.',[
    O('Vote in a federal election','Votar en una elección federal',true),
    O('Practice religion','Practicar una religión'),
    O('Free speech','Libertad de expresión'),
    O('A fair trial','Un juicio justo')]),
  Q('rf4','What is one promise you make when you become a U.S. citizen?','¿Qué prometes al hacerte ciudadano?',[
    O('Give up loyalty to other countries','Renunciar a la lealtad a otros países',true),
    O('Speak only English at home','Hablar solo inglés en casa'),
    O('Join a political party','Unirse a un partido'),
    O('Move to Washington, D.C.','Mudarse a Washington, D.C.')]),
  Q('rf5','What are two rights of everyone living in the U.S.?','¿Cuáles son dos derechos de todos los que viven en EE.UU.?',[
    O('Freedom of speech and religion','Libertad de expresión y religión',true),
    O('Voting and federal office','Votar y cargo federal'),
    O('Free college and free housing','Universidad y vivienda gratis'),
    O('Tax-free income','Ingreso libre de impuestos')]),

  // ===== UNIT 2: AMERICAN HISTORY =====
  Q('h1','Why did colonists come to America?','¿Por qué vinieron los colonos a América?',[
    O('Freedom, opportunity, and to escape persecution','Libertad, oportunidad y para escapar de la persecución',true),
    O('To find gold','Para encontrar oro'),
    O('To start a war','Para empezar una guerra'),
    O('For vacation','De vacaciones')]),
  Q('h2','Who lived in America before the Europeans arrived?','¿Quién vivía en América antes de la llegada de los europeos?',[
    O('American Indians / Native Americans','Indios americanos / Nativos americanos',true),
    O('The British','Los británicos'),
    O('The French','Los franceses'),
    O('No one','Nadie')]),
  Q('h3','What group was taken to America and sold as slaves?','¿Qué grupo fue llevado a América y vendido como esclavos?',[
    O('Africans','Africanos',true),
    O('Europeans','Europeos'),
    O('Asians','Asiáticos'),
    O('Australians','Australianos')]),
  Q('h4','Name one of the original 13 colonies.','Nombra una de las 13 colonias originales.',[
    O('Virginia','Virginia',true),
    O('California','California'),
    O('Texas','Texas'),
    O('Florida','Florida')]),
  Q('h5','Who wrote the Declaration of Independence?','¿Quién escribió la Declaración de Independencia?',[
    O('Thomas Jefferson','Thomas Jefferson',true),
    O('George Washington','George Washington'),
    O('Benjamin Franklin','Benjamin Franklin'),
    O('John Adams','John Adams')]),

  Q('h6','When was the Declaration of Independence adopted?','¿Cuándo se adoptó la Declaración de Independencia?',[
    O('July 4, 1776','4 de julio de 1776',true),
    O('July 4, 1789','4 de julio de 1789'),
    O('August 1, 1776','1 de agosto de 1776'),
    O('June 30, 1776','30 de junio de 1776')]),
  Q('h7','The U.S. was at war with what country during the American Revolution?','¿Con qué país estaba EE.UU. en guerra durante la Revolución?',[
    O('Great Britain','Gran Bretaña',true),
    O('France','Francia'),
    O('Spain','España'),
    O('Germany','Alemania')]),
  Q('h8','Who was the first President of the United States?','¿Quién fue el primer presidente de EE.UU.?',[
    O('George Washington','George Washington',true),
    O('John Adams','John Adams'),
    O('Thomas Jefferson','Thomas Jefferson'),
    O('James Madison','James Madison')]),
  Q('h9','Name one reason colonists came to America.','Nombra una razón por la que vinieron los colonos.',[
    O('Religious freedom','Libertad religiosa',true),
    O('To find diamonds','Para encontrar diamantes'),
    O('To start cities','Para fundar ciudades'),
    O('To find oil','Para encontrar petróleo')]),
  Q('h10','What did the Federalist Papers support?','¿Qué apoyaban los Documentos Federalistas?',[
    O('Passage of the U.S. Constitution','La aprobación de la Constitución',true),
    O('The Bill of Rights','La Carta de Derechos'),
    O('The Declaration of Independence','La Declaración de Independencia'),
    O('The Articles of Confederation','Los Artículos de la Confederación')]),

  Q('h11','What did the Emancipation Proclamation do?','¿Qué hizo la Proclamación de Emancipación?',[
    O('Freed slaves in Confederate states','Liberó a los esclavos en los estados confederados',true),
    O('Started the Civil War','Inició la Guerra Civil'),
    O('Ended World War I','Terminó la Primera Guerra Mundial'),
    O('Created the U.S. Mint','Creó la Casa de la Moneda')]),
  Q('h12','Who was Abraham Lincoln?','¿Quién fue Abraham Lincoln?',[
    O('The 16th President; led during the Civil War','El presidente 16; lideró durante la Guerra Civil',true),
    O('The 1st President','El primer presidente'),
    O('A British king','Un rey británico'),
    O('A Supreme Court justice','Un juez de la Corte Suprema')]),
  Q('h13','What U.S. war ended slavery?','¿Qué guerra terminó con la esclavitud?',[
    O('The Civil War','La Guerra Civil',true),
    O('World War I','La Primera Guerra Mundial'),
    O('The Revolutionary War','La Guerra de Independencia'),
    O('The Vietnam War','La Guerra de Vietnam')]),
  Q('h14','What was one important thing Abraham Lincoln did?','¿Qué cosa importante hizo Abraham Lincoln?',[
    O('Preserved the Union and freed the slaves','Preservó la Unión y liberó a los esclavos',true),
    O('Wrote the Constitution','Escribió la Constitución'),
    O('Bought Alaska','Compró Alaska'),
    O('Built the Panama Canal','Construyó el Canal de Panamá')]),
  Q('h15','The Civil War was fought between the North and which region?','¿La Guerra Civil fue entre el Norte y qué región?',[
    O('The South','El Sur',true),
    O('The East','El Este'),
    O('The Pacific','El Pacífico'),
    O('The Atlantic','El Atlántico')]),

  Q('h16','Name one war the U.S. fought in the 1800s.','Nombra una guerra de EE.UU. en el siglo XIX.',[
    O('Civil War','Guerra Civil',true),
    O('World War I','Primera Guerra Mundial'),
    O('World War II','Segunda Guerra Mundial'),
    O('Vietnam War','Guerra de Vietnam')]),
  Q('h17','What did Susan B. Anthony do?','¿Qué hizo Susan B. Anthony?',[
    O("Fought for women's rights",'Luchó por los derechos de las mujeres',true),
    O('Wrote the Constitution','Escribió la Constitución'),
    O('Was president','Fue presidenta'),
    O('Invented electricity','Inventó la electricidad')]),
  Q('h18','What territory did the U.S. buy from France in 1803?','¿Qué territorio compró EE.UU. a Francia en 1803?',[
    O('The Louisiana Territory','El Territorio de Luisiana',true),
    O('Florida','Florida'),
    O('Texas','Texas'),
    O('Alaska','Alaska')]),
  Q('h19','Name one problem that led to the Civil War.','Nombra un problema que llevó a la Guerra Civil.',[
    O("Slavery, economic differences, or states' rights",'Esclavitud, diferencias económicas o derechos de los estados',true),
    O('Religion','Religión'),
    O("Women's voting rights",'Voto femenino'),
    O('Foreign wars','Guerras extranjeras')]),
  Q('h20','After the Civil War, what amendment gave all men the right to vote?','Después de la Guerra Civil, ¿qué enmienda dio el voto a todos los hombres?',[
    O('The 15th Amendment','La Enmienda 15',true),
    O('The 1st Amendment','La Enmienda 1'),
    O('The 19th Amendment','La Enmienda 19'),
    O('The 26th Amendment','La Enmienda 26')]),

  Q('h21','Name one war the U.S. fought in the 1900s.','Nombra una guerra de EE.UU. en el siglo XX.',[
    O('World War II','Segunda Guerra Mundial',true),
    O('Civil War','Guerra Civil'),
    O('Revolutionary War','Guerra de Independencia'),
    O('War of 1812','Guerra de 1812')]),
  Q('h22','Who was president during World War I?','¿Quién fue presidente durante la Primera Guerra Mundial?',[
    O('Woodrow Wilson','Woodrow Wilson',true),
    O('Franklin Roosevelt','Franklin Roosevelt'),
    O('Theodore Roosevelt','Theodore Roosevelt'),
    O('Harry Truman','Harry Truman')]),
  Q('h23','Who was president during the Great Depression and World War II?','¿Quién fue presidente durante la Gran Depresión y la Segunda Guerra Mundial?',[
    O('Franklin D. Roosevelt','Franklin D. Roosevelt',true),
    O('Woodrow Wilson','Woodrow Wilson'),
    O('Harry Truman','Harry Truman'),
    O('Dwight Eisenhower','Dwight Eisenhower')]),
  Q('h24','What movement tried to end racial discrimination?','¿Qué movimiento intentó terminar la discriminación racial?',[
    O('The civil rights movement','El movimiento de derechos civiles',true),
    O('The temperance movement','El movimiento de templanza'),
    O('The labor movement','El movimiento laboral'),
    O('The Prohibition movement','El movimiento de la Prohibición')]),
  Q('h25','What did Martin Luther King, Jr. do?','¿Qué hizo Martin Luther King, Jr.?',[
    O('Fought for civil rights and racial equality','Luchó por los derechos civiles y la igualdad racial',true),
    O('Was president','Fue presidente'),
    O('Wrote the Constitution','Escribió la Constitución'),
    O('Invented the telephone','Inventó el teléfono')]),

  // ===== UNIT 3: SYMBOLS & GEOGRAPHY =====
  Q('s1','What is the name of the national anthem?','¿Cómo se llama el himno nacional?',[
    O('The Star-Spangled Banner','La Bandera Estrellada',true),
    O('America the Beautiful','America the Beautiful'),
    O('God Bless America','God Bless America'),
    O("My Country, 'Tis of Thee","My Country, 'Tis of Thee")]),
  Q('s2','Why does the flag have 50 stars?','¿Por qué la bandera tiene 50 estrellas?',[
    O('One for each state','Una por cada estado',true),
    O('One for each year','Una por cada año'),
    O('One for each war','Una por cada guerra'),
    O('One for each president','Una por cada presidente')]),
  Q('s3','Why does the flag have 13 stripes?','¿Por qué la bandera tiene 13 franjas?',[
    O('One for each original colony','Una por cada colonia original',true),
    O('One for each amendment','Una por cada enmienda'),
    O('Just for decoration','Solo decorativo'),
    O('One for each region','Una por cada región')]),
  Q('s4','What is the name of the American flag?','¿Cómo se llama la bandera americana?',[
    O('The Stars and Stripes','Las Barras y Estrellas',true),
    O('The Union Jack','The Union Jack'),
    O('Old Reliable','Old Reliable'),
    O('The Tricolor','La Tricolor')]),
  Q('s5','Where does the Statue of Liberty stand?','¿Dónde está la Estatua de la Libertad?',[
    O('New York Harbor / Liberty Island','Puerto de Nueva York / Isla de la Libertad',true),
    O('Washington, D.C.','Washington, D.C.'),
    O('Philadelphia','Filadelfia'),
    O('Boston','Boston')]),

  Q('s6','When do we celebrate Independence Day?','¿Cuándo celebramos el Día de la Independencia?',[
    O('July 4','4 de julio',true),
    O('July 1','1 de julio'),
    O('June 4','4 de junio'),
    O('August 4','4 de agosto')]),
  Q('s7','Name two national U.S. holidays.','Nombra dos feriados nacionales.',[
    O('Independence Day and Thanksgiving','Día de la Independencia y Acción de Gracias',true),
    O('Cinco de Mayo and St. Patrick’s Day','Cinco de Mayo y San Patricio'),
    O('Easter and Christmas Eve','Pascua y Nochebuena'),
    O('Halloween and Valentine’s Day','Halloween y San Valentín')]),
  Q('s8','In what month do we elect the President?','¿En qué mes elegimos al presidente?',[
    O('November','Noviembre',true),
    O('January','Enero'),
    O('July','Julio'),
    O('October','Octubre')]),
  Q('s9','Why do we celebrate Independence Day?','¿Por qué celebramos el Día de la Independencia?',[
    O('To remember the Declaration of Independence','Para recordar la Declaración de Independencia',true),
    O('To mark the end of the Civil War','Para marcar el fin de la Guerra Civil'),
    O('To honor the Constitution','Para honrar la Constitución'),
    O('To mark the first Thanksgiving','Para marcar el primer Acción de Gracias')]),
  Q('s10','When is Memorial Day?','¿Cuándo es el Día de los Caídos?',[
    O('Last Monday in May','El último lunes de mayo',true),
    O('July 4','4 de julio'),
    O('January 1','1 de enero'),
    O('November 11','11 de noviembre')]),

  Q('s11','What ocean is on the West Coast of the U.S.?','¿Qué océano está en la costa oeste?',[
    O('The Pacific Ocean','El Océano Pacífico',true),
    O('The Atlantic Ocean','El Océano Atlántico'),
    O('The Indian Ocean','El Océano Índico'),
    O('The Arctic Ocean','El Océano Ártico')]),
  Q('s12','What ocean is on the East Coast?','¿Qué océano está en la costa este?',[
    O('The Atlantic Ocean','El Océano Atlántico',true),
    O('The Pacific Ocean','El Océano Pacífico'),
    O('The Gulf of Mexico','El Golfo de México'),
    O('The Caribbean Sea','El Mar Caribe')]),
  Q('s13','Name one state that borders Canada.','Nombra un estado que limita con Canadá.',[
    O('Maine / Michigan / Washington','Maine / Michigan / Washington',true),
    O('Texas','Texas'),
    O('Florida','Florida'),
    O('California','California')]),
  Q('s14','Name one state that borders Mexico.','Nombra un estado que limita con México.',[
    O('California / Arizona / New Mexico / Texas','California / Arizona / Nuevo México / Texas',true),
    O('Oregon','Oregón'),
    O('Maine','Maine'),
    O('Georgia','Georgia')]),
  Q('s15','What is the capital of the United States?','¿Cuál es la capital de EE.UU.?',[
    O('Washington, D.C.','Washington, D.C.',true),
    O('New York City','Nueva York'),
    O('Philadelphia','Filadelfia'),
    O('Los Angeles','Los Ángeles')]),

  Q('s16','How many states are there in the U.S.?','¿Cuántos estados hay en EE.UU.?',[
    O('50','50',true),
    O('48','48'),
    O('52','52'),
    O('13','13')]),
  Q('s17','How many U.S. senators are there?','¿Cuántos senadores hay?',[
    O('100','100',true),
    O('50','50'),
    O('435','435'),
    O('200','200')]),
  Q('s18','How many voting members are in the House of Representatives?','¿Cuántos miembros con voto tiene la Cámara?',[
    O('435','435',true),
    O('100','100'),
    O('50','50'),
    O('538','538')]),
  Q('s19','How long is a term for a U.S. senator?','¿Cuánto dura el mandato de un senador?',[
    O('6 years','6 años',true),
    O('2 years','2 años'),
    O('4 years','4 años'),
    O('8 years','8 años')]),
  Q('s20','How long is a term for a member of the House?','¿Cuánto dura el mandato de un representante?',[
    O('2 years','2 años',true),
    O('4 years','4 años'),
    O('6 years','6 años'),
    O('1 year','1 año')]),

  Q('s21','In what month do we vote for president?','¿En qué mes votamos por el presidente?',[
    O('November','Noviembre',true),
    O('January','Enero'),
    O('March','Marzo'),
    O('October','Octubre')]),
  Q('s22','We elect a U.S. senator for how many years?','¿Para cuántos años elegimos a un senador?',[
    O('6','6',true),
    O('2','2'),
    O('4','4'),
    O('8','8')]),
  Q('s23','What is the highest court in the U.S.?','¿Cuál es la corte más alta?',[
    O('The Supreme Court','La Corte Suprema',true),
    O('The Federal Court','La Corte Federal'),
    O('The State Court','La Corte Estatal'),
    O('The District Court','La Corte de Distrito')]),
  Q('s24','How many justices are on the Supreme Court?','¿Cuántos jueces hay en la Corte Suprema?',[
    O('9','9',true),
    O('7','7'),
    O('11','11'),
    O('12','12')]),
  Q('s25','What stops one branch from becoming too powerful (besides separation of powers)?','¿Qué evita que una rama sea muy poderosa (además de separación)?',[
    O('Checks and balances','Frenos y contrapesos',true),
    O('The military','El ejército'),
    O('Public vote','El voto popular'),
    O('State governors','Los gobernadores estatales')]),

  // ===== UNIT 4: RIGHTS & RESPONSIBILITIES =====
  Q('ci1','How can someone become a U.S. citizen?','¿Cómo se vuelve uno ciudadano de EE.UU.?',[
    O('Be born in the U.S. or be naturalized','Nacer en EE.UU. o naturalizarse',true),
    O('Buy citizenship','Comprar la ciudadanía'),
    O('Inherit it from a friend','Heredarla de un amigo'),
    O('Win a contest','Ganar un concurso')]),
  Q('ci2','How old must someone be to vote for President?','¿Qué edad mínima para votar por el presidente?',[
    O('18 or older','18 años o más',true),
    O('16 or older','16 años o más'),
    O('21 or older','21 años o más'),
    O('25 or older','25 años o más')]),
  Q('ci3','If you become a U.S. citizen, can you keep your other citizenship?','Si te haces ciudadano de EE.UU., ¿puedes mantener tu otra ciudadanía?',[
    O('Sometimes — depends on the other country','A veces — depende del otro país',true),
    O('Always','Siempre'),
    O('Never','Nunca'),
    O('Only if approved by Congress','Solo si lo aprueba el Congreso')]),
  Q('ci4','Where do you take the Oath of Allegiance?','¿Dónde tomas el Juramento de Lealtad?',[
    O('At a USCIS oath ceremony','En una ceremonia de USCIS',true),
    O('At a state court','En una corte estatal'),
    O('At an embassy','En una embajada'),
    O('At any government office','En cualquier oficina del gobierno')]),
  Q('ci5','What two tests do new citizens take?','¿Qué dos exámenes toman los nuevos ciudadanos?',[
    O('English and civics','Inglés y cívica',true),
    O('Math and history','Matemáticas e historia'),
    O('Geography and law','Geografía y leyes'),
    O('Reading and writing only','Solo leer y escribir')]),

  Q('vo1','What are the two major political parties in the U.S.?','¿Cuáles son los dos partidos políticos principales?',[
    O('Democratic and Republican','Demócrata y Republicano',true),
    O('Liberal and Conservative','Liberal y Conservador'),
    O('Progressive and Libertarian','Progresista y Libertario'),
    O('Green and Reform','Verde y Reforma')]),
  Q('vo2','Name one amendment about who can vote.','Nombra una enmienda sobre quién puede votar.',[
    O('15th, 19th, 24th, or 26th','15, 19, 24 o 26',true),
    O('1st','1'),
    O('5th','5'),
    O('10th','10')]),
  Q('vo3','Who can vote in federal elections?','¿Quién puede votar en elecciones federales?',[
    O('U.S. citizens 18 and older','Ciudadanos de EE.UU. de 18 años o más',true),
    O('Anyone with a green card','Cualquiera con residencia'),
    O('Anyone living in the U.S.','Cualquiera viviendo en EE.UU.'),
    O('Anyone with a Social Security number','Cualquiera con SSN')]),
  Q('vo4','When is Election Day?','¿Cuándo es el Día de las Elecciones?',[
    O('The Tuesday after the first Monday in November','El martes después del primer lunes de noviembre',true),
    O('The first Monday in November','El primer lunes de noviembre'),
    O('November 4 every year','El 4 de noviembre cada año'),
    O('Last day of October','Último día de octubre')]),
  Q('vo5','Name one way to participate in democracy.','Nombra una forma de participar en la democracia.',[
    O('Vote, join a party, attend public meetings, or run for office','Votar, unirse a un partido, asistir a reuniones, o postularse',true),
    O('Pay rent','Pagar renta'),
    O('Get a driver\'s license','Sacar licencia de conducir'),
    O('Watch the news','Ver las noticias')]),

  Q('fs1','Name one power that belongs to the federal government.','Nombra un poder del gobierno federal.',[
    O('Print money, declare war, or make treaties','Imprimir dinero, declarar guerra o hacer tratados',true),
    O('Issue driver\'s licenses','Emitir licencias de conducir'),
    O('Approve zoning','Aprobar zonificación'),
    O('Run public schools','Manejar escuelas públicas')]),
  Q('fs2','Name one power that belongs to the states.','Nombra un poder de los estados.',[
    O('Provide schools, police, and driver\'s licenses','Proveer escuelas, policía y licencias',true),
    O('Print money','Imprimir dinero'),
    O('Declare war','Declarar guerra'),
    O('Make treaties','Hacer tratados')]),
  Q('fs3','Who heads the state government?','¿Quién dirige el gobierno estatal?',[
    O('The Governor','El gobernador',true),
    O('The President','El presidente'),
    O('The Speaker of the House','El presidente de la Cámara'),
    O('The Mayor','El alcalde')]),
  Q('fs4','Who is the head of the executive branch?','¿Quién dirige la rama ejecutiva?',[
    O('The President','El presidente',true),
    O('Congress','El Congreso'),
    O('The Chief Justice','El Presidente de la Corte Suprema'),
    O('The Secretary of State','El Secretario de Estado')]),
  Q('fs5','What does the President\'s Cabinet do?','¿Qué hace el Gabinete del presidente?',[
    O('Advises the President','Asesora al presidente',true),
    O('Writes federal laws','Escribe leyes federales'),
    O('Approves Supreme Court justices','Aprueba a los jueces de la Corte Suprema'),
    O('Heads each state','Dirige cada estado')]),

  Q('ce1','Name one way Americans show love for their country.','Nombra una forma en que los estadounidenses muestran amor por su país.',[
    O('Fly the flag, vote, or serve in the military','Izar la bandera, votar o servir en el ejército',true),
    O('Buy only American products','Comprar solo productos americanos'),
    O('Watch fireworks','Ver fuegos artificiales'),
    O('Speak only English','Hablar solo inglés')]),
  Q('ce2','Who does the U.S. Constitution protect?','¿A quién protege la Constitución?',[
    O('Everyone living in the U.S., citizens and non-citizens','Todos los que viven en EE.UU., ciudadanos y no-ciudadanos',true),
    O('Only U.S. citizens','Solo ciudadanos'),
    O('Only permanent residents','Solo residentes'),
    O('Only Americans','Solo americanos')]),
  Q('ce3','Name one responsibility only for U.S. citizens.','Nombra una responsabilidad solo de los ciudadanos.',[
    O('Serve on a jury or vote in federal elections','Servir en un jurado o votar en elecciones federales',true),
    O('Pay taxes','Pagar impuestos'),
    O('Obey laws','Obedecer las leyes'),
    O('Carry ID','Llevar identificación')]),
  Q('ce4','Name one way to participate in your community.','Nombra una forma de participar en tu comunidad.',[
    O('Volunteer, attend town meetings, or run for office','Ser voluntario, ir a reuniones, o postularse',true),
    O('Move to a different city','Mudarse a otra ciudad'),
    O('Stay at home','Quedarse en casa'),
    O('Watch TV','Ver televisión')]),
  Q('ce5','What is one promise you make in the Oath of Allegiance?','¿Qué promesa haces en el Juramento de Lealtad?',[
    O('Defend the Constitution and laws of the U.S.','Defender la Constitución y leyes de EE.UU.',true),
    O('Move to Washington, D.C.','Mudarse a Washington, D.C.'),
    O('Only speak English at home','Solo hablar inglés en casa'),
    O('Join the President\'s party','Unirse al partido del presidente')]),

  Q('tx1','When must males 18-26 register for the Selective Service?','¿Cuándo deben los hombres 18-26 registrarse en el Servicio Selectivo?',[
    O('Within 30 days of turning 18','Dentro de 30 días de cumplir 18',true),
    O('At any time','En cualquier momento'),
    O('Only during a war','Solo durante una guerra'),
    O('It\'s never required','Nunca es requerido')]),
  Q('tx2','When is the last day to file federal income taxes?','¿Cuál es el último día para presentar impuestos federales?',[
    O('April 15','15 de abril',true),
    O('March 15','15 de marzo'),
    O('July 4','4 de julio'),
    O('December 31','31 de diciembre')]),
  Q('tx3','Why do Americans pay taxes?','¿Por qué los estadounidenses pagan impuestos?',[
    O('To fund government services like schools, military, and roads','Para financiar servicios como escuelas, ejército y carreteras',true),
    O('To buy stocks','Para comprar acciones'),
    O('To punish citizens','Para castigar a los ciudadanos'),
    O('To pay foreign debts only','Solo para pagar deudas extranjeras')]),
  Q('tx4','Name one responsibility of citizens.','Nombra una responsabilidad de los ciudadanos.',[
    O('Pay taxes, serve on a jury, or register for Selective Service if eligible','Pagar impuestos, servir en jurado, o registrarse en el Servicio Selectivo si aplica',true),
    O('Watch TV every day','Ver televisión cada día'),
    O('Get married','Casarse'),
    O('Own property','Ser dueño de propiedad')]),
  Q('tx5','Who must pay federal income taxes?','¿Quién debe pagar impuestos federales?',[
    O('All who earn above the income threshold','Todos los que ganan más del límite',true),
    O('Only citizens','Solo ciudadanos'),
    O('Only the wealthy','Solo los ricos'),
    O('Only employees','Solo empleados')])
];

// ===== 2025 CIVICS TEST — 128 OFFICIAL QUESTIONS =====
// Source: USCIS M-1778 (09/25), "2025-Civics-Test-128-Questions-and-Answers.pdf"
// In effect for N-400 applications filed on or after Oct 20, 2025.
// Test format: officer asks up to 20 questions orally; pass at 12 correct, fail at 9 wrong.
// IDs use the prefix `n` (for "new test") + the question number.
var CIVICS_2025 = [
  Q('n1', 'What is the form of government of the United States?', '¿Cuál es la forma de gobierno de los Estados Unidos?', [
    O('Republic','República',true), O('Monarchy','Monarquía'), O('Direct democracy','Democracia directa'), O('Confederation','Confederación')]),
  Q('n2', 'What is the supreme law of the land?', '¿Cuál es la ley suprema del país?', [
    O('The Constitution','La Constitución',true), O('The Declaration of Independence','La Declaración de Independencia'), O('The Bill of Rights','La Carta de Derechos'), O('Federal regulations','Reglas federales')]),
  Q('n3', 'Name one thing the U.S. Constitution does.', 'Nombra una cosa que hace la Constitución.', [
    O('Forms the government','Forma el gobierno',true), O('Names every president','Nombra a cada presidente'), O('Sets tax rates','Fija tasas de impuestos'), O('Lists every law','Lista cada ley')]),
  Q('n4', 'The U.S. Constitution starts with the words "We the People." What does "We the People" mean?', 'La Constitución empieza con "Nosotros el Pueblo." ¿Qué significa esto?', [
    O('Self-government','Autogobierno',true), O('The Founders','Los Fundadores'), O('All citizens of the world','Todos los ciudadanos del mundo'), O('Soldiers','Soldados')]),
  Q('n5', 'How are changes made to the U.S. Constitution?', '¿Cómo se hacen cambios a la Constitución?', [
    O('Amendments','Enmiendas',true), O('Executive orders','Órdenes ejecutivas'), O('Court rulings','Fallos judiciales'), O('Acts of Congress','Leyes del Congreso')]),
  Q('n6', 'What does the Bill of Rights protect?', '¿Qué protege la Carta de Derechos?', [
    O('Rights of people living in the United States','Derechos de las personas que viven en EE.UU.',true), O('Only citizens','Solo ciudadanos'), O('Only voters','Solo votantes'), O('Government officials','Funcionarios del gobierno')]),
  Q('n7', 'How many amendments does the U.S. Constitution have?', '¿Cuántas enmiendas tiene la Constitución?', [
    O('27','27',true), O('10','10'), O('50','50'), O('100','100')]),
  Q('n8', 'Why is the Declaration of Independence important?', '¿Por qué es importante la Declaración de Independencia?', [
    O('It says America is free from British control','Dice que América es libre del control británico',true), O('It sets up Congress','Establece el Congreso'), O('It creates the Supreme Court','Crea la Corte Suprema'), O('It taxes the colonies','Impone impuestos a las colonias')]),
  Q('n9', 'What founding document said the American colonies were free from Britain?', '¿Qué documento fundador dijo que las colonias eran libres de Gran Bretaña?', [
    O('Declaration of Independence','Declaración de Independencia',true), O('The Constitution','La Constitución'), O('Bill of Rights','Carta de Derechos'), O('Federalist Papers','Los Federalistas')]),
  Q('n10', 'Name two important ideas from the Declaration of Independence and the U.S. Constitution.', 'Nombra dos ideas importantes de la Declaración y la Constitución.', [
    O('Equality and Liberty','Igualdad y Libertad',true), O('Taxes and tariffs','Impuestos y aranceles'), O('Borders and tariffs','Fronteras y aranceles'), O('War and peace','Guerra y paz')]),
  Q('n11', 'The words "Life, Liberty, and the pursuit of Happiness" are in what founding document?', '"Vida, Libertad y la búsqueda de la Felicidad" están en cuál documento?', [
    O('Declaration of Independence','Declaración de Independencia',true), O('Constitution','Constitución'), O('Bill of Rights','Carta de Derechos'), O('Articles of Confederation','Artículos de la Confederación')]),
  Q('n12', 'What is the economic system of the United States?', '¿Cuál es el sistema económico de EE.UU.?', [
    O('Free market economy','Economía de mercado libre',true), O('Socialism','Socialismo'), O('Command economy','Economía planificada'), O('Barter system','Trueque')]),
  Q('n13', 'What is the rule of law?', '¿Qué es el estado de derecho?', [
    O('Everyone must follow the law','Todos deben seguir la ley',true), O('Only the President follows the law','Solo el presidente sigue la ley'), O('Police make the rules','La policía hace las reglas'), O('Laws apply only to citizens','Las leyes son solo para ciudadanos')]),
  Q('n14', 'Many documents influenced the U.S. Constitution. Name one.', 'Muchos documentos influyeron en la Constitución. Nombra uno.', [
    O('Declaration of Independence','Declaración de Independencia',true), O('Treaty of Paris','Tratado de París'), O('Monroe Doctrine','Doctrina Monroe'), O('Gettysburg Address','Discurso de Gettysburg')]),
  Q('n15', 'There are three branches of government. Why?', '¿Por qué hay tres ramas del gobierno?', [
    O('Checks and balances','Frenos y contrapesos',true), O('Cost savings','Ahorro de costos'), O('Geography','Geografía'), O('Tradition','Tradición')]),
  Q('n16', 'Name the three branches of government.', 'Nombra las tres ramas del gobierno.', [
    O('Congress, President, and the courts','Congreso, Presidente y las cortes',true), O('Federal, state, and local','Federal, estatal y local'), O('House, Senate, and Cabinet','Casa, Senado y Gabinete'), O('Military, civilian, and judicial','Militar, civil y judicial')]),
  Q('n17', 'The President of the United States is in charge of which branch of government?', '¿De qué rama está a cargo el Presidente?', [
    O('Executive branch','Rama ejecutiva',true), O('Legislative branch','Rama legislativa'), O('Judicial branch','Rama judicial'), O('Military branch','Rama militar')]),
  Q('n18', 'What part of the federal government writes laws?', '¿Qué parte del gobierno federal escribe leyes?', [
    O('Congress','El Congreso',true), O('The President','El Presidente'), O('Supreme Court','Corte Suprema'), O('Cabinet','Gabinete')]),
  Q('n19', 'What are the two parts of the U.S. Congress?', '¿Cuáles son las dos partes del Congreso?', [
    O('Senate and House','Senado y Cámara',true), O('House and Cabinet','Cámara y Gabinete'), O('Senate and Supreme Court','Senado y Corte Suprema'), O('Federal and state','Federal y estatal')]),
  Q('n20', 'Name one power of the U.S. Congress.', 'Nombra un poder del Congreso.', [
    O('Writes laws','Escribe leyes',true), O('Vetoes bills','Veta proyectos'), O('Decides cases','Decide casos'), O('Commands the military','Manda el ejército')]),
  Q('n21', 'How many U.S. Senators are there?', '¿Cuántos senadores hay?', [
    O('100','100',true), O('50','50'), O('435','435'), O('538','538')]),
  Q('n22', 'How long is a term for a U.S. Senator?', '¿Cuánto dura el mandato de un senador?', [
    O('6 years','6 años',true), O('2 years','2 años'), O('4 years','4 años'), O('8 years','8 años')]),
  Q('n23', "Who is one of your state's U.S. Senators now?", '¿Quién es uno de tus senadores ahora?', [
    O('Answers vary by state','Varía por estado',true), O('The Vice President','El Vicepresidente'), O('The Speaker','El portavoz'), O('The Governor','El gobernador')]),
  Q('n24', 'How many voting members are there in the House of Representatives?', '¿Cuántos representantes votantes hay en la Cámara?', [
    O('435','435',true), O('100','100'), O('50','50'), O('538','538')]),
  Q('n25', 'How long is a term for a member of the House of Representatives?', '¿Cuánto dura el mandato de un representante?', [
    O('2 years','2 años',true), O('4 years','4 años'), O('6 years','6 años'), O('8 years','8 años')]),
  Q('n26', 'Why do U.S. representatives serve shorter terms than U.S. Senators?', '¿Por qué los representantes sirven menos tiempo que los senadores?', [
    O('To more closely follow public opinion','Para seguir la opinión pública más de cerca',true), O('Less pay','Menos paga'), O('Smaller districts','Distritos más pequeños'), O('Tradition','Tradición')]),
  Q('n27', 'How many senators does each state have?', '¿Cuántos senadores tiene cada estado?', [
    O('2','2',true), O('1','1'), O('3','3'), O('Depends on population','Depende de la población')]),
  Q('n28', 'Why does each state have two senators?', '¿Por qué cada estado tiene dos senadores?', [
    O('Equal representation','Representación igual',true), O('Geography','Geografía'), O('History','Historia'), O('To split work','Para dividir el trabajo')]),
  Q('n29', 'Name your U.S. representative.', 'Nombra a tu representante.', [
    O('Answers vary by district','Varía por distrito',true), O('The President','El Presidente'), O('The Speaker','El portavoz'), O('The Governor','El gobernador')]),
  Q('n30', 'What is the name of the Speaker of the House of Representatives now?', '¿Quién es el actual portavoz de la Cámara?', [
    O('Mike Johnson','Mike Johnson',true), O('Kevin McCarthy','Kevin McCarthy'), O('Nancy Pelosi','Nancy Pelosi'), O('Hakeem Jeffries','Hakeem Jeffries')]),
  Q('n31', 'Who does a U.S. Senator represent?', '¿A quién representa un senador?', [
    O('People of their state','Las personas de su estado',true), O('Their district','Su distrito'), O('The President','El Presidente'), O('Their party','Su partido')]),
  Q('n32', 'Who elects U.S. senators?', '¿Quién elige a los senadores?', [
    O('Citizens from their state','Ciudadanos de su estado',true), O('State legislatures','Las legislaturas estatales'), O('The Electoral College','El Colegio Electoral'), O('The President','El Presidente')]),
  Q('n33', 'Who does a member of the House of Representatives represent?', '¿A quién representa un representante?', [
    O('People in their district','La gente de su distrito',true), O('Their state','Su estado'), O('The whole country','Todo el país'), O('Their party','Su partido')]),
  Q('n34', 'Who elects members of the House of Representatives?', '¿Quién elige a los representantes?', [
    O('Citizens from their district','Ciudadanos de su distrito',true), O('State legislatures','Legislaturas'), O('The Senate','El Senado'), O('The President','El Presidente')]),
  Q('n35', 'Some states have more representatives than other states. Why?', '¿Por qué algunos estados tienen más representantes?', [
    O('They have more people','Tienen más gente',true), O('They are bigger','Son más grandes'), O('They pay more taxes','Pagan más impuestos'), O('They are older','Son más antiguos')]),
  Q('n36', 'The President of the United States is elected for how many years?', '¿El presidente se elige por cuántos años?', [
    O('4 years','4 años',true), O('2 years','2 años'), O('6 years','6 años'), O('8 years','8 años')]),
  Q('n37', 'The President of the United States can serve only two terms. Why?', '¿Por qué el presidente solo puede servir dos términos?', [
    O('The 22nd Amendment','La 22ª Enmienda',true), O('Tradition','Tradición'), O('Original Constitution','Constitución original'), O('The Bill of Rights','La Carta de Derechos')]),
  Q('n38', 'What is the name of the President of the United States now?', '¿Quién es el presidente ahora?', [
    O('Donald Trump','Donald Trump',true), O('Joe Biden','Joe Biden'), O('Kamala Harris','Kamala Harris'), O('Barack Obama','Barack Obama')]),
  Q('n39', 'What is the name of the Vice President of the United States now?', '¿Quién es el vicepresidente ahora?', [
    O('JD Vance','JD Vance',true), O('Kamala Harris','Kamala Harris'), O('Mike Pence','Mike Pence'), O('Tim Kaine','Tim Kaine')]),
  Q('n40', 'If the president can no longer serve, who becomes president?', 'Si el presidente no puede servir, ¿quién toma el cargo?', [
    O('The Vice President','El vicepresidente',true), O('Speaker of the House','Portavoz de la Cámara'), O('Senate President','Presidente del Senado'), O('Chief Justice','Juez Principal')]),
  Q('n41', 'Name one power of the president.', 'Nombra un poder del presidente.', [
    O('Signs bills into law','Firma proyectos como ley',true), O('Writes laws','Escribe leyes'), O('Decides cases','Decide casos'), O('Declares war','Declara guerra')]),
  Q('n42', 'Who is the Commander in Chief of the U.S. military?', '¿Quién es el Comandante en Jefe?', [
    O('The President','El Presidente',true), O('The Vice President','El Vicepresidente'), O('Secretary of Defense','Secretario de Defensa'), O('The Speaker','El portavoz')]),
  Q('n43', 'Who signs bills to become laws?', '¿Quién firma los proyectos para que sean leyes?', [
    O('The President','El Presidente',true), O('Congress','Congreso'), O('Supreme Court','Corte Suprema'), O('The Cabinet','El Gabinete')]),
  Q('n44', 'Who vetoes bills?', '¿Quién veta los proyectos?', [
    O('The President','El Presidente',true), O('Congress','Congreso'), O('Supreme Court','Corte Suprema'), O('Cabinet','Gabinete')]),
  Q('n45', 'Who appoints federal judges?', '¿Quién nombra a los jueces federales?', [
    O('The President','El Presidente',true), O('Senate','Senado'), O('House','Cámara'), O('Cabinet','Gabinete')]),
  Q('n46', 'The executive branch has many parts. Name one.', 'La rama ejecutiva tiene varias partes. Nombra una.', [
    O('The President','El Presidente',true), O('Congress','El Congreso'), O('Supreme Court','Corte Suprema'), O('State legislatures','Legislaturas estatales')]),
  Q('n47', "What does the President's Cabinet do?", '¿Qué hace el Gabinete del presidente?', [
    O('Advises the President','Aconseja al presidente',true), O('Writes laws','Escribe leyes'), O('Decides cases','Decide casos'), O('Commands the military','Manda el ejército')]),
  Q('n48', 'What are two cabinet-level positions?', '¿Nombra dos cargos del Gabinete?', [
    O('Secretary of State and Secretary of Defense','Secretario de Estado y Secretario de Defensa',true), O('Senator and Governor','Senador y gobernador'), O('Mayor and councilor','Alcalde y concejal'), O('Sheriff and judge','Sheriff y juez')]),
  Q('n49', 'Why is the Electoral College important?', '¿Por qué es importante el Colegio Electoral?', [
    O('It decides who is elected president','Decide quién es elegido presidente',true), O('It writes laws','Escribe leyes'), O('It picks judges','Elige jueces'), O('It taxes the states','Cobra impuestos a los estados')]),
  Q('n50', 'What is one part of the judicial branch?', 'Nombra una parte de la rama judicial.', [
    O('Supreme Court','Corte Suprema',true), O('Congress','Congreso'), O('Cabinet','Gabinete'), O('Senate','Senado')]),
  Q('n51', 'What does the judicial branch do?', '¿Qué hace la rama judicial?', [
    O('Reviews laws','Revisa las leyes',true), O('Writes laws','Escribe leyes'), O('Vetoes laws','Veta leyes'), O('Signs bills','Firma proyectos')]),
  Q('n52', 'What is the highest court in the United States?', '¿Cuál es la corte más alta?', [
    O('The Supreme Court','La Corte Suprema',true), O('Federal District Court','Corte Federal de Distrito'), O('State Supreme Court','Corte Suprema Estatal'), O('Circuit Court','Corte de Circuito')]),
  Q('n53', 'How many seats are on the Supreme Court?', '¿Cuántos asientos tiene la Corte Suprema?', [
    O('9','9',true), O('6','6'), O('12','12'), O('7','7')]),
  Q('n54', 'How many Supreme Court justices are usually needed to decide a case?', '¿Cuántos jueces se necesitan para decidir un caso?', [
    O('5','5',true), O('9','9'), O('3','3'), O('All of them','Todos')]),
  Q('n55', 'How long do Supreme Court justices serve?', '¿Cuánto sirven los jueces de la Corte Suprema?', [
    O('For life','De por vida',true), O('10 years','10 años'), O('20 years','20 años'), O('Until 70','Hasta los 70')]),
  Q('n56', 'Supreme Court justices serve for life. Why?', '¿Por qué los jueces sirven de por vida?', [
    O('To be independent','Para ser independientes',true), O('Tradition','Tradición'), O('To save money','Para ahorrar'), O('To gain experience','Para ganar experiencia')]),
  Q('n57', 'Who is the Chief Justice of the United States now?', '¿Quién es el Juez Principal ahora?', [
    O('John Roberts','John Roberts',true), O('Clarence Thomas','Clarence Thomas'), O('Samuel Alito','Samuel Alito'), O('Sonia Sotomayor','Sonia Sotomayor')]),
  Q('n58', 'Name one power that is only for the federal government.', 'Nombra un poder solo del gobierno federal.', [
    O('Print paper money','Imprimir papel moneda',true), O('Issue driver licenses','Emitir licencias'), O('Run schools','Manejar escuelas'), O('Police local roads','Vigilar caminos')]),
  Q('n59', 'Name one power that is only for the states.', 'Nombra un poder solo de los estados.', [
    O('Give a driver\'s license','Dar licencia de conducir',true), O('Print money','Imprimir dinero'), O('Declare war','Declarar guerra'), O('Make treaties','Hacer tratados')]),
  Q('n60', 'What is the purpose of the 10th Amendment?', '¿Cuál es el propósito de la 10ª Enmienda?', [
    O('Powers not given to the federal government belong to the states or the people','Poderes no dados al gobierno federal son de los estados o el pueblo',true), O('Right to bear arms','Derecho a portar armas'), O('Free speech','Libertad de expresión'), O('Vote for president','Votar por presidente')]),
  Q('n61', 'Who is the governor of your state now?', '¿Quién es tu gobernador ahora?', [
    O('Answers vary by state','Varía por estado',true), O('The President','El Presidente'), O('A senator','Un senador'), O('The mayor','El alcalde')]),
  Q('n62', 'What is the capital of your state?', '¿Cuál es la capital de tu estado?', [
    O('Answers vary by state','Varía por estado',true), O('Washington, D.C.','Washington, D.C.'), O('New York','Nueva York'), O('Los Angeles','Los Ángeles')]),
  Q('n63', 'There are four amendments to the U.S. Constitution about who can vote. Describe one of them.', 'Hay cuatro enmiendas sobre quién puede votar. Describe una.', [
    O('Any citizen can vote (regardless of race, sex, or age 18+)','Cualquier ciudadano puede votar',true), O('Only landowners','Solo propietarios'), O('Only men','Solo hombres'), O('Only college graduates','Solo graduados')]),
  Q('n64', 'Who can vote in federal elections, run for federal office, and serve on a jury?', '¿Quién puede votar en elecciones federales, ser candidato y servir en jurado?', [
    O('Citizens','Ciudadanos',true), O('Anyone living in the U.S.','Todos los residentes'), O('Adults over 21','Adultos de 21+'), O('Property owners','Propietarios')]),
  Q('n65', 'What are three rights of everyone living in the United States?', '¿Cuáles son tres derechos de todos los residentes?', [
    O('Freedom of speech, religion, and assembly','Libertad de expresión, religión y reunión',true), O('Vote, run for office, jury','Votar, candidatear, jurado'), O('Driver license, ID, passport','Licencia, ID, pasaporte'), O('Marriage, divorce, adoption','Matrimonio, divorcio, adopción')]),
  Q('n66', 'What do we show loyalty to when we say the Pledge of Allegiance?', '¿A qué mostramos lealtad al decir el Juramento de Lealtad?', [
    O('The United States (and the flag)','A los Estados Unidos (y la bandera)',true), O('Our state','Nuestro estado'), O('The President','El Presidente'), O('Our city','Nuestra ciudad')]),
  Q('n67', 'Name two promises that new citizens make in the Oath of Allegiance.', 'Nombra dos promesas del Juramento.', [
    O('Obey laws and be loyal to the United States','Obedecer las leyes y ser leal a EE.UU.',true), O('Pay tuition and vote','Pagar matrícula y votar'), O('Buy a house and a car','Comprar casa y carro'), O('Speak English and Spanish','Hablar inglés y español')]),
  Q('n68', 'How can people become United States citizens?', '¿Cómo pueden las personas hacerse ciudadanas?', [
    O('Naturalize','Naturalizarse',true), O('Buy a green card','Comprar residencia'), O('Marry a soldier','Casarse con un soldado'), O('Win the lottery','Ganar la lotería')]),
  Q('n69', 'What are two examples of civic participation in the United States?', 'Dos ejemplos de participación cívica.', [
    O('Vote and run for office','Votar y postularse',true), O('Drive and shop','Conducir y comprar'), O('Watch TV and read','Ver TV y leer'), O('Pay rent and work','Pagar renta y trabajar')]),
  Q('n70', 'What is one way Americans can serve their country?', '¿Cómo pueden los americanos servir a su país?', [
    O('Vote','Votar',true), O('Pay rent','Pagar renta'), O('Travel abroad','Viajar al extranjero'), O('Watch the news','Ver noticias')]),
  Q('n71', 'Why is it important to pay federal taxes?', '¿Por qué es importante pagar impuestos?', [
    O('Required by law','Requerido por ley',true), O('To gain citizenship','Para hacerse ciudadano'), O('To vote','Para votar'), O('To get a passport','Para conseguir pasaporte')]),
  Q('n72', 'It is important for all men age 18 through 25 to register for Selective Service. Name one reason why.', 'Los hombres de 18 a 25 deben registrarse al Servicio Selectivo. ¿Por qué?', [
    O('Required by law','Requerido por ley',true), O('To get a job','Para conseguir trabajo'), O('To vote','Para votar'), O('To go to college','Para ir a la universidad')]),
  Q('n73', 'The colonists came to America for many reasons. Name one.', 'Los colonos vinieron por muchas razones. Nombra una.', [
    O('Freedom','Libertad',true), O('Television','Televisión'), O('Jobs in tech','Empleos en tecnología'), O('Sports','Deportes')]),
  Q('n74', 'Who lived in America before the Europeans arrived?', '¿Quiénes vivían en América antes de los europeos?', [
    O('Native Americans (American Indians)','Nativos americanos (Indios)',true), O('Africans','Africanos'), O('Asians','Asiáticos'), O('Russians','Rusos')]),
  Q('n75', 'What group of people was taken and sold as slaves?', '¿Qué grupo fue tomado y vendido como esclavo?', [
    O('Africans','Africanos',true), O('Europeans','Europeos'), O('Native Americans','Nativos americanos'), O('Chinese','Chinos')]),
  Q('n76', 'What war did the Americans fight to win independence from Britain?', '¿Qué guerra ganó la independencia de Gran Bretaña?', [
    O('American Revolution','Revolución Americana',true), O('Civil War','Guerra Civil'), O('War of 1812','Guerra de 1812'), O('World War I','PGM')]),
  Q('n77', 'Name one reason why the Americans declared independence from Britain.', 'Una razón para declarar independencia.', [
    O('High taxes','Impuestos altos',true), O('Religion','Religión'), O('Climate','Clima'), O('Food','Comida')]),
  Q('n78', 'Who wrote the Declaration of Independence?', '¿Quién escribió la Declaración?', [
    O('Thomas Jefferson','Thomas Jefferson',true), O('George Washington','George Washington'), O('Ben Franklin','Ben Franklin'), O('John Adams','John Adams')]),
  Q('n79', 'When was the Declaration of Independence adopted?', '¿Cuándo se adoptó la Declaración?', [
    O('July 4, 1776','4 de julio de 1776',true), O('July 4, 1789','4 de julio de 1789'), O('December 25, 1776','25 de diciembre de 1776'), O('January 1, 1800','1 de enero de 1800')]),
  Q('n80', 'The American Revolution had many important events. Name one.', 'Nombra un evento de la Revolución Americana.', [
    O('Declaration of Independence','Declaración de Independencia',true), O('The moon landing','Llegada a la luna'), O('Civil War','Guerra Civil'), O('Great Depression','Gran Depresión')]),
  Q('n81', 'There were 13 original states. Name five.', 'Hubo 13 estados originales. Nombra cinco.', [
    O('Massachusetts, New York, New Hampshire, New Jersey, Delaware','Massachusetts, NY, New Hampshire, NJ, Delaware',true), O('California, Texas, Florida, Ohio, Illinois','CA, TX, FL, OH, IL'), O('Alaska, Hawaii, Nevada, Utah, Idaho','AK, HI, NV, UT, ID'), O('Washington, Oregon, Montana, Wyoming, Maine','WA, OR, MT, WY, ME')]),
  Q('n82', 'What founding document was written in 1787?', '¿Qué documento fundador se escribió en 1787?', [
    O('The Constitution','La Constitución',true), O('Declaration of Independence','Declaración'), O('Bill of Rights','Carta de Derechos'), O('Articles of Confederation','Artículos de la Confederación')]),
  Q('n83', 'The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.', 'Los Federalistas apoyaron la Constitución. Nombra un autor.', [
    O('John Jay (or James Madison, or Alexander Hamilton)','John Jay (o Madison, o Hamilton)',true), O('Thomas Jefferson','Thomas Jefferson'), O('George Washington','George Washington'), O('Ben Franklin','Ben Franklin')]),
  Q('n84', 'Why were the Federalist Papers important?', '¿Por qué fueron importantes los Federalistas?', [
    O('They helped people understand the Constitution','Ayudaron a entender la Constitución',true), O('They started a war','Iniciaron una guerra'), O('They freed slaves','Liberaron esclavos'), O('They created Congress','Crearon el Congreso')]),
  Q('n85', 'Benjamin Franklin is famous for many things. Name one.', 'Benjamin Franklin es famoso por muchas cosas. Nombra una.', [
    O('U.S. diplomat','Diplomático de EE.UU.',true), O('First President','Primer Presidente'), O('Civil War general','General de la Guerra Civil'), O('Wrote the Constitution','Escribió la Constitución')]),
  Q('n86', 'George Washington is famous for many things. Name one.', 'George Washington es famoso por muchas cosas.', [
    O('First President of the United States','Primer Presidente de EE.UU.',true), O('Wrote the Declaration','Escribió la Declaración'), O('Freed the slaves','Liberó esclavos'), O('Civil War President','Presidente de la Guerra Civil')]),
  Q('n87', 'Thomas Jefferson is famous for many things. Name one.', 'Thomas Jefferson es famoso por muchas cosas.', [
    O('Writer of the Declaration of Independence','Escribió la Declaración',true), O('First President','Primer Presidente'), O('Civil War general','General de la Guerra Civil'), O('Founded the Bank','Fundó el Banco')]),
  Q('n88', 'James Madison is famous for many things. Name one.', 'James Madison es famoso por muchas cosas.', [
    O('One of the writers of the Federalist Papers','Uno de los autores de los Federalistas',true), O('Wrote the Declaration','Escribió la Declaración'), O('First President','Primer Presidente'), O('Civil War general','General de la Guerra Civil')]),
  Q('n89', 'Alexander Hamilton is famous for many things. Name one.', 'Alexander Hamilton es famoso por muchas cosas.', [
    O('One of the writers of the Federalist Papers','Uno de los autores de los Federalistas',true), O('First President','Primer Presidente'), O('Wrote the Declaration','Escribió la Declaración'), O('Civil War general','General de la Guerra Civil')]),
  Q('n90', 'What territory did the United States buy from France in 1803?', '¿Qué territorio compró EE.UU. de Francia en 1803?', [
    O('Louisiana (Territory)','Louisiana',true), O('Alaska','Alaska'), O('Texas','Texas'), O('Florida','Florida')]),
  Q('n91', 'Name one war fought by the United States in the 1800s.', 'Nombra una guerra del siglo XIX.', [
    O('Civil War','Guerra Civil',true), O('World War I','PGM'), O('World War II','SGM'), O('Vietnam War','Guerra de Vietnam')]),
  Q('n92', 'Name the U.S. war between the North and the South.', 'La guerra entre el Norte y el Sur.', [
    O('The Civil War','La Guerra Civil',true), O('American Revolution','Revolución Americana'), O('War of 1812','Guerra de 1812'), O('Mexican-American War','Guerra mexicano-americana')]),
  Q('n93', 'The Civil War had many important events. Name one.', 'Un evento importante de la Guerra Civil.', [
    O('Emancipation Proclamation','Proclamación de Emancipación',true), O('Moon landing','Llegada a la luna'), O('Boston Tea Party','Motín del Té'), O('Pearl Harbor','Pearl Harbor')]),
  Q('n94', 'Abraham Lincoln is famous for many things. Name one.', 'Abraham Lincoln es famoso por muchas cosas.', [
    O('Freed the slaves','Liberó a los esclavos',true), O('Wrote the Declaration','Escribió la Declaración'), O('First President','Primer Presidente'), O('WWII general','General de la SGM')]),
  Q('n95', 'What did the Emancipation Proclamation do?', '¿Qué hizo la Proclamación de Emancipación?', [
    O('Freed the slaves','Liberó a los esclavos',true), O('Started Civil War','Inició la Guerra Civil'), O('Ended WWII','Terminó la SGM'), O('Created the Constitution','Creó la Constitución')]),
  Q('n96', 'What U.S. war ended slavery?', '¿Qué guerra terminó la esclavitud?', [
    O('The Civil War','La Guerra Civil',true), O('Revolutionary War','Guerra Revolucionaria'), O('WWI','PGM'), O('WWII','SGM')]),
  Q('n97', 'What amendment says all persons born or naturalized in the United States are U.S. citizens?', '¿Qué enmienda dice que todos los nacidos o naturalizados son ciudadanos?', [
    O('14th Amendment','14ª Enmienda',true), O('1st Amendment','1ª Enmienda'), O('10th Amendment','10ª Enmienda'), O('22nd Amendment','22ª Enmienda')]),
  Q('n98', 'When did all men get the right to vote?', '¿Cuándo obtuvieron todos los hombres el derecho a votar?', [
    O('After the Civil War','Después de la Guerra Civil',true), O('1776','1776'), O('After WWII','Después de la SGM'), O('After Vietnam','Después de Vietnam')]),
  Q('n99', "Name one leader of the women's rights movement in the 1800s.", 'Nombra una líder del movimiento por los derechos de las mujeres en el siglo XIX.', [
    O('Susan B. Anthony','Susan B. Anthony',true), O('Hillary Clinton','Hillary Clinton'), O('Michelle Obama','Michelle Obama'), O('Eleanor Roosevelt','Eleanor Roosevelt')]),
  Q('n100', 'Name one war fought by the United States in the 1900s.', 'Una guerra del siglo XX.', [
    O('World War I','PGM',true), O('Civil War','Guerra Civil'), O('American Revolution','Revolución'), O('War of 1812','Guerra de 1812')]),
  Q('n101', 'Why did the U.S. enter World War I?', '¿Por qué entró EE.UU. a la PGM?', [
    O('To support the allied powers','Para apoyar a los aliados',true), O('To get land','Para tomar tierras'), O('For oil','Por petróleo'), O('To stop communism','Para detener el comunismo')]),
  Q('n102', 'When did all women get the right to vote?', '¿Cuándo obtuvieron todas las mujeres el voto?', [
    O('After World War I','Después de la PGM',true), O('After WWII','Después de la SGM'), O('1776','1776'), O('After Civil War','Después de la Guerra Civil')]),
  Q('n103', 'What was the Great Depression?', '¿Qué fue la Gran Depresión?', [
    O('Longest economic recession in modern history','La recesión más larga de la era moderna',true), O('A war','Una guerra'), O('A holiday','Un feriado'), O('A movement','Un movimiento')]),
  Q('n104', 'When did the Great Depression start?', '¿Cuándo empezó la Gran Depresión?', [
    O('Stock market crash of 1929','El colapso bursátil de 1929',true), O('1776','1776'), O('1941','1941'), O('1865','1865')]),
  Q('n105', 'Who was president during the Great Depression and World War II?', '¿Quién era presidente durante la Gran Depresión y la SGM?', [
    O('(Franklin) Roosevelt','(Franklin) Roosevelt',true), O('Lincoln','Lincoln'), O('Washington','Washington'), O('Eisenhower','Eisenhower')]),
  Q('n106', 'Why did the United States enter World War II?', '¿Por qué entró EE.UU. a la SGM?', [
    O('To support the allied powers','Para apoyar a los aliados',true), O('For land','Por tierras'), O('To stop the Civil War','Para detener la Guerra Civil'), O('For oil','Por petróleo')]),
  Q('n107', 'Dwight Eisenhower is famous for many things. Name one.', 'Dwight Eisenhower es famoso por muchas cosas.', [
    O('General during World War II','General durante la SGM',true), O('First President','Primer Presidente'), O('Civil War general','General de la Guerra Civil'), O('Wrote the Declaration','Escribió la Declaración')]),
  Q('n108', "Who was the United States' main rival during the Cold War?", '¿Quién fue el principal rival durante la Guerra Fría?', [
    O('Russia (Soviet Union)','Rusia (Unión Soviética)',true), O('Germany','Alemania'), O('Japan','Japón'), O('China','China')]),
  Q('n109', 'During the Cold War, what was one main concern of the United States?', 'Una preocupación principal durante la Guerra Fría.', [
    O('Communism','El comunismo',true), O('Trade','Comercio'), O('Sports','Deportes'), O('Climate','Clima')]),
  Q('n110', 'Why did the United States enter the Korean War?', '¿Por qué entró EE.UU. a la Guerra de Corea?', [
    O('To stop the spread of communism','Para detener la propagación del comunismo',true), O('For oil','Por petróleo'), O('For land','Por tierras'), O('Religious freedom','Libertad religiosa')]),
  Q('n111', 'Why did the United States enter the Vietnam War?', '¿Por qué entró a Vietnam?', [
    O('To stop the spread of communism','Para detener el comunismo',true), O('For oil','Por petróleo'), O('For land','Por tierras'), O('For tradition','Por tradición')]),
  Q('n112', 'What did the civil rights movement do?', '¿Qué hizo el movimiento por los derechos civiles?', [
    O('Fought to end racial discrimination','Luchó para acabar con la discriminación racial',true), O('Started a war','Inició una guerra'), O('Wrote the Constitution','Escribió la Constitución'), O('Freed colonies','Liberó colonias')]),
  Q('n113', 'Martin Luther King, Jr. is famous for many things. Name one.', 'Martin Luther King Jr. es famoso por muchas cosas.', [
    O('Fought for civil rights','Luchó por los derechos civiles',true), O('First President','Primer Presidente'), O('Civil War general','General de la Guerra Civil'), O('Wrote the Declaration','Escribió la Declaración')]),
  Q('n114', 'Why did the United States enter the Persian Gulf War?', '¿Por qué entró EE.UU. a la Guerra del Golfo?', [
    O('To force the Iraqi military from Kuwait','Para sacar al ejército iraquí de Kuwait',true), O('For oil','Por petróleo'), O('Communism','Comunismo'), O('Religion','Religión')]),
  Q('n115', 'What major event happened on September 11, 2001 in the United States?', '¿Qué pasó el 11 de septiembre de 2001?', [
    O('Terrorists attacked the United States','Terroristas atacaron a EE.UU.',true), O('Stock market crash','Colapso bursátil'), O('Civil War ended','Terminó la Guerra Civil'), O('First moon landing','Llegada a la luna')]),
  Q('n116', 'Name one U.S. military conflict after the September 11, 2001 attacks.', 'Un conflicto militar después del 11 de septiembre.', [
    O('War in Afghanistan','Guerra de Afganistán',true), O('Civil War','Guerra Civil'), O('WWI','PGM'), O('Korean War','Corea')]),
  Q('n117', 'Name one American Indian Tribe in the United States.', 'Nombra una tribu indígena americana.', [
    O('Hopi (or: Cherokee, Navajo, Sioux, Apache, etc.)','Hopi (o: Cherokee, Navajo, Sioux, Apache, etc.)',true), O('Aztecs','Aztecas'), O('Incas','Incas'), O('Mayans','Mayas')]),
  Q('n118', 'Name one example of an American innovation.', 'Un ejemplo de una innovación americana.', [
    O('Airplane (or: light bulb, telephone, internet, etc.)','Avión (o: foco, teléfono, internet, etc.)',true), O('Pasta','Pasta'), O('Compass','Brújula'), O('Wheel','Rueda')]),
  Q('n119', 'What is the capital of the United States?', '¿Cuál es la capital?', [
    O('Washington, D.C.','Washington, D.C.',true), O('New York','Nueva York'), O('Philadelphia','Filadelfia'), O('Los Angeles','Los Ángeles')]),
  Q('n120', 'Where is the Statue of Liberty?', '¿Dónde está la Estatua de la Libertad?', [
    O('New York Harbor','Puerto de Nueva York',true), O('Boston Harbor','Puerto de Boston'), O('San Francisco Bay','Bahía de San Francisco'), O('Washington D.C.','Washington D.C.')]),
  Q('n121', 'Why does the flag have 13 stripes?', '¿Por qué la bandera tiene 13 franjas?', [
    O('Because there were 13 original colonies','Porque hubo 13 colonias originales',true), O('For 13 founders','Por 13 fundadores'), O('For 13 wars','Por 13 guerras'), O('For 13 states','Por 13 estados actuales')]),
  Q('n122', 'Why does the flag have 50 stars?', '¿Por qué tiene 50 estrellas?', [
    O('Because there are 50 states','Porque hay 50 estados',true), O('Founders','Fundadores'), O('Wars','Guerras'), O('Colonies','Colonias')]),
  Q('n123', 'What is the name of the national anthem?', '¿Cómo se llama el himno nacional?', [
    O('The Star-Spangled Banner','La Bandera Estrellada',true), O('America the Beautiful','América la hermosa'), O('God Bless America','Dios bendiga a América'), O('My Country, \'Tis of Thee','My Country, Tis of Thee')]),
  Q('n124', 'The Nation\'s first motto was "E Pluribus Unum." What does that mean?', '"E Pluribus Unum" significa...', [
    O('Out of many, one','De muchos, uno',true), O('In God We Trust','En Dios Confiamos'), O('Liberty for all','Libertad para todos'), O('Strength and honor','Fuerza y honor')]),
  Q('n125', 'What is Independence Day?', '¿Qué es el Día de la Independencia?', [
    O("The country's birthday","El cumpleaños del país",true), O("President's Day","Día del Presidente"), O("Veterans Day","Día de los Veteranos"), O("Memorial Day","Día de los Caídos")]),
  Q('n126', 'Name three national U.S. holidays.', 'Nombra tres feriados nacionales.', [
    O("Thanksgiving Day, Christmas Day, New Year's Day","Acción de Gracias, Navidad, Año Nuevo",true), O("Cinco de Mayo, St. Patrick's, Halloween","Cinco de Mayo, San Patricio, Halloween"), O("Black Friday, Cyber Monday, Tax Day","Viernes Negro, Lunes Cibernético, Día de Impuestos"), O("Easter, Father's Day, Mother's Day","Pascua, Día del Padre, Día de la Madre")]),
  Q('n127', 'What is Memorial Day?', '¿Qué es el Día de los Caídos?', [
    O('A holiday to honor soldiers who died in military service','Feriado para honrar a los soldados caídos',true), O("Country's birthday","El cumpleaños del país"), O("Election day","Día de elecciones"), O("Thanksgiving","Acción de Gracias")]),
  Q('n128', 'What is Veterans Day?', '¿Qué es el Día de los Veteranos?', [
    O('A holiday to honor people in the (U.S.) military','Feriado para honrar a quienes sirven en el ejército',true), O("Country's birthday","El cumpleaños del país"), O("Election day","Día de elecciones"), O("Thanksgiving","Acción de Gracias")])
];

var UNITS = [
  {id:1, banner:'u1', title:{en:'American Government',       es:'Gobierno americano'},        kicker:{en:'Unit 1', es:'Unidad 1'}},
  {id:2, banner:'u2', title:{en:'American History',          es:'Historia americana'},        kicker:{en:'Unit 2', es:'Unidad 2'}},
  {id:3, banner:'u3', title:{en:'Symbols & Geography',       es:'Símbolos y geografía'},      kicker:{en:'Unit 3', es:'Unidad 3'}},
  {id:4, banner:'u4', title:{en:'Rights & Responsibilities', es:'Derechos y responsabilidades'}, kicker:{en:'Unit 4', es:'Unidad 4'}}
];

var LESSONS = [
  {id:'principles', unit:1, pos:'c', title:{en:'Principles', es:'Principios'},
   intro:{en:'The foundation of U.S. government: the Constitution as supreme law, individual rights, and self-government. Expect 2–3 questions from this section on the real test.',
          es:'La base del gobierno: la Constitución como ley suprema, derechos individuales y autogobierno. Espera 2–3 preguntas de esta sección en el examen real.'},
   qIds:['p1','p2','p3','p4','p5']},
  {id:'rule-of-law', unit:1, pos:'r1', title:{en:'Rule of law', es:'Estado de derecho'},
   intro:{en:'Why no one — not even the President — is above the law. Covers the First Amendment, freedom of religion, and how government powers check each other. Common officer topics.',
          es:'Por qué nadie — ni el presidente — está por encima de la ley. Cubre la Primera Enmienda, libertad religiosa y cómo los poderes se controlan entre sí.'},
   qIds:['r1','r2','r3','r4','r5']},
  {id:'constitution', unit:1, pos:'r2', title:{en:'The Constitution', es:'La Constitución'},
   intro:{en:'The 1787 document that built the United States. Officers often ask exact dates and the role of George Washington here, so pay attention to the numbers.',
          es:'El documento de 1787 que formó EE.UU. Los oficiales suelen preguntar fechas exactas y sobre George Washington — presta atención a los números.'},
   qIds:['c1','c2','c3','c4','c5']},
  {id:'three-branches', unit:1, pos:'r1', title:{en:'Three branches', es:'Tres ramas'},
   intro:{en:'Legislative (Congress) makes laws, Executive (President) enforces them, Judicial (Courts) interprets them. You will be asked which branch does what.',
          es:'Legislativa (Congreso) hace leyes, Ejecutiva (Presidente) las aplica, Judicial (Cortes) las interpreta. Te preguntarán qué hace cada rama.'},
   qIds:['t1','t2','t3','t4','t5']},
  {id:'rights-freedoms', unit:1, pos:'c', title:{en:'Rights & freedoms', es:'Derechos y libertades'},
   intro:{en:'What citizenship actually means: rights only citizens have, responsibilities that come with it, and the promises in the Oath of Allegiance.',
          es:'Lo que realmente significa ser ciudadano: derechos solo de ciudadanos, responsabilidades que vienen con ellos, y las promesas del Juramento.'},
   qIds:['rf1','rf2','rf3','rf4','rf5']},
  {id:'unit-1-review', unit:1, pos:'l1', isChest:true, title:{en:'Unit 1 review', es:'Repaso Unidad 1'},
   qIds:['p1','r5','c2','t3','rf1']},

  {id:'colonial-era', unit:2, pos:'c', title:{en:'Colonial era', es:'Era colonial'},
   intro:{en:'Why Europeans came to America, who lived here first, and the 13 original colonies. Foundation knowledge that shows up throughout the test.',
          es:'Por qué los europeos vinieron, quién vivía aquí primero, y las 13 colonias originales. Conocimiento base que aparece en todo el examen.'},
   qIds:['h1','h2','h3','h4','h5']},
  {id:'independence', unit:2, pos:'l1', title:{en:'Independence', es:'Independencia'},
   intro:{en:'July 4, 1776 — the Declaration of Independence and George Washington as the first President. High-value test material; the date itself comes up often.',
          es:'4 de julio, 1776 — la Declaración de Independencia y George Washington como primer presidente. Material de alto valor; la fecha aparece a menudo.'},
   qIds:['h6','h7','h8','h9','h10']},
  {id:'founding-era', unit:2, pos:'l2', title:{en:'Founding era', es:'Era fundacional'},
   intro:{en:'Abraham Lincoln, the Civil War, and the end of slavery. Some of the most-asked civics questions live here.',
          es:'Abraham Lincoln, la Guerra Civil y el fin de la esclavitud. Aquí viven algunas de las preguntas más frecuentes del examen.'},
   qIds:['h11','h12','h13','h14','h15']},
  {id:'civil-war-era', unit:2, pos:'l1', title:{en:'Civil War era', es:'Era de la Guerra Civil'},
   intro:{en:'1800s expansion, the Louisiana Purchase, the women\'s rights movement, and the 15th Amendment that gave men the right to vote regardless of race.',
          es:'Expansión del siglo XIX, la Compra de Luisiana, movimiento por los derechos de la mujer y la 15ª Enmienda.'},
   qIds:['h16','h17','h18','h19','h20']},
  {id:'modern-era', unit:2, pos:'c', title:{en:'1900s & modern', es:'Siglo XX y moderno'},
   intro:{en:'WWI, WWII, the Great Depression, and the civil rights movement led by Dr. Martin Luther King Jr. Recent history that USCIS treats as essential.',
          es:'PGM, SGM, la Gran Depresión y el movimiento de derechos civiles liderado por Dr. King. Historia reciente que USCIS considera esencial.'},
   qIds:['h21','h22','h23','h24','h25']},
  {id:'unit-2-review', unit:2, pos:'r1', isChest:true, title:{en:'Unit 2 review', es:'Repaso Unidad 2'},
   qIds:['h1','h7','h13','h18','h24']},

  {id:'national-symbols', unit:3, pos:'c', title:{en:'National symbols', es:'Símbolos nacionales'},
   intro:{en:'The flag, the national anthem, and the Statue of Liberty. The "what and where" of American identity — straightforward recall questions.',
          es:'La bandera, el himno nacional y la Estatua de la Libertad. El "qué y dónde" de la identidad americana — preguntas directas.'},
   qIds:['s1','s2','s3','s4','s5']},
  {id:'holidays', unit:3, pos:'r1', title:{en:'Holidays', es:'Feriados'},
   intro:{en:'Federal holidays, why they\'re celebrated, and Election Day. Quick factual recall — memorize the dates.',
          es:'Feriados federales, por qué se celebran, y el Día de Elecciones. Memoriza las fechas.'},
   qIds:['s6','s7','s8','s9','s10']},
  {id:'states-coasts', unit:3, pos:'r2', title:{en:'States & coasts', es:'Estados y costas'},
   intro:{en:'The Pacific and Atlantic oceans, states bordering Canada and Mexico, and Washington D.C. as the federal capital. Geography fundamentals.',
          es:'Los océanos Pacífico y Atlántico, estados que limitan con Canadá y México, y Washington D.C. como capital federal.'},
   qIds:['s11','s12','s13','s14','s15']},
  {id:'gov-numbers', unit:3, pos:'r1', title:{en:'Government numbers', es:'Números del gobierno'},
   intro:{en:'50 states, 100 senators, 435 House members, and how long each serves. Memorize the numbers — they come up word-for-word.',
          es:'50 estados, 100 senadores, 435 representantes, y cuánto duran sus mandatos. Memoriza los números — aparecen literalmente.'},
   qIds:['s16','s17','s18','s19','s20']},
  {id:'voting-courts', unit:3, pos:'c', title:{en:'Voting & courts', es:'Voto y cortes'},
   intro:{en:'When elections happen, term lengths for senators, and the Supreme Court\'s 9 justices. Civic-system fundamentals.',
          es:'Cuándo ocurren las elecciones, duración del mandato de senadores, y los 9 jueces de la Corte Suprema.'},
   qIds:['s21','s22','s23','s24','s25']},
  {id:'unit-3-review', unit:3, pos:'l1', isChest:true, title:{en:'Unit 3 review', es:'Repaso Unidad 3'},
   qIds:['s1','s7','s13','s18','s24']},

  {id:'becoming-citizen', unit:4, pos:'c', title:{en:'Becoming a citizen', es:'Hacerse ciudadano'},
   intro:{en:'The two ways to become a citizen, the minimum voting age, and what tests new citizens take. The big picture of the journey you\'re on.',
          es:'Las dos formas de ser ciudadano, edad mínima para votar, y qué exámenes toman los nuevos ciudadanos.'},
   qIds:['ci1','ci2','ci3','ci4','ci5']},
  {id:'voting', unit:4, pos:'r1', title:{en:'Voting & elections', es:'Voto y elecciones'},
   intro:{en:'The two major political parties, who can vote, and how Americans participate in democracy. Democratic basics.',
          es:'Los dos partidos políticos principales, quién puede votar, y cómo participar en la democracia.'},
   qIds:['vo1','vo2','vo3','vo4','vo5']},
  {id:'federal-states', unit:4, pos:'r2', title:{en:'Federal & state', es:'Federal y estatal'},
   intro:{en:'Powers belonging to the federal government vs. powers belonging to states. The President leads one, the Governor leads the other.',
          es:'Poderes del gobierno federal vs. poderes de los estados. El presidente lidera uno, el gobernador el otro.'},
   qIds:['fs1','fs2','fs3','fs4','fs5']},
  {id:'civic-engagement', unit:4, pos:'r1', title:{en:'Civic engagement', es:'Participación cívica'},
   intro:{en:'Ways Americans show love for their country, who the Constitution protects (everyone, not just citizens), and rights for all residents.',
          es:'Formas de mostrar amor por el país, a quién protege la Constitución (todos, no solo ciudadanos), y derechos para todos los residentes.'},
   qIds:['ce1','ce2','ce3','ce4','ce5']},
  {id:'taxes-service', unit:4, pos:'c', title:{en:'Taxes & service', es:'Impuestos y servicio'},
   intro:{en:'Selective Service registration for males 18+, April 15 tax day, and the responsibilities that come with citizenship. Practical adulthood.',
          es:'Registro al Servicio Selectivo para hombres 18+, 15 de abril como día de impuestos, y las responsabilidades del ciudadano.'},
   qIds:['tx1','tx2','tx3','tx4','tx5']},
  {id:'unit-4-review', unit:4, pos:'l1', isChest:true, title:{en:'Unit 4 review', es:'Repaso Unidad 4'},
   qIds:['ci1','vo1','fs3','ce5','tx2']}
];

var EXPLAIN = {
  p1: {en:'The Constitution is the highest law in the U.S. — every other law must agree with it.', es:'La Constitución es la ley más alta — todas las demás leyes deben estar de acuerdo con ella.'},
  p2: {en:'The Constitution sets up the government, defines its powers, and lists basic rights.', es:'La Constitución establece el gobierno, define sus poderes y enumera derechos básicos.'},
  p3: {en:'"We the People" begins the Preamble — meaning the people, not a king, hold power.', es:'"Nosotros el Pueblo" inicia el Preámbulo — el pueblo, no un rey, tiene el poder.'},
  p4: {en:'Amendments are how the Constitution can be changed. There are 27 so far.', es:'Las enmiendas son la forma de cambiar la Constitución. Hay 27 hasta ahora.'},
  p5: {en:'The first 10 amendments — the Bill of Rights — protect individual freedoms.', es:'Las primeras 10 enmiendas — la Carta de Derechos — protegen libertades individuales.'},
  r1: {en:'No one is above the law — not the President, not Congress, not the police.', es:'Nadie está por encima de la ley — ni el presidente, ni el Congreso, ni la policía.'},
  r2: {en:'The First Amendment protects speech, religion, press, assembly, and petition.', es:'La Primera Enmienda protege la expresión, religión, prensa, reunión y petición.'},
  r3: {en:'You can follow any religion, change religions, or have no religion at all.', es:'Puedes seguir cualquier religión, cambiar de religión, o no tener religión.'},
  r4: {en:'In a capitalist or market economy, businesses and people make their own economic choices.', es:'En una economía capitalista o de mercado, los negocios y las personas toman sus propias decisiones.'},
  r5: {en:'Separation of powers + checks and balances keep any one branch from getting too strong.', es:'La separación de poderes y los frenos y contrapesos evitan que una rama sea demasiado poderosa.'},
  c1: {en:'"We the People" expresses self-government — citizens choose how they are governed.', es:'"Nosotros el Pueblo" expresa el autogobierno — los ciudadanos eligen cómo se les gobierna.'},
  c2: {en:'The Constitution was written in 1787 and signed September 17, 1787 in Philadelphia.', es:'La Constitución se escribió en 1787 y se firmó el 17 de septiembre de 1787 en Filadelfia.'},
  c3: {en:'George Washington led the Constitutional Convention and was the first U.S. president.', es:'George Washington presidió la Convención Constitucional y fue el primer presidente de EE.UU.'},
  c4: {en:'The Preamble is the opening paragraph — it starts with "We the People."', es:'El Preámbulo es el párrafo inicial — comienza con "Nosotros el Pueblo".'},
  c5: {en:'The Constitution protects basic rights, sets up the government, and limits its power.', es:'La Constitución protege derechos básicos, establece el gobierno y limita su poder.'},
  t1: {en:'The three branches are Legislative (Congress), Executive (President), and Judicial (Courts).', es:'Las tres ramas son Legislativa (Congreso), Ejecutiva (Presidente) y Judicial (Cortes).'},
  t2: {en:'Congress writes federal laws. The President signs them; courts interpret them.', es:'El Congreso escribe las leyes federales. El presidente las firma; las cortes las interpretan.'},
  t3: {en:'Congress has two parts: the Senate (100 members) and the House (435 members).', es:'El Congreso tiene dos partes: el Senado (100 miembros) y la Cámara (435 miembros).'},
  t4: {en:'The President is Commander in Chief, even though the military is run by generals.', es:'El presidente es el Comandante en Jefe, aunque el ejército lo manejan los generales.'},
  t5: {en:'A bill becomes law when the President signs it. The President can also veto.', es:'Un proyecto se hace ley cuando el presidente lo firma. El presidente también puede vetar.'},
  rf1: {en:'The Declaration names "life, liberty, and the pursuit of happiness" as unalienable rights.', es:'La Declaración nombra "vida, libertad y la búsqueda de la felicidad" como derechos inalienables.'},
  rf2: {en:'Only U.S. citizens can serve on a federal jury and vote in federal elections.', es:'Solo los ciudadanos pueden servir en un jurado federal y votar en elecciones federales.'},
  rf3: {en:'Voting in federal elections is reserved for citizens — non-citizens cannot vote.', es:'Votar en elecciones federales es solo para ciudadanos — los no-ciudadanos no pueden votar.'},
  rf4: {en:'New citizens promise to give up loyalty to other countries and defend the Constitution.', es:'Los nuevos ciudadanos prometen renunciar a la lealtad a otros países y defender la Constitución.'},
  rf5: {en:'Freedom of expression and religion apply to everyone living in the U.S., not just citizens.', es:'La libertad de expresión y religión aplica a todos los que viven en EE.UU., no solo ciudadanos.'},

  h1: {en:'Most colonists came for freedom (religious, political, economic), or to escape persecution.', es:'La mayoría vinieron por libertad (religiosa, política, económica) o escapando de persecución.'},
  h2: {en:'American Indians / Native Americans had lived here for thousands of years before Europeans.', es:'Los indígenas vivían aquí miles de años antes que los europeos.'},
  h3: {en:'Africans were forcibly brought to America and sold as slaves starting in the 1600s.', es:'Los africanos fueron llevados a la fuerza y vendidos como esclavos desde el siglo XVII.'},
  h4: {en:'The 13 original colonies became the first 13 states. Virginia was the first founded (1607).', es:'Las 13 colonias originales se convirtieron en los primeros 13 estados. Virginia fue la primera (1607).'},
  h5: {en:'Thomas Jefferson was the main author of the Declaration of Independence.', es:'Thomas Jefferson fue el autor principal de la Declaración.'},
  h6: {en:'July 4, 1776 is celebrated as Independence Day every year.', es:'El 4 de julio de 1776 se celebra cada año como el Día de la Independencia.'},
  h7: {en:'The American Revolution (1775–1783) was fought to gain independence from Great Britain.', es:'La Revolución (1775-1783) se libró para independizarse de Gran Bretaña.'},
  h8: {en:'George Washington served as the first U.S. president (1789–1797).', es:'George Washington fue el primer presidente (1789-1797).'},
  h9: {en:'Religious freedom — escaping the Church of England — drove many early colonists.', es:'La libertad religiosa — escapar de la Iglesia de Inglaterra — motivó a muchos colonos.'},
  h10: {en:'The Federalist Papers were written by Hamilton, Madison, and Jay to support the Constitution.', es:'Los Federalistas fueron escritos por Hamilton, Madison y Jay para apoyar la Constitución.'},
  h11: {en:'Issued by Lincoln in 1863, it freed enslaved people in Confederate states.', es:'Emitida por Lincoln en 1863, liberó a los esclavos en estados confederados.'},
  h12: {en:'Lincoln led the country through the Civil War and preserved the Union.', es:'Lincoln lideró al país durante la Guerra Civil y preservó la Unión.'},
  h13: {en:'The Civil War (1861–1865) ended legal slavery in the U.S.', es:'La Guerra Civil (1861-1865) terminó la esclavitud legal.'},
  h14: {en:'Lincoln saved the Union, freed the slaves, and led the Civil War effort.', es:'Lincoln salvó la Unión, liberó a los esclavos y lideró la Guerra Civil.'},
  h15: {en:'The North (Union) fought the South (Confederacy) over slavery and states\' rights.', es:'El Norte (Unión) luchó contra el Sur (Confederación) por la esclavitud y derechos estatales.'},
  h16: {en:'Other 1800s wars: War of 1812, Mexican-American War, Spanish-American War.', es:'Otras guerras del siglo XIX: 1812, México-EE.UU., y España-EE.UU.'},
  h17: {en:'Susan B. Anthony was a leader for women\'s suffrage — the right to vote.', es:'Susan B. Anthony lideró el sufragio femenino — el derecho al voto.'},
  h18: {en:'The Louisiana Purchase doubled U.S. territory for about $15 million.', es:'La Compra de Luisiana duplicó el territorio por unos $15 millones.'},
  h19: {en:'Slavery, economic differences between North and South, and states\' rights all contributed.', es:'La esclavitud, diferencias económicas Norte-Sur, y derechos estatales contribuyeron.'},
  h20: {en:'The 15th Amendment (1870) prohibited denying the vote based on race.', es:'La Enmienda 15 (1870) prohibió negar el voto por raza.'},
  h21: {en:'1900s wars: WWI, WWII, Korean War, Vietnam War, and the Gulf War (1990–91).', es:'Guerras del siglo XX: PGM, SGM, Corea, Vietnam, y la Guerra del Golfo (1990-91).'},
  h22: {en:'Woodrow Wilson led the U.S. during WWI (1914–1918).', es:'Woodrow Wilson lideró durante la PGM (1914-1918).'},
  h23: {en:'FDR served four terms — the only president to do so — leading through the Depression and WWII.', es:'FDR sirvió cuatro mandatos — el único — durante la Depresión y la SGM.'},
  h24: {en:'The civil rights movement (1950s–60s) fought to end discrimination, especially against Black Americans.', es:'El movimiento de derechos civiles (1950-60) luchó contra la discriminación, sobre todo hacia negros.'},
  h25: {en:'Dr. King led nonviolent protests for civil rights and racial equality.', es:'Dr. King lideró protestas no violentas por derechos civiles e igualdad racial.'},

  s1: {en:'"The Star-Spangled Banner" was written by Francis Scott Key during the War of 1812.', es:'"La Bandera Estrellada" fue escrita por Francis Scott Key durante la Guerra de 1812.'},
  s2: {en:'Each star represents one of the 50 states.', es:'Cada estrella representa uno de los 50 estados.'},
  s3: {en:'The 13 stripes represent the original 13 colonies.', es:'Las 13 franjas representan las 13 colonias originales.'},
  s4: {en:'"The Stars and Stripes" is the common name for the U.S. flag.', es:'"Las Barras y Estrellas" es el nombre común de la bandera.'},
  s5: {en:'The Statue of Liberty stands on Liberty Island in New York Harbor.', es:'La Estatua de la Libertad está en la Isla de la Libertad, en el puerto de Nueva York.'},
  s6: {en:'Independence Day, July 4, commemorates the Declaration of Independence from 1776.', es:'El Día de la Independencia, 4 de julio, conmemora la Declaración de 1776.'},
  s7: {en:'Federal holidays include New Year\'s Day, July 4, Thanksgiving, Christmas, and more.', es:'Los feriados federales incluyen Año Nuevo, 4 de julio, Acción de Gracias, Navidad, y más.'},
  s8: {en:'Presidential elections happen on the Tuesday after the first Monday of November.', es:'Las elecciones presidenciales son el martes después del primer lunes de noviembre.'},
  s9: {en:'Independence Day marks when the 13 colonies declared independence from Britain.', es:'El Día de la Independencia marca cuando las 13 colonias se independizaron de Gran Bretaña.'},
  s10: {en:'Memorial Day honors service members who died in U.S. wars.', es:'El Día de los Caídos honra a los militares muertos en guerras.'},
  s11: {en:'The Pacific Ocean borders California, Oregon, Washington, Alaska, and Hawaii.', es:'El Océano Pacífico bordea California, Oregón, Washington, Alaska y Hawái.'},
  s12: {en:'The Atlantic Ocean borders the East Coast from Maine down to Florida.', es:'El Océano Atlántico bordea la costa este desde Maine hasta Florida.'},
  s13: {en:'States bordering Canada: ME, NH, VT, NY, PA, OH, MI, MN, ND, MT, ID, WA, AK.', es:'Estados que limitan con Canadá: ME, NH, VT, NY, PA, OH, MI, MN, ND, MT, ID, WA, AK.'},
  s14: {en:'States bordering Mexico: California, Arizona, New Mexico, and Texas.', es:'Estados que limitan con México: California, Arizona, Nuevo México y Texas.'},
  s15: {en:'Washington, D.C. is the federal capital, separate from any state.', es:'Washington, D.C. es la capital federal, separada de los estados.'},
  s16: {en:'50 states — the last two (Alaska and Hawaii) joined in 1959.', es:'50 estados — los últimos dos (Alaska y Hawái) se unieron en 1959.'},
  s17: {en:'Each state has 2 senators, regardless of population. Total = 100.', es:'Cada estado tiene 2 senadores. Total = 100.'},
  s18: {en:'House seats are based on each state\'s population — 435 voting members in total.', es:'Los escaños de la Cámara dependen de la población — 435 miembros con voto.'},
  s19: {en:'Senators serve 6-year terms; about 1/3 are up for election every 2 years.', es:'Los senadores sirven 6 años; alrededor de 1/3 se eligen cada 2 años.'},
  s20: {en:'House members serve 2-year terms — the whole House is up every election.', es:'Los representantes sirven 2 años — toda la Cámara se elige cada elección.'},
  s21: {en:'Presidential elections happen in November every 4 years.', es:'Las elecciones presidenciales son en noviembre cada 4 años.'},
  s22: {en:'A senator serves 6 years; senators can be re-elected without a term limit.', es:'Un senador sirve 6 años; pueden ser reelegidos sin límite de mandatos.'},
  s23: {en:'The Supreme Court is the highest federal court; its rulings are final.', es:'La Corte Suprema es la corte federal más alta; sus fallos son finales.'},
  s24: {en:'The Court has 9 justices: 1 Chief and 8 Associate Justices.', es:'La Corte tiene 9 jueces: 1 Presidente y 8 Asociados.'},
  s25: {en:'Checks and balances: each branch can limit the others\' powers.', es:'Frenos y contrapesos: cada rama limita los poderes de las otras.'},

  ci1: {en:'You\'re a citizen if born in the U.S. OR if you go through naturalization (the N-400 process).', es:'Eres ciudadano si naces en EE.UU. O si pasas por la naturalización (el proceso N-400).'},
  ci2: {en:'The 26th Amendment (1971) set the voting age at 18 for all federal elections.', es:'La Enmienda 26 (1971) estableció la edad de votar a 18 para elecciones federales.'},
  ci3: {en:'The U.S. allows dual citizenship; some countries (like India, China) don\'t. Check your country\'s rules.', es:'EE.UU. permite doble ciudadanía; algunos países (India, China) no. Revisa las reglas de tu país.'},
  ci4: {en:'After approval, USCIS schedules an Oath ceremony. You\'re a citizen the moment you take the Oath.', es:'Tras aprobación, USCIS programa una ceremonia. Eres ciudadano al tomar el Juramento.'},
  ci5: {en:'The English test has reading, writing, and speaking parts. The civics test is up to 10 questions.', es:'El examen de inglés tiene partes de lectura, escritura y habla. El de cívica son hasta 10 preguntas.'},
  vo1: {en:'The Democratic and Republican parties dominate U.S. elections; smaller parties exist too.', es:'Los partidos Demócrata y Republicano dominan; existen también partidos menores.'},
  vo2: {en:'15th (race), 19th (women), 24th (no poll tax), 26th (age 18) — all expanded voting rights.', es:'15 (raza), 19 (mujeres), 24 (sin impuesto al voto), 26 (edad 18) — todas ampliaron el voto.'},
  vo3: {en:'Only U.S. citizens age 18+ can vote in federal elections.', es:'Solo ciudadanos de 18 años o más pueden votar en elecciones federales.'},
  vo4: {en:'By federal law, Election Day is the Tuesday after the first Monday in November.', es:'Por ley federal, el Día de Elecciones es el martes después del primer lunes de noviembre.'},
  vo5: {en:'Democracy works when people participate — voting is the most common but not the only way.', es:'La democracia funciona cuando la gente participa — votar es la más común pero no la única.'},
  fs1: {en:'Federal powers include foreign policy, currency, treaties, war, and interstate commerce.', es:'Los poderes federales incluyen política exterior, moneda, tratados, guerra y comercio interestatal.'},
  fs2: {en:'States handle most day-to-day matters: schools, police, marriage, driver\'s licenses, zoning.', es:'Los estados manejan asuntos diarios: escuelas, policía, matrimonio, licencias, zonificación.'},
  fs3: {en:'Each state has a Governor, elected by the people of that state.', es:'Cada estado tiene un Gobernador, elegido por la gente de ese estado.'},
  fs4: {en:'The President is the head of the executive branch and Commander in Chief.', es:'El presidente dirige la rama ejecutiva y es el Comandante en Jefe.'},
  fs5: {en:'The Cabinet (15 department heads + VP) advises the President on policy and operations.', es:'El Gabinete (15 jefes + VP) asesora al presidente en política y operaciones.'},
  ce1: {en:'Patriotism takes many forms — voting and civic engagement are valued highly.', es:'El patriotismo toma muchas formas — votar y la participación cívica son muy valoradas.'},
  ce2: {en:'The Constitution protects everyone in the U.S. — including non-citizens — though rights differ.', es:'La Constitución protege a todos en EE.UU. — incluso no-ciudadanos — aunque los derechos difieren.'},
  ce3: {en:'Only citizens can vote in federal elections and serve on a federal jury.', es:'Solo los ciudadanos pueden votar en elecciones federales y servir en jurados federales.'},
  ce4: {en:'Local participation builds the democratic foundation — meetings, volunteering, and elections.', es:'La participación local es la base democrática — reuniones, voluntariado y elecciones.'},
  ce5: {en:'The Oath includes promises to defend the Constitution and obey U.S. laws.', es:'El Juramento incluye promesas de defender la Constitución y obedecer las leyes.'},
  tx1: {en:'Males must register with Selective Service within 30 days of their 18th birthday.', es:'Los hombres deben registrarse en el Servicio Selectivo dentro de 30 días de cumplir 18.'},
  tx2: {en:'Tax Day is April 15 (or the next business day if it falls on a weekend).', es:'El Día de Impuestos es el 15 de abril (o el siguiente día hábil).'},
  tx3: {en:'Taxes fund federal programs: military, Social Security, Medicare, schools, infrastructure.', es:'Los impuestos financian programas federales: ejército, Seguro Social, Medicare, escuelas, infraestructura.'},
  tx4: {en:'Common citizen responsibilities: pay taxes, obey laws, serve on jury, register for Selective Service.', es:'Responsabilidades comunes: pagar impuestos, obedecer leyes, servir en jurado, registrarse en el Servicio Selectivo.'},
  tx5: {en:'Federal income tax applies to anyone earning above the IRS threshold, citizen or not.', es:'El impuesto federal aplica a cualquiera que gana más del límite del IRS, ciudadano o no.'}
};

function findLesson(id){ for(var i=0;i<LESSONS.length;i++) if(LESSONS[i].id===id) return LESSONS[i]; return null; }
function findQ(id){
  for(var i=0;i<CIVICS.length;i++) if(CIVICS[i].id===id) return CIVICS[i];
  for(var j=0;j<CIVICS_2025.length;j++) if(CIVICS_2025[j].id===id) return CIVICS_2025[j];
  return null;
}
function shuffleArr(arr){
  var a = arr.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function todayISO(){
  var d = new Date();
  var m = d.getMonth()+1; if(m<10) m='0'+m;
  var dd = d.getDate(); if(dd<10) dd='0'+dd;
  return d.getFullYear()+'-'+m+'-'+dd;
}

function dailyXPGoal(){
  var p = user.progress || {};
  if(p.dailyXPGoal) return p.dailyXPGoal;
  var min = user.dailyMinutes || 5;
  if(min === 5) return 15;
  if(min === 10) return 30;
  if(min === 15) return 45;
  return 25;
}

function addXP(amount){
  var p = user.progress;
  if(!p) return;
  var today = todayISO();
  if(p.lastXPDate !== today){
    p.todayXP = 0;
    p.lastXPDate = today;
  }
  p.todayXP = (p.todayXP || 0) + amount;
  p.xp = (p.xp || 0) + amount;
}

function todayXP(){
  var p = user.progress || {};
  if(p.lastXPDate !== todayISO()) return 0;
  return p.todayXP || 0;
}

// ===== DOCUMENT VAULT =====
var DOC_CATS = [
  {id:'identity',     label:{en:'Identity',           es:'Identidad'},                icon:'id',        color:'#8c4dd1'},
  {id:'student',      label:{en:'Student status',     es:'Estatus estudiantil'},      icon:'book',      color:'#1cb0f6'},
  {id:'work',         label:{en:'Work authorization', es:'Autorización de trabajo'},  icon:'briefcase', color:'#00b4a8'},
  {id:'gc',           label:{en:'Green card',         es:'Residencia'},               icon:'id',        color:'#34c759'},
  {id:'records',      label:{en:'Records',            es:'Registros'},                icon:'book',      color:'#1cb0f6'},
  {id:'family',       label:{en:'Family',             es:'Familia'},                  icon:'people',    color:'#ec4f93'},
  {id:'humanitarian', label:{en:'Protection',         es:'Protección'},               icon:'shield',    color:'#ff9b21'},
  {id:'fees',         label:{en:'Fees & forms',       es:'Tarifas y formularios'},    icon:'bill',      color:'#58cc02'}
];

var DOCUMENTS = [
  {id:'gc', cat:'identity', uscisForms:['I-90'], paths:['n400','family-ir','family-pref','family-lpr','employment'],
    name:{en:'Green card (front + back)', es:'Residencia (frente y reverso)'},
    sub:{en:'Copy your Permanent Resident Card', es:'Copia tu tarjeta de residente permanente'},
    howTo:{en:'You already have this — it came in the mail when you became a permanent resident. Make clear color copies of BOTH sides of the most recent version of your I-551 card.',
           es:'Ya la tienes — llegó por correo cuando te hiciste residente. Haz copias a color claras de AMBOS lados de la versión más reciente de tu tarjeta I-551.'},
    tips:{en:['If lost or stolen, file Form I-90 to replace it.','If expired, it remains valid for naturalization — but USCIS may ask why you didn\'t renew.','Bring the ORIGINAL card to your interview, plus your copy.'],
          es:['Si se perdió o robó, presenta el Formulario I-90 para reemplazo.','Si vencida, aún es válida para naturalización — pero USCIS puede preguntar por qué no la renovaste.','Lleva la tarjeta ORIGINAL a tu entrevista, más tu copia.']},
    cost:{en:'$465 online ($415 paper) to replace via I-90', es:'$465 en línea ($415 en papel) con I-90'},
    time:{en:'Have it now; ~10–12 months for I-90 replacement', es:'La tienes ahora; ~10–12 meses para reemplazo I-90'}},

  {id:'stateId', cat:'identity', paths:['n400','family-ir','employment'],
    name:{en:"State ID / driver's license", es:'Identificación estatal / licencia'},
    sub:{en:'Current and unexpired', es:'Vigente'},
    howTo:{en:'Apply at your local DMV. Bring proof of identity (green card + passport), proof of residence (two utility bills), and your Social Security number.',
           es:'Aplica en tu DMV local. Lleva prueba de identidad (residencia + pasaporte), prueba de domicilio (dos facturas) y tu número de Seguro Social.'},
    tips:{en:['Must be unexpired at your interview date.','If your name on this ID differs from other documents, USCIS will want an explanation.'],
          es:['Debe estar vigente en la fecha de tu entrevista.','Si tu nombre en esta ID es diferente al de otros documentos, USCIS pedirá una explicación.']},
    cost:{en:'$30–$60 depending on state', es:'$30–$60 según el estado'},
    time:{en:'Same day to 4 weeks', es:'Mismo día a 4 semanas'}},

  {id:'passports', cat:'identity', paths:['n400','student','opt','workvisa','family-ir','family-pref','family-lpr','employment','asylum'],
    name:{en:'All passports', es:'Todos los pasaportes'},
    sub:{en:'Current and expired, every country', es:'Vigentes y vencidos, todos los países'},
    howTo:{en:'Collect every passport you\'ve ever held — from every country of citizenship — including expired ones. Pull them from old document storage, parents\' files, or safe-deposit boxes.',
           es:'Reúne cada pasaporte que hayas tenido — de cada país de ciudadanía — incluidos los vencidos. Búscalos en archivos viejos, con tus padres, o en cajas de seguridad.'},
    tips:{en:['USCIS examines each passport at the interview to track travel history.','Don\'t throw out expired passports — they\'re your proof of past trips.','If you lost one, get an official letter from the issuing consulate.'],
          es:['USCIS examina cada pasaporte en la entrevista para rastrear tu historial de viajes.','No tires los vencidos — son la prueba de tus viajes pasados.','Si perdiste uno, consigue una carta oficial del consulado emisor.']},
    cost:{en:'Free if you have them; $130+ to replace via consulate', es:'Gratis si los tienes; $130+ para reemplazo en consulado'},
    time:{en:'Pull from records; up to 8 weeks for replacements', es:'Búscalos en tus archivos; hasta 8 semanas para reemplazos'}},

  {id:'photos', cat:'identity', paths:['n400','family-ir','employment','asylum'],
    name:{en:'Two passport-style photos', es:'Dos fotos tipo pasaporte'},
    sub:{en:'2 x 2 in, white background', es:'2 x 2 pulg, fondo blanco'},
    howTo:{en:'Get them at Walgreens, CVS, Costco, AAA, or any photo printing service. Just ask for "passport photos." They handle the spec automatically.',
           es:'Sácalas en Walgreens, CVS, Costco, AAA o cualquier servicio de fotos. Solo pide "fotos de pasaporte". Ellos manejan la especificación.'},
    tips:{en:['Take them within 30 days of submitting your application.','Neutral facial expression, no glasses, no hat.','You only need two — but bring extras to your interview just in case.'],
          es:['Tómalas dentro de 30 días de presentar tu aplicación.','Expresión neutral, sin lentes, sin sombrero.','Solo necesitas dos — pero lleva extras a la entrevista por si acaso.']},
    cost:{en:'$15–$20', es:'$15–$20'},
    time:{en:'15 minutes', es:'15 minutos'}},

  {id:'taxes', cat:'records', paths:['n400','family-ir','employment'],
    name:{en:'Tax returns (last 5 years)', es:'Declaraciones (últimos 5 años)'},
    sub:{en:'IRS transcripts also work', es:'Transcripciones del IRS también sirven'},
    howTo:{en:'Get free IRS tax transcripts at irs.gov/individuals/get-transcript — online (instant) or by mail via Form 4506-T (5–10 days). Use 3 years if you\'re applying under the 3-year rule.',
           es:'Consigue transcripciones gratis del IRS en irs.gov/individuals/get-transcript — en línea (al instante) o por correo con el Formulario 4506-T (5–10 días). Usa 3 años si aplicas bajo la regla de 3 años.'},
    tips:{en:['IRS transcripts are stronger than self-prepared copies — USCIS prefers them.','If you filed jointly, you\'ll see your spouse\'s name too.','If you didn\'t earn enough to file, get a "Verification of Non-filing Letter" instead.'],
          es:['Las transcripciones del IRS son más fuertes que copias propias — USCIS las prefiere.','Si presentaste conjunto, verás también el nombre de tu cónyuge.','Si no ganaste lo suficiente para presentar, consigue una "Carta de Verificación de No-Presentación".']},
    cost:{en:'Free', es:'Gratis'},
    time:{en:'Instant online; 5–10 days by mail', es:'Inmediato en línea; 5–10 días por correo'}},

  {id:'travel', cat:'records', paths:['n400','family-ir','employment','asylum'],
    name:{en:'Travel history', es:'Historial de viajes'},
    sub:{en:'Every trip outside the U.S. > 24 hrs', es:'Cada viaje fuera de EE.UU. > 24 horas'},
    howTo:{en:'Pull your official I-94 travel record at i94.cbp.dhs.gov — it logs entries to the U.S. by air and sea. Cross-reference with your passport stamps to fill in dates.',
           es:'Saca tu registro oficial I-94 en i94.cbp.dhs.gov — registra entradas a EE.UU. por aire y mar. Verifica con sellos de tu pasaporte para completar fechas.'},
    tips:{en:['Land border crossings (Mexico/Canada) often don\'t appear in I-94 — list them from memory.','Even short trips count (anything > 24 hours).','Use Google Calendar, photos, or credit card records to jog your memory.'],
          es:['Cruces terrestres (México/Canadá) muchas veces no aparecen en I-94 — listálos de memoria.','Incluso viajes cortos cuentan (cualquier cosa > 24 horas).','Usa Google Calendar, fotos o registros de tarjeta para recordar.']},
    cost:{en:'Free', es:'Gratis'},
    time:{en:'5 minutes for I-94; longer to reconstruct', es:'5 minutos para el I-94; más para reconstruir'}},

  {id:'arrests', cat:'records', optional:true, paths:['n400','family-ir','employment','asylum'],
    name:{en:'Records of any arrests', es:'Registros de arrestos'},
    sub:{en:'Even if charges were dropped', es:'Aunque los cargos hayan sido retirados'},
    howTo:{en:'Request police records from the law enforcement agency that handled each incident, and court records from the court clerk where the case was filed. Many states have online portals.',
           es:'Pide registros policiales de la agencia que manejó cada incidente, y registros judiciales del secretario del tribunal donde se presentó el caso. Muchos estados tienen portales en línea.'},
    tips:{en:['You must disclose dismissed, expunged, and sealed records — USCIS\'s background check will find them.','Get certified copies — USCIS may reject plain copies.','If you have ANY criminal history, talk to a lawyer before filing.'],
          es:['Debes revelar registros desestimados, eliminados y sellados — la verificación de USCIS los encontrará.','Consigue copias certificadas — USCIS puede rechazar copias simples.','Si tienes CUALQUIER antecedente, habla con un abogado antes de presentar.']},
    cost:{en:'$5–$50 per record', es:'$5–$50 por registro'},
    time:{en:'2–4 weeks', es:'2–4 semanas'}},

  {id:'marriage', cat:'family', conditional:'married', paths:['n400','family-ir'],
    name:{en:'Marriage certificate', es:'Acta de matrimonio'},
    sub:{en:'Required under 3-year rule', es:'Requerido bajo regla de 3 años'},
    howTo:{en:'Order a certified copy from the vital records office (or city/county clerk) in the state where you married. Most states have online ordering at the state Department of Health website.',
           es:'Pide una copia certificada de la oficina de registros vitales (o del secretario del condado/ciudad) en el estado donde te casaste. La mayoría de estados tienen pedido en línea.'},
    tips:{en:['You need a "certified" or "long-form" copy — not just an informational copy.','If married abroad, the certificate may need an Apostille for U.S. recognition.','Order 2 copies — keep one at home, send one with N-400.'],
          es:['Necesitas una copia "certificada" o "long-form" — no solo una informacional.','Si te casaste fuera, la copia puede necesitar Apostilla para reconocimiento en EE.UU.','Pide 2 copias — guarda una en casa, envía una con el N-400.']},
    cost:{en:'$15–$40 per copy', es:'$15–$40 por copia'},
    time:{en:'2–6 weeks', es:'2–6 semanas'}},

  {id:'spouseProof', cat:'family', conditional:'married', paths:['n400','family-ir'],
    name:{en:"Spouse's proof of citizenship", es:'Prueba de ciudadanía del cónyuge'},
    sub:{en:'Birth cert, passport, or N-550', es:'Acta, pasaporte o N-550'},
    howTo:{en:"Your U.S.-citizen spouse provides ONE of: a certified U.S. birth certificate, a current U.S. passport, or their Certificate of Naturalization (Form N-550 / N-570).",
           es:'Tu cónyuge ciudadano provee UNA de: acta de nacimiento certificada de EE.UU., pasaporte vigente de EE.UU., o su Certificado de Naturalización (Formulario N-550 / N-570).'},
    tips:{en:["A driver's license is NOT proof of citizenship.",'If spouse is naturalized, the N-550 is best.','Make a clear color copy — keep the original.'],
          es:['Una licencia de conducir NO es prueba de ciudadanía.','Si el cónyuge es naturalizado, el N-550 es lo mejor.','Haz una copia clara a color — guarda el original.']},
    cost:{en:'Free if available; $20–$40 to order copies', es:'Gratis si está disponible; $20–$40 para copias'},
    time:{en:'Have it now or 4–6 weeks', es:'Lo tienes ahora o 4–6 semanas'}},

  {id:'priorMarriage', cat:'family', optional:true, paths:['n400','family-ir'],
    name:{en:'Divorce / death records', es:'Divorcio / acta de defunción'},
    sub:{en:'For prior marriages, you or spouse', es:'De matrimonios anteriores, tuyos o del cónyuge'},
    howTo:{en:'Order certified copies from the vital records or court office where the divorce was finalized or the death occurred. You need records for EVERY prior marriage of you AND your spouse.',
           es:'Pide copias certificadas de la oficina de registros vitales o tribunal donde se finalizó el divorcio o ocurrió el fallecimiento. Necesitas registros de CADA matrimonio anterior tuyo Y de tu cónyuge.'},
    tips:{en:['Certified copies only — informational copies are rejected.','If divorce was abroad, may need an Apostille.','If you don\'t have it, USCIS can find it themselves — but it slows your case.'],
          es:['Solo copias certificadas — las informacionales se rechazan.','Si el divorcio fue en el extranjero, puede necesitar Apostilla.','Si no la tienes, USCIS puede encontrarla — pero retrasa tu caso.']},
    cost:{en:'$15–$50 per record', es:'$15–$50 por registro'},
    time:{en:'2–6 weeks', es:'2–6 semanas'}},

  {id:'fee', cat:'fees', uscisForms:['I-912','G-1450'], paths:['n400'],
    name:{en:'Filing fee ($760 paper, $710 online) or fee waiver', es:'Tarifa ($760 papel, $710 en línea) o exención'},
    sub:{en:'Form I-912 if you qualify for a waiver', es:'Formulario I-912 si calificas para exención'},
    howTo:{en:'Pay by check or money order to "U.S. Department of Homeland Security," or by credit card with Form G-1450. To request a waiver, file Form I-912 with proof of income or means-tested benefits.',
           es:'Paga con cheque o money order a "U.S. Department of Homeland Security," o con tarjeta usando el Formulario G-1450. Para pedir exención, presenta el Formulario I-912 con prueba de ingresos o beneficios.'},
    tips:{en:['Fee waiver: receiving Medicaid, SNAP, SSI, or TANF auto-qualifies you.','Income below 150% of federal poverty also qualifies (~$22,500/year for one person).','Many people qualify and don\'t know it — check before paying.'],
          es:['Exención: recibir Medicaid, SNAP, SSI o TANF te califica automáticamente.','Ingreso por debajo del 150% del nivel federal de pobreza también califica (~$22,500/año para una persona).','Muchas personas califican y no lo saben — verifica antes de pagar.']},
    cost:{en:'$760 paper, $710 online — or $0 with approved I-912', es:'$760 papel, $710 en línea — o $0 con I-912 aprobado'},
    time:{en:'Immediate', es:'Inmediato'}},

  {id:'n400', cat:'fees', uscisForms:['N-400'], paths:['n400'],
    name:{en:'Completed Form N-400', es:'Formulario N-400 completo'},
    sub:{en:'Filled, signed, and dated', es:'Completo, firmado y fechado'},
    howTo:{en:'Download the current version from uscis.gov/n-400. It\'s 20 pages. Fill it out in black ink (or type and print) — use the "N-400 walkthrough" in this app for a section-by-section guide.',
           es:'Descarga la versión actual de uscis.gov/n-400. Son 20 páginas. Llénala con tinta negra (o escribe y imprime) — usa la "Guía del N-400" de esta app como ayuda.'},
    tips:{en:['Always use the LATEST version — outdated versions are rejected.','Sign and date every page that asks for a signature.','Make a copy of EVERYTHING you mail to USCIS before sending.','You can also file online via my.uscis.gov.'],
          es:['Siempre usa la versión MÁS RECIENTE — las viejas se rechazan.','Firma y fecha cada página que pida firma.','Haz copia de TODO antes de enviar a USCIS.','También puedes presentar en línea en my.uscis.gov.']},
    cost:{en:'Free to download', es:'Gratis descargar'},
    time:{en:'2–4 hours to fill carefully', es:'2–4 horas para llenarlo bien'}},

  // ===== PATH-SPECIFIC DOCS =====
  {id:'i20', cat:'identity', paths:['student','opt'],
    name:{en:'Form I-20', es:'Formulario I-20'},
    sub:{en:'Certificate of Eligibility for F-1/M-1 status', es:'Certificado de Elegibilidad para estatus F-1/M-1'},
    howTo:{en:'Your school\'s Designated School Official (DSO) issues your I-20 once you\'re accepted. Keep every version — original entry, transfer, program extension, OPT recommendation, STEM extension. Each is a chapter of your status.',
           es:'El DSO (Oficial Escolar Designado) de tu escuela emite tu I-20 al ser aceptado. Guarda cada versión — entrada inicial, transferencia, extensión de programa, recomendación de OPT, extensión STEM. Cada una es un capítulo de tu estatus.'},
    tips:{en:['Sign and date page 2 of every I-20 the day you receive it.','Never let it expire while you\'re in the U.S. — talk to your DSO 90 days before.','Take your I-20 every time you re-enter the U.S.'],
          es:['Firma y fecha la página 2 de cada I-20 el día que la recibes.','Nunca dejes que venza mientras estés en EE.UU. — habla con tu DSO 90 días antes.','Lleva tu I-20 cada vez que reentres a EE.UU.']},
    cost:{en:'Free from your school', es:'Gratis de tu escuela'},
    time:{en:'Have it now', es:'Ya la tienes'}},

  {id:'i94', cat:'identity', paths:['student','opt','workvisa','asylum'],
    name:{en:'I-94 Arrival/Departure Record', es:'I-94 Registro de Entrada/Salida'},
    sub:{en:'Proof of legal entry — pull every 6 months', es:'Prueba de entrada legal — descarga cada 6 meses'},
    howTo:{en:'Download the latest from i94.cbp.dhs.gov. Enter your passport number + country of citizenship. Save the PDF — it logs every U.S. arrival.',
           es:'Descarga la más reciente de i94.cbp.dhs.gov. Ingresa tu número de pasaporte + país de ciudadanía. Guarda el PDF — registra cada entrada a EE.UU.'},
    tips:{en:['Check the admit-until date — that\'s when your status expires.','Land border crossings (Mexico/Canada) might not appear — add manually for travel history.','Free from CBP — never pay for an "I-94 lookup service."'],
          es:['Revisa la fecha "admit-until" — es cuando expira tu estatus.','Cruces terrestres (México/Canadá) pueden no aparecer — agrégalos manualmente.','Gratis de CBP — nunca pagues por un "servicio de búsqueda I-94".']},
    cost:{en:'Free', es:'Gratis'},
    time:{en:'2 minutes online', es:'2 minutos en línea'}},

  {id:'sevisFee', cat:'fees', paths:['student'],
    name:{en:'SEVIS fee receipt (I-901)', es:'Recibo de tarifa SEVIS (I-901)'},
    sub:{en:'Paid before visa interview', es:'Pagada antes de la entrevista de visa'},
    howTo:{en:'Pay the $350 SEVIS I-901 fee at fmjfee.com. You\'ll need the SEVIS ID from your I-20. Print the receipt — bring it to your consulate interview.',
           es:'Paga la tarifa SEVIS I-901 de $350 en fmjfee.com. Necesitas el SEVIS ID de tu I-20. Imprime el recibo — llévalo a la entrevista en el consulado.'},
    tips:{en:['Must be paid at least 3 days before your consulate visa interview.','Required for F-1, M-1, and J-1 — different forms each.','Keep the receipt — you may need it again to re-enter the U.S.'],
          es:['Debe pagarse al menos 3 días antes de tu entrevista de visa.','Requerido para F-1, M-1 y J-1 — formulario distinto cada uno.','Guarda el recibo — puede que lo necesites de nuevo para reentrar.']},
    cost:{en:'$350 (F-1/M-1) or $220 (J-1)', es:'$350 (F-1/M-1) o $220 (J-1)'},
    time:{en:'Immediate after payment', es:'Inmediato después del pago'}},

  {id:'ead', cat:'work', paths:['opt','asylum'], uscisForms:['I-765'],
    name:{en:'EAD (Employment Authorization)', es:'EAD (Autorización de Empleo)'},
    sub:{en:'Your work permit card', es:'Tu permiso de trabajo'},
    howTo:{en:'File Form I-765 with USCIS. Asylum applicants: free after 150 days. OPT applicants: $470 online ($520 paper) + your I-20 endorsed for OPT. Once approved, the EAD card arrives by mail.',
           es:'Presenta el Formulario I-765 con USCIS. Solicitantes de asilo: gratis después de 150 días. Solicitantes OPT: $470 en línea ($520 en papel) + tu I-20 endosado para OPT. Una vez aprobado, la tarjeta EAD llega por correo.'},
    tips:{en:['You CANNOT work until you have the EAD card in hand.','OPT card lists a specific start date — don\'t start work until then.','If expired or lost, you stop being authorized to work immediately.'],
          es:['NO PUEDES trabajar hasta tener la tarjeta EAD en mano.','La tarjeta OPT lista una fecha de inicio específica — no empieces a trabajar antes.','Si expira o se pierde, dejas de estar autorizado a trabajar inmediatamente.']},
    cost:{en:'$470 online, $520 paper (OPT) or $0 (asylum)', es:'$470 en línea, $520 papel (OPT) o $0 (asilo)'},
    time:{en:'2–6 months', es:'2–6 meses'}},

  {id:'i797', cat:'work', paths:['workvisa','family-ir','employment'],
    name:{en:'I-797 Approval Notice', es:'Aviso de Aprobación I-797'},
    sub:{en:'Proof your petition was approved', es:'Prueba de que tu petición fue aprobada'},
    howTo:{en:'USCIS mails the I-797 to your employer (workvisa) or sponsor (family/employment GC) once your petition is approved. Get a copy — you\'ll need it for visa applications, GC adjustment, and travel.',
           es:'USCIS envía el I-797 a tu empleador (visa de trabajo) o patrocinador (residencia familiar/empleo) una vez aprobada tu petición. Obtén una copia — la necesitas para visas, ajuste de residencia y viajes.'},
    tips:{en:['The I-797B has a tear-off bottom — keep it intact (do not tear it off).','Save the original AND make copies.','Your petition is valid only until the I-797 expiration date.'],
          es:['El I-797B tiene una parte desprendible — mantenla intacta (no la arranques).','Guarda el original Y haz copias.','Tu petición es válida solo hasta la fecha de expiración del I-797.']},
    cost:{en:'Free (already covered by petition fee)', es:'Gratis (cubierto por la tarifa de petición)'},
    time:{en:'Arrives ~2 weeks after approval', es:'Llega ~2 semanas tras aprobación'}},

  {id:'i983', cat:'work', paths:['opt'], uscisForms:['I-983'],
    name:{en:'I-983 Training Plan (STEM OPT only)', es:'Plan de Entrenamiento I-983 (solo STEM OPT)'},
    sub:{en:'Required for the 24-month STEM extension', es:'Requerido para extensión STEM de 24 meses'},
    howTo:{en:'Get the I-983 from studyinthestates.dhs.gov. Fill out the training plan with your employer (must be E-Verify enrolled), then submit it to your DSO with your STEM extension request.',
           es:'Obtén el I-983 en studyinthestates.dhs.gov. Llena el plan de entrenamiento con tu empleador (debe estar inscrito en E-Verify), luego entrégalo a tu DSO con tu solicitud de extensión STEM.'},
    tips:{en:['Employer must be enrolled in E-Verify — check before applying.','Your training must directly relate to your degree.','Report any changes (employer, salary, role) to your DSO within 10 days.'],
          es:['El empleador debe estar inscrito en E-Verify — verifica antes de aplicar.','Tu entrenamiento debe relacionarse directamente con tu carrera.','Reporta cualquier cambio (empleador, salario, rol) a tu DSO en 10 días.']},
    cost:{en:'Free', es:'Gratis'},
    time:{en:'1–2 weeks with employer', es:'1–2 semanas con empleador'}},

  {id:'i589', cat:'records', paths:['asylum'], uscisForms:['I-589'],
    name:{en:'Form I-589 (Asylum Application)', es:'Formulario I-589 (Solicitud de Asilo)'},
    sub:{en:'Filed within 1 year of arrival', es:'Presentada dentro de 1 año de llegar'},
    howTo:{en:'Download Form I-589 from uscis.gov/i-589. The form asks for your story of persecution. Include corroborating evidence — affidavits, news reports, country conditions, medical records, etc.',
           es:'Descarga el Formulario I-589 de uscis.gov/i-589. El formulario pide tu historia de persecución. Incluye evidencia — declaraciones juradas, reportes, condiciones del país, registros médicos, etc.'},
    tips:{en:['MUST be filed within 1 year of entering the U.S. (with rare exceptions).','No filing fee.','Bring at least 3 copies to your interview.','An attorney is highly recommended — even pro bono.'],
          es:['DEBE presentarse dentro de 1 año de entrar a EE.UU. (con raras excepciones).','Sin tarifa.','Lleva al menos 3 copias a la entrevista.','Un abogado es muy recomendado — incluso pro bono.']},
    cost:{en:'Free', es:'Gratis'},
    time:{en:'Days to weeks to prepare', es:'Días o semanas para preparar'}},

  {id:'persecutionEvidence', cat:'records', paths:['asylum'], optional:false,
    name:{en:'Evidence of persecution', es:'Evidencia de persecución'},
    sub:{en:'Documents, photos, country reports', es:'Documentos, fotos, reportes del país'},
    howTo:{en:'Gather everything that supports your story: police reports, medical records, threatening letters, photos of injuries, news articles about events in your country, expert affidavits, witness declarations.',
           es:'Reúne todo lo que apoye tu historia: reportes policiales, registros médicos, cartas amenazantes, fotos de heridas, artículos de noticias sobre eventos en tu país, declaraciones de expertos y testigos.'},
    tips:{en:['Translate every non-English document with a certified translator.','Country-condition reports (State Dept, HRW, Amnesty) are powerful evidence.','Keep originals safe; submit copies.','Specific facts beat general claims.'],
          es:['Traduce cada documento no inglés con traductor certificado.','Reportes de condiciones del país (Dept de Estado, HRW, Amnistía) son evidencia poderosa.','Guarda originales; entrega copias.','Hechos específicos son mejor que afirmaciones generales.']},
    cost:{en:'Varies — translation $25–$50/page', es:'Varía — traducción $25–$50/página'},
    time:{en:'Weeks to months', es:'Semanas a meses'}}
];

// Returns the doc set tagged for this user's primary immigration path.
// Falls back to N-400 docs when no path matches.
function userDocPathKey(){
  var phase = user.phase;
  if(phase === 'student')  return 'student';
  if(phase === 'opt')      return 'opt';
  if(phase === 'workvisa') return 'workvisa';
  if(phase === 'asylum')   return 'asylum';
  if(phase === 'preGC'){
    var p = user.petitionType;
    if(p === 'family-ir')   return 'family-ir';
    if(p === 'family-pref') return 'family-pref';
    if(p === 'family-lpr')  return 'family-lpr';
    if(p === 'employment')  return 'employment';
    if(p === 'asylum')      return 'asylum';
  }
  // hasGC + other → naturalization docs
  return 'n400';
}

function docMatchesPath(d, pathKey){
  if(!d.paths || !d.paths.length) return pathKey === 'n400'; // legacy un-tagged docs default to N-400
  return d.paths.indexOf(pathKey) !== -1;
}

// Default returns the user's path docs. Pass {all:true} to return everything (for "Show all").
function applicableDocuments(opts){
  opts = opts || {};
  var pathKey = userDocPathKey();
  return DOCUMENTS.filter(function(d){
    if(d.conditional === 'married' && !user.marriedToCitizen) return false;
    if(opts.all) return true;
    return docMatchesPath(d, pathKey);
  });
}

// Document status: 'needed' (default) | 'progress' (working on it) | 'ready'.
// Stored in user.documents[id]: true = ready (legacy value kept), 'progress' = in progress.
function docStatusOf(id){
  var v = user.documents && user.documents[id];
  if(v === 'progress') return 'progress';
  return v ? 'ready' : 'needed';
}

function docsReady(){
  var apps = applicableDocuments();
  var ready = 0, inProgress = 0;
  for(var i=0;i<apps.length;i++){
    var s = docStatusOf(apps[i].id);
    if(s === 'ready') ready++;
    else if(s === 'progress') inProgress++;
  }
  return {ready: ready, inProgress: inProgress, total: apps.length};
}

function setDocStatus(id, status){
  if(!user.documents) user.documents = {};
  if(status === 'needed') delete user.documents[id];
  else if(status === 'progress') user.documents[id] = 'progress';
  else user.documents[id] = true;
  saveUser();
  // Re-render the entire home surface so "Your situation" + stats + next-action
  // pick up the new doc-readiness state immediately.
  try { renderAll(); } catch(e){ console.error(e); }
  renderDocs();
  if(docDetailId === id) renderDocDetail();
}

function toggleDocument(id){
  // List-row checkbox: quick toggle. In-progress docs complete to ready.
  setDocStatus(id, docStatusOf(id) === 'ready' ? 'needed' : 'ready');
}

var docDetailId = null;

function openDocDetail(docId){
  docDetailId = docId;
  go('docDetail');
  renderDocDetail();
}

function closeDocDetail(){
  docDetailId = null;
  go('docs');
}

function renderDocDetail(){
  if(!docDetailId) return;
  var doc = null;
  for(var i=0;i<DOCUMENTS.length;i++) if(DOCUMENTS[i].id === docDetailId){ doc = DOCUMENTS[i]; break; }
  if(!doc) return;
  var st = docStatusOf(doc.id);
  var cat = null;
  for(var c=0;c<DOC_CATS.length;c++) if(DOC_CATS[c].id === doc.cat){ cat = DOC_CATS[c]; break; }

  var crumb = document.getElementById('docDetailCrumb');
  if(crumb) crumb.textContent = (cat ? cat.icon + ' ' + cat.label[lang] : '');

  var body = document.getElementById('docDetailBody');
  if(!body) return;

  var statusBadge = st === 'ready'
    ? '<div class="docDetailStatus docDetailStatusYes">✓ '+(lang==='es'?'Listo':'Ready')+'</div>'
    : (st === 'progress'
      ? '<div class="docDetailStatus docDetailStatusProg">'+iconSVG('clock','#8a6d00',13)+' '+(lang==='es'?'En progreso':'In progress')+'</div>'
      : '<div class="docDetailStatus docDetailStatusNo">'+(lang==='es'?'Por conseguir':'Still needed')+'</div>');

  var optTag = doc.optional ? '<span class="docOpt">'+(lang==='es'?'opcional':'optional')+'</span>' : '';

  var tipsHtml = '';
  if(doc.tips && doc.tips[lang]){
    doc.tips[lang].forEach(function(tip){ tipsHtml += '<li>'+autolinkForms(tip)+'</li>'; });
  }

  var costTxt = (doc.cost && doc.cost[lang]) ? doc.cost[lang] : '';
  var timeTxt = (doc.time && doc.time[lang]) ? doc.time[lang] : '';

  var formButtons = '';
  if(doc.uscisForms && doc.uscisForms.length){
    doc.uscisForms.forEach(function(f){ formButtons += uscisFormButton(f); });
    formButtons = '<div class="docDetailSec">'+(lang==='es'?'📥 Descargar formulario':'📥 Get the form')+'</div>'
      + '<div class="docDetailForms">'+formButtons+'</div>';
  }

  var askCamiBtn = '';
  if(CAMI_AVAILABLE){
    askCamiBtn = '<button class="askCamiBtn" onclick="askCami(\''
      + (lang==='es' ? 'Cuéntame más sobre: '+doc.name.en : 'Tell me more about: '+doc.name.en).replace(/'/g, "\\'")
      + '\')">'
      + iconSVG('chevron','#fff',12) + ' '
      + (lang==='es' ? 'Pregúntale a Cami' : 'Ask Cami about this')
      + '</button>';
  }

  body.innerHTML =
      '<div class="docDetailTitle">'+doc.name[lang]+' '+optTag+'</div>'
    + '<div class="docDetailSub">'+doc.sub[lang]+'</div>'
    + statusBadge
    + formButtons
    + '<div class="docDetailSec">'+(lang==='es'?'📖 Cómo conseguirlo':'📖 How to get this')+'</div>'
    + '<div class="docDetailBody">'+autolinkForms(doc.howTo[lang] || doc.howTo.en)+'</div>'
    + (tipsHtml ? '<div class="docDetailSec">'+iconSVG('lightbulb','#ff9b21',16)+' '+(lang==='es'?'Consejos':'Tips')+'</div><ul class="docDetailTips">'+tipsHtml+'</ul>' : '')
    + '<div class="docDetailMeta">'
    +   (costTxt ? '<div class="docMetaCell"><div class="docMetaLabel">'+(lang==='es'?'Costo':'Cost')+'</div><div class="docMetaValue">'+costTxt+'</div></div>' : '')
    +   (timeTxt ? '<div class="docMetaCell"><div class="docMetaLabel">'+(lang==='es'?'Tiempo':'Time')+'</div><div class="docMetaValue">'+timeTxt+'</div></div>' : '')
    + '</div>'
    + askCamiBtn;

  var footer = document.querySelector('#docDetail .docDetailFooter');
  if(footer){
    var readyBtn = '<button class="cta docDetailToggle" onclick="setDocStatus(\''+doc.id+'\',\'ready\')">'+(lang==='es'?'Marcar como listo ✓':'Mark as ready ✓')+'</button>';
    var progBtn  = '<button class="cta docDetailToggle docDetailProgBtn" onclick="setDocStatus(\''+doc.id+'\',\'progress\')">'+(lang==='es'?'En progreso':'In progress')+'</button>';
    var undoBtn  = '<button class="cta docDetailToggle docDetailToggleUndo" onclick="setDocStatus(\''+doc.id+'\',\'needed\')">'+(lang==='es'?'Marcar como pendiente':'Mark as still needed')+'</button>';
    if(st === 'needed')        footer.innerHTML = progBtn + readyBtn;
    else if(st === 'progress') footer.innerHTML = undoBtn + readyBtn;
    else                       footer.innerHTML = undoBtn;
  }
}

// ===== FLASHCARDS =====
var FLASHCARD_SIZE = 15;
var flashState = null;

// Deterministic per-day picker. Same calendar date → same 15 questions; different day → different set.
function dailyFlashcardQIds(){
  var today = todayISO();
  var seed = 5381;
  for(var i=0;i<today.length;i++) seed = ((seed * 33) + today.charCodeAt(i)) | 0;
  seed = Math.abs(seed);
  var ids = CIVICS.map(function(c){ return c.id; });
  function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for(var k=ids.length-1; k>0; k--){
    var j = Math.floor(rand() * (k + 1));
    var tmp = ids[k]; ids[k] = ids[j]; ids[j] = tmp;
  }
  return ids.slice(0, Math.min(FLASHCARD_SIZE, ids.length));
}

function startFlashcards(){
  flashState = {
    qIds: dailyFlashcardQIds(),
    qIdx: 0,
    flipped: false,
    ratings: [],
    isDaily: true,
    forDate: todayISO()
  };
  go('flashcards');
  renderFlashcard();
}

function exitFlashcards(){
  if(ttsSupported()) try { window.speechSynthesis.cancel(); } catch(e){}
  flashState = null;
  go('home');
}

function flipFlashcard(){
  if(!flashState) return;
  flashState.flipped = true;
  renderFlashcard();
}

function rateFlashcard(rating){
  if(!flashState) return;
  var qId = flashState.qIds[flashState.qIdx];
  flashState.ratings.push({qId:qId, rating:rating});
  if(rating === 'hard'){
    var p = user.progress;
    if(!p.missedQs) p.missedQs = [];
    var ex = null;
    for(var i=0;i<p.missedQs.length;i++) if(p.missedQs[i].qId === qId){ ex = p.missedQs[i]; break; }
    if(ex){ ex.lastMissed = todayISO(); ex.reviewedCount = 0; }
    else p.missedQs.push({qId:qId, lastMissed:todayISO(), reviewedCount:0});
  } else if(rating === 'easy'){
    var p2 = user.progress;
    if(p2.missedQs){
      var idx = -1;
      for(var j=0;j<p2.missedQs.length;j++) if(p2.missedQs[j].qId === qId){ idx = j; break; }
      if(idx !== -1) p2.missedQs.splice(idx, 1);
    }
  }
  if(flashState.qIdx >= flashState.qIds.length - 1){
    return finishFlashcards();
  }
  flashState.qIdx++;
  flashState.flipped = false;
  renderFlashcard();
}

function finishFlashcards(){
  if(!flashState) return;
  var ratings = flashState.ratings;
  var easy = ratings.filter(function(r){return r.rating==='easy';}).length;
  var good = ratings.filter(function(r){return r.rating==='good';}).length;
  var hard = ratings.filter(function(r){return r.rating==='hard';}).length;
  addXP(8);

  // Daily completion + streak tracking (first completion of the day only)
  if(flashState.isDaily){
    var p = user.progress;
    if(!p.dailyFlashcards) p.dailyFlashcards = {lastCompleted:null, streak:0};
    var today = todayISO();
    if(p.dailyFlashcards.lastCompleted !== today){
      if(p.dailyFlashcards.lastCompleted){
        var d = new Date();
        var yMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()-1).getTime();
        var yy = new Date(yMs);
        var mm = yy.getMonth()+1; if(mm<10) mm='0'+mm;
        var dd = yy.getDate(); if(dd<10) dd='0'+dd;
        var yest = yy.getFullYear()+'-'+mm+'-'+dd;
        p.dailyFlashcards.streak = (p.dailyFlashcards.lastCompleted === yest) ? (p.dailyFlashcards.streak + 1) : 1;
      } else {
        p.dailyFlashcards.streak = 1;
      }
      p.dailyFlashcards.lastCompleted = today;
    }
  }

  saveUser();
  renderFlashcardResults(easy, good, hard);
}

function renderFlashcard(){
  if(!flashState) return;
  var qId = flashState.qIds[flashState.qIdx];
  var q = findQ(qId);
  if(!q) return;
  var counter = document.getElementById('flashCounter');
  if(counter) counter.textContent = (flashState.qIdx+1) + ' / ' + flashState.qIds.length;
  var fill = document.getElementById('flashProgressFill');
  if(fill) fill.style.width = ((flashState.qIdx + (flashState.flipped ? 0.5 : 0)) / flashState.qIds.length * 100) + '%';

  var body = document.getElementById('flashBody');
  var footer = document.getElementById('flashFooter');
  if(!body) return;

  var correctOpt = null;
  for(var i=0;i<q.options.length;i++) if(q.options[i].correct){ correctOpt = q.options[i]; break; }
  var answerText = correctOpt ? correctOpt[lang] : '—';
  var exp = EXPLAIN[qId];
  var expText = (exp && exp[lang]) || (exp && exp.en) || '';

  if(!flashState.flipped){
    body.innerHTML = '<div class="flashCardContainer">'
      + '<div class="flashCard flashFront">'
      +   '<div class="flashSide flashSideQ">'+(lang==='es' ? 'PREGUNTA' : 'QUESTION')+'</div>'
      +   '<div class="flashQText">'+q.q[lang]+'</div>'
      +   (ttsSupported() ? '<button class="flashSpeak" id="flashSpeakBtn">🔊 '+(lang==='es' ? 'Escuchar' : 'Listen')+'</button>' : '')
      + '</div>'
      + '<div class="flashHint">'+(lang==='es' ? 'Piensa la respuesta, luego voltea la carta' : 'Think of the answer, then flip the card')+'</div>'
      + '</div>';
    var sb = document.getElementById('flashSpeakBtn');
    if(sb) sb.onclick = function(){ speakInterview(q.q[lang]); };
  } else {
    body.innerHTML = '<div class="flashCardContainer">'
      + '<div class="flashCard flashBack">'
      +   '<div class="flashSide flashSideA">'+(lang==='es' ? 'RESPUESTA' : 'ANSWER')+'</div>'
      +   '<div class="flashAText">'+answerText+'</div>'
      +   '<div class="flashQRef">'+q.q[lang]+'</div>'
      + '</div>'
      + (expText ? '<div class="flashExplain"><div class="flashExpLabel">'+iconSVG('lightbulb','#ff9b21',14)+' '+(lang==='es' ? 'Por qué' : 'Why')+'</div><div class="flashExpText">'+expText+'</div></div>' : '')
      + '<div class="flashRateHint">'+(lang==='es' ? '¿Qué tan bien la sabías?' : 'How well did you know it?')+'</div>'
      + '</div>';
  }

  if(footer){
    if(!flashState.flipped){
      footer.innerHTML = '<button class="cta flashFlipBtn" onclick="flipFlashcard()">'+(lang==='es' ? 'Mostrar respuesta' : 'Show answer')+' →</button>';
    } else {
      footer.innerHTML = '<button class="flashRateBtn flashRateHard" onclick="rateFlashcard(\'hard\')">😅 '+(lang==='es' ? 'Difícil' : 'Hard')+'</button>'
        + '<button class="flashRateBtn flashRateGood" onclick="rateFlashcard(\'good\')">🙂 '+(lang==='es' ? 'Bien' : 'Good')+'</button>'
        + '<button class="flashRateBtn flashRateEasy" onclick="rateFlashcard(\'easy\')">😎 '+(lang==='es' ? 'Fácil' : 'Easy')+'</button>';
    }
  }
}

function renderFlashcardResults(easy, good, hard){
  var counter = document.getElementById('flashCounter');
  if(counter) counter.textContent = lang==='es' ? 'Resultado' : 'Result';
  var fill = document.getElementById('flashProgressFill');
  if(fill) fill.style.width = '100%';

  var body = document.getElementById('flashBody');
  var footer = document.getElementById('flashFooter');
  if(!body) return;

  var total = easy + good + hard;
  var p = user.progress;

  body.innerHTML = ''
    + '<div class="flashResultsHead">'
    +   '<div class="flashResultIcon">🎴</div>'
    +   '<div class="flashResultTitle">'+(lang==='es' ? '¡Sesión completa!' : 'Session complete!')+'</div>'
    +   '<div class="flashResultSub">'+total+' '+(lang==='es' ? 'cartas · +8 XP' : 'cards · +8 XP')+'</div>'
    + '</div>'
    + '<div class="flashBreakdown">'
    +   '<div class="flashBreakRow flashBVEasy"><div class="flashBreakDot">😎</div><div class="flashBreakLbl">'+(lang==='es'?'Fácil':'Easy')+'</div><div class="flashBreakVal">'+easy+'</div></div>'
    +   '<div class="flashBreakRow flashBVGood"><div class="flashBreakDot">🙂</div><div class="flashBreakLbl">'+(lang==='es'?'Bien':'Good')+'</div><div class="flashBreakVal">'+good+'</div></div>'
    +   '<div class="flashBreakRow flashBVHard"><div class="flashBreakDot">😅</div><div class="flashBreakLbl">'+(lang==='es'?'Difícil':'Hard')+'</div><div class="flashBreakVal">'+hard+'</div></div>'
    + '</div>'
    + (hard > 0 ? '<div class="flashTip">'+(lang==='es' ? 'Las '+hard+' difíciles están en tu lista de repaso.' : 'The '+hard+' hard ones are in your review queue.')+'</div>' : '');

  if(footer){
    footer.innerHTML = '<button class="cta" onclick="startFlashcards()">'+(lang==='es' ? '🔁 Otra sesión' : '🔁 Another session')+'</button>'
      + '<button class="flashBackBtn" onclick="exitFlashcards()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>';
  }
}

function renderHomeFlashcardCard(){
  var el = document.getElementById('homeFlashcardCard');
  if(!el) return;
  var p = user.progress || {};
  var df = p.dailyFlashcards || {};
  var doneToday = df.lastCompleted === todayISO();
  var streak = df.streak || 0;
  var pillTxt = lang==='es' ? 'Tarjetas diarias' : 'Daily flashcards';
  var titleTxt, subTxt, metaLeft, metaRight;
  if(doneToday){
    titleTxt = lang==='es' ? '¡Hecho por hoy!' : 'Done for today!';
    subTxt = lang==='es' ? 'Vuelve mañana — el set cambia cada día' : 'Come back tomorrow — set changes every day';
    metaLeft = '🔥 ' + streak + ' ' + (lang==='es' ? 'día'+(streak===1?'':'s') : 'day'+(streak===1?'':'s'));
    metaRight = (lang==='es' ? 'Repasar' : 'Replay') + ' →';
  } else {
    titleTxt = lang==='es' ? 'Tus 15 cartas de hoy' : "Today's 15 cards";
    subTxt = streak > 0
      ? (lang==='es' ? 'Mantén tu racha de '+streak+' · +8 XP' : 'Keep your '+streak+'-day streak · +8 XP')
      : (lang==='es' ? 'Cambia cada día · +8 XP' : 'Changes every day · +8 XP');
    metaLeft = '~3 ' + (lang==='es' ? 'min' : 'min') + ' · 15 ' + (lang==='es' ? 'cartas' : 'cards');
    metaRight = (lang==='es' ? 'Empezar' : 'Start') + ' →';
  }
  el.innerHTML = '<span class="pill">'+pillTxt+'</span>'
    + '<div class="lessonTitle">'+titleTxt+'</div>'
    + '<div class="lessonSub">'+subTxt+'</div>'
    + '<div class="lessonMeta"><span>'+metaLeft+'</span><span>'+metaRight+'</span></div>';
}

// ===== INTERVIEW SIMULATOR =====
var N400_REVIEW_QUESTIONS = [
  {key:'name', icon:'👤',
    q:{en:'What is your full name?', es:'¿Cuál es tu nombre completo?'},
    tip:{en:'State your full legal name exactly as on your N-400. Don\'t shorten.', es:'Di tu nombre completo legal exactamente como en tu N-400. No lo acortes.'}},
  {key:'country', icon:'🌍',
    q:{en:'What is your country of birth?', es:'¿Cuál es tu país de nacimiento?'},
    tip:{en:'Name the country as it is on your birth certificate.', es:'Nombra el país como aparece en tu acta de nacimiento.'}},
  {key:'gcDate', icon:'🪪',
    q:{en:'When did you become a lawful permanent resident?', es:'¿Cuándo te hiciste residente permanente?'},
    tip:{en:'Give the exact date on your green card — officers cross-check this.', es:'Da la fecha exacta de tu residencia — los oficiales lo verifican.'}},
  {key:'married', icon:'💍',
    q:{en:'Are you currently married?', es:'¿Estás casado/a actualmente?'},
    tip:{en:'A simple yes or no. If yes, the officer will ask follow-up questions.', es:'Un sí o no. Si sí, habrá preguntas adicionales.'}},
  {key:'marriageDate', icon:'💒', conditional:'married',
    q:{en:'On what date did you get married?', es:'¿En qué fecha te casaste?'},
    tip:{en:'Be exact. The officer matches against your marriage certificate.', es:'Sé exacto. El oficial verifica con tu acta de matrimonio.'}},
  {key:'trips', icon:'✈️',
    q:{en:'In the last 5 years, have you taken any trip outside the U.S. longer than 6 months?', es:'En los últimos 5 años, ¿has hecho algún viaje fuera de EE.UU. de más de 6 meses?'},
    tip:{en:'A trip over 6 months can break continuous residence. Be honest — passport stamps will show it.', es:'Un viaje de más de 6 meses puede romper la residencia continua. Sé honesto — los sellos del pasaporte lo muestran.'}},
  {key:'crime', icon:'⚖️',
    q:{en:'Have you EVER been arrested, charged, cited, or detained by any law enforcement officer for any reason?', es:'¿Has sido ALGUNA VEZ arrestado, acusado, citado, o detenido por algún oficial por cualquier motivo?'},
    tip:{en:'Disclose EVERYTHING — dismissed cases, traffic, juvenile, anything. The officer has your full background check.', es:'Revela TODO — casos desestimados, tráfico, juvenil, lo que sea. El oficial tiene tu verificación completa.'}},
  {key:'taxes', icon:'💰',
    q:{en:'Have you filed all your federal income tax returns?', es:'¿Has presentado todas tus declaraciones de impuestos federales?'},
    tip:{en:'If you owe back taxes, disclose it AND bring proof of a payment plan with the IRS.', es:'Si debes impuestos, revélalo Y trae prueba de un plan de pago con el IRS.'}},
  {key:'support', icon:'📜',
    q:{en:'Do you support the Constitution and form of government of the United States?', es:'¿Apoyas la Constitución y la forma de gobierno de EE.UU.?'},
    tip:{en:'The answer is yes — this is one of the most important questions of the interview.', es:'La respuesta es sí — es una de las preguntas más importantes de la entrevista.'}},
  {key:'oath', icon:'🇺🇸',
    q:{en:'Are you willing to take the Oath of Allegiance to the United States?', es:'¿Estás dispuesto/a a tomar el Juramento de Lealtad a EE.UU.?'},
    tip:{en:'Yes. The oath has 5 parts: renounce other allegiances, defend the Constitution, obey U.S. law, serve in the military if required, perform civil service if required.', es:'Sí. El juramento tiene 5 partes: renunciar a otras lealtades, defender la Constitución, obedecer la ley, servir en el ejército si es requerido, hacer servicio civil si es requerido.'}}
];

function expectedN400Answer(q){
  var k = q.key;
  if(k === 'name') return user.name || '—';
  if(k === 'country') return countryLabel(user.countryOfBirth || 'Other', lang);
  if(k === 'gcDate') return user.greenCardDate ? fmtDate(user.greenCardDate, lang) : '—';
  if(k === 'married') return user.marriedToCitizen ? (lang==='es'?'Sí':'Yes') : (lang==='es'?'No':'No');
  if(k === 'marriageDate') return user.marriageDate ? fmtDate(user.marriageDate, lang) : '—';
  if(k === 'trips'){
    if(user.monthsOutside === 'lt6') return (lang==='es' ? 'No' : 'No');
    if(user.monthsOutside === '6-18') return (lang==='es' ? 'No de un solo viaje, pero entre 6 y 18 meses en total' : 'No single trip, but 6 to 18 months total');
    if(user.monthsOutside === 'gt18') return (lang==='es' ? '⚠️ Sí — consulta legal' : '⚠️ Yes — legal consult');
    return (lang==='es' ? 'No estoy seguro' : 'Not sure');
  }
  if(k === 'crime') return user.criminalHistory ? (lang==='es' ? '⚠️ Sí — debes revelar todo con tu abogado' : '⚠️ Yes — disclose with your lawyer') : (lang==='es' ? 'No' : 'No');
  if(k === 'taxes') return (lang==='es' ? 'Sí, presento cada año' : 'Yes, I file every year');
  if(k === 'support') return (lang==='es' ? 'Sí' : 'Yes');
  if(k === 'oath') return (lang==='es' ? 'Sí, estoy dispuesto/a' : 'Yes, I am willing');
  return '—';
}

function expectedCivicsAnswer(qId){
  var q = findQ(qId);
  if(!q) return '—';
  for(var i=0;i<q.options.length;i++) if(q.options[i].correct) return q.options[i][lang];
  return '—';
}

function ttsSupported(){ return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }

// Chrome blocks speechSynthesis.speak() unless there's been a recent user gesture.
// We warm up by speaking a near-silent utterance on the first user click anywhere.
var ttsWarmedUp = false;
function warmupTTS(){
  if(ttsWarmedUp || !ttsSupported()) return;
  try {
    var u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.rate = 10;
    window.speechSynthesis.speak(u);
    ttsWarmedUp = true;
  } catch(e){}
}
if(typeof document !== 'undefined'){
  document.addEventListener('click', warmupTTS, {once: false, capture: true});
  document.addEventListener('touchstart', warmupTTS, {once: false, capture: true});
}

function speakInterview(text){
  if(!ttsSupported()) return;
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(humanizeOfficerText(text));
    // Reuse the high-quality officer voice when available so civics speak-aloud
    // doesn't fall back to the platform's default robotic voice.
    if(!IntvVoice.officerVoice) IntvVoice.officerVoice = pickOfficerVoice();
    if(IntvVoice.officerVoice && lang !== 'es') u.voice = IntvVoice.officerVoice;
    u.lang = (lang === 'es') ? 'es-US' : 'en-US';
    u.rate = 0.97;   // natural conversational pace
    u.pitch = 1.06;  // slightly warmer/higher — reads as a natural female voice, not flat/robotic
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch(e){}
}

// ===== VOICE INTERVIEW ENGINE (Web Speech API + lenient fuzzy matching) =====

var IntvVoice = {
  recognizer: null,
  officerVoice: null,
  initialized: false,
  micStream: null,        // persistent MediaStream so we don't re-prompt every turn
  mediaRecorder: null,
  audioChunks: [],
  // Audio analysis for the meter + voice activity detection
  audioCtx: null,
  analyser: null,
  meterRaf: null,
  // VAD state — updated each animation frame from the analyser
  vad: {
    speechStartedAt: 0,    // ts when amplitude first crossed speech threshold (0 = none yet)
    lastSpeechAt: 0,       // ts of most recent above-threshold sample
    avgLevel: 0,           // exponential moving average — used by pacing coach
    listenStartedAt: 0     // ts when current listen() began
  }
};

function isWebSpeechSupported(){
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

function initIntvVoice(){
  if(IntvVoice.initialized) return;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    var rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.lang = 'en-US';
    IntvVoice.recognizer = rec;
  }
  // Voice list often loads async; subscribe + try now
  if(ttsSupported()){
    try { window.speechSynthesis.onvoiceschanged = function(){ IntvVoice.officerVoice = pickOfficerVoice(); }; } catch(e){}
    IntvVoice.officerVoice = pickOfficerVoice();
  }
  IntvVoice.initialized = true;
}

function pickOfficerVoice(){
  if(!ttsSupported()) return null;
  var voices = window.speechSynthesis.getVoices();
  if(!voices || !voices.length) return null;

  // Score each voice. Higher = more natural-sounding officer.
  // iOS: prefer "Enhanced/Premium/Siri" voices. macOS: same. Chrome: prefer Google "Wavenet/Neural2".
  // Edge: prefer Microsoft "Aria/Guy/Davis/Ryan" natural voices. Avoid known novelty/compact voices.
  function score(v){
    var s = 0;
    var name = (v.name || '').toLowerCase();
    var voiceURI = (v.voiceURI || '').toLowerCase();
    var ln = (v.lang || '').toLowerCase();
    if(ln.indexOf('en-us') === 0)      s += 60;
    else if(ln.indexOf('en-gb') === 0) s += 40;
    else if(ln.indexOf('en') === 0)    s += 25;
    else return -200;
    // Premium / neural voice indicators
    if(/enhanced|premium|natural/.test(name) || /enhanced|premium|natural/.test(voiceURI)) s += 50;
    if(/siri/.test(name) || /siri/.test(voiceURI)) s += 45;
    if(/wavenet|neural2|chirp|polyglot/.test(name) || /wavenet|neural|chirp/.test(voiceURI)) s += 45;
    if(/microsoft\s+(aria|jenny|guy|davis|ryan|tony|christopher)/.test(name)) s += 35;
    // Known high-quality Apple voices (iOS + macOS)
    var applePremium = ['samantha','alex','allison','ava','tom','aaron','nicky','daniel','evan','karen','moira','rishi'];
    for(var i=0;i<applePremium.length;i++){
      if(name.indexOf(applePremium[i]) !== -1){ s += 22; break; }
    }
    // Prefer natural FEMALE voices for the interviewer.
    if(/(^|\W)(female|samantha|allison|ava|susan|karen|moira|nicky|zoe|kate|victoria|serena|tessa|fiona|aria|jenny|sonia|michelle|nora|joanna|salli|kimberly|kendra|emma|amy)(\W|$)/.test(name) ||
       /female/.test(voiceURI)) s += 32;
    // Push obviously male voices down so we land on a female one.
    if(/(^|\W)(male|alex|daniel|aaron|tom|james|fred|arthur|evan|david|guy|davis|ryan|tony|christopher|oliver|thomas|gordon|rishi|reed|eddy)(\W|$)/.test(name)) s -= 28;
    // Hard penalties for novelty / compact / low-quality voices that absolutely will sound robotic
    if(/compact/.test(name) || /compact/.test(voiceURI)) s -= 60;
    if(/novelty|whisper|bahh|bells|boing|bubbles|cellos|deranged|hysterical|good\s*news|bad\s*news|trinoids|pipe|albert|junior|zarvox|kathy|princess|ralph|organ/.test(name)) s -= 200;
    // Local (on-device) voices are higher quality on iOS — server fallbacks are choppy
    if(v.localService) s += 12;
    if(v.default) s += 4;
    return s;
  }

  var ranked = voices.map(function(v){ return { v: v, s: score(v) }; })
                     .filter(function(o){ return o.s > -100; })
                     .sort(function(a,b){ return b.s - a.s; });

  return ranked.length ? ranked[0].v : voices[0];
}

// Insert small pauses + ensure punctuation breathes — fights the "all one breath" robot tell.
function humanizeOfficerText(text){
  if(!text) return text;
  var t = String(text);
  // Add a soft pause after common introducers
  t = t.replace(/^(OK|Alright|All right|So|Now|Good morning|Good afternoon|Welcome|Question)\b\s*/i,
                function(m, p1){ return p1 + ', '; });
  // Ensure question marks + periods have a trailing space (some sources jam them)
  t = t.replace(/([?.!])(?=\S)/g, '$1 ');
  // Convert ellipses to actual pause-friendly punctuation
  t = t.replace(/\.\.\.+/g, '. ');
  // Trim runs of whitespace
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function speakAsOfficer(text, onEnd){
  speakOfficerInternal(text, { rate: 0.95, pitch: 0.97 }, onEnd);
}

// Slower + clearer for "hear it spoken" pronunciation playback.
// 0.78 = "ESL-friendly textbook" tempo without sounding mocking.
function speakAsOfficerSlow(text, onEnd){
  speakOfficerInternal(text, { rate: 0.78, pitch: 0.97 }, onEnd);
}

function speakOfficerInternal(text, opts, onEnd){
  if(!ttsSupported()){ if(onEnd) setTimeout(onEnd, 100); return; }
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(humanizeOfficerText(text));
    if(!IntvVoice.officerVoice) IntvVoice.officerVoice = pickOfficerVoice();
    if(IntvVoice.officerVoice) u.voice = IntvVoice.officerVoice;
    u.lang = 'en-US';
    u.rate = (opts && opts.rate) || 0.95;
    u.pitch = (opts && opts.pitch) || 0.97;
    u.volume = 1.0;
    u.onend = function(){ if(onEnd) onEnd(); };
    u.onerror = function(){ if(onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  } catch(e){ if(onEnd) onEnd(); }
}

// Public helper for verdict "Hear it spoken" button
function hearOfficialAnswer(){
  if(!intvState || !intvState.results.length) return;
  var last = intvState.results[intvState.results.length - 1];
  if(last && last.expected) speakAsOfficerSlow(last.expected);
}

async function ensureMicPermission(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    user.micPermission = 'unavailable';
    saveUser();
    return false;
  }
  // Keep an active stream around for the interview session — avoids re-prompting per turn.
  if(IntvVoice.micStream && IntvVoice.micStream.active){
    user.micPermission = 'granted';
    return true;
  }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({audio: true});
    IntvVoice.micStream = stream;
    user.micPermission = 'granted';
    saveUser();
    return true;
  } catch(e){
    user.micPermission = 'denied';
    saveUser();
    return false;
  }
}

function releaseMicStream(){
  if(IntvVoice.micStream){
    try { IntvVoice.micStream.getTracks().forEach(function(t){ t.stop(); }); } catch(e){}
    IntvVoice.micStream = null;
  }
}

function startAudioRecording(){
  if(!IntvVoice.micStream || !window.MediaRecorder) return;
  try {
    IntvVoice.audioChunks = [];
    var mimeType = '';
    var candidates = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'];
    for(var i=0;i<candidates.length;i++){
      if(MediaRecorder.isTypeSupported(candidates[i])){ mimeType = candidates[i]; break; }
    }
    var opts = mimeType ? {mimeType: mimeType} : {};
    var rec = new MediaRecorder(IntvVoice.micStream, opts);
    IntvVoice.mediaRecorder = rec;
    rec.ondataavailable = function(e){
      if(e.data && e.data.size > 0) IntvVoice.audioChunks.push(e.data);
    };
    rec.onstop = function(){
      if(IntvVoice.audioChunks.length === 0) return;
      var blob = new Blob(IntvVoice.audioChunks, {type: mimeType || 'audio/webm'});
      try {
        var url = URL.createObjectURL(blob);
        if(intvState) intvState.lastAudioUrl = url;
      } catch(e){}
      IntvVoice.audioChunks = [];
    };
    rec.start();
  } catch(e){
    // Recording is best-effort — the interview still works without it
  }
}

function stopAudioRecording(){
  if(IntvVoice.mediaRecorder && IntvVoice.mediaRecorder.state === 'recording'){
    try { IntvVoice.mediaRecorder.stop(); } catch(e){}
  }
}

function playUserAudio(url){
  if(!url) return;
  try {
    stopOfficerSpeaking();
    var audio = new Audio(url);
    audio.play().catch(function(){});
  } catch(e){}
}

function revokeAllAudioUrls(){
  if(!intvState || !intvState.results) return;
  for(var i=0;i<intvState.results.length;i++){
    var u = intvState.results[i].audioUrl;
    if(u) try { URL.revokeObjectURL(u); } catch(e){}
  }
}

// Lenient matching: normalize, expand number words, score by keyword hits + Levenshtein.
var INTV_NUM_WORDS = {
  'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','ten':'10',
  'eleven':'11','twelve':'12','thirteen':'13','fourteen':'14','fifteen':'15','sixteen':'16','seventeen':'17',
  'eighteen':'18','nineteen':'19','twenty':'20','twenty-one':'21','twenty-two':'22','twenty-three':'23',
  'twenty-four':'24','twenty-five':'25','twenty-six':'26','twenty-seven':'27','thirty':'30','forty':'40',
  'fifty':'50','sixty':'60','seventy':'70','eighty':'80','ninety':'90','hundred':'100','thousand':'1000'
};
var INTV_STOPWORDS = {'the':1,'a':1,'an':1,'of':1,'to':1,'in':1,'is':1,'was':1,'were':1,'and':1,'or':1,'on':1,'at':1,'for':1,'this':1,'that':1,'with':1,'by':1,'be':1,'are':1,'as':1,'from':1,'it':1,'i':1,'we':1,'my':1};

// Synonym map — collapses paraphrase variants to a single canonical token before matching.
// Order matters: longer phrases first so e.g. "united states" doesn't get split to "us united states".
var INTV_SYNONYMS = [
  [/\b(u\s*s\s*a|u\s*s\s*of\s*a|united\s+states\s+of\s+america|the\s+united\s+states|america|american|americas)\b/g, 'unitedstates'],
  [/\bu\s*s\b/g, 'unitedstates'],
  [/\b(d\s*c|district\s+of\s+columbia)\b/g, 'washington'],
  [/\bvp\b/g, 'vicepresident'],
  [/\bv\s*p\b/g, 'vicepresident'],
  [/\bpotus\b/g, 'president'],
  [/\bscotus\b/g, 'supremecourt'],
  [/\bfdr\b/g, 'franklinrooseveltt'],
  [/\bsupreme\s+court\b/g, 'supremecourt'],
  [/\bvice\s+president\b/g, 'vicepresident'],
  [/\bcommander\s*[-\s]\s*in\s*[-\s]\s*chief\b/g, 'commanderinchief'],
  [/\bbill\s+of\s+rights\b/g, 'billofrights'],
  [/\bcivil\s+rights\b/g, 'civilrights'],
  [/\bdeclaration\s+of\s+independence\b/g, 'declarationofindependence'],
  [/\bchecks\s+and\s+balances\b/g, 'checksandbalances'],
  [/\bseparation\s+of\s+powers\b/g, 'separationofpowers'],
  [/\bhouse\s+of\s+representatives\b/g, 'houseofrepresentatives'],
  [/\bworld\s+war\s+(one|i)\b/g, 'worldwar1'],
  [/\bworld\s+war\s+(two|ii)\b/g, 'worldwar2'],
  [/\bcivil\s+war\b/g, 'civilwar'],
  [/\bnative\s+american(s)?\b/g, 'nativeamerican'],
  [/\b(american\s+indian|indian\s+tribe)(s)?\b/g, 'nativeamerican'],
  [/\bmartin\s+luther\s+king(\s+jr)?\b/g, 'mlk'],
  [/\bdonald\s+(j\.?\s+)?trump\b/g, 'trump'],
  [/\bjoe(seph)?\s+biden\b/g, 'biden'],
  // Year compounds: "seventeen seventy six" → "1776", "nineteen forty one" → "1941"
  [/\bseventeen\s+seventy\s+six\b/g, '1776'],
  [/\bseventeen\s+eighty\s+seven\b/g, '1787'],
  [/\beighteen\s+twelve\b/g, '1812'],
  [/\beighteen\s+sixty\s+(one|two|three|four|five)\b/g, '1865'],
  [/\bnineteen\s+fourteen\b/g, '1914'],
  [/\bnineteen\s+seventeen\b/g, '1917'],
  [/\bnineteen\s+forty\s+(one|two|three|four|five)\b/g, '1941'],
  [/\btwenty\s+oh\s+one\b/g, '2001'],
  [/\b(its|it\s+is|that\s+is|the\s+answer\s+is|the\s+answer\s+would\s+be|i\s+believe\s+it\s+is|the\s+correct\s+answer\s+is)\b/g, ''],
  [/\b(yeah|yep|yup|yes\s+sir|yes\s+maam|affirmative|correct|definitely|absolutely|of\s+course|sure)\b/g, 'yes'],
  [/\b(nope|nah|no\s+sir|no\s+maam|negative|never)\b/g, 'no'],

  // Common Web Speech mishears for civics proper nouns + tricky terms.
  // Left side = what the recognizer typically returns; right side = canonical token.
  [/\b(cherokees?|cherokee\s+nation|sherokee|cher\s*okie|sheh?\s*roki|chair\s+okie)\b/g, 'cherokee'],
  [/\b(iroquois|iroquoi|earache\s+way|earache\s+wah|earwig\s+way|iroquoy|ear\s+wak\s+way)\b/g, 'iroquois'],
  [/\b(choctaw|chocktaw|chock\s+talk|chalk\s+talk|chocktal)\b/g, 'choctaw'],
  [/\b(navajos?|navaho|nuv\s+a\s+ho|navi\s+ho)\b/g, 'navajo'],
  [/\b(sioux|sue\s*x?|cyu|seal\s*you)\b/g, 'sioux'],
  [/\b(apache|appache|a\s+pachi|a\s+pa\s+chi)\b/g, 'apache'],
  [/\b(franklin\s+roosevelt|franklyn\s+roosevelt|franklin\s+rosevelt|f\.?d\.?\s*r\.?)\b/g, 'franklinroosevelt'],
  [/\b(theodore\s+roosevelt|teddy\s+roosevelt|t\.?\s*r\.?)\b/g, 'theodoreroosevelt'],
  [/\b(woodrow\s+wilson|woodrow\s+wilkson|wood\s+row\s+wilson|wilson)\b/g, 'woodrowwilson'],
  [/\b(abraham\s+lincoln|abe\s+lincoln|abrah\s+lincoln|link\s+in|lincoln)\b/g, 'lincoln'],
  [/\b(james\s+madison|j\.?\s*madison|jim\s+madison|madisen|madison)\b/g, 'madison'],
  [/\b(alexander\s+hamilton|a\.?\s*hamilton|alex\s+hamilton|hamilton)\b/g, 'hamilton'],
  [/\b(thomas\s+jefferson|t\.?\s*jefferson|tom\s+jefferson|jefferson)\b/g, 'jefferson'],
  [/\b(george\s+washington|g\.?\s*washington|gw\b|washington)\b/g, 'washington'],
  [/\b(j\.?d\.?\s*vance|jd\s+vance|judy\s+vance|jaydee\s+vance|vance)\b/g, 'vance'],
  [/\b(kamala\s+harris|camilla\s+harris|kamla\s+harris|harris)\b/g, 'harris'],
  [/\b(mike\s+johnson|mic\s+johnson|johnson)\b/g, 'mikejohnson'],

  // Tricky civic vocab that gets mangled
  [/\b(naturalization|nature\s+li[sz]ation|natural\s+li[sz]ation|naturalisation)\b/g, 'naturalization'],
  [/\b(amendment|a\s+mendment|moment|amount|amendmen)s?\b/g, 'amendment'],
  [/\b(constitution|constitut?ion|constituent|construction|constitu)\b/g, 'constitution'],
  [/\b(legislative|legislat?ive|legislator)\b/g, 'legislative'],
  [/\b(executive|exec(?:utive|tive))\b/g, 'executive'],
  [/\b(judicial|judician|judiciary)\b/g, 'judicial'],
  [/\b(emancipation|emancipat?ion|man[sz]ipation)\b/g, 'emancipation'],
  [/\b(missippi|mississippi|miss?i?sippi|miss\s+i\s+sippi)\b/g, 'mississippi'],
  [/\b(missouri|misery|missour\s+i|miss\s+oo\s+ree)\b/g, 'missouri'],
  [/\b(senate\s+seat|senate\s+ad|senate)\b/g, 'senate'],
  [/\b(suffrage|sufferage|suff\s+rage)\b/g, 'suffrage'],
  [/\b(allegiance|allegan\s+ce|allegience|a\s+legions?)\b/g, 'allegiance'],
  [/\b(pursuit\s+of\s+happiness|pursu(?:e|et)\s+of\s+happiness)\b/g, 'pursuitofhappiness'],
  [/\b(martin\s+luther\s+king(\s+junior)?|martin\s+lu(?:dder|der)\s+king|m\.?l\.?k\.?)\b/g, 'mlk'],

  // Forms of "Mr./Mrs." prefixes that some recognizers insert
  [/\b(mr|mister|mrs|missus|miss|ms)\b/g, '']
];

function normalizeIntvAnswer(s){
  if(!s) return '';
  var t = String(s).toLowerCase()
    .replace(/[^\w\s'.-]/g, ' ')
    .replace(/\b(um|uh|er|ah|hmm|like|i think|i mean|so|well|i would say|you know)\b/g, ' ');
  // Synonym expansion first (canonicalize multi-word phrases)
  for(var i=0;i<INTV_SYNONYMS.length;i++) t = t.replace(INTV_SYNONYMS[i][0], INTV_SYNONYMS[i][1]);
  // Multi-word number compounds (must run BEFORE single-word number-to-digit conversion).
  // "twenty seven" → "27", "four hundred thirty five" → "435", etc.
  t = t.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[\s-]+(one|two|three|four|five|six|seven|eight|nine)\b/g, function(m, tens, ones){
    var tensMap = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
    var onesMap = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9};
    return String(tensMap[tens] + onesMap[ones]);
  });
  // "X hundred [and] Y[Z]" → composite (e.g. "four hundred thirty-five" → "435")
  t = t.replace(/\b(one|two|three|four|five|six|seven|eight|nine)\s+hundred(?:\s+and)?(?:\s+(\d+))?/g, function(m, h, tail){
    var hMap = {one:100,two:200,three:300,four:400,five:500,six:600,seven:700,eight:800,nine:900};
    var n = hMap[h] + (tail ? parseInt(tail,10) : 0);
    return String(n);
  });
  // Single-word number → digit
  Object.keys(INTV_NUM_WORDS).forEach(function(w){
    t = t.replace(new RegExp('\\b'+w+'\\b','g'), INTV_NUM_WORDS[w]);
  });
  // Strip stray punctuation that survived (periods inside abbreviations)
  t = t.replace(/[.]/g, ' ').replace(/\s+/g,' ').trim();
  return t;
}

// Lightweight "metaphone-like" phonetic encoder. NOT exact metaphone — tuned
// for civics vocabulary and the Web Speech API's common substitutions.
// "iroquois" / "earache way" → "irki" / "rwy" (close enough for fallback match)
// "lincoln" / "link in" → "lnkn" / "lnkn" (exact)
// "naturalization" / "nature lization" → "ntrlztn" / "ntrlztn" (exact)
function phoneticCode(s){
  if(!s) return '';
  var t = String(s).toLowerCase().replace(/[^a-z\s]/g,'');
  if(!t) return '';
  // Apply digraph + silent-letter substitutions first
  t = t.replace(/ph/g,'f')
       .replace(/ck/g,'k')
       .replace(/cq/g,'k')
       .replace(/qu/g,'kw')
       .replace(/q/g,'k')
       .replace(/x/g,'ks')
       .replace(/sh/g,'s')
       .replace(/ch/g,'c')
       .replace(/th/g,'t')
       .replace(/wh/g,'w')
       .replace(/gh/g,'')
       .replace(/dg/g,'j')
       .replace(/z/g,'s');
  // Drop silent w/h between consonants
  t = t.replace(/(?<=[bcdfgjklmnpqrstv])[wh]/g, '');
  // Drop all vowels (preserve word boundaries with space) — keeps consonant skeleton
  t = t.split(/\s+/).map(function(w){
    if(!w) return '';
    var first = w.charAt(0);
    var rest = w.slice(1).replace(/[aeiouy]/g, '');
    return first + rest;
  }).join(' ');
  // Collapse runs of the same letter
  t = t.replace(/(.)\1+/g, '$1');
  return t.replace(/\s+/g,' ').trim();
}

function levenshteinIntv(a, b){
  if(a === b) return 0;
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  var prev = [], cur = [];
  for(var i=0;i<=b.length;i++) prev[i] = i;
  for(var i=1;i<=a.length;i++){
    cur[0] = i;
    for(var j=1;j<=b.length;j++){
      var sub = a.charAt(i-1) === b.charAt(j-1) ? 0 : 1;
      cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+sub);
    }
    var tmp = prev; prev = cur; cur = tmp;
  }
  return prev[b.length];
}

function intvKeywordScore(transcript, expected){
  // Keep digit-only keys (like "6", "27", "1776") — they're meaningful, just short.
  var keys = expected.split(/\s+/).filter(function(w){
    if(INTV_STOPWORDS[w]) return false;
    if(w.length > 1) return true;
    return /\d/.test(w); // single digits are real signal
  });
  if(!keys.length) return transcript.indexOf(expected) !== -1 ? 1 : 0;
  var tWords = transcript.split(/\s+/);
  // Pre-compute phonetic codes once per call so we don't recompute for every key
  var tPhonetics = tWords.map(phoneticCode);
  var hits = 0;
  keys.forEach(function(k){
    if(transcript.indexOf(k) !== -1){ hits++; return; }
    if(k.length < 4) return;
    var tol = Math.max(1, Math.floor(k.length / 4));
    // Fuzzy single-word match (accent-driven typos)
    for(var i=0;i<tWords.length;i++){
      if(tWords[i].length >= 4 && Math.abs(tWords[i].length - k.length) <= tol &&
         levenshteinIntv(tWords[i], k) <= tol){ hits++; return; }
    }
    // Phonetic fallback — catches unseen mishears not in the synonym map
    var kPhon = phoneticCode(k);
    if(kPhon.length >= 3){
      for(var p=0;p<tPhonetics.length;p++){
        if(tPhonetics[p] && tPhonetics[p].length >= 3
           && (tPhonetics[p] === kPhon
               || tPhonetics[p].indexOf(kPhon) !== -1
               || kPhon.indexOf(tPhonetics[p]) !== -1
               || levenshteinIntv(tPhonetics[p], kPhon) <= 1)){
          hits += 0.85; // weight slightly below exact match to avoid over-crediting
          return;
        }
      }
    }
  });
  return Math.min(1, hits / keys.length);
}

function evaluateIntvAnswer(transcript, expectedVariants){
  if(!transcript || !transcript.trim()){
    return {verdict:'wrong', score:0, matched:null, heard:'', topMatches:[]};
  }
  var t = normalizeIntvAnswer(transcript);
  if(!expectedVariants || !expectedVariants.length){
    return {verdict:'wrong', score:0, matched:null, heard:transcript, topMatches:[]};
  }
  // Score EVERY variant, then sort to surface "did you mean?" candidates
  var scored = [];
  for(var i=0;i<expectedVariants.length;i++){
    var v = normalizeIntvAnswer(expectedVariants[i]);
    if(!v) continue;
    var s;
    if(t === v || t.indexOf(v) !== -1 || v.indexOf(t) !== -1){
      s = 1;
    } else {
      s = intvKeywordScore(t, v);
    }
    scored.push({ variant: expectedVariants[i], score: s });
  }
  scored.sort(function(a,b){ return b.score - a.score; });
  var best = scored.length ? scored[0].score : 0;
  var bestMatch = scored.length ? scored[0].variant : expectedVariants[0];
  // Top suggestions for the "Did you mean?" panel — meaningfully-scored, distinct ones
  var topMatches = [];
  var seen = {};
  for(var k=0;k<scored.length && topMatches.length < 3;k++){
    var key = scored[k].variant.toLowerCase();
    if(seen[key]) continue;
    if(scored[k].score < 0.05) break;
    seen[key] = true;
    topMatches.push(scored[k].variant);
  }
  var verdict = 'wrong';
  if(best >= 0.6) verdict = 'correct';
  else if(best >= 0.3) verdict = 'close';
  return {verdict:verdict, score:best, matched:bestMatch, heard:transcript, topMatches:topMatches};
}

// Acceptable-answer variants for the trickier civics questions where keyword-match alone
// might miss. Indexed by civics question ID. For most questions, the keyword matcher
// against the official answer is enough — these are explicit alternates.
var INTERVIEW_VARIANTS = {
  1:  ['Constitution','the Constitution','U.S. Constitution','United States Constitution','American Constitution','supreme law'],
  2:  ['sets up the government','defines the government','protects basic rights','protects the rights of Americans','it sets up the government'],
  3:  ['We the People','the people','We the People of the United States','American people','citizens'],
  4:  ['amendment','an amendment','a change','change to the Constitution'],
  5:  ['Bill of Rights','the Bill of Rights','first ten amendments','the first 10 amendments'],
  6:  ['speech','religion','assembly','press','petition','freedom of speech','freedom of religion','right to assembly','freedom of the press','right to petition the government'],
  7:  ['27','twenty-seven','twenty seven'],
  8:  ['announced our independence','declared our independence','declared independence from Great Britain','said we are free'],
  9:  ['life','liberty','pursuit of happiness','life and liberty','life liberty and the pursuit of happiness'],
  10: ['economic system','market economy','capitalist economy','capitalism','free market'],
  11: ['the rule of law','rule of law','no one is above the law','government must obey the law','everyone must follow the law','leaders must obey the law'],
  13: ['three branches','three','legislative executive judicial','3 branches','3','Congress President courts'],
  14: ['checks and balances','separation of powers','separation of powers and checks and balances'],
  15: ['the President','President','POTUS'],
  16: ['Congress','the Congress','Senate and House','Senate and House of Representatives'],
  17: ['Senate','House','Senate and House','Congress'],
  18: ['100','one hundred','a hundred'],
  19: ['6','six','six years'],
  21: ['435','four hundred thirty-five','four hundred and thirty-five'],
  22: ['2','two','two years'],
  24: ['all people of the state','all people in the state','everyone in the state','citizens of the state','all the people in the state'],
  25: ['because of the state population','more people','the state has more people','larger population','population'],
  26: ['4','four','four years'],
  27: ['November','November of'],
  28: ['Donald Trump','Donald J. Trump','Trump','Joseph Biden','Joe Biden','Biden'],
  29: ['J.D. Vance','Vance','JD Vance','Kamala Harris','Harris'],
  30: ['the Vice President','Vice President','VP'],
  31: ['the Speaker of the House','Speaker of the House','speaker'],
  32: ['the President','President','Commander in Chief','commander-in-chief'],
  33: ['the President','President'],
  34: ['the Senate','Senate'],
  35: ['the President','President'],
  36: ['Cabinet','advise the president','presidential advisors'],
  37: ['Vice President','Secretary of State','Secretary of Defense','Attorney General','Secretary of Treasury','Secretary of Labor','Secretary of Education','Secretary of Energy','Secretary of Commerce','Secretary of Agriculture','Secretary of Interior','Secretary of Health and Human Services','Secretary of Housing and Urban Development','Secretary of Transportation','Secretary of Veterans Affairs','Secretary of Homeland Security'],
  38: ['reviews laws','explains laws','resolves disputes','decides if a law goes against the Constitution','interprets laws'],
  39: ['the Supreme Court','Supreme Court'],
  40: ['9','nine','8','eight'],
  44: ['Washington DC','Washington','D.C.','District of Columbia','Washington, D.C.'],
  45: ['Republican','Democrat','Republican and Democratic','Democratic Party','Republican Party'],
  46: ['Republican','Democratic','Democrat'],
  47: ['Mike Johnson','Johnson','Speaker Johnson'],
  48: ['18','eighteen'],
  50: ['vote','run for federal office','serve on a jury','bring family from abroad','apply for federal jobs','carry a U.S. passport'],
  51: ['freedom of expression','freedom of speech','freedom of assembly','freedom to petition the government','freedom of religion','right to bear arms'],
  52: ['the United States','the flag'],
  53: ['give up loyalty to other countries','defend the Constitution and laws of the United States','obey the laws','serve in the U.S. military if needed','serve the nation if needed','be loyal to the United States'],
  54: ['18 and older','eighteen','18'],
  55: ['vote','join a political party','help with a campaign','call senators and representatives','run for office','give an elected official your opinion'],
  56: ['April 15','April fifteenth','April 15th'],
  57: ['at age 18','between 18 and 26','men 18 to 25','men between 18 and 25'],
  58: ['freedom','political liberty','religious freedom','economic opportunity','escape persecution'],
  59: ['American Indians','Native Americans','the Indians'],
  60: ['Africans','people from Africa'],
  61: ['high taxes','taxation without representation','because the British army stayed in their houses','British soldiers stayed in their houses','because they did not have self-government'],
  62: ['Thomas Jefferson','Jefferson'],
  63: ['July 4 1776','July 4th 1776','July fourth 1776','seventeen seventy-six','1776'],
  64: ['New Hampshire','Massachusetts','Rhode Island','Connecticut','New York','New Jersey','Pennsylvania','Delaware','Maryland','Virginia','North Carolina','South Carolina','Georgia'],
  65: ['the Constitution was written','the Founding Fathers wrote the Constitution'],
  66: ['1787','seventeen eighty-seven'],
  67: ['James Madison','Alexander Hamilton','John Jay','Publius','Madison','Hamilton'],
  68: ['founder of the free public schools','first Postmaster General of the United States','writer of Poor Richard\'s Almanac','started the first free libraries','U.S. diplomat'],
  69: ['George Washington','Washington'],
  70: ['George Washington','Washington'],
  71: ['the Louisiana Territory','Louisiana'],
  72: ['War of 1812','Mexican-American War','Civil War','Spanish-American War'],
  73: ['the Civil War','War Between the States','Civil War','War Between the States'],
  74: ['slavery','economic reasons','states\' rights','slavery economic and states rights'],
  75: ['freed the slaves','Emancipation Proclamation','saved the Union','led the United States during the Civil War'],
  76: ['freed the slaves','freed slaves in the Confederacy','freed slaves in the Confederate states'],
  77: ['fought for women\'s rights','fought for civil rights','women\'s suffrage'],
  78: ['World War I','World War II','Korean War','Vietnam War','Persian Gulf War'],
  79: ['Woodrow Wilson','Wilson'],
  80: ['Franklin Roosevelt','FDR','Roosevelt'],
  81: ['Japan Germany and Italy','Japan, Germany, and Italy','Japan Germany Italy'],
  82: ['World War II','the second World War','WWII'],
  83: ['communism','the spread of communism'],
  84: ['civil rights movement','civil rights'],
  85: ['fought for civil rights','worked for equality for all Americans','I have a dream','equal rights'],
  86: ['terrorists attacked the United States','9/11','September 11','attacks on the World Trade Center'],
  87: ['Cherokee','Navajo','Sioux','Chippewa','Choctaw','Pueblo','Apache','Iroquois','Creek','Blackfeet','Seminole','Cheyenne','Arawak','Shawnee','Mohegan','Huron','Oneida','Lakota','Crow','Teton','Hopi','Inuit'],
  88: ['Missouri','Mississippi'],
  89: ['Pacific','Pacific Ocean'],
  90: ['Atlantic','Atlantic Ocean'],
  91: ['Puerto Rico','U.S. Virgin Islands','American Samoa','Northern Mariana Islands','Guam'],
  92: ['Maine','New Hampshire','Vermont','New York','Pennsylvania','Ohio','Michigan','Minnesota','North Dakota','Montana','Idaho','Washington','Alaska'],
  93: ['California','Arizona','New Mexico','Texas'],
  94: ['Washington DC','Washington','D.C.'],
  95: ['New York Harbor','Liberty Island','New York','New Jersey'],
  96: ['because there were 13 original colonies','they represent the original colonies'],
  97: ['because there is one star for each state','one star for each state','50 stars for 50 states'],
  98: ['The Star-Spangled Banner','Star Spangled Banner','national anthem'],
  99: ['July 4','July fourth','Independence Day'],
  100:['New Year\'s Day','Martin Luther King Jr Day','Presidents Day','Memorial Day','Independence Day','Labor Day','Columbus Day','Veterans Day','Thanksgiving','Christmas','Juneteenth']
};

// Acceptable variants for N-400 personal questions (English, deterministic per-user)
function expectedN400AnswerEn(q){
  var k = q.key;
  if(k === 'name'){
    var n = (user.name||'').trim();
    return n ? [n, n.split(' ')[0]] : ['—'];
  }
  if(k === 'country'){
    var c = countryLabel(user.countryOfBirth || 'Other', 'en');
    return [c];
  }
  if(k === 'gcDate'){
    var d = user.greenCardDate ? fmtDate(user.greenCardDate, 'en') : '—';
    return [d];
  }
  if(k === 'married') return user.marriedToCitizen ? ['yes','I am','I am married'] : ['no','I am not','I am not married','single'];
  if(k === 'marriageDate'){
    var md = user.marriageDate ? fmtDate(user.marriageDate, 'en') : '—';
    return [md];
  }
  if(k === 'trips'){
    if(user.monthsOutside === 'lt6') return ['no','none','no I have not','no I have not taken any'];
    if(user.monthsOutside === '6-18') return ['no single trip','no but my total was','between six and eighteen months total'];
    if(user.monthsOutside === 'gt18') return ['yes','more than six months','a trip over six months'];
    return ['I am not sure','not sure'];
  }
  if(k === 'crime') return user.criminalHistory ? ['yes','yes I have'] : ['no','no I have not','never'];
  if(k === 'taxes') return ['yes','I have','yes I have','I file every year'];
  if(k === 'support') return ['yes','I do','yes I do'];
  if(k === 'oath') return ['yes','I am','I am willing','yes I am willing'];
  return ['—'];
}

// Mastery tracking — drives adaptive question selection in future sessions.
// State machine per question:
//   'new'        — never attempted
//   'weak'       — got it wrong last time
//   'practicing' — got it right once recently OR after being weak
//   'mastered'   — 2 consecutive correct attempts
// One wrong/close after mastered demotes to practicing (not weak — gentler).
function getCivicsMastery(qId){
  var m = (user.progress && user.progress.civicsMastery) || {};
  return m[qId] || {state:'new', streak:0, lastAt:null};
}

function updateCivicsMastery(qId, verdict){
  if(!user.progress.civicsMastery) user.progress.civicsMastery = {};
  var m = user.progress.civicsMastery[qId] || {state:'new', streak:0, lastAt:null};
  var correct = (verdict === 'correct');
  if(correct){
    m.streak = (m.streak || 0) + 1;
    if(m.streak >= 2) m.state = 'mastered';
    else if(m.state === 'new' || m.state === 'weak') m.state = 'practicing';
  } else {
    m.streak = 0;
    if(m.state === 'mastered') m.state = 'practicing';
    else if(verdict === 'close') m.state = m.state === 'new' ? 'weak' : 'practicing';
    else m.state = 'weak';
  }
  m.lastAt = todayISO();
  user.progress.civicsMastery[qId] = m;
}

function civicsByMasteryState(state){
  var out = [];
  for(var i=0;i<CIVICS.length;i++){
    var s = getCivicsMastery(CIVICS[i].id).state;
    if(s === state) out.push(CIVICS[i].id);
  }
  return out;
}

function civicsMasteryCounts(){
  var counts = {new:0, weak:0, practicing:0, mastered:0};
  for(var i=0;i<CIVICS.length;i++){
    counts[getCivicsMastery(CIVICS[i].id).state]++;
  }
  return counts;
}

function civicsNeedsWorkCount(){
  var c = civicsMasteryCounts();
  return c.weak + c.practicing;
}

// Build map: civics qId → {lessonId, unitId} from LESSONS[].qIds, memoized
var _civicsLessonMap = null;
function civicsLessonMap(){
  if(_civicsLessonMap) return _civicsLessonMap;
  _civicsLessonMap = {};
  for(var i=0;i<LESSONS.length;i++){
    var L = LESSONS[i];
    if(!L.qIds || L.isChest) continue;
    for(var j=0;j<L.qIds.length;j++){
      // First mapping wins (skip review-lesson re-uses)
      if(!_civicsLessonMap[L.qIds[j]]) _civicsLessonMap[L.qIds[j]] = {lessonId:L.id, unitId:L.unit};
    }
  }
  return _civicsLessonMap;
}

// Build per-unit mastery rollup for the heatmap.
function civicsUnitMastery(){
  var map = civicsLessonMap();
  var byUnit = {};
  for(var i=0;i<UNITS.length;i++){
    byUnit[UNITS[i].id] = {unit:UNITS[i], total:0, mastered:0, practicing:0, weak:0, newQ:0, weakestLesson:null, weakestCount:0};
  }
  var perLesson = {}; // lessonId → {weak/practicing}
  for(var k=0;k<CIVICS.length;k++){
    var q = CIVICS[k];
    var m = map[q.id];
    if(!m) continue;
    var u = byUnit[m.unitId];
    if(!u) continue;
    var state = getCivicsMastery(q.id).state;
    u.total++;
    if(state === 'mastered') u.mastered++;
    else if(state === 'practicing') u.practicing++;
    else if(state === 'weak') u.weak++;
    else u.newQ++;
    if(state === 'weak' || state === 'practicing'){
      perLesson[m.lessonId] = (perLesson[m.lessonId] || 0) + 1;
      if(perLesson[m.lessonId] > byUnit[m.unitId].weakestCount){
        byUnit[m.unitId].weakestCount = perLesson[m.lessonId];
        byUnit[m.unitId].weakestLesson = m.lessonId;
      }
    }
  }
  var result = [];
  for(var uid in byUnit){ if(byUnit[uid].total > 0) result.push(byUnit[uid]); }
  return result;
}

// Adaptive selection: weight weak Qs heaviest, then practicing, then new, then mastered last.
// Returns N civics IDs prioritized for the next interview.
function adaptiveCivicsQIds(n){
  var weak = civicsByMasteryState('weak');
  var practicing = civicsByMasteryState('practicing');
  var newQ = civicsByMasteryState('new');
  var mastered = civicsByMasteryState('mastered');
  shuffleArr(weak); shuffleArr(practicing); shuffleArr(newQ); shuffleArr(mastered);
  var out = [];
  // 60% from weak, 20% from practicing, 15% new, 5% mastered (refresh)
  function take(arr, count){
    for(var i=0;i<count && arr.length;i++) out.push(arr.shift());
  }
  take(weak, Math.ceil(n*0.6));
  if(out.length < n) take(practicing, Math.ceil(n*0.2));
  if(out.length < n) take(newQ, n - out.length);
  if(out.length < n) take(mastered, n - out.length);
  // If still short (very small CIVICS pool), fill from any remaining
  while(out.length < n){
    var remaining = weak.concat(practicing, newQ, mastered);
    if(!remaining.length) break;
    out.push(remaining.shift());
  }
  return out.slice(0, n);
}

// Voice-interview state, count, results
function todayInterviewsAvailable(){
  if(isPlus()) return Infinity;
  if(user.voiceInterviewsTodayDate !== todayISO()) return 3;
  return Math.max(0, 3 - (user.voiceInterviewsTodayCount || 0));
}

function recordInterviewStart(){
  if(isPlus()) return;
  if(user.voiceInterviewsTodayDate !== todayISO()){
    user.voiceInterviewsTodayCount = 0;
    user.voiceInterviewsTodayDate = todayISO();
  }
  user.voiceInterviewsTodayCount = (user.voiceInterviewsTodayCount || 0) + 1;
  saveUser();
}

function getAcceptedVariants(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    if(!cq) return [];
    var v = [];
    for(var i=0;i<cq.options.length;i++) if(cq.options[i].correct) v.push(cq.options[i].en);
    var extra = INTERVIEW_VARIANTS[q.qId];
    if(extra) v = v.concat(extra);
    return v;
  } else {
    return expectedN400AnswerEn(q.n400Q);
  }
}

function getQuestionTextEn(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    return cq ? cq.q.en : '';
  }
  return q.n400Q.q.en;
}

function getQuestionTextLocal(q){
  if(q.type === 'civics'){
    var cq = findQ(q.qId);
    return cq ? cq.q[lang] : '';
  }
  return q.n400Q.q[lang];
}

var intvState = null;

function buildInterviewQuestions(){
  // Adaptive: weight weak/practicing questions heaviest so the user drills weak spots
  var civicsIds = adaptiveCivicsQIds(6);
  var civicsQs = civicsIds.map(function(id){return {type:'civics', qId:id};});
  var applicableN400 = N400_REVIEW_QUESTIONS.filter(function(q){
    if(q.conditional === 'married') return user.marriedToCitizen;
    return true;
  });
  var sample = applicableN400.slice();
  var ordered = [];
  if(sample[0]) ordered.push({type:'n400', n400Q: sample[0]});
  if(sample[1]) ordered.push({type:'n400', n400Q: sample[1]});
  ordered = ordered.concat(civicsQs.slice(0,3));
  for(var k=2;k<sample.length;k++) ordered.push({type:'n400', n400Q: sample[k]});
  ordered = ordered.concat(civicsQs.slice(3));
  return ordered;
}

function startInterview(){
  // Daily cap (3/day for free, unlimited for Plus)
  var avail = todayInterviewsAvailable();
  if(avail <= 0){
    toast(lang==='es' ? 'Llegaste al límite diario · Plus = ilimitado' : 'Daily limit reached · Plus = unlimited');
    go('upgrade');
    return;
  }
  recordInterviewStart();
  initIntvVoice();
  intvState = {
    qIdx: 0,
    questions: buildInterviewQuestions(),
    results: [],
    phase: 'asking',        // 'asking' | 'ready' | 'listening' | 'lowConfidence' | 'verdict' | 'done'
    currentTranscript: '',
    finalAlternatives: [],
    liveConfidence: 0,
    handsFree: (user && user.intvHandsFree) || false, // persisted preference
    autoAdvanceTimer: null,
    micEnabled: !!IntvVoice.recognizer,
    fallbackText: '',
    currentStreak: 0,       // consecutive 'correct' verdicts this session
    bestStreak: 0,
    justIncrementedStreak: false  // one-tick flag for the pulse animation
  };
  go('interview');
  renderInterview();
  setTimeout(function(){ officerAsks(); }, 600);
}

function exitInterview(){
  stopOfficerSpeaking();
  stopListening();
  stopAudioRecording();
  revokeAllAudioUrls();
  releaseMicStream();
  intvState = null;
  go('home');
}

function stopOfficerSpeaking(){
  if(ttsSupported()) try { window.speechSynthesis.cancel(); } catch(e){}
}

function stopListening(){
  if(IntvVoice.recognizer){
    try { IntvVoice.recognizer.abort(); } catch(e){}
    try { IntvVoice.recognizer.stop(); } catch(e){}
  }
  stopMicLevelMeter();
}

// Real-time audio level meter driven by the live mic stream.
// Drives the 5 bars in .intvMicLevel so users SEE the recognizer is actually working.
function startMicLevelMeter(){
  if(!IntvVoice.micStream) return;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    if(IntvVoice.audioCtx){ try { IntvVoice.audioCtx.close(); } catch(e){} IntvVoice.audioCtx = null; }
    var ctx = new Ctx();
    var src = ctx.createMediaStreamSource(IntvVoice.micStream);
    var analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    IntvVoice.audioCtx = ctx;
    IntvVoice.analyser = analyser;

    var data = new Uint8Array(analyser.fftSize);
    var now0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    IntvVoice.vad.listenStartedAt = now0;
    IntvVoice.vad.speechStartedAt = 0;
    IntvVoice.vad.lastSpeechAt = 0;
    IntvVoice.vad.avgLevel = 0;
    // Ambient noise calibration — sample for ~400ms before raising the speech threshold
    // so users in noisy environments don't get false triggers (HVAC, traffic, etc.).
    IntvVoice.vad.calibrating = true;
    IntvVoice.vad.calibrationMax = 0;
    IntvVoice.vad.noiseFloor = 0;
    var CALIBRATION_MS = 400;

    var SPEECH_THRESH = 0.18;    // baseline amplitude above which we believe the user is talking
    var SILENCE_END_MS = 1500;   // ms of post-speech silence → auto-stop (VAD)
    var MAX_LISTEN_MS = 30000;   // hard cap so a stuck recognizer doesn't run forever
    var NO_SPEECH_HINT_MS = 4000;

    function tick(){
      if(!intvState || intvState.phase !== 'listening'){
        IntvVoice.meterRaf = null;
        return;
      }
      analyser.getByteTimeDomainData(data);
      var peak = 0;
      for(var i=0;i<data.length;i++){
        var v = Math.abs(data[i] - 128);
        if(v > peak) peak = v;
      }
      var level = Math.min(1, peak / 50);
      var t = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
      // Exponential moving average of level — drives pacing coach
      IntvVoice.vad.avgLevel = IntvVoice.vad.avgLevel * 0.85 + level * 0.15;

      // Ambient calibration: for the first 400ms, treat all input as noise.
      // After that, raise SPEECH_THRESH above the measured noise floor + headroom.
      if(IntvVoice.vad.calibrating){
        if(level > IntvVoice.vad.calibrationMax) IntvVoice.vad.calibrationMax = level;
        if((t - IntvVoice.vad.listenStartedAt) > CALIBRATION_MS){
          IntvVoice.vad.calibrating = false;
          IntvVoice.vad.noiseFloor = IntvVoice.vad.calibrationMax;
          // Push threshold above noise floor with headroom; clamp to a sane range
          SPEECH_THRESH = Math.min(0.45, Math.max(0.18, IntvVoice.vad.noiseFloor + 0.10));
        }
      }

      var bars = document.querySelectorAll('.intvMicLevelBar');
      if(bars.length){
        for(var b=0;b<bars.length;b++){
          var threshold = (b + 1) / bars.length;
          var lit = level >= threshold * 0.85;
          bars[b].style.opacity = lit ? '1' : '0.18';
          bars[b].style.transform = 'scaleY(' + (0.3 + level * (0.7 + b * 0.06)) + ')';
        }
      }

      // VAD: track speech start + last speech moment
      if(level >= SPEECH_THRESH){
        if(!IntvVoice.vad.speechStartedAt) IntvVoice.vad.speechStartedAt = t;
        IntvVoice.vad.lastSpeechAt = t;
      }
      // Pacing coach line — gentle hints
      var hint = '';
      if(!IntvVoice.vad.speechStartedAt && (t - IntvVoice.vad.listenStartedAt) > NO_SPEECH_HINT_MS){
        hint = lang==='es' ? 'Tómate tu tiempo · habla más cerca del micrófono' : "Take your time · speak closer to the mic";
      } else if(IntvVoice.vad.speechStartedAt && IntvVoice.vad.avgLevel < 0.06){
        hint = lang==='es' ? '🔉 Habla un poco más fuerte' : '🔉 Speak up a little';
      }
      var hintEl = document.getElementById('intvPacingHint');
      if(hintEl) hintEl.textContent = hint;

      // Auto-stop on silence after speech (hands-free or not — keeps recognition snappy)
      if(IntvVoice.vad.lastSpeechAt && (t - IntvVoice.vad.lastSpeechAt) > SILENCE_END_MS){
        try { IntvVoice.recognizer && IntvVoice.recognizer.stop(); } catch(e){}
        IntvVoice.meterRaf = null;
        return;
      }
      // Hard cap so a hung session doesn't loop forever
      if((t - IntvVoice.vad.listenStartedAt) > MAX_LISTEN_MS){
        try { IntvVoice.recognizer && IntvVoice.recognizer.stop(); } catch(e){}
        IntvVoice.meterRaf = null;
        return;
      }
      IntvVoice.meterRaf = requestAnimationFrame(tick);
    }
    IntvVoice.meterRaf = requestAnimationFrame(tick);
  } catch(e){ /* AudioContext denied or stream unsupported — silent fallback */ }
}

function stopMicLevelMeter(){
  if(IntvVoice.meterRaf){ cancelAnimationFrame(IntvVoice.meterRaf); IntvVoice.meterRaf = null; }
  if(IntvVoice.audioCtx){
    try { IntvVoice.audioCtx.close(); } catch(e){}
    IntvVoice.audioCtx = null;
    IntvVoice.analyser = null;
  }
  // Reset bar styles
  var bars = document.querySelectorAll('.intvMicLevelBar');
  for(var i=0;i<bars.length;i++){ bars[i].style.opacity=''; bars[i].style.transform=''; }
}

function officerAsks(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  if(!q){ finishInterview(); return; }
  intvState.phase = 'asking';
  intvState.currentTranscript = '';
  renderInterview();
  var text = getQuestionTextEn(q);
  speakAsOfficer(text, function(){
    if(!intvState || intvState.phase !== 'asking') return;
    intvState.phase = 'ready';
    renderInterview();
    // Hands-free: auto-pop the mic 600ms after officer finishes asking
    if(intvState.handsFree && IntvVoice.recognizer){
      setTimeout(function(){
        if(intvState && intvState.phase === 'ready' && intvState.handsFree){
          startListeningToUser();
        }
      }, 600);
    }
  });
}

function toggleIntvHandsFree(){
  if(!intvState) return;
  intvState.handsFree = !intvState.handsFree;
  if(user){ user.intvHandsFree = intvState.handsFree; saveUser(); }
  renderInterview();
  toast(intvState.handsFree
    ? (lang==='es' ? '🎙 Modo manos libres activado' : '🎙 Hands-free mode on')
    : (lang==='es' ? 'Modo manos libres desactivado' : 'Hands-free mode off'));
  // If we just turned it on and we're at the ready phase, kick off listening
  if(intvState.handsFree && intvState.phase === 'ready' && IntvVoice.recognizer){
    setTimeout(startListeningToUser, 250);
  }
}

function replayOfficer(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  speakAsOfficer(getQuestionTextEn(q));
}

function userPressMic(){
  // NOT async — we need to call start() synchronously to preserve iOS user gesture.
  if(!intvState) return;
  if(intvState.phase === 'listening'){
    stopListening();
    return;
  }
  if(intvState.phase === 'verdict'){
    intvState.phase = 'ready';
    intvState.currentTranscript = '';
    intvState.results.pop();
    renderInterview();
    return;
  }
  // Ensure recognizer is ready (re-init if a prior session destroyed it)
  if(!IntvVoice.recognizer) initIntvVoice();
  if(!IntvVoice.recognizer){
    toast(lang==='es' ? 'Tu navegador no soporta voz. Usa el modo de texto.' : 'Voice not supported. Use text mode.');
    return;
  }
  // Kick off audio stream + recording in parallel (best-effort) but don't await — the
  // SpeechRecognition start() must happen in the same synchronous tick as the click.
  ensureMicPermission().catch(function(){});
  startListeningToUser();
}

function startListeningToUser(){
  if(!intvState) return;
  if(!IntvVoice.recognizer) initIntvVoice();
  if(!IntvVoice.recognizer){
    toast(lang==='es' ? 'Tu navegador no soporta voz' : 'Voice not supported');
    return;
  }
  stopOfficerSpeaking();
  intvState.phase = 'listening';
  intvState.currentTranscript = '';
  intvState.finalAlternatives = [];
  intvState.liveConfidence = 0;
  intvState.lastAudioUrl = null;
  renderInterview();
  startAudioRecording();
  // Kick the audio level meter after a tick so the bars exist in DOM
  setTimeout(startMicLevelMeter, 100);

  // Always use a fresh recognizer to avoid stale-state bugs after multiple Qs
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  try { if(IntvVoice.recognizer) IntvVoice.recognizer.abort(); } catch(e){}
  var rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  // USCIS interview is in English; the officer expects en-US answers.
  rec.lang = 'en-US';
  IntvVoice.recognizer = rec;

  rec.onresult = function(event){
    if(!intvState) return;
    var displayText = '';
    var liveConfs = [];
    var finalAlts = [];   // collected final-result alternatives [{transcript, confidence}, ...]
    for(var i=0;i<event.results.length;i++){
      var r = event.results[i];
      displayText += r[0].transcript + ' ';
      if(typeof r[0].confidence === 'number' && r[0].confidence > 0) liveConfs.push(r[0].confidence);
      if(r.isFinal){
        for(var j=0;j<r.length;j++){
          finalAlts.push({ transcript: r[j].transcript, confidence: r[j].confidence || 0 });
        }
      }
    }
    intvState.currentTranscript = displayText.trim();
    intvState.finalAlternatives = finalAlts;
    intvState.liveConfidence = liveConfs.length ? liveConfs.reduce(function(a,b){return a+b;},0)/liveConfs.length : 0;

    var live = document.getElementById('intvLiveTranscript');
    if(live) live.textContent = intvState.currentTranscript || (lang==='es'?'Escuchando…':'Listening…');
    var dot = document.getElementById('intvConfDot');
    if(dot){
      var c = intvState.liveConfidence;
      dot.style.background = c === 0 ? '#84807a' : c >= 0.7 ? '#34c759' : c >= 0.4 ? '#ffc83d' : '#ff4d3a';
    }
  };
  rec.onerror = function(event){
    if(!intvState) return;
    var err = (event && event.error) || 'unknown';
    if(err === 'not-allowed' || err === 'service-not-allowed'){
      user.micPermission = 'denied';
      saveUser();
      toast(lang==='es' ? 'Permiso del micrófono bloqueado — actívalo en el navegador' : 'Mic blocked — enable it in browser settings');
    } else if(err === 'no-speech'){
      toast(lang==='es' ? 'No te oí — toca el micrófono y habla' : "I didn't hear you — tap mic and speak");
    } else if(err === 'audio-capture'){
      toast(lang==='es' ? 'No se encontró micrófono' : 'No microphone found');
    } else if(err === 'network'){
      toast(lang==='es' ? 'Error de red al reconocer voz' : 'Network error during recognition');
    } else if(err === 'aborted'){
      // silent — user pressed stop
    } else {
      toast(lang==='es' ? 'Error de voz: '+err : 'Voice error: '+err);
    }
    if(intvState && intvState.phase === 'listening'){
      intvState.phase = 'ready';
      renderInterview();
    }
  };
  rec.onend = function(){
    if(!intvState) return;
    stopAudioRecording();
    if(intvState.phase === 'listening'){
      setTimeout(function(){ processIntvAnswer(); }, 120);
    }
  };
  try { rec.start(); }
  catch(e){
    try { rec.abort(); } catch(e2){}
    setTimeout(function(){
      try { rec.start(); } catch(e3){
        if(intvState){
          intvState.phase = 'ready';
          renderInterview();
        }
        toast(lang==='es' ? 'No se pudo iniciar la voz' : 'Could not start voice — try again');
      }
    }, 200);
  }
}

function submitFallbackAnswer(){
  if(!intvState) return;
  var inp = document.getElementById('intvFallbackInput');
  if(inp){
    intvState.currentTranscript = inp.value || '';
    processIntvAnswer();
  }
}

// Detect short, command-shaped utterances ("skip", "repeat", "stop"). Only fires
// when the entire transcript IS the command (give or take a filler word), so a
// real civics answer that happens to contain "stop" or "next" can't trigger it.
function detectVoiceCommand(transcript){
  if(!transcript) return null;
  var t = String(transcript).toLowerCase().trim();
  if(t.length > 28) return null;
  // Strip benign fillers + punctuation to get the command core
  var s = t.replace(/\b(please|now|hey|um|uh|ok|okay|sir|ma'?am|cami|officer)\b/g, '')
           .replace(/[^\w\s'-]/g, '')
           .replace(/\s+/g,' ').trim();
  if(!s) return null;
  if(/^(skip|skip it|skip this|skip ahead|next|next one|next question|pass|move on)$/.test(s)) return 'next';
  if(/^(repeat|repeat it|repeat that|say again|say it again|come again|once more|what)$/.test(s)) return 'repeat';
  if(/^(stop|pause|exit|end interview|im done|i am done|that(s| is) enough)$/.test(s)) return 'stop';
  return null;
}

// User chose "Grade anyway" from the low-confidence screen → bypass the retry path.
function forceGradeIntvAnswer(){
  if(!intvState) return;
  intvState.lowConfHeard = null;
  intvState._forceGrade = true;
  processIntvAnswer();
}

function processIntvAnswer(){
  if(!intvState) return;
  var transcript = (intvState.currentTranscript || '').trim();

  // Voice command intercept — only when hands-free is on (avoids false positives
  // when someone genuinely says "stop" or "next" as part of a real civics answer).
  if(intvState.handsFree && !intvState._forceGrade){
    var cmd = detectVoiceCommand(transcript);
    if(cmd){
      if(cmd === 'next'){
        toast(lang==='es' ? '⏭ Saltando…' : '⏭ Skipping…');
        return skipInterviewQ();
      }
      if(cmd === 'repeat'){
        toast(lang==='es' ? '🔁 Repitiendo pregunta…' : '🔁 Repeating question…');
        intvState.phase = 'asking';
        intvState.currentTranscript = '';
        renderInterview();
        setTimeout(officerAsks, 300);
        return;
      }
      if(cmd === 'stop'){
        toast(lang==='es' ? '⏹ Saliendo de la entrevista' : '⏹ Exiting interview');
        return exitInterview();
      }
    }
  }

  var q = intvState.questions[intvState.qIdx];
  var variants = getAcceptedVariants(q);

  // Pull together every transcript the recognizer ever gave us — the main one PLUS
  // the up-to-5 alternatives from each final result. Score them all; pick the best.
  // Web Speech's top alternative is often a less-good match than its #2/3/4.
  var candidates = [];
  if(transcript) candidates.push({ transcript: transcript, confidence: intvState.liveConfidence || 0.7 });
  if(intvState.finalAlternatives && intvState.finalAlternatives.length){
    intvState.finalAlternatives.forEach(function(alt){
      if(alt.transcript && alt.transcript.trim()) candidates.push(alt);
    });
  }

  var best = { verdict: 'wrong', score: 0, matched: variants[0], heard: transcript, confidence: 0 };
  for(var c=0;c<candidates.length;c++){
    var cand = candidates[c];
    var r = evaluateIntvAnswer(cand.transcript, variants);
    if(r.score > best.score){
      best = r;
      best.heard = cand.transcript;
      best.confidence = cand.confidence || 0;
    }
  }
  var result = best;

  // Smart-retry: very-low recognizer confidence + nothing matched → don't punish.
  // Surface a "Didn't catch that — try again?" path instead of marking wrong.
  // User can override via forceGradeIntvAnswer() ("Grade anyway") to skip this gate.
  if(!intvState._forceGrade
     && result.verdict === 'wrong' && result.score < 0.15
     && (result.confidence || 0) < 0.5 && transcript.length < 40){
    intvState.phase = 'lowConfidence';
    intvState.lowConfHeard = transcript;
    renderInterview();
    return;
  }
  intvState.lowConfHeard = null;
  intvState._forceGrade = false;

  intvState.results.push({
    qIdx: intvState.qIdx,
    type: q.type,
    qId: q.qId,           // civics question id for mastery tracking
    questionText: getQuestionTextEn(q),
    questionTextLocal: getQuestionTextLocal(q),
    verdict: result.verdict,
    heard: transcript,
    matched: result.matched,
    expected: variants[0],
    score: result.score,
    confidence: result.confidence || 0,
    topMatches: result.topMatches || [],
    overridden: false,
    audioUrl: intvState.lastAudioUrl || null
  });
  intvState.lastAudioUrl = null;
  // Track mastery for civics questions only
  if(q.type === 'civics' && q.qId){
    updateCivicsMastery(q.qId, result.verdict);
    saveUser();
  }
  // Session streak
  if(result.verdict === 'correct'){
    intvState.currentStreak = (intvState.currentStreak || 0) + 1;
    if(intvState.currentStreak > (intvState.bestStreak || 0)) intvState.bestStreak = intvState.currentStreak;
    intvState.justIncrementedStreak = true;
  } else {
    intvState.currentStreak = 0;
    intvState.justIncrementedStreak = false;
  }
  intvState.phase = 'verdict';
  renderInterview();
  // Officer responds
  setTimeout(function(){
    var feedback = officerFeedbackText(result.verdict, variants[0]);
    speakAsOfficer(feedback, function(){
      // Hands-free: auto-advance after the officer's verdict speech finishes
      if(intvState && intvState.handsFree && intvState.phase === 'verdict'){
        if(intvState.autoAdvanceTimer) clearTimeout(intvState.autoAdvanceTimer);
        intvState.autoAdvanceTimer = setTimeout(function(){
          if(intvState && intvState.handsFree && intvState.phase === 'verdict') nextInterviewQ();
        }, 1400);
      }
    });
  }, 350);
}

function officerFeedbackText(verdict, expected){
  var encouragements = ['Correct.','Good.',"That's right.",'Yes.','Excellent.','Right.'];
  if(verdict === 'correct') return encouragements[Math.floor(Math.random()*encouragements.length)];
  if(verdict === 'close') return "Close enough. The expected answer is: " + expected;
  return "The correct answer is: " + expected;
}

function overrideAsCorrect(){
  if(!intvState || !intvState.results.length) return;
  var r = intvState.results[intvState.results.length - 1];
  r.verdict = 'correct';
  r.overridden = true;
  // Override updates mastery — STT misheard the user, the answer was right
  if(r.type === 'civics' && r.qId){
    updateCivicsMastery(r.qId, 'correct');
    saveUser();
  }
  renderInterview();
  toast(lang==='es' ? 'Marcado como correcto' : 'Marked correct');
}

// "Did you mean?" tap-to-accept — bumps verdict to correct with the chosen variant noted.
function acceptDidYouMean(idx){
  if(!intvState || !intvState.results.length) return;
  var r = intvState.results[intvState.results.length - 1];
  if(!r.topMatches || !r.topMatches[idx]) return;
  r.matched = r.topMatches[idx];
  r.verdict = 'correct';
  r.overridden = true;
  if(r.type === 'civics' && r.qId){
    updateCivicsMastery(r.qId, 'correct');
    saveUser();
  }
  renderInterview();
  toast(lang==='es' ? 'Aceptado como correcto' : 'Accepted as correct');
}

function nextInterviewQ(){
  if(!intvState) return;
  stopOfficerSpeaking();
  if(intvState.qIdx >= intvState.questions.length - 1){
    return finishInterview();
  }
  intvState.qIdx++;
  intvState.phase = 'asking';
  intvState.currentTranscript = '';
  renderInterview();
  setTimeout(function(){ officerAsks(); }, 400);
}

function skipInterviewQ(){
  if(!intvState) return;
  var q = intvState.questions[intvState.qIdx];
  var variants = getAcceptedVariants(q);
  intvState.results.push({
    qIdx: intvState.qIdx,
    type: q.type,
    questionText: getQuestionTextEn(q),
    questionTextLocal: getQuestionTextLocal(q),
    verdict: 'wrong',
    heard: '',
    matched: null,
    expected: variants[0],
    score: 0,
    overridden: false,
    skipped: true
  });
  nextInterviewQ();
}

function finishInterview(){
  if(!intvState) return;
  stopOfficerSpeaking();
  stopListening();
  var r = intvState.results;
  var correct = r.filter(function(x){return x.verdict==='correct';}).length;
  var close = r.filter(function(x){return x.verdict==='close';}).length;
  var wrong = r.filter(function(x){return x.verdict==='wrong';}).length;
  var total = r.length;
  // Real USCIS test: 6/10 correct to pass. With our mix (civics + N-400), use 60%.
  var passed = total > 0 && correct >= Math.ceil(total * 0.6);
  var score = total > 0 ? Math.round((correct + close * 0.5) / total * 100) : 0;
  if(!user.progress.interviewAttempts) user.progress.interviewAttempts = [];
  user.progress.interviewAttempts.push({
    score: score, correct: correct, close: close, wrong: wrong, total: total,
    passed: passed, takenAt: todayISO()
  });
  saveUser();
  intvState.phase = 'done';
  renderInterview();
}

// Cami's head in an officer's peaked cap — the "USCIS officer" avatar in the interview sim.
function camiOfficerSVG(size){
  size = size || 40;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<circle cx="50" cy="61" r="25" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<circle cx="62" cy="57" r="3.4" fill="#1d1d22"/>'
    + '<circle cx="63.3" cy="55.8" r="1.1" fill="#ffffff"/>'
    + '<polygon points="74,59 90,56 74,67" fill="#ff9b21" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '<rect x="24" y="37" width="52" height="8" rx="1.5" fill="#16294a" stroke="#1d1d22" stroke-width="2"/>'
    + '<path d="M25 39 Q25 19 50 19 Q75 19 75 39 Z" fill="#3a5a99" stroke="#1d1d22" stroke-width="2.5" stroke-linejoin="round"/>'
    + '<path d="M50 25 L55 27.4 V32 Q55 36 50 37.6 Q45 36 45 32 V27.4 Z" fill="#ffc83d" stroke="#1d1d22" stroke-width="1.2" stroke-linejoin="round"/>'
    + '<path d="M40 45 Q58 40 78 47 Q60 52 40 47 Z" fill="#0e1830" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '</svg>';
}

function renderInterview(){
  if(!intvState) return;
  var counter = document.getElementById('intvCounter');
  var fill = document.getElementById('intvProgressFill');
  var body = document.getElementById('intvBody');
  var footer = document.getElementById('intvFooter');
  if(!body) return;

  if(intvState.phase === 'done'){
    renderInterviewResults();
    return;
  }

  var q = intvState.questions[intvState.qIdx];
  if(!q){ finishInterview(); return; }

  if(counter) counter.textContent = (intvState.qIdx+1) + ' / ' + intvState.questions.length;
  if(fill){
    var prog = intvState.qIdx + (intvState.phase==='verdict'?1:intvState.phase==='listening'?0.6:intvState.phase==='ready'?0.3:0);
    fill.style.width = (prog / intvState.questions.length * 100) + '%';
  }

  var questionText = getQuestionTextLocal(q);
  var questionEn = getQuestionTextEn(q);
  var typeIcon = (q.type === 'civics') ? '📚' : (q.n400Q.icon || '🪪');
  var typeLbl = (q.type === 'civics') ? (lang==='es'?'Cívica':'Civics') : (lang==='es'?'N-400':'N-400');

  var hfActive = !!intvState.handsFree;
  if(!IntvVoice.recognizer) hfActive = false;
  var hfBtn = !IntvVoice.recognizer ? '' : '<button class="intvHandsFreeBtn'+(hfActive?' intvHandsFreeOn':'')+'" '
    + 'onclick="toggleIntvHandsFree()" '
    + 'aria-pressed="'+(hfActive?'true':'false')+'" '
    + 'aria-label="'+(lang==='es'?'Modo manos libres':'Hands-free mode')+'" '
    + 'title="'+(lang==='es'?'Manos libres':'Hands-free')+'">'
    + iconSVG('mic', hfActive?'#fff':'#84807a', 14)
    + '<span class="intvHandsFreeLbl">'+(lang==='es'?'Manos libres':'Hands-free')+'</span>'
    + '</button>';
  // Session streak badge — pulses on increment
  var streak = intvState.currentStreak || 0;
  var streakBadge = streak >= 2
    ? '<div class="intvStreakBadge'+(intvState.justIncrementedStreak?' intvStreakPulse':'')+'" title="'+(lang==='es'?'Racha de respuestas':'Answer streak')+'">'
        + '🔥 <span class="intvStreakN">'+streak+'</span>'
        + '<span class="intvStreakRow">'+(lang==='es'?'al hilo':'in a row')+'</span>'
      + '</div>'
    : '';
  // Clear the pulse flag after one render so it only animates the moment it increments
  intvState.justIncrementedStreak = false;
  var html = ''
    + '<div class="intvOfficerRow">'
    +   '<div class="intvOfficerAvatar">'+camiOfficerSVG(40)+'</div>'
    +   '<div class="intvOfficerHeadCol"><div class="intvOfficerLabel">'+(lang==='es'?'OFICIAL DE USCIS':'USCIS OFFICER')+'</div>'
    +   '<div class="intvOfficerSub">'+typeIcon+' '+typeLbl+(q.type==='civics'?' · '+(lang==='es'?'pregunta '+q.qId:'question '+q.qId):'')+'</div></div>'
    +   streakBadge
    +   hfBtn
    + '</div>'
    + '<div class="intvBubble">'+questionText+'</div>';
  if(lang !== 'en') html += '<div class="intvBubbleEn">"'+questionEn+'"</div>';
  if(ttsSupported()){
    html += '<button class="intvReplayBtn" onclick="replayOfficer()">🔊 '+(lang==='es'?'Escuchar de nuevo':'Hear it again')+'</button>';
  }

  // Phase-specific content
  if(intvState.phase === 'asking'){
    html += '<div class="intvStatusRow"><span class="intvDots"><span></span><span></span><span></span></span>'
      + (lang==='es' ? 'El oficial te está hablando…' : 'Officer is speaking…')
      + '</div>';
  } else if(intvState.phase === 'ready'){
    if(IntvVoice.recognizer){
      html += '<div class="intvMicArea">'
        + '<button class="intvMicBtn" onclick="userPressMic()">'
        +   '<div class="intvMicIco">'+iconSVG('mic','#fff',38)+'</div>'
        + '</button>'
        + '<div class="intvMicHint">'+(lang==='es'?'Toca y responde en voz alta':'Tap, then answer out loud')+'</div>'
        + '</div>';
    } else {
      // No SpeechRecognition (iOS WKWebView): typed answers ARE the flow — no dead mic button.
      html += '<div class="intvFallback">'
        + '<div class="intvFallbackLbl">'+(lang==='es'?'Escribe tu respuesta:':'Type your answer:')+'</div>'
        + '<input type="text" id="intvFallbackInput" class="intvFallbackInput" placeholder="'+(lang==='es'?'Tu respuesta…':'Your answer…')+'" />'
        + '<button class="cta" onclick="submitFallbackAnswer()">'+(lang==='es'?'Enviar':'Submit')+'</button>'
        + '</div>';
    }
  } else if(intvState.phase === 'listening'){
    html += '<div class="intvMicArea">'
      + '<button class="intvMicBtn intvMicActive" onclick="userPressMic()">'
      +   '<div class="intvMicIco">'+iconSVG('mic','#fff',38)+'</div>'
      +   '<div class="intvMicPulse"></div>'
      + '</button>'
      + '<div class="intvMicLevel" aria-hidden="true">'
      +   '<div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div><div class="intvMicLevelBar"></div>'
      + '</div>'
      + '<div class="intvMicHint intvMicHintActive">'+(lang==='es'?'Escuchando… toca para parar':'Listening… tap to stop')+'</div>'
      + '<div class="intvLiveBox">'
      +   '<div class="intvLiveLbl"><span id="intvConfDot" class="intvConfDot" title="Recognition confidence"></span>'+(lang==='es'?'TE OIGO':'I HEAR YOU')+'</div>'
      +   '<div class="intvLiveTranscript" id="intvLiveTranscript">'+(intvState.currentTranscript || (lang==='es'?'…':'…'))+'</div>'
      +   '<div class="intvPacingHint" id="intvPacingHint"></div>'
      + '</div>'
      + '</div>';
  } else if(intvState.phase === 'lowConfidence'){
    html += '<div class="intvLowConf">'
      + '<div class="intvLowConfIco">'+iconSVG('question','#84807a',32)+'</div>'
      + '<div class="intvLowConfTitle">'+(lang==='es'?"No te oí bien":"I didn't catch that")+'</div>'
      + (intvState.lowConfHeard
          ? '<div class="intvLowConfHeard">'+(lang==='es'?'Te oí: ':'I heard: ')+'"<em>'+intvState.lowConfHeard+'</em>"</div>'
          : '<div class="intvLowConfHeard">'+(lang==='es'?'No oí nada — habla más cerca del micrófono':'I heard silence — speak closer to the mic')+'</div>')
      + '<div class="intvLowConfRow">'
      +   '<button class="cta intvLowConfRetry" onclick="userPressMic()">'+iconSVG('mic','#fff',16)+' '+(lang==='es'?'Reintentar':'Try again')+'</button>'
      +   '<button class="intvLowConfShow" onclick="forceGradeIntvAnswer()">'+(lang==='es'?'Calificar de todos modos':'Grade anyway')+'</button>'
      + '</div>'
      + '</div>';
  } else if(intvState.phase === 'verdict'){
    var last = intvState.results[intvState.results.length - 1];
    var verdictClass = last.verdict;
    var verdictLbl, verdictIco;
    if(last.verdict === 'correct'){
      verdictLbl = last.overridden ? (lang==='es'?'✓ Marcado correcto':'✓ Marked correct') : (lang==='es'?'✓ Correcto':'✓ Correct');
      verdictIco = '✓';
    } else if(last.verdict === 'close'){
      verdictLbl = lang==='es' ? '△ Cerca' : '△ Close';
      verdictIco = '△';
    } else {
      verdictLbl = lang==='es' ? '✗ No del todo' : '✗ Not quite';
      verdictIco = '✗';
    }
    var playBtn = last.audioUrl
      ? '<button class="intvPlayBtn" onclick="playUserAudio(\''+last.audioUrl+'\')">▶ '+(lang==='es'?'Escucharme':'Play my answer')+'</button>'
      : '';
    // "Did you mean?" — show top distinct variants the user can tap if they had a near miss.
    // Only meaningful when not already 'correct' AND we have candidates with non-zero score.
    var didYouMeanHtml = '';
    if(last.verdict !== 'correct' && last.topMatches && last.topMatches.length){
      var pillsHtml = '';
      for(var dym=0; dym<last.topMatches.length; dym++){
        pillsHtml += '<button class="intvDymPill" onclick="acceptDidYouMean('+dym+')">'
          + iconSVG('check','#00b4a8',12) + ' ' + last.topMatches[dym] + '</button>';
      }
      didYouMeanHtml = '<div class="intvDym">'
        + '<div class="intvDymLbl">'+(lang==='es'?'¿Quisiste decir?':'Did you mean?')+'</div>'
        + '<div class="intvDymPills">'+pillsHtml+'</div>'
        + '</div>';
    }
    var hearBtn = ttsSupported()
      ? '<button class="intvHearItBtn" onclick="hearOfficialAnswer()" aria-label="'+(lang==='es'?'Escuchar respuesta correcta':'Hear the correct answer')+'">'
        + iconSVG('speaker','#fff',14)
        + ' ' + (lang==='es'?'Escuchar bien dicho':'Hear it spoken')
        + '</button>'
      : '';
    html += '<div class="intvVerdict intvVerdict-'+verdictClass+'">'
      + '<div class="intvVerdictHead">'+verdictLbl+'</div>'
      + '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'TE OÍ':'I HEARD')+'</div><div class="intvVerdictVal">"'+(last.heard || '—')+'"</div></div>'
      + playBtn
      + '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'RESPUESTA OFICIAL':'OFFICIAL ANSWER')+'</div><div class="intvVerdictVal intvVerdictExpected">'+last.expected+'</div></div>'
      + hearBtn
      + (last.matched && last.matched !== last.expected ? '<div class="intvVerdictRow"><div class="intvVerdictKey">'+(lang==='es'?'COINCIDIÓ CON':'MATCHED')+'</div><div class="intvVerdictVal">'+last.matched+'</div></div>' : '')
      + didYouMeanHtml
      + (last.verdict !== 'correct' ? '<button class="intvOverrideBtn" onclick="overrideAsCorrect()">'+(lang==='es'?'Realmente lo dije bien — marcar como correcto':'I said it right — mark correct')+'</button>' : '')
      + '</div>';
  }
  body.innerHTML = html;
  populateIcons();

  if(footer){
    var f = '';
    if(intvState.phase === 'ready' || intvState.phase === 'asking'){
      f = '<button class="intvSkipBtn" onclick="skipInterviewQ()">'+(lang==='es'?'Saltar':'Skip')+'</button>';
    } else if(intvState.phase === 'listening'){
      f = '<button class="intvSkipBtn" onclick="userPressMic()">'+(lang==='es'?'Detener':'Stop')+'</button>';
    } else if(intvState.phase === 'lowConfidence'){
      f = '<button class="intvSkipBtn" onclick="skipInterviewQ()">'+(lang==='es'?'Saltar pregunta':'Skip question')+'</button>';
    } else if(intvState.phase === 'verdict'){
      var isLast = intvState.qIdx >= intvState.questions.length - 1;
      f = '<button class="cta intvShowBtn" onclick="nextInterviewQ()">'+(isLast ? (lang==='es'?'Ver mi resultado':'See my result') : (lang==='es'?'Siguiente pregunta':'Next question'))+' →</button>';
    }
    footer.innerHTML = f;
  }
}

function renderInterviewResults(){
  if(!intvState) return;
  var r = intvState.results;
  var correct = r.filter(function(x){return x.verdict==='correct';}).length;
  var close = r.filter(function(x){return x.verdict==='close';}).length;
  var wrong = r.filter(function(x){return x.verdict==='wrong';}).length;
  var total = r.length;
  var passed = total > 0 && correct >= Math.ceil(total * 0.6);

  var counter = document.getElementById('intvCounter');
  if(counter) counter.textContent = lang==='es' ? 'Resultado' : 'Result';
  var fill = document.getElementById('intvProgressFill');
  if(fill) fill.style.width = '100%';

  var body = document.getElementById('intvBody');
  var footer = document.getElementById('intvFooter');
  if(!body) return;

  var verdictTxt = passed
    ? (lang==='es' ? '¡Pasarías la entrevista!' : 'You would pass!')
    : (lang==='es' ? 'Más práctica recomendada' : 'More practice needed');
  var verdictSub = passed
    ? (lang==='es' ? 'Acertaste '+correct+'/'+total+'. USCIS requiere 6/10 en cívica.' : 'You got '+correct+'/'+total+'. USCIS requires 6/10 on civics.')
    : (lang==='es' ? 'Acertaste '+correct+'/'+total+'. Practica los temas marcados abajo.' : 'You got '+correct+'/'+total+'. Practice the topics flagged below.');

  // Per-question breakdown with audio playback if recorded
  var breakHtml = '';
  for(var i=0;i<r.length;i++){
    var x = r[i];
    var ico = x.verdict==='correct' ? '✓' : x.verdict==='close' ? '△' : '✗';
    var cls = 'intvBVRow-' + x.verdict;
    var playBtnRow = x.audioUrl
      ? '<button class="intvBVPlay" onclick="playUserAudio(\''+x.audioUrl+'\')">▶ '+(lang==='es'?'Oír':'Play')+'</button>'
      : '';
    breakHtml += '<div class="intvBVRow '+cls+'">'
      + '<div class="intvBVIco">'+ico+'</div>'
      + '<div class="intvBVMain">'
      +   '<div class="intvBVQ">'+(x.questionTextLocal || x.questionText)+'</div>'
      +   '<div class="intvBVA"><strong>'+(lang==='es'?'Tú:':'You:')+'</strong> '+(x.heard ? '"'+x.heard+'"' : (lang==='es'?'(saltada)':'(skipped)'))+' '+playBtnRow+'</div>'
      +   (x.verdict !== 'correct' ? '<div class="intvBVA"><strong>'+(lang==='es'?'Oficial:':'Officer:')+'</strong> '+x.expected+'</div>' : '')
      + '</div>'
      + '</div>';
  }

  // Topic heatmap — per-civics-unit mastery from your overall study, not just this session
  var heatmap = civicsUnitMastery();
  var heatmapHtml = '';
  if(heatmap.length){
    heatmap.forEach(function(u){
      var pct = u.total > 0 ? Math.round((u.mastered / u.total) * 100) : 0;
      var tone = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low';
      var weakBadge = u.weak > 0
        ? '<span class="intvHeatWeak">'+u.weak+' '+(lang==='es'?'débil'+(u.weak===1?'':'es'):'weak')+'</span>'
        : '';
      var actionBtn = u.weakestLesson
        ? '<button class="intvHeatLessonBtn" onclick="startLesson(\''+u.weakestLesson+'\')">'+(lang==='es'?'Estudiar →':'Study →')+'</button>'
        : '';
      heatmapHtml += '<div class="intvHeatRow">'
        + '<div class="intvHeatLeft">'
        +   '<div class="intvHeatTitle">'+u.unit.title[lang]+'</div>'
        +   '<div class="intvHeatStats">'+u.mastered+'/'+u.total+' '+(lang==='es'?'dominadas':'mastered')+' · '+pct+'% '+weakBadge+'</div>'
        +   '<div class="intvHeatBar"><div class="intvHeatFill intvHeatFill-'+tone+'" style="width:'+pct+'%"></div></div>'
        + '</div>'
        + actionBtn
        + '</div>';
    });
    heatmapHtml = '<div class="intvBVTitle">'+(lang==='es'?'Tu dominio por tema':'Your mastery by topic')+'</div>'
      + '<div class="intvHeatmap">'+heatmapHtml+'</div>';
  }

  var needWork = civicsNeedsWorkCount();
  var hint = needWork > 0
    ? '<div class="intvNextHint">📌 '+needWork+' '+(lang==='es'?'preguntas necesitan trabajo · la próxima sesión las prioriza':'questions need work · next session prioritizes them')+'</div>'
    : '';

  body.innerHTML = ''
    + '<div class="intvResultsHead">'
    +   '<div class="intvResultBadge '+(passed?'intvGood':'intvWeak')+'">'+verdictTxt+'</div>'
    +   '<div class="intvScoreNum">'+correct+'/'+total+'</div>'
    +   '<div class="intvScoreSub">'+verdictSub+'</div>'
    + '</div>'
    + '<div class="intvBreakdown">'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVGood"></div><div class="intvBreakLbl">'+(lang==='es'?'Correctas':'Correct')+'</div><div class="intvBreakVal">'+correct+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVMid"></div><div class="intvBreakLbl">'+(lang==='es'?'Cerca':'Close')+'</div><div class="intvBreakVal">'+close+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVBad"></div><div class="intvBreakLbl">'+(lang==='es'?'Erradas':'Wrong')+'</div><div class="intvBreakVal">'+wrong+'</div></div>'
    + '</div>'
    + heatmapHtml
    + hint
    + '<div class="intvBVTitle">'+(lang==='es'?'Tu desempeño pregunta por pregunta':'Question-by-question breakdown')+'</div>'
    + '<div class="intvBVList">'+breakHtml+'</div>';

  if(footer){
    footer.innerHTML = '<button class="cta" onclick="startInterview()">'+(lang==='es' ? '🔁 Practicar de nuevo' : '🔁 Practice again')+'</button>'
      + '<button class="intvBackBtn" onclick="exitInterview()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>';
  }
}

function renderInterviewResults(score, got, hesitated, unsure, total){
  var counter = document.getElementById('intvCounter');
  if(counter) counter.textContent = lang==='es' ? 'Resultado' : 'Result';
  var fill = document.getElementById('intvProgressFill');
  if(fill) fill.style.width = '100%';

  var body = document.getElementById('intvBody');
  var footer = document.getElementById('intvFooter');
  if(!body) return;

  var verdict, verdictClass, sub;
  if(score >= 80){
    verdict = lang==='es' ? '¡Listo para la entrevista!' : "You're ready!";
    verdictClass = 'intvGood';
    sub = lang==='es' ? 'Tu autoevaluación muestra una preparación sólida.' : 'Your self-rating shows solid preparation.';
  } else if(score >= 60){
    verdict = lang==='es' ? 'Casi listo' : 'Almost ready';
    verdictClass = 'intvOk';
    sub = lang==='es' ? 'Sigue practicando los puntos donde dudaste.' : 'Keep practicing the ones you hesitated on.';
  } else {
    verdict = lang==='es' ? 'Más práctica recomendada' : 'More practice recommended';
    verdictClass = 'intvWeak';
    sub = lang==='es' ? 'Vuelve a la sección de Aprender para reforzar los conceptos básicos.' : 'Head back to Learn to reinforce the basics.';
  }

  body.innerHTML = ''
    + '<div class="intvResultsHead">'
    +   '<div class="intvResultBadge '+verdictClass+'">'+verdict+'</div>'
    +   '<div class="intvScoreNum">'+score+'%</div>'
    +   '<div class="intvScoreSub">'+sub+'</div>'
    + '</div>'
    + '<div class="intvBreakdown">'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVGood"></div><div class="intvBreakLbl">'+(lang==='es'?'Lo tuve':'Got it')+'</div><div class="intvBreakVal">'+got+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVMid"></div><div class="intvBreakLbl">'+(lang==='es'?'Dudé':'Hesitated')+'</div><div class="intvBreakVal">'+hesitated+'</div></div>'
    +   '<div class="intvBreakRow"><div class="intvBreakDot intvBVBad"></div><div class="intvBreakLbl">'+(lang==='es'?'No sabía':"Didn't know")+'</div><div class="intvBreakVal">'+unsure+'</div></div>'
    + '</div>';

  if(footer){
    footer.innerHTML = '<button class="cta" onclick="startInterview()">'+(lang==='es' ? '🔁 Practicar de nuevo' : '🔁 Practice again')+'</button>'
      + '<button class="intvBackBtn" onclick="exitInterview()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>';
  }
}

function renderHomeInterviewCard(){
  var el = document.getElementById('homeInterviewCard');
  if(!el) return;
  var attempts = (user.progress && user.progress.interviewAttempts) || [];
  var best = attempts.length > 0 ? Math.max.apply(null, attempts.map(function(a){return a.score;})) : null;
  var needWork = civicsNeedsWorkCount();
  var counts = civicsMasteryCounts();
  var masteredTotal = counts.mastered;

  var titleTxt;
  if(attempts.length === 0){
    titleTxt = lang==='es' ? 'Practica tu entrevista USCIS' : 'Practice your USCIS interview';
  } else if(needWork > 0){
    titleTxt = lang==='es'
      ? 'Trabaja en '+needWork+' débiles'
      : 'Drill your '+needWork+' weak spots';
  } else {
    titleTxt = lang==='es' ? '¡Listo para la entrevista!' : "You're interview-ready!";
  }

  var subTxt;
  if(attempts.length === 0){
    subTxt = lang==='es' ? 'Voz real · 10 preguntas · cívica + N-400' : 'Voice-driven · 10 questions · civics + N-400';
  } else if(needWork > 0){
    subTxt = lang==='es'
      ? 'La sesión prioriza tus puntos débiles'
      : 'Session prioritizes the ones you missed';
  } else {
    subTxt = lang==='es' ? 'Sigue practicando para mantener tu dominio' : 'Keep practicing to keep your edge';
  }

  var metaLeft, metaRight;
  if(best != null){
    metaLeft = (lang==='es'?'Mejor: ':'Best: ')+best+'% · '+masteredTotal+'/'+CIVICS.length+' '+(lang==='es'?'dominadas':'mastered');
    metaRight = (lang==='es'?'Practicar':'Practice')+' →';
  } else {
    metaLeft = '~5 '+(lang==='es'?'min':'min')+' · 10 '+(lang==='es'?'preguntas':'questions');
    metaRight = (lang==='es'?'Empezar':'Start')+' →';
  }

  el.innerHTML = '<span class="pill">'+(lang==='es' ? 'Simulador de entrevista' : 'Interview simulator')+'</span>'
    + '<div class="lessonTitle">'+titleTxt+'</div>'
    + '<div class="lessonSub">'+subTxt+'</div>'
    + '<div class="lessonMeta"><span>'+metaLeft+'</span><span>'+metaRight+'</span></div>';
}

// ===== LEGAL DISCLAIMER SYSTEM =====
// One-time accept on first launch. Persistent footer on Cami + sensitive screens.
// Full text accessible from Me tab. Designed to protect against unauthorized-practice
// of-law / reliance-damage claims.

var DISCLAIMER_VERSION = 'v3-2026-07';

var LEGAL_DISCLAIMER = {
  short: {
    en: 'Camino is a self-help educational tool, not a law firm. Nothing here is legal advice for your case.',
    es: 'Camino es una herramienta educativa de autoayuda, no un bufete. Nada aquí es asesoría legal para tu caso.'
  },
  title: {en: 'Important — read before using', es: 'Importante — léelo antes de usar'},
  full: {
    en: [
      'Camino is **self-help software** that provides general information and study tools. It is **not a law firm**, is **not a substitute for the advice of an attorney**, and does **not provide legal advice, opinions, or recommendations**.',
      'Using Camino does **not create an attorney-client relationship**, and nothing you enter is protected by attorney-client privilege.',
      'Camino **cannot tell you whether you qualify** for any immigration benefit and does not review your information for legal sufficiency. Its document tools only record **your own answers, at your direction**, and place them **verbatim** on forms for your personal review — you complete, sign, and file everything yourself.',
      'Immigration law changes often and outcomes are fact-specific. **No outcome is guaranteed**, and content may not reflect the most recent changes — always verify with uscis.gov. Before any decision affecting your legal status, consult a **licensed U.S. immigration attorney or a BIA-accredited representative**.',
      'Camino is not affiliated with USCIS or any government agency. To the fullest extent permitted by law, Camino, its authors, and affiliates **disclaim all liability** for actions taken in reliance on this app.'
    ],
    es: [
      'Camino es **software de autoayuda** que ofrece información general y herramientas de estudio. **No es un bufete**, **no sustituye la asesoría de un abogado**, y **no da asesoría, opiniones ni recomendaciones legales**.',
      'Usar Camino **no crea una relación abogado-cliente**, y nada de lo que ingreses está protegido por el privilegio abogado-cliente.',
      'Camino **no puede decirte si calificas** para ningún beneficio migratorio y no revisa tu información para suficiencia legal. Sus herramientas de documentos solo registran **tus propias respuestas, bajo tu dirección**, y las colocan **textualmente** en formularios para tu revisión personal — tú completas, firmas y presentas todo.',
      'La ley de inmigración cambia con frecuencia y los resultados dependen de los hechos. **Ningún resultado está garantizado**, y el contenido puede no reflejar los cambios más recientes — verifica siempre en uscis.gov. Antes de cualquier decisión que afecte tu estatus legal, consulta a un **abogado licenciado de inmigración o un representante acreditado por la BIA**.',
      'Camino no está afiliado a USCIS ni a ninguna agencia del gobierno. En la máxima medida permitida por la ley, Camino, sus autores y afiliados **no aceptan responsabilidad** por acciones tomadas con base en esta app.'
    ]
  },
  accept: {en: 'I understand — continue', es: 'Entiendo — continuar'},
  later: {en: 'Read full terms later', es: 'Leer términos después'}
};

function hasAcceptedDisclaimer(){
  return user.disclaimerAcceptedVersion === DISCLAIMER_VERSION;
}

function acceptDisclaimer(){
  user.disclaimerAcceptedVersion = DISCLAIMER_VERSION;
  user.disclaimerAcceptedAt = todayISO();
  saveUser();
  closeDisclaimerModal();
  // If we got here right after onboarding, chain to the trial offer
  if(user.pendingTrialOffer){
    user.pendingTrialOffer = false;
    saveUser();
    if(planStatus() === 'free' && !user.trialStartedAt){
      go('trialOffer');
      renderTrialOffer();
      return;
    }
    go('home');
    toast(lang==='es' ? '¡Listo! Empecemos.' : "You're set! Let's go.");
  }
}

// ===== Modal focus management =====
// Records the element that had focus before the modal opened, traps focus inside
// the modal while open, and restores focus on close.
var modalFocusRestore = null;

function setupModalFocus(modalEl, opts){
  opts = opts || {};
  modalFocusRestore = document.activeElement;
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  // Escape closes (unless the modal is non-dismissible like the first-run disclaimer)
  if(opts.dismissible !== false){
    modalEl._escHandler = function(e){
      if(e.key === 'Escape'){
        var closer = modalEl.querySelector('[data-modal-close]');
        if(closer) closer.click();
        else modalEl.remove();
      }
    };
    document.addEventListener('keydown', modalEl._escHandler);
  }
  // Move focus to the first focusable element inside the modal (after a tick so
  // the browser has painted)
  setTimeout(function(){
    var focusables = modalEl.querySelectorAll('button, input, textarea, select, a, [tabindex]:not([tabindex="-1"])');
    if(focusables.length) focusables[0].focus();
  }, 50);
  // Trap focus on Tab key
  modalEl._focusTrap = function(e){
    if(e.key !== 'Tab') return;
    var focusables = modalEl.querySelectorAll('button, input, textarea, select, a, [tabindex]:not([tabindex="-1"])');
    if(!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  };
  document.addEventListener('keydown', modalEl._focusTrap);
}

function teardownModalFocus(modalEl){
  if(modalEl && modalEl._focusTrap){
    document.removeEventListener('keydown', modalEl._focusTrap);
    modalEl._focusTrap = null;
  }
  if(modalEl && modalEl._escHandler){
    document.removeEventListener('keydown', modalEl._escHandler);
    modalEl._escHandler = null;
  }
  if(modalFocusRestore && document.body.contains(modalFocusRestore)){
    try { modalFocusRestore.focus(); } catch(e){}
  }
  modalFocusRestore = null;
}

function showDisclaimerModal(canDismiss){
  var existing = document.getElementById('disclaimerModal');
  if(existing){ teardownModalFocus(existing); existing.remove(); }
  var modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.className = 'disclaimerOverlay';
  modal.setAttribute('aria-labelledby', 'disclaimerModalTitle');
  var bullets = LEGAL_DISCLAIMER.full[lang].map(function(b){
    // Light bold parsing
    var html = b.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return '<li>'+html+'</li>';
  }).join('');
  modal.innerHTML = ''
    + '<div class="disclaimerCard">'
    + '  <div class="disclaimerHead">'
    + '    <div class="disclaimerIco">'+iconSVG('scales','#1d1d22',26)+'</div>'
    + '    <div class="disclaimerTitle" id="disclaimerModalTitle">'+LEGAL_DISCLAIMER.title[lang]+'</div>'
    + '  </div>'
    + '  <ul class="disclaimerBody">'+bullets+'</ul>'
    + '  <button class="cta disclaimerCta" onclick="acceptDisclaimer()">'+LEGAL_DISCLAIMER.accept[lang]+'</button>'
    + (canDismiss ? '  <button class="disclaimerLater" onclick="closeDisclaimerModal()">'+(lang==='es'?'Cerrar':'Close')+'</button>' : '')
    + '</div>';
  document.body.appendChild(modal);
  setupModalFocus(modal, {dismissible: canDismiss});
}

function closeDisclaimerModal(){
  var m = document.getElementById('disclaimerModal');
  if(m){ teardownModalFocus(m); m.remove(); }
}

function maybeShowFirstRunDisclaimer(){
  if(!user.onboarded) return; // shown after onboarding completes
  if(hasAcceptedDisclaimer()) return;
  showDisclaimerModal(false); // can't dismiss without accepting
}

function disclaimerFooterHTML(opts){
  opts = opts || {};
  var msg = LEGAL_DISCLAIMER.short[lang];
  if(opts.context === 'cami'){
    msg = lang === 'es'
      ? 'Cami es un modelo de IA, no un abogado. Verifica tu caso con un abogado de inmigración.'
      : 'Cami is an AI model, not a lawyer. Verify your case with an immigration attorney.';
  }
  return '<div class="disclaimerFooter'+(opts.context==='cami'?' disclaimerFooterCami':'')+'" onclick="showDisclaimerModal(true)">'
    + iconSVG('warning','#a05000',13)
    + '<span>'+msg+'</span>'
    + '<span class="disclaimerFooterLink">'+(lang==='es'?'Leer':'Read')+' →</span>'
    + '</div>';
}

// ===== CAMI AI COACH =====
// Claude-powered chat covering both civics + immigration topics.
// User provides their own Anthropic API key (saved locally) — for production this
// would be proxied through a backend. Plus-gated with daily message cap.

var CAMI_MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap for back-and-forth
var CAMI_MAX_TOKENS = 1024;
var CAMI_DAILY_CAP_TRIAL = 10;
var CAMI_DAILY_CAP_PLUS = 100;

var camiState = {
  messages: [],          // {role:'user'|'assistant', content:string, ts:number}
  isLoading: false,
  error: null
};

// ===== CAMI WALKTHROUGH / TUTORIAL =====
// Fires once after onboarding (post-trial-offer). Cami leads a 6-step tour of the
// app's main features. User can skip or follow through; persists to user.tutorialCompleted.

var TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: {en: 'Hi {name}! Welcome to Camino.', es: '¡Hola, {name}! Bienvenido/a a Camino.'},
    body: {
      en: "I'm Cami — your immigration and civics coach. Let me show you around in 60 seconds. You can skip anytime.",
      es: "Soy Cami — tu tutor de inmigración y cívica. Te enseño todo en 60 segundos. Puedes saltar cuando quieras."
    },
    mood: 'happy',
    cta: {en: 'Show me around', es: 'Muéstrame'},
    skipLabel: {en: 'Skip tutorial', es: 'Saltar tutorial'}
  },
  {
    id: 'today',
    title: {en: 'Your daily lesson lives here', es: 'Tu lección diaria vive aquí'},
    body: {
      en: "Tap this card to start a 5-minute civics lesson. Your streak, XP, and progress all build from here — one lesson a day.",
      es: "Toca esta tarjeta para empezar una lección de cívica de 5 minutos. Tu racha, XP y progreso crecen desde aquí — una lección al día."
    },
    mood: 'happy',
    tabId: 't-home',
    navTo: 'home',
    target: '#home .lesson, #home .lessonCard, #homeLessonCard'
  },
  {
    id: 'stats',
    title: {en: 'Track your momentum', es: 'Sigue tu impulso'},
    body: {
      en: "Streak, XP, and how ready you are for the test. The 🔥 keeps you coming back daily; the 🎯 shows how close you are to passing.",
      es: "Racha, XP, y qué tan listo/a estás para el examen. El 🔥 te mantiene volviendo cada día; el 🎯 muestra qué tan cerca estás."
    },
    mood: 'celebrate',
    tabId: 't-home',
    navTo: 'home',
    target: '#home .stats, #home .statRow'
  },
  {
    id: 'path',
    title: {en: 'Your immigration roadmap', es: 'Tu hoja de ruta de inmigración'},
    body: {
      en: "Every stage from where you are today to citizenship — with the *exact USCIS forms* you need at each step. Tap any form chip to open the official PDF.",
      es: "Cada etapa desde hoy hasta la ciudadanía — con los formularios USCIS exactos para cada paso. Toca cualquier formulario para abrir el PDF oficial."
    },
    mood: 'happy',
    tabId: 't-path',
    navTo: 'path',
    target: '#path .stepCard, #path .step:nth-child(1)'
  },
  {
    id: 'learn',
    title: {en: 'Learn civics, the smart way', es: 'Aprende cívica, de forma inteligente'},
    body: {
      en: "All 100 USCIS questions in 4 themed units. Tap a lesson to start — the green one is what's next for you.",
      es: "Las 100 preguntas USCIS en 4 unidades. Toca una lección para empezar — la verde es tu siguiente."
    },
    mood: 'happy',
    tabId: 't-lesson',
    navTo: 'learn',
    target: '#learn .unitBanner, #learn .pnodeWrap:first-child .lnode'
  },
  {
    id: 'me',
    title: {en: 'Profile, settings, and Plus', es: 'Perfil, ajustes, y Plus'},
    body: {
      en: "Your achievements, language, Plus subscription, USCIS case status — all here. Tap your name at the top to edit your info.",
      es: "Tus logros, idioma, suscripción Plus, estado de caso USCIS — todo aquí. Toca tu nombre arriba para editar tus datos."
    },
    mood: 'happy',
    tabId: 't-me',
    navTo: 'me',
    target: '#me .meHero, #me .row:first-child'
  },
  {
    id: 'done',
    title: {en: "You're all set!", es: '¡Listo!'},
    body: {
      en: "Start with today's lesson, or explore the Path to see what's next. Your journey begins now.",
      es: "Empieza con la lección de hoy, o explora la Vía para ver lo que sigue. Tu camino empieza ahora."
    },
    mood: 'celebrate',
    cta: {en: 'Start today\'s lesson', es: 'Empezar lección de hoy'},
    ctaAction: 'startCurrentLesson'
  }
];

var tutorialState = { stepIdx: 0, active: false };

function startTutorial(){
  tutorialState = { stepIdx: 0, active: true };
  renderTutorial();
}

function tutorialNext(){
  if(tutorialState.stepIdx >= TUTORIAL_STEPS.length - 1){
    return finishTutorial();
  }
  tutorialState.stepIdx++;
  renderTutorial();
}

function tutorialSkip(){
  finishTutorial();
}

function finishTutorial(){
  tutorialState.active = false;
  user.tutorialCompleted = true;
  saveUser();
  closeTutorial();
}

function closeTutorial(){
  var el = document.getElementById('tutorialOverlay');
  if(el){ try { teardownModalFocus(el); } catch(e){} el.remove(); }
  // Restore tabbar hide-state in case we changed it during the tour
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('tabSpotlight'); });
}

function tutorialPrimaryAction(){
  var step = TUTORIAL_STEPS[tutorialState.stepIdx];
  if(step.ctaAction){
    finishTutorial();
    try { window[step.ctaAction] && window[step.ctaAction](); } catch(e){}
    return;
  }
  if(step.navTo){
    // Highlight + navigate, but DON'T finish yet — user can keep tutorial going
    // Actually, simpler: just advance and the next step's nav happens via its own button
    tutorialNext();
    return;
  }
  tutorialNext();
}

function renderTutorial(){
  closeTutorial();
  if(!tutorialState.active) return;
  var step = TUTORIAL_STEPS[tutorialState.stepIdx];
  if(!step) return finishTutorial();

  // Highlight the corresponding tab in the bottom nav (if any)
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('tabSpotlight'); });
  if(step.tabId){
    var tabEl = document.getElementById(step.tabId);
    if(tabEl) tabEl.classList.add('tabSpotlight');
  }
  // Navigate to the target view so the element exists in the DOM
  if(step.navTo){
    try { go(step.navTo); } catch(e){}
  }
  // Wait a tick for the view to paint, then position the spotlight precisely on the target
  setTimeout(paintTutorialOverlay, step.navTo ? 280 : 0);
}

function paintTutorialOverlay(){
  if(!tutorialState.active) return;
  closeTutorial();
  var step = TUTORIAL_STEPS[tutorialState.stepIdx];
  if(!step) return finishTutorial();

  var name = (user.name || (lang==='es' ? 'amigo/a' : 'friend')).trim();
  var titleText = step.title[lang].replace('{name}', name);
  var bodyText = step.body[lang];
  var isLast = tutorialState.stepIdx === TUTORIAL_STEPS.length - 1;

  // Find + scroll the target into view (if any)
  var targetEl = step.target ? document.querySelector(step.target) : null;
  if(targetEl){
    try { targetEl.scrollIntoView({block: 'center', behavior: 'auto'}); } catch(e){}
  }

  // Compute spotlight box AFTER scrolling settles
  setTimeout(function(){
    if(!tutorialState.active) return;
    var box = null;
    if(targetEl){
      var r = targetEl.getBoundingClientRect();
      var pad = 10;
      box = {
        x: Math.max(0, r.left - pad),
        y: Math.max(0, r.top - pad),
        w: Math.min(window.innerWidth, r.right + pad) - Math.max(0, r.left - pad),
        h: r.height + pad * 2
      };
    }

    // Progress dots
    var dots = '';
    for(var i=0;i<TUTORIAL_STEPS.length;i++){
      dots += '<span class="tutDot'+(i === tutorialState.stepIdx ? ' tutDotActive' : (i < tutorialState.stepIdx ? ' tutDotDone' : ''))+'"></span>';
    }

    var primaryLabel = step.cta ? step.cta[lang]
      : (isLast ? (lang==='es'?'Empezar':'Get started') : (lang==='es'?'Siguiente':'Next'));
    var secondaryLabel = step.secondaryCta ? step.secondaryCta[lang] : null;
    var secondaryAction = step.secondaryAction || null;

    // Position the card on the OPPOSITE side of the screen from the target
    // so it never covers the thing Cami is pointing at.
    var vh = window.innerHeight;
    var cardSlot = 'bottom'; // default: card at bottom
    if(box && (box.y + box.h / 2) > vh / 2){
      cardSlot = 'top'; // target is in bottom half → card goes up top
    }

    var overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'tutOverlay tutOverlaySpot tutCardSlot-' + cardSlot;

    var spotlightHtml = '';
    if(box){
      spotlightHtml = ''
        + '<div class="tutDim tutDimTop"    style="height:'+box.y+'px;" onclick="tutorialSkip()"></div>'
        + '<div class="tutDim tutDimLeft"   style="top:'+box.y+'px;height:'+box.h+'px;width:'+box.x+'px;" onclick="tutorialSkip()"></div>'
        + '<div class="tutDim tutDimRight"  style="top:'+box.y+'px;height:'+box.h+'px;left:'+(box.x+box.w)+'px;" onclick="tutorialSkip()"></div>'
        + '<div class="tutDim tutDimBottom" style="top:'+(box.y+box.h)+'px;" onclick="tutorialSkip()"></div>'
        + '<div class="tutSpotRing" style="top:'+box.y+'px;left:'+box.x+'px;width:'+box.w+'px;height:'+box.h+'px;"></div>'
        + '<div class="tutCallout tutCallout-'+cardSlot+'" style="left:'+(box.x + box.w/2)+'px;top:'+(cardSlot==='top'?(box.y):(box.y+box.h))+'px;"></div>';
    } else {
      // No target → full backdrop (welcome / done steps)
      spotlightHtml = '<div class="tutBackdrop" onclick="tutorialSkip()"></div>';
    }

    overlay.innerHTML = spotlightHtml
      + '<div class="tutCard">'
      +   '<div class="tutSkipBar">'
      +     '<div class="tutProgress">'+dots+'</div>'
      +     '<button class="tutSkipBtn" onclick="tutorialSkip()">'+(step.skipLabel ? step.skipLabel[lang] : (lang==='es'?'Saltar':'Skip'))+'</button>'
      +   '</div>'
      + (box ? '' : '<div class="tutCami">'+camiSVG(step.mood || 'happy')+'</div>')   // hide big Cami when spotlight active — small avatar instead
      + (box ? '<div class="tutCamiMini">'+camiSVG(step.mood || 'happy')+'</div>' : '')
      +   '<div class="tutTitle">'+titleText+'</div>'
      +   '<div class="tutBody">'+bodyText.replace(/\*([^*]+)\*/g, '<em>$1</em>')+'</div>'
      +   '<div class="tutBtnRow">'
      +     '<button class="cta tutPrimary" onclick="tutorialPrimaryAction()">'+primaryLabel+(isLast?'':' →')+'</button>'
      +   '</div>'
      + (secondaryLabel ? '  <button class="tutSecondary" onclick="finishTutorial(); '+secondaryAction+';">'+secondaryLabel+'</button>' : '')
      + '</div>';
    document.body.appendChild(overlay);
    try { setupModalFocus(overlay, {dismissible: true}); } catch(e){}
  }, 50);
}

// Reposition the spotlight when the viewport changes (rotation, keyboard, resize).
if(typeof window !== 'undefined'){
  window.addEventListener('resize', function(){
    if(tutorialState.active && document.getElementById('tutorialOverlay')) renderTutorial();
  });
}

// ===== CAMI DEMO RESPONSES =====
// Curated canned answers for the most common civics + immigration questions.
// Used when no Anthropic API key is configured — lets users experience Cami without
// any setup. For paying production users, you'd swap to a backend proxy with your key.
var CAMI_DEMO_RESPONSES = [
  // Greetings + meta
  {match: ['hello', 'hi ', 'hey', 'hola'],
   reply: "Hi! I'm Cami — your immigration and civics coach. Ask me anything about your path: visa types, the N-400, the civics test, processing times. What's on your mind?"},
  {match: ['who are you', 'what are you', 'what is cami'],
   reply: "I'm Cami, the AI study coach built into Camino. I help you prep for the U.S. naturalization civics test and understand your immigration path. I'm informed but not a lawyer — for case-specific advice, always consult a licensed immigration attorney."},
  {match: ['thanks', 'thank you', 'gracias'],
   reply: "You got it. Anything else you'd like to dig into?"},

  // ===== CIVICS QUESTIONS =====
  {match: ['supreme law', 'highest law', 'most important law'],
   reply: "**The Constitution** is the supreme law of the land. Every other law — federal, state, or local — must be consistent with it. That's because the Constitution sets up the entire government and limits what it can do.\n\nThis is question #1 on the 100-question civics list."},
  {match: ['how many amendments', 'number of amendments', 'amendments'],
   reply: "**27 amendments** to the U.S. Constitution.\n\nThe first 10 are the **Bill of Rights** (ratified 1791). The most recent — the 27th — was ratified in 1992 and deals with congressional pay raises. Memorize \"27\" for the test, and \"Bill of Rights = first 10\" — those come up often."},
  {match: ['bill of rights', 'first ten amendments', 'first 10 amendments'],
   reply: "The **Bill of Rights** is the first 10 amendments to the Constitution, ratified in 1791. They protect individual liberties: freedom of speech, religion, the press, the right to bear arms, due process, jury trial, protection from unreasonable searches, etc.\n\nFor the test, common questions ask: what's one right in the 1st Amendment? (speech, religion, assembly, press, petition)."},
  {match: ['we the people', 'self-government', 'self government'],
   reply: "**\"We the People\"** — the opening words of the Constitution. It captures the idea of self-government: the people are the source of the government's power. Not a king, not the states, not a religious authority. The people.\n\nIf USCIS asks \"the idea of self-government is in the first three words of the Constitution — what are they?\" — the answer is \"We the People.\""},
  {match: ['checks and balances', 'separation of powers', 'one branch from becoming too powerful', 'branch from becoming too powerful'],
   reply: "**Checks and balances** (or **separation of powers**). The 3 branches — legislative (Congress), executive (President), judicial (Supreme Court) — each check the others. Congress passes laws but the President can veto; the President nominates judges but the Senate confirms; the Supreme Court can rule laws unconstitutional. No single branch holds it all."},
  {match: ['three branches', '3 branches', 'branches of government'],
   reply: "Three branches of the U.S. government:\n• **Legislative** — Congress (Senate + House of Representatives) writes laws\n• **Executive** — the President enforces laws\n• **Judicial** — the Supreme Court interprets laws\n\nFor the test, you might be asked to name them, name a part (e.g., \"Congress\"), or explain checks and balances."},
  {match: ['president', 'commander in chief', 'who is the president'],
   reply: "The current U.S. President is **Donald Trump**, serving his second term (sworn in January 2025).\n\nThe President is also the **Commander in Chief** of the military. Term: 4 years. We elect a President every 4 years in November. The Vice President takes over if the President can no longer serve."},
  {match: ['how many senators', 'us senators', 'senators in congress', 'senators are there'],
   reply: "**100 senators** — two per state × 50 states. Each senator serves a **6-year term**. The Senate is one of the two parts of Congress (the other is the House of Representatives, which has 435 voting members)."},
  {match: ['how many representatives', 'house of representatives members', 'voting members of the house'],
   reply: "**435 voting members** in the House of Representatives. Each serves a **2-year term**. The number of representatives per state depends on that state's population — California has the most, smaller states have fewer."},
  {match: ['vice president', 'who is the vp', 'second in command'],
   reply: "The current Vice President is **J.D. Vance**.\n\nThe VP becomes President if the President can no longer serve, and serves as **President of the Senate** (casting tie-breaking votes)."},
  {match: ['speaker of the house', 'house speaker'],
   reply: "The current Speaker of the House is **Mike Johnson** (Republican, Louisiana). The Speaker leads the House of Representatives — sets the agenda, decides what bills come up for a vote."},
  {match: ['supreme court', 'justices', 'how many justices'],
   reply: "The Supreme Court is the highest court in the U.S. It has **9 justices**. The Chief Justice is **John Roberts**. They serve for life (until they retire or die). The Court interprets the Constitution and can rule laws unconstitutional."},
  {match: ['declaration of independence', 'jefferson wrote', 'declared independence'],
   reply: "The **Declaration of Independence** was adopted on **July 4, 1776**. **Thomas Jefferson** wrote most of it. It declared the 13 colonies' independence from Great Britain.\n\nThe document lists three unalienable rights: **life, liberty, and the pursuit of happiness**."},
  {match: ['july 4', '1776', 'independence day'],
   reply: "**July 4, 1776** — the date the Declaration of Independence was adopted. The U.S. celebrates this as **Independence Day** every year. It's a federal holiday."},
  {match: ['civil war', 'lincoln', 'between the states'],
   reply: "The **Civil War** (1861–1865) was fought between the Northern (Union) and Southern (Confederate) states. **Abraham Lincoln** was the President. Key reasons: **slavery, states' rights, and economic differences**. Lincoln's **Emancipation Proclamation** freed slaves in the Confederate states."},
  {match: ['statue of liberty', 'liberty island'],
   reply: "The **Statue of Liberty** stands on **Liberty Island** in New York Harbor. France gave it to the U.S. in 1886 as a symbol of friendship and the shared values of liberty and democracy. It welcomed millions of immigrants arriving by ship."},
  {match: ['national anthem', 'star spangled banner'],
   reply: "The U.S. national anthem is **\"The Star-Spangled Banner\"**, written by **Francis Scott Key** in 1814 during the War of 1812. It became the official anthem in 1931."},
  {match: ['13 colonies', 'thirteen colonies', 'original colonies'],
   reply: "The 13 original colonies (north to south): New Hampshire, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, North Carolina, South Carolina, Georgia. The 13 stripes on the U.S. flag represent these original colonies."},
  {match: ['martin luther king', 'civil rights movement', 'mlk'],
   reply: "**Martin Luther King Jr.** led the civil rights movement, fighting for equal rights for African Americans through nonviolent protest. His **\"I Have a Dream\"** speech (1963) is one of the most famous in U.S. history. The civil rights movement led to the Civil Rights Act of 1964 and the Voting Rights Act of 1965."},

  // ===== IMMIGRATION QUESTIONS =====
  {match: ['n-400', 'n400', 'naturalization application'],
   reply: "**Form N-400** is the application for U.S. citizenship. To file, you generally need:\n• Be a lawful permanent resident (green card) for **5 years** (or 3 if married to a U.S. citizen)\n• **Continuous residence** + at least half the time **physically present** in the U.S.\n• **Good moral character**\n• Pass the **civics test** (6/10 questions) and **English** test\n• Pay the **$760 filing fee** (or apply for a fee waiver with Form I-912)\n\nYou can file **90 days early** — before your 5-year (or 3-year) anniversary."},
  {match: ['5 year rule', '5-year rule', 'five year rule'],
   reply: "The **5-year rule** is the standard naturalization eligibility path:\n• Be an LPR for at least **5 years**\n• **Physically present** in the U.S. for at least **30 months** (half the time) in those 5 years\n• **Continuous residence** — no single trip outside the U.S. lasting 6+ months\n• Live in the same USCIS district/state for **3 months**\n\nYou can file N-400 up to **90 days before** your 5-year anniversary."},
  {match: ['3 year rule', '3-year rule', 'three year rule'],
   reply: "The **3-year rule** applies if you're married to a U.S. citizen:\n• You've been an LPR for at least **3 years**\n• You've been **married to a U.S. citizen** for those 3 years\n• Your **spouse has been a U.S. citizen** for those 3 years\n• You've lived in **marital union** with that citizen spouse\n• Physically present for at least **18 months**\n\nIf the marriage ends (divorce, death) before you naturalize, you typically revert to the 5-year rule."},
  {match: ['green card', 'permanent resident', 'lpr', 'i-485', 'i485'],
   reply: "A **green card** (Form I-551) means you're a **Lawful Permanent Resident (LPR)** — you can live and work in the U.S. permanently. To apply from inside the U.S., you file **Form I-485** (Adjustment of Status). From abroad, it's **DS-260** (consular processing).\n\nCurrent I-485 processing: ~12-24 months. The green card itself is valid for 10 years and you renew with Form I-90."},
  {match: ['h-1b', 'h1b', 'h 1 b'],
   reply: "**H-1B** is a specialty-occupation work visa. Requirements:\n• **Bachelor's degree or equivalent** in the field\n• U.S. employer sponsor files **Form I-129**\n• Job pays the **prevailing wage** for the role + location\n• Subject to an annual **cap** (85,000 visas) with a **lottery** in March\n\nValid for **3 years**, renewable to **6 years** (or longer with an approved I-140). To stay beyond 6, you need a green card process going."},
  {match: ['opt', 'optional practical training'],
   reply: "**OPT (Optional Practical Training)** lets F-1 students work in the U.S. after graduation in a field related to their major:\n• **12 months** standard OPT\n• Plus **24 months STEM extension** if your degree is on the DHS STEM list AND your employer is in **E-Verify**\n\nApply with **Form I-765** up to **90 days before** graduation. Filing fee $470 online ($520 paper). You CANNOT start working until your **EAD card** arrives.\n\nWatch out: **90 days max** unemployment during the 12-month OPT, 150 days during STEM."},
  {match: ['stem opt', 'stem extension'],
   reply: "**STEM OPT extension** gives you 24 more months on top of the standard 12-month OPT. Requirements:\n• Your most recent U.S. degree is on the **DHS STEM list** (most CS, engineering, math, science)\n• Your employer is enrolled in **E-Verify**\n• The job directly relates to your STEM degree\n• You complete a **Form I-983** training plan with your employer\n\nYou can use STEM extension once per degree level (so once after BS, once after MS, etc.)."},
  {match: ['asylum', 'i-589', 'i589'],
   reply: "**Asylum** protects people who fear persecution in their home country based on race, religion, nationality, political opinion, or membership in a particular social group.\n\nKey rules:\n• File **Form I-589 within 1 year** of arrival (with rare exceptions)\n• You can apply for an **EAD** (work permit) **150 days** after filing\n• Asylum interview wait is currently **2-7 years**\n• After asylum is granted, wait **1 year**, then file for green card (I-485)\n\nNo filing fee. An attorney (pro bono if needed) makes a huge difference — every case turns on the specific facts."},
  {match: ['dv lottery', 'diversity visa', 'green card lottery'],
   reply: "The **DV (Diversity Visa) Lottery** offers ~55,000 immigrant visas per year. Requirements:\n• Born in an **eligible country** (countries with low immigration to the U.S.)\n• Have either a **high-school diploma** OR **2 years of skilled work experience**\n\nFree entry at **dvprogram.state.gov** during the annual October window. Submit ONE entry only (duplicates disqualify). Selection in May. If selected, you have 1 year to complete the visa process."},
  {match: ['visa bulletin', 'priority date', 'pd is current', 'pd current'],
   reply: "The **Visa Bulletin** (published monthly by the State Department) tells you whether your priority date has become \"current\" — meaning a visa is available so you can file the I-485 or DS-260.\n\nTwo charts:\n• **Final Action Dates** — when you can actually get approved\n• **Dates for Filing** — when you can submit the I-485\n\nWait times vary enormously by category + country. India and China EB categories have multi-decade waits; F-2A is currently almost current."},
  {match: ['eb-2', 'eb2', 'eb-3', 'eb3', 'employment based green card', 'employment-based green card'],
   reply: "**Employment-based green cards** (EB-2, EB-3) require:\n• U.S. employer sponsor\n• **PERM labor certification** (proves no qualified U.S. worker available) — takes ~12 months\n• **Form I-140** approved (the immigrant petition) — takes 6-12 months\n• **Priority date current** on the Visa Bulletin — wait varies wildly by country\n• Then file **I-485** (~12-24 months processing)\n\nIndia and China EB-2/EB-3 currently have 10-50+ year waits. Other countries are 1-3 years."},
  {match: ['marriage green card', 'marriage gc', 'spouse green card', 'married to citizen'],
   reply: "Marriage to a U.S. citizen is the **fastest family path** (no quota wait, immediate relative category):\n• Citizen spouse files **Form I-130** for you\n• If you're in the U.S., file **Form I-485** concurrently (adjustment of status)\n• If abroad, consular processing via **DS-260**\n• USCIS interviews to verify the marriage is genuine\n• Marriages under 2 years at GC approval get a **2-year conditional GC** — must file **Form I-751** jointly to remove conditions\n\nTotal timeline: ~12-18 months."},
  {match: ['continuous residence', 'physical presence', 'broke continuous'],
   reply: "Two distinct requirements for N-400:\n• **Continuous residence** — no single trip outside the U.S. of 6+ months (a trip 6-12 months may break it; 12+ months almost certainly does)\n• **Physical presence** — actually in the U.S. for at least half the required time (30 months out of 5 years, or 18 months out of 3)\n\nLong trips can reset the clock. If you took a trip over 6 months and aren't sure of the impact, that's a lawyer question."},
  {match: ['good moral character', 'gmc', 'moral character'],
   reply: "**Good moral character (GMC)** is required for the past 5 years (or 3 for marriage). USCIS looks at:\n• Criminal record (some convictions are absolute bars)\n• Failure to file taxes / unpaid taxes\n• Lying to USCIS or other government agencies\n• Failure to register for Selective Service (men 18-25)\n• Failure to pay court-ordered child support\n\nMinor stuff like one traffic ticket usually isn't an issue, but a lawyer should review any criminal history."},
  {match: ['biometrics', 'fingerprinting', 'asc appointment'],
   reply: "**Biometrics** = USCIS takes your fingerprints, photo, and signature, then runs them through the FBI background check.\n\nAfter filing N-400, you'll get a biometrics appointment notice — usually within **3-6 weeks** of filing. The appointment itself is at an **Application Support Center (ASC)**, takes about 15 minutes. Bring your ID + the appointment notice."},
  {match: ['oath of allegiance', 'oath ceremony', 'become citizen'],
   reply: "The **Oath of Allegiance** is the final step — you take the oath and immediately become a U.S. citizen. Five promises in the oath:\n1. Renounce allegiance to other countries\n2. Support and defend the Constitution\n3. Obey U.S. laws\n4. Serve in the military if required\n5. Perform civilian service if required\n\nAfter the oath, you get your **Certificate of Naturalization** (Form N-550). Take it to the Social Security office to update your status, then apply for a U.S. passport."},
  {match: ['english test', 'english requirement', 'reading writing speaking'],
   reply: "The naturalization English test has three parts:\n• **Speaking** — the officer assesses your English throughout the interview\n• **Reading** — read 1 of 3 short sentences correctly\n• **Writing** — write 1 of 3 short sentences correctly\n\nWords for the test come from a USCIS vocabulary list (civics + simple words like \"a, of, the, can, has, is\"). You can fail one sentence and still pass.\n\n**65/20 exception**: If you're 65+ AND have been an LPR for 20+ years, you can take the test in your native language and only need to study **20 of the 100** civics questions."},
  {match: ['civics test format', 'civics interview', 'how civics test works'],
   reply: "**USCIS civics test** at the interview:\n• Officer asks **up to 10 questions** from the 100-question list (orally, in English)\n• You need to **answer 6 correctly** to pass\n• Officer stops at 6 correct or 5 wrong (whichever comes first)\n\nYou're tested on civics + U.S. history. Camino's lesson and flashcard system has all 100 questions. Practice with the mock test until you can hit 8+/10 consistently."},
  {match: ['fee waiver', 'i-912', 'can i waive the fee'],
   reply: "You qualify for a **fee waiver** (Form **I-912**) if any of these is true:\n• Receiving a means-tested benefit (Medicaid, SNAP, SSI, TANF)\n• Household income at or below **150% of federal poverty level** (~$22,500/yr for a household of 1)\n• Financial hardship (medical bills, unemployment, etc.)\n\nThe full $760 N-400 fee is waived if approved. Many people qualify and don't know it — worth checking before paying."},
  {match: ['uscis processing time', 'how long does it take', 'how long for'],
   reply: "Current USCIS processing times (typical, not guaranteed):\n• **N-400**: 6-12 months\n• **I-485** (adjustment): 12-24 months\n• **I-130** (family petition, immediate relative): 12-15 months\n• **I-589** (asylum interview): 2-7 years\n• **I-765** (work permit): 2-5 months\n\nUSCIS publishes its own estimates at **egov.uscis.gov/processing-times**. Times vary by service center. For your specific case, an attorney can give a more grounded estimate."},
  {match: ['what is next', "what's next", 'what should i do next'],
   reply: "Open the **Path** tab — it shows your specific journey based on what you picked during onboarding (student/OPT/work-visa/family/employment GC/asylum/citizenship). Each stage has a description and typical timeline.\n\nIf you're studying for the civics test, hit **Learn** for lessons or **Cami** for any specific question. The **Mock test** simulates the interview format."},

  // ===== Catchall — soft redirect for off-topic questions =====
];

// Fallback when no match found — keeps the persona but admits limitation.
function camiDemoFallback(){
  return "I'm in **demo mode** (no API key configured), so I can only answer the most common questions right now. For deeper conversations on your specific case, set up an API key in Cami → Key, or talk to a licensed immigration attorney for case-specific advice.\n\nTry me on: civics test questions, the N-400 process, visa types (H-1B, OPT, EB-2, asylum, DV), the 5-year rule, fee waivers, or processing times.";
}

function camiDemoMatch(text){
  if(!text) return null;
  var lowered = text.toLowerCase();
  // Score each response by how many match-keywords appear in the user text
  var best = null, bestScore = 0;
  for(var i=0;i<CAMI_DEMO_RESPONSES.length;i++){
    var entry = CAMI_DEMO_RESPONSES[i];
    var score = 0;
    for(var j=0;j<entry.match.length;j++){
      if(lowered.indexOf(entry.match[j].toLowerCase()) !== -1){
        // Longer matches score higher (more specific)
        score += entry.match[j].length;
      }
    }
    if(score > bestScore){ bestScore = score; best = entry; }
  }
  // Require at least 4 characters of match to count
  return bestScore >= 4 ? best.reply : null;
}

function camiInDemoMode(){
  return !user.anthropicApiKey;
}

function camiBoot(){
  if(!CAMI_AVAILABLE) return;   // v1: Cami disabled — never touch keys/history at boot
  // Restore prior chat if user has persisted history
  if(user.camiChatHistory && Array.isArray(user.camiChatHistory)){
    camiState.messages = user.camiChatHistory.slice(-40); // cap context window
  }
  // Auto-load API key from config.local.js if present and user hasn't set one.
  // This is the dev / prototype convenience path — for production, swap to a backend proxy.
  if(!user.anthropicApiKey && window.CAMINO_CONFIG && window.CAMINO_CONFIG.anthropicApiKey){
    user.anthropicApiKey = window.CAMINO_CONFIG.anthropicApiKey;
    saveUser();
  }
  // Optional model override from config.
  if(window.CAMINO_CONFIG && window.CAMINO_CONFIG.model){
    CAMI_MODEL = window.CAMINO_CONFIG.model;
  }
}

function camiSaveHistory(){
  user.camiChatHistory = camiState.messages.slice(-40);
  saveUser();
}

function camiDailyAvailable(){
  if(user.camiMessagesTodayDate !== todayISO()) {
    return isPlus() ? CAMI_DAILY_CAP_PLUS : CAMI_DAILY_CAP_TRIAL;
  }
  var used = user.camiMessagesTodayCount || 0;
  var cap = isPlus() ? CAMI_DAILY_CAP_PLUS : CAMI_DAILY_CAP_TRIAL;
  return Math.max(0, cap - used);
}

function camiRecordMessage(){
  if(user.camiMessagesTodayDate !== todayISO()){
    user.camiMessagesTodayCount = 0;
    user.camiMessagesTodayDate = todayISO();
  }
  user.camiMessagesTodayCount = (user.camiMessagesTodayCount || 0) + 1;
  saveUser();
}

function camiSystemPrompt(){
  var phase = user.phase || 'unknown';
  var goal = user.immigrationGoal || 'undecided';
  var country = user.countryOfBirth || 'unspecified';
  var name = user.name || 'friend';
  var langName = lang === 'es' ? 'Spanish (Latin American)' : (lang === 'zh' ? 'Mandarin Chinese' : (lang === 'vi' ? 'Vietnamese' : 'English'));
  var phaseLabel = PHASES[phase] ? PHASES[phase].label.en : phase;
  var goalLabel = IMMIGRATION_GOALS[goal] ? IMMIGRATION_GOALS[goal].label.en : goal;

  return ''
    + 'You are Cami, a knowledgeable immigration coach and the friendly dove mascot of Camino, an iOS-style immigration assistance app.\n\n'
    + '## Your expertise (you go DEEP on these)\n'
    + '1) **U.S. naturalization civics** — all 100 USCIS civics questions, the constitutional + historical reasoning behind each answer, the test format (10 questions verbally, 6/10 to pass), the English reading + writing + speaking components, N-648 medical waiver, 65/20 rule, study strategies.\n'
    + '2) **U.S. immigration paths + processes** — F-1/J-1/M-1 student visas (and how schools issue I-20s, SEVIS, maintaining status); OPT, CPT, and STEM OPT (I-765, I-983, E-Verify, 90-day unemployment limit); H-1B (lottery mechanics, cap-exempt, max-out, I-94 dependent issues); L-1, O-1, E-2, TN, P-3; EB-1A/B/C, EB-2 (NIW vs. PERM), EB-3 (skilled vs. other workers, country backlogs especially India + China); family-based GCs (IR-1/2/5, CR-1, F1/F2A/F2B/F3/F4, K-1 fiancé); adjustment of status (I-485) vs. consular processing (DS-260); asylum (affirmative + defensive, I-589, EAD eligibility after 150 days, 1-year filing bar); DV lottery (DS-5501, country eligibility); VAWA, U/T visas; naturalization (N-400, 5-year rule vs. 3-year rule, continuous residence, physical presence, good moral character); the Visa Bulletin (priority dates, Final Action vs. Dates for Filing, retrogression); USCIS forms by number; current processing times trends.\n\n'
    + '## What you are NOT\n'
    + 'You are **not a licensed attorney** and you **cannot provide legal advice** for an individual user\'s specific case. You explain how the system works, name the relevant forms, lay out typical timelines, and surface the questions someone should bring to an attorney. You never tell a user "you qualify" or "you should file X" as if it were a binding determination.\n\n'
    + 'When a user asks anything that depends on their specific facts — eligibility, whether to file, how their case will be decided, what to disclose, how to interpret a notice, immigration consequences of an arrest or trip abroad, etc. — your reply MUST end with a one-line reminder to consult a licensed immigration attorney. Phrase it naturally ("This is one to take to an immigration attorney — they can look at your specific timeline and decide"). Do NOT bury it; do NOT skip it.\n\n'
    + '## How you respond\n'
    + '- **Warm, patient, concise.** 3-6 sentences or a short bulleted list. Immigration is stressful — meet users with empathy, never panic them.\n'
    + '- **Civics questions**: give the answer + a one-sentence reason ("because [historical / constitutional logic]"). This builds retention.\n'
    + '- **Process questions**: give the framework, typical timeline, and the form number. Flag policy areas where the answer varies by case or has changed recently.\n'
    + '- **Personal-fact questions**: explain how the rules generally work, what factors matter, and that the actual answer depends on details an attorney would need to review. End with the consult line.\n'
    + '- **Off-topic** (cooking, dating, coding help, etc.): gently redirect — "I focus on immigration and civics. Anything in those areas?"\n'
    + '- **Cite USCIS forms by number** (I-485, N-400, I-130, etc.) and reference uscis.gov pages where useful.\n'
    + '- **Respond in ' + langName + '.**\n'
    + '- **Tone**: thoughtful peer, not cheerleader. Occasional warmth ("Good question") sparingly. No emoji unless the user uses them first. Never roleplay physical actions ("I\'d fly over to check" — no).\n\n'
    + '## User context (personalize accordingly)\n'
    + '- Name: ' + name + '\n'
    + '- Current immigration phase: ' + phaseLabel + '\n'
    + '- Long-term goal: ' + goalLabel + '\n'
    + '- Country of birth: ' + country + '\n\n'
    + 'When the user asks "what\'s next for me?" or "how long until X?", reference their specific phase, goal, and country (country matters a LOT for Visa Bulletin waits and asylum policy).\n\n'
    + 'Remember: you\'re informed, careful, and warm. You explain the system; an attorney decides their case.';
}

async function camiSend(userText){
  userText = (userText || '').trim();
  if(!userText) return;
  if(camiState.isLoading) return;

  // Gate: needs Plus or active trial
  if(!isPlus()){
    toast(lang==='es' ? 'Cami es una función Plus' : 'Cami is a Plus feature');
    go('upgrade');
    return;
  }

  // Daily cap
  if(camiDailyAvailable() <= 0){
    camiState.error = lang==='es'
      ? 'Llegaste al límite diario (' + (isPlus() ? CAMI_DAILY_CAP_PLUS : CAMI_DAILY_CAP_TRIAL) + ' mensajes). Vuelve mañana.'
      : 'Daily limit reached (' + (isPlus() ? CAMI_DAILY_CAP_PLUS : CAMI_DAILY_CAP_TRIAL) + ' messages). Come back tomorrow.';
    renderCamiChat();
    return;
  }

  camiState.messages.push({role:'user', content:userText, ts:Date.now()});
  camiState.isLoading = true;
  camiState.error = null;
  renderCamiChat();
  camiScrollToBottom();

  // DEMO MODE — no API key configured: respond with curated canned answers
  if(!user.anthropicApiKey){
    setTimeout(function(){
      var demoReply = camiDemoMatch(userText) || camiDemoFallback();
      camiState.messages.push({role:'assistant', content: demoReply, ts: Date.now()});
      camiRecordMessage();
      camiSaveHistory();
      camiState.isLoading = false;
      renderCamiChat();
      camiScrollToBottom();
    }, 600 + Math.random() * 400); // slight "thinking" delay so it feels real
    return;
  }

  try {
    var apiMessages = camiState.messages.map(function(m){
      return { role: m.role, content: m.content };
    });
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': user.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: CAMI_MODEL,
        max_tokens: CAMI_MAX_TOKENS,
        system: camiSystemPrompt(),
        messages: apiMessages
      })
    });
    if(!res.ok){
      var errBody = await res.text();
      var errMsg = 'API error (' + res.status + ')';
      try { var parsed = JSON.parse(errBody); if(parsed.error && parsed.error.message) errMsg = parsed.error.message; } catch(e){}
      throw new Error(errMsg);
    }
    var data = await res.json();
    var reply = '';
    if(data.content && data.content.length){
      reply = data.content.map(function(c){ return c.type === 'text' ? c.text : ''; }).join('');
    }
    if(!reply) reply = lang==='es' ? '(sin respuesta)' : '(no response)';
    camiState.messages.push({role:'assistant', content:reply, ts:Date.now()});
    camiRecordMessage();
    camiSaveHistory();
  } catch(e){
    camiState.error = (e && e.message) ? e.message : 'Network error';
    // Pop the user's message back so they can edit + retry
    camiState.messages.pop();
  } finally {
    camiState.isLoading = false;
    renderCamiChat();
    camiScrollToBottom();
  }
}

function camiClearChat(){
  var ok = window.confirm(lang==='es'
    ? '¿Borrar la conversación con Cami?'
    : 'Clear the conversation with Cami?');
  if(!ok) return;
  camiState.messages = [];
  camiSaveHistory();
  renderCamiChat();
}

function camiSetApiKey(key){
  user.anthropicApiKey = (key || '').trim() || null;
  saveUser();
  if(user.anthropicApiKey) toast(lang==='es' ? 'Clave guardada' : 'Key saved');
  renderCamiChat();
}

function camiShowKeySetup(){
  // Switch to a settings-mode display inside the chat
  camiState.showKeySetup = true;
  renderCamiChat();
}

function camiHideKeySetup(){
  camiState.showKeySetup = false;
  renderCamiChat();
}

function camiScrollToBottom(){
  setTimeout(function(){
    var sc = document.getElementById('camiScroll');
    if(sc) sc.scrollTop = sc.scrollHeight;
  }, 30);
}

function camiFormatContent(content){
  // Light formatting: escape HTML, then handle **bold**, *italic*, bullets, newlines
  var safe = String(content)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/(^|\n)[-•]\s*(.+)/g, '$1<div class="camiBullet">• $2</div>');
  safe = safe.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  return '<p>' + safe + '</p>';
}

function renderCamiChat(){
  var hostBody = document.getElementById('camiBody');
  var hostFooter = document.getElementById('camiFooter');
  if(!hostBody) return;

  // "Coming soon" placeholder — hides the chat UI entirely until CAMI_AVAILABLE flips
  if(!CAMI_AVAILABLE){
    hostBody.innerHTML = ''
      + '<div class="camiSoonCard">'
      +   '<div class="camiSoonCami">'+camiSVG('thinking')+'</div>'
      +   '<div class="camiSoonBadge">'+(lang==='es'?'PRÓXIMAMENTE':'COMING SOON')+'</div>'
      +   '<div class="camiSoonTitle">'+(lang==='es'?'¡Hola, soy Cami!':"Hi, I'm Cami!")+'</div>'
      +   '<div class="camiSoonSub">'+(lang==='es'
            ? 'Tu tutor IA de cívica e inmigración. Estoy entrenándome para responder cualquier pregunta que tengas.'
            : "Your AI civics + immigration tutor. I'm training up to answer any question you throw at me.")+'</div>'
      +   '<div class="camiSoonPreview">'
      +     '<div class="camiSoonPreviewTitle">'+(lang==='es'?'Qué podré hacer:':"What I'll do:")+'</div>'
      +     '<div class="camiSoonRow">'+iconSVG('check','#00b4a8',16)+'<span>'+(lang==='es'?'Explicar cualquier pregunta de cívica de USCIS':'Explain any USCIS civics question')+'</span></div>'
      +     '<div class="camiSoonRow">'+iconSVG('check','#00b4a8',16)+'<span>'+(lang==='es'?'Aclarar reglas de visa, vías N-400 / I-485 y tiempos':'Clarify visa rules, N-400 / I-485 paths and timelines')+'</span></div>'
      +     '<div class="camiSoonRow">'+iconSVG('check','#00b4a8',16)+'<span>'+(lang==='es'?'Practicar la entrevista USCIS contigo en voz':'Practice the USCIS interview with you by voice')+'</span></div>'
      +     '<div class="camiSoonRow">'+iconSVG('check','#00b4a8',16)+'<span>'+(lang==='es'?'En español, inglés y más idiomas':'In English, Spanish, and more languages')+'</span></div>'
      +   '</div>'
      +   '<div class="camiSoonFootnote">'+(lang==='es'
            ? 'Mientras tanto, los 100 ejercicios de cívica y el simulador de entrevista están listos para ti.'
            : "In the meantime, all 100 civics lessons and the interview simulator are ready for you.")+'</div>'
      +   '<div class="camiLegalCard">'
      +     '<div class="camiLegalIco">'+iconSVG('warning','#a05000',16)+'</div>'
      +     '<div class="camiLegalText"><strong>'
      +       (lang==='es' ? 'Aviso importante:' : 'Important notice:')
      +     '</strong> '
      +     (lang==='es'
        ? 'Cami es un modelo de IA entrenado. NO es un abogado, paralegal, ni representante acreditado de USCIS. La información que comparte es educativa, no asesoría legal. Para decisiones sobre tu caso individual, consulta a un abogado de inmigración con licencia o a un representante acreditado por el DOJ.'
        : 'Cami is a trained AI model. It is NOT an immigration attorney, paralegal, or USCIS-accredited representative. Information Cami shares is educational, not legal advice. For decisions about your specific case, consult a licensed immigration attorney or a DOJ-accredited representative.')
      +     '</div>'
      +   '</div>'
      + '</div>';
    if(hostFooter) hostFooter.innerHTML = '';
    return;
  }

  // PLUS gate
  if(!isPlus()){
    hostBody.innerHTML = ''
      + '<div class="camiGateCard">'
      +   '<div class="camiGateCami">'+camiSVG('happy')+'</div>'
      +   '<div class="camiGateTitle">'+(lang==='es'?'Hola, soy Cami':'Hi, I\'m Cami')+'</div>'
      +   '<div class="camiGateSub">'+(lang==='es'
            ? 'Tu tutor de cívica e inmigración. Pregúntame lo que sea — explico la lógica, no solo la respuesta.'
            : 'Your civics + immigration tutor. Ask me anything — I explain the why, not just the answer.')+'</div>'
      +   '<div class="camiGateBullets">'
      +     '<div class="camiGateBullet">'+iconSVG('check','#00b4a8',14)+' '+(lang==='es'?'Cívica: explico las 100 preguntas a fondo':'Civics: deep-dive on the 100 questions')+'</div>'
      +     '<div class="camiGateBullet">'+iconSVG('check','#00b4a8',14)+' '+(lang==='es'?'Inmigración: visas, GC, asilo, N-400':'Immigration: visas, GC, asylum, N-400')+'</div>'
      +     '<div class="camiGateBullet">'+iconSVG('check','#00b4a8',14)+' '+(lang==='es'?'Personalizado a tu vía y meta':'Personalized to your path + goal')+'</div>'
      +   '</div>'
      +   '<button class="cta camiGateCta" onclick="go(\'upgrade\')">'+(lang==='es'?'Empezar con Plus →':'Unlock with Plus →')+'</button>'
      +   '<div class="camiGateNote">'+(lang==='es'?'Incluido en la prueba gratis de 7 días':'Included with your 7-day free trial')+'</div>'
      + '</div>';
    if(hostFooter) hostFooter.innerHTML = '';
    return;
  }

  // KEY SETUP screen — only when user explicitly requested it (no longer blocks first use)
  if(camiState.showKeySetup){
    hostBody.innerHTML = ''
      + '<div class="camiSetupCard">'
      +   '<div class="camiSetupCami">'+camiSVG('happy')+'</div>'
      +   '<div class="camiSetupTitle">'+(lang==='es'?'Conecta tu clave de Anthropic':'Connect your Anthropic key')+'</div>'
      +   '<div class="camiSetupSub">'+(lang==='es'
            ? 'En esta versión, Cami usa tu propia clave de API. Tu clave se guarda solo en este dispositivo.'
            : 'In this build, Cami uses your own API key. Your key is stored only on this device — never sent to us.')+'</div>'
      +   '<ol class="camiSetupSteps">'
      +     '<li>'+(lang==='es'?'Crea una cuenta en':'Create an account at')+' <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a></li>'
      +     '<li>'+(lang==='es'?'Compra ~$5 de crédito (cada mensaje cuesta ~$0.005)':'Add ~$5 in credit (each chat costs ~$0.005)')+'</li>'
      +     '<li>'+(lang==='es'?'Crea una clave API en "API Keys"':'Create an API key under "API Keys"')+'</li>'
      +     '<li>'+(lang==='es'?'Pégala abajo':'Paste it below')+'</li>'
      +   '</ol>'
      +   '<input type="password" class="camiKeyInput" id="camiKeyInput" placeholder="sk-ant-..." value="'+(user.anthropicApiKey||'')+'" autocomplete="off" />'
      +   '<div class="camiSetupBtnRow">'
      +     '<button class="cta camiSetupSave" onclick="camiSaveKeyFromInput()">'+(lang==='es'?'Guardar y empezar':'Save and start')+'</button>'
      +     (user.anthropicApiKey ? '<button class="camiSetupCancel" onclick="camiHideKeySetup()">'+(lang==='es'?'Cancelar':'Cancel')+'</button>' : '')
      +   '</div>'
      +   '<div class="camiSetupPriv">'+(lang==='es'
            ? 'Privacidad: tu clave y conversaciones quedan en tu dispositivo. Anthropic ve tus mensajes para generar respuestas.'
            : 'Privacy: your key and chats stay on your device. Anthropic sees your messages to generate replies.')+'</div>'
      + '</div>';
    if(hostFooter) hostFooter.innerHTML = '';
    return;
  }

  // CHAT view
  var messagesHtml = '';
  if(camiState.messages.length === 0){
    var suggestions = camiSuggestions();
    var chips = suggestions.map(function(s){
      var txt = s[lang] || s.en;
      var safe = txt.replace(/'/g,"\\'");
      return '<button class="camiChip" onclick="camiSubmitChip(\''+safe+'\')">'+txt+'</button>';
    }).join('');
    var demoBadge = camiInDemoMode()
      ? '<div class="camiDemoBadge" onclick="camiShowKeySetup()" title="'+(lang==='es'?'Conectar clave para Cami completo':'Connect your key for full Cami')+'">'+(lang==='es'?'MODO DEMO · respuestas guardadas':'DEMO MODE · curated answers')+'</div>'
      : '';
    messagesHtml = '<div class="camiWelcome">'
      + '<div class="camiWelcomeCami">'+camiSVG('happy')+'</div>'
      + '<div class="camiWelcomeTitle">'+(lang==='es'?'Hola, '+ (user.name||'amigo/a') +'.':'Hi, '+(user.name||'friend')+'.')+'</div>'
      + '<div class="camiWelcomeSub">'+(lang==='es'?'Pregúntame lo que sea sobre cívica o inmigración.':'Ask me anything about civics or your immigration path.')+'</div>'
      + demoBadge
      + '<div class="camiChips">'+chips+'</div>'
      + '</div>';
  } else {
    camiState.messages.forEach(function(m, idx){
      if(m.role === 'user'){
        messagesHtml += '<div class="camiMsg camiMsgUser"><div class="camiBubble camiBubbleUser">'+camiFormatContent(m.content)+'</div></div>';
      } else {
        var isLast = idx === camiState.messages.length - 1;
        var actions = '';
        if(isLast && !camiState.isLoading){
          var safeContent = m.content.replace(/'/g, "\\'").replace(/\n/g,' ');
          actions = '<div class="camiBubbleActions">'
            + '<button class="camiBubbleActionBtn" onclick="camiSpeakLast()" title="'+(lang==='es'?'Escuchar':'Listen')+'">'+iconSVG('speaker','#84807a',13)+'</button>'
            + '</div>';
        }
        messagesHtml += '<div class="camiMsg camiMsgBot">'
          + '<div class="camiAvatar">'+camiSVG('happy')+'</div>'
          + '<div class="camiBubble camiBubbleBot">'+camiFormatContent(m.content)+actions+'</div>'
          + '</div>';
      }
    });
    if(camiState.isLoading){
      messagesHtml += '<div class="camiMsg camiMsgBot">'
        + '<div class="camiAvatar">'+camiSVG('happy')+'</div>'
        + '<div class="camiBubble camiBubbleBot camiTyping"><span></span><span></span><span></span></div>'
        + '</div>';
    }
    if(camiState.error){
      messagesHtml += '<div class="camiError">'+(lang==='es'?'Error: ':'Error: ')+camiState.error+'</div>';
    }
    // Follow-up suggestion chips after last assistant reply
    if(!camiState.isLoading && !camiState.error && camiState.messages.length >= 2){
      var lastUser = '', lastBot = '';
      for(var i = camiState.messages.length - 1; i >= 0; i--){
        if(!lastBot && camiState.messages[i].role === 'assistant') lastBot = camiState.messages[i].content;
        if(!lastUser && camiState.messages[i].role === 'user') lastUser = camiState.messages[i].content;
        if(lastUser && lastBot) break;
      }
      if(lastUser && lastBot){
        var fups = camiFollowups(lastUser, lastBot);
        if(fups.length){
          var fupHtml = fups.map(function(f){
            var t = f[lang] || f.en;
            var safe = t.replace(/'/g,"\\'");
            return '<button class="camiFollowupChip" onclick="camiSubmitChip(\''+safe+'\')">'+t+'</button>';
          }).join('');
          messagesHtml += '<div class="camiFollowups">'
            + '<div class="camiFollowupsLbl">'+(lang==='es'?'Continuar con:':'Continue with:')+'</div>'
            + '<div class="camiFollowupsRow">'+fupHtml+'</div>'
            + '</div>';
        }
      }
    }
  }

  var remaining = camiDailyAvailable();
  var capInfo = isPlus()
    ? remaining + ' / ' + CAMI_DAILY_CAP_PLUS + ' ' + (lang==='es'?'mensajes hoy':'messages today')
    : remaining + ' / ' + CAMI_DAILY_CAP_TRIAL + ' ' + (lang==='es'?'mensajes hoy':'messages today');

  hostBody.innerHTML = '<div class="camiScroll" id="camiScroll">'+messagesHtml+'</div>';

  if(hostFooter){
    var disabled = camiState.isLoading || remaining <= 0;
    hostFooter.innerHTML = ''
      + disclaimerFooterHTML({context:'cami'})
      + '<div class="camiInputRow">'
      +   '<button class="camiMicBtn'+(camiMic.listening?' camiMicActive':'')+'" id="camiMicBtn" '+(disabled?'disabled':'')+' onclick="camiVoiceToggle()" aria-label="'+(lang==='es'?'Hablar a Cami':'Speak to Cami')+'" aria-pressed="'+(camiMic.listening?'true':'false')+'" title="'+(lang==='es'?'Hablar':'Speak')+'">'+iconSVG('mic','#84807a',18)+'</button>'
      +   '<input type="text" class="camiInput" id="camiInput" aria-label="'+(lang==='es'?'Mensaje para Cami':'Message for Cami')+'" placeholder="'+(lang==='es'?'Pregúntale a Cami…':'Ask Cami anything…')+'" '+(disabled?'disabled':'')+' onkeydown="if(event.key===\'Enter\'){camiSubmitFromInput();}" />'
      +   '<button class="camiSendBtn" '+(disabled?'disabled':'')+' onclick="camiSubmitFromInput()" aria-label="'+(lang==='es'?'Enviar mensaje':'Send message')+'">'+(camiState.isLoading
            ? '<div class="camiSpinner" aria-label="'+(lang==='es'?'Cami está pensando':'Cami is thinking')+'"></div>'
            : iconSVG('plane','#fff',18))+'</button>'
      + '</div>'
      + '<div class="camiMeta">'
      +   '<span class="camiCap">'+capInfo+'</span>'
      +   '<button class="camiMetaBtn" onclick="camiClearChat()">'+(lang==='es'?'Limpiar':'Clear')+'</button>'
      +   '<button class="camiMetaBtn" onclick="camiShowKeySetup()">'+(lang==='es'?'Clave':'Key')+'</button>'
      + '</div>';
  }
  camiScrollToBottom();
}

function camiSubmitFromInput(){
  var inp = document.getElementById('camiInput');
  if(!inp) return;
  var text = inp.value;
  inp.value = '';
  camiSend(text);
}

function camiSubmitChip(text){
  camiSend(text);
}

// ===== Open Cami with a contextual prompt prefilled =====
// Used by "Ask Cami" buttons throughout the app.
function askCami(context){
  // context can be a string (the message) or {message, autosend:bool}
  var msg = typeof context === 'string' ? context : (context.message || '');
  var autosend = typeof context === 'object' && context.autosend === true;
  go('cami');
  setTimeout(function(){
    if(!isPlus()){ return; } // gate already shown
    if(!user.anthropicApiKey){ camiShowKeySetup(); return; }
    var inp = document.getElementById('camiInput');
    if(inp){
      inp.value = msg;
      inp.focus();
      if(autosend) camiSend(msg);
    } else if(autosend){
      camiSend(msg);
    }
  }, 250);
}

// ===== Voice input for Cami =====
var camiMic = { recognizer: null, listening: false, transcript: '' };

function camiVoiceToggle(){
  // If already listening: stop. The recognizer's onend handler will auto-submit.
  if(camiMic.listening){
    camiVoiceStop();
    return;
  }
  if(!isWebSpeechSupported()){
    toast(lang==='es' ? 'Tu navegador no soporta voz' : 'Voice not supported in this browser');
    return;
  }
  // CRITICAL: call start() synchronously from the click handler. On iOS Safari the
  // user-gesture context is lost across awaits — so we don't await permission first.
  // SpeechRecognition itself triggers the permission prompt on first use.
  camiVoiceStart();
}

function camiVoiceStart(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    toast(lang==='es' ? 'Tu navegador no soporta voz' : 'Voice not supported in this browser');
    return;
  }
  // Always create a FRESH recognizer — re-using across sessions causes stale-state
  // errors ("recognition has already started" / handlers firing twice).
  try {
    if(camiMic.recognizer) try { camiMic.recognizer.abort(); } catch(e){}
  } catch(e){}
  var rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 3;
  rec.lang = (lang === 'es') ? 'es-US' : 'en-US';
  camiMic.recognizer = rec;
  camiMic.transcript = '';

  rec.onstart = function(){
    camiMic.listening = true;
    camiSyncMicButton();
    var btn = document.getElementById('camiMicBtn');
    if(btn) btn.classList.remove('camiMicLoading');
  };
  rec.onresult = function(event){
    var t = '';
    for(var i=0;i<event.results.length;i++) t += event.results[i][0].transcript + ' ';
    camiMic.transcript = t.trim();
    var inp = document.getElementById('camiInput');
    if(inp) inp.value = camiMic.transcript;
  };
  rec.onerror = function(event){
    camiMic.listening = false;
    camiSyncMicButton();
    var btn = document.getElementById('camiMicBtn');
    if(btn) btn.classList.remove('camiMicLoading');
    var err = (event && event.error) || 'unknown';
    if(err === 'not-allowed' || err === 'service-not-allowed'){
      toast(lang==='es' ? 'Permiso del micrófono bloqueado — actívalo en la configuración del navegador' : 'Microphone blocked — enable it in browser settings');
    } else if(err === 'no-speech'){
      toast(lang==='es' ? 'No te oí — vuelve a tocar el micrófono' : "I didn't hear you — tap the mic again");
    } else if(err === 'audio-capture'){
      toast(lang==='es' ? 'No se encontró micrófono' : 'No microphone found');
    } else if(err === 'network'){
      toast(lang==='es' ? 'Sin conexión para reconocer voz' : 'Network error during voice recognition');
    } else if(err === 'aborted'){
      // Silent — user pressed stop
    } else {
      toast(lang==='es' ? 'Error de voz: '+err : 'Voice error: '+err);
    }
  };
  rec.onend = function(){
    camiMic.listening = false;
    camiSyncMicButton();
    var btn = document.getElementById('camiMicBtn');
    if(btn) btn.classList.remove('camiMicLoading');
    var transcript = (camiMic.transcript || '').trim();
    if(transcript){
      // Always auto-submit — user can edit before sending if input shows the text
      var inp = document.getElementById('camiInput');
      if(inp) inp.value = '';
      camiSend(transcript);
    }
  };

  // start() may throw if a previous recognition is still pending — abort + retry.
  try {
    rec.start();
  } catch(e){
    try { rec.abort(); } catch(e2){}
    setTimeout(function(){
      try { rec.start(); } catch(e3){
        camiMic.listening = false;
        camiSyncMicButton();
        toast(lang==='es' ? 'No se pudo iniciar la voz' : 'Could not start voice — try again');
      }
    }, 200);
  }
  // Show "starting" visual until onstart fires
  var btn = document.getElementById('camiMicBtn');
  if(btn) btn.classList.add('camiMicLoading');
}

function camiVoiceStop(){
  if(camiMic.recognizer){
    try { camiMic.recognizer.stop(); } catch(e){}
  }
  // Don't set listening=false here — onend will fire and trigger auto-submit.
}

function camiSyncMicButton(){
  var btn = document.getElementById('camiMicBtn');
  if(!btn) return;
  btn.classList.toggle('camiMicActive', camiMic.listening);
  btn.setAttribute('aria-pressed', camiMic.listening ? 'true' : 'false');
}

// ===== Read Cami's last reply aloud (TTS) =====
function camiSpeak(text){
  if(!ttsSupported()) return;
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = (lang === 'es') ? 'es-US' : 'en-US';
    u.rate = 0.96;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch(e){}
}

function camiSpeakLast(){
  // Find last assistant message
  for(var i = camiState.messages.length - 1; i >= 0; i--){
    if(camiState.messages[i].role === 'assistant'){
      camiSpeak(camiState.messages[i].content.replace(/[*_`#>]/g, ''));
      return;
    }
  }
}

// ===== Suggest 3 follow-up questions after each Cami reply =====
// Curated based on common follow-up patterns. Keeps token cost down vs. asking Claude for them.
function camiFollowups(lastUserMessage, lastAssistantReply){
  if(!lastUserMessage) return [];
  var s = (lastUserMessage + ' ' + lastAssistantReply).toLowerCase();
  var fups = [];
  // Topic-detection-lite
  if(s.indexOf('opt') !== -1 || s.indexOf('stem') !== -1){
    fups.push({en:'Am I eligible for STEM OPT?', es:'¿Soy elegible para STEM OPT?'});
    fups.push({en:'How do I report a job change?', es:'¿Cómo reporto un cambio de trabajo?'});
  }
  if(s.indexOf('h-1b') !== -1 || s.indexOf('h1b') !== -1){
    fups.push({en:'What if I lose my job on H-1B?', es:'¿Y si pierdo mi trabajo en H-1B?'});
    fups.push({en:'How does I-140 portability work?', es:'¿Cómo funciona la portabilidad del I-140?'});
  }
  if(s.indexOf('n-400') !== -1 || s.indexOf('citizenship') !== -1 || s.indexOf('naturali') !== -1){
    fups.push({en:'What does the civics test cover?', es:'¿Qué cubre el examen de cívica?'});
    fups.push({en:'Can I file 90 days early?', es:'¿Puedo presentar 90 días antes?'});
  }
  if(s.indexOf('green card') !== -1 || s.indexOf('residency') !== -1 || s.indexOf('i-485') !== -1){
    fups.push({en:'What\'s the Visa Bulletin?', es:'¿Qué es el Boletín de Visas?'});
    fups.push({en:'Can I work while waiting on I-485?', es:'¿Puedo trabajar mientras espero el I-485?'});
  }
  if(s.indexOf('asylum') !== -1 || s.indexOf('i-589') !== -1){
    fups.push({en:'When can I apply for my EAD?', es:'¿Cuándo solicito mi EAD?'});
    fups.push({en:'What is the 1-year filing bar?', es:'¿Qué es la regla de 1 año?'});
  }
  if(s.indexOf('marriage') !== -1 || s.indexOf('spouse') !== -1){
    fups.push({en:'How do they prove a marriage is real?', es:'¿Cómo prueban que el matrimonio es real?'});
    fups.push({en:'What\'s the 3-year rule?', es:'¿Qué es la regla de 3 años?'});
  }
  // Generic fallbacks
  if(fups.length < 3){
    fups.push({en:'Tell me more', es:'Cuéntame más'});
    fups.push({en:'What forms do I need?', es:'¿Qué formularios necesito?'});
    fups.push({en:'What are the typical timelines?', es:'¿Cuáles son los plazos típicos?'});
  }
  return fups.slice(0, 3);
}

function camiSaveKeyFromInput(){
  var inp = document.getElementById('camiKeyInput');
  if(!inp) return;
  var v = (inp.value || '').trim();
  if(!v){
    toast(lang==='es' ? 'Pega tu clave primero' : 'Paste your key first');
    return;
  }
  if(!/^sk-ant-/.test(v)){
    var ok = window.confirm(lang==='es'
      ? 'La clave no parece tener el formato esperado (sk-ant-...). ¿Guardar de todas formas?'
      : 'That doesn\'t look like a standard Anthropic key (sk-ant-...). Save anyway?');
    if(!ok) return;
  }
  camiSetApiKey(v);
  camiHideKeySetup();
}

// Suggested first-message chips — customized to user's phase
function camiSuggestions(){
  var phase = user.phase;
  var goal = user.immigrationGoal;
  var commonCivics = [
    {en:'Why does the Constitution start with "We the People"?', es:'¿Por qué la Constitución empieza con "Nosotros el Pueblo"?'},
    {en:'Explain checks and balances simply', es:'Explica los pesos y contrapesos simplemente'}
  ];
  var phaseSpecific = [];
  if(phase === 'student'){
    phaseSpecific = [
      {en:'When should I file for OPT?', es:'¿Cuándo presento OPT?'},
      {en:'What if I want to stay after my F-1?', es:'¿Qué pasa si quiero quedarme tras la F-1?'}
    ];
  } else if(phase === 'opt'){
    phaseSpecific = [
      {en:'How does the H-1B lottery work?', es:'¿Cómo funciona la lotería H-1B?'},
      {en:'Am I eligible for STEM OPT?', es:'¿Soy elegible para STEM OPT?'}
    ];
  } else if(phase === 'workvisa'){
    phaseSpecific = [
      {en:'How do I get sponsored for a green card?', es:'¿Cómo me patrocinan para la residencia?'},
      {en:'What is PERM labor certification?', es:'¿Qué es la certificación PERM?'}
    ];
  } else if(phase === 'asylum'){
    phaseSpecific = [
      {en:'When can I apply for my EAD?', es:'¿Cuándo puedo solicitar el EAD?'},
      {en:'How long until my asylum interview?', es:'¿Cuánto para mi entrevista de asilo?'}
    ];
  } else if(phase === 'preGC'){
    phaseSpecific = [
      {en:'How does the Visa Bulletin work?', es:'¿Cómo funciona el Boletín de Visas?'},
      {en:'What documents do I need for I-485?', es:'¿Qué documentos necesito para el I-485?'}
    ];
  } else if(phase === 'hasGC'){
    phaseSpecific = [
      {en:'Am I ready to file my N-400?', es:'¿Estoy listo/a para presentar el N-400?'},
      {en:'What happens at the interview?', es:'¿Qué pasa en la entrevista?'}
    ];
  } else {
    phaseSpecific = [
      {en:'Which immigration path fits me?', es:'¿Qué vía de inmigración me conviene?'},
      {en:'What\'s the fastest path to a green card?', es:'¿Cuál es la vía más rápida a la residencia?'}
    ];
  }
  return phaseSpecific.concat(commonCivics);
}

// ===== CAMINO PLUS (SUBSCRIPTION) =====
var PLUS_PRICING = {
  // $7.99/mo lands below the $15.99 market median while above Citizen Now's $3.99.
  // Annual $49.99 ≈ $4.17/mo, ~48% off monthly — strong anchor without race-to-bottom feel.
  monthly:{price:7.99,  period:{en:'month',es:'mes'}, code:'monthly'},
  annual: {price:49.99, period:{en:'year', es:'año'}, code:'annual', monthlyEquiv:4.17, savePct:48}
};

// ===== STORE / IN-APP PURCHASES ============================================
// One abstraction, two backends:
//   • Native iOS (Capacitor + RevenueCat) → real StoreKit subscriptions.
//   • Web (browser preview)               → local mock (unchanged trial behavior),
//                                            so the app stays fully testable off-device.
// The native branch reflects RevenueCat's entitlement into user.plan, so the rest of
// the app (isPlus, gates, badges) keeps reading user.plan and just works.
//
// SETUP: create these in App Store Connect + RevenueCat, then fill in the values.
//   NATIVE ACCESS: the RevenueCat SDK (@revenuecat/purchases-capacitor) is an ES module.
//   Since this app has no bundler, expose it once as window.Purchases via a 5-line esbuild
//   shim during the iOS build (see BUILD.md). Store falls back to Capacitor.Plugins.Purchases.
var STORE_CONFIG = {
  revenueCatApiKey: 'appl_PHQDmcdUsrzZbaBhdYSLunAiDmd',
  entitlementId: 'plus',
  products: { annual: 'camino_plus_annual', monthly: 'camino_plus_monthly' }
};

var Store = {
  ready: false, _offerings: null, _entitled: false,

  isNative: function(){
    return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  },
  _rc: function(){
    return window.Purchases || (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Purchases) || null;
  },

  init: async function(){
    if(!this.isNative()){ this.ready = true; return; }        // web: nothing to configure
    if(/REPLACE_WITH/.test(STORE_CONFIG.revenueCatApiKey)){
      console.error('STORE_CONFIG.revenueCatApiKey is still the placeholder — purchases will not work.');
      return;
    }
    var rc = this._rc();
    if(!rc){ console.error('RevenueCat plugin missing from build (revenuecat.js not bundled?)'); return; }
    try {
      await rc.configure({ apiKey: STORE_CONFIG.revenueCatApiKey });
      await this._refresh();
      if(rc.addCustomerInfoUpdateListener){
        rc.addCustomerInfoUpdateListener(function(info){ Store._applyCustomerInfo(info && info.customerInfo ? info.customerInfo : info); });
      }
      this.ready = true;
      try { renderAll(); } catch(e){}
    } catch(e){ /* stay not-ready; local fallback applies */ }
  },

  _refresh: async function(){
    var rc = this._rc(); if(!rc) return;
    try { var o = await rc.getOfferings(); this._offerings = (o && o.current) || null; } catch(e){}
    try { var c = await rc.getCustomerInfo(); this._applyCustomerInfo(c && c.customerInfo ? c.customerInfo : c); } catch(e){}
  },

  _applyCustomerInfo: function(ci){
    if(!ci || !user) return;
    var active = ci.entitlements && ci.entitlements.active ? ci.entitlements.active[STORE_CONFIG.entitlementId] : null;
    this._entitled = !!active;
    if(active){
      var pt = active.periodType;
      if(pt === 'TRIAL' || pt === 'INTRO'){ user.plan = 'trial'; user.trialEndsAt = active.expirationDate || null; }
      else { user.plan = 'plus'; }
    } else {
      user.plan = 'free';
    }
    saveUser();
  },

  // Native entitlement state, or null on web (caller uses the local mock).
  entitled: function(){ return this.isNative() ? this._entitled : null; },

  // Localized price string; falls back to hardcoded PLUS_PRICING off-device.
  priceString: function(planCode){
    var fallback = '$' + PLUS_PRICING[planCode].price.toFixed(2);
    if(!this.isNative() || !this._offerings) return fallback;
    try {
      var want = STORE_CONFIG.products[planCode];
      var pkgs = this._offerings.availablePackages || [];
      for(var i=0;i<pkgs.length;i++){
        var p = pkgs[i].product;
        if(p && p.identifier === want && p.priceString) return p.priceString;
      }
    } catch(e){}
    return fallback;
  },

  _packageFor: function(planCode){
    if(!this._offerings) return null;
    var want = STORE_CONFIG.products[planCode];
    var pkgs = this._offerings.availablePackages || [];
    for(var i=0;i<pkgs.length;i++){ if(pkgs[i].product && pkgs[i].product.identifier === want) return pkgs[i]; }
    return null;
  },

  // Real StoreKit purchase (with its 7-day intro trial). Resolves true on success.
  purchase: async function(planCode){
    var rc = this._rc();
    if(!this.isNative() || !rc) return false;               // web path handled by confirmTrialPurchase
    var pkg = this._packageFor(planCode);
    if(!pkg){ toast(lang==='es'?'Producto no disponible':'Product unavailable'); return false; }
    try {
      var r = await rc.purchasePackage({ aPackage: pkg });
      this._applyCustomerInfo(r && r.customerInfo ? r.customerInfo : r);
      return this._entitled === true;
    } catch(e){
      if(!(e && e.userCancelled)) toast(lang==='es'?'No se pudo completar la compra':'Purchase could not be completed');
      return false;
    }
  },

  restore: async function(){
    var rc = this._rc(); if(!rc) return false;
    try {
      var r = await rc.restorePurchases();
      this._applyCustomerInfo(r && r.customerInfo ? r.customerInfo : r);
      var ok = this._entitled === true;
      toast(ok ? (lang==='es'?'¡Compras restauradas!':'Purchases restored!') : (lang==='es'?'No se encontraron compras':'No purchases found'));
      try { renderAll(); } catch(e){}
      return ok;
    } catch(e){ toast(lang==='es'?'No se pudo restaurar':'Could not restore'); return false; }
  }
};

// Open a URL outside the app. In the Capacitor webview, plain window.open /
// target=_blank loads the URL in the SAME webview with no back button — the app
// looks hijacked. Route through the Browser plugin (in-app Safari sheet) instead.
function openExternal(url){
  try {
    if(Store.isNative()){
      var cap = window.Capacitor;
      var browser = window.CapBrowser || (cap && cap.Plugins && cap.Plugins.Browser);
      if(browser && browser.open){ browser.open({ url: url }); return; }
      window.open(url, '_system');   // Cordova-style fallback
      return;
    }
  } catch(e){}
  window.open(url, '_blank', 'noopener');
}

// Delegated interceptor: any <a target="_blank" href="http…"> anywhere in the app
// (form chips, help resources, travel.state.gov links…) goes through openExternal.
document.addEventListener('click', function(ev){
  var a = ev.target && ev.target.closest ? ev.target.closest('a[target="_blank"]') : null;
  if(!a) return;
  var href = a.getAttribute('href') || '';
  if(!/^https?:\/\//i.test(href)) return;
  if(!Store.isNative()) return;      // web: default behavior is already correct
  ev.preventDefault();
  openExternal(href);
}, true);

function isPlus(){
  if(!user) return false;
  if(Store.isNative() && Store.ready) return Store.entitled() === true;  // native: RevenueCat is source of truth
  if(user.plan === 'plus') return true;
  if(user.plan === 'trial' && user.trialEndsAt){
    return Date.now() < new Date(user.trialEndsAt).getTime();
  }
  return false;
}

function planStatus(){
  // Returns one of: 'free' | 'trial-active' | 'trial-ended' | 'plus'
  if(user.plan === 'plus') return 'plus';
  if(user.plan === 'trial'){
    if(user.trialEndsAt && Date.now() < new Date(user.trialEndsAt).getTime()) return 'trial-active';
    return 'trial-ended';
  }
  return 'free';
}

function trialDaysLeft(){
  if(user.plan !== 'trial' || !user.trialEndsAt) return 0;
  var ms = new Date(user.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24*3600*1000)));
}

function startFreeTrial(planCode){
  var now = new Date();
  user.plan = 'trial';
  user.trialStartedAt = now.toISOString();
  var ends = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  user.trialEndsAt = ends.toISOString();
  user.planSelected = planCode || 'annual';
  saveUser();
  renderAll();
  go('home');
  toast(lang==='es' ? '¡Bienvenido a Camino Plus! 7 días gratis.' : 'Welcome to Camino Plus! 7 days free.');
  setTimeout(function(){
    toast(lang==='es' ? '🎉 Exámenes ilimitados, entrevistas y más, desbloqueados' : '🎉 Unlimited tests, interviews + more, unlocked');
  }, 2000);
  // Cami offers a tour after the celebratory toasts settle
  setTimeout(maybeOfferTutorial, 3500);
}

function maybeOfferTutorial(){
  // First post-onboarding: Cami pops in and ASKS if you want a walkthrough.
  // User picks "See walkthrough" → runs the multi-step tour. "Skip" → never shows again.
  if(user.tutorialCompleted) return;
  if(tutorialState && tutorialState.active) return; // already mid-tour, don't re-offer
  setTimeout(function(){
    if(user.tutorialCompleted) return;
    if(tutorialState && tutorialState.active) return;
    showTutorialOffer();
  }, 400);
}
// Backwards-compat alias for any external caller
function maybeStartTutorial(){ maybeOfferTutorial(); }

function showTutorialOffer(){
  if(user.tutorialCompleted) return;
  closeTutorial(); // remove any lingering overlay
  var name = (user.name || (lang==='es' ? 'amigo' : 'friend')).trim();
  var overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.className = 'tutOverlay';
  overlay.innerHTML = ''
    + '<div class="tutBackdrop" onclick="tutorialOfferDecline()"></div>'
    + '<div class="tutCard tutOfferCard" role="dialog" aria-modal="true" aria-labelledby="tutOfferTitle">'
    +   '<div class="tutCami">' + camiSVG('happy') + '</div>'
    +   '<div class="tutTitle" id="tutOfferTitle">'
    +     (lang==='es' ? '¿Te doy un recorrido rápido?' : 'Want a quick tour?')
    +   '</div>'
    +   '<div class="tutBody">'
    +     (lang==='es'
        ? 'Hola ' + name + '. Soy Cami. Puedo mostrarte cómo funciona la app en unos 60 segundos.'
        : 'Hi ' + name + '. I\'m Cami. I can show you how everything works in about 60 seconds.')
    +   '</div>'
    +   '<div class="tutBtnRow">'
    +     '<button class="cta tutPrimary" onclick="tutorialOfferAccept()">'
    +       (lang==='es' ? 'Ver guía →' : 'See walkthrough →')
    +     '</button>'
    +   '</div>'
    +   '<button class="tutSecondary" onclick="tutorialOfferDecline()">'
    +     (lang==='es' ? 'Saltar' : 'Skip')
    +   '</button>'
    + '</div>';
  document.body.appendChild(overlay);
  try { setupModalFocus(overlay, { dismissible: true, onEscape: tutorialOfferDecline }); } catch(e){}
}

function tutorialOfferAccept(){
  closeTutorial();
  startTutorial();
}

function tutorialOfferDecline(){
  user.tutorialCompleted = true;
  saveUser();
  closeTutorial();
}

function cancelPlus(){
  // Real subscriptions are managed by Apple — never "cancel" locally on device.
  if(Store.isNative()){
    openExternal('https://apps.apple.com/account/subscriptions');
    return;
  }
  // Web mock: structured cancel flow (reason picker, retention messaging)
  showCancelFlow();
}

var CANCEL_REASONS = [
  {id:'too-expensive', label:{en:'Too expensive', es:'Demasiado caro'}},
  {id:'not-using',     label:{en:'Not using it enough', es:'No lo uso suficiente'}},
  {id:'missing-feat',  label:{en:'Missing a feature I need', es:'Falta una función'}},
  {id:'got-citizen',   label:{en:'I became a citizen 🎉', es:'Ya soy ciudadano 🎉'}},
  {id:'temporary',     label:{en:'Just pausing temporarily', es:'Solo pausa temporal'}},
  {id:'other',         label:{en:'Other', es:'Otro'}}
];

function showCancelFlow(){
  closeCancelFlow();
  var overlay = document.createElement('div');
  overlay.id = 'cancelFlow';
  overlay.className = 'disclaimerOverlay';
  overlay.setAttribute('aria-labelledby', 'cancelTitle');
  var reasonsHtml = CANCEL_REASONS.map(function(r){
    return '<button class="cancelReasonBtn" onclick="confirmCancelPlus(\''+r.id+'\')">'+r.label[lang]+'</button>';
  }).join('');
  overlay.innerHTML = ''
    + '<div class="cancelCard">'
    + '  <div class="cancelHead">'
    + '    <div class="cancelCami">'+camiSVG('sad')+'</div>'
    + '    <div class="cancelTitle" id="cancelTitle">'+(lang==='es'?'¿Cancelar Camino Plus?':'Cancel Camino Plus?')+'</div>'
    + '    <div class="cancelSub">'+(lang==='es'
            ? 'Mantienes acceso hasta el final de tu período pagado.'
            : 'You keep access until the end of your paid period.')+'</div>'
    + '  </div>'
    + '  <div class="cancelReasonLbl">'+(lang==='es'?'¿Por qué cancelas? (opcional)':'Why are you cancelling? (optional)')+'</div>'
    + '  <div class="cancelReasons">'+reasonsHtml+'</div>'
    + '  <button class="cancelKeepBtn" onclick="closeCancelFlow()">'+(lang==='es'?'No, mantener Plus':'No, keep Plus')+'</button>'
    + '</div>';
  document.body.appendChild(overlay);
  setupModalFocus(overlay);
}

function closeCancelFlow(){
  var el = document.getElementById('cancelFlow');
  if(el){ teardownModalFocus(el); el.remove(); }
}

function confirmCancelPlus(reasonId){
  if(Store.isNative()){ closeCancelFlow(); openExternal('https://apps.apple.com/account/subscriptions'); return; }
  // Save the reason for later analytics (just localStorage in prototype)
  if(!user.cancelHistory) user.cancelHistory = [];
  user.cancelHistory.push({reason: reasonId, at: new Date().toISOString()});
  user.plan = 'free';
  user.trialStartedAt = null;
  user.trialEndsAt = null;
  user.planSelected = null;
  user.planRenewsAt = null;
  saveUser();
  closeCancelFlow();
  renderAll();
  if(typeof renderMe === 'function') renderMe();
  toast(lang==='es' ? 'Plan cancelado · gracias por probar Plus' : 'Plan cancelled · thanks for trying Plus');
}

// ===== TRIAL ENDING WARNINGS =====
// Check on boot and on focus. Show a one-time-per-day reminder banner when the trial
// ends in 3 days or 1 day. Stored per-day in user.trialReminderShown so we don't spam.
function checkTrialReminders(){
  // Native: trial/renewal state comes from RevenueCat (real StoreKit billing).
  // The local simulation below must never run on device — it would grant Plus for free.
  if(Store.isNative()) return;
  if(user.plan !== 'trial' || !user.trialEndsAt) return;
  var daysLeft = trialDaysLeft();
  var todayKey = todayISO();
  if(!user.trialReminderShown) user.trialReminderShown = {};
  if(daysLeft === 0){
    // Trial expired today — auto-convert to Plus (prototype simulates the App Store renewal)
    if(user.trialReminderShown['expired'] === todayKey) return;
    user.plan = 'plus';
    user.planRenewsAt = new Date(Date.now() + (user.planSelected === 'monthly' ? 30 : 365) * 24 * 3600 * 1000).toISOString();
    user.trialReminderShown['expired'] = todayKey;
    saveUser();
    setTimeout(function(){ showTrialOutcomeModal('converted'); }, 500);
    return;
  }
  if(daysLeft <= 1 && user.trialReminderShown['day1'] !== todayKey){
    user.trialReminderShown['day1'] = todayKey;
    saveUser();
    setTimeout(function(){ showTrialReminderModal(1); }, 500);
  } else if(daysLeft <= 2 && daysLeft > 1 && user.trialReminderShown['day2'] !== todayKey){
    user.trialReminderShown['day2'] = todayKey;
    saveUser();
    setTimeout(function(){ showTrialReminderModal(daysLeft); }, 500);
  }
}

function showTrialReminderModal(daysLeft){
  closeTrialModal();
  var pricing = PLUS_PRICING[user.planSelected || 'annual'];
  var renewLine = lang==='es'
    ? 'En ' + daysLeft + ' ' + (daysLeft === 1 ? 'día' : 'días') + ' tu suscripción se renueva a $' + pricing.price.toFixed(2) + '/' + pricing.period[lang] + '.'
    : 'In ' + daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' your subscription renews at $' + pricing.price.toFixed(2) + '/' + pricing.period[lang] + '.';
  var overlay = document.createElement('div');
  overlay.id = 'trialModal';
  overlay.className = 'disclaimerOverlay';
  overlay.innerHTML = ''
    + '<div class="trialReminderCard">'
    + '  <div class="trialReminderCami">'+camiSVG('happy')+'</div>'
    + '  <div class="trialReminderTitle">'+(lang==='es'?'Tu prueba termina pronto':'Your trial ends soon')+'</div>'
    + '  <div class="trialReminderSub">'+renewLine+'</div>'
    + '  <div class="trialReminderActions">'
    + '    <button class="cta trialReminderKeep" onclick="closeTrialModal()">'+(lang==='es'?'Mantener Plus':'Keep Plus')+'</button>'
    + '    <button class="trialReminderCancel" onclick="closeTrialModal(); cancelPlus();">'+(lang==='es'?'Cancelar suscripción':'Cancel subscription')+'</button>'
    + '  </div>'
    + '  <div class="trialReminderNote">'+(lang==='es'
        ? 'Si cancelas, mantienes acceso hasta el final del período.'
        : 'If you cancel, you keep access until the end of the period.')+'</div>'
    + '</div>';
  document.body.appendChild(overlay);
}

function showTrialOutcomeModal(kind){
  closeTrialModal();
  var title, sub;
  if(kind === 'converted'){
    title = lang==='es' ? '¡Bienvenido a Camino Plus!' : 'Welcome to Camino Plus!';
    sub = lang==='es' ? 'Tu prueba terminó y tu suscripción está activa.' : 'Your trial has ended and your subscription is now active.';
  }
  var overlay = document.createElement('div');
  overlay.id = 'trialModal';
  overlay.className = 'disclaimerOverlay';
  overlay.innerHTML = ''
    + '<div class="trialReminderCard">'
    + '  <div class="trialReminderCami">'+camiSVG('celebrate')+'</div>'
    + '  <div class="trialReminderTitle">'+title+'</div>'
    + '  <div class="trialReminderSub">'+sub+'</div>'
    + '  <button class="cta trialReminderKeep" onclick="closeTrialModal()">'+(lang==='es'?'Continuar':'Continue')+'</button>'
    + '</div>';
  document.body.appendChild(overlay);
  setupModalFocus(overlay);
}

function closeTrialModal(){
  var el = document.getElementById('trialModal');
  if(el){ teardownModalFocus(el); el.remove(); }
}

// ===== STREAK FREEZE (Plus benefit) =====
// Plus users get 2 streak freezes per month, auto-applied when they miss a day.
function refreshStreakFreezes(){
  if(!isPlus()) return;
  var now = new Date();
  var monthKey = now.getFullYear() + '-' + (now.getMonth()+1);
  if(user.streakFreezesMonth !== monthKey){
    user.streakFreezesMonth = monthKey;
    user.streakFreezes = 2;
    saveUser();
  }
}

function applyStreakFreezeIfNeeded(){
  // Called when the streak would otherwise be broken (we missed a day).
  if(!isPlus()) return false;
  refreshStreakFreezes();
  if((user.streakFreezes || 0) <= 0) return false;
  user.streakFreezes--;
  user.progress.lastLessonDate = todayISO(); // freeze keeps the streak alive
  if(!user.streakFreezeHistory) user.streakFreezeHistory = [];
  user.streakFreezeHistory.push(todayISO());
  saveUser();
  setTimeout(function(){
    toast(lang==='es' ? '❄️ Racha congelada · queda '+user.streakFreezes : '❄️ Streak frozen · '+user.streakFreezes+' left this month');
  }, 800);
  return true;
}

// Hook: when the app boots and the user broke their streak yesterday, try to freeze it.
function maybeFreezeStreak(){
  if(!user.progress || !user.progress.streak) return;
  if(!user.progress.lastLessonDate) return;
  var last = new Date(user.progress.lastLessonDate);
  var today = new Date(todayISO());
  var daysSince = Math.floor((today - last) / (24*3600*1000));
  if(daysSince === 1){
    // Last activity was yesterday — no freeze needed
    return;
  }
  if(daysSince === 2){
    // Missed exactly one day — try to apply a freeze
    applyStreakFreezeIfNeeded();
  }
  // If daysSince > 2, the streak is gone — too late for a single freeze
}

function todayMockTestsAvailable(){
  // Free users: 3 mock tests per day. Plus: unlimited.
  if(isPlus()) return Infinity;
  if(user.mockTestsTodayDate !== todayISO()) return 3;
  return Math.max(0, 3 - (user.mockTestsTodayCount || 0));
}

function recordMockTestStart(){
  if(isPlus()) return;
  if(user.mockTestsTodayDate !== todayISO()){
    user.mockTestsTodayCount = 0;
    user.mockTestsTodayDate = todayISO();
  }
  user.mockTestsTodayCount = (user.mockTestsTodayCount || 0) + 1;
  saveUser();
}

function plusBadge(size){
  size = size || 'sm';
  return '<span class="plusBadge plusBadge-'+size+'">PLUS</span>';
}

// ===== VISA BULLETIN TRACKER =====
// Snapshot of the State Department's Visa Bulletin. In production this would auto-fetch.
// Dates here are recent approximations from typical 2026 cycles for educational purposes.
var VISA_BULLETIN = {
  month: 'June 2026',
  monthEs: 'Junio 2026',
  link: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html',
  employment: {
    'EB-1': { 'India': '2022-02-15', 'China': '2022-11-08', 'Other': null /* current */ },
    'EB-2': { 'India': '2013-01-01', 'China': '2020-03-22', 'Other': '2023-04-22' },
    'EB-3': { 'India': '2013-04-01', 'China': '2020-09-01', 'Other': '2023-01-01' }
  },
  family: {
    'F1':  { 'Mexico': '2005-04-15', 'Philippines': '2012-09-01', 'India': '2016-08-01', 'China': '2016-08-01', 'Other': '2016-08-01' },
    'F2A': { 'Mexico': '2024-12-08', 'Other': '2024-12-08' },
    'F2B': { 'Mexico': '2006-01-22', 'Philippines': '2014-04-22', 'India': '2017-04-22', 'China': '2017-04-22', 'Other': '2017-04-22' },
    'F3':  { 'Mexico': '2001-04-08', 'Philippines': '2003-08-22', 'India': '2011-09-01', 'China': '2011-09-01', 'Other': '2011-09-01' },
    'F4':  { 'Mexico': '2001-04-22', 'Philippines': '2004-04-15', 'India': '2006-01-08', 'China': '2009-04-01', 'Other': '2008-04-15' }
  }
};

function getVisaBulletinCutoff(category, country){
  var src = (category === 'EB-1' || category === 'EB-2' || category === 'EB-3') ? VISA_BULLETIN.employment : VISA_BULLETIN.family;
  if(!src[category]) return null;
  return src[category][country] !== undefined ? src[category][country] : src[category]['Other'];
}

function renderVisaBulletin(){
  var body = document.getElementById('visaBulletinBody');
  if(!body) return;
  var monthLabel = lang==='es' ? VISA_BULLETIN.monthEs : VISA_BULLETIN.month;

  // Recommend a category based on user.petitionType + country
  var suggestedCat = null;
  if(user.petitionType === 'employment') suggestedCat = 'EB-2';
  else if(user.petitionType === 'family-ir') suggestedCat = null; // IR is current
  else if(user.petitionType === 'family-pref') suggestedCat = 'F3';
  else if(user.petitionType === 'family-lpr') suggestedCat = 'F2A';

  var savedCat = user.vbCategory || suggestedCat || 'EB-2';
  var savedCountry = user.vbCountry || user.countryOfBirth || 'Other';
  var savedPD = user.vbPriorityDate || '';

  var categories = ['EB-1','EB-2','EB-3','F1','F2A','F2B','F3','F4'];
  var countries = ['India','China','Mexico','Philippines','Other'];

  var catOpts = categories.map(function(c){
    return '<option value="'+c+'"'+(c===savedCat?' selected':'')+'>'+c+'</option>';
  }).join('');
  var countryOpts = countries.map(function(c){
    var label = c === 'Other' ? (lang==='es'?'Otros países':'All other countries') : c;
    return '<option value="'+c+'"'+(c===savedCountry?' selected':'')+'>'+label+'</option>';
  }).join('');

  var cutoff = getVisaBulletinCutoff(savedCat, savedCountry);
  var cutoffDisplay = cutoff ? fmtDate(cutoff, lang) : (lang==='es'?'C (vigente)':'C (current)');

  var statusHtml = '';
  if(!savedPD){
    statusHtml = '<div class="vbStatus vbStatusEmpty">'
      + iconSVG('clock','#84807a',22)
      + '<div><div class="vbStatusTitle">'+(lang==='es'?'Ingresa tu fecha de prioridad arriba':'Enter your priority date above')+'</div>'
      + '<div class="vbStatusSub">'+(lang==='es'?'La fecha de prioridad está en tu recibo I-797 — es el día que USCIS recibió tu petición.':'Your priority date is on your I-797 receipt — the day USCIS received your petition.')+'</div></div>'
      + '</div>';
  } else if(savedPD){
    var pd = new Date(savedPD);
    var isCurrent = !cutoff || pd <= new Date(cutoff);
    if(isCurrent){
      statusHtml = '<div class="vbStatus vbStatusGood">'
        + iconSVG('check','#1c6b35',22)
        + '<div><div class="vbStatusTitle">'+(lang==='es'?'Tu fecha podría estar vigente':'Your date may be current')+'</div>'
        + '<div class="vbStatusSub">'+(lang==='es'?'Según nuestras fechas de referencia, podrías presentar el I-485. Verifica el boletín oficial en travel.state.gov antes de actuar.':'Based on our reference dates, you may be able to file I-485. Verify the official bulletin at travel.state.gov before acting.')+'</div></div>'
        + '</div>';
    } else {
      var monthsBehind = Math.round((new Date(cutoff) - pd) / (-30.44 * 24 * 3600 * 1000));
      var absMonths = Math.abs(monthsBehind);
      var yrs = Math.floor(absMonths / 12);
      var mos = absMonths % 12;
      var waitTxt = yrs > 0 ? (yrs + ' ' + (lang==='es'?'años':'years') + (mos > 0 ? ' ' + mos + ' ' + (lang==='es'?'meses':'months') : '')) : (mos + ' ' + (lang==='es'?'meses':'months'));
      statusHtml = '<div class="vbStatus vbStatusWait">'
        + iconSVG('clock','#a05000',22)
        + '<div><div class="vbStatusTitle">'+(lang==='es'?'Esperando':'Waiting')+'</div>'
        + '<div class="vbStatusSub">'+(lang==='es'?'Tu PD está aproximadamente ':'Your PD is approximately ')+waitTxt+' '+(lang==='es'?'detrás del corte. Los plazos varían con la política.':'behind the cutoff. Timelines vary with policy.')+'</div></div>'
        + '</div>';
    }
  }

  body.innerHTML = ''
    + '<div class="vbHead">'
    +   '<div class="vbKick">'+(lang==='es'?'BOLETÍN DE VISAS':'VISA BULLETIN')+'</div>'
    +   '<div class="vbTitle">'+monthLabel+'</div>'
    +   '<div class="vbSub">'+(lang==='es'?'Datos aproximados del ciclo reciente. Confirma siempre en':'Approximate from recent cycle. Always verify at')+' <a href="'+VISA_BULLETIN.link+'" target="_blank" rel="noopener">travel.state.gov</a></div>'
    + '</div>'
    + '<div class="vbForm">'
    +   '<label class="vbLbl">'+(lang==='es'?'Categoría':'Category')+'</label>'
    +   '<select class="vbSelect" id="vbCategory" onchange="saveVBSettings()">'+catOpts+'</select>'
    +   '<label class="vbLbl">'+(lang==='es'?'País de cargabilidad':'Country of chargeability')+'</label>'
    +   '<select class="vbSelect" id="vbCountry" onchange="saveVBSettings()">'+countryOpts+'</select>'
    +   '<label class="vbLbl">'+(lang==='es'?'Tu fecha de prioridad (PD)':'Your priority date (PD)')+'</label>'
    +   '<input type="date" class="vbInput" id="vbPriorityDate" value="'+savedPD+'" onchange="saveVBSettings()" />'
    + '</div>'
    + '<div class="vbResult">'
    +   '<div class="vbResultRow"><div class="vbResultKey">'+(lang==='es'?'Categoría':'Category')+'</div><div class="vbResultVal">'+savedCat+' · '+savedCountry+'</div></div>'
    +   '<div class="vbResultRow"><div class="vbResultKey">'+(lang==='es'?'Fecha de corte':'Cutoff date')+'</div><div class="vbResultVal">'+cutoffDisplay+'</div></div>'
    +   (savedPD ? '<div class="vbResultRow"><div class="vbResultKey">'+(lang==='es'?'Tu PD':'Your PD')+'</div><div class="vbResultVal">'+fmtDate(savedPD, lang)+'</div></div>' : '')
    + '</div>'
    + statusHtml
    + (CAMI_AVAILABLE
        ? '<div class="vbAskCami">'
          +   '<button class="askCamiBtn" onclick="askCami(\''+(lang==='es'?'Explícame el Boletín de Visas para '+savedCat+' '+savedCountry:'Explain the Visa Bulletin for '+savedCat+' '+savedCountry).replace(/\'/g,"\\'")+'\')">'+iconSVG('chevron','#fff',12)+' '+(lang==='es'?'Pregunta a Cami':'Ask Cami about this')+'</button>'
          + '</div>'
        : '')
    + '<div class="vbDisclaimer">'+(lang==='es'
        ? 'Estos datos son aproximaciones para fines educativos. El Boletín oficial cambia cada mes y puede retroceder ("retrogression"). Verifica en travel.state.gov antes de tomar decisiones.'
        : 'This is approximate, educational data. The official Bulletin changes monthly and can retrogress. Verify at travel.state.gov before making decisions.')+'</div>';
  populateIcons();
}

function saveVBSettings(){
  var cat = (document.getElementById('vbCategory')||{}).value;
  var country = (document.getElementById('vbCountry')||{}).value;
  var pd = (document.getElementById('vbPriorityDate')||{}).value;
  if(cat) user.vbCategory = cat;
  if(country) user.vbCountry = country;
  if(pd) user.vbPriorityDate = pd;
  saveUser();
  renderVisaBulletin();
}

// ===== PATH-SPECIFIC ELIGIBILITY WIZARDS =====
// Each wizard is a series of questions with branching logic, ending in:
//   - 'likely' (green): you appear to meet the basic eligibility criteria
//   - 'unsure' (orange): some flag — a lawyer should verify
//   - 'not_eligible' (red): a hard rule excludes you (with reason)
// EVERY result ends with the attorney-consult close (per the disclaimer).

var ELIGIBILITY_WIZARDS = {
  asylum: {
    id: 'asylum',
    iconName: 'shield', color: '#ff9b21',
    title: {en: 'Asylum eligibility (I-589)', es: 'Elegibilidad para asilo (I-589)'},
    sub:   {en: 'Fear of persecution in your home country', es: 'Miedo a persecución en tu país'},
    estimatedMinutes: 3,
    steps: [
      {id: 'arrival', type: 'date',
       q: {en: 'When did you arrive in the U.S.?', es: '¿Cuándo llegaste a EE.UU.?'},
       help: {en: 'You generally must file I-589 within 1 year of your most recent arrival, with rare exceptions.', es: 'Generalmente debes presentar I-589 dentro de 1 año de tu llegada más reciente, con raras excepciones.'}},
      {id: 'fear', type: 'yesno',
       q: {en: 'Are you afraid to return to your home country?', es: '¿Tienes miedo de volver a tu país?'},
       help: {en: 'Asylum protects those who fear harm at home.', es: 'El asilo protege a quienes temen daño en su país.'}},
      {id: 'basis', type: 'multi',
       q: {en: 'Why do you fear persecution? (Select all that apply)', es: '¿Por qué temes persecución? (Marca todas)'},
       help: {en: 'Asylum requires the fear to be based on at least one of these 5 grounds.', es: 'El asilo requiere que el miedo se base en al menos uno de estos 5 motivos.'},
       options: [
         {value: 'race', label: {en: 'My race', es: 'Mi raza'}},
         {value: 'religion', label: {en: 'My religion', es: 'Mi religión'}},
         {value: 'nationality', label: {en: 'My nationality / ethnicity', es: 'Mi nacionalidad / etnia'}},
         {value: 'political', label: {en: 'My political opinion', es: 'Mi opinión política'}},
         {value: 'social', label: {en: 'A particular social group I belong to (LGBTQ, family, gender, etc.)', es: 'Un grupo social al que pertenezco (LGBTQ, familia, género, etc.)'}},
         {value: 'none', label: {en: 'None of these — I fear general violence / poverty', es: 'Ninguno — temo violencia general / pobreza'}}
       ]},
      {id: 'returned', type: 'yesno',
       q: {en: 'Have you returned to your home country since the persecution began?', es: '¿Has regresado a tu país desde que empezó la persecución?'},
       help: {en: 'Returning home can undermine an asylum claim, but isn\'t always disqualifying.', es: 'Regresar puede debilitar el caso, pero no siempre lo descalifica.'}},
      {id: 'safe-third', type: 'yesno',
       q: {en: 'Did you transit through another country first?', es: '¿Pasaste por otro país antes de llegar?'},
       help: {en: 'The "safe third country" rule may bar your claim if you could have asked for asylum elsewhere on the way.', es: 'La regla de "tercer país seguro" puede bloquear el caso si podías haber pedido asilo en el camino.'}},
      {id: 'crimes', type: 'yesno',
       q: {en: 'Have you been convicted of a serious crime in any country?', es: '¿Has sido condenado por un crimen grave en algún país?'},
       help: {en: 'Certain crimes are absolute bars to asylum (aggravated felonies, terrorism, persecution of others).', es: 'Ciertos crímenes son barreras absolutas (delitos graves, terrorismo, persecutor).'}}
    ],
    evaluate: function(a){
      var reasons = [], flags = [];
      var arrivalDate = a.arrival ? new Date(a.arrival) : null;
      var yearsAgo = arrivalDate ? (Date.now() - arrivalDate) / (365.25 * 24 * 3600 * 1000) : 0;
      if(arrivalDate && yearsAgo > 1){
        flags.push({en: 'You arrived more than 1 year ago. Asylum has a 1-year filing rule with limited exceptions (changed circumstances, extraordinary circumstances).', es: 'Llegaste hace más de 1 año. El asilo tiene regla de 1 año con excepciones limitadas.'});
      }
      if(a.fear === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'Asylum requires fear of persecution at home.', es: 'El asilo requiere miedo a persecución en tu país.'}], flags: []};
      }
      var basis = Array.isArray(a.basis) ? a.basis : [];
      if(basis.indexOf('none') !== -1 || (basis.length === 0)){
        return {verdict: 'not_eligible', reasons: [{en: 'Asylum requires the fear to be on account of race, religion, nationality, political opinion, or a particular social group. General violence or poverty alone does not qualify.', es: 'El asilo requiere que el miedo sea por raza, religión, nacionalidad, opinión política o grupo social. La violencia general o pobreza por sí solas no califican.'}], flags: []};
      }
      if(a.crimes === 'yes') flags.push({en: 'Certain serious convictions are absolute bars to asylum. A lawyer must review your record.', es: 'Ciertas condenas graves son barreras absolutas. Un abogado debe revisar.'});
      if(a.returned === 'yes') flags.push({en: 'You returned home after the persecution began. The officer will ask about this — a lawyer can help frame it.', es: 'Regresaste tras empezar la persecución. El oficial lo preguntará — un abogado puede ayudar.'});
      if(a['safe-third'] === 'yes') flags.push({en: 'Passing through a "safe third country" may bar your claim depending on current policy. Lawyer check needed.', es: 'Pasar por un "tercer país seguro" puede bloquear el caso según política actual.'});
      if(flags.length === 0 && arrivalDate && yearsAgo <= 1){
        reasons.push({en: 'You appear to meet the basic asylum eligibility criteria: timely filing + fear on a protected ground.', es: 'Pareces cumplir con los criterios básicos: presentación a tiempo + miedo por motivo protegido.'});
        return {verdict: 'likely', reasons: reasons, flags: flags};
      }
      return {verdict: 'unsure', reasons: [{en: 'You may be eligible but there are factors a lawyer should review.', es: 'Puedes ser elegible pero hay factores que un abogado debe revisar.'}], flags: flags};
    },
    nextSteps: {
      en: ['File Form I-589 (no fee) within 1 year of arrival.',
           'Gather corroborating evidence: country reports, witness affidavits, medical/police records, photos.',
           'Find a free pro-bono attorney — search "asylum legal aid" + your city, or check Catholic Charities, IRCA, KIND, or your local Bar Association.'],
      es: ['Presenta el Formulario I-589 (sin tarifa) dentro de 1 año de llegar.',
           'Reúne evidencia: reportes del país, declaraciones de testigos, registros médicos/policiales, fotos.',
           'Busca un abogado pro-bono — "asylum legal aid" + tu ciudad, o Catholic Charities, IRCA, KIND, o el Colegio de Abogados local.']
    }
  },

  marriage_gc: {
    id: 'marriage_gc',
    iconName: 'ring', color: '#ff4d3a',
    title: {en: 'Marriage GC eligibility (IR-1/CR-1)', es: 'Elegibilidad residencia por matrimonio'},
    sub:   {en: 'Through a U.S. citizen spouse', es: 'Por cónyuge ciudadano de EE.UU.'},
    estimatedMinutes: 3,
    steps: [
      {id: 'spouse-citizen', type: 'yesno',
       q: {en: 'Is your spouse a U.S. citizen?', es: '¿Tu cónyuge es ciudadano de EE.UU.?'},
       help: {en: 'If LPR (green card holder) instead, you\'d use the F2A category — different wait times.', es: 'Si es residente, sería F2A — espera distinta.'}},
      {id: 'married', type: 'yesno',
       q: {en: 'Are you currently legally married?', es: '¿Estás casado/a legalmente?'},
       help: {en: 'Engagements/relationships don\'t count. K-1 fiancé visa is a different path.', es: 'Noviazgo no cuenta. K-1 es vía distinta.'}},
      {id: 'genuine', type: 'yesno',
       q: {en: 'Is your marriage real (not just for immigration)?', es: '¿Tu matrimonio es genuino (no solo para migrar)?'},
       help: {en: 'USCIS aggressively investigates fake marriages. Penalty is up to 5 years prison + permanent inadmissibility.', es: 'USCIS investiga matrimonios falsos. Pena hasta 5 años de cárcel + inadmisibilidad permanente.'}},
      {id: 'how-met', type: 'yesno',
       q: {en: 'Can you document your relationship?', es: '¿Puedes documentar tu relación?'},
       help: {en: 'USCIS expects substantial proof at the interview: how you met, joint accounts, lease, photos, affidavits from family/friends, joint health insurance.', es: 'USCIS pide prueba sustancial: cómo se conocieron, cuentas conjuntas, contrato, fotos, declaraciones de familia/amigos, seguro de salud conjunto.'}},
      {id: 'prior-marriages', type: 'yesno',
       q: {en: 'Any prior marriages (you or spouse)?', es: '¿Matrimonios anteriores (tú o cónyuge)?'},
       help: {en: 'You\'ll need certified divorce decrees or death certificates for each.', es: 'Necesitas decretos de divorcio o actas de defunción certificadas para cada uno.'}},
      {id: 'in-us', type: 'yesno',
       q: {en: 'Are you in the U.S. with legal status?', es: '¿Estás en EE.UU. con estatus legal?'},
       help: {en: 'If yes, you file I-485 (adjustment). If abroad, consular processing via DS-260.', es: 'Si sí, presentas I-485. Si afuera, procesamiento consular vía DS-260.'}},
      {id: 'crimes', type: 'yesno',
       q: {en: 'Any criminal record (including DUI or drugs)?', es: '¿Antecedentes penales (incluyendo DUI o drogas)?'},
       help: {en: 'Some convictions trigger inadmissibility — a lawyer should review.', es: 'Algunas condenas activan inadmisibilidad — abogado debe revisar.'}},
      {id: 'prior-fraud', type: 'yesno',
       q: {en: 'Ever used false documents or claimed U.S. citizenship?', es: '¿Usado documentos falsos o reclamado ser ciudadano?'},
       help: {en: 'Either can be a permanent bar without a waiver.', es: 'Pueden ser barrera permanente sin perdón.'}}
    ],
    evaluate: function(a){
      var reasons = [], flags = [];
      if(a['spouse-citizen'] === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'This wizard covers IR/CR (spouse-of-U.S.-citizen). If your spouse is an LPR (green card holder), use the F2A category — there\'s a quota wait.', es: 'Este check cubre cónyuge de ciudadano. Si es residente, usa F2A — hay espera de cuota.'}], flags: []};
      }
      if(a.married === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'You must be legally married. If engaged, look at the K-1 fiancé visa instead.', es: 'Debes estar casado. Si comprometido, mira la visa K-1.'}], flags: []};
      }
      if(a.genuine === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'A marriage entered into for immigration purposes is fraud — federal crime, prison, permanent bar.', es: 'Matrimonio por inmigración es fraude — crimen federal, cárcel, barrera permanente.'}], flags: []};
      }
      if(a['prior-fraud'] === 'yes') flags.push({en: 'Prior fraud is often a permanent bar. A lawyer can assess waiver options.', es: 'Fraude previo es a menudo barrera permanente. Abogado puede ver opciones de perdón.'});
      if(a.crimes === 'yes') flags.push({en: 'Your criminal record needs lawyer review for inadmissibility.', es: 'Tu récord penal necesita revisión legal para inadmisibilidad.'});
      if(a['how-met'] === 'no') flags.push({en: 'Limited documentation of relationship may trigger Stokes interview (separate interviews). Build your file now.', es: 'Documentación limitada puede causar entrevista Stokes (separados). Arma el expediente ya.'});
      if(a['prior-marriages'] === 'yes') flags.push({en: 'You\'ll need certified divorce decrees or death certificates for every prior marriage.', es: 'Necesitas decretos de divorcio o actas de defunción certificadas.'});
      if(flags.length === 0){
        return {verdict: 'likely', reasons: [{en: 'You appear to meet the basic eligibility for a marriage-based green card.', es: 'Pareces cumplir con los criterios básicos para residencia por matrimonio.'}], flags: []};
      }
      return {verdict: 'unsure', reasons: [{en: 'Your answers match the basic requirements, but the flagged items below need attention.', es: 'Generalmente elegible, pero los puntos abajo necesitan atención.'}], flags: flags};
    },
    nextSteps: {
      en: ['File Form I-130 (your citizen spouse files this for you) and Form I-485 (adjustment) concurrently if you\'re in the U.S.',
           'Gather: marriage certificate, photos together, joint financial documents, lease/mortgage, joint health insurance, affidavits from friends/family.',
           'Prepare for the interview: USCIS will ask detailed questions about your daily life together.',
           'If less than 2 years married at GC approval, you get a 2-year conditional GC and must file I-751 jointly later.'],
      es: ['Presenta I-130 (tu cónyuge lo presenta) y I-485 (ajuste) juntos si estás en EE.UU.',
           'Reúne: acta de matrimonio, fotos, documentos financieros conjuntos, contrato/hipoteca, seguro de salud, declaraciones.',
           'Prepárate para la entrevista: preguntas detalladas sobre vida diaria.',
           'Menos de 2 años casado al aprobarse: residencia condicional 2 años, luego I-751.']
    }
  },

  stem_opt: {
    id: 'stem_opt',
    iconName: 'star', color: '#ec4f93',
    title: {en: 'STEM OPT extension eligibility', es: 'Elegibilidad extensión STEM OPT'},
    sub:   {en: 'Additional 24 months after standard OPT', es: '24 meses adicionales tras OPT estándar'},
    estimatedMinutes: 2,
    steps: [
      {id: 'on-opt', type: 'yesno',
       q: {en: 'Are you currently on standard 12-month OPT?', es: '¿Estás en OPT estándar de 12 meses?'},
       help: {en: 'You can only apply for STEM extension while on active OPT.', es: 'Solo puedes pedir extensión durante OPT activo.'}},
      {id: 'stem-degree', type: 'yesno',
       q: {en: 'Was your most recent U.S. degree in a STEM field (per DHS STEM list)?', es: '¿Tu título de EE.UU. más reciente es STEM (lista DHS)?'},
       help: {en: 'Check the DHS STEM Designated Degree Program List at ICE.gov. Many CS, engineering, math, science programs qualify.', es: 'Revisa la lista DHS en ICE.gov. Muchos programas CS, ingeniería, matemáticas, ciencias califican.'}},
      {id: 'sevp-school', type: 'yesno',
       q: {en: 'Was the school SEVP-certified and accredited?', es: '¿La escuela era certificada SEVP y acreditada?'},
       help: {en: 'Required for STEM eligibility — most accredited U.S. universities qualify.', es: 'Requerido — la mayoría de universidades acreditadas califican.'}},
      {id: 'employer-everify', type: 'yesno',
       q: {en: 'Is your current/proposed employer enrolled in E-Verify?', es: '¿Tu empleador está inscrito en E-Verify?'},
       help: {en: 'Employer MUST be in E-Verify for STEM OPT. Check at e-verify.uscis.gov.', es: 'Empleador DEBE estar en E-Verify. Revisa en e-verify.uscis.gov.'}},
      {id: 'job-relates', type: 'yesno',
       q: {en: 'Does the job directly relate to your STEM degree?', es: '¿El trabajo se relaciona directamente con tu título STEM?'},
       help: {en: 'Required — your duties must use the knowledge from your degree.', es: 'Requerido — tus tareas deben usar el conocimiento del título.'}},
      {id: 'prior-stem', type: 'yesno',
       q: {en: 'Have you previously used a 24-month STEM OPT extension?', es: '¿Has usado una extensión STEM antes?'},
       help: {en: 'You can only get a STEM extension twice in your career (one per degree level).', es: 'Solo puedes obtener extensión STEM dos veces (una por nivel de título).'}}
    ],
    evaluate: function(a){
      var reasons = [], flags = [];
      if(a['on-opt'] === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'You must currently be on active 12-month OPT to apply for the STEM extension.', es: 'Debes estar en OPT activo para pedir extensión.'}], flags: []};
      }
      if(a['stem-degree'] === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'Your most recent U.S. degree must be on the DHS STEM Designated Degree Program List.', es: 'Tu título debe estar en la lista DHS STEM.'}], flags: []};
      }
      if(a['employer-everify'] === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'Your employer must be enrolled in E-Verify before you can be approved for STEM OPT.', es: 'Tu empleador debe estar en E-Verify.'}], flags: [{en: 'If they\'re not, ask HR — enrollment takes ~1 week.', es: 'Si no, pregunta a RRHH — inscripción toma ~1 semana.'}]};
      }
      if(a['job-relates'] === 'no'){
        flags.push({en: 'The job must directly use the knowledge from your STEM degree. A lawyer can help craft the I-983 to show the connection.', es: 'El trabajo debe usar el conocimiento del título. Abogado puede ayudar con el I-983.'});
      }
      if(a['sevp-school'] === 'no'){
        flags.push({en: 'School must be SEVP-certified + accredited. Confirm with your DSO.', es: 'Escuela debe ser SEVP-certificada. Confirma con tu DSO.'});
      }
      if(flags.length === 0){
        if(a['prior-stem'] === 'yes'){
          reasons.push({en: 'You\'ve used your 24-month extension once. You can use it again only if this is for a higher-level STEM degree.', es: 'Ya usaste 24 meses. Solo puedes de nuevo si es para título STEM superior.'});
          return {verdict: 'unsure', reasons: reasons, flags: []};
        }
        return {verdict: 'likely', reasons: [{en: 'You appear to meet STEM OPT eligibility.', es: 'Pareces cumplir con elegibilidad STEM OPT.'}], flags: []};
      }
      return {verdict: 'unsure', reasons: [{en: 'You\'re close but the flagged items need to be addressed.', es: 'Estás cerca, pero los puntos marcados necesitan atención.'}], flags: flags};
    },
    nextSteps: {
      en: ['Get Form I-983 (Training Plan) signed by you + your employer.',
           'Apply with Form I-765 (eligibility category c)(3)(C)) at least 90 days before your standard OPT expires.',
           'Filing fee: $470 online ($520 paper).',
           'Keep timesheets + training plan documentation throughout the 24 months.'],
      es: ['Obtén el Formulario I-983 (Plan de Entrenamiento) firmado por ti + empleador.',
           'Aplica con I-765 (categoría (c)(3)(C)) al menos 90 días antes que expire tu OPT.',
           'Tarifa: $470 en línea ($520 en papel).',
           'Guarda registros de horas + documentación durante 24 meses.']
    }
  },

  dv_lottery: {
    id: 'dv_lottery',
    iconName: 'globe', color: '#5e8eff',
    title: {en: 'DV Lottery (Diversity Visa) eligibility', es: 'Elegibilidad Lotería de Visas (DV)'},
    sub:   {en: 'Annual lottery for 55,000 immigrant visas', es: 'Lotería anual de 55,000 visas inmigrantes'},
    estimatedMinutes: 2,
    steps: [
      {id: 'country', type: 'yesno',
       q: {en: 'Is your country of birth eligible for the DV lottery?', es: '¿Tu país de nacimiento es elegible para la lotería DV?'},
       help: {en: 'Excluded: Mexico, China, India, Philippines, Vietnam, Dominican Republic, El Salvador, Honduras, Brazil, Pakistan, Bangladesh, Canada, U.K., South Korea, Colombia, Jamaica, Haiti, Nigeria. If excluded, you may still qualify via a spouse or parent born elsewhere.',
              es: 'Excluidos: México, China, India, Filipinas, Vietnam, RD, El Salvador, Honduras, Brasil, Pakistán, Bangladesh, Canadá, RU, Corea, Colombia, Jamaica, Haití, Nigeria. Si tu país está excluido, puedes calificar por cónyuge o padre nacido en otro lugar.'}},
      {id: 'education-or-work', type: 'multi',
       q: {en: 'Your education / work background?', es: '¿Tu educación o experiencia?'},
       help: {en: 'You need EITHER a high-school education OR qualifying work experience.', es: 'Necesitas O secundaria O experiencia calificada.'},
       options: [
         {value: 'hs-diploma', label: {en: 'High school diploma (or 12 yrs of formal education)', es: 'Diploma de secundaria (12 años de educación)'}},
         {value: 'work-exp',   label: {en: '2 years of skilled work experience in the last 5 years', es: '2 años de experiencia calificada en los últimos 5'}},
         {value: 'neither',    label: {en: 'Neither of these', es: 'Ninguna'}}
       ]},
      {id: 'crimes', type: 'yesno',
       q: {en: 'Have you been convicted of any serious crime, including immigration fraud?', es: '¿Has sido condenado por crimen grave, incluyendo fraude migratorio?'},
       help: {en: 'Many crimes are inadmissibility grounds even if you win the lottery.', es: 'Muchos crímenes son base de inadmisibilidad aún ganando la lotería.'}},
      {id: 'medical', type: 'yesno',
       q: {en: 'Do you have any communicable disease or a documented serious mental disorder?', es: '¿Tienes enfermedad transmisible o trastorno mental grave documentado?'},
       help: {en: 'Medical exam will be required if selected. Some conditions are temporary bars.', es: 'Examen médico requerido si te seleccionan. Algunas condiciones son barreras temporales.'}}
    ],
    evaluate: function(a){
      var reasons = [], flags = [];
      if(a.country === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'Your country of birth is on the high-immigration excluded list. You may still qualify via your spouse\'s or parents\' country of birth — check with the State Department\'s DV instructions.', es: 'Tu país está en la lista excluida. Aún puedes calificar por cónyuge o padres — revisa las instrucciones DV.'}], flags: []};
      }
      var ed = Array.isArray(a['education-or-work']) ? a['education-or-work'] : [];
      if(ed.indexOf('neither') !== -1 || ed.length === 0){
        return {verdict: 'not_eligible', reasons: [{en: 'DV requires EITHER a high school diploma OR 2 years of qualifying work experience.', es: 'DV requiere O diploma de secundaria O 2 años de experiencia calificada.'}], flags: []};
      }
      if(a.crimes === 'yes') flags.push({en: 'Criminal record needs lawyer review — even winning the lottery doesn\'t guarantee a visa.', es: 'Récord penal necesita revisión legal — ganar la lotería no garantiza visa.'});
      if(a.medical === 'yes') flags.push({en: 'Some medical conditions trigger consular review. Be prepared with documentation.', es: 'Algunas condiciones médicas activan revisión consular.'});
      if(flags.length === 0){
        return {verdict: 'likely', reasons: [{en: 'Based on your answers, you meet the DV entry requirements. The lottery itself is a random selection of about 1% of applicants.', es: 'Según tus respuestas, cumples los requisitos de entrada. La lotería selecciona aleatoriamente ~1% de solicitantes.'}], flags: []};
      }
      return {verdict: 'unsure', reasons: [{en: 'You can enter the lottery, but the flagged items may affect visa approval if selected.', es: 'Puedes entrar, pero los puntos marcados pueden afectar la aprobación si te seleccionan.'}], flags: flags};
    },
    nextSteps: {
      en: ['Entry is free at dvprogram.state.gov during the annual registration window (typically October).',
           'Submit only ONE entry — duplicates disqualify you.',
           'Save your confirmation number — it\'s the ONLY way to check selection status.',
           'Selection results are published in May. If selected, you have 1 year to complete the visa process.'],
      es: ['Inscripción gratis en dvprogram.state.gov durante la ventana anual (octubre típico).',
           'Solo UNA entrada — duplicados te descalifican.',
           'Guarda tu número de confirmación — única forma de verificar.',
           'Resultados en mayo. Si te seleccionan, 1 año para completar el proceso.']
    }
  },

  h1b: {
    id: 'h1b',
    iconName: 'briefcase', color: '#00b4a8',
    title: {en: 'H-1B sponsorship eligibility', es: 'Elegibilidad de patrocinio H-1B'},
    sub:   {en: 'Specialty occupation work visa', es: 'Visa de trabajo de ocupación especializada'},
    estimatedMinutes: 2,
    steps: [
      {id: 'degree', type: 'yesno',
       q: {en: 'Do you have a bachelor\'s degree or higher (or equivalent foreign credential)?', es: '¿Tienes licenciatura o más (o credencial extranjera equivalente)?'},
       help: {en: 'Required. Foreign degrees often need a credential evaluation.', es: 'Requerido. Títulos extranjeros suelen necesitar evaluación.'}},
      {id: 'specialty', type: 'yesno',
       q: {en: 'Is the offered job a "specialty occupation" requiring a degree in a specific field?', es: '¿El trabajo es "ocupación especializada" que requiere título en campo específico?'},
       help: {en: 'Most software engineering, medicine, accounting, engineering, science roles qualify. Generic management often does not.', es: 'Mayoría de SW eng, medicina, contabilidad, ing, ciencia califican. Gerencia genérica usualmente no.'}},
      {id: 'employer', type: 'yesno',
       q: {en: 'Do you have a U.S. employer willing to sponsor you?', es: '¿Tienes empleador en EE.UU. dispuesto a patrocinarte?'},
       help: {en: 'H-1B requires an employer petition. You cannot self-petition.', es: 'H-1B requiere petición del empleador. No puedes auto-peticionarte.'}},
      {id: 'wage', type: 'yesno',
       q: {en: 'Will the employer pay the prevailing wage for the role + location?', es: '¿El empleador pagará el salario prevaleciente para el rol + ubicación?'},
       help: {en: 'Required by DOL. Lawyer + employer determine the wage tier.', es: 'Requerido por DOL. Abogado + empleador determinan el nivel.'}},
      {id: 'cap-exempt', type: 'yesno',
       q: {en: 'Is the employer cap-exempt (university, government research, non-profit research)?', es: '¿El empleador está exento del límite (universidad, investigación gubernamental, sin fines de lucro)?'},
       help: {en: 'If yes, you skip the H-1B lottery entirely. If no, you need to be selected.', es: 'Si sí, te saltas la lotería. Si no, debes ser seleccionado.'}},
      {id: 'max-out', type: 'yesno',
       q: {en: 'Have you previously held H-1B status for 6+ years total?', es: '¿Has tenido H-1B por 6+ años en total?'},
       help: {en: 'H-1B has a 6-year max unless you have an approved I-140 (extensions beyond 6).', es: 'H-1B tiene máximo 6 años a menos que tengas I-140 aprobado.'}}
    ],
    evaluate: function(a){
      var reasons = [], flags = [];
      if(a.degree === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'H-1B requires at least a bachelor\'s degree (or work-experience equivalency at a 3:1 ratio).', es: 'H-1B requiere al menos licenciatura (o experiencia equivalente 3:1).'}], flags: []};
      }
      if(a.specialty === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'The role must be a "specialty occupation" — degree-required, theoretical knowledge applied.', es: 'El rol debe ser "ocupación especializada" — requiere título, conocimiento teórico aplicado.'}], flags: []};
      }
      if(a.employer === 'no'){
        return {verdict: 'not_eligible', reasons: [{en: 'You need a U.S. employer to file the petition. You cannot self-sponsor H-1B.', es: 'Necesitas empleador en EE.UU. para presentar. No puedes auto-patrocinarte.'}], flags: []};
      }
      if(a['max-out'] === 'yes') flags.push({en: 'You\'re at or past the 6-year max. You need an approved I-140 for extensions beyond 6 years.', es: 'Estás en o pasaste el máximo de 6 años. Necesitas I-140 aprobado.'});
      if(a.wage === 'no') flags.push({en: 'The employer must commit to prevailing wage — if they won\'t, this won\'t fly with DOL.', es: 'Empleador debe pagar salario prevaleciente — si no, no pasará DOL.'});
      if(a['cap-exempt'] === 'no') flags.push({en: 'You\'re subject to the H-1B lottery (~25-30% selection rate). Plan accordingly.', es: 'Estás sujeto a la lotería (~25-30% selección). Planifica.'});
      if(flags.length === 0){
        return {verdict: 'likely', reasons: [{en: 'Based on your answers, you meet the basic H-1B requirements AND appear cap-exempt (university/research) — an employer could file anytime, no lottery.', es: 'Pareces elegible Y exento del límite — tu empleador puede presentar en cualquier momento.'}], flags: []};
      }
      return {verdict: 'unsure', reasons: [{en: 'Based on your answers, the basic requirements match — the flagged items below are about navigating the process.', es: 'Pareces elegible — los puntos marcados son cómo navegar el proceso.'}], flags: flags};
    },
    nextSteps: {
      en: ['Employer files LCA (Labor Condition Application) with DOL.',
           'Employer files Form I-129 with USCIS. Standard fees + premium processing optional ($2,805).',
           'If subject to cap: register in March, lottery selects late March, file petition April.',
           'Once approved, you can start work on October 1 (FY start) or your I-797 effective date.'],
      es: ['Empleador presenta LCA con DOL.',
           'Empleador presenta I-129 con USCIS. Tarifas + procesamiento premium opcional ($2,805).',
           'Si sujeto a límite: registro en marzo, lotería fin de marzo, petición en abril.',
           'Aprobado: empiezas el 1 de octubre o fecha efectiva del I-797.']
    }
  }
};

var eligWizState = null;

function startEligWizard(wizardId){
  var wiz = ELIGIBILITY_WIZARDS[wizardId];
  if(!wiz) return;
  eligWizState = {
    wizardId: wizardId,
    stepIdx: 0,
    answers: {},
    finished: false,
    result: null
  };
  go('eligWiz');
  renderEligWizard();
}

function renderEligWizard(){
  if(!eligWizState) return;
  var wiz = ELIGIBILITY_WIZARDS[eligWizState.wizardId];
  if(!wiz) return;
  var body = document.getElementById('eligWizBody');
  var footer = document.getElementById('eligWizFooter');
  if(!body) return;

  var counter = document.getElementById('eligWizCounter');
  var fill = document.getElementById('eligWizProgressFill');
  if(counter) counter.textContent = eligWizState.finished
    ? (lang==='es' ? 'Resultado' : 'Result')
    : (eligWizState.stepIdx + 1) + ' / ' + wiz.steps.length;
  if(fill) fill.style.width = (eligWizState.finished ? 100 : ((eligWizState.stepIdx) / wiz.steps.length * 100)) + '%';

  if(eligWizState.finished){
    renderEligWizardResult();
    return;
  }

  var step = wiz.steps[eligWizState.stepIdx];
  var input = '';
  // NOTE: no inline onclick / onchange handlers — they conflict with the JS-bound
  // listeners attached below (which were added for reliable cross-environment behavior).
  if(step.type === 'yesno'){
    var pick = eligWizState.answers[step.id];
    input = '<div class="eligOpts">'
      + '<button class="eligOpt eligOptYes'+(pick==='yes'?' eligOptSel':'')+'">'+(lang==='es'?'Sí':'Yes')+'</button>'
      + '<button class="eligOpt eligOptNo'+(pick==='no'?' eligOptSel':'')+'">'+(lang==='es'?'No':'No')+'</button>'
      + '</div>';
  } else if(step.type === 'date'){
    var dv = eligWizState.answers[step.id] || '';
    input = '<input type="date" class="eligDateInput" value="'+dv+'" />';
  } else if(step.type === 'multi'){
    var arr = Array.isArray(eligWizState.answers[step.id]) ? eligWizState.answers[step.id] : [];
    var opts = step.options.map(function(o){
      var sel = arr.indexOf(o.value) !== -1;
      return '<button class="eligMulti'+(sel?' eligMultiSel':'')+'" data-value="'+o.value+'">'+o.label[lang]+'</button>';
    }).join('');
    input = '<div class="eligMultiList">'+opts+'</div>';
  }

  body.innerHTML = ''
    + '<div class="eligWizHead">'
    +   '<div class="eligWizKick">'+(lang==='es'?'PREGUNTA ':'QUESTION ')+(eligWizState.stepIdx + 1)+(lang==='es'?' de ':' of ')+wiz.steps.length+'</div>'
    +   '<div class="eligWizQ">'+step.q[lang]+'</div>'
    +   (step.help ? '<div class="eligWizHelp">'+iconSVG('lightbulb','#1cb0f6',14)+' '+step.help[lang]+'</div>' : '')
    + '</div>'
    + '<div class="eligWizInput">'+input+'</div>';

  // POST-RENDER HANDLER BINDING — more reliable than inline `onchange` attributes.
  // The inline handlers can fail to fire in some WebViews (iOS Safari, some Androids)
  // when the value is set programmatically OR the picker dispatches a change event
  // that doesn't bubble. Binding via addEventListener handles every case.
  var stepId = step.id;
  if(step.type === 'date'){
    var di = body.querySelector('.eligDateInput');
    if(di){
      var fire = function(){ eligWizPick(stepId, di.value); };
      di.addEventListener('change', fire);
      di.addEventListener('input', fire);
      // Also re-bind onchange as a third belt-and-suspenders
      di.onchange = fire;
    }
  } else if(step.type === 'yesno'){
    var yes = body.querySelector('.eligOptYes');
    var no  = body.querySelector('.eligOptNo');
    if(yes) yes.addEventListener('click', function(){ eligWizPick(stepId, 'yes'); });
    if(no)  no.addEventListener('click', function(){ eligWizPick(stepId, 'no'); });
  } else if(step.type === 'multi'){
    body.querySelectorAll('.eligMulti').forEach(function(b){
      b.addEventListener('click', function(){
        eligWizToggleMulti(stepId, b.getAttribute('data-value'));
      });
    });
  }

  if(footer){
    var canBack = eligWizState.stepIdx > 0;
    var canNext = eligWizState.answers[step.id] !== undefined &&
                  !(Array.isArray(eligWizState.answers[step.id]) && eligWizState.answers[step.id].length === 0);
    footer.innerHTML = ''
      + (canBack ? '<button class="eligWizBack" onclick="eligWizBack()" aria-label="Back">←</button>' : '')
      + '<button class="cta eligWizNext" '+(canNext?'':'disabled')+'>'+(lang==='es'?'Siguiente':'Next')+' →</button>';
    // Bind Next button via JS so we can grab the live input value (safety net if
    // the change event never fired)
    var nextBtn = footer.querySelector('.eligWizNext');
    if(nextBtn){
      nextBtn.addEventListener('click', function(){
        if(nextBtn.disabled) return;
        // Safety: pull current date input value in case it didn't get committed
        if(step.type === 'date'){
          var di2 = document.querySelector('.eligDateInput');
          if(di2 && di2.value) eligWizState.answers[step.id] = di2.value;
        }
        eligWizNext();
      });
    }
    var backBtn = footer.querySelector('.eligWizBack');
    if(backBtn) backBtn.addEventListener('click', function(){ eligWizBack(); });
  }
}

function eligWizPick(stepId, value){
  if(!eligWizState) return;
  eligWizState.answers[stepId] = value;
  renderEligWizard();
}

function eligWizToggleMulti(stepId, value){
  if(!eligWizState) return;
  if(!Array.isArray(eligWizState.answers[stepId])) eligWizState.answers[stepId] = [];
  var arr = eligWizState.answers[stepId];
  var idx = arr.indexOf(value);
  if(idx === -1){
    // "none" should be exclusive
    if(value === 'none') arr.length = 0;
    else if(arr.indexOf('none') !== -1) arr.splice(arr.indexOf('none'), 1);
    arr.push(value);
  } else {
    arr.splice(idx, 1);
  }
  renderEligWizard();
}

function eligWizBack(){
  if(eligWizState.stepIdx > 0){
    eligWizState.stepIdx--;
    renderEligWizard();
  }
}

function eligWizNext(){
  var wiz = ELIGIBILITY_WIZARDS[eligWizState.wizardId];
  if(eligWizState.stepIdx >= wiz.steps.length - 1){
    eligWizState.result = wiz.evaluate(eligWizState.answers);
    eligWizState.finished = true;
    if(!user.eligWizardResults) user.eligWizardResults = {};
    user.eligWizardResults[eligWizState.wizardId] = {
      result: eligWizState.result,
      takenAt: new Date().toISOString()
    };
    saveUser();
    renderEligWizard();
  } else {
    eligWizState.stepIdx++;
    renderEligWizard();
  }
}

function exitEligWizard(){
  eligWizState = null;
  go('home');
}

function renderEligWizardResult(){
  var wiz = ELIGIBILITY_WIZARDS[eligWizState.wizardId];
  var r = eligWizState.result;
  var body = document.getElementById('eligWizBody');
  var footer = document.getElementById('eligWizFooter');
  if(!body || !r) return;

  // Wording note: these are requirement CHECKPOINTS based on the user's own
  // answers — never an eligibility determination (that's legal judgment).
  var verdictClass, verdictTxt, verdictSub;
  if(r.verdict === 'likely'){
    verdictClass = 'eligVerdictGood';
    verdictTxt = lang==='es' ? '✓ Tus respuestas coinciden con los requisitos básicos' : '✓ Your answers match the basic requirements';
    verdictSub = lang==='es' ? 'Según lo que respondiste. No es una determinación legal.' : 'Based on what you answered. Not a legal determination.';
  } else if(r.verdict === 'unsure'){
    verdictClass = 'eligVerdictMid';
    verdictTxt = lang==='es' ? '△ Algunos puntos necesitan revisión' : '△ Some items need review';
    verdictSub = lang==='es' ? 'Según tus respuestas, hay factores que un profesional debería revisar.' : 'Based on your answers, some factors are worth reviewing with a professional.';
  } else {
    verdictClass = 'eligVerdictBad';
    verdictTxt = lang==='es' ? '✗ Un requisito básico no coincide' : '✗ A basic requirement doesn\'t match';
    verdictSub = lang==='es' ? 'Según tus respuestas. Un abogado puede confirmar si hay excepciones.' : 'Based on your answers. An attorney can confirm whether exceptions apply.';
  }

  var reasonsHtml = (r.reasons || []).map(function(reason){
    return '<div class="eligReasonItem">'+iconSVG('check','#1c6b35',14)+'<div>'+reason[lang]+'</div></div>';
  }).join('');
  var flagsHtml = (r.flags || []).map(function(flag){
    return '<div class="eligFlagItem">'+iconSVG('warning','#a05000',14)+'<div>'+flag[lang]+'</div></div>';
  }).join('');

  var nextStepsHtml = '';
  if(r.verdict !== 'not_eligible' && wiz.nextSteps){
    var stepsArr = wiz.nextSteps[lang] || wiz.nextSteps.en;
    nextStepsHtml = '<div class="eligNextSteps">'
      + '<div class="eligNextLbl">'+(lang==='es'?'Próximos pasos':'Next steps')+'</div>'
      + '<ol class="eligNextList">'+stepsArr.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol>'
      + '</div>';
  }

  var attorneyClose = '<div class="eligAttorneyClose">'
    + iconSVG('scales', '#1d1d22', 18)
    + '<div>'
    + '<div class="eligAttorneyTitle">'+(lang==='es'?'Hablar con un abogado de inmigración':'Talk to an immigration attorney')+'</div>'
    + '<div class="eligAttorneySub">'+(lang==='es'
        ? 'Esta evaluación es educativa. Cada caso depende de detalles que un abogado licenciado debe revisar antes de presentar cualquier petición.'
        : 'This check is educational. Every case depends on details only a licensed attorney should review before filing anything.')+'</div>'
    + '</div>'
    + '</div>';

  var askCamiCtx = (lang==='es'
    ? 'Me hicieron un test de elegibilidad para ' + wiz.title.en + ' y el resultado fue: ' + r.verdict + '. ¿Qué debería saber?'
    : 'I just took the ' + wiz.title.en + ' eligibility check and the result was: ' + r.verdict + '. What should I know?').replace(/'/g, "\\'");

  body.innerHTML = ''
    + '<div class="eligVerdictCard '+verdictClass+'">'
    +   '<div class="eligVerdictIcon">'+iconSVG(wiz.iconName, wiz.color, 28)+'</div>'
    +   '<div class="eligVerdictTitle">'+verdictTxt+'</div>'
    +   '<div class="eligVerdictSub">'+verdictSub+'</div>'
    + '</div>'
    + (reasonsHtml ? '<div class="eligSection"><div class="eligSecLbl">'+(lang==='es'?'Por qué':'Why')+'</div>'+reasonsHtml+'</div>' : '')
    + (flagsHtml ? '<div class="eligSection"><div class="eligSecLbl">'+(lang==='es'?'⚠️ Atención':'⚠️ Attention')+'</div>'+flagsHtml+'</div>' : '')
    + nextStepsHtml
    + attorneyClose
    + (CAMI_AVAILABLE
        ? '<button class="askCamiBtn eligAskCami" onclick="askCami(\''+askCamiCtx+'\')">'+iconSVG('chevron','#fff',12)+' '+(lang==='es'?'Hablarle a Cami sobre esto':'Talk to Cami about this')+'</button>'
        : '');

  if(footer){
    footer.innerHTML = '<button class="cta eligWizDone" onclick="exitEligWizard()">'+(lang==='es'?'Listo':'Done')+'</button>';
  }
}

function renderEligPicker(){
  // Top-level picker view: choose which eligibility check to run
  var list = document.getElementById('eligPickerList');
  if(!list) return;
  var ids = Object.keys(ELIGIBILITY_WIZARDS);
  list.innerHTML = ids.map(function(id){
    var w = ELIGIBILITY_WIZARDS[id];
    var prior = user.eligWizardResults && user.eligWizardResults[id];
    var priorBadge = '';
    if(prior){
      var v = prior.result.verdict;
      var lblTxt = v === 'likely' ? (lang==='es'?'Probable':'Likely') : v === 'unsure' ? (lang==='es'?'Posible':'Possible') : (lang==='es'?'No':'No');
      priorBadge = '<span class="eligPriorBadge eligPrior-'+v+'">'+lblTxt+'</span>';
    }
    return '<div class="eligPickRow" onclick="startEligWizard(\''+id+'\')">'
      + '<div class="eligPickIco" style="background:'+w.color+'22">'+iconSVG(w.iconName, w.color, 22)+'</div>'
      + '<div class="eligPickMain">'
      +   '<div class="eligPickTitle">'+w.title[lang]+priorBadge+'</div>'
      +   '<div class="eligPickSub">'+w.sub[lang]+' · '+(lang==='es'?'~':'~')+w.estimatedMinutes+' min</div>'
      + '</div>'
      + '<div class="chev"></div>'
      + '</div>';
  }).join('');
  populateIcons();
}

// ===== HELP / FAQ =====
var FAQ_ENTRIES = [
  {
    q:{en:'What is Camino?', es:'¿Qué es Camino?'},
    a:{en:'Camino is an educational study + coaching app for the U.S. immigration journey. We help you prepare for the civics test, understand your visa path, and organize your documents. We are not a law firm.',
       es:'Camino es una app educativa de estudio y orientación para el camino de inmigración en EE.UU. Te ayudamos a preparar el examen de cívica, entender tu vía de visa y organizar tus documentos. No somos un bufete.'}
  },
  {
    q:{en:'Is Camino legal advice?', es:'¿Camino es asesoría legal?'},
    a:{en:'No. Camino is educational only. For decisions about your specific case, please consult a licensed immigration attorney or a BIA-accredited representative.',
       es:'No. Camino es solo educativo. Para decisiones sobre tu caso específico, consulta a un abogado licenciado de inmigración o un representante acreditado por BIA.'}
  },
  {
    q:{en:'How does the 7-day free trial work?', es:'¿Cómo funciona la prueba gratis de 7 días?'},
    a:{en:'You get full Plus access for 7 days. Cancel before day 7 and you\'re not charged. Otherwise, your subscription auto-renews at your selected price. You can cancel anytime in Me → Camino Plus.',
       es:'Tienes acceso completo a Plus por 7 días. Cancela antes del día 7 y no se te cobra. Si no, tu suscripción se renueva al precio que elegiste. Puedes cancelar en Yo → Camino Plus.'}
  },
  {
    q:{en:'How do I cancel my subscription?', es:'¿Cómo cancelo mi suscripción?'},
    a:{en:'Go to Me tab → Camino Plus banner → Manage → Cancel Plus. You keep access until the end of your paid period.',
       es:'Ve a Yo → banner de Camino Plus → Administrar → Cancelar Plus. Mantienes acceso hasta el final del período.'}
  },
  {
    q:{en:'What does Camino Plus include?', es:'¿Qué incluye Camino Plus?'},
    a:{en:'Unlimited interview practice, unlimited mock tests, streak freezes (2/month), and more.',
       es:'Práctica de entrevista ilimitada, exámenes ilimitados, congelamientos de racha (2/mes) y más.'}
  },
  {
    q:{en:'How do I prepare for the civics test?', es:'¿Cómo me preparo para el examen de cívica?'},
    a:{en:'Use the Learn tab to go through all 100 USCIS questions in 4 units. Take daily flashcards. Practice with mock tests. When ready, use the interview simulator to practice the real USCIS officer experience.',
       es:'Usa Aprender para pasar las 100 preguntas en 4 unidades. Practica con tarjetas diarias. Toma exámenes de práctica. Cuando estés listo, usa el simulador de entrevista para practicar la real.'}
  },
  {
    q:{en:'Why are some questions difficult to pass with voice?', es:'¿Por qué algunas preguntas son difíciles con voz?'},
    a:{en:'The voice recognition (Web Speech API) varies in accent handling. If Cami marked your answer wrong but you said it right, tap "I said it right — mark correct" on the verdict card.',
       es:'El reconocimiento de voz varía con acentos. Si Cami marcó mal una respuesta correcta, toca "Lo dije bien — marcar correcto" en la tarjeta de resultado.'}
  },
  {
    q:{en:'How accurate are the timeline estimates?', es:'¿Qué tan precisos son los plazos?'},
    a:{en:'Estimates are based on current USCIS processing times and Visa Bulletin trends. Real wait times vary by case, country of origin, and policy changes. These are educational projections, not promises.',
       es:'Los estimados se basan en plazos actuales de USCIS y tendencias del Boletín de Visas. Los tiempos reales varían por caso, país y cambios de política. Son proyecciones educativas, no promesas.'}
  },
  {
    q:{en:'How do I track my case status?', es:'¿Cómo rastreo mi caso?'},
    a:{en:'Go to Me → USCIS case status. Save your receipt number. Tap "Check on USCIS.gov" to open the official status page (USCIS doesn\'t have a public API for in-app status).',
       es:'Ve a Yo → Estado de caso USCIS. Guarda tu número de recibo. Toca "Ver en USCIS.gov" para abrir la página oficial.'}
  },
  {
    q:{en:'What is the N-400 walkthrough?', es:'¿Qué es la guía del N-400?'},
    a:{en:'A free educational guide that walks you through the 8 main sections of Form N-400 — what USCIS asks in each, why it matters, tips, and the documents to gather — so you understand the form before you fill out the official version yourself. It is educational only and not legal advice.',
       es:'Una guía educativa gratuita que te lleva por las 8 secciones principales del N-400 — qué pide USCIS en cada una, por qué importa, consejos, y los documentos a reunir — para que entiendas el formulario antes de llenar tú mismo la versión oficial. Es solo educativa, no asesoría legal.'}
  },
  {
    q:{en:'Is my data private?', es:'¿Mis datos son privados?'},
    a:{en:'All your profile, progress, and settings are stored only on your device. We do not sell or share data with third parties, and we run no servers that receive your information.',
       es:'Tu perfil, progreso y configuración se guardan solo en tu dispositivo. No vendemos ni compartimos datos, y no tenemos servidores que reciban tu información.'}
  },
  {
    q:{en:'Can I use Camino in multiple languages?', es:'¿Puedo usar Camino en varios idiomas?'},
    a:{en:'Yes — English and Spanish are fully supported, and you can switch anytime in Me → Language.',
       es:'Sí — inglés y español son completos, y puedes cambiar cuando quieras en Yo → Idioma.'}
  },
  {
    q:{en:'What is a streak freeze?', es:'¿Qué es un congelamiento de racha?'},
    a:{en:'A Plus benefit: if you miss a day of study, we automatically use a freeze to protect your streak. You get 2 freezes per month, refreshed monthly.',
       es:'Un beneficio Plus: si pierdes un día, usamos un congelamiento para proteger tu racha. Tienes 2 al mes.'}
  },
  {
    q:{en:'How do I delete all my data?', es:'¿Cómo borro todos mis datos?'},
    a:{en:'Me tab → Clear all data. This wipes everything stored on this device.',
       es:'Yo → Borrar todos los datos. Esto borra todo en tu dispositivo.'}
  },
  {
    q:{en:'Can I get a refund?', es:'¿Puedo obtener un reembolso?'},
    a:{en:'Refunds are handled by Apple per their App Store policy. Visit reportaproblem.apple.com to request a refund within 90 days of purchase.',
       es:'Los reembolsos los maneja Apple según su política. Visita reportaproblem.apple.com dentro de 90 días.'}
  },
  {
    q:{en:'How much does Camino Plus cost?', es:'¿Cuánto cuesta Camino Plus?'},
    a:{en:'$7.99/month or $49.99/year (saves ~48% vs. monthly). Try free for 7 days, cancel anytime.',
       es:'$7.99/mes o $49.99/año (~48% de descuento vs. mensual). Prueba gratis 7 días, cancela cuando quieras.'}
  }
];

var faqExpanded = {};

function renderHelpFAQ(){
  var body = document.getElementById('helpBody');
  if(!body) return;
  var html = '<div class="helpHead">'
    + '<div class="helpTitle">'+(lang==='es'?'Ayuda y preguntas':'Help & FAQ')+'</div>'
    + '<div class="helpSub">'+(lang==='es'?'Lo más común. Si no encuentras tu pregunta, escríbenos abajo.':"The basics. If you don't see your question, drop us a note below.")+'</div>'
    + '</div>';
  FAQ_ENTRIES.forEach(function(entry, i){
    var open = !!faqExpanded[i];
    html += '<div class="faqItem '+(open?'faqOpen':'')+'">'
      + '<button class="faqQ" onclick="toggleFAQ('+i+')">'
      +   '<span class="faqQText">'+entry.q[lang]+'</span>'
      +   '<span class="faqChev">'+(open?'−':'+')+'</span>'
      + '</button>'
      + (open ? '<div class="faqA">'+entry.a[lang]+'</div>' : '')
      + '</div>';
  });
  if(CAMI_AVAILABLE){
    html += '<button class="askCamiBtn helpAskCami" onclick="askCami(\''+(lang==='es'?'Tengo una pregunta sobre la app':'I have a question about the app').replace(/'/g,"\\'")+'\')">'
      + iconSVG('chevron','#fff',12) + ' ' + (lang==='es'?'Preguntarle a Cami':'Ask Cami')
      + '</button>';
  }
  // Feedback form
  html += '<div class="helpFeedback">'
    + '<div class="helpFeedbackTitle">'+(lang==='es'?'Comentarios':'Send feedback')+'</div>'
    + '<div class="helpFeedbackSub">'+(lang==='es'?'¿Qué podemos hacer mejor?':'What could we do better?')+'</div>'
    + '<textarea class="helpFeedbackInput" id="helpFeedbackText" placeholder="'+(lang==='es'?'Tu mensaje…':'Your message…')+'"></textarea>'
    + '<button class="cta helpFeedbackSend" onclick="sendFeedback()">'+(lang==='es'?'Enviar':'Send')+'</button>'
    + '<div class="helpFeedbackSub" style="margin-top:10px;">'+(lang==='es'?'O escríbenos directo:':'Or email us directly:')+' <a href="mailto:'+SUPPORT_EMAIL+'">'+SUPPORT_EMAIL+'</a></div>'
    + '</div>';
  body.innerHTML = html;
  populateIcons();
}

function toggleFAQ(i){
  faqExpanded[i] = !faqExpanded[i];
  renderHelpFAQ();
}

var SUPPORT_EMAIL = 'cruiz@rumostrategies.com';

function sendFeedback(){
  var t = (document.getElementById('helpFeedbackText')||{}).value || '';
  if(!t.trim()){
    toast(lang==='es' ? 'Escribe tu comentario primero' : 'Write your feedback first');
    return;
  }
  // Hand off to the user's mail app — this actually reaches us.
  var subject = encodeURIComponent('Camino feedback');
  var body = encodeURIComponent(t.trim() + '\n\n—\nCamino v1.0 · ' + (Store.isNative() ? 'iOS' : 'web') + ' · ' + lang);
  window.location.href = 'mailto:' + SUPPORT_EMAIL + '?subject=' + subject + '&body=' + body;
  var el = document.getElementById('helpFeedbackText');
  if(el) el.value = '';
  toast(lang==='es' ? 'Abriendo tu app de correo…' : 'Opening your mail app…');
}

// ===== TRIAL OFFER (post-onboarding iOS-style paywall) =====
var trialOfferSelectedPlan = 'annual';

function renderTrialOffer(){
  var body = document.getElementById('trialOfferBody');
  if(!body) return;

  var name = (user.name || '').trim() || (lang==='es' ? 'amigo/a' : 'friend');
  var pricing = PLUS_PRICING[trialOfferSelectedPlan];
  var afterTrialPrice = Store.priceString(trialOfferSelectedPlan);
  var afterTrialPeriod = pricing.period[lang];

  var features = [
    {iconName:'mic', color:'#1cb0f6',
     title:{en:'Unlimited interview practice', es:'Entrevistas ilimitadas'},
     sub:{en:'Realistic simulation that scores your answers · free plan: 3/day', es:'Simulación realista que califica tus respuestas · gratis: 3/día'}},
    {iconName:'target', color:'#ec4f93',
     title:{en:'Unlimited mock tests', es:'Exámenes ilimitados'},
     sub:{en:'Free plan caps at 3 per day', es:'Gratis: 3 por día'}},
    {iconName:'flag', color:'#12b981',
     title:{en:'Unit 3: Symbols & Geography', es:'Unidad 3: Símbolos y Geografía'},
     sub:{en:'Extra civics unit exclusive to Plus', es:'Unidad extra de cívica exclusiva de Plus'}},
    {iconName:'folder', color:'#5e5ce6',
     title:{en:'N-400 organizer', es:'Organizador N-400'},
     sub:{en:'Gather your answers for the official form, on your device', es:'Reúne tus respuestas para el formulario oficial, en tu dispositivo'}},
    {iconName:'bolt', color:'#ff4d3a',
     title:{en:'Streak freeze + unlimited hearts', es:'Congelar racha + corazones ilimitados'},
     sub:{en:'Never lose your streak to a busy day', es:'No pierdas tu racha por un día ocupado'}},
  ];

  var featuresHtml = '';
  features.forEach(function(f){
    var soonPill = f.comingSoon ? '<span class="upgFeatComingSoon">'+(lang==='es'?'Pronto':'Soon')+'</span>' : '';
    featuresHtml += '<div class="trialFeatureRow">'
      + '<div class="trialFeatureIco" style="background:'+f.color+'1a;">'+iconSVG(f.iconName, f.color, 22)+'</div>'
      + '<div class="trialFeatureMain">'
      +   '<div class="trialFeatureTitle">'+f.title[lang]+soonPill+'</div>'
      +   '<div class="trialFeatureSub">'+f.sub[lang]+'</div>'
      + '</div>'
      + '<div class="trialFeatureCheck">'+iconSVG('check','#00b4a8',16)+'</div>'
      + '</div>';
  });

  var pricingHtml = ''
    + '<div class="trialPlanSwitch">'
    +   '<button class="trialPlanBtn'+(trialOfferSelectedPlan==='annual'?' trialPlanSel':'')+'" onclick="trialOfferSelectPlan(\'annual\')">'
    +     '<span class="trialPlanTag">'+(lang==='es'?'AHORRA 48%':'SAVE 48%')+'</span>'
    +     '<div class="trialPlanLbl">'+(lang==='es'?'Anual':'Annual')+'</div>'
    +     '<div class="trialPlanPrice">'+Store.priceString('annual')+'<span class="trialPlanPer">/'+PLUS_PRICING.annual.period[lang]+'</span></div>'
    +     '<div class="trialPlanEquiv">~$'+PLUS_PRICING.annual.monthlyEquiv.toFixed(2)+' / '+(lang==='es'?'mes':'mo')+'</div>'
    +   '</button>'
    +   '<button class="trialPlanBtn'+(trialOfferSelectedPlan==='monthly'?' trialPlanSel':'')+'" onclick="trialOfferSelectPlan(\'monthly\')">'
    +     '<div class="trialPlanLbl">'+(lang==='es'?'Mensual':'Monthly')+'</div>'
    +     '<div class="trialPlanPrice">'+Store.priceString('monthly')+'<span class="trialPlanPer">/'+PLUS_PRICING.monthly.period[lang]+'</span></div>'
    +     '<div class="trialPlanEquiv">'+(lang==='es'?'sin compromiso':'no commitment')+'</div>'
    +   '</button>'
    + '</div>';

  // App Store-required disclosure text
  var autoRenewText = lang==='es'
    ? 'Después de tu prueba gratis de 7 días, tu suscripción se renueva automáticamente a ' + afterTrialPrice + '/' + afterTrialPeriod + ' a menos que la canceles al menos 24 horas antes del final del período de prueba. Puedes administrar y cancelar tu suscripción en los Ajustes de tu cuenta de App Store en cualquier momento.'
    : 'After your 7-day free trial, your subscription auto-renews at ' + afterTrialPrice + '/' + afterTrialPeriod + ' unless canceled at least 24 hours before the end of the trial period. You can manage and cancel your subscription at any time in your App Store account settings.';

  body.innerHTML = ''
    + '<div class="trialHero">'
    +   '<div class="trialCami">'+camiPlusSVG()+'</div>'
    +   '<div class="trialBrandRow"><span class="trialBrand">Camino</span><span class="trialPlusTag">PLUS</span></div>'
    +   '<div class="trialHeadline">'+(lang==='es'?('Bienvenido/a, '+name):('Welcome, '+name))+'</div>'
    +   '<div class="trialTagline">'+(lang==='es'?'Tu camino de inmigración, completo.':'Your immigration journey, in one app.')+'</div>'
    +   '<div class="trialSubhead">'+(lang==='es'
          ? 'Empieza tu prueba gratis de 7 días · cancela cuando quieras'
          : 'Start your 7-day free trial · cancel anytime')+'</div>'
    + '</div>'
    + '<div class="trialPad">'
    +   '<div class="trialFeatures">'+featuresHtml+'</div>'
    +   pricingHtml
    +   '<button class="cta trialCta" onclick="openPurchaseSheet()">'+(lang==='es'?'Empezar prueba gratis':'Start free trial')+'</button>'
    +   '<button class="trialSkip" onclick="skipTrialOffer()">'+(lang==='es'?'Continuar con el plan gratis':'Continue with free plan')+'</button>'
    +   '<div class="trialFineprint">'+autoRenewText+'</div>'
    +   '<div class="trialLegalRow">'
    +     '<button class="trialLegalLink" onclick="showTermsModal()">'+(lang==='es'?'Términos':'Terms')+'</button>'
    +     '<span class="trialLegalSep">·</span>'
    +     '<button class="trialLegalLink" onclick="showPrivacyNote()">'+(lang==='es'?'Privacidad':'Privacy')+'</button>'
    +     '<span class="trialLegalSep">·</span>'
    +     '<button class="trialLegalLink" onclick="restorePurchases()">'+(lang==='es'?'Restaurar compras':'Restore purchases')+'</button>'
    +   '</div>'
    + '</div>';
}

function trialOfferSelectPlan(planCode){
  trialOfferSelectedPlan = planCode;
  renderTrialOffer();
}

function skipTrialOffer(){
  user.plan = 'free';
  saveUser();
  renderAll();
  go('home');
  toast(lang==='es' ? 'Continúas con el plan gratis · puedes mejorar en cualquier momento' : 'Continuing with the free plan · upgrade anytime');
  maybeOfferTutorial();
}

// ===== iOS-STYLE PURCHASE CONFIRMATION SHEET =====
function openPurchaseSheet(){
  var sheet = document.getElementById('purchaseSheet');
  var card = document.getElementById('purchaseSheetCard');
  if(!sheet || !card) return;
  var pricing = PLUS_PRICING[trialOfferSelectedPlan];
  var afterTrialPrice = Store.priceString(trialOfferSelectedPlan);
  var afterTrialPeriod = pricing.period[lang];
  var planName = (lang==='es'
    ? (trialOfferSelectedPlan==='annual'?'Anual':'Mensual')
    : (trialOfferSelectedPlan==='annual'?'Annual':'Monthly'));

  card.innerHTML = ''
    + '<div class="purchaseSheetHandle"></div>'
    + '<div class="purchaseSheetHead">'
    +   '<div class="purchaseSheetTitle">'+(lang==='es'?'Confirmar suscripción':'Confirm Subscription')+'</div>'
    +   '<div class="purchaseSheetApp">Camino · Camino Plus</div>'
    + '</div>'
    + '<div class="purchaseSheetRow">'
    +   '<div class="purchaseSheetLbl">'+(lang==='es'?'Plan':'Plan')+'</div>'
    +   '<div class="purchaseSheetVal">Camino Plus · '+planName+'</div>'
    + '</div>'
    + '<div class="purchaseSheetRow">'
    +   '<div class="purchaseSheetLbl">'+(lang==='es'?'Prueba gratis':'Free trial')+'</div>'
    +   '<div class="purchaseSheetVal trialBadge">7 '+(lang==='es'?'días':'days')+'</div>'
    + '</div>'
    + '<div class="purchaseSheetRow">'
    +   '<div class="purchaseSheetLbl">'+(lang==='es'?'Luego':'Then')+'</div>'
    +   '<div class="purchaseSheetVal">'+afterTrialPrice+' / '+afterTrialPeriod+'</div>'
    + '</div>'
    + '<div class="purchaseSheetNote">'+(lang==='es'
        ? 'Hoy no se te cobra. Te recordaremos 2 días antes del final de tu prueba.'
        : 'You won\'t be charged today. We\'ll remind you 2 days before your trial ends.')+'</div>'
    + '<button class="cta purchaseSheetCta" onclick="confirmTrialPurchase()">'+(lang==='es'?'Confirmar — Toca para suscribirte':'Confirm — Tap to Subscribe')+'</button>'
    + '<button class="purchaseSheetCancel" onclick="closePurchaseSheet()">'+(lang==='es'?'Cancelar':'Cancel')+'</button>';

  sheet.style.display = '';
  setTimeout(function(){ card.classList.add('purchaseSheetIn'); }, 10);
}

function closePurchaseSheet(){
  var sheet = document.getElementById('purchaseSheet');
  var card = document.getElementById('purchaseSheetCard');
  if(!sheet || !card) return;
  card.classList.remove('purchaseSheetIn');
  setTimeout(function(){ sheet.style.display = 'none'; }, 220);
}

function confirmTrialPurchase(){
  closePurchaseSheet();
  if(!Store.isNative()){
    // Web preview — mock: Face-ID-style flash, then grant a local trial (unchanged behavior).
    showConfirmedFlash();
    setTimeout(function(){ startFreeTrial(trialOfferSelectedPlan); }, 800);
    return;
  }
  // Native — real StoreKit purchase via RevenueCat (StoreKit shows its own sheet).
  Store.purchase(trialOfferSelectedPlan).then(function(ok){
    if(!ok) return; // cancelled or failed
    showConfirmedFlash();
    user.planSelected = trialOfferSelectedPlan; saveUser();
    setTimeout(function(){
      renderAll(); go('home');
      toast(lang==='es' ? '¡Bienvenido a Camino Plus! 7 días gratis.' : 'Welcome to Camino Plus! 7 days free.');
      setTimeout(maybeOfferTutorial, 1500);
    }, 800);
  });
}

function showConfirmedFlash(){
  var existing = document.getElementById('confirmedFlash');
  if(existing) existing.remove();
  var f = document.createElement('div');
  f.id = 'confirmedFlash';
  f.className = 'confirmedFlash';
  f.innerHTML = '<div class="confirmedFlashIco">'+iconSVG('check','#fff',38)+'</div>'
    + '<div class="confirmedFlashText">'+(lang==='es'?'¡Listo!':'Done!')+'</div>';
  document.body.appendChild(f);
  setTimeout(function(){ f.classList.add('confirmedFlashIn'); }, 10);
  setTimeout(function(){ f.remove(); }, 1200);
}

function restorePurchases(){
  if(!Store.isNative()){
    toast(lang==='es' ? 'Restaurar compras funciona en la app de iOS' : 'Restore purchases works in the iOS app');
    return;
  }
  Store.restore();
}

function showPrivacyNote(){
  // Simple in-app modal — would link to a real privacy policy page on launch
  var existing = document.getElementById('disclaimerModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.className = 'disclaimerOverlay';
  var text = lang==='es'
    ? [
        'Camino guarda tu perfil, progreso de estudio y configuraciones **solo en tu dispositivo** (localStorage del navegador).',
        'Tus datos nunca salen de tu dispositivo — no tenemos servidores que los reciban.',
        'No vendemos ni compartimos datos personales con terceros.',
        'No usamos analíticas de terceros que rastreen tu actividad.',
        'Para más información o para borrar todos tus datos, ve a Yo → Borrar todos los datos.'
      ]
    : [
        'Camino stores your profile, study progress, and settings **only on your device** (browser localStorage).',
        'Your data never leaves your device — we have no servers that receive it.',
        'We do not sell or share personal data with third parties.',
        'We do not use third-party analytics that track your activity.',
        'For more info or to delete all your data, go to Me → Clear all data.'
      ];
  var bullets = text.map(function(b){
    var html = b.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return '<li>'+html+'</li>';
  }).join('');
  modal.innerHTML = ''
    + '<div class="disclaimerCard">'
    + '  <div class="disclaimerHead">'
    + '    <div class="disclaimerIco">'+iconSVG('shield','#00b4a8',26)+'</div>'
    + '    <div class="disclaimerTitle">'+(lang==='es'?'Política de privacidad':'Privacy Policy')+'</div>'
    + '  </div>'
    + '  <ul class="disclaimerBody">'+bullets+'</ul>'
    + '  <button class="cta disclaimerCta" onclick="closeDisclaimerModal()">'+(lang==='es'?'Cerrar':'Close')+'</button>'
    + '</div>';
  document.body.appendChild(modal);
}

// Subscription Terms of Use (EULA) — required on the paywall by App Store 3.1.2.
function showTermsModal(){
  var existing = document.getElementById('disclaimerModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.className = 'disclaimerOverlay';
  var text = lang==='es'
    ? [
        'Camino Plus es una suscripción auto-renovable: **$7.99/mes** o **$49.99/año**, con 7 días de prueba gratis para nuevos suscriptores.',
        'El pago se carga a tu cuenta de Apple al confirmar la compra. La suscripción se **renueva automáticamente** salvo que la canceles al menos 24 horas antes del fin del periodo.',
        'Administra o cancela en cualquier momento en Ajustes → [tu nombre] → Suscripciones. Los reembolsos los gestiona Apple en reportaproblem.apple.com.',
        'Camino es **software de autoayuda educativo**. No es un bufete, **no da asesoría legal**, no determina elegibilidad, y usarlo **no crea una relación abogado-cliente**. Sus herramientas de documentos solo registran tus propias respuestas, textualmente, bajo tu dirección.',
        'La app se ofrece **"tal cual", sin garantías** de ningún tipo — incluida la exactitud del contenido o cualquier resultado migratorio. El contenido puede cambiar; verifica siempre con fuentes oficiales (uscis.gov).',
        'En la máxima medida permitida por la ley, la responsabilidad total de Camino se **limita al monto que pagaste** por la suscripción en los últimos 12 meses.',
        'El uso de la app se rige por el Acuerdo de Licencia estándar de Apple (EULA): <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener">apple.com/legal/…/stdeula</a>. Términos completos: <a href="https://rumoave.github.io/camino/terms.html" target="_blank" rel="noopener">rumoave.github.io/camino/terms</a>',
        'Preguntas: **cruiz@rumostrategies.com**'
      ]
    : [
        'Camino Plus is an auto-renewable subscription: **$7.99/month** or **$49.99/year**, with a 7-day free trial for new subscribers.',
        'Payment is charged to your Apple account at purchase confirmation. The subscription **renews automatically** unless cancelled at least 24 hours before the period ends.',
        'Manage or cancel anytime in Settings → [your name] → Subscriptions. Refunds are handled by Apple at reportaproblem.apple.com.',
        'Camino is **educational self-help software**. It is not a law firm, **does not provide legal advice**, does not determine eligibility, and using it **does not create an attorney-client relationship**. Its document tools only record your own answers, verbatim, at your direction.',
        'The app is provided **"as is," without warranties** of any kind — including the accuracy of content or any immigration outcome. Content may change; always verify with official sources (uscis.gov).',
        'To the fullest extent permitted by law, Camino\'s total liability is **limited to the amount you paid** for the subscription in the past 12 months.',
        'Use of the app is governed by Apple\'s standard Licensed Application End User License Agreement (EULA): <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener">apple.com/legal/…/stdeula</a>. Full terms: <a href="https://rumoave.github.io/camino/terms.html" target="_blank" rel="noopener">rumoave.github.io/camino/terms</a>',
        'Questions: **cruiz@rumostrategies.com**'
      ];
  var bullets = text.map(function(b){
    var html = b.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return '<li>'+html+'</li>';
  }).join('');
  modal.innerHTML = ''
    + '<div class="disclaimerCard">'
    + '  <div class="disclaimerHead">'
    + '    <div class="disclaimerIco">'+iconSVG('scales','#84807a',26)+'</div>'
    + '    <div class="disclaimerTitle">'+(lang==='es'?'Términos de uso':'Terms of Use')+'</div>'
    + '  </div>'
    + '  <ul class="disclaimerBody">'+bullets+'</ul>'
    + '  <button class="cta disclaimerCta" onclick="closeDisclaimerModal()">'+(lang==='es'?'Cerrar':'Close')+'</button>'
    + '</div>';
  document.body.appendChild(modal);
}

var PLUS_FEATURES = [
  {iconName:'mic',       color:'#1cb0f6', title:{en:'Unlimited interview practice', es:'Entrevistas ilimitadas'}, sub:{en:'Realistic simulation that scores your answers · free plan: 3/day', es:'Simulación realista que califica tus respuestas · gratis: 3/día'}},
  {iconName:'target',    color:'#ec4f93', title:{en:'Unlimited mock tests',     es:'Exámenes ilimitados'},  sub:{en:'Free plan caps at 3 per day', es:'Gratis: 3 por día'}},
  {iconName:'flag',      color:'#12b981', title:{en:'Unit 3: Symbols & Geography', es:'Unidad 3: Símbolos y Geografía'}, sub:{en:'Extra civics unit exclusive to Plus', es:'Unidad extra de cívica exclusiva de Plus'}},
  {iconName:'folder',    color:'#5e5ce6', title:{en:'N-400 organizer', es:'Organizador N-400'}, sub:{en:'Gather your answers for the official form, on your device', es:'Reúne tus respuestas para el formulario oficial, en tu dispositivo'}},
  {iconName:'bolt',      color:'#ff4d3a', title:{en:'Streak freeze + unlimited hearts', es:'Congelar racha + corazones ilimitados'}, sub:{en:'Never lose your streak to a busy day', es:'No pierdas tu racha por un día ocupado'}},
];

function camiPlusSVG(){
  // Cami with a gold "crown" / sparkle for the Plus hero
  return '<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<ellipse cx="50" cy="68" rx="24" ry="26" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<ellipse cx="34" cy="64" rx="11" ry="20" fill="#ffc83d" stroke="#1d1d22" stroke-width="3" transform="rotate(-18 34 64)"/>'
    + '<ellipse cx="22" cy="48" rx="8" ry="14" fill="#ffc83d" stroke="#1d1d22" stroke-width="3" transform="rotate(35 22 48)"/>'
    + '<circle cx="56" cy="36" r="20" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<polygon points="44,15 48,22 56,18 56,26 64,22 60,30" fill="#ffc83d" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '<ellipse cx="63" cy="31" rx="7" ry="9" fill="#ffffff"/>'
    + '<circle cx="63" cy="33" r="3" fill="#1d1d22"/>'
    + '<circle cx="64" cy="32" r="1" fill="#ffffff"/>'
    + '<polygon points="73,38 84,34 73,44" fill="#ff9b21" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '<line x1="44" y1="92" x2="40" y2="100" stroke="#ff9b21" stroke-width="4" stroke-linecap="round"/>'
    + '<line x1="56" y1="92" x2="60" y2="100" stroke="#ff9b21" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M 50 42 Q 56 38 62 42" stroke="#1d1d22" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<g opacity=".9">'
    +   '<polygon points="14,18 16,12 18,18 24,20 18,22 16,28 14,22 8,20" fill="#ffc83d"/>'
    +   '<polygon points="84,12 85,8 86,12 90,13 86,14 85,18 84,14 80,13" fill="#ffc83d"/>'
    + '</g>'
    + '</svg>';
}

var upgradeSelected = 'annual';

function renderUpgrade(){
  var body = document.getElementById('upgradeBody');
  if(!body) return;
  var status = planStatus();
  var lockedYou = !isPlus();
  var daysLeft = trialDaysLeft();

  var featuresHtml = '';
  PLUS_FEATURES.forEach(function(f){
    var soonPill = f.comingSoon ? '<span class="upgFeatComingSoon">'+(lang==='es'?'Pronto':'Soon')+'</span>' : '';
    featuresHtml += '<div class="upgFeatureRow">'
      + '<div class="upgFeatureIco" style="background:'+f.color+'18">'+iconSVG(f.iconName, f.color, 22)+'</div>'
      + '<div class="upgFeatureMain">'
      +   '<div class="upgFeatureTitle">'+f.title[lang]+soonPill+'</div>'
      +   '<div class="upgFeatureSub">'+f.sub[lang]+'</div>'
      + '</div>'
      + '<div class="upgFeatureCheck">'+iconSVG('check','#00b4a8',18)+'</div>'
      + '</div>';
  });

  var pricingHtml = ''
    + '<div class="upgPriceGrid upgPriceGrid2">'
    +   '<div class="upgPriceCard'+(upgradeSelected==='monthly'?' upgPriceSel':'')+'" onclick="selectUpgradePlan(\'monthly\')">'
    +     '<div class="upgPriceLbl">'+(lang==='es'?'Mensual':'Monthly')+'</div>'
    +     '<div class="upgPriceNum">$'+PLUS_PRICING.monthly.price.toFixed(2)+'</div>'
    +     '<div class="upgPricePer">/ '+PLUS_PRICING.monthly.period[lang]+'</div>'
    +   '</div>'
    +   '<div class="upgPriceCard upgPricePopular'+(upgradeSelected==='annual'?' upgPriceSel':'')+'" onclick="selectUpgradePlan(\'annual\')">'
    +     '<div class="upgPriceTag">'+(lang==='es'?'AHORRA 48%':'SAVE 48%')+'</div>'
    +     '<div class="upgPriceLbl">'+(lang==='es'?'Anual':'Annual')+'</div>'
    +     '<div class="upgPriceNum">$'+PLUS_PRICING.annual.price.toFixed(2)+'</div>'
    +     '<div class="upgPricePer">/ '+PLUS_PRICING.annual.period[lang]+'</div>'
    +     '<div class="upgPriceEquiv">~$'+PLUS_PRICING.annual.monthlyEquiv.toFixed(2)+'/'+(lang==='es'?'mes':'mo')+'</div>'
    +   '</div>'
    + '</div>';

  var statusBanner = '';
  if(status === 'trial-active'){
    statusBanner = '<div class="upgStatusBanner upgStatusTrial">'
      + iconSVG('star','#a05000',16)
      + (lang==='es'
          ? ' Estás en prueba gratis · '+daysLeft+' días restantes'
          : ' You\'re on free trial · '+daysLeft+' days remaining')
      + '</div>';
  } else if(status === 'plus'){
    statusBanner = '<div class="upgStatusBanner upgStatusActive">'
      + iconSVG('check','#1c6b35',16)
      + (lang==='es' ? ' Camino Plus activo' : ' Camino Plus active')
      + '</div>';
  }

  var ctaHtml;
  if(lockedYou){
    ctaHtml = '<button class="cta upgCtaBig" onclick="upgradeOpenPurchaseSheet()">'
      + (lang==='es' ? 'Empezar 7 días gratis' : 'Start 7-day free trial')
      + '</button>'
      + '<div class="upgTermsLine">'+(lang==='es'?'Cancela cuando quieras antes del final del periodo.':'Cancel anytime before the trial ends.')+'</div>';
  } else {
    ctaHtml = '<button class="cta upgCtaBig" disabled style="opacity:.6;background:var(--muted);box-shadow:0 5px 0 #6e6862;">'
      + (lang==='es' ? '✓ Ya estás en Plus' : '✓ You\'re on Plus')
      + '</button>'
      + '<button class="upgManageBtn" onclick="cancelPlus()">'+(lang==='es'?'Cancelar Plus':'Cancel Plus')+'</button>';
  }

  // App Store-required auto-renew disclosure (shown when offering a paid CTA)
  var selPricing = PLUS_PRICING[upgradeSelected];
  var renewText = lockedYou
    ? (lang==='es'
        ? 'Después de la prueba gratis de 7 días, $' + selPricing.price.toFixed(2) + '/' + selPricing.period[lang] + '. Renovación automática a menos que canceles al menos 24 horas antes del final del período. Administra en los Ajustes de tu cuenta de App Store.'
        : 'After the 7-day free trial, $' + selPricing.price.toFixed(2) + '/' + selPricing.period[lang] + '. Auto-renews unless canceled at least 24 hours before the end of the period. Manage in your App Store account settings.')
    : '';

  body.innerHTML = ''
    + '<div class="upgHero">'
    +   '<div class="upgCami">'+camiPlusSVG()+'</div>'
    +   '<div class="upgBrandRow"><span class="upgBrand">Camino</span><span class="upgPlusTag">PLUS</span></div>'
    +   '<div class="upgTagline">'+(lang==='es'?'Tu camino de inmigración, completo.':'Your immigration journey, in one app.')+'</div>'
    +   statusBanner
    + '</div>'
    + '<div class="upgSection">'
    +   '<div class="upgSecHead">'+(lang==='es'?'Qué incluye Plus':"What Plus includes")+'</div>'
    +   '<div class="upgFeatureList">'+featuresHtml+'</div>'
    + '</div>'
    + '<div class="upgSection">'
    +   '<div class="upgSecHead">'+(lang==='es'?'Elige tu plan':"Pick your plan")+'</div>'
    +   pricingHtml
    + '</div>'
    + '<div class="upgCtaWrap">'
    +   ctaHtml
    +   (renewText ? '<div class="upgRenewDisclosure">'+renewText+'</div>' : '')
    + '</div>'
    + '<div class="upgLegalRow">'
    +   '<button class="trialLegalLink" onclick="showTermsModal()">'+(lang==='es'?'Términos':'Terms of Use')+'</button>'
    +   '<span class="trialLegalSep">·</span>'
    +   '<button class="trialLegalLink" onclick="showPrivacyNote()">'+(lang==='es'?'Privacidad':'Privacy Policy')+'</button>'
    +   '<span class="trialLegalSep">·</span>'
    +   '<button class="trialLegalLink" onclick="restorePurchases()">'+(lang==='es'?'Restaurar compras':'Restore Purchases')+'</button>'
    + '</div>'
    + '<div class="upgFooterNote">'
    +   (lang==='es'
        ? 'El nivel gratis incluye lecciones de cívica, lista de documentos y práctica diaria. Plus quita los límites y añade herramientas más profundas.'
        : 'The free tier includes civics lessons, your document checklist, and daily practice. Plus removes the limits and adds deeper tools.')
    + '</div>';
  populateIcons();
}

function selectUpgradePlan(planCode){
  upgradeSelected = planCode;
  renderUpgrade();
}

function upgradeOpenPurchaseSheet(){
  // Open the iOS-style purchase sheet using the plan selected in the upgrade view
  trialOfferSelectedPlan = upgradeSelected;
  openPurchaseSheet();
}

// ===== PATH JOURNEYS — outlined roadmap per immigration path =====
// Each user gets their own outlined journey based on phase + petitionType + goal.
// Stages are visualized in the Journey view with done/current/upcoming states.
// User can tap a stage to mark it as current; previous stages auto-mark as done.
var PATH_JOURNEYS = {
  student: {
    title: {en:'Your F-1 student path', es:'Tu vía F-1 estudiante'},
    stages: [
      {id:'s-enrolled',  iconName:'book',     color:'#1cb0f6',
       name:{en:'Enrolled in school',        es:'Inscrito en la escuela'},
       desc:{en:'Maintain F-1 status: full-time enrollment, no unauthorized work', es:'Mantén el estatus F-1: tiempo completo, sin trabajo no autorizado'},
       eta:{en:'Now',                        es:'Ahora'}},
      {id:'s-graduate',  iconName:'trophy',   color:'#ffc83d',
       name:{en:'Graduate',                  es:'Graduación'},
       desc:{en:'Within your I-20 program end date', es:'Dentro de la fecha del I-20'},
       eta:null},
      {id:'s-opt-file',  iconName:'doc',      color:'#ff9b21',
       name:{en:'File OPT (Form I-765)',     es:'Presentar OPT (I-765)'},
       desc:{en:'Up to 90 days before graduation; $470 online fee',     es:'Hasta 90 días antes de graduarte; $470 en línea'},
       eta:{en:'~3 months processing',       es:'~3 meses procesamiento'}},
      {id:'s-opt-active',iconName:'briefcase',color:'#00b4a8',
       name:{en:'OPT period',                es:'Período OPT'},
       desc:{en:'12 months work authorization (+24 STEM extension if eligible)', es:'12 meses (+24 STEM si elegible)'},
       eta:{en:'12 months',                  es:'12 meses'}},
      {id:'s-next',      iconName:'globe',    color:'#5e8eff',
       name:{en:'Choose your next step',     es:'Elige tu siguiente paso'},
       desc:{en:'H-1B lottery, EB-2/3 sponsorship, marriage, asylum, etc.', es:'Lotería H-1B, EB-2/3, matrimonio, asilo, etc.'},
       eta:null}
    ]
  },
  opt: {
    title: {en:'Your OPT → green card path', es:'Tu vía OPT → residencia'},
    stages: [
      {id:'o-active',     iconName:'briefcase', color:'#00b4a8',
       name:{en:'OPT active',                  es:'OPT activo'},
       desc:{en:'Track your 90-day unemployment limit', es:'Cuidado con el límite de 90 días sin empleo'},
       eta:{en:'12 months',                    es:'12 meses'}},
      {id:'o-stem',       iconName:'star',      color:'#ec4f93',
       name:{en:'STEM OPT extension (optional)', es:'Extensión STEM OPT (opcional)'},
       desc:{en:'24 more months for STEM majors; employer must be E-Verify enrolled', es:'24 meses más para STEM; empleador en E-Verify'},
       eta:{en:'24 months',                    es:'24 meses'}},
      {id:'o-lottery',    iconName:'target',    color:'#ff4d3a',
       name:{en:'H-1B lottery',                es:'Lotería H-1B'},
       desc:{en:'Registration in March; selection late March',    es:'Registro en marzo; selección a fin de mes'},
       eta:{en:'Annual cycle',                 es:'Ciclo anual'}},
      {id:'o-h1b',        iconName:'briefcase', color:'#1cb0f6',
       name:{en:'H-1B status',                 es:'Estatus H-1B'},
       desc:{en:'3 years renewable to 6 (or beyond with I-140 approved)', es:'3 años, renovable a 6 (o más con I-140)'},
       eta:{en:'3+3 years',                    es:'3+3 años'}},
      {id:'o-i140',       iconName:'doc',       color:'#ff9b21',
       name:{en:'I-140 filed by employer',     es:'I-140 presentado por empleador'},
       desc:{en:'PERM labor certification first (~1 yr), then I-140 (~6-12 mo)', es:'PERM primero (~1 año), luego I-140 (~6-12 meses)'},
       eta:{en:'1-2 years',                    es:'1-2 años'}},
      {id:'o-priority',   iconName:'clock',     color:'#84807a',
       name:{en:'Priority date current',       es:'Fecha de prioridad actual'},
       desc:{en:'Wait depends on country + category (Visa Bulletin)', es:'Depende del país y categoría (Boletín de Visas)'},
       eta:{en:'Varies wildly',                es:'Varía mucho'}},
      {id:'o-i485',       iconName:'doc',       color:'#00b4a8',
       name:{en:'File I-485 (adjust status)', es:'Presentar I-485'},
       desc:{en:'When priority date is current; processing 12-24 months', es:'Cuando la fecha está vigente; procesamiento 12-24 meses'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'o-gc',         iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       desc:{en:'You are a lawful permanent resident', es:'Eres residente permanente'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'o-residency',  iconName:'calendar',  color:'#5e8eff',
       name:{en:'5 years residency',           es:'5 años de residencia'},
       desc:{en:'3 years if married to U.S. citizen',         es:'3 años si casado/a con ciudadano'},
       eta:{en:'5 years',                      es:'5 años'}},
      {id:'o-n400',       iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       desc:{en:'90 days early window before residency anniversary', es:'Ventana de 90 días antes del aniversario'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'o-interview',  iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + interview',      es:'Biométricos + entrevista'},
       desc:{en:'Civics test + English + N-400 review',      es:'Cívica + inglés + revisión del N-400'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'o-oath',       iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       desc:{en:'You become a U.S. citizen',   es:'Te haces ciudadano de EE.UU.'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  },
  workvisa: {
    title: {en:'Your work-visa → citizenship path', es:'Tu vía visa de trabajo → ciudadanía'},
    stages: [
      {id:'w-active',     iconName:'briefcase', color:'#00b4a8',
       name:{en:'Work visa active',            es:'Visa de trabajo activa'},
       desc:{en:'H-1B, L-1, O-1, E-2, TN, etc.', es:'H-1B, L-1, O-1, E-2, TN, etc.'},
       eta:{en:'Now',                          es:'Ahora'}},
      {id:'w-i140',       iconName:'doc',       color:'#ff9b21',
       name:{en:'I-140 filed by employer',     es:'I-140 presentado por empleador'},
       desc:{en:'PERM labor cert first (~1 yr), then I-140 (~6-12 mo)', es:'PERM primero (~1 año), luego I-140 (~6-12 meses)'},
       eta:{en:'1-2 years',                    es:'1-2 años'}},
      {id:'w-priority',   iconName:'clock',     color:'#84807a',
       name:{en:'Priority date current',       es:'Fecha de prioridad actual'},
       desc:{en:'Wait depends on country + category', es:'Depende del país y categoría'},
       eta:{en:'Varies wildly',                es:'Varía mucho'}},
      {id:'w-i485',       iconName:'doc',       color:'#00b4a8',
       name:{en:'File I-485 (adjust status)',  es:'Presentar I-485'},
       desc:{en:'Processing 12-24 months',     es:'Procesamiento 12-24 meses'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'w-gc',         iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       desc:{en:'You are a lawful permanent resident', es:'Eres residente permanente'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'w-residency',  iconName:'calendar',  color:'#5e8eff',
       name:{en:'5 years residency',           es:'5 años de residencia'},
       desc:{en:'3 years if married to U.S. citizen', es:'3 años si casado/a con ciudadano'},
       eta:{en:'5 years',                      es:'5 años'}},
      {id:'w-n400',       iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       desc:{en:'90 days early window',        es:'Ventana de 90 días'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'w-interview',  iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + interview',      es:'Biométricos + entrevista'},
       desc:{en:'Civics + English + N-400 review', es:'Cívica + inglés + revisión'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'w-oath',       iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       desc:{en:'You become a U.S. citizen',   es:'Te haces ciudadano de EE.UU.'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  },
  asylum: {
    title: {en:'Your asylum → citizenship path', es:'Tu vía asilo → ciudadanía'},
    stages: [
      {id:'a-filed',      iconName:'doc',       color:'#ff9b21',
       name:{en:'I-589 filed',                 es:'I-589 presentado'},
       desc:{en:'Within 1 year of arrival; no filing fee', es:'Dentro de 1 año de llegar; sin tarifa'},
       eta:{en:'Now',                          es:'Ahora'}},
      {id:'a-ead',        iconName:'briefcase', color:'#00b4a8',
       name:{en:'EAD (work permit)',           es:'EAD (permiso de trabajo)'},
       desc:{en:'Eligible to apply 150 days after filing I-589', es:'Elegible 150 días tras presentar I-589'},
       eta:{en:'~5 months',                    es:'~5 meses'}},
      {id:'a-interview',  iconName:'mic',       color:'#ec4f93',
       name:{en:'Asylum interview',            es:'Entrevista de asilo'},
       desc:{en:'Affirmative: USCIS officer; defensive: judge. 2-7 year wait currently', es:'Afirmativo: USCIS; defensivo: juez. 2-7 años espera'},
       eta:{en:'2-7 years',                    es:'2-7 años'}},
      {id:'a-granted',    iconName:'shield',    color:'#ffc83d',
       name:{en:'Asylum granted',              es:'Asilo otorgado'},
       desc:{en:'You have refugee/asylee status — can stay indefinitely', es:'Tienes estatus de refugiado/asilo'},
       eta:{en:'1-2 months',                   es:'1-2 meses'}},
      {id:'a-wait',       iconName:'calendar',  color:'#84807a',
       name:{en:'1-year wait',                 es:'Espera de 1 año'},
       desc:{en:'Required before applying for green card',  es:'Requerido antes de pedir residencia'},
       eta:{en:'12 months',                    es:'12 meses'}},
      {id:'a-i485',       iconName:'doc',       color:'#5e8eff',
       name:{en:'File I-485',                  es:'Presentar I-485'},
       desc:{en:'Free for asylum applicants; processing 12-24 months', es:'Gratis para asilados; procesamiento 12-24 meses'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'a-gc',         iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       desc:{en:'You are a lawful permanent resident', es:'Eres residente permanente'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'a-residency',  iconName:'calendar',  color:'#5e8eff',
       name:{en:'5 years residency',           es:'5 años de residencia'},
       desc:{en:'3 years if married to U.S. citizen', es:'3 años si casado/a con ciudadano'},
       eta:{en:'5 years',                      es:'5 años'}},
      {id:'a-n400',       iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       desc:{en:'90 days early window',        es:'Ventana de 90 días'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'a-interview2', iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + N-400 interview', es:'Biométricos + entrevista N-400'},
       desc:{en:'Civics + English + N-400 review', es:'Cívica + inglés + revisión'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'a-oath',       iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       desc:{en:'You become a U.S. citizen',   es:'Te haces ciudadano de EE.UU.'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  },
  'preGC-family-ir': {
    title: {en:'Your IR family → citizenship path', es:'Tu vía familiar inmediato → ciudadanía'},
    stages: [
      {id:'fi-petition',  iconName:'doc',       color:'#ff9b21',
       name:{en:'I-130 petition filed',        es:'I-130 presentada'},
       desc:{en:'Your U.S. citizen relative files for you', es:'Tu familiar ciudadano la presenta'},
       eta:{en:'Now',                          es:'Ahora'}},
      {id:'fi-approve',   iconName:'check',     color:'#00b4a8',
       name:{en:'I-130 approved',              es:'I-130 aprobada'},
       desc:{en:'No quota wait for immediate relatives', es:'Sin espera de cuota para familiares inmediatos'},
       eta:{en:'6-12 months',                  es:'6-12 meses'}},
      {id:'fi-i485',      iconName:'doc',       color:'#5e8eff',
       name:{en:'File I-485 (adjust status)',  es:'Presentar I-485'},
       desc:{en:'If you\'re in the U.S.; or DS-260 if abroad', es:'Si estás en EE.UU.; o DS-260 si afuera'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'fi-biom',      iconName:'id',        color:'#ec4f93',
       name:{en:'Biometrics + interview',      es:'Biométricos + entrevista'},
       desc:{en:'USCIS verifies the genuine relationship', es:'USCIS verifica la relación genuina'},
       eta:{en:'Within I-485 window',          es:'En el plazo del I-485'}},
      {id:'fi-gc',        iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       desc:{en:'You are a lawful permanent resident', es:'Eres residente permanente'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'fi-residency', iconName:'calendar',  color:'#5e8eff',
       name:{en:'3 years residency',           es:'3 años de residencia'},
       desc:{en:'Spouse of citizen: 3-year rule', es:'Cónyuge de ciudadano: regla de 3 años'},
       eta:{en:'3 years',                      es:'3 años'}},
      {id:'fi-n400',      iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'fi-interview', iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + N-400 interview', es:'Biométricos + entrevista N-400'},
       desc:{en:'Civics + English + N-400 review', es:'Cívica + inglés + revisión'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'fi-oath',      iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       desc:{en:'You become a U.S. citizen',   es:'Te haces ciudadano de EE.UU.'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  },
  'preGC-employment': {
    title: {en:'Your employment-based → citizenship path', es:'Tu vía por empleo → ciudadanía'},
    stages: [
      {id:'e-perm',       iconName:'doc',       color:'#84807a',
       name:{en:'PERM labor certification',    es:'Certificación PERM'},
       desc:{en:'Employer proves no qualified U.S. worker available', es:'Empleador prueba que no hay trabajador EE.UU. calificado'},
       eta:{en:'~12 months',                   es:'~12 meses'}},
      {id:'e-i140',       iconName:'doc',       color:'#ff9b21',
       name:{en:'I-140 filed by employer',     es:'I-140 presentado por empleador'},
       desc:{en:'Petition for immigrant worker', es:'Petición para trabajador inmigrante'},
       eta:{en:'6-12 months',                  es:'6-12 meses'}},
      {id:'e-priority',   iconName:'clock',     color:'#84807a',
       name:{en:'Priority date current',       es:'Fecha de prioridad vigente'},
       desc:{en:'Wait depends on country + category (Visa Bulletin)', es:'Depende del país y categoría'},
       eta:{en:'Varies wildly',                es:'Varía mucho'}},
      {id:'e-i485',       iconName:'doc',       color:'#5e8eff',
       name:{en:'File I-485 (adjust status)',  es:'Presentar I-485'},
       desc:{en:'When priority date is current', es:'Cuando la fecha esté vigente'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'e-gc',         iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       desc:{en:'You are a lawful permanent resident', es:'Eres residente permanente'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'e-residency',  iconName:'calendar',  color:'#5e8eff',
       name:{en:'5 years residency',           es:'5 años de residencia'},
       desc:{en:'Required before N-400',       es:'Requerido antes del N-400'},
       eta:{en:'5 years',                      es:'5 años'}},
      {id:'e-n400',       iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'e-interview',  iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + N-400 interview', es:'Biométricos + entrevista N-400'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'e-oath',       iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       desc:{en:'You become a U.S. citizen',   es:'Te haces ciudadano de EE.UU.'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  },
  'preGC-family-pref': {
    title: {en:'Your family preference → citizenship path', es:'Tu vía preferencia familiar → ciudadanía'},
    stages: [
      {id:'fp-petition',  iconName:'doc',       color:'#ff9b21',
       name:{en:'I-130 petition filed',        es:'I-130 presentada'},
       desc:{en:'Your U.S. relative files for you', es:'Tu familiar la presenta'},
       eta:{en:'Now',                          es:'Ahora'}},
      {id:'fp-approve',   iconName:'check',     color:'#00b4a8',
       name:{en:'I-130 approved',              es:'I-130 aprobada'},
       desc:{en:'Now you wait for a visa to become available', es:'Ahora esperas que haya visa disponible'},
       eta:{en:'6-12 months',                  es:'6-12 meses'}},
      {id:'fp-priority',  iconName:'clock',     color:'#84807a',
       name:{en:'Priority date current',       es:'Fecha de prioridad vigente'},
       desc:{en:'Family-preference wait: years to decades (Visa Bulletin)', es:'Espera familiar: años a décadas'},
       eta:{en:'7-35 years',                   es:'7-35 años'}},
      {id:'fp-i485',      iconName:'doc',       color:'#5e8eff',
       name:{en:'File I-485 or DS-260',        es:'Presentar I-485 o DS-260'},
       desc:{en:'When priority date is current', es:'Cuando la fecha esté vigente'},
       eta:{en:'12-24 months',                 es:'12-24 meses'}},
      {id:'fp-gc',        iconName:'id',        color:'#008a7e',
       name:{en:'Green card',                  es:'Residencia'},
       eta:{en:'Permanent',                    es:'Permanente'}},
      {id:'fp-residency', iconName:'calendar',  color:'#5e8eff',
       name:{en:'5 years residency',           es:'5 años de residencia'},
       eta:{en:'5 years',                      es:'5 años'}},
      {id:'fp-n400',      iconName:'doc',       color:'#ff9b21',
       name:{en:'File N-400',                  es:'Presentar N-400'},
       eta:{en:'8-15 months',                  es:'8-15 meses'}},
      {id:'fp-interview', iconName:'mic',       color:'#ec4f93',
       name:{en:'Biometrics + interview',      es:'Biométricos + entrevista'},
       eta:{en:'8-16 months',                  es:'8-16 meses'}},
      {id:'fp-oath',      iconName:'flag',      color:'#ffc83d',
       name:{en:'Oath of Allegiance',          es:'Juramento de Lealtad'},
       eta:{en:'1-4 months',                   es:'1-4 meses'}}
    ]
  }
};

// Reuse family-pref journey for family-lpr (F2A/F2B) since steps are the same shape.
PATH_JOURNEYS['preGC-family-lpr'] = PATH_JOURNEYS['preGC-family-pref'];
PATH_JOURNEYS['preGC-asylum'] = PATH_JOURNEYS.asylum;

// Resolve the user's path-journey key (used both here and in renderJourney).
function userPathJourneyKey(){
  var phase = user.phase;
  if(!phase) return null;
  if(phase === 'preGC'){
    var p = user.petitionType;
    if(p === 'family-ir') return 'preGC-family-ir';
    if(p === 'family-pref') return 'preGC-family-pref';
    if(p === 'family-lpr') return 'preGC-family-lpr';
    if(p === 'employment') return 'preGC-employment';
    if(p === 'asylum') return 'preGC-asylum';
    return null;
  }
  if(PATH_JOURNEYS[phase]) return phase;
  return null;
}

function userPathJourney(){
  var k = userPathJourneyKey();
  return k ? PATH_JOURNEYS[k] : null;
}

function setUserPathStage(stageId){
  user.pathCurrentStage = stageId;
  saveUser();
  try { renderAll(); } catch(e){}
}

function renderPathJourney(el){
  var journey = userPathJourney();
  var subEl = document.getElementById('journeySub');

  if(!journey){
    // User skipped onboarding or chose a phase with no mapped journey
    el.innerHTML = '<div class="journeyOffTrack">'
      + '<div class="journeyOffTrackTitle">'+(lang==='es'?'Aún no has elegido una vía':"You haven't picked a path yet")+'</div>'
      + '<div class="journeyOffTrackSub">'+(lang==='es'?'Completa el onboarding o explora las vías disponibles.':'Complete onboarding or browse the available paths.')+'</div>'
      + '<button class="cta" onclick="go(\'visaPaths\')">'+(lang==='es'?'Ver vías':'See paths')+' →</button>'
      + '</div>';
    if(subEl) subEl.textContent = (lang==='es'?'Sin vía elegida':'No path chosen');
    return;
  }

  var stages = journey.stages;
  // Default current stage = first stage if none stored
  var curId = user.pathCurrentStage;
  var curIdx = -1;
  for(var i=0;i<stages.length;i++) if(stages[i].id === curId){ curIdx = i; break; }
  if(curIdx === -1) curIdx = 0;

  // Title in the header
  var titleEl = document.querySelector('#journey .nav .title') || document.getElementById('journeyTitle');
  if(titleEl) titleEl.textContent = journey.title[lang];
  if(subEl){
    subEl.textContent = (curIdx+1) + ' / ' + stages.length + ' · ' + stages[curIdx].name[lang];
  }

  var html = '';
  for(var j=0;j<stages.length;j++){
    var s = stages[j];
    var st = j < curIdx ? 'done' : j === curIdx ? 'current' : 'upcoming';
    var dotCls = st==='done' ? 'done' : st==='current' ? 'cur' : 'todo';
    var dotInner = st==='done' ? '✓' : String(j+1);
    var isLast = j === stages.length - 1;
    var barCls = st==='done' ? 'bar on' : 'bar';
    var cardCls = st==='current' ? 'stepCard curC' : 'stepCard';
    var tagCls, tagTxt;
    if(st==='done'){ tagCls='tagDone'; tagTxt = lang==='es'?'Hecho':'Done'; }
    else if(st==='current'){ tagCls='tagNow'; tagTxt = lang==='es'?'Estás aquí':'You are here'; }
    else { tagCls='tagNext'; tagTxt = lang==='es'?'Próximo':'Upcoming'; }
    var etaHtml = s.eta ? '<div class="stepEst">⏱ '+s.eta[lang]+'</div>' : '';
    var descHtml = s.desc ? '<div class="stepMeta">'+autolinkForms(s.desc[lang])+'</div>' : '';
    var iconChip = s.iconName
      ? '<div class="pathStageIco" style="background:'+s.color+'22">'+iconSVG(s.iconName, s.color, 18)+'</div>'
      : '';
    html +=
      '<div class="step pathStep" onclick="setUserPathStage(\''+s.id+'\')">'+
        '<div class="stepLine">'+
          '<div class="dot '+dotCls+'">'+dotInner+'</div>'+
          (isLast?'':'<div class="'+barCls+'"></div>')+
        '</div>'+
        '<div class="'+cardCls+'">'+
          '<div class="pathStageHead">'+iconChip+'<div class="stepName">'+autolinkForms(s.name[lang])+'</div></div>'+
          descHtml+
          '<span class="stepTag '+tagCls+'">'+tagTxt+'</span>'+
          etaHtml+
        '</div>'+
      '</div>';
  }
  el.innerHTML = '<div class="pathJourneyHint">'+(lang==='es'?'Toca cualquier etapa para marcarla como tu posición actual':'Tap any stage to mark it as your current position')+'</div>'
    + html + '<div style="height:10px"></div>';
}


// ===== USCIS FORM LINKS =====
// Maps form names to USCIS.gov form pages. These are public, stable URLs.
var USCIS_FORMS = {
  // USCIS forms
  'N-400':  {url:'https://www.uscis.gov/n-400',  desc:{en:'Application for Naturalization',                 es:'Solicitud de Naturalización'}},
  'I-485':  {url:'https://www.uscis.gov/i-485',  desc:{en:'Application to Register Permanent Residence',    es:'Solicitud para Registrar Residencia Permanente'}},
  'I-90':   {url:'https://www.uscis.gov/i-90',   desc:{en:'Application to Replace Permanent Resident Card', es:'Solicitud para Reemplazar la Tarjeta de Residente'}},
  'I-130':  {url:'https://www.uscis.gov/i-130',  desc:{en:'Petition for Alien Relative',                    es:'Petición de Familiar Extranjero'}},
  'I-140':  {url:'https://www.uscis.gov/i-140',  desc:{en:'Immigrant Petition for Alien Workers',           es:'Petición Inmigrante para Trabajadores'}},
  'I-129':  {url:'https://www.uscis.gov/i-129',  desc:{en:'Petition for Nonimmigrant Worker',               es:'Petición para Trabajador No Inmigrante'}},
  'I-539':  {url:'https://www.uscis.gov/i-539',  desc:{en:'Application to Extend / Change Nonimmigrant Status', es:'Solicitud para Extender o Cambiar Estatus No Inmigrante'}},
  'I-589':  {url:'https://www.uscis.gov/i-589',  desc:{en:'Application for Asylum',                         es:'Solicitud de Asilo'}},
  'I-765':  {url:'https://www.uscis.gov/i-765',  desc:{en:'Application for Employment Authorization (EAD)', es:'Solicitud de Autorización de Empleo (EAD)'}},
  'I-797':  {url:'https://www.uscis.gov/forms/all-forms', desc:{en:'Notice of Action (receipt / approval)', es:'Aviso de Acción (recibo / aprobación)'}},
  'I-912':  {url:'https://www.uscis.gov/i-912',  desc:{en:'Request for Fee Waiver',                         es:'Solicitud de Exención de Tarifa'}},
  'I-751':  {url:'https://www.uscis.gov/i-751',  desc:{en:'Petition to Remove Conditions on Residence',     es:'Petición para Remover Condiciones de Residencia'}},
  'AR-11':  {url:'https://www.uscis.gov/ar-11',  desc:{en:'Change of Address',                              es:'Cambio de Dirección'}},
  'N-648':  {url:'https://www.uscis.gov/n-648',  desc:{en:'Medical Certification for Disability Exceptions', es:'Certificación Médica para Excepciones por Discapacidad'}},
  'N-600':  {url:'https://www.uscis.gov/n-600',  desc:{en:'Application for Certificate of Citizenship',     es:'Solicitud de Certificado de Ciudadanía'}},
  'G-1450': {url:'https://www.uscis.gov/g-1450', desc:{en:'Authorization for Credit Card Transactions',     es:'Autorización para Transacciones con Tarjeta'}},
  'I-983':  {url:'https://studyinthestates.dhs.gov/students/study/the-i-983-training-plan',
                                                  desc:{en:'STEM OPT Training Plan',                          es:'Plan de Entrenamiento STEM OPT'}},
  // F-1 / student forms (issued by SEVP / ICE, not USCIS)
  'I-20':   {url:'https://studyinthestates.dhs.gov/students/form-i-20', desc:{en:'Certificate of Eligibility for F-1 / M-1 Status', es:'Certificado de Elegibilidad para Estatus F-1 / M-1'}},
  // Customs & Border Protection — I-94 is retrieved electronically, not filed
  'I-94':   {url:'https://i94.cbp.dhs.gov/',     desc:{en:'Arrival / Departure Record (retrieve online)',   es:'Registro de Entrada / Salida (consulta en línea)'}},
  // Dept of State visa applications
  'DS-160': {url:'https://ceac.state.gov/genniv', desc:{en:'Online Nonimmigrant Visa Application',           es:'Solicitud de Visa No Inmigrante en línea'}},
  'DS-260': {url:'https://ceac.state.gov/iv',    desc:{en:'Online Immigrant Visa Application',              es:'Solicitud de Visa Inmigrante en línea'}}
};

// Scans free-form copy ("File the I-485...", "Your I-130 was approved", "Form N-400 fee waiver")
// and converts every USCIS/DOS form code into a teal link to the official PDF page.
// Safe to apply to any plain-text or already-HTML string — won't touch text already inside a tag.
function autolinkForms(text){
  if(text == null) return '';
  var s = String(text);
  // Match 1-2 letter prefix + 2-4 digit suffix. Covers: I-20, I-94, N-400, AR-11, DS-260, I-797, G-1450.
  // The lookup in USCIS_FORMS is the source of truth — unknown codes (like the imaginary J-1) pass through unchanged.
  return s.replace(/\b(Form\s+)?([A-Z]{1,2}-\d{2,4})\b/g, function(match, prefix, code){
    var canonical = code.toUpperCase();
    var info = USCIS_FORMS[canonical];
    if(!info) return match;
    var title = (info.desc && info.desc[lang]) ? info.desc[lang] : (info.desc && info.desc.en) || canonical;
    return '<a class="formInlineLink" href="'+info.url+'" target="_blank" rel="noopener" '
         + 'onclick="event.stopPropagation();" '
         + 'title="'+title.replace(/"/g,'&quot;')+'">'
         + (prefix || '') + code
         + '<span class="formInlineLinkArrow">↗</span>'
         + '</a>';
  });
}

function uscisFormButton(formName){
  var info = USCIS_FORMS[formName];
  if(!info) return '';
  return '<a class="formBtn" href="'+info.url+'" target="_blank" rel="noopener">'
    + '<span class="formBtnLeft">'
    +   '<span class="formBtnIco">'+iconSVG('doc','#fff',14)+'</span>'
    +   '<span class="formBtnLabel">'
    +     '<span class="formBtnName">'+(lang==='es'?'Formulario ':'Form ')+formName+'</span>'
    +     '<span class="formBtnDesc">'+info.desc[lang]+'</span>'
    +   '</span>'
    + '</span>'
    + '<span class="formBtnArrow">↗</span>'
    + '</a>';
}

// Compact form chips for inline rendering inside path step cards.
function uscisFormChip(formName){
  var info = USCIS_FORMS[formName];
  if(!info) return '';
  return '<a class="stepFormChip" href="'+info.url+'" target="_blank" rel="noopener" '
       + 'onclick="event.stopPropagation();" '
       + 'title="'+(info.desc[lang]||'').replace(/"/g,'&quot;')+'">'
       + iconSVG('doc','#00b4a8',12)
       + '<span class="stepFormChipName">'+formName+'</span>'
       + '<span class="stepFormChipArrow">↗</span>'
       + '</a>';
}

function renderStageFormChips(stageId){
  var forms = formsForStage(stageId, user);
  if(!forms || !forms.length) return '';
  var chipsHtml = '';
  for(var i=0;i<forms.length;i++){ chipsHtml += uscisFormChip(forms[i]); }
  return '<div class="stepFormsRow" aria-label="'+(lang==='es'?'Formularios para este paso':'Forms for this step')+'">'
       + '<div class="stepFormsLbl">'+iconSVG('folder','#84807a',12)+(lang==='es'?'Formularios':'Forms')+'</div>'
       + '<div class="stepFormsChips">'+chipsHtml+'</div>'
       + '</div>';
}

// ===== USCIS CASE STATUS =====
function saveUSCISReceipt(){
  var input = document.getElementById('uscisInput');
  if(!input) return;
  var val = (input.value || '').trim().toUpperCase().replace(/\s+/g,'');
  if(!val){
    user.uscisReceipt = null;
    saveUser();
    renderMe();
    return;
  }
  // Format: 3 letters + 10 digits (e.g. MSC1234567890, IOE0901234567, EAC9912345678)
  if(!/^[A-Z]{3}\d{10}$/.test(val)){
    toast(lang==='es' ? 'Formato inválido (ej. MSC1234567890)' : 'Invalid format (e.g. MSC1234567890)');
    return;
  }
  user.uscisReceipt = val;
  saveUser();
  renderMe();
  toast(lang==='es' ? 'Guardado' : 'Saved');
}

function checkUSCISStatus(){
  // USCIS Case Status site — they don't support deep-linking with the receipt prefilled,
  // so we open the landing page in a new tab. User pastes their saved receipt there.
  openExternal('https://egov.uscis.gov/casestatus/landing.do');
}

function copyUSCISReceipt(){
  if(!user.uscisReceipt) return;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(user.uscisReceipt).then(function(){
      toast(lang==='es' ? 'Copiado' : 'Copied');
    }).catch(function(){ toast(lang==='es' ? 'No se pudo copiar' : 'Could not copy'); });
  }
}

// ===== VISA PATHS GUIDE =====
// Information for people on different immigration paths (not just naturalization).
var VISA_PATHS = [
  {id:'student', iconName:'book', color:'#1cb0f6', cat:'student', forms:['DS-160'],
    title:{en:'F-1 Student Visa', es:'Visa F-1 de Estudiante'},
    summary:{en:'Full-time study at a SEVP-approved U.S. school. Stay valid for the duration of your studies plus 60 days grace.',
             es:'Estudio a tiempo completo en una escuela aprobada por SEVP. Válida durante tus estudios más 60 días de gracia.'},
    eligibility:{en:['Accepted at a SEVP-certified school','Proof of financial support','Strong ties to your home country','English proficient (or in ESL program)'],
                 es:['Aceptado en escuela certificada por SEVP','Prueba de apoyo financiero','Lazos fuertes con tu país','Suficiente inglés (o en programa ESL)']},
    tips:{en:['Maintain a full course load every semester.','Don\'t work off-campus without CPT or OPT authorization — it\'s a status violation.','Travel? Get a fresh I-20 signature before leaving the U.S.'],
          es:['Mantén carga completa de cursos cada semestre.','No trabajes fuera del campus sin CPT u OPT — es una violación de estatus.','¿Viajas? Consigue una firma fresca en tu I-20 antes de salir.']}},
  {id:'cpt', iconName:'briefcase', color:'#ec4f93', cat:'student',
    title:{en:'CPT (Curricular Practical Training)', es:'CPT (Entrenamiento Práctico Curricular)'},
    summary:{en:'Work tied to your degree program — must be integral to your curriculum. Authorized by your school, not USCIS.',
             es:'Trabajo ligado a tu carrera — debe ser parte integral del plan de estudios. Lo autoriza tu escuela, no USCIS.'},
    eligibility:{en:['Enrolled F-1 student for 1+ academic year','Work directly related to your major','School designates the employment'],
                 es:['Estudiante F-1 con 1+ año académico','Trabajo directamente relacionado con tu carrera','Tu escuela designa el empleo']},
    tips:{en:['12+ months of full-time CPT eliminates OPT eligibility — use part-time CPT to preserve it.','Each CPT period needs a new I-20 from your DSO.'],
          es:['12+ meses de CPT a tiempo completo elimina la elegibilidad para OPT — usa CPT parcial para conservarla.','Cada período de CPT necesita un I-20 nuevo de tu DSO.']}},
  {id:'opt', iconName:'star', color:'#ff9b21', cat:'student', forms:['I-765','I-983'],
    title:{en:'OPT (Optional Practical Training)', es:'OPT (Entrenamiento Práctico Opcional)'},
    summary:{en:'12 months of work authorization in your field of study after graduation. STEM grads can extend by 24 months.',
             es:'12 meses de autorización de trabajo en tu área de estudio tras graduarte. Graduados STEM pueden extender 24 meses.'},
    eligibility:{en:['Completed 1+ academic year as F-1','Work in field directly related to your degree','Apply within 60 days of graduation','For STEM extension: bachelor\'s+ in eligible STEM field + E-Verify employer'],
                 es:['Completaste 1+ año académico como F-1','Trabajo en área directamente relacionada','Aplicar dentro de 60 días de graduarte','Para STEM: licenciatura+ en STEM elegible + empleador E-Verify']},
    tips:{en:['Don\'t accumulate more than 90 days unemployed during OPT — you lose status.','Report every job change within 10 days via SEVP Portal.','Apply for STEM extension BEFORE your initial OPT expires.','OPT is your runway to find an H-1B sponsor.'],
          es:['No acumules más de 90 días de desempleo durante OPT — pierdes estatus.','Reporta cada cambio de trabajo dentro de 10 días por el Portal SEVP.','Solicita extensión STEM ANTES de que venza tu OPT inicial.','OPT es tu pista para encontrar un patrocinador H-1B.']},
    howItWorks:{en:[
        'Pre-completion OPT — work BEFORE you graduate: part-time (≤20 hrs/week) while school is in session, full-time during breaks. Every month used is subtracted from your 12-month total.',
        'Post-completion OPT — the main one: up to 12 months of full-time work in your field AFTER graduation. Your DSO recommends it in SEVIS; you then file Form I-765 with USCIS.',
        'Apply in the window: from 90 days before your program end date to 60 days after. USCIS approval + the physical EAD card must arrive before you can start work.',
        'STEM OPT extension — eligible STEM degree + E-Verify employer = +24 months (36 total). File Form I-983 training plan with your employer, then I-765 before your initial OPT expires.',
        'Unemployment clock: 90 days max on standard OPT, 150 days total with the STEM extension. Report every employer and address change in the SEVP Portal within 10 days.',
        'Cap-gap: if your H-1B is selected and filed while on OPT, your status and work authorization auto-extend to October 1 so you don\'t fall out of status.'],
      es:[
        'OPT pre-graduación — trabaja ANTES de graduarte: medio tiempo (≤20 hrs/semana) durante clases, tiempo completo en vacaciones. Cada mes usado se resta de tu total de 12 meses.',
        'OPT post-graduación — la principal: hasta 12 meses de trabajo a tiempo completo en tu área DESPUÉS de graduarte. Tu DSO la recomienda en SEVIS; luego presentas el Formulario I-765 con USCIS.',
        'Aplica en la ventana: desde 90 días antes de terminar tu programa hasta 60 días después. La aprobación de USCIS + la tarjeta EAD física deben llegar antes de poder trabajar.',
        'Extensión STEM — título STEM elegible + empleador E-Verify = +24 meses (36 en total). Presenta el plan I-983 con tu empleador, luego el I-765 antes de que venza tu OPT inicial.',
        'Reloj de desempleo: máximo 90 días en OPT estándar, 150 días con la extensión STEM. Reporta cada empleador y cambio de dirección en el Portal SEVP dentro de 10 días.',
        'Cap-gap: si tu H-1B es seleccionada y presentada mientras estás en OPT, tu estatus y permiso de trabajo se extienden automáticamente hasta el 1 de octubre.']}},
  {id:'h1b', iconName:'briefcase', color:'#00b4a8', cat:'work', forms:['I-129'],
    title:{en:'H-1B Specialty Occupation', es:'H-1B Ocupación Especializada'},
    summary:{en:'Sponsored work visa for jobs requiring a bachelor\'s degree or higher. 3-year term, renewable to 6 (or longer if green-card process started).',
             es:'Visa patrocinada para trabajos que requieren licenciatura o más. Mandato de 3 años, renovable a 6 (o más si comienza el proceso de residencia).'},
    eligibility:{en:['Bachelor\'s degree (or equivalent) in a specialty field','Job offer from a U.S. employer','Employer files H-1B petition','Win the annual lottery (March registration, ~25% selection rate)'],
                 es:['Licenciatura (o equivalente) en área especializada','Oferta de trabajo de empleador en EE.UU.','El empleador presenta la petición H-1B','Ganar la lotería anual (registro en marzo, ~25% de selección)']},
    tips:{en:['Cap-exempt employers (universities, nonprofit research) skip the lottery — strategic option.','You can\'t change jobs without your new employer filing a transfer petition.','H-1B is "dual intent" — you can pursue a green card while on it.','Start I-140 employment-based GC ASAP to stay protected past year 6.'],
          es:['Empleadores exentos del cap (universidades, investigación sin fines de lucro) saltan la lotería — opción estratégica.','No puedes cambiar de trabajo sin que el nuevo empleador presente petición de transferencia.','H-1B tiene "doble intención" — puedes buscar residencia mientras estás en ella.','Empieza I-140 (GC por empleo) cuanto antes para mantenerte protegido después del año 6.']},
    howItWorks:{en:[
        'Registration (March): your employer creates a USCIS account and electronically registers you during the ~2-week window. Fee is $215 per registration (as of FY2026). One registration per person per employer — duplicates are thrown out.',
        'The lottery (late March): USCIS runs a random selection. Two pools — 65,000 regular cap, plus 20,000 extra for holders of a U.S. master\'s degree or higher (a second chance in the advanced-degree draw).',
        'Selected? (April–June): only now does your employer file the full I-129 petition with your credentials, plus a certified Labor Condition Application (LCA) from the Department of Labor. Premium processing (15 days) is optional for an extra fee.',
        'Approved: H-1B status begins October 1 — the start of the new fiscal year. F-1 students on OPT get "cap-gap" so their work authorization bridges to Oct 1 without a gap.',
        'Not selected: nothing carries over — you must re-register next March. Meanwhile, keep working via a STEM OPT extension, or pivot to a cap-exempt employer, O-1, L-1, or an EB green-card path.'],
      es:[
        'Registro (marzo): tu empleador crea una cuenta USCIS y te registra electrónicamente durante la ventana de ~2 semanas. El costo es $215 por registro (para FY2026). Un registro por persona por empleador — los duplicados se descartan.',
        'La lotería (fines de marzo): USCIS hace una selección aleatoria. Dos grupos — 65,000 del cap regular, más 20,000 adicionales para quienes tienen maestría+ de EE.UU. (una segunda oportunidad en el sorteo de grado avanzado).',
        '¿Seleccionado? (abril–junio): solo ahora tu empleador presenta la petición completa I-129 con tus credenciales, más una Solicitud de Condición Laboral (LCA) certificada por el Departamento de Trabajo. El procesamiento premium (15 días) es opcional por un costo extra.',
        'Aprobado: el estatus H-1B comienza el 1 de octubre — inicio del nuevo año fiscal. Los estudiantes F-1 en OPT reciben "cap-gap" para que su permiso de trabajo llegue hasta el 1 de octubre sin interrupción.',
        'No seleccionado: nada se guarda — debes registrarte de nuevo en marzo. Mientras tanto, sigue trabajando con una extensión STEM OPT, o cambia a un empleador exento del cap, O-1, L-1, o una vía de residencia EB.']}},
  {id:'l1', iconName:'plane', color:'#8c4dd1', cat:'work', forms:['I-129'],
    title:{en:'L-1 Intracompany Transfer', es:'L-1 Transferencia Intra-empresa'},
    summary:{en:'For employees of multinational companies transferring from a foreign office to a U.S. office. L-1A for managers, L-1B for specialized knowledge.',
             es:'Para empleados de empresas multinacionales que se transfieren de oficina extranjera a EE.UU. L-1A para gerentes, L-1B para conocimiento especializado.'},
    eligibility:{en:['1 year of continuous employment with the foreign company in past 3 years','Coming to work in managerial, executive, or specialized-knowledge role','Foreign office must maintain operations'],
                 es:['1 año de empleo continuo con la empresa extranjera en los últimos 3 años','Vienes a un puesto gerencial, ejecutivo o de conocimiento especializado','La oficina extranjera debe seguir operando']},
    tips:{en:['No annual lottery — file anytime.','L-1A is the fast lane to EB-1C green card.','Spouses (L-2) can work in the U.S. with EAD.'],
          es:['No hay lotería anual — presenta en cualquier momento.','L-1A es la vía rápida a residencia EB-1C.','Cónyuges (L-2) pueden trabajar con EAD.']}},
  {id:'o1', iconName:'star', color:'#ff4d3a', cat:'work', forms:['I-129'],
    title:{en:'O-1 Extraordinary Ability', es:'O-1 Habilidad Extraordinaria'},
    summary:{en:'For people at the top of their field — sciences, arts, education, business, athletics. Initial 3-year period, indefinite renewals possible.',
             es:'Para personas en la cima de su campo — ciencias, artes, educación, negocios, atletismo. Período inicial de 3 años, renovaciones indefinidas posibles.'},
    eligibility:{en:['Sustained national or international acclaim','Evidence across multiple categories (awards, publications, press, original contributions, judging, high salary)','U.S. employer or agent sponsor'],
                 es:['Reconocimiento sostenido nacional o internacional','Evidencia en múltiples categorías (premios, publicaciones, prensa, contribuciones, jurado, salario alto)','Patrocinador empleador o agente en EE.UU.']},
    tips:{en:['No lottery, no annual cap.','Document everything: press, awards, citations, recommendation letters from experts.','Often a backup when H-1B lottery doesn\'t hit.'],
          es:['Sin lotería, sin tope anual.','Documenta todo: prensa, premios, citas, cartas de recomendación de expertos.','Frecuentemente un respaldo cuando no ganas la lotería H-1B.']}},
  {id:'eb1', iconName:'trophy', color:'#ffc83d', cat:'gc', forms:['I-140','I-485'],
    title:{en:'EB-1 Priority Workers (Green Card)', es:'EB-1 Trabajadores Prioritarios (Residencia)'},
    summary:{en:'Fastest employment-based green card. Three subcategories: EB-1A (extraordinary ability), EB-1B (outstanding professor/researcher), EB-1C (multinational manager).',
             es:'La residencia por empleo más rápida. Tres subcategorías: EB-1A (habilidad extraordinaria), EB-1B (profesor/investigador destacado), EB-1C (gerente multinacional).'},
    eligibility:{en:['EB-1A: top of field, can self-petition','EB-1B: outstanding researcher with 3+ years experience + employer sponsor','EB-1C: 1+ year as multinational manager/executive abroad + U.S. transfer'],
                 es:['EB-1A: cima de su campo, puede auto-petición','EB-1B: investigador destacado con 3+ años + patrocinador','EB-1C: 1+ año como gerente/ejecutivo multinacional + transferencia a EE.UU.']},
    tips:{en:['No labor certification (PERM) required — saves 1-2 years.','Often current for most countries (less backlog).','India and China still have multi-year backlogs.'],
          es:['No requiere certificación laboral (PERM) — ahorra 1-2 años.','Frecuentemente vigente para la mayoría de países (menos retraso).','India y China aún tienen retrasos de varios años.']}},
  {id:'eb2', iconName:'star', color:'#5e8eff', cat:'gc', forms:['I-140','I-485'],
    title:{en:'EB-2 Advanced Degree / Exceptional Ability', es:'EB-2 Grado Avanzado / Habilidad Excepcional'},
    summary:{en:'For professionals with master\'s+ degrees or exceptional ability. Standard employer-sponsored path, or NIW (National Interest Waiver) for self-petition.',
             es:'Para profesionales con maestría+ o habilidad excepcional. Vía estándar con patrocinador, o NIW (Exención por Interés Nacional) para auto-petición.'},
    eligibility:{en:['Master\'s degree (or bachelor\'s + 5 years progressive experience)','Standard EB-2: job offer + PERM labor certification','NIW: your work is in U.S. national interest — no employer needed'],
                 es:['Maestría (o licenciatura + 5 años de experiencia progresiva)','EB-2 estándar: oferta de trabajo + certificación PERM','NIW: tu trabajo es de interés nacional — sin empleador']},
    tips:{en:['NIW is a powerful self-petition option — great for entrepreneurs, researchers, healthcare workers.','India backlog: 10+ years. China: ~5 years. Other countries: relatively current.','PERM process takes 6-18 months on its own.'],
          es:['NIW es opción poderosa de auto-petición — ideal para emprendedores, investigadores, trabajadores de salud.','Retraso India: 10+ años. China: ~5 años. Otros: relativamente vigente.','El proceso PERM toma 6-18 meses por sí solo.']}},
  {id:'eb3', iconName:'briefcase', color:'#84807a', cat:'gc', forms:['I-140','I-485'],
    title:{en:'EB-3 Skilled Workers / Professionals', es:'EB-3 Trabajadores Calificados / Profesionales'},
    summary:{en:'For bachelor\'s-degree professionals, skilled workers (2+ years experience), and other workers (unskilled). Standard employer-sponsored path with PERM.',
             es:'Para profesionales con licenciatura, trabajadores calificados (2+ años), y otros trabajadores (no calificados). Vía estándar con patrocinador y PERM.'},
    eligibility:{en:['Bachelor\'s degree OR 2+ years of training/experience','Permanent full-time job offer','Employer completes PERM labor certification'],
                 es:['Licenciatura O 2+ años de capacitación/experiencia','Oferta de trabajo permanente a tiempo completo','Empleador completa certificación PERM']},
    tips:{en:['Longer waits than EB-2 — sometimes much longer for India/China.','"Other Workers" subcategory has its own annual cap of 10,000.','If you qualify for EB-2 NIW, that\'s usually faster.'],
          es:['Esperas más largas que EB-2 — a veces mucho más para India/China.','La subcategoría "Otros trabajadores" tiene su propio tope anual de 10,000.','Si calificas para NIW EB-2, suele ser más rápido.']}},
  {id:'family-spouse', iconName:'ring', color:'#ff4d3a', cat:'family', forms:['I-130','I-485','I-751'],
    title:{en:'Marriage to U.S. Citizen (IR-1/CR-1)', es:'Matrimonio con Ciudadano (IR-1/CR-1)'},
    summary:{en:'Immediate-relative category — no annual cap, no waiting in line. The fastest family-based path to a green card.',
             es:'Categoría de familiar inmediato — sin tope anual, sin esperas. La vía familiar más rápida a la residencia.'},
    eligibility:{en:['Married to a U.S. citizen','Bona fide marriage (not for immigration purposes)','U.S. citizen spouse files I-130 petition','Can adjust status in U.S. or process at consulate abroad'],
                 es:['Casado/a con ciudadano de EE.UU.','Matrimonio de buena fe (no por inmigración)','Cónyuge ciudadano presenta petición I-130','Puede ajustar estatus en EE.UU. o procesar en consulado']},
    tips:{en:['If married < 2 years at GC approval, you get a 2-year conditional GC (CR-1). File I-751 to remove conditions.','Bring tons of evidence: joint bank accounts, leases, photos, communications, affidavits.','3-year rule for naturalization — can file N-400 after 3 years of marriage + GC.'],
          es:['Si casado < 2 años al aprobar GC, obtienes residencia condicional de 2 años (CR-1). Presenta I-751 para remover condiciones.','Trae mucha evidencia: cuentas bancarias conjuntas, contratos, fotos, comunicaciones, declaraciones.','Regla de 3 años para naturalización — N-400 después de 3 años de matrimonio + GC.']}},
  {id:'family-parent', iconName:'people', color:'#ec4f93', cat:'family', forms:['I-130','I-485'],
    title:{en:'Parents of U.S. Citizens (IR-5)', es:'Padres de Ciudadanos (IR-5)'},
    summary:{en:'Immediate-relative category for parents of citizens 21+. No annual cap, no waiting list.',
             es:'Categoría de familiar inmediato para padres de ciudadanos 21+. Sin tope anual, sin lista de espera.'},
    eligibility:{en:['Your son/daughter is a U.S. citizen','They\'re at least 21 years old','They file I-130 petition for you','Step-parent or adoptive-parent relationships qualify (with conditions)'],
                 es:['Tu hijo/a es ciudadano de EE.UU.','Tiene al menos 21 años','Presenta petición I-130 por ti','Padrastros y padres adoptivos califican (con condiciones)']},
    tips:{en:['No quota, so processing is mostly USCIS timelines (~12-18 months).','You can adjust status in the U.S. if you entered legally.','Consular processing if you\'re abroad.'],
          es:['Sin cuota, el procesamiento es mayormente tiempos de USCIS (~12-18 meses).','Puedes ajustar estatus en EE.UU. si entraste legalmente.','Procesamiento consular si estás fuera.']}},
  {id:'asylum', iconName:'shield', color:'#ff9b21', cat:'humanitarian', forms:['I-589','I-765','I-485'],
    title:{en:'Asylum', es:'Asilo'},
    summary:{en:'Protection for people fleeing persecution based on race, religion, nationality, political opinion, or social group membership. Must apply within 1 year of arrival.',
             es:'Protección para personas que huyen de persecución por raza, religión, nacionalidad, opinión política o pertenencia a grupo social. Debes aplicar dentro de 1 año de llegada.'},
    eligibility:{en:['Inside the U.S. (affirmative) or at the border (defensive)','Past persecution OR well-founded fear of future persecution','One of 5 protected grounds','File I-589 within 1 year of arrival (with limited exceptions)'],
                 es:['Dentro de EE.UU. (afirmativo) o en la frontera (defensivo)','Persecución pasada O temor bien fundado de persecución futura','Uno de 5 motivos protegidos','Presenta I-589 dentro de 1 año (con excepciones limitadas)']},
    tips:{en:['Get a lawyer — asylum cases are complex and the stakes are highest.','Work authorization comes after 150 days of pending application.','After 1 year of asylum status, can apply for green card.','5 years total before naturalization eligibility.'],
          es:['Consigue un abogado — los casos de asilo son complejos y las apuestas son altas.','Autorización de trabajo viene después de 150 días con aplicación pendiente.','Después de 1 año con estatus de asilo, puedes pedir residencia.','5 años en total antes de elegibilidad para naturalización.']}},
  {id:'dv', iconName:'globe', color:'#5e8eff', cat:'humanitarian', forms:['DS-260','I-485'],
    title:{en:'Diversity Visa Lottery (DV)', es:'Lotería de Visa de Diversidad (DV)'},
    summary:{en:'55,000 green cards per year by random selection for people from countries with low U.S. immigration. Annual registration in October.',
             es:'55,000 residencias al año por selección aleatoria para personas de países con baja inmigración a EE.UU. Registro anual en octubre.'},
    eligibility:{en:['Born in an eligible country (Mexico, China, India, Philippines, and several others NOT eligible most years)','High school diploma OR 2 years of work in qualifying occupation','Selected in the random draw'],
                 es:['Nacido en país elegible (México, China, India, Filipinas y varios otros NO elegibles la mayoría de años)','Diploma de secundaria O 2 años de trabajo en ocupación calificada','Seleccionado en sorteo aleatorio']},
    tips:{en:['Free to enter — never pay a "DV agent."','Register at dvprogram.state.gov in October each year.','If selected, you get one shot: must complete adjustment or consular processing by Sept 30 of the FY.','Spouses and children under 21 can be derivative beneficiaries.'],
          es:['Entrada gratis — nunca pagues a un "agente DV."','Regístrate en dvprogram.state.gov en octubre cada año.','Si te seleccionan, tienes una oportunidad: debes completar antes del 30 de septiembre del año fiscal.','Cónyuges e hijos menores de 21 pueden ser beneficiarios derivados.']}}
];

var VISA_CATEGORIES = [
  {id:'student', label:{en:'Student & Training', es:'Estudiante y Capacitación'}},
  {id:'work',    label:{en:'Work Visas',          es:'Visas de Trabajo'}},
  {id:'gc',      label:{en:'Green Card (Employment)', es:'Residencia (Empleo)'}},
  {id:'family',  label:{en:'Family-Based',        es:'Por Familia'}},
  {id:'humanitarian', label:{en:'Humanitarian',   es:'Humanitaria'}}
];

var openVisaPath = null;

function renderVisaPaths(){
  var head = document.getElementById('visaHeadSub');
  if(head) head.textContent = lang==='es'
    ? 'Camino te ayuda en cada vía hacia la inmigración a EE.UU.'
    : 'Camino helps you on every path toward U.S. immigration.';
  var list = document.getElementById('visaList');
  if(!list) return;
  var html = '';
  VISA_CATEGORIES.forEach(function(cat){
    var inCat = VISA_PATHS.filter(function(v){return v.cat === cat.id;});
    if(!inCat.length) return;
    html += '<div class="visaCatHead">'+cat.label[lang]+'</div>';
    inCat.forEach(function(v){
      var expanded = openVisaPath === v.id;
      var eligList = '';
      var tipList = '';
      if(expanded){
        v.eligibility[lang].forEach(function(e){ eligList += '<li>'+e+'</li>'; });
        v.tips[lang].forEach(function(t){ tipList += '<li>'+t+'</li>'; });
      }
      html += '<div class="visaCard'+(expanded?' visaOpen':'')+'" onclick="toggleVisaPath(\''+v.id+'\')">'
        + '<div class="visaCardTop">'
        +   '<div class="visaIco" style="background:'+v.color+'1a">'+iconSVG(v.iconName, v.color, 22)+'</div>'
        +   '<div class="visaCardMain">'
        +     '<div class="visaCardTitle">'+v.title[lang]+'</div>'
        +     '<div class="visaCardSummary">'+v.summary[lang]+'</div>'
        +   '</div>'
        +   '<div class="visaCardChev"></div>'
        + '</div>'
        + (expanded
            ? (function(){
                var formsHtml = '';
                if(v.forms && v.forms.length){
                  v.forms.forEach(function(f){ formsHtml += uscisFormButton(f); });
                  formsHtml = '<div class="visaSecLbl">'+(lang==='es'?'Formularios':'Forms')+'</div><div class="visaForms">'+formsHtml+'</div>';
                }
                var howHtml = '';
                if(v.howItWorks && v.howItWorks[lang]){
                  var steps = '';
                  v.howItWorks[lang].forEach(function(s){ steps += '<li>'+s+'</li>'; });
                  howHtml = '<div class="visaSecLbl">'+(lang==='es'?'Cómo funciona':'How it works')+'</div>'
                    + '<ol class="visaList visaSteps">'+steps+'</ol>';
                }
                return '<div class="visaCardDetail">'
                  + '<div class="visaSecLbl">'+(lang==='es'?'Elegibilidad':'Eligibility')+'</div>'
                  + '<ul class="visaList">'+eligList+'</ul>'
                  + howHtml
                  + '<div class="visaSecLbl">'+(lang==='es'?'Consejos clave':'Key tips')+'</div>'
                  + '<ul class="visaList">'+tipList+'</ul>'
                  + formsHtml
                  + '</div>';
              })()
            : '')
        + '</div>';
    });
  });
  list.innerHTML = html;
  populateIcons();
}

function toggleVisaPath(id){
  openVisaPath = (openVisaPath === id) ? null : id;
  renderVisaPaths();
}

// Map user.phase + petitionType to a specific VISA_PATHS entry so the home row
// surfaces the path the user actually chose during onboarding.
function userVisaPathId(){
  var phase = user.phase;
  if(phase === 'student') return 'student';
  if(phase === 'opt') return 'opt';
  if(phase === 'workvisa') return 'h1b';
  if(phase === 'asylum') return 'asylum';
  if(phase === 'preGC'){
    var p = user.petitionType;
    if(p === 'family-ir')   return 'family-spouse';
    if(p === 'family-pref') return 'family-spouse';
    if(p === 'family-lpr')  return 'family-spouse';
    if(p === 'employment')  return 'eb2';
    if(p === 'asylum')      return 'asylum';
  }
  return null; // hasGC, other, or no mapping
}

function findVisaPath(id){
  for(var i=0;i<VISA_PATHS.length;i++) if(VISA_PATHS[i].id === id) return VISA_PATHS[i];
  return null;
}

function renderHomeVisaRow(){
  // Eligibility check row
  var eligRow = document.getElementById('homeEligRow');
  if(eligRow){
    var eligIco = eligRow.querySelector('.rIco');
    var eligT = eligRow.querySelector('.rTitle');
    var eligS = eligRow.querySelector('.rSub');
    if(eligIco){
      eligIco.style.background = 'rgba(0,180,168,.14)';
      eligIco.innerHTML = iconSVG('check', '#00b4a8', 22);
    }
    var doneCount = user.eligWizardResults ? Object.keys(user.eligWizardResults).length : 0;
    if(eligT) eligT.textContent = lang==='es' ? 'Verificar elegibilidad' : 'Check your eligibility';
    if(eligS) eligS.textContent = doneCount > 0
      ? (lang==='es' ? doneCount+' '+(doneCount===1?'completada':'completadas')+' · '+(5-doneCount)+' más' : doneCount+' done · '+(5-doneCount)+' more')
      : (lang==='es' ? 'Asilo · matrimonio · STEM · DV · H-1B' : 'Asylum · marriage · STEM · DV · H-1B');
  }
  // Visa Bulletin row (pre-GC employment / family-pref only)
  var vbRow = document.getElementById('homeVisaBulletinRow');
  if(vbRow){
    var showVB = user.phase === 'preGC' && (user.petitionType === 'employment' || user.petitionType === 'family-pref' || user.petitionType === 'family-lpr');
    vbRow.style.display = showVB ? '' : 'none';
    if(showVB){
      var vbIco = vbRow.querySelector('.rIco');
      var vbT = vbRow.querySelector('.rTitle');
      var vbS = vbRow.querySelector('.rSub');
      if(vbIco){
        vbIco.style.background = 'rgba(255,200,61,.18)';
        vbIco.innerHTML = iconSVG('clock', '#ff9b21', 22);
      }
      if(vbT) vbT.textContent = lang==='es' ? 'Boletín de Visas' : 'Visa Bulletin tracker';
      if(vbS){
        if(user.vbCategory && user.vbCountry){
          var cutoff = getVisaBulletinCutoff(user.vbCategory, user.vbCountry);
          vbS.textContent = user.vbCategory + ' · ' + user.vbCountry + ' · ' + (cutoff ? fmtDate(cutoff, lang) : (lang==='es'?'Vigente':'Current'));
        } else {
          vbS.textContent = lang==='es' ? 'Sigue tu fecha de prioridad' : 'Track your priority date';
        }
      }
    }
  }
  var el = document.getElementById('homeVisaRow');
  var addRow = document.getElementById('homeAdditionalPathsRow');
  if(!el) return;
  var ico = document.getElementById('homeVisaIco') || el.querySelector('.rIco');
  var t = el.querySelector('.rTitle');
  var sub = el.querySelector('.rSub');
  var pathId = userVisaPathId();
  var visa = pathId ? findVisaPath(pathId) : null;

  // Decide what's personalized from the user's onboarding choice.
  var hasPersonalized = (visa && visa.name && visa.name[lang]) || user.phase === 'hasGC';

  if(hasPersonalized){
    // Show "Your path: …" populated from the onboarding choice
    if(visa && visa.name && visa.name[lang]){
      if(ico){
        ico.style.background = (visa.color || '#00b4a8') + '22';
        ico.innerHTML = iconSVG(visa.iconName || 'map', visa.color || '#00b4a8', 22);
      }
      if(t) t.textContent = (lang==='es'?'Tu vía: ':'Your path: ') + visa.name[lang];
      if(sub && visa.sub && visa.sub[lang]) sub.textContent = visa.sub[lang];
      el.onclick = function(){ toggleVisaPath(pathId); go('visaPaths'); };
    } else {
      // hasGC user — citizenship path
      if(ico){
        ico.style.background = 'rgba(255, 200, 61, .22)';
        ico.innerHTML = iconSVG('flag', '#ffc83d', 22);
      }
      if(t) t.textContent = lang==='es' ? 'Tu vía: ciudadanía' : 'Your path: citizenship';
      if(sub) sub.textContent = lang==='es' ? 'N-400 y juramento' : 'N-400 and oath';
      el.onclick = function(){ go('journey'); };
    }
    el.style.display = '';
    // Show secondary "See additional paths" only when a personalized path is shown,
    // so the user can still explore others.
    if(addRow){
      addRow.style.display = '';
      var at = addRow.querySelector('.rTitle');
      var as = addRow.querySelector('.rSub');
      var addIco = addRow.querySelector('.rIco');
      if(addIco){
        addIco.style.background = 'rgba(28,176,246,.16)';
        addIco.innerHTML = iconSVG('globe', '#1cb0f6', 22);
      }
      if(at) at.textContent = lang==='es' ? 'Ver vías adicionales' : 'See additional paths';
      if(as) as.textContent = lang==='es'
        ? 'Estudiante · trabajo · familia · asilo · DV'
        : 'Student · work · family · asylum · DV';
    }
  } else {
    // No personalized path from onboarding — hide the "Your path" row entirely so
    // we don't duplicate the explore CTA, and let the additional-paths row be the
    // single discovery entry. This row's label adjusts since it's now standalone.
    el.style.display = 'none';
    if(addRow){
      addRow.style.display = '';
      var at2 = addRow.querySelector('.rTitle');
      var as2 = addRow.querySelector('.rSub');
      var addIco2 = addRow.querySelector('.rIco');
      if(addIco2){
        addIco2.style.background = 'rgba(0,180,168,.14)';
        addIco2.innerHTML = iconSVG('map', '#00b4a8', 22);
      }
      if(at2) at2.textContent = lang==='es' ? 'Explora las vías de inmigración' : 'Explore immigration paths';
      if(as2) as2.textContent = lang==='es'
        ? 'Encuentra la que te aplica'
        : 'Find the one that fits';
    }
  }
}

// ===== N-400 FORM WALKTHROUGH =====
var N400_SECTIONS = [
  {
    id:'eligibility', part:'Part 1', icon:'📋', forms:['N-400'],
    title:{en:'Eligibility basis', es:'Base de elegibilidad'},
    asked:{en:'Which rule are you applying under?', es:'¿Bajo qué regla estás aplicando?'},
    body:{en:'Choose: the 5-year rule (most LPRs), the 3-year rule (3+ years married to a U.S. citizen), or a military basis. The form changes based on your answer.',
          es:'Elige: regla de 5 años (la mayoría), regla de 3 años (3+ años casado/a con ciudadano), o base militar. El formulario cambia según tu respuesta.'},
    tip:{en:'You must have been a permanent resident for the FULL required time before filing. Your green-card date — not your filing date — is what counts.',
         es:'Debes haber sido residente permanente por el tiempo completo antes de presentar. Tu fecha de residencia — no la de presentación — es lo que cuenta.'},
    docs:{en:['Green card (front and back)','Marriage certificate (3-year rule)','Spouse\'s proof of citizenship (3-year rule)','Military discharge papers (military basis)'],
          es:['Residencia (frente y reverso)','Acta de matrimonio (regla de 3 años)','Prueba de ciudadanía del cónyuge (regla de 3 años)','Documentos de baja militar (base militar)']}
  },
  {
    id:'about-you', part:'Part 2', icon:'👤',
    title:{en:'About you', es:'Sobre ti'},
    asked:{en:'Your legal names, date and place of birth, country of citizenship, SSN, A-Number.', es:'Tus nombres legales, fecha y lugar de nacimiento, ciudadanía, SSN, número A.'},
    body:{en:'USCIS needs every name you have ever used — including names from prior marriages, names from childhood, and any aliases on official documents.',
          es:'USCIS necesita cada nombre que hayas usado — incluyendo nombres de matrimonios anteriores, nombres de la infancia y cualquier alias en documentos oficiales.'},
    tip:{en:'List ALL names ever used. Forgetting an alias or maiden name can flag your application as inconsistent with your other records.',
         es:'Lista TODOS los nombres usados. Olvidar un alias o nombre de soltera puede marcar tu aplicación como inconsistente con tus otros registros.'},
    docs:{en:['Birth certificate','Current passport','Social Security card','Green card','Documentation of any name changes (court order, marriage cert)'],
          es:['Acta de nacimiento','Pasaporte vigente','Tarjeta de Seguro Social','Residencia','Documentación de cambios de nombre (orden judicial, acta de matrimonio)']}
  },
  {
    id:'addresses', part:'Part 5', icon:'🏠',
    title:{en:'5-year address history', es:'Direcciones de 5 años'},
    asked:{en:'Every physical address where you have lived in the past 5 years, with start and end dates.', es:'Cada dirección física donde has vivido en los últimos 5 años, con fechas de inicio y fin.'},
    body:{en:'No gaps allowed. If you split your time between two places, list both. PO boxes don\'t count as residences.',
          es:'Sin lagunas. Si dividiste tu tiempo entre dos lugares, lista ambos. Los apartados postales no cuentan como residencias.'},
    tip:{en:'Pull up old leases, utility bills, mail forwarding, and tax returns to reconstruct dates. USPS change-of-address records are gold.',
         es:'Saca contratos viejos, facturas de servicios, reenvíos de correo y declaraciones de impuestos para reconstruir fechas. Los registros de cambio de dirección de USPS son oro.'},
    docs:{en:['Past leases or mortgage statements','Utility bills','Tax returns (W-2s show your address)','USPS change-of-address confirmations'],
          es:['Contratos de arrendamiento o hipoteca','Facturas de servicios','Declaraciones de impuestos (los W-2 muestran tu dirección)','Confirmaciones de cambio de dirección de USPS']}
  },
  {
    id:'employment', part:'Part 8', icon:'💼',
    title:{en:'Employment history', es:'Historial laboral'},
    asked:{en:'Every employer, school, or unemployment period in the past 5 years.', es:'Cada empleador, escuela o período de desempleo en los últimos 5 años.'},
    body:{en:'Include employer name, address, your job title, and exact start and end dates. Periods of unemployment, school, or self-employment must be listed too — leave no gaps.',
          es:'Incluye nombre del empleador, dirección, tu puesto, y fechas exactas de inicio y fin. Períodos de desempleo, escuela o trabajo propio también deben listarse — no dejes lagunas.'},
    tip:{en:'If unemployed for any stretch, write "Unemployed" with the dates. A gap reads as concealment, not as nothing.',
         es:'Si estuviste desempleado por un período, escribe "Desempleado" con las fechas. Una laguna parece encubrimiento, no nada.'},
    docs:{en:['W-2s and 1099s from each year','Pay stubs','School transcripts (if you were a student)','Self-employment tax records'],
          es:['W-2 y 1099 de cada año','Talones de pago','Transcripciones escolares (si fuiste estudiante)','Registros de impuestos de trabajo propio']}
  },
  {
    id:'trips', part:'Part 9', icon:'✈️',
    title:{en:'Time outside the U.S.', es:'Tiempo fuera de EE.UU.'},
    asked:{en:'Every trip outside the U.S. lasting 24 hours or more in the past 5 years.', es:'Cada viaje fuera de EE.UU. de 24 horas o más en los últimos 5 años.'},
    body:{en:'Even short cross-border runs to Mexico or Canada count. Departure date, return date, and country. Trips longer than 6 months can break your continuous residence.',
          es:'Incluso viajes cortos a México o Canadá cuentan. Fecha de salida, fecha de regreso, y país. Viajes de más de 6 meses pueden romper tu residencia continua.'},
    tip:{en:'Your passport stamps reveal trips you forgot. USCIS pulls your I-94 history at the interview — match it exactly.',
         es:'Los sellos de tu pasaporte revelan viajes que olvidaste. USCIS revisa tu historial I-94 en la entrevista — debe coincidir exactamente.'},
    docs:{en:['ALL passports (current and expired) for the past 5 years','I-94 travel record (i94.cbp.dhs.gov)','Airline records or itineraries','CBP border-crossing records'],
          es:['TODOS los pasaportes (vigentes y vencidos) de los últimos 5 años','Registro I-94 de viajes (i94.cbp.dhs.gov)','Registros o itinerarios de vuelos','Registros de cruce de CBP']}
  },
  {
    id:'marital', part:'Part 10', icon:'💍',
    title:{en:'Marital history', es:'Historial matrimonial'},
    asked:{en:'Current marriage AND every prior marriage — yours and your current spouse\'s.', es:'Matrimonio actual Y todos los matrimonios anteriores — tuyos y de tu cónyuge actual.'},
    body:{en:'For each marriage: spouse\'s full name, date of marriage, how it ended (divorce, death, annulment), and the date it ended.',
          es:'Para cada matrimonio: nombre completo del cónyuge, fecha de matrimonio, cómo terminó (divorcio, muerte, anulación), y la fecha en que terminó.'},
    tip:{en:'USCIS cross-checks state vital records. A hidden prior marriage that surfaces later can lead to denaturalization, even years after you become a citizen.',
         es:'USCIS verifica con registros estatales. Un matrimonio anterior oculto que aparezca después puede llevar a desnaturalización, incluso años después de hacerte ciudadano.'},
    docs:{en:['Current marriage certificate','Divorce decrees for all prior marriages (yours and spouse\'s)','Death certificates if a prior spouse is deceased','Annulment documents if applicable'],
          es:['Acta de matrimonio actual','Decretos de divorcio de matrimonios anteriores (tuyos y del cónyuge)','Actas de defunción si un cónyuge anterior falleció','Documentos de anulación si aplica']}
  },
  {
    id:'children', part:'Part 11', icon:'👶',
    title:{en:'Children', es:'Hijos'},
    asked:{en:'ALL children — biological, adopted, step-children — living or deceased, regardless of where they live.', es:'TODOS los hijos — biológicos, adoptados, hijastros — vivos o fallecidos, sin importar dónde vivan.'},
    body:{en:'Include children from prior relationships, children you don\'t have custody of, and children born outside the U.S. Provide each child\'s name, date of birth, and country of birth.',
          es:'Incluye hijos de relaciones anteriores, hijos de los que no tienes custodia, e hijos nacidos fuera de EE.UU. Provee el nombre, fecha de nacimiento y país de nacimiento de cada uno.'},
    tip:{en:'Once you naturalize, your U.S.-citizen status can pass to certain children automatically (N-600). Listing them now keeps that path open.',
         es:'Al naturalizarte, tu estatus de ciudadano puede pasar a ciertos hijos automáticamente (N-600). Listarlos ahora mantiene esa vía abierta.'},
    docs:{en:['Birth certificate for each child','Adoption decrees (if applicable)','Court orders for custody/support','Children\'s passports if foreign-born'],
          es:['Acta de nacimiento de cada hijo','Decretos de adopción (si aplica)','Órdenes judiciales de custodia/manutención','Pasaportes de los hijos si nacieron en el extranjero']}
  },
  {
    id:'have-you-ever', part:'Part 12', icon:'⚠️', forms:['N-400','N-648'],
    title:{en:'"Have you ever..." questions', es:'Preguntas "¿Alguna vez...?"'},
    asked:{en:'50+ yes/no questions about criminal history, immigration violations, party memberships, drug use, lying to immigration officers, and more.',
           es:'50+ preguntas de sí/no sobre historial penal, violaciones migratorias, membresías políticas, uso de drogas, mentir a oficiales de inmigración, y más.'},
    body:{en:'Even arrests with no charges, dismissed cases, expunged records, juvenile incidents, and traffic incidents over a fine threshold must be disclosed. "Have you ever" means EVER — there is no time limit.',
          es:'Incluso arrestos sin cargos, casos desestimados, registros eliminados, incidentes juveniles, y multas de tráfico por encima del umbral deben revelarse. "Alguna vez" significa NUNCA — no hay límite de tiempo.'},
    tip:{en:'⚠️ If you answer "yes" to ANY question in Part 12, stop and talk to an immigration lawyer BEFORE filing. A surprise "yes" at the interview can result in denial, denaturalization, or deportation. Free consults are available — check the Find Help section.',
         es:'⚠️ Si respondes "sí" a CUALQUIER pregunta de la Parte 12, detente y habla con un abogado de inmigración ANTES de presentar. Un "sí" sorpresa en la entrevista puede resultar en negación, desnaturalización o deportación. Hay consultas gratuitas — revisa la sección de Ayuda Legal.'},
    docs:{en:['Court records and dispositions for ANY arrest or charge (even if dismissed)','Police reports','FBI background check (highly recommended)','Records of any immigration violations or removals'],
          es:['Registros judiciales y resoluciones de CUALQUIER arresto o cargo (incluso si fue desestimado)','Reportes policiales','Verificación de antecedentes del FBI (muy recomendado)','Registros de violaciones migratorias o remociones']}
  }
];

var n400State = null;

// Card that opens the educational N-400 walkthrough (replaces the old fill-in helper card).
function n400WalkthroughCard(){
  var wp = user.n400Progress || {};
  var wt = N400_SECTIONS.length;
  var sub = wp.completed
    ? (lang==='es' ? 'Guía completada · repásala cuando quieras' : 'Guide complete · revisit anytime')
    : (wp.lastSection
        ? (lang==='es' ? 'Continúa · sección '+(Math.min(wp.lastSection+1,wt))+' de '+wt : 'Continue · section '+(Math.min(wp.lastSection+1,wt))+' of '+wt)
        : (lang==='es' ? wt+' secciones · qué pide USCIS y por qué' : wt+' sections · what USCIS asks and why'));
  return '<div class="n400HelperCard" onclick="startN400Walkthrough()">'
    + '<div class="n400HelperHead">'
    +   '<div class="n400HelperIco">'+iconSVG('doc','#fff',20)+'</div>'
    +   '<div class="n400HelperMain">'
    +     '<div class="n400HelperTitle">'+(lang==='es'?'Guía del N-400':'N-400 walkthrough')+'</div>'
    +     '<div class="n400HelperSub">'+sub+'</div>'
    +   '</div>'
    +   '<div class="n400HelperArrow">→</div>'
    + '</div>'
    + '</div>';
}

function startN400Walkthrough(resume){
  var start = 0;
  if(resume !== false && user.n400Progress && !user.n400Progress.completed && user.n400Progress.lastSection){
    start = Math.min(user.n400Progress.lastSection, N400_SECTIONS.length - 1);
  }
  n400State = { step: start };
  go('n400');
  renderN400();
}

function exitN400(){
  n400State = null;
  go('home');
}

function n400Next(){
  if(!n400State) return;
  user.n400Progress = user.n400Progress || {};
  if(n400State.step >= N400_SECTIONS.length - 1){
    user.n400Progress.lastSection = N400_SECTIONS.length - 1;
    user.n400Progress.completed = true;
    saveUser();
    renderAll();
    exitN400();
    return;
  }
  n400State.step++;
  user.n400Progress.lastSection = n400State.step;
  saveUser();
  renderHomeN400Row();
  renderN400();
}

function n400Prev(){
  if(!n400State) return;
  if(n400State.step === 0){ exitN400(); return; }
  n400State.step--;
  if(user.n400Progress){
    user.n400Progress.lastSection = n400State.step;
    saveUser();
  }
  renderN400();
}

function renderN400(){
  if(!n400State) return;
  var s = N400_SECTIONS[n400State.step];
  if(!s) return;

  var fill = document.getElementById('n400ProgressFill');
  if(fill) fill.style.width = ((n400State.step + 1) / N400_SECTIONS.length * 100) + '%';
  var counter = document.getElementById('n400Counter');
  if(counter) counter.textContent = (n400State.step + 1) + ' / ' + N400_SECTIONS.length;

  var body = document.getElementById('n400Body');
  if(!body) return;

  var docsHtml = '';
  s.docs[lang].forEach(function(d){ docsHtml += '<li>'+d+'</li>'; });

  var formsBlock = '';
  if(s.forms && s.forms.length){
    var fb = '';
    s.forms.forEach(function(f){ fb += uscisFormButton(f); });
    formsBlock = '<div class="n400DocsLabel">📥 '+(lang==='es'?'Descargar de USCIS.gov':'Get from USCIS.gov')+'</div>'
      + '<div class="n400Forms">'+fb+'</div>';
  }

  body.innerHTML =
      '<div class="n400Part">'+s.icon+' '+s.part+'</div>'
    + '<div class="n400Title">'+s.title[lang]+'</div>'
    + '<div class="n400AskedLbl">'+(lang==='es'?'¿Qué pregunta USCIS?':'What USCIS asks')+'</div>'
    + '<div class="n400Asked">'+s.asked[lang]+'</div>'
    + '<div class="n400Body">'+s.body[lang]+'</div>'
    + '<div class="n400TipBox">'
    +   '<div class="n400TipLabel">'+iconSVG('lightbulb','#ff9b21',14)+' '+(lang==='es'?'Pista clave':'Key tip')+'</div>'
    +   '<div class="n400TipBody">'+s.tip[lang]+'</div>'
    + '</div>'
    + formsBlock
    + '<div class="n400DocsLabel">📋 '+(lang==='es'?'Documentos para esta sección':'Documents for this section')+'</div>'
    + '<ul class="n400Docs">'+docsHtml+'</ul>';

  var footer = document.getElementById('n400Footer');
  if(footer){
    var isLast = n400State.step === N400_SECTIONS.length - 1;
    var nextLabel = isLast ? (lang==='es'?'Terminar':'Finish') : (lang==='es'?'Siguiente':'Next');
    footer.innerHTML = '<button class="n400Prev" onclick="n400Prev()">'+(lang==='es'?'← Atrás':'← Back')+'</button>'
      + '<button class="cta n400NextBtn" onclick="n400Next()">'+nextLabel+' →</button>';
  }
}

// ===== LEGAL HELP DIRECTORY =====
var PROVIDERS = [
  {
    id:'clinic-affiliate', tier:'free',
    name:{en:'CLINIC Affiliate Network',es:'Red CLINIC'},
    type:'nonprofit', trust:'uscis-recognized', cost:'free',
    services:['naturalization','family','asylum'], languages:['en','es'],
    desc:{en:'Catholic Legal Immigration Network — 380+ affiliate offices nationwide. Free or low-cost help.',
          es:'Red Católica de Inmigración Legal — 380+ oficinas afiliadas. Ayuda gratis o de bajo costo.'},
    phone:'+1 301-565-4800', web:'cliniclegal.org'
  },
  {
    id:'ilrc', tier:'free',
    name:{en:'Immigrant Legal Resource Center',es:'Centro de Recursos Legales para Inmigrantes'},
    type:'nonprofit', trust:'uscis-recognized', cost:'free',
    services:['naturalization','daca','vawa'], languages:['en','es'],
    desc:{en:'National nonprofit. Find a free or low-cost provider in your state.',
          es:'Organización nacional sin fines de lucro. Encuentra un proveedor en tu estado.'},
    phone:'+1 415-255-9499', web:'ilrc.org/find-help'
  },
  {
    id:'state-bar-ref', tier:'free',
    name:{en:'State Bar Lawyer Referral',es:'Referido del Colegio de Abogados'},
    type:'state-bar', trust:'state-bar', cost:'$50 / 30 min',
    services:['naturalization','family','employment','criminal-related'], languages:['en','es'],
    desc:{en:'Pre-screened licensed attorneys. First consult is usually $50 for 30 minutes.',
          es:'Abogados con licencia pre-evaluados. Primera consulta suele costar $50 por 30 min.'},
    phone:'+1 800-555-0200', web:'findlegalhelp.org'
  },
  {
    id:'uscis-recognized-rep', tier:'free',
    name:{en:'USCIS-Accredited Representative',es:'Representante Acreditado por USCIS'},
    type:'accredited-rep', trust:'uscis-recognized', cost:'free',
    services:['naturalization','family'], languages:['en','es'],
    desc:{en:'Non-attorney representatives recognized by the DOJ to file immigration applications.',
          es:'Representantes no-abogados reconocidos por el DOJ para presentar aplicaciones.'},
    phone:'+1 800-555-0300', web:'justice.gov/eoir'
  },
  {
    id:'law-school-clinic', tier:'free',
    name:{en:'University Law School Clinic',es:'Clínica Legal Universitaria'},
    type:'nonprofit', trust:'verified', cost:'free',
    services:['naturalization','asylum'], languages:['en','es'],
    desc:{en:'Free representation by supervised law students. Income limits typically apply.',
          es:'Representación gratuita por estudiantes de derecho supervisados. Aplican límites de ingreso.'},
    phone:'+1 800-555-0400', web:'aals.org'
  },
  {
    id:'fee-waiver-help', tier:'free',
    name:{en:'Fee Waiver Help (I-912)',es:'Ayuda con Exención (I-912)'},
    type:'nonprofit', trust:'verified', cost:'free',
    services:['fee-waiver','naturalization'], languages:['en','es'],
    desc:{en:'Walk-in help filling out Form I-912 (fee waiver). Available at many public libraries.',
          es:'Ayuda sin cita para llenar el Formulario I-912. Disponible en muchas bibliotecas públicas.'},
    phone:'+1 800-555-0700', web:'uscis.gov/i-912'
  },
  {
    id:'sponsored-garcia', tier:'sponsored',
    name:{en:'Garcia Immigration Law',es:'Garcia Inmigración'},
    type:'private', trust:'verified-attorney', cost:'From $1,200 flat',
    services:['naturalization','family','complex-cases'], languages:['en','es'],
    desc:{en:'Full-service immigration firm. Flat fees, free 15-min consult. Handles cases with prior issues.',
          es:'Despacho de inmigración. Tarifas fijas, consulta gratis de 15 min. Maneja casos con problemas previos.'},
    phone:'+1 800-555-0500', web:'garcia-immigration-example.com'
  },
  {
    id:'sponsored-mendoza', tier:'sponsored',
    name:{en:'Mendoza & Associates',es:'Mendoza y Asociados'},
    type:'private', trust:'verified-attorney', cost:'From $1,500 flat',
    services:['naturalization','asylum','removal-defense'], languages:['en','es'],
    desc:{en:'Removal-defense and complex naturalization. Bilingual staff. Payment plans available.',
          es:'Defensa de remoción y naturalización compleja. Personal bilingüe. Planes de pago disponibles.'},
    phone:'+1 800-555-0600', web:'mendoza-law-example.com'
  }
];

function trustBadge(t, l){
  var map = {
    'uscis-recognized': {en:'USCIS-Recognized',   es:'Reconocido por USCIS', cls:'tbUSCIS'},
    'state-bar':        {en:'State Bar Referral', es:'Colegio de Abogados',  cls:'tbBar'},
    'verified-attorney':{en:'Verified Attorney',  es:'Abogado Verificado',   cls:'tbAtty'},
    'verified':         {en:'Verified',           es:'Verificado',           cls:'tbVerified'}
  };
  var e = map[t]; if(!e) return '';
  return '<span class="trustBadge '+e.cls+'">'+e[l]+'</span>';
}

function tierLabel(t, l){
  if(t === 'sponsored') return '<span class="tierBadge tierSponsored">'+(l==='es'?'Promocionado':'Sponsored')+'</span>';
  return '';
}

function needsLegalHelp(){
  return user.criminalHistory === true || (user.eligibility && user.eligibility.passed === false);
}

function renderHelp(){
  // Repurposed: the legacy renderHelp now drives the FAQ view via renderHelpFAQ.
  if(document.getElementById('helpBody')){
    renderHelpFAQ();
    return;
  }
  var list = document.getElementById('helpList');
  var head = document.getElementById('helpHeadline');
  if(!list) return;
  if(head){
    head.textContent = needsLegalHelp()
      ? (lang==='es' ? 'Te recomendamos hablar con alguien antes de presentar.' : 'We recommend talking to someone before you file.')
      : (lang==='es' ? 'Opciones gratuitas y pagadas para tu caso.' : 'Free and paid options for your case.');
  }
  var ordered = PROVIDERS.slice().sort(function(a,b){
    if(a.tier === b.tier) return 0;
    return a.tier === 'free' ? -1 : 1;
  });
  var html = '';
  var lastTier = null;
  for(var i=0;i<ordered.length;i++){
    var p = ordered[i];
    if(p.tier !== lastTier){
      lastTier = p.tier;
      var sec = (p.tier === 'free')
        ? (lang==='es' ? 'Gratis o de bajo costo' : 'Free or low-cost')
        : (lang==='es' ? 'Despachos privados · Promocionado' : 'Private firms · Sponsored');
      html += '<div class="helpCatHead">'+(p.tier==='free'?'🤝 ':'⭐ ')+sec+'</div>';
    }
    var nm = (typeof p.name === 'object') ? p.name[lang] : p.name;
    var dc = p.desc[lang] || p.desc.en;
    var langPills = p.languages.map(function(L){return '<span class="helpLang">'+L.toUpperCase()+'</span>';}).join('');
    var cost = (p.cost === 'free') ? (lang==='es'?'Gratis':'Free') : p.cost;
    var webNice = p.web.replace(/^https?:\/\//,'');
    var phoneAttr = p.phone.replace(/[^+0-9]/g,'');
    html += '<div class="helpCard">'
      + '<div class="helpName">'+nm+'</div>'
      + '<div class="helpBadges">'+trustBadge(p.trust, lang)+tierLabel(p.tier, lang)+langPills+'</div>'
      + '<div class="helpDesc">'+dc+'</div>'
      + '<div class="helpFoot">'
      +   '<div class="helpCost">'+cost+'</div>'
      +   '<a class="helpCall" href="tel:'+phoneAttr+'"><span class="helpCallIco">'+iconSVG('mic','#1cb0f6',13)+'</span>'+p.phone+'</a>'
      +   '<a class="helpWeb" href="https://'+webNice+'" target="_blank" rel="noopener">'+webNice+'</a>'
      + '</div>'
      + '</div>';
  }
  list.innerHTML = html;
  populateIcons();
}

function renderHomeAlert(){
  var el = document.getElementById('homeAlert');
  if(!el) return;
  if(!needsLegalHelp()){ el.innerHTML = ''; el.style.display='none'; return; }
  el.style.display = 'flex';
  var reason = user.criminalHistory === true
    ? (lang==='es' ? 'Marcaste antecedentes penales en el onboarding.' : 'You flagged a criminal history in onboarding.')
    : (lang==='es' ? 'Tu chequeo de elegibilidad encontró un problema.' : 'Your eligibility check found an issue.');
  el.innerHTML = '<div class="alertIcon">⚠️</div>'
    + '<div class="alertMain">'
    +   '<div class="alertTitle">'+(lang==='es'?'Habla con un abogado primero':'Talk to a lawyer first')+'</div>'
    +   '<div class="alertSub">'+reason+'</div>'
    + '</div>'
    + '<button class="alertBtn" onclick="go(\'help\')">'+(lang==='es'?'Buscar ayuda':'Find help')+'</button>';
}

function renderHomeHelpRow(){
  var el = document.getElementById('homeHelpRow');
  if(!el) return;
  var t = el.querySelector('.rTitle');
  var sub = el.querySelector('.rSub');
  if(t){ t.removeAttribute('data-en'); t.removeAttribute('data-es'); t.textContent = lang==='es' ? 'Encuentra ayuda legal' : 'Find legal help'; }
  if(sub){ sub.removeAttribute('data-en'); sub.removeAttribute('data-es'); sub.textContent = lang==='es'
    ? 'Gratis, sin fines de lucro y abogados verificados'
    : 'Free, nonprofit, and verified attorneys'; }
}

function renderHomeDatesRow(){
  var el = document.getElementById('homeDatesRow');
  if(!el) return;
  var t = el.querySelector('.rTitle');
  var sub = el.querySelector('.rSub');
  if(t){ t.textContent = lang==='es' ? 'Fechas importantes' : 'Important dates'; }
  if(sub){
    var ds = getImportantDates();
    var next = null;
    for(var i=0;i<ds.length;i++){ if(ds[i].status !== 'past'){ next = ds[i]; break; } }
    if(next){
      var title = (typeof next.title === 'object') ? next.title[lang] : next.title;
      var dt = next.isRange ? fmtMonthRange(next.date, next.dateHigh || next.date, lang) : fmtDate(next.date, lang);
      sub.textContent = (lang==='es'?'Próximo: ':'Next: ') + title + ' · ' + dt;
    } else {
      sub.textContent = lang==='es' ? 'Hitos de tu camino' : 'Milestones on your path';
    }
  }
}

function renderHomeN400Row(){
  var el = document.getElementById('homeN400Row');
  if(!el) return;
  el.style.display = isOnGCPath() ? '' : 'none';
  var t = el.querySelector('.rTitle');
  var sub = el.querySelector('.rSub');
  var p = user.n400Progress || {};
  if(t){ t.textContent = lang==='es' ? 'Guía del Formulario N-400' : 'N-400 form walkthrough'; }
  if(sub){
    if(p.completed){
      sub.textContent = lang==='es' ? '✓ Completado · revisar las 8 secciones' : '✓ Complete · review the 8 sections';
    } else if(typeof p.lastSection === 'number' && p.lastSection > 0){
      var part = p.lastSection + 1;
      sub.textContent = lang==='es' ? 'Continuar desde la Parte '+part+' de '+N400_SECTIONS.length : 'Resume from Part '+part+' of '+N400_SECTIONS.length;
    } else {
      sub.textContent = lang==='es' ? '8 secciones · evita errores comunes' : '8 sections · avoid common mistakes';
    }
  }
}

// ===== N-400 FORM HELPER (stateful, local-only organizer) =====
// A guided intake for the user's OWN answers. Legal guardrails, enforced by design:
//  - never suggests, recommends, or prefills a substantive answer
//  - helpText explains what USCIS asks; it never advises what to answer
//  - no eligibility/approval language anywhere
//  - nothing is filed; output is a summary the user transfers to the official
//    form themselves. All data stays in localStorage (user.n400). No network.

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

var N400_FLAG_NOTE = {
  en: 'Worth reviewing with a licensed immigration attorney or BIA-accredited representative before you file. It does not necessarily disqualify you — but get advice for your specific situation.',
  es: 'Vale la pena revisarlo con un abogado de inmigración o un representante acreditado por la BIA antes de presentar. No necesariamente te descalifica — pero busca asesoría para tu situación.'
};

var N400_SCHEMA = [
  {
    id:'basis', iconName:'stamp', color:'#5e5ce6', partRef:'Part 1',
    title:{en:'Eligibility basis', es:'Base de elegibilidad'},
    intro:{en:'The first question on the N-400: under which rule you are applying. Camino does not determine which applies to you — check the official instructions or ask a professional if unsure.',
           es:'La primera pregunta del N-400: bajo qué regla presentas. Camino no determina cuál aplica a ti — consulta las instrucciones oficiales o a un profesional si tienes duda.'},
    questions:[
      {id:'basis_type', type:'select', required:true,
       label:{en:'Basis for applying', es:'Base para aplicar'},
       help:{en:'The N-400 asks you to pick one. The most common are 5 years as a permanent resident, or 3 years if married to (and living with) a U.S. citizen.',
             es:'El N-400 pide elegir una. Las más comunes: 5 años como residente permanente, o 3 años si estás casado(a) y viviendo con un ciudadano.'},
       options:[
         {v:'5yr',      label:{en:'5 years as a permanent resident', es:'5 años como residente permanente'}},
         {v:'3yr',      label:{en:'3 years, married to a U.S. citizen', es:'3 años, casado(a) con ciudadano(a)'}},
         {v:'military', label:{en:'U.S. military service', es:'Servicio militar de EE. UU.'}},
         {v:'other',    label:{en:'Other basis', es:'Otra base'}}
       ]},
      {id:'basis_gcDate', type:'date', required:true,
       label:{en:'Date you became a permanent resident', es:'Fecha en que fuiste residente permanente'},
       help:{en:'Printed on your green card as "Resident Since."', es:'Aparece en tu green card como "Resident Since."'}}
    ]
  },
  {
    id:'personal', iconName:'id', color:'#1cb0f6', partRef:'Part 2',
    title:{en:'Information about you', es:'Información sobre ti'},
    intro:{en:'Your identity exactly as USCIS has it on file.', es:'Tu identidad exactamente como USCIS la tiene registrada.'},
    questions:[
      {id:'p_familyName', type:'text', required:true,
       label:{en:'Family name / last name (as on your green card)', es:'Apellido(s) (como en tu green card)'}},
      {id:'p_givenName', type:'text', required:true,
       label:{en:'Given name / first name', es:'Nombre'}},
      {id:'p_middleName', type:'text', required:false,
       label:{en:'Middle name', es:'Segundo nombre'}},
      {id:'p_otherNames', type:'text', required:false,
       label:{en:'Other names you have used', es:'Otros nombres que has usado'},
       help:{en:'Maiden name, nicknames used on documents, aliases. Leave blank if none.', es:'Nombre de soltera, apodos usados en documentos, alias. Deja en blanco si no aplica.'}},
      {id:'p_nameChange', type:'yesno', required:false,
       label:{en:'Do you want to legally change your name when you naturalize?', es:'¿Quieres cambiar legalmente tu nombre al naturalizarte?'},
       help:{en:'The N-400 lets you request a name change that takes effect at your oath ceremony.', es:'El N-400 permite pedir un cambio de nombre que toma efecto en tu ceremonia de juramento.'}},
      {id:'p_dob', type:'date', required:true, label:{en:'Date of birth', es:'Fecha de nacimiento'}},
      {id:'p_birthCountry', type:'text', required:true, label:{en:'Country of birth', es:'País de nacimiento'}},
      {id:'p_citCountry', type:'text', required:true, label:{en:'Country of citizenship or nationality', es:'País de ciudadanía o nacionalidad'}},
      {id:'p_aNumber', type:'text', required:true,
       label:{en:'A-Number', es:'Número A'},
       help:{en:'On your green card; starts with "A".', es:'En tu green card; empieza con "A".'}},
      {id:'p_ssn', type:'text', required:false,
       label:{en:'Social Security number', es:'Número de Seguro Social'},
       help:{en:'Optional to save here — you can add it directly on the official form if you prefer.', es:'Opcional guardarlo aquí — puedes ponerlo directamente en el formulario oficial si prefieres.'}}
    ]
  },
  {
    id:'bio', iconName:'person', color:'#ec4f93', partRef:'Part 3',
    title:{en:'Biographic information', es:'Información biográfica'},
    intro:{en:'Physical description used for your records and background checks.', es:'Descripción física usada para tus registros y verificación de antecedentes.'},
    questions:[
      {id:'b_height', type:'text', required:false, label:{en:'Height', es:'Estatura'}, help:{en:'Feet and inches (e.g., 5\'7").', es:'Pies y pulgadas (ej. 5\'7").'}},
      {id:'b_weight', type:'text', required:false, label:{en:'Weight (lbs)', es:'Peso (libras)'}},
      {id:'b_eyes', type:'select', required:false, label:{en:'Eye color', es:'Color de ojos'},
       options:[{v:'brown',label:{en:'Brown',es:'Café'}},{v:'black',label:{en:'Black',es:'Negro'}},{v:'blue',label:{en:'Blue',es:'Azul'}},{v:'green',label:{en:'Green',es:'Verde'}},{v:'hazel',label:{en:'Hazel',es:'Avellana'}},{v:'gray',label:{en:'Gray',es:'Gris'}},{v:'other',label:{en:'Other',es:'Otro'}}]},
      {id:'b_hair', type:'select', required:false, label:{en:'Hair color', es:'Color de cabello'},
       options:[{v:'black',label:{en:'Black',es:'Negro'}},{v:'brown',label:{en:'Brown',es:'Café'}},{v:'blond',label:{en:'Blond',es:'Rubio'}},{v:'gray',label:{en:'Gray',es:'Gris'}},{v:'white',label:{en:'White',es:'Blanco'}},{v:'red',label:{en:'Red',es:'Rojo'}},{v:'bald',label:{en:'Bald / none',es:'Calvo / sin cabello'}},{v:'other',label:{en:'Other',es:'Otro'}}]}
    ]
  },
  {
    id:'residence', iconName:'home', color:'#ff9b21', partRef:'Parts 4 & 7',
    title:{en:'Residence & employment', es:'Residencia y empleo'},
    intro:{en:'Where you have lived and worked for the last 5 years, most recent first, with no gaps.', es:'Dónde has vivido y trabajado los últimos 5 años, de lo más reciente a lo más antiguo, sin huecos.'},
    questions:[
      {id:'r_addresses', type:'group', required:true,
       label:{en:'Addresses (last 5 years)', es:'Direcciones (últimos 5 años)'},
       help:{en:'Every address, even short stays.', es:'Cada dirección, incluso estancias cortas.'},
       addLabel:{en:'+ Add address', es:'+ Agregar dirección'},
       fields:[
         {id:'street', type:'text', label:{en:'Street number and name', es:'Número y calle'}},
         {id:'city', type:'text', label:{en:'City or town', es:'Ciudad'}},
         {id:'state', type:'text', label:{en:'State (2 letters, e.g. FL)', es:'Estado (2 letras, ej. FL)'}},
         {id:'zip', type:'text', label:{en:'ZIP code', es:'Código postal'}},
         {id:'from', type:'date', label:{en:'From', es:'Desde'}},
         {id:'to', type:'date', label:{en:'To (blank = current)', es:'Hasta (vacío = actual)'}}
       ]},
      {id:'r_employers', type:'group', required:true,
       label:{en:'Employment / school (last 5 years)', es:'Empleo / escuela (últimos 5 años)'},
       help:{en:'Include periods of unemployment, self-employment, and school.', es:'Incluye periodos de desempleo, trabajo propio y escuela.'},
       addLabel:{en:'+ Add entry', es:'+ Agregar entrada'},
       fields:[
         {id:'employer', type:'text', label:{en:'Employer / school (or "unemployed")', es:'Empleador / escuela (o "desempleado")'}},
         {id:'occupation', type:'text', label:{en:'Occupation', es:'Ocupación'}},
         {id:'from', type:'date', label:{en:'From', es:'Desde'}},
         {id:'to', type:'date', label:{en:'To (blank = current)', es:'Hasta (vacío = actual)'}}
       ]}
    ]
  },
  {
    id:'trips', iconName:'plane', color:'#00b4a8', partRef:'Part 8',
    title:{en:'Time outside the U.S.', es:'Tiempo fuera de EE. UU.'},
    intro:{en:'Trips outside the United States during your eligibility period.', es:'Viajes fuera de Estados Unidos durante tu periodo de elegibilidad.'},
    questions:[
      {id:'t_any', type:'yesno', required:true,
       label:{en:'Any trips outside the U.S. in the last 5 years?', es:'¿Algún viaje fuera de EE. UU. en los últimos 5 años?'}},
      {id:'t_trips', type:'group', required:false,
       label:{en:'Trips (24 hours or longer)', es:'Viajes (de 24 horas o más)'},
       help:{en:'USCIS asks for every trip of 24 hours or more.', es:'USCIS pregunta por cada viaje de 24 horas o más.'},
       addLabel:{en:'+ Add trip', es:'+ Agregar viaje'},
       fields:[
         {id:'left', type:'date', label:{en:'Date you left', es:'Fecha de salida'}},
         {id:'back', type:'date', label:{en:'Date you returned', es:'Fecha de regreso'}},
         {id:'where', type:'text', label:{en:'Countries visited', es:'Países visitados'}}
       ]},
      {id:'t_long', type:'yesno', required:true, flagOn:'yes', flagId:'long-absence',
       label:{en:'Did any single trip last 6 months (180 days) or longer?', es:'¿Algún viaje individual duró 6 meses (180 días) o más?'},
       help:{en:'USCIS looks closely at long absences when reviewing continuous residence.', es:'USCIS examina de cerca las ausencias largas al revisar la residencia continua.'}},
      {id:'t_over30', type:'yesno', required:true, flagOn:'yes', flagId:'cumulative-absence',
       label:{en:'Do all your trips combined total more than 30 months?', es:'¿Todos tus viajes combinados suman más de 30 meses?'}}
    ]
  },
  {
    id:'marital', iconName:'ring', color:'#ffc83d', partRef:'Part 5',
    title:{en:'Marital history', es:'Historial matrimonial'},
    intro:{en:'Your current and past marriages.', es:'Tus matrimonios actuales y pasados.'},
    questions:[
      {id:'m_status', type:'select', required:true,
       label:{en:'Current marital status', es:'Estado civil actual'},
       options:[
         {v:'single',label:{en:'Single, never married',es:'Soltero(a), nunca casado(a)'}},
         {v:'married',label:{en:'Married',es:'Casado(a)'}},
         {v:'divorced',label:{en:'Divorced',es:'Divorciado(a)'}},
         {v:'widowed',label:{en:'Widowed',es:'Viudo(a)'}},
         {v:'separated',label:{en:'Legally separated',es:'Separado(a) legalmente'}},
         {v:'annulled',label:{en:'Marriage annulled',es:'Matrimonio anulado'}}
       ]},
      {id:'m_times', type:'text', required:false,
       label:{en:'How many times have you been married (including now)?', es:'¿Cuántas veces te has casado (incluyendo ahora)?'}},
      {id:'m_spouseFamily', type:'text', required:false,
       label:{en:'Current spouse\'s family name / last name', es:'Apellido(s) de tu cónyuge actual'},
       help:{en:'Skip if not married.', es:'Omite si no estás casado(a).'}},
      {id:'m_spouseGiven', type:'text', required:false,
       label:{en:'Current spouse\'s given name / first name', es:'Nombre de tu cónyuge actual'}},
      {id:'m_spouseCitizen', type:'yesno', required:false,
       label:{en:'Is your current spouse a U.S. citizen?', es:'¿Tu cónyuge actual es ciudadano(a) de EE. UU.?'}},
      {id:'m_marriageDate', type:'date', required:false,
       label:{en:'Date of current marriage', es:'Fecha del matrimonio actual'}}
    ]
  },
  {
    id:'children', iconName:'people', color:'#12b981', partRef:'Part 6',
    title:{en:'Children', es:'Hijos'},
    intro:{en:'All of your children — any age, living anywhere, including stepchildren and adopted children.', es:'Todos tus hijos — de cualquier edad, vivan donde vivan, incluyendo hijastros e hijos adoptados.'},
    questions:[
      {id:'c_count', type:'text', required:true,
       label:{en:'Total number of children under 18 years of age', es:'Número total de hijos menores de 18 años'},
       help:{en:'The current form (edition 01/20/25) asks for children under 18. Enter 0 if none.', es:'El formulario actual (edición 01/20/25) pregunta por hijos menores de 18. Escribe 0 si no tienes.'}},
      {id:'c_children', type:'group', required:false,
       label:{en:'Children', es:'Hijos'},
       addLabel:{en:'+ Add child', es:'+ Agregar hijo(a)'},
       fields:[
         {id:'name', type:'text', label:{en:'Full name', es:'Nombre completo'}},
         {id:'dob', type:'date', label:{en:'Date of birth', es:'Fecha de nacimiento'}},
         {id:'residence', type:'text', label:{en:'Country of residence', es:'País de residencia'}}
       ]}
    ]
  },
  {
    id:'additional', iconName:'scales', color:'#84807a', partRef:'Part 9',
    title:{en:'Additional questions', es:'Preguntas adicionales'},
    intro:{en:'USCIS asks these of every applicant. Answer honestly — a truthful "yes" with context is handled far better than an omission discovered later.', es:'USCIS le pregunta esto a cada solicitante. Responde con honestidad — un "sí" veraz con contexto se maneja mucho mejor que una omisión descubierta después.'},
    questions:[
      {id:'a_arrest', type:'yesno', required:true, flagOn:'yes', flagId:'arrest-history',
       label:{en:'Have you EVER been arrested, cited, detained, or charged by any law enforcement officer, anywhere in the world?', es:'¿ALGUNA VEZ has sido arrestado, citado, detenido o acusado por cualquier autoridad, en cualquier país?'},
       help:{en:'Includes incidents that were dismissed, expunged, or happened long ago.', es:'Incluye incidentes desestimados, eliminados del registro o muy antiguos.'}},
      {id:'a_removal', type:'yesno', required:true, flagOn:'yes', flagId:'removal-proceedings',
       label:{en:'Have you ever been in removal, exclusion, or deportation proceedings?', es:'¿Alguna vez has estado en procedimientos de remoción, exclusión o deportación?'}},
      {id:'a_denied', type:'yesno', required:true, flagOn:'yes', flagId:'prior-denial',
       label:{en:'Has any immigration application of yours ever been denied, or have you withdrawn one?', es:'¿Alguna solicitud de inmigración tuya ha sido negada, o has retirado alguna?'}},
      {id:'a_misrep', type:'yesno', required:true, flagOn:'yes', flagId:'misrepresentation',
       label:{en:'Have you ever given false or misleading information to a U.S. government official, or ever claimed to be a U.S. citizen?', es:'¿Alguna vez diste información falsa o engañosa a un oficial del gobierno de EE. UU., o afirmaste ser ciudadano estadounidense?'}},
      {id:'a_selective', type:'select', required:true, flagOn:'no', flagId:'selective-service',
       label:{en:'If you are a man who lived in the U.S. between ages 18–26: did you register with Selective Service?', es:'Si eres hombre y viviste en EE. UU. entre los 18 y 26 años: ¿te registraste en el Servicio Selectivo?'},
       options:[
         {v:'yes',label:{en:'Yes, registered',es:'Sí, registrado'}},
         {v:'no',label:{en:'No, did not register',es:'No me registré'}},
         {v:'na',label:{en:'Does not apply to me',es:'No aplica en mi caso'}}
       ]},
      {id:'a_taxes', type:'yesno', required:true, flagOn:'yes', flagId:'tax-issue',
       label:{en:'Since becoming a permanent resident, have you ever failed to file a required federal, state, or local tax return?', es:'Desde que eres residente permanente, ¿alguna vez dejaste de presentar una declaración de impuestos requerida?'}}
    ]
  }
];

// ---- state ----
var n400FormUI = { mode:'overview', section:0 };   // transient UI state (not persisted)
var n400FH_saveTimer = null;

function n400FH_state(){
  if(!user.n400){
    user.n400 = { answers:{}, sectionStatus:{}, lastSection:null, lastSavedAt:null, flags:[], disclaimerSeen:false };
  }
  return user.n400;
}

function n400FH_flush(){
  if(!n400FH_saveTimer) return;
  clearTimeout(n400FH_saveTimer);
  n400FH_saveTimer = null;
  n400FH_persist();
}
function n400FH_persist(){
  var st = n400FH_state();
  st.lastSavedAt = new Date().toISOString();
  saveUser();
  // Surface storage failures once — the UI says "auto-saved" and must not lie
  try {
    var back = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if(!back.n400 || back.n400.lastSavedAt !== st.lastSavedAt){
      if(!n400FH_persist._warned){
        n400FH_persist._warned = true;
        toast(lang==='es' ? '⚠ No se pudo guardar — espacio lleno. Exporta un respaldo.' : '⚠ Could not save — storage full. Export a backup.');
      }
    }
  } catch(e){}
}
function n400FH_save(){
  clearTimeout(n400FH_saveTimer);
  n400FH_saveTimer = setTimeout(function(){ n400FH_saveTimer = null; n400FH_persist(); }, 400);
}
// Don't lose the last keystroke on app kill / tab close
window.addEventListener('pagehide', n400FH_flush);
document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') n400FH_flush(); });

function n400FH_set(qid, value){
  n400FH_state().answers[qid] = value;
  // aggregates (flag count, section pills) must be correct the moment any
  // screen renders — recompute synchronously, debounce only the disk write
  n400FH_recomputeFlags();
  n400FH_recomputeStatus();
  n400FH_save();
}

function n400FH_groupRows(qid){
  var a = n400FH_state().answers[qid];
  return Array.isArray(a) ? a : [];
}
function n400FH_addRow(qid){
  var st = n400FH_state();
  if(!Array.isArray(st.answers[qid])) st.answers[qid] = [];
  st.answers[qid].push({});
  n400FH_recomputeStatus();
  n400FH_save();
  n400FH_renderSection();
}
function n400FH_removeRow(qid, idx){
  var rows = n400FH_groupRows(qid);
  rows.splice(idx, 1);
  n400FH_recomputeStatus();
  n400FH_save();
  n400FH_renderSection();
}
function n400FH_setRowField(qid, idx, fid, value){
  var rows = n400FH_groupRows(qid);
  if(!rows[idx]) rows[idx] = {};
  rows[idx][fid] = value;
  n400FH_recomputeStatus();
  n400FH_save();
}

// ---- flags ----
function n400FH_recomputeFlags(){
  var st = n400FH_state();
  var flags = [];
  N400_SCHEMA.forEach(function(sec){
    sec.questions.forEach(function(q){
      if(q.flagId && st.answers[q.id] === q.flagOn) flags.push(q.flagId);
    });
  });
  st.flags = flags;
}

// ---- progress ----
function n400FH_answered(q){
  var a = n400FH_state().answers[q.id];
  if(q.type === 'group'){
    // an empty added row doesn't count — at least one field must have content
    return Array.isArray(a) && a.some(function(row){
      return row && Object.keys(row).some(function(k){ return row[k] && String(row[k]).trim() !== ''; });
    });
  }
  return a !== undefined && a !== null && String(a).trim() !== '';
}
function n400FH_sectionProgress(sec){
  var req = sec.questions.filter(function(q){ return q.required; });
  var done = req.filter(n400FH_answered).length;
  var any = sec.questions.some(n400FH_answered);
  return { done: done, total: req.length, any: any,
           complete: req.length > 0 && done === req.length };
}
function n400FH_recomputeStatus(){
  var st = n400FH_state();
  N400_SCHEMA.forEach(function(sec){
    var p = n400FH_sectionProgress(sec);
    st.sectionStatus[sec.id] = p.complete ? 'complete' : (p.any ? 'inProgress' : 'notStarted');
  });
}
function n400FH_overallPct(){
  var done = 0, total = 0;
  N400_SCHEMA.forEach(function(sec){
    var p = n400FH_sectionProgress(sec);
    done += p.done; total += p.total;
  });
  return total ? Math.round(done / total * 100) : 0;
}
function n400FH_isComplete(){
  return N400_SCHEMA.every(function(sec){ return n400FH_sectionProgress(sec).complete; });
}

// ---- entry / gating / disclaimer ----
function startN400FormHelper(){
  if(!isPlus()){
    toast(lang==='es' ? 'El organizador N-400 es parte de Plus' : 'The N-400 organizer is part of Plus');
    go('upgrade');
    return;
  }
  var st = n400FH_state();
  if(!st.disclaimerSeen){
    n400FH_showDisclaimer();
    return;
  }
  n400FormUI.mode = 'overview';
  if(st.lastSection != null && !n400FH_isComplete()){
    n400FormUI.mode = 'overview';   // land on overview; the per-section pills show progress
  }
  go('n400Form');
}

function n400FH_showDisclaimer(){
  var existing = document.getElementById('disclaimerModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.className = 'disclaimerOverlay';
  var pts = lang==='es'
    ? ['Camino <strong>no es un bufete de abogados</strong> y no ofrece asesoría legal. Este es un organizador de autoayuda que actúa <strong>solo bajo tu dirección</strong>.',
       'Usarlo <strong>no crea una relación abogado-cliente</strong>, y tus respuestas no están protegidas por el privilegio abogado-cliente.',
       'Solo guarda <strong>tus propias respuestas, textualmente</strong>, en tu dispositivo. Nunca te sugiere qué responder ni revisa tus respuestas para suficiencia legal.',
       'No presenta nada ante USCIS. Al final obtienes un borrador para que <strong>tú mismo</strong> revises, completes, firmes y presentes el formulario oficial.',
       'Camino no está afiliado a USCIS ni a ninguna agencia del gobierno.']
    : ['Camino is <strong>not a law firm</strong> and does not provide legal advice. This is a self-help organizer that acts <strong>only at your direction</strong>.',
       'Using it <strong>does not create an attorney-client relationship</strong>, and your answers are not protected by attorney-client privilege.',
       'It only stores <strong>your own answers, verbatim</strong>, on your device. It never suggests what to answer and does not review your answers for legal sufficiency.',
       'It does not file anything with USCIS. At the end you get a draft so <strong>you</strong> review, complete, sign, and submit the official form yourself.',
       'Camino is not affiliated with USCIS or any government agency.'];
  modal.innerHTML = ''
    + '<div class="disclaimerCard">'
    + '  <div class="disclaimerHead">'
    + '    <div class="disclaimerIco">'+iconSVG('scales','#84807a',26)+'</div>'
    + '    <div class="disclaimerTitle">'+(lang==='es'?'Antes de empezar':'Before you start')+'</div>'
    + '  </div>'
    + '  <ul class="disclaimerBody">'+pts.map(function(p){return '<li>'+p+'</li>';}).join('')+'</ul>'
    + '  <button class="cta disclaimerCta" onclick="n400FH_acceptDisclaimer()">'+(lang==='es'?'Entendido':'I understand')+'</button>'
    + '</div>';
  document.body.appendChild(modal);
}
function n400FH_acceptDisclaimer(){
  n400FH_state().disclaimerSeen = true;
  saveUser();
  closeDisclaimerModal();
  n400FormUI.mode = 'overview';
  go('n400Form');
}

function exitN400Form(){
  go('path');
}

// ---- renderers ----
function renderN400FormView(){
  var body = document.getElementById('n400FormBody');
  if(!body) return;
  if(n400FormUI.mode === 'section') return n400FH_renderSection();
  if(n400FormUI.mode === 'summary') return n400FH_renderSummary();
  n400FH_renderOverview();
}

function n400FH_renderOverview(){
  var body = document.getElementById('n400FormBody');
  var st = n400FH_state();
  var pct = n400FH_overallPct();
  var fill = document.getElementById('n400FormProgressFill');
  if(fill) fill.style.width = pct + '%';
  var counter = document.getElementById('n400FormCounter');
  if(counter) counter.textContent = pct + '%';

  var html = '<div class="n400FormHead">'
    + '<div class="n400FormKick">'+(lang==='es'?'ORGANIZADOR N-400':'N-400 ORGANIZER')+'</div>'
    + '<div class="n400FormTitle">'+(lang==='es'?'Tus respuestas, organizadas':'Your answers, organized')+'</div>'
    + '<div class="n400FormIntro">'+(lang==='es'
        ? 'Reúne tus datos sección por sección. Todo queda solo en tu dispositivo. Al final, transfiere tus respuestas al formulario oficial de USCIS tú mismo.'
        : 'Gather your information section by section. Everything stays on your device only. At the end, transfer your answers to the official USCIS form yourself.')+'</div>'
    + '<div class="n400FormProgress">'+pct+'% · '+(lang==='es'?'guardado automático':'auto-saved')+'</div>'
    + '</div>';

  html += '<div class="mini">';
  N400_SCHEMA.forEach(function(sec, i){
    var p = n400FH_sectionProgress(sec);
    var status = st.sectionStatus[sec.id] || 'notStarted';
    var pill = status === 'complete'
      ? '<span class="n400SecPill n400SecPillDone">✓ '+(lang==='es'?'Lista':'Done')+'</span>'
      : (status === 'inProgress'
        ? '<span class="n400SecPill n400SecPillProg">'+p.done+'/'+p.total+'</span>'
        : '<span class="n400SecPill">'+(lang==='es'?'Empezar':'Start')+'</span>');
    html += '<div class="row" onclick="n400FH_openSection('+i+')">'
      + '<div class="rIco" style="background:'+sec.color+'1f;">'+iconSVG(sec.iconName, sec.color, 20)+'</div>'
      + '<div class="rMain"><div class="rTitle">'+sec.title[lang]+'</div>'
      + '<div class="rSub">N-400 '+sec.partRef+'</div></div>'
      + pill
      + '<div class="chev">›</div></div>';
  });
  html += '</div>';

  if(st.flags.length){
    html += '<div class="n400FlagNote" style="margin-top:14px;">'
      + '<strong>'+(lang==='es'?'Tienes '+st.flags.length+' respuesta(s) marcada(s).':'You have '+st.flags.length+' flagged answer(s).')+'</strong> '
      + N400_FLAG_NOTE[lang] + '</div>';
  }

  html += '<button class="cta" style="margin-top:16px;" onclick="n400FH_openSummary()">'+(lang==='es'?'Ver resumen para el formulario oficial':'View summary for the official form')+'</button>';
  html += '<div class="n400ExportRow">'
    + '<button class="n400ExportBtn" onclick="n400FH_exportJSON()">'+(lang==='es'?'Exportar respaldo (JSON)':'Export backup (JSON)')+'</button>'
    + '<button class="n400ExportBtn" onclick="document.getElementById(\'n400ImportFile\').click()">'+(lang==='es'?'Importar respaldo':'Import backup')+'</button>'
    + '</div>';
  html += '<div class="n400Hint" style="margin-top:12px;text-align:center;">'+(lang==='es'
      ? 'Camino no es un bufete de abogados, no da asesoría legal y no presenta nada ante USCIS.'
      : 'Camino is not a law firm, does not give legal advice, and does not file anything with USCIS.')+'</div>';

  body.innerHTML = html;
  var footer = document.getElementById('n400FormFooter');
  if(footer) footer.innerHTML = '';
}

function n400FH_scrollTop(){
  var sc = document.querySelector('#n400Form .body');
  if(sc) sc.scrollTop = 0;
}
function n400FH_openSection(i){
  n400FormUI.mode = 'section';
  n400FormUI.section = i;
  var st = n400FH_state();
  st.lastSection = i;
  saveUser();
  n400FH_renderSection();
  n400FH_scrollTop();
}
function n400FH_openSummary(){
  n400FormUI.mode = 'summary';
  n400FH_renderSummary();
  n400FH_scrollTop();
}
function n400FH_backToOverview(){
  n400FormUI.mode = 'overview';
  n400FH_renderOverview();
  n400FH_scrollTop();
}

function n400FH_inputHtml(q, val){
  var v = esc(val == null ? '' : val);
  if(q.type === 'date'){
    return '<input type="date" class="n400Input" value="'+v+'" onchange="n400FH_set(\''+q.id+'\', this.value)" />';
  }
  if(q.type === 'select'){
    var opts = '<option value="">'+(lang==='es'?'— Elegir —':'— Choose —')+'</option>';
    (q.options||[]).forEach(function(o){
      opts += '<option value="'+o.v+'"'+(val===o.v?' selected':'')+'>'+o.label[lang]+'</option>';
    });
    return '<select class="n400Input" onchange="n400FH_set(\''+q.id+'\', this.value); n400FH_renderSection();">'+opts+'</select>';
  }
  if(q.type === 'yesno'){
    var yes = val==='yes', no = val==='no';
    return '<div class="n400RadioGroup">'
      + '<label class="n400RadioOpt'+(yes?' n400RadioSel':'')+'" onclick="n400FH_set(\''+q.id+'\',\'yes\'); n400FH_renderSection();"><span class="n400RadioBox"></span><span class="n400RadioLbl">'+(lang==='es'?'Sí':'Yes')+'</span></label>'
      + '<label class="n400RadioOpt'+(no?' n400RadioSel':'')+'" onclick="n400FH_set(\''+q.id+'\',\'no\'); n400FH_renderSection();"><span class="n400RadioBox"></span><span class="n400RadioLbl">No</span></label>'
      + '</div>';
  }
  // text
  return '<input type="text" class="n400Input" value="'+v+'" oninput="n400FH_set(\''+q.id+'\', this.value)" />';
}

// Official-form capacity per repeatable group (edition 01/20/25). Extra rows
// stay in the summary but can't be placed on the PDF — the form says to use
// Part 14 (Additional Information) for overflow.
var N400_GROUP_META = {
  r_addresses: { cap: 4, current: true },   // 1 current + 3 prior-table rows
  r_employers: { cap: 3, current: true },
  t_trips:     { cap: 6 },
  c_children:  { cap: 3 }
};

function n400FH_groupHtml(q){
  var rows = n400FH_groupRows(q.id);
  var meta = N400_GROUP_META[q.id] || {};
  var html = '';
  rows.forEach(function(row, idx){
    var isCurrent = meta.current && (!row.to || !String(row.to).trim()) &&
      rows.slice(0, idx).every(function(r){ return r.to && String(r.to).trim(); });
    html += '<div class="n400GroupRow">'
      + '<div class="n400GroupRowHead"><span>'+(idx+1)
      + (isCurrent ? ' <span class="n400SecPill n400SecPillDone">'+(lang==='es'?'Actual':'Current')+'</span>' : '')
      + '</span>'
      + '<button class="n400GroupRemove" onclick="n400FH_removeRow(\''+q.id+'\','+idx+')">'+(lang==='es'?'Quitar':'Remove')+'</button></div>';
    q.fields.forEach(function(f){
      var fv = esc(row[f.id] == null ? '' : row[f.id]);
      var input = f.type === 'date'
        ? '<input type="date" class="n400Input" value="'+fv+'" onchange="n400FH_setRowField(\''+q.id+'\','+idx+',\''+f.id+'\', this.value)" />'
        : '<input type="text" class="n400Input" value="'+fv+'" oninput="n400FH_setRowField(\''+q.id+'\','+idx+',\''+f.id+'\', this.value)" />';
      html += '<div class="n400Field" style="margin-top:8px;"><div class="n400Label" style="font-size:12px;">'+f.label[lang]+'</div>'+input+'</div>';
    });
    html += '</div>';
  });
  html += '<button class="n400AddRow" onclick="n400FH_addRow(\''+q.id+'\')">'+q.addLabel[lang]+'</button>';
  if(meta.cap){
    var over = rows.length > meta.cap;
    html += '<div class="n400Hint'+(over?'" style="color:#a05000;':'')+'">'
      + (lang==='es'
        ? 'El formulario oficial tiene espacio para '+meta.cap+'. '+(meta.current?'Deja "Hasta" vacío en tu '+(q.id==='r_employers'?'empleo actual':'dirección actual')+'. ':'')+(over?'Las filas extra van a mano en la Parte 14.':'Filas extra van a mano en la Parte 14.')
        : 'The official form has room for '+meta.cap+'. '+(meta.current?'Leave "To" blank on your current one. ':'')+(over?'Your extra rows go in Part 14 by hand.':'Extra rows go in Part 14 by hand.'))
      + '</div>';
  }
  return html;
}

function n400FH_renderSection(){
  var body = document.getElementById('n400FormBody');
  if(!body) return;
  var sec = N400_SCHEMA[n400FormUI.section];
  var st = n400FH_state();
  var p = n400FH_sectionProgress(sec);
  var fill = document.getElementById('n400FormProgressFill');
  if(fill) fill.style.width = n400FH_overallPct() + '%';
  var counter = document.getElementById('n400FormCounter');
  if(counter) counter.textContent = (n400FormUI.section+1) + ' / ' + N400_SCHEMA.length;

  var html = '<div class="n400FormHead">'
    + '<div class="n400FormKick"><span class="n400KickIco">'+iconSVG(sec.iconName, sec.color, 14)+'</span> N-400 '+sec.partRef+'</div>'
    + '<div class="n400FormTitle">'+sec.title[lang]+'</div>'
    + '<div class="n400FormIntro">'+sec.intro[lang]+'</div>'
    + '</div>';

  html += '<div class="n400Fields">';
  sec.questions.forEach(function(q){
    var val = st.answers[q.id];
    // the trips list stops being "optional" the moment the user says they traveled
    var effectiveRequired = q.required || (q.id === 't_trips' && st.answers.t_any === 'yes');
    html += '<div class="n400Field">'
      + '<div class="n400Label">'+q.label[lang]+(effectiveRequired?'':' <span style="color:var(--muted);font-weight:600;">('+(lang==='es'?'opcional':'optional')+')</span>')+'</div>'
      + (q.type === 'group' ? n400FH_groupHtml(q) : n400FH_inputHtml(q, val))
      + (q.help ? '<div class="n400Hint">'+q.help[lang]+'</div>' : '');
    if(q.flagId && val === q.flagOn){
      html += '<div class="n400FlagNote"><span class="n400FlagIco">'+iconSVG('scales','#6b5400',14)+'</span> '+N400_FLAG_NOTE[lang]+'</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  body.innerHTML = html;

  var footer = document.getElementById('n400FormFooter');
  var isLast = n400FormUI.section === N400_SCHEMA.length - 1;
  if(footer){
    footer.innerHTML = '<button class="n400FormBackBtn" onclick="n400FH_backToOverview()">'+(lang==='es'?'Secciones':'Sections')+'</button>'
      + '<button class="cta n400FormNextBtn" onclick="'+(isLast?'n400FH_openSummary()':'n400FH_openSection('+(n400FormUI.section+1)+')')+'">'
      + (isLast ? (lang==='es'?'Ver resumen':'View summary') : (lang==='es'?'Siguiente sección':'Next section')) + '</button>';
  }
}

function n400FH_valueLabel(q, val){
  if(val == null || String(val).trim() === '') return null;
  if(q.type === 'select'){
    var o = (q.options||[]).filter(function(x){ return x.v === val; })[0];
    return o ? o.label[lang] : esc(val);
  }
  if(q.type === 'yesno') return val === 'yes' ? (lang==='es'?'Sí':'Yes') : 'No';
  if(q.type === 'date') return esc(n400FH_usDate(val));   // show mm/dd/yyyy — what the official form wants
  return esc(val);
}

function n400FH_renderSummary(){
  var body = document.getElementById('n400FormBody');
  if(!body) return;
  var st = n400FH_state();
  var counter = document.getElementById('n400FormCounter');
  if(counter) counter.textContent = (lang==='es'?'Resumen':'Summary');

  var html = '<div class="n400FormHead">'
    + '<div class="n400FormKick">'+(lang==='es'?'RESUMEN':'SUMMARY')+'</div>'
    + '<div class="n400FormTitle">'+(lang==='es'?'Para el formulario oficial':'For the official form')+'</div>'
    + '<div class="n400FormIntro">'+(lang==='es'
        ? 'Transfiere estas respuestas al Formulario N-400 oficial de USCIS tú mismo, revísalas, y fírmalo. Los números de sección pueden variar según la edición del formulario — sigue el formulario oficial.'
        : 'Transfer these answers to the official USCIS Form N-400 yourself, review them, and sign it. Item numbers vary by form edition — follow the official form.')+'</div>'
    + '</div>';

  if(st.flags.length){
    html += '<div class="n400FlagNote" style="margin-bottom:14px;">'
      + '<strong>'+(lang==='es'?st.flags.length+' respuesta(s) marcada(s):':st.flags.length+' flagged answer(s):')+'</strong> '
      + N400_FLAG_NOTE[lang] + '</div>';
  }

  html += '<div class="n400Summary">';
  N400_SCHEMA.forEach(function(sec, i){
    html += '<div class="n400SumSection">'
      + '<div class="n400SumHead"><span class="n400SumKick">'+sec.partRef+'</span>'+sec.title[lang]
      + '<button class="n400SumEdit" onclick="n400FH_openSection('+i+')">'+(lang==='es'?'Editar':'Edit')+'</button></div>';
    var rowsHtml = '';
    sec.questions.forEach(function(q){
      if(q.type === 'group'){
        var rows = n400FH_groupRows(q.id);
        rows.forEach(function(row, ri){
          var parts = q.fields.map(function(f){
            var v = row[f.id];
            if(!v || !String(v).trim()) return null;
            if(f.type === 'date') return esc(f.label[lang].split(' (')[0] + ': ' + n400FH_usDate(v));
            return esc(v);
          }).filter(Boolean).join(' · ');
          if(parts) rowsHtml += '<div class="n400SumRow"><div class="n400SumKey">'+q.label[lang]+' '+(ri+1)+'</div><div class="n400SumVal">'+parts+'</div></div>';
        });
      } else {
        var vl = n400FH_valueLabel(q, st.answers[q.id]);
        if(vl != null){
          var flagged = q.flagId && st.answers[q.id] === q.flagOn;
          rowsHtml += '<div class="n400SumRow"><div class="n400SumKey">'+q.label[lang]+'</div><div class="n400SumVal">'+vl+(flagged?' <span class="n400FlagIco">'+iconSVG('scales','#a05000',12)+'</span>':'')+'</div></div>';
        }
      }
    });
    html += rowsHtml ? '<div class="n400SumRows">'+rowsHtml+'</div>'
                     : '<div class="n400SumEmpty">'+(lang==='es'?'Sin respuestas todavía':'No answers yet')+'</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '<button class="cta" style="margin-top:16px;" onclick="n400FH_pdfEntry()">'+(lang==='es'?'Generar borrador del N-400 oficial (PDF)':'Generate official N-400 draft (PDF)')+'</button>';
  html += '<div class="n400ExportRow"><button class="n400ExportBtn" onclick="n400FH_print()">'+(lang==='es'?'Imprimir resumen':'Print summary')+'</button></div>';
  html += '<div class="n400Hint" style="margin-top:10px;text-align:center;">'+(lang==='es'
      ? 'El PDF contiene solo tus respuestas, generado en tu dispositivo. Revísalo, complétalo, fírmalo y preséntalo tú mismo. Camino no presenta nada ante USCIS.'
      : 'The PDF contains only your answers, generated on your device. Review it, complete it, sign it, and file it yourself. Camino does not file anything with USCIS.')+'</div>';

  body.innerHTML = html;
  var footer = document.getElementById('n400FormFooter');
  if(footer){
    footer.innerHTML = '<button class="n400FormBackBtn" onclick="n400FH_backToOverview()">'+(lang==='es'?'Secciones':'Sections')+'</button>';
  }
}

// ---- print + export/import ----
function n400FH_summaryText(){
  var st = n400FH_state();
  var lines = [
    lang==='es' ? 'CAMINO — RESUMEN DE RESPUESTAS N-400 (solo uso personal)' : 'CAMINO — N-400 ANSWER SUMMARY (personal use only)',
    (lang==='es' ? 'Generado: ' : 'Generated: ') + new Date().toISOString().slice(0,10),
    lang==='es' ? 'Transfiere al Formulario N-400 oficial de USCIS tú mismo (edición '+N400_PDF_EDITION+').' : 'Transfer to the official USCIS Form N-400 yourself (edition '+N400_PDF_EDITION+').',
    ''];
  if(st.flags.length) lines.push((lang==='es' ? 'RESPUESTAS MARCADAS: ' : 'FLAGGED ANSWERS: ')+st.flags.join(', ')+(lang==='es' ? ' — considera consultar a un abogado de inmigración.' : ' — consider consulting an immigration attorney.'), '');
  N400_SCHEMA.forEach(function(sec){
    lines.push('=== N-400 '+sec.partRef+' — '+sec.title[lang]+' ===');
    sec.questions.forEach(function(q){
      if(q.type === 'group'){
        n400FH_groupRows(q.id).forEach(function(row, ri){
          var parts = q.fields.map(function(f){
            if(!row[f.id]) return null;
            var v = f.type === 'date' ? n400FH_usDate(row[f.id]) : row[f.id];
            return f.label[lang] + ': ' + v;
          }).filter(Boolean).join(' | ');
          if(parts) lines.push('  '+q.label[lang]+' #'+(ri+1)+': '+parts);
        });
      } else {
        var v = st.answers[q.id];
        if(v != null && String(v).trim() !== ''){
          var shown = (typeof q.type === 'string' && q.type === 'date') ? n400FH_usDate(v) : v;
          lines.push('  '+q.label[lang]+': '+shown);
        }
      }
    });
    lines.push('');
  });
  return lines.join('\n');
}

function n400FH_print(){
  if(Store.isNative()){
    // WKWebView has no reliable window.print — share the summary as a text file.
    var fs = window.CapFilesystem, share = window.CapShare, dir = window.CapFsDirectory, enc = window.CapFsEncoding;
    if(fs && share && fs.writeFile){
      fs.writeFile({ path: 'camino-n400-summary.txt', data: n400FH_summaryText(), directory: (dir && dir.Cache) || 'CACHE', encoding: (enc && enc.UTF8) || 'utf8' })
        .then(function(res){ return share.share({ title: 'N-400 summary', url: res.uri }); })
        .catch(function(e){ if(!(e && /cancel/i.test(e.message||''))) toast(lang==='es'?'No se pudo compartir':'Could not share'); });
    } else {
      toast(lang==='es'?'Compartir no disponible':'Sharing unavailable');
    }
    return;
  }
  window.print();
}

function n400FH_exportJSON(){
  var st = n400FH_state();
  var data = JSON.stringify({ caminoN400Backup: 1, exportedAt: new Date().toISOString(), n400: st }, null, 2);
  if(Store.isNative()){
    var fs = window.CapFilesystem, share = window.CapShare, dir = window.CapFsDirectory, enc = window.CapFsEncoding;
    if(fs && share && fs.writeFile){
      fs.writeFile({ path: 'camino-n400-backup.json', data: data, directory: (dir && dir.Cache) || 'CACHE', encoding: (enc && enc.UTF8) || 'utf8' })
        .then(function(res){ return share.share({ title: 'Camino N-400 backup', url: res.uri }); })
        .catch(function(e){ if(!(e && /cancel/i.test(e.message||''))) toast(lang==='es'?'No se pudo exportar':'Could not export'); });
      return;
    }
    toast(lang==='es'?'Exportar no disponible':'Export unavailable');
    return;
  }
  var blob = new Blob([data], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'camino-n400-backup.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  toast(lang==='es'?'Respaldo descargado':'Backup downloaded');
}

function n400FH_importJSON(input){
  var file = input.files && input.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onerror = function(){ toast(lang==='es'?'No se pudo leer el archivo':'Could not read the file'); };
  reader.onload = function(){
    try {
      var data = JSON.parse(reader.result);
      if(!data || data.caminoN400Backup !== 1) throw new Error('not a camino backup');
      var n = data.n400;
      if(!n || typeof n.answers !== 'object' || Array.isArray(n.answers)) throw new Error('bad shape');
      // only string / string-array-of-plain-row answers survive import (drops objects that
      // would render as "[object Object]" on the summary/PDF)
      var clean = {};
      Object.keys(n.answers).forEach(function(k){
        var v = n.answers[k];
        if(typeof v === 'string') clean[k] = v;
        else if(Array.isArray(v)) clean[k] = v.filter(function(r){ return r && typeof r === 'object'; })
          .map(function(r){
            var row = {};
            Object.keys(r).forEach(function(f){ if(typeof r[f] === 'string') row[f] = r[f]; });
            return row;
          });
      });
      var ls = (typeof n.lastSection === 'number' && n.lastSection >= 0 && n.lastSection < N400_SCHEMA.length) ? n.lastSection : null;
      user.n400 = { answers: clean, sectionStatus: {}, lastSection: ls,
                    lastSavedAt: n.lastSavedAt || null, flags: [], disclaimerSeen: true };
      n400FH_recomputeFlags();
      n400FH_recomputeStatus();
      saveUser();
      toast(lang==='es'?'Respaldo importado':'Backup imported');
      n400FH_backToOverview();
    } catch(e){
      toast(lang==='es'?'Archivo de respaldo no válido':'Not a valid backup file');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ---- entry cards ----
function n400FormHelperCard(){
  var locked = !isPlus();
  var st = user.n400;
  var sub;
  if(locked){
    sub = lang==='es' ? 'Organiza tus respuestas · Plus' : 'Organize your answers · Plus';
  } else if(st && !n400FH_isComplete() && Object.keys(st.answers||{}).length){
    sub = (lang==='es' ? 'Continuar · ' : 'Resume · ') + n400FH_overallPct() + '%';
  } else if(st && n400FH_isComplete()){
    sub = lang==='es' ? '✓ Completo · ver resumen' : '✓ Complete · view summary';
  } else {
    sub = lang==='es' ? 'Reúne tus respuestas para el formulario oficial' : 'Gather your answers for the official form';
  }
  return '<div class="n400HelperCard n400HelperCardOrganizer" onclick="startN400FormHelper()">'
    + '<div class="n400HelperHead">'
    +   '<div class="n400HelperIco">'+iconSVG('folder','#fff',20)+'</div>'
    +   '<div class="n400HelperMain">'
    +     '<div class="n400HelperTitle">'+(lang==='es'?'Organizador N-400':'N-400 organizer')+(locked?' 🔒':'')+'</div>'
    +     '<div class="n400HelperSub">'+sub+'</div>'
    +   '</div>'
    +   '<div class="n400HelperArrow">→</div>'
    + '</div>'
    + '</div>';
}

function renderHomeN400FormRow(){
  var el = document.getElementById('homeN400FormRow');
  if(!el) return;
  var st = user.n400;
  var show = isOnGCPath() && st && Object.keys(st.answers||{}).length > 0 && !n400FH_isComplete();
  el.style.display = show ? '' : 'none';
  if(!show) return;
  var t = el.querySelector('.rTitle'), sub = el.querySelector('.rSub');
  if(t) t.textContent = lang==='es' ? 'Continúa tu N-400' : 'Resume your N-400';
  if(sub) sub.textContent = (lang==='es' ? 'Organizador · ' : 'Organizer · ') + n400FH_overallPct() + '% ' + (lang==='es'?'completo':'complete');
}

// ---- Official PDF generation ----
// Places ONLY the user's verbatim answers into visually-verified fields of the
// official N-400 (edition 01/20/25, bundled). Judgment questions (Part 1 basis,
// Part 9 additional questions) and any checkbox whose index order is scrambled
// in the XFA-generated AcroForm are ALWAYS left blank for the user to complete
// by hand. Never suggests an answer. Generated locally — never leaves the device.
var N400_PDF_EDITION = '01/20/25';

function n400FH_usDate(iso){
  if(!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  var p = iso.split('-'); return p[1]+'/'+p[2]+'/'+p[0];
}

function n400FH_loadPdfLib(){
  return new Promise(function(resolve, reject){
    if(window.PDFLib) return resolve(window.PDFLib);
    var s = document.createElement('script');
    s.src = 'pdflib.js';
    s.onload = function(){ window.PDFLib ? resolve(window.PDFLib) : reject(new Error('PDFLib missing')); };
    s.onerror = function(){ reject(new Error('pdflib.js failed to load')); };
    document.head.appendChild(s);
  });
}

async function n400FH_buildPdf(){
  var PDFLib = await n400FH_loadPdfLib();
  var res = await fetch('n400-official.pdf');
  if(!res.ok) throw new Error('asset missing');
  var doc = await PDFLib.PDFDocument.load(await res.arrayBuffer());
  var form = doc.getForm();
  var a = n400FH_state().answers;
  var F = 'form1[0].';
  var skipped = [];   // answers that couldn't be placed — reported to the user afterward

  function text(name, val){
    if(val == null || String(val).trim() === '') return;
    try { form.getTextField(F + name).setText(String(val)); } catch(e){}
  }
  function checkBox(name){
    try { form.getCheckBox(F + name).check(); } catch(e){}
  }
  function dropdown(name, val){
    if(!val) return;
    var dd; try { dd = form.getDropdown(F + name); } catch(e){ return; }
    try { dd.select(val); return; } catch(e){}
    try { dd.select(' ' + val); } catch(e){}
  }

  // A-Number on every page header
  var aNum = (a.p_aNumber || '').replace(/[^0-9]/g, '');
  if(aNum){
    form.getFields().forEach(function(f){
      if(f.getName().indexOf('Line1_AlienNumber') !== -1){
        try { f.setText(aNum); } catch(e){}
      }
    });
  }

  // Part 2 — identity
  text('#subform[0].P2_Line1_FamilyName[0]', a.p_familyName);
  text('#subform[12].P2_Line1_FamilyName[1]', a.p_familyName);
  text('#subform[0].P2_Line1_GivenName[0]', a.p_givenName);
  text('#subform[12].P2_Line1_GivenName[1]', a.p_givenName);
  text('#subform[0].P2_Line1_MiddleName[0]', a.p_middleName);
  text('#subform[12].P2_Line1_MiddleName[1]', a.p_middleName);
  text('#subform[1].P2_Line8_DateOfBirth[0]', n400FH_usDate(a.p_dob));
  text('#subform[1].P2_Line9_DateBecamePermanentResident[0]', n400FH_usDate(a.basis_gcDate));
  text('#subform[1].P2_Line10_CountryOfBirth[0]', a.p_birthCountry);
  text('#subform[1].P2_Line11_CountryOfNationality[0]', a.p_citCountry);
  text('#subform[1].Line12b_SSN[0]', (a.p_ssn || '').replace(/[^0-9]/g, ''));
  // Name change — verified: [0]=No, [1]=Yes
  if(a.p_nameChange === 'yes') checkBox('#subform[1].P2_Line34_NameChange[1]');
  if(a.p_nameChange === 'no')  checkBox('#subform[1].P2_Line34_NameChange[0]');

  // Part 3 — biographic (height/weight only; eye/hair checkbox order is scrambled)
  var hm = /([2-8])\D+(\d{1,2})/.exec(a.b_height || '');
  if(hm && +hm[2] <= 11){
    dropdown('#subform[2].P7_Line3_HeightFeet[0]', hm[1]);
    dropdown('#subform[2].P7_Line3_HeightInches[0]', hm[2]);
  } else if(a.b_height && String(a.b_height).trim()){
    skipped.push((lang==='es'?'Estatura (usa pies\'pulgadas, ej. 5\'7)':'Height (use feet\'inches, e.g. 5\'7)'));
  }
  var w = (a.b_weight || '').replace(/[^0-9]/g, '');
  if(w && w.length <= 3 && (a.b_weight || '').indexOf('kg') === -1){
    w = ('000' + w).slice(-3);
    text('#subform[2].P7_Line4_Pounds1[0]', w[0]);
    text('#subform[2].P7_Line4_Pounds2[0]', w[1]);
    text('#subform[2].P7_Line4_Pounds3[0]', w[2]);
  } else if(a.b_weight && String(a.b_weight).trim()){
    skipped.push((lang==='es'?'Peso (usa libras, solo números)':'Weight (use pounds, numbers only)'));
  }

  // Part 4 — addresses. The form's "current physical address" block has a
  // pre-printed PRESENT "To" — so the CURRENT address is the first row whose
  // "To" is blank (not blindly row 0; users may enter oldest-first). All other
  // rows go to the prior-address table. Rows beyond capacity are counted so
  // the user is told to add them in Part 14 by hand.
  var addrs = (Array.isArray(a.r_addresses) ? a.r_addresses : []).filter(function(r){ return r && (r.street || r.city); });
  var curAddrIdx = -1;
  for(var ai = 0; ai < addrs.length; ai++){
    if(!addrs[ai].to || !String(addrs[ai].to).trim()){ curAddrIdx = ai; break; }
  }
  if(curAddrIdx !== -1){
    var cur = addrs[curAddrIdx];
    text('#subform[2].P4_Line1_StreetName[0]', cur.street);
    text('#subform[2].P4_Line1_City[0]', cur.city);
    dropdown('#subform[2].P4_Line1_State[0]', (cur.state || '').toUpperCase());
    text('#subform[2].P4_Line1_ZipCode[0]', cur.zip);
    text('#subform[2].P4_Line1_DatesofResidence[1]', n400FH_usDate(cur.from));
    // "To" for the current address is pre-printed PRESENT on the form
  }
  var priorAddrs = addrs.filter(function(r, idx){ return idx !== curAddrIdx; });
  for(var i = 1; i <= 3 && priorAddrs[i-1]; i++){
    var pa = priorAddrs[i-1];
    text('#subform[2].P4_Line3_PhysicalAddress' + i + '[0]', pa.street);
    text('#subform[2].P4_Line3_CityTown' + i + '[0]', pa.city);
    text('#subform[2].P4_Line3_State' + i + '[0]', (pa.state || '').toUpperCase());
    text('#subform[2].P4_Line3_ZipCode' + i + '[0]', pa.zip);
    text('#subform[2].P4_Line3_From' + i + '[0]', n400FH_usDate(pa.from));
    // "To" column: row 1's field is (mis)named From1[1] in the official file — verified visually
    if(i === 1) text('#subform[2].P4_Line3_From1[1]', n400FH_usDate(pa.to));
    else        text('#subform[2].P4_Line3_To' + i + '[0]', n400FH_usDate(pa.to));
  }
  if(priorAddrs.length > 3) skipped.push((lang==='es'?'Direcciones extra: ':'Extra addresses: ') + (priorAddrs.length - 3));

  // Part 5 — marital. Checkbox indices verified: divorced=0, single=1, widowed=2,
  // married=3, annulled=4, separated=5
  var MAR_IDX = { divorced:0, single:1, widowed:2, married:3, annulled:4, separated:5 };
  if(a.m_status in MAR_IDX) checkBox('#subform[3].P10_Line1_MaritalStatus[' + MAR_IDX[a.m_status] + ']');
  text('#subform[3].Part9Line3_TimesMarried[0]', a.m_times);
  text('#subform[3].P10_Line4a_FamilyName[0]', a.m_spouseFamily);
  text('#subform[3].P10_Line4a_GivenName[0]', a.m_spouseGiven);
  text('#subform[3].P10_Line4e_DateEnterMarriage[0]', n400FH_usDate(a.m_marriageDate));

  // Part 6 — children (grid fields carry misleading P7_Employer* names — verified visually)
  text('#subform[4].P11_Line1_TotalChildren[0]', a.c_count);
  text('#subform[10].P11_Line1_TotalChildren[1]', a.c_count);
  var kids = Array.isArray(a.c_children) ? a.c_children : [];
  for(var k = 0; k < 3 && kids[k]; k++){
    var n = k + 1;
    text('#subform[4].P7_EmployerName' + n + '[0]', kids[k].name);
    text('#subform[4].P7_From' + n + '[0]', n400FH_usDate(kids[k].dob));
    text('#subform[4].P7_OccupationFieldStudy' + n + '[0]', kids[k].residence);
  }
  if(kids.length > 3) skipped.push((lang==='es'?'Hijos extra: ':'Extra children: ') + (kids.length - 3));

  // Part 7 — employment (Name column is P5_EmployerName*; From is the [1] instance).
  // Row 1's "To" is pre-printed PRESENT, so the CURRENT job (first row with a
  // blank "To") goes in row 1; rows with end dates fill rows 2-3.
  var jobsAll = (Array.isArray(a.r_employers) ? a.r_employers : []).filter(function(r){ return r && (r.employer || r.occupation); });
  var curJobIdx = -1;
  for(var ji = 0; ji < jobsAll.length; ji++){
    if(!jobsAll[ji].to || !String(jobsAll[ji].to).trim()){ curJobIdx = ji; break; }
  }
  var jobs = [];
  if(curJobIdx !== -1) jobs.push(jobsAll[curJobIdx]);
  jobsAll.forEach(function(r, idx){ if(idx !== curJobIdx) jobs.push(r); });
  if(curJobIdx === -1) jobs.unshift(null);   // no current job → leave row 1 blank (its To is PRESENT)
  for(var j = 0; j < 3 && j < jobs.length; j++){
    if(!jobs[j]) continue;
    var m = j + 1;
    text('#subform[4].P5_EmployerName' + m + '[0]', jobs[j].employer);
    text('#subform[4].P7_OccupationFieldStudy' + m + '[2]', jobs[j].occupation);
    text('#subform[4].P7_From' + m + '[1]', n400FH_usDate(jobs[j].from));
    if(m >= 2) text('#subform[4].P7_To' + m + '[0]', n400FH_usDate(jobs[j].to));
    // row 1 "To" is pre-printed PRESENT on the form
  }

  // Part 8 — trips
  var trips = Array.isArray(a.t_trips) ? a.t_trips : [];
  for(var t = 0; t < 6 && trips[t]; t++){
    var r = t + 1;
    text('#subform[5].P8_Line1_DateLeft' + r + '[0]', n400FH_usDate(trips[t].left));
    text('#subform[5].P8_Line1_DateReturn' + r + '[0]', n400FH_usDate(trips[t].back));
    if(r === 1) text('#subform[5].P9_Line1_Countries1[0]', trips[t].where);
    else        text('#subform[5].P8_Line1_Countries' + r + '[0]', trips[t].where);
  }
  if(jobs.length > 3) skipped.push((lang==='es'?'Empleos extra: ':'Extra employers: ') + (jobs.length - 3));
  if(trips.length > 6) skipped.push((lang==='es'?'Viajes extra: ':'Extra trips: ') + (trips.length - 6));

  // Part 1 basis, ethnicity/race, eye/hair, spouse-citizen, and ALL Part 9
  // additional questions are intentionally left blank (judgment fields or
  // scrambled checkbox indices) — the user completes them by hand.

  var bytes = await doc.save();
  return { bytes: bytes, skipped: skipped };
}

function n400FH_pdfEntry(){
  if(!isPlus()){
    toast(lang==='es' ? 'El organizador N-400 es parte de Plus' : 'The N-400 organizer is part of Plus');
    go('upgrade');
    return;
  }
  // Confirm modal with the guardrail summary before generating
  var existing = document.getElementById('disclaimerModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'disclaimerModal';
  modal.className = 'disclaimerOverlay';
  var pts = lang==='es'
    ? ['El PDF se genera <strong>en tu dispositivo</strong> y nunca sale de él.',
       'Contiene <strong>solo tus respuestas, tal como las escribiste</strong> — nada se sugiere ni se completa por ti.',
       'Las preguntas de criterio (Parte 1, preguntas adicionales, color de ojos/cabello) quedan <strong>en blanco</strong> para que las completes a mano.',
       '<strong>Revisa cada página</strong> contra el formulario oficial (edición '+N400_PDF_EDITION+'), complétalo, fírmalo y preséntalo tú mismo.']
    : ['The PDF is generated <strong>on your device</strong> and never leaves it.',
       'It contains <strong>only your answers, exactly as you typed them</strong> — nothing is suggested or completed for you.',
       'Judgment questions (Part 1 basis, additional questions, eye/hair color) are left <strong>blank</strong> for you to complete by hand.',
       '<strong>Review every page</strong> against the official form (edition '+N400_PDF_EDITION+'), complete it, sign it, and file it yourself.'];
  // Warn up front if any repeatable group exceeds the official form's capacity
  var aAll = n400FH_state().answers;
  var overflow = [];
  Object.keys(N400_GROUP_META).forEach(function(qid){
    var rows = Array.isArray(aAll[qid]) ? aAll[qid] : [];
    if(rows.length > N400_GROUP_META[qid].cap) overflow.push(qid);
  });
  if(overflow.length){
    pts.push(lang==='es'
      ? '<strong>Tienes más filas de las que caben</strong> en el formulario — las extras deberás añadirlas a mano en la <strong>Parte 14</strong>.'
      : '<strong>You have more rows than fit</strong> on the form — the extras must be added by hand in <strong>Part 14</strong>.');
  }
  modal.innerHTML = ''
    + '<div class="disclaimerCard">'
    + '  <div class="disclaimerHead">'
    + '    <div class="disclaimerIco">'+iconSVG('doc','#00b4a8',26)+'</div>'
    + '    <div class="disclaimerTitle">'+(lang==='es'?'Generar tu borrador N-400':'Generate your N-400 draft')+'</div>'
    + '  </div>'
    + '  <ul class="disclaimerBody">'+pts.map(function(p){return '<li>'+p+'</li>';}).join('')+'</ul>'
    + '  <button class="cta disclaimerCta" onclick="closeDisclaimerModal(); n400FH_generatePDF();">'+(lang==='es'?'Generar PDF':'Generate PDF')+'</button>'
    + '  <button class="camiSetupCancel" style="margin-top:8px;" onclick="closeDisclaimerModal()">'+(lang==='es'?'Cancelar':'Cancel')+'</button>'
    + '</div>';
  document.body.appendChild(modal);
}

var n400FH_generating = false;
async function n400FH_generatePDF(){
  if(n400FH_generating) return;
  n400FH_generating = true;
  toast(lang==='es' ? 'Generando tu PDF…' : 'Generating your PDF…');
  var bytes, result;
  try {
    result = await n400FH_buildPdf();
    bytes = result.bytes;
  } catch(e){
    n400FH_generating = false;
    toast(lang==='es' ? 'No se pudo generar el PDF' : 'Could not generate the PDF');
    return;
  }
  n400FH_generating = false;
  if(result.skipped && result.skipped.length){
    setTimeout(function(){
      toast((lang==='es'
        ? 'No cupo en el PDF — añádelo a mano (Parte 14): '
        : 'Didn\'t fit on the PDF — add by hand (Part 14): ') + result.skipped.join(' · '));
    }, 2500);
  }
  if(Store.isNative()){
    var fs = window.CapFilesystem, share = window.CapShare, dir = window.CapFsDirectory;
    if(fs && share && fs.writeFile){
      // base64-encode in chunks (large file)
      var bin = '';
      for(var i = 0; i < bytes.length; i += 0x8000){
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      }
      var b64 = btoa(bin);
      fs.writeFile({ path: 'camino-n400-draft.pdf', data: b64, directory: (dir && dir.Cache) || 'CACHE' })
        .then(function(res){ return share.share({ title: 'N-400 draft (review, complete & sign)', url: res.uri }); })
        .catch(function(e){ if(!(e && /cancel/i.test(e.message||''))) toast(lang==='es'?'No se pudo compartir':'Could not share'); });
    } else {
      toast(lang==='es' ? 'Compartir no disponible' : 'Sharing unavailable');
    }
    return;
  }
  var blob = new Blob([bytes], {type:'application/pdf'});
  var url = URL.createObjectURL(blob);
  var el = document.createElement('a');
  el.href = url; el.download = 'camino-n400-draft.pdf';
  document.body.appendChild(el); el.click();
  setTimeout(function(){ document.body.removeChild(el); URL.revokeObjectURL(url); }, 100);
  toast(lang==='es' ? 'PDF descargado · revísalo página por página' : 'PDF downloaded · review it page by page');
}

// ===== ELIGIBILITY WIZARD =====
var ELIG_STEPS = ['continuous','physical','state','crime','result'];

var eligState = {
  step: 0,
  continuous: null,
  physical: null,
  state: null,
  crime: null
};
function statusOf(i, curIdx){
  if(i < curIdx) return 'done';
  if(i === curIdx) return 'current';
  return 'upcoming';
}

function renderHomeStrip(){
  var el = document.getElementById('homeJStrip');
  if(!el) return;
  var sitCard = document.getElementById('homeSituationCard');
  if(!isOnGCPath()){
    el.style.display = 'none';
    if(sitCard){ sitCard.style.display = ''; renderHomeSituationCard(); }
    var lbl = document.querySelector('#home .pad .sec[data-en="Where you are"]');
    if(lbl){ lbl.style.display = ''; lbl.textContent = lang==='es' ? 'Tu situación' : 'Your situation'; }
    return;
  }
  el.style.display = '';
  if(sitCard) sitCard.style.display = 'none';
  var lbl2 = document.querySelector('#home .pad .sec[data-en="Where you are"]');
  if(lbl2){
    lbl2.style.display = '';
    lbl2.textContent = lang==='es' ? 'Dónde estás' : 'Where you are';
  }
  var curIdx = stageIndex(user.currentStageId);
  var cur = STAGES[curIdx];
  var nodesHtml = '';
  for(var i=0;i<STAGES.length;i++){
    var s = statusOf(i, curIdx);
    var cls = s==='done' ? 'done' : s==='current' ? 'cur' : 'todo';
    var inner = s==='done' ? '✓' : s==='current' ? String(i+1) : '';
    nodesHtml += '<div class="node '+cls+'">'+inner+'</div>';
    if(i < STAGES.length-1){
      nodesHtml += '<div class="seg '+(s==='done'?'on':'off')+'"></div>';
    }
  }
  var labels = STAGES.map(function(s){ return '<span>'+s.short[lang]+'</span>'; }).join('');
  var timeline = projectTimeline();
  var timeHtml = '';
  if(timeline){
    var totalTxt = fmtMonthsTotal(timeline.totalMonthsLow, timeline.totalMonthsHigh, lang);
    timeHtml = '<div class="jtime">⏱ ' + totalTxt + ' ' + (lang==='es' ? 'a la ciudadanía' : 'to citizenship') + '</div>';
  }
  el.innerHTML =
    '<div class="jtitle">'+(lang==='es'?'Tu camino a la ciudadanía':'Your path to citizenship')+'</div>'+
    '<div class="jstage">'+(cur.home?cur.home.headline[lang]:cur.name[lang])+'</div>'+
    '<div class="track">'+nodesHtml+'</div>'+
    '<div class="tlabels">'+labels+'</div>' +
    timeHtml;
}

// Path-specific "next action" — the single most important next thing for this user's situation.
// Each returns {title, sub, ctaLabel, ctaAction, urgent (bool)}
function pathNextAction(){
  var phase = user.phase;
  if(!phase) return null;
  var goal = user.immigrationGoal;

  // Goal-driven overrides: when the user has citizenship as their long-term goal,
  // emphasize the bridge to a green card path earlier in their journey.
  if(goal === 'citizenship' && phase === 'student'){
    return {
      title: lang==='es' ? 'Tu camino largo: F-1 → OPT → empleo → residencia' : 'Long arc: F-1 → OPT → employment → green card',
      sub: lang==='es'
        ? 'Primero termina tu título y tu OPT. Luego empleador → H-1B → I-140. Es paciencia, no es magia.'
        : 'Finish your degree and OPT first. Then employer → H-1B → I-140. It\'s patience, not magic.',
      ctaLabel: lang==='es' ? 'Ver el camino' : 'See the arc',
      ctaAction: "toggleVisaPath('eb2'); go('visaPaths')"
    };
  }
  if(goal === 'citizenship' && phase === 'opt'){
    return {
      title: lang==='es' ? 'Tu paso clave: H-1B → I-140' : 'Your key step: H-1B → I-140',
      sub: lang==='es'
        ? 'Para llegar a ciudadanía necesitas residencia primero. Empieza la conversación con tu empleador AHORA.'
        : 'Citizenship needs a green card first. Start the I-140 sponsorship conversation with your employer NOW.',
      ctaLabel: lang==='es' ? 'Ver EB-2' : 'See EB-2',
      ctaAction: "toggleVisaPath('eb2'); go('visaPaths')",
      urgent: true
    };
  }
  if(goal === 'protection' && phase !== 'asylum'){
    return {
      title: lang==='es' ? 'Considera presentar I-589' : 'Consider filing I-589',
      sub: lang==='es'
        ? 'Si temes regresar a tu país, tienes 1 año desde tu llegada para presentar asilo.'
        : 'If you fear returning home, you have 1 year from arrival to file for asylum.',
      ctaLabel: lang==='es' ? 'Ver asilo' : 'See asylum',
      ctaAction: "toggleVisaPath('asylum'); go('visaPaths')",
      urgent: true
    };
  }
  if(goal === 'study' && phase === 'other'){
    return {
      title: lang==='es' ? 'Aplica a una escuela aprobada por SEVP' : 'Apply to a SEVP-approved school',
      sub: lang==='es'
        ? 'Necesitas un I-20 de una escuela aprobada antes de pedir tu visa F-1.'
        : 'You need an I-20 from an approved school before applying for your F-1 visa.',
      ctaLabel: lang==='es' ? 'Ver F-1' : 'See F-1',
      ctaAction: "toggleVisaPath('student'); go('visaPaths')"
    };
  }

  if(phase === 'student'){
    return {
      title: lang==='es' ? 'Planifica tu OPT' : 'Plan your OPT timing',
      sub: lang==='es'
        ? 'Presenta el I-765 hasta 90 días antes de graduarte. STEM: 12 + 24 meses.'
        : 'File Form I-765 up to 90 days before graduation. STEM majors get 12 + 24 months.',
      ctaLabel: lang==='es' ? 'Ver OPT en detalle' : 'See OPT details',
      ctaAction: "toggleVisaPath('opt'); go('visaPaths')"
    };
  }
  if(phase === 'opt'){
    return {
      title: lang==='es' ? 'Mira la lotería H-1B' : 'Watch the H-1B lottery',
      sub: lang==='es'
        ? 'Registro: marzo. Selección: finales de marzo. Empleadores patrocinan el I-129.'
        : 'Registration: March. Selection: late March. Employers file I-129 on your behalf.',
      ctaLabel: lang==='es' ? 'Ver H-1B en detalle' : 'See H-1B details',
      ctaAction: "toggleVisaPath('h1b'); go('visaPaths')",
      urgent: true
    };
  }
  if(phase === 'workvisa'){
    return {
      title: lang==='es' ? 'Inicia la conversación I-140' : 'Start the I-140 conversation',
      sub: lang==='es'
        ? 'Tu empleador patrocina la residencia con el I-140. Empieza temprano — tomará años.'
        : "Your employer files I-140 to sponsor your green card. Start early — it takes years.",
      ctaLabel: lang==='es' ? 'Ver vías de residencia' : 'See green card paths',
      ctaAction: "toggleVisaPath('eb2'); go('visaPaths')"
    };
  }
  if(phase === 'asylum'){
    return {
      title: lang==='es' ? 'Solicita tu EAD (I-765)' : 'Apply for your EAD (I-765)',
      sub: lang==='es'
        ? 'Después de 150 días con tu I-589 pendiente puedes pedir permiso de trabajo. Es gratis.'
        : '150 days after filing I-589, you can apply for a work permit. Filing fee is $0 for asylum applicants.',
      ctaLabel: lang==='es' ? 'Ver asilo en detalle' : 'See asylum details',
      ctaAction: "toggleVisaPath('asylum'); go('visaPaths')",
      urgent: true
    };
  }
  if(phase === 'preGC'){
    var pt = user.petitionType;
    if(pt === 'employment'){
      return {
        title: lang==='es' ? 'Mira el Boletín de Visas mensual' : 'Watch the monthly Visa Bulletin',
        sub: lang==='es'
          ? 'Publica el día 9 cada mes. Tu fecha de prioridad debe ser anterior a la fecha de corte para presentar el I-485.'
          : 'Published the 9th each month. Your priority date must be earlier than the cutoff before you can file I-485.',
        ctaLabel: lang==='es' ? 'Abrir travesia.state.gov' : 'Open travel.state.gov',
        ctaAction: "openExternal('https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html')"
      };
    }
    if(pt === 'family-pref' || pt === 'family-lpr'){
      return {
        title: lang==='es' ? 'Sigue el Boletín de Visas' : 'Track the Visa Bulletin',
        sub: lang==='es'
          ? 'Tu categoría familiar tiene cuota anual. El boletín muestra cuándo te toca presentar.'
          : 'Your family category has an annual quota. The bulletin tells you when it\'s your turn to file.',
        ctaLabel: lang==='es' ? 'Abrir Boletín' : 'Open Visa Bulletin',
        ctaAction: "openExternal('https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html')"
      };
    }
    if(pt === 'family-ir'){
      return {
        title: lang==='es' ? 'Prepara biométricos + entrevista' : 'Prepare for biometrics + interview',
        sub: lang==='es'
          ? 'Como familiar inmediato no hay espera de cuota. El siguiente paso suele ser biométricos en 6-10 semanas.'
          : 'Immediate-relative category has no quota wait. Biometrics usually scheduled within 6-10 weeks.',
        ctaLabel: lang==='es' ? 'Ver documentos para entrevista' : 'See interview docs',
        ctaAction: "go('docs')"
      };
    }
    if(pt === 'asylum'){
      return {
        title: lang==='es' ? 'Espera 1 año luego presenta I-485' : 'Wait 1 year, then file I-485',
        sub: lang==='es'
          ? 'Una vez que te aprueben asilo, debes esperar 1 año antes de presentar la residencia.'
          : 'After asylum is granted, you must wait 1 year before applying for adjustment of status.',
        ctaLabel: lang==='es' ? 'Ver requisitos del I-485' : 'See I-485 requirements',
        ctaAction: "openExternal('https://www.uscis.gov/i-485')"
      };
    }
    return null;
  }
  if(phase === 'hasGC'){
    // Stage-based next-step card handles this — but if they haven't started N-400 yet, surface it
    if(user.currentStageId !== 'file-n400' && user.currentStageId !== 'interview' && user.currentStageId !== 'oath'){
      return {
        title: lang==='es' ? 'Prepárate para el N-400' : 'Prep for your N-400',
        sub: lang==='es'
          ? 'Puedes empezar a estudiar cívica y reunir documentos antes de cumplir 5 años (o 3 con cónyuge ciudadano).'
          : 'Start studying civics + gathering documents before you hit 5 years (or 3 if married to a citizen).',
        ctaLabel: lang==='es' ? 'Recorrer el N-400' : 'Walk through N-400',
        ctaAction: "startN400Walkthrough()"
      };
    }
  }
  if(phase === 'other'){
    return {
      title: lang==='es' ? 'Explora las vías' : 'Browse the paths',
      sub: lang==='es'
        ? 'Encuentra cuál se adapta a tu situación.'
        : 'Find which one fits your situation.',
      ctaLabel: lang==='es' ? 'Ver vías' : 'See paths',
      ctaAction: "go('visaPaths')"
    };
  }
  return null;
}

function renderHomeSituationCard(){
  var el = document.getElementById('homeSituationCard');
  if(!el) return;
  var p = PHASES[user.phase];
  if(!p){
    el.innerHTML = '<div class="situationTitle">'+(lang==='es'?'Explorando vías':'Exploring paths')+'</div>'
      + '<div class="situationSub">'+(lang==='es'?'Toca para ver las opciones de inmigración.':"Tap to view the immigration paths.")+'</div>'
      + '<button class="cta ctaSky situationCta" onclick="go(\'visaPaths\')">'+(lang==='es'?'Ver vías':'See paths')+' →</button>';
    return;
  }
  var visaLookup = {student:'student', opt:'opt', workvisa:'h1b', asylum:'asylum', other:null};
  var visaId = visaLookup[user.phase];
  var next = pathNextAction();
  var urgentCls = next && next.urgent ? ' situationNextUrgent' : '';

  var goalInfo = user.immigrationGoal ? IMMIGRATION_GOALS[user.immigrationGoal] : null;
  var goalRow = goalInfo
    ? '<div class="situationGoalRow">'
      + '<div class="situationGoalIco" style="background:'+goalInfo.iconColor+'1f">'+iconSVG(goalInfo.iconName, goalInfo.iconColor, 18)+'</div>'
      + '<div class="situationGoalText">'
      +   '<span class="situationGoalLbl">'+(lang==='es'?'Meta:':'Goal:')+'</span> '
      +   '<span class="situationGoalVal">'+goalInfo.label[lang]+'</span>'
      + '</div>'
      + '</div>'
    : '';

  // Live doc-readiness progress strip — reactive to toggleDocument
  var docs = docsReady();
  var docPct = docs.total > 0 ? Math.round((docs.ready / docs.total) * 100) : 0;
  var docsTone = docPct >= 80 ? 'good' : docPct >= 40 ? 'mid' : 'low';
  var docsLine = '';
  if(docs.total > 0){
    docsLine = '<div class="situationProgressRow" onclick="go(\'docs\')">'
      + '<div class="situationProgressLeft">'
      +   '<div class="situationProgressLbl">'+(lang==='es'?'Documentos para tu vía':'Docs for your path')+'</div>'
      +   '<div class="situationProgressStats">'+docs.ready+'/'+docs.total+' '+(lang==='es'?'listos':'ready')+' · '+docPct+'%</div>'
      +   '<div class="situationProgressBar"><div class="situationProgressFill situationProgressFill-'+docsTone+'" style="width:'+docPct+'%"></div></div>'
      + '</div>'
      + '<div class="situationProgressArrow">›</div>'
      + '</div>';
  }

  el.innerHTML = '<div class="situationRow">'
    + '<div class="situationIco" style="background:'+p.iconColor+'1f">'+iconSVG(p.iconName, p.iconColor, 26)+'</div>'
    + '<div class="situationMain">'
    +   '<div class="situationKick">'+(lang==='es'?'TU VÍA':'YOUR PATH')+'</div>'
    +   '<div class="situationTitle">'+p.label[lang]+'</div>'
    +   '<div class="situationSub">'+p.sub[lang]+'</div>'
    + '</div>'
    + '</div>'
    + goalRow
    + docsLine
    + (next
        ? '<div class="situationNext'+urgentCls+'">'
          + '<div class="situationNextLbl">'+(next.urgent ? '⚡ ' : '➜ ') + (lang==='es'?'PRÓXIMA ACCIÓN':'NEXT ACTION')+'</div>'
          + '<div class="situationNextTitle">'+next.title+'</div>'
          + '<div class="situationNextSub">'+next.sub+'</div>'
          + '<button class="situationNextBtn" onclick="'+next.ctaAction+'">'+next.ctaLabel+' →</button>'
          + '</div>'
        : '')
    + '<button class="situationDetailBtn" onclick="'+(visaId ? 'toggleVisaPath(\''+visaId+'\'); go(\'visaPaths\')' : 'go(\'visaPaths\')')+'">'+(lang==='es'?'Ver mi vía en detalle':'See my path in detail')+' →</button>';
}

function renderHomeNext(){
  var el = document.getElementById('homeNext');
  if(!el) return;
  if(!isOnGCPath()){
    el.style.display = 'none';
    var lbl = document.querySelector('#home .pad .sec[data-en="Your next step"]');
    if(lbl) lbl.style.display = 'none';
    return;
  }
  el.style.display = '';
  var lbl2 = document.querySelector('#home .pad .sec[data-en="Your next step"]');
  if(lbl2) lbl2.style.display = '';
  var cur = STAGES[stageIndex(user.currentStageId)];
  if(!cur){ el.innerHTML=''; return; }
  var h = cur.home;
  if(!h){ el.innerHTML=''; return; }
  var act = h.ctaAction === 'eligibility' ? 'startEligibility()' : 'advanceStage()';
  el.innerHTML =
    '<span class="pill">● '+h.pill[lang]+'</span>'+
    '<div class="nextTitle">'+h.title[lang]+'</div>'+
    '<div class="nextSub">'+autolinkForms(h.sub(user, lang))+'</div>'+
    '<button class="cta" onclick="'+act+'">'+h.cta[lang]+' →</button>';
}

function renderJourney(){
  var el = document.getElementById('journeySteps');
  if(!el) return;
  // For non-GC track users, render their path-specific journey (PATH_JOURNEYS).
  if(!isOnGCPath()){
    renderPathJourney(el);
    return;
  }
  var curIdx = stageIndex(user.currentStageId);
  var timeline = projectTimeline();
  var mMap = {};
  if(timeline) timeline.milestones.forEach(function(m){ mMap[m.stageId] = m; });

  var html = '';
  for(var i=0;i<STAGES.length;i++){
    var s = STAGES[i];
    var st = statusOf(i, curIdx);
    var dotCls = st==='done' ? 'done' : st==='current' ? 'cur' : 'todo';
    var dotInner = st==='done' ? '✓' : String(i+1);
    var isLast = i === STAGES.length - 1;
    var barCls = st==='done' ? 'bar on' : 'bar';
    var cardCls = st==='current' ? 'stepCard curC' : 'stepCard';
    var tagCls, tagTxt;
    if(st==='done'){ tagCls='tagDone'; tagTxt = lang==='es'?'Hecho':'Done'; }
    else if(st==='current'){ tagCls='tagNow'; tagTxt = lang==='es'?'Estás aquí':'You are here'; }
    else { tagCls='tagNext'; tagTxt = s.upcomingTag[lang]; }
    var estHtml = '';
    if(st !== 'done' && mMap[s.id]){
      var m = mMap[s.id];
      var rangeTxt = fmtMonthRange(m.endLow, m.endHigh, lang);
      var label = (st === 'current') ? (lang==='es' ? 'Listo: ' : 'Done by: ') : (lang==='es' ? 'Est. ' : 'Est. ');
      estHtml = '<div class="stepEst">⏱ ' + label + rangeTxt + '</div>';
    }
    var formsHtml = renderStageFormChips(s.id);
    html +=
      '<div class="step">'+
        '<div class="stepLine">'+
          '<div class="dot '+dotCls+'">'+dotInner+'</div>'+
          (isLast?'':'<div class="'+barCls+'"></div>')+
        '</div>'+
        '<div class="'+cardCls+'">'+
          '<div class="stepName">'+autolinkForms(s.name[lang])+'</div>'+
          '<div class="stepMeta">'+autolinkForms(s.meta(user, lang, st))+'</div>'+
          '<span class="stepTag '+tagCls+'">'+tagTxt+'</span>'+
          estHtml+
          formsHtml+
        '</div>'+
      '</div>';
  }
  el.innerHTML = html + '<div style="height:10px"></div>';

  var sub = document.getElementById('journeySub');
  if(sub){
    if(timeline && timeline.milestones.length > 0){
      var oath = timeline.milestones[timeline.milestones.length - 1];
      var totalTxt = fmtMonthsTotal(timeline.totalMonthsLow, timeline.totalMonthsHigh, lang);
      var oathTxt = fmtMonthRange(oath.endLow, oath.endHigh, lang);
      sub.textContent = totalTxt + ' · ' + (lang==='es' ? 'juramento ' : 'oath ') + oathTxt;
    } else {
      var cur = STAGES[curIdx];
      sub.textContent = (lang==='es' ? 'Paso ' : 'Step ') + (curIdx+1) + (lang==='es'?' de ':' of ') + STAGES.length + ' · ' + cur.name[lang];
    }
  }
}

var ICON_COLORS = {
  rIcoPlum:'#8c4dd1', rIcoTeal:'#00b4a8', rIcoGreen:'#00b4a8', rIcoSky:'#1cb0f6',
  rIcoMarigold:'#ff9b21', rIcoCoral:'#ff4d3a', rIcoRose:'#ec4f93'
};
function populateIcons(){
  document.querySelectorAll('[data-icon]').forEach(function(el){
    if(el.dataset.populated) return;
    var name = el.getAttribute('data-icon');
    var size = parseInt(el.getAttribute('data-size') || '20', 10);
    var color = '#1d1d22';
    Object.keys(ICON_COLORS).forEach(function(cls){
      if(el.classList.contains(cls)) color = ICON_COLORS[cls];
    });
    el.innerHTML = iconSVG(name, color, size);
    el.dataset.populated = '1';
  });
  document.querySelectorAll('.chev').forEach(function(el){
    if(el.dataset.populated) return;
    el.innerHTML = iconSVG('chevron', '#beb9af', 18);
    el.dataset.populated = '1';
  });
}

function renderAll(){
  renderHomeStrip();
  renderHomeNext();
  renderJourney();
  renderLearnPath();
  renderHomeLessonCard();
  renderHomeMockCard();
  renderHomeFlashcardCard();
  renderHomeInterviewCard();
  renderHomeReviewCard();
  populateIcons();
  renderHomeStreakRisk();
  renderHomeStats();
  renderHomeDocsRow();
  renderHomeDatesRow();
  renderHomeN400Row();
  renderHomeN400FormRow();
  renderHomeVisaRow();
  renderUndoBanner();
}

function advanceStage(){
  var i = stageIndex(user.currentStageId);
  if(i >= STAGES.length - 1){
    toast(lang==='es' ? '🎉 ¡Felicidades, ciudadano!' : '🎉 Congratulations, citizen!');
    return;
  }
  var prev = user.currentStageId;
  user.currentStageId = STAGES[i+1].id;
  user.recentStageChange = {
    prevStageId: prev,
    newStageId: STAGES[i+1].id,
    at: Date.now()
  };
  saveUser();
  renderAll();
  var nextName = STAGES[i+1].name[lang];
  toast((lang==='es' ? '+25 XP · Avanzaste a: ' : '+25 XP · Advanced to: ') + nextName);
}

function undoStageAdvance(){
  if(!user.recentStageChange) return;
  user.currentStageId = user.recentStageChange.prevStageId;
  user.recentStageChange = null;
  saveUser();
  renderAll();
  toast(lang==='es' ? 'Etapa restaurada' : 'Stage restored');
}

function dismissUndoBanner(){
  user.recentStageChange = null;
  saveUser();
  renderUndoBanner();
}

function renderUndoBanner(){
  var el = document.getElementById('undoBanner');
  if(!el) return;
  var c = user.recentStageChange;
  // Show for 24 hours after a stage change
  var FRESH = 24 * 60 * 60 * 1000;
  if(!c || (Date.now() - c.at) > FRESH){
    el.style.display = 'none';
    return;
  }
  var prevStage = STAGES[stageIndex(c.prevStageId)];
  var newStage = STAGES[stageIndex(c.newStageId)];
  if(!prevStage || !newStage){ el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = '<div class="undoIco">'+iconSVG('refresh','#1cb0f6',18)+'</div>'
    + '<div class="undoMain">'
    +   '<div class="undoTitle">'+(lang==='es'?'¿Lo hiciste por accidente?':'Tapped by accident?')+'</div>'
    +   '<div class="undoSub">'+(lang==='es'?'Avanzaste a ':'Advanced to ')+newStage.name[lang]+'</div>'
    + '</div>'
    + '<button class="undoBtn" onclick="undoStageAdvance()">'+(lang==='es'?'Deshacer':'Undo')+'</button>'
    + '<button class="undoClose" onclick="dismissUndoBanner()" aria-label="dismiss">×</button>';
}

function applyHeroName(){
  var n = document.getElementById('heroName');
  if(!n) return;
  var nameGreets = {
    en: 'Hi, ',
    es: 'Hola, ',
    zh: '你好, ',
    vi: 'Chào, '
  };
  n.textContent = (nameGreets[lang] || nameGreets.en) + (user.name || '');
}

function syncLangButtons(){
  document.querySelectorAll('.lang').forEach(function(group){
    group.querySelectorAll('button').forEach(function(b){
      b.classList.remove('on');
      var t = (b.textContent || '').trim().toUpperCase();
      if((lang==='en' && t==='EN') || (lang==='es' && t==='ES')) b.classList.add('on');
    });
  });
  document.querySelectorAll('.meLangCard').forEach(function(c){ c.classList.remove('meLangSel'); });
}

function maybeShowBetaToast(){
  var info = langInfo();
  if(!info.fullyTranslated){
    toast(info.code === 'zh' ? '部分翻译 — 大部分内容仍是英文' :
          info.code === 'vi' ? 'Đang dịch — phần lớn nội dung vẫn bằng tiếng Anh' :
          'Translations in progress — most content still in English');
  }
}

function applyStaticTranslations(){
  document.querySelectorAll('[data-en]').forEach(function(el){
    el.textContent = el.getAttribute('data-'+lang);
  });
}

function setLang(l, btn){
  var prevLang = lang;
  lang = l;
  // Remember the user's non-English preference so the hero toggle can flip back to it.
  if(l !== 'en' && GREETINGS[l]){
    user.preferredLang = l;
  }
  syncLangButtons();
  renderHeroLang();
  updateGreeting();
  applyStaticTranslations();
  applyHeroName();
  renderAll();
  if(document.getElementById('onbStep')) renderOnboarding();
  if(document.getElementById('n400Body') && n400State) renderN400();
  if(document.getElementById('meBody')) renderMe();
  if(document.getElementById('docsList')) renderDocs();
  if(document.getElementById('helpList')) renderHelp();
  if(document.getElementById('datesList')) renderDates();
  if(typeof docDetailId !== 'undefined' && docDetailId && document.getElementById('docDetailBody')) renderDocDetail();
  if(typeof editFieldState !== 'undefined' && editFieldState && document.getElementById('editFieldBody')) renderEditField();
  if(lessonState && document.getElementById('opts')) renderQuestion();
  if(typeof mockState !== 'undefined' && mockState && document.getElementById('mtQwrap')) renderMockQuestion();
  if(typeof intvState !== 'undefined' && intvState && document.getElementById('intvBody')) renderInterview();
  if(typeof eligState !== 'undefined' && eligState && document.getElementById('eligStep')) renderEligibility();
  if(typeof flashState !== 'undefined' && flashState && document.getElementById('flashBody')) renderFlashcard();
  if(user.onboarded) saveUser();
  if(prevLang !== lang && !langInfo().fullyTranslated) maybeShowBetaToast();
}

function go(id){
  // Redirect legacy tab destinations into the unified path view
  if(id === 'docs'){ pathTab = 'docs'; id = 'path'; }
  else if(id === 'journey'){ pathTab = 'steps'; id = 'path'; }

  document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('show'); });
  var view = document.getElementById(id);
  if(view) view.classList.add('show');
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); t.removeAttribute('aria-current'); });
  // Map old journey/docs IDs to the new combined 'path' tab so deep-links still highlight correctly
  var map = {
    home:'t-home',
    path:'t-path', journey:'t-path', docs:'t-path', visaPaths:'t-path',
    lesson:'t-lesson', learn:'t-lesson',
    cami:'t-cami',
    me:'t-me'
  };
  if(map[id]){
    var tabEl = document.getElementById(map[id]);
    if(tabEl){
      tabEl.classList.add('active');
      tabEl.setAttribute('aria-current', 'page');
    }
  }
  var tabbar = document.querySelector('.tabbar');
  if(tabbar) tabbar.classList.toggle('hidden', id === 'onboarding' || id === 'eligibility' || id === 'mockTest' || id === 'n400' || id === 'n400Form' || id === 'docDetail' || id === 'editField' || id === 'interview' || id === 'flashcards' || id === 'lesson' || id === 'upgrade' || id === 'trialOffer' || id === 'eligWiz');
  if(id === 'home') renderAll();  // streak/XP/ready chips + cards must reflect activity from other views
  if(id === 'n400Form') renderN400FormView();
  if(id === 'docs') renderDocs(); // legacy direct call, still supported
  if(id === 'me') renderMe();
  if(id === 'help') renderHelp();
  if(id === 'learn') renderLearnPath();
  if(id === 'dates') renderDates();
  if(id === 'visaPaths') renderVisaPaths();
  if(id === 'upgrade') renderUpgrade();
  if(id === 'trialOffer') renderTrialOffer();
  if(id === 'eligPicker') renderEligPicker();
  if(id === 'visaBulletin') renderVisaBulletin();
  if(id === 'path') renderPath();
  if(id === 'cami'){ renderCamiTop(); renderCamiChat(); }
  document.querySelectorAll('.body').forEach(function(b){ b.scrollTop=0; });
}

// ===== PATH VIEW (combined Journey + Docs) =====
var pathTab = 'steps'; // 'steps' | 'docs'

function setPathTab(tab){
  pathTab = tab;
  renderPath();
}

function renderPath(){
  var titleEl = document.getElementById('pathTitle');
  var subEl = document.getElementById('pathSub');
  var content = document.getElementById('pathContent');
  var segSteps = document.getElementById('pathSegSteps');
  var segDocs = document.getElementById('pathSegDocs');
  if(!content) return;

  if(segSteps) segSteps.classList.toggle('pathSegActive', pathTab === 'steps');
  if(segDocs) segDocs.classList.toggle('pathSegActive', pathTab === 'docs');

  var phaseInfo = user.phase ? PHASES[user.phase] : null;
  if(titleEl) titleEl.textContent = phaseInfo
    ? (lang==='es'?'Tu vía':'Your path') + ' · ' + phaseInfo.label[lang]
    : (lang==='es'?'Tu vía':'Your path');

  if(pathTab === 'steps'){
    if(subEl){
      if(isOnGCPath()){
        var tl = projectTimeline();
        if(tl && tl.milestones.length > 0){
          var oath = tl.milestones[tl.milestones.length-1];
          subEl.textContent = fmtMonthsTotal(tl.totalMonthsLow, tl.totalMonthsHigh, lang) + ' · ' + (lang==='es'?'juramento ':'oath ') + fmtMonthRange(oath.endLow, oath.endHigh, lang);
        } else {
          subEl.textContent = lang==='es' ? 'Etapas a la ciudadanía' : 'Stages to citizenship';
        }
      } else {
        var j = userPathJourney();
        subEl.textContent = j ? j.title[lang] : (lang==='es' ? 'Tu camino paso a paso' : 'Your path step by step');
      }
    }
    renderPathSteps(content);
  } else {
    if(subEl){
      var pathKey = userDocPathKey();
      var lbl = (DOC_PATH_LABELS[pathKey] || DOC_PATH_LABELS.n400)[lang];
      var stat = docsReady();
      subEl.textContent = lbl + ' · ' + stat.ready + '/' + stat.total + ' ' + (lang==='es'?'listos':'ready');
    }
    renderPathDocs(content);
  }
}

// Render the journey steps inline into a custom container.
function renderPathSteps(container){
  if(!isOnGCPath()){
    renderPathJourney(container);
    return;
  }
  // GC path: reproduce the journey list inline
  var curIdx = stageIndex(user.currentStageId);
  var timeline = projectTimeline();
  var mMap = {};
  if(timeline) timeline.milestones.forEach(function(m){ mMap[m.stageId] = m; });

  var html = '';
  for(var i=0;i<STAGES.length;i++){
    var s = STAGES[i];
    var st = statusOf(i, curIdx);
    var dotCls = st==='done' ? 'done' : st==='current' ? 'cur' : 'todo';
    var dotInner = st==='done' ? '✓' : String(i+1);
    var isLast = i === STAGES.length - 1;
    var barCls = st==='done' ? 'bar on' : 'bar';
    var cardCls = st==='current' ? 'stepCard curC' : 'stepCard';
    var tagCls, tagTxt;
    if(st==='done'){ tagCls='tagDone'; tagTxt = lang==='es'?'Hecho':'Done'; }
    else if(st==='current'){ tagCls='tagNow'; tagTxt = lang==='es'?'Estás aquí':'You are here'; }
    else { tagCls='tagNext'; tagTxt = s.upcomingTag[lang]; }
    var estHtml = '';
    if(st !== 'done' && mMap[s.id]){
      var m = mMap[s.id];
      var rangeTxt = fmtMonthRange(m.endLow, m.endHigh, lang);
      var label = (st === 'current') ? (lang==='es' ? 'Listo: ' : 'Done by: ') : (lang==='es' ? 'Est. ' : 'Est. ');
      estHtml = '<div class="stepEst">⏱ ' + label + rangeTxt + '</div>';
    }
    var formsHtml = renderStageFormChips(s.id);
    html +=
      '<div class="step">'+
        '<div class="stepLine">'+
          '<div class="dot '+dotCls+'">'+dotInner+'</div>'+
          (isLast?'':'<div class="'+barCls+'"></div>')+
        '</div>'+
        '<div class="'+cardCls+'">'+
          '<div class="stepName">'+autolinkForms(s.name[lang])+'</div>'+
          '<div class="stepMeta">'+autolinkForms(s.meta(user, lang, st))+'</div>'+
          '<span class="stepTag '+tagCls+'">'+tagTxt+'</span>'+
          estHtml+
          formsHtml+
        '</div>'+
      '</div>';
  }
  container.innerHTML = html + '<div style="height:10px"></div>';
}

// Render the doc list inline into a custom container (no header — path has its own).
function renderPathDocs(container){
  var apps = applicableDocuments({all: docsViewState.showAll});
  var allCount = applicableDocuments({all: true}).length;
  var pathCount = applicableDocuments().length;

  var html = '';
  // Educational N-400 walkthrough card (n400 path only)
  var pathKey = userDocPathKey();
  if(pathKey === 'n400'){
    html += n400WalkthroughCard();
    html += n400FormHelperCard();
  }

  html += '<div class="docsFilterRow">'
    + '<button class="docsFilterBtn'+(!docsViewState.showAll?' docsFilterActive':'')+'" onclick="docsViewState.showAll=false; renderPath();">'
    +   (lang==='es' ? 'Solo mi vía' : 'My path only') + ' <span class="docsFilterCount">'+pathCount+'</span>'
    + '</button>'
    + '<button class="docsFilterBtn'+(docsViewState.showAll?' docsFilterActive':'')+'" onclick="docsViewState.showAll=true; renderPath();">'
    +   (lang==='es' ? 'Mostrar todos' : 'Show all') + ' <span class="docsFilterCount">'+allCount+'</span>'
    + '</button>'
    + '</div>';

  for(var c=0;c<DOC_CATS.length;c++){
    var cat = DOC_CATS[c];
    var catDocs = apps.filter(function(d){ return d.cat === cat.id; });
    if(catDocs.length === 0) continue;
    var catIco = '<span class="docCatIco" style="background:'+cat.color+'1a;">'+iconSVG(cat.icon, cat.color, 18)+'</span>';
    html += '<div class="docCatHead">'+catIco+cat.label[lang]+'</div>';
    html += '<div class="mini">';
    for(var i=0;i<catDocs.length;i++){
      var d = catDocs[i];
      var st = docStatusOf(d.id);
      var got = st === 'ready', prog = st === 'progress';
      var optTag = d.optional ? '<span class="docOpt">'+(lang==='es'?'opcional':'optional')+'</span>' : '';
      var progTag = prog ? '<span class="docProgTag">'+(lang==='es'?'en progreso':'in progress')+'</span>' : '';
      var checkContent = got ? iconSVG('check', '#fff', 16) : (prog ? iconSVG('clock', '#fff', 14) : '');
      html += '<div class="row docRow'+(got?' docDone':'')+(prog?' docProg':'')+'">'
        + '<div class="docCheck" onclick="event.stopPropagation(); toggleDocument(\''+d.id+'\')">'+checkContent+'</div>'
        + '<div class="rMain" onclick="openDocDetail(\''+d.id+'\')"><div class="rTitle">'+d.name[lang]+' '+optTag+progTag+'</div><div class="rSub">'+d.sub[lang]+'</div></div>'
        + '<div class="chev" onclick="openDocDetail(\''+d.id+'\')"></div>'
        + '</div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
  populateIcons();
}

function renderCamiTop(){
  var top = document.getElementById('camiTopCami');
  if(top && !top.dataset.populated){
    top.innerHTML = camiSVG(CAMI_AVAILABLE ? 'happy' : 'thinking');
    top.dataset.populated = '1';
  }
  // Reflect coming-soon state in the role text
  if(!CAMI_AVAILABLE){
    var role = document.querySelector('#cami .camiTopRole');
    if(role) role.textContent = lang==='es' ? 'Próximamente — entrenándome' : 'Coming soon — training up';
  }
}

// ===== ONBOARDING WIZARD =====
var ONB_STEPS = ['lang','name','country','phase','goal','petition','stage','gcDate','married','marriageDate','monthsOutside','criminal','time','summary'];

// Immigration goal — where the user wants to end up. Drives next-action emphasis on home.
var IMMIGRATION_GOALS = {
  citizenship: {
    iconName:'flag', iconColor:'#ffc83d',
    label:{en:'Become a U.S. citizen',    es:'Volverme ciudadano/a de EE.UU.'},
    sub:  {en:'Full naturalization — voting, passport, everything', es:'Naturalización completa — voto, pasaporte, todo'}
  },
  greenCard: {
    iconName:'id', iconColor:'#00b4a8',
    label:{en:'Get a green card',          es:'Obtener la residencia'},
    sub:  {en:'Permanent residence — work, live, travel freely', es:'Residencia permanente — vivir y trabajar libremente'}
  },
  career: {
    iconName:'briefcase', iconColor:'#5e8eff',
    label:{en:'Build a career here',       es:'Construir una carrera aquí'},
    sub:  {en:'Work visa → green card → maybe citizenship later', es:'Visa de trabajo → residencia → quizás ciudadanía'}
  },
  study: {
    iconName:'book', iconColor:'#1cb0f6',
    label:{en:'Get a U.S. education',      es:'Estudiar en EE.UU.'},
    sub:  {en:'Degree first, decide what comes next later',       es:'Primero el título, luego decidir'}
  },
  family: {
    iconName:'people', iconColor:'#ec4f93',
    label:{en:'Reunite with family',       es:'Reunirme con mi familia'},
    sub:  {en:'Join a spouse, parent, child, or sibling in the U.S.', es:'Reunirme con cónyuge, padre, hijo o hermano'}
  },
  protection: {
    iconName:'shield', iconColor:'#ff9b21',
    label:{en:'Seek protection / asylum',  es:'Buscar protección / asilo'},
    sub:  {en:'Safety from persecution in my home country',       es:'Seguridad ante persecución en mi país'}
  },
  undecided: {
    iconName:'question', iconColor:'#84807a',
    label:{en:"I'm still figuring it out", es:'Aún lo estoy decidiendo'},
    sub:  {en:'Explore the paths and decide later',               es:'Explorar las vías y decidir luego'}
  }
};

function countryLabel(c, l){
  var map = {Mexico:{en:'Mexico',es:'México'}, India:{en:'India',es:'India'}, China:{en:'China',es:'China'}, Philippines:{en:'Philippines',es:'Filipinas'}, Other:{en:'Another country',es:'Otro país'}};
  return (map[c] && map[c][l]) || c;
}
function petitionLabel(p, l){
  var map = {
    'family-ir':   {en:'Immediate relative',           es:'Familiar inmediato'},
    'family-pref': {en:'Family (preference category)', es:'Familia (categoría preferencial)'},
    'family-lpr':  {en:'Family of permanent resident', es:'Familia de residente'},
    'employment':  {en:'Employment-based',             es:'Empleo'},
    'asylum':      {en:'Asylum / refugee',             es:'Asilo / refugio'},
    'other':       {en:'Other path',                   es:'Otro camino'}
  };
  return (map[p] && map[p][l]) || (l==='es'?'Otro':'Other');
}
function monthsOutsideLabel(m, l){
  var map = {
    'lt6':   {en:'Less than 6 months', es:'Menos de 6 meses'},
    '6-18':  {en:'6 to 18 months',     es:'Entre 6 y 18 meses'},
    'gt18':  {en:'More than 18 months',es:'Más de 18 meses'},
    'unsure':{en:'Not sure',           es:'No estoy seguro'}
  };
  return (map[m] && map[m][l]) || m;
}

var PHASES = {
  student: {
    iconName:'book', iconColor:'#1cb0f6',
    label: {en:"I'm a student",                 es:'Soy estudiante'},
    sub:   {en:'F-1, J-1, or M-1 visa',         es:'Visa F-1, J-1 o M-1'},
    track: 'temp', visaTip:'student'
  },
  opt: {
    iconName:'star', iconColor:'#ff9b21',
    label: {en:"I'm on OPT or CPT",             es:'Estoy en OPT o CPT'},
    sub:   {en:'Work authorization after graduating', es:'Autorización de trabajo tras graduarte'},
    track: 'temp', visaTip:'opt'
  },
  workvisa: {
    iconName:'briefcase', iconColor:'#00b4a8',
    label: {en:"I'm on a work visa",            es:'Estoy en visa de trabajo'},
    sub:   {en:'H-1B, L-1, O-1, E-2, etc.',     es:'H-1B, L-1, O-1, E-2, etc.'},
    track: 'temp', visaTip:'h1b'
  },
  preGC: {
    iconName:'plane', iconColor:'#8c4dd1',
    label: {en:'Working toward a green card',   es:'Camino a la residencia'},
    sub:   {en:'Petition filed or in process',  es:'Petición presentada o en proceso'},
    stages: ['sponsorship','visa-available','aos-interview'],
    track: 'gc'
  },
  hasGC: {
    iconName:'id', iconColor:'#008a7e',
    label: {en:"I have a green card",           es:'Tengo residencia'},
    sub:   {en:'Permanent resident', es:'Residente permanente'},
    stages: ['permanent-resident','residency-met','file-n400','interview','oath'],
    track: 'gc'
  },
  asylum: {
    iconName:'shield', iconColor:'#ec4f93',
    label: {en:"I'm in the asylum process",     es:'Estoy en proceso de asilo'},
    sub:   {en:'Filed I-589 or pending case',   es:'Presenté I-589 o caso pendiente'},
    track: 'temp', visaTip:'asylum'
  },
  other: {
    iconName:'globe', iconColor:'#84807a',
    label: {en:"Other or not sure",             es:'Otro o no estoy seguro'},
    sub:   {en:"I'll explore the paths",         es:'Exploraré las opciones'},
    track: 'temp'
  }
};

function isOnGCPath(){
  var p = PHASES[user.phase];
  return p && p.track === 'gc';
}

function ico(name, color){ return iconSVG(name, color || '#1d1d22', 26); }

var onbState = {
  step: 0,
  name: '',
  country: null,
  phase: null,
  goal: null,
  petition: null,
  stageId: null,
  gcDate: '2020-03-03',
  married: false,
  marriageDate: '2020-01-01',
  monthsOutside: null,
  criminalHistory: null,
  dailyMinutes: 5
};

function onbKey(){ return ONB_STEPS[onbState.step]; }

function onbShouldSkip(key){
  if(key === 'petition') return onbState.phase !== 'preGC';
  if((key === 'gcDate' || key === 'married' || key === 'monthsOutside') && onbState.phase !== 'hasGC') return true;
  if(key === 'marriageDate') return !(onbState.phase === 'hasGC' && onbState.married === true);
  // Stage step: only relevant for GC tracks (preGC + hasGC)
  if(key === 'stage'){
    var p = PHASES[onbState.phase];
    return !p || p.track !== 'gc';
  }
  return false;
}

function onbBack(){
  onbCommitInputs();
  if(onbState.step === 0) return;
  onbState.step--;
  while(onbState.step > 0 && onbShouldSkip(ONB_STEPS[onbState.step])) onbState.step--;
  renderOnboarding();
}

function onbContinue(){
  if(!onbCommitInputs()) return;
  if(onbState.step >= ONB_STEPS.length - 1){
    return finishOnboarding();
  }
  onbState.step++;
  while(onbState.step < ONB_STEPS.length - 1 && onbShouldSkip(ONB_STEPS[onbState.step])) onbState.step++;
  renderOnboarding();
}

function onbCommitInputs(){
  var key = onbKey();
  if(key === 'name'){
    var v = document.getElementById('onbNameInput');
    onbState.name = (v && v.value || '').trim();
  }
  if(key === 'gcDate'){
    var d = document.getElementById('onbDateInput');
    if(d && d.value) onbState.gcDate = d.value;
  }
  if(key === 'marriageDate'){
    var md = document.getElementById('onbMarriageDateInput');
    if(md && md.value) onbState.marriageDate = md.value;
  }
  return true;
}

function onbPick(key, value){
  if(key === 'phase' && onbState.phase !== value){
    onbState.stageId = null;
    // Suggest a sensible default goal based on phase (user can change on next step)
    if(!onbState.goal){
      var goalDefaults = {
        student:    'study',
        opt:        'career',
        workvisa:   'career',
        preGC:      'citizenship',
        hasGC:      'citizenship',
        asylum:     'protection',
        other:      'undecided'
      };
      if(goalDefaults[value]) onbState.goal = goalDefaults[value];
    }
  }
  onbState[key] = value;
  renderOnboarding();
  setTimeout(onbContinue, 240);
}

function onbLangPick(l){
  lang = l;
  syncLangButtons();
  applyStaticTranslations();
  applyHeroName();
  renderAll();
  renderOnboarding();
  setTimeout(onbContinue, 240);
}

function onbCardHtml(icon, title, sub, sel, onclick){
  return '<button type="button" class="onbBigCard'+(sel?' onbSel':'')+'" onclick="'+onclick+'">'
    + '<div class="onbCardIcon">'+icon+'</div>'
    + '<div class="onbCardMain">'
    +   '<div class="onbCardTitle">'+title+'</div>'
    + (sub ? '<div class="onbCardSub">'+sub+'</div>' : '')
    + '</div></button>';
}

function renderOnboarding(){
  var step = document.getElementById('onbStep');
  var footer = document.getElementById('onbFooter');
  var fill = document.getElementById('onbProgressFill');
  var back = document.getElementById('onbBack');
  if(!step) return;

  var k = onbKey();
  if(fill) fill.style.width = ((onbState.step + 1) / ONB_STEPS.length * 100) + '%';
  if(back) back.disabled = (onbState.step === 0);

  var html = '';
  var footerHtml = '';

  if(k === 'lang'){
    html = '<div class="onbCamiTop">'+camiSVG('wave')+'</div>'
      + '<div class="onbStepTitle">Camino</div>'
      + '<div class="onbStepSub">Your path to U.S. citizenship and beyond.</div>'
      + '<div class="onbCards">';
    LANGUAGES.forEach(function(L){
      var betaTag = L.fullyTranslated ? '' : (L.code==='zh' ? '部分翻译 · beta' : (L.code==='vi' ? 'Dịch một phần · beta' : 'partial · beta'));
      html += onbCardHtml(iconSVG(L.flagIcon, '#1d1d22', 28), L.native, betaTag, lang===L.code, "onbLangPick('"+L.code+"')");
    });
    html += '</div>';
  }
  else if(k === 'name'){
    var phN = lang==='es' ? 'Escribe tu nombre' : 'Type your name';
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cómo te llamas?':'What should we call you?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Lo verás en cada saludo.':"You'll see it in every greeting.")+'</div>'
      + '<div class="onbBig"><input class="onbInputBig" id="onbNameInput" placeholder="'+phN+'" value="'+(onbState.name||'').replace(/"/g,'&quot;')+'" autocomplete="off" autofocus /></div>';
    footerHtml = '<button class="cta" onclick="onbContinue()">'+(lang==='es'?'Continuar':'Continue')+' →</button>';
  }
  else if(k === 'country'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿De qué país vienes?':'What country are you from?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Algunos países tienen esperas más largas en el Boletín de Visas.':'Some countries have longer waits in the Visa Bulletin.')+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(flagSVG('Mexico', 28),     'Mexico','',          onbState.country==='Mexico',      "onbPick('country','Mexico')")
      + onbCardHtml(flagSVG('India', 28),      'India','',           onbState.country==='India',       "onbPick('country','India')")
      + onbCardHtml(flagSVG('China', 28),      'China','',           onbState.country==='China',       "onbPick('country','China')")
      + onbCardHtml(flagSVG('Philippines', 28),'Philippines','',     onbState.country==='Philippines', "onbPick('country','Philippines')")
      + onbCardHtml(flagSVG('Other', 28),      (lang==='es'?'Otro país':'Another country'), (lang==='es'?'Sin retraso significativo':'No significant backlog'), onbState.country==='Other', "onbPick('country','Other')")
      + '</div>';
  }
  else if(k === 'phase'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Dónde estás en tu camino?':'Where are you on your path?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Esto define el resto de tu plan.':'This shapes the rest of your plan.')+'</div>'
      + '<div class="onbCards">';
    for(var pid in PHASES){
      var p = PHASES[pid];
      html += onbCardHtml(ico(p.iconName, p.iconColor), p.label[lang], p.sub[lang], onbState.phase===pid, "onbPick('phase','"+pid+"')");
    }
    html += '</div>';
  }
  else if(k === 'goal'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cuál es tu meta?':"What's your goal?")+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'A dónde quieres llegar — no tiene que ser para siempre.':"Where you're headed — doesn't have to be forever.")+'</div>'
      + '<div class="onbCards">';
    for(var gid in IMMIGRATION_GOALS){
      var g = IMMIGRATION_GOALS[gid];
      html += onbCardHtml(ico(g.iconName, g.iconColor), g.label[lang], g.sub[lang], onbState.goal===gid, "onbPick('goal','"+gid+"')");
    }
    html += '</div>';
  }
  else if(k === 'petition'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cómo te están patrocinando?':'How are you being sponsored?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Esto define cuánto tendrás que esperar.':"This drives how long you'll wait.")+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(ico('ring','#ff4d3a'), (lang==='es'?'Familiar inmediato de ciudadano':'Immediate relative of a citizen'), (lang==='es'?'Cónyuge, padre, o hijo menor de un ciudadano':'Spouse, parent, or minor child of a citizen'), onbState.petition==='family-ir',  "onbPick('petition','family-ir')")
      + onbCardHtml(ico('people','#ec4f93'), (lang==='es'?'Familia de ciudadano (preferencial)':'Family of a citizen (preference)'), (lang==='es'?'Hijo adulto, hijo casado, o hermano':'Adult child, married child, or sibling'), onbState.petition==='family-pref', "onbPick('petition','family-pref')")
      + onbCardHtml(ico('home','#00b4a8'), (lang==='es'?'Familia de residente permanente':'Family of a permanent resident'), (lang==='es'?'Cónyuge o hijo de LPR (F2A/F2B)':'Spouse or child of LPR (F2A/F2B)'), onbState.petition==='family-lpr',  "onbPick('petition','family-lpr')")
      + onbCardHtml(ico('briefcase','#1cb0f6'), (lang==='es'?'Por empleo (EB-1/EB-2/EB-3)':'Employment-based (EB-1/EB-2/EB-3)'), '', onbState.petition==='employment',   "onbPick('petition','employment')")
      + onbCardHtml(ico('shield','#ff9b21'), (lang==='es'?'Asilo o refugio':'Asylum or refugee'), '', onbState.petition==='asylum',       "onbPick('petition','asylum')")
      + onbCardHtml(ico('globe','#8c4dd1'), (lang==='es'?'Otro camino':'Other path'), (lang==='es'?'Lotería de visa, VAWA, U-visa, etc.':'DV lottery, VAWA, U-visa, etc.'), onbState.petition==='other',        "onbPick('petition','other')")
      + '</div>';
  }
  else if(k === 'stage'){
    var phaseStages = onbState.phase ? PHASES[onbState.phase].stages : [];
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Qué paso específicamente?':'Which step exactly?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Elige el último que terminaste o el actual.':"Pick the one you're on or just finished.")+'</div>'
      + '<div class="onbCards">';
    for(var i=0;i<phaseStages.length;i++){
      var s = STAGES[stageIndex(phaseStages[i])];
      var sub = s.home ? s.home.headline[lang] : '';
      html += onbCardHtml(String(i+1), s.name[lang], sub, onbState.stageId===s.id, "onbPick('stageId','"+s.id+"')");
    }
    html += '</div>';
  }
  else if(k === 'gcDate'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cuándo te hiciste residente?':'When did you become a permanent resident?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Una fecha aproximada está bien — la usamos para tus 5 años.':'A rough date is fine — we use it for your 5-year math.')+'</div>'
      + '<div class="onbBig"><input class="onbDateBig" type="date" id="onbDateInput" value="'+onbState.gcDate+'" /></div>';
    footerHtml = '<button class="cta" onclick="onbContinue()">'+(lang==='es'?'Continuar':'Continue')+' →</button>';
  }
  else if(k === 'married'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Casado/a con un ciudadano de EE.UU.?':'Married to a U.S. citizen?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'El matrimonio reduce la espera de 5 a 3 años.':'Marriage cuts the wait from 5 to 3 years.')+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(ico('smile','#84807a'), (lang==='es'?'No':'No'), (lang==='es'?'Aplica la regla de 5 años':'5-year rule applies'), onbState.married===false, "onbPick('married',false)")
      + onbCardHtml(ico('ring','#ff4d3a'), (lang==='es'?'Sí, 3+ años':'Yes, 3+ years'), (lang==='es'?'Aplica la regla de 3 años':'3-year rule applies'), onbState.married===true, "onbPick('married',true)")
      + '</div>';
  }
  else if(k === 'marriageDate'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cuándo te casaste?':'When did you get married?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Para la regla de 3 años, deben estar casados los 3 años completos antes de presentar el N-400.':'For the 3-year rule, you must be married for all 3 years before filing N-400.')+'</div>'
      + '<div class="onbBig"><input class="onbDateBig" type="date" id="onbMarriageDateInput" value="'+(onbState.marriageDate || '2020-01-01')+'" /></div>';
    footerHtml = '<button class="cta" onclick="onbContinue()">'+(lang==='es'?'Continuar':'Continue')+' →</button>';
  }
  else if(k === 'monthsOutside'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cuánto has estado fuera de EE.UU. en los últimos 5 años?':'How long outside the U.S. in the last 5 years?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Necesitas estar físicamente presente al menos la mitad del tiempo (30 meses).':'You need to be physically present at least half the time (30 months).')+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(ico('check','#00b4a8'), (lang==='es'?'Menos de 6 meses':'Less than 6 months'),     (lang==='es'?'Sin problemas':'No issue'),                  onbState.monthsOutside==='lt6',    "onbPick('monthsOutside','lt6')")
      + onbCardHtml(ico('clock','#ff9b21'), (lang==='es'?'Entre 6 y 18 meses':'6 to 18 months'),       (lang==='es'?'Cerca del límite — verifica tu pasaporte':'Close to the limit — check your passport'), onbState.monthsOutside==='6-18',   "onbPick('monthsOutside','6-18')")
      + onbCardHtml(ico('warning','#ff4d3a'), (lang==='es'?'Más de 18 meses':'More than 18 months'),     (lang==='es'?'Posible problema de presencia física':'Possible physical presence issue'),               onbState.monthsOutside==='gt18',   "onbPick('monthsOutside','gt18')")
      + onbCardHtml(ico('question','#84807a'), (lang==='es'?'No estoy seguro':'Not sure'),                (lang==='es'?'Lo revisaremos en la evaluación':"We'll check during eligibility"),                       onbState.monthsOutside==='unsure', "onbPick('monthsOutside','unsure')")
      + '</div>';
  }
  else if(k === 'criminal'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Algún arresto, cargo o condena alguna vez?':'Any arrest, charge, or conviction — ever?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Incluso si los cargos fueron retirados. Es importante saberlo desde el inicio.':"Even if charges were dropped. It's important to know upfront.")+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(ico('check','#00b4a8'), (lang==='es'?'No, nunca':'No, never'),               '',                                                                              onbState.criminalHistory===false, "onbPick('criminalHistory',false)")
      + onbCardHtml(ico('warning','#ff4d3a'), (lang==='es'?'Sí, en algún momento':'Yes, at some point'), (lang==='es'?'Te conectaremos con ayuda legal':"We'll flag this for legal help"), onbState.criminalHistory===true,  "onbPick('criminalHistory',true)")
      + '</div>';
  }
  else if(k === 'time'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'¿Cuánto tiempo al día?':'How much time per day?')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Te ayudamos a construir una racha sostenible.':'We help you build a streak you can keep.')+'</div>'
      + '<div class="onbCards">'
      + onbCardHtml(ico('cup','#ff9b21'), (lang==='es'?'5 minutos':'5 minutes'), (lang==='es'?'Lo básico':'Just a habit'), onbState.dailyMinutes===5, "onbPick('dailyMinutes',5)")
      + onbCardHtml(ico('walk','#1cb0f6'), (lang==='es'?'10 minutos':'10 minutes'), (lang==='es'?'Avance constante':'Steady progress'), onbState.dailyMinutes===10, "onbPick('dailyMinutes',10)")
      + onbCardHtml(ico('flame','#ff4d3a'), (lang==='es'?'15 minutos':'15 minutes'), (lang==='es'?'Modo serio':"I'm serious"), onbState.dailyMinutes===15, "onbPick('dailyMinutes',15)")
      + '</div>';
  }
  else if(k === 'summary'){
    var name = (onbState.name || '').trim() || (lang==='es' ? 'Amigo' : 'Friend');
    var phaseInfo = PHASES[onbState.phase];
    var s = onbState.stageId ? STAGES[stageIndex(onbState.stageId)] : null;
    var rows = '';
    if(phaseInfo) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Tu vía':'Your path')+'</div><div class="onbSummaryV">'+phaseInfo.label[lang]+'</div></div>';
    var goalInfo = onbState.goal ? IMMIGRATION_GOALS[onbState.goal] : null;
    if(goalInfo) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Tu meta':'Your goal')+'</div><div class="onbSummaryV">'+goalInfo.label[lang]+'</div></div>';
    if(s) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Etapa':'Stage')+'</div><div class="onbSummaryV">'+s.name[lang]+'</div></div>';
    if(onbState.country) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'País':'Country')+'</div><div class="onbSummaryV">'+countryLabel(onbState.country, lang)+'</div></div>';
    if(onbState.phase === 'preGC' && onbState.petition){
      rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Vía':'Path')+'</div><div class="onbSummaryV">'+petitionLabel(onbState.petition, lang)+'</div></div>';
    }
    if(onbState.phase === 'hasGC'){
      rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Residencia':'Green card')+'</div><div class="onbSummaryV">'+fmtDate(onbState.gcDate, lang)+'</div></div>';
      rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Regla':'Rule')+'</div><div class="onbSummaryV">'+(onbState.married ? (lang==='es'?'3 años (cónyuge)':'3 years (spouse)') : (lang==='es'?'5 años':'5 years'))+'</div></div>';
      if(onbState.married && onbState.marriageDate) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Casado/a desde':'Married since')+'</div><div class="onbSummaryV">'+fmtDate(onbState.marriageDate, lang)+'</div></div>';
      if(onbState.monthsOutside) rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Fuera de EE.UU.':'Outside U.S.')+'</div><div class="onbSummaryV">'+monthsOutsideLabel(onbState.monthsOutside, lang)+'</div></div>';
    }
    rows += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Diario':'Daily')+'</div><div class="onbSummaryV">'+onbState.dailyMinutes+' '+(lang==='es'?'min':'min')+'</div></div>';
    if(onbState.criminalHistory === true){
      rows += '<div class="onbSummaryRow"><div class="onbSummaryK">⚠️ '+(lang==='es'?'Revisar':'Flag')+'</div><div class="onbSummaryV">'+(lang==='es'?'Consulta legal recomendada':'Legal consult recommended')+'</div></div>';
    }

    var previewUser = {
      name: name,
      greenCardDate: onbState.gcDate,
      marriedToCitizen: onbState.married,
      currentStageId: s ? s.id : null,
      countryOfBirth: onbState.country,
      petitionType: onbState.petition,
      phase: onbState.phase,
      monthsOutside: onbState.monthsOutside || 'lt6'
    };
    var nextLine = '';
    if(s && s.home && s.home.title) nextLine = s.home.title[lang];
    else if(phaseInfo) nextLine = phaseInfo.sub[lang] || phaseInfo.label[lang];
    else nextLine = lang==='es' ? 'Tu camino te espera' : 'Your path awaits';
    var preview = projectTimeline(previewUser);
    var timeRow = '';
    var oathRow = '';
    if(preview){
      timeRow = '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Tiempo':'Time left')+'</div><div class="onbSummaryV">'+fmtMonthsTotal(preview.totalMonthsLow, preview.totalMonthsHigh, lang)+'</div></div>';
      var oath = preview.milestones[preview.milestones.length - 1];
      if(oath) oathRow = '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Juramento':'Oath est.')+'</div><div class="onbSummaryV">'+fmtMonthRange(oath.endLow, oath.endHigh, lang)+'</div></div>';
    }

    html = '<div class="onbCamiTop">'+camiSVG('celebrate')+'</div>'
      + '<div class="onbStepTitle">'
      + (lang==='es' ? ('¡Listo, '+name+'!') : ("You're set, "+name+'!'))
      + '</div>'
      + '<div class="onbStepSub">'+(lang==='es'?'Así se ve tu camino:':"Here's what your path looks like:")+'</div>'
      + '<div class="onbSummary">'
      +   '<div class="onbSummaryCard">'+rows+timeRow+oathRow+'</div>'
      +   '<div class="onbSummaryNext">'
      +     '<div class="onbSummaryNextKick">'+(lang==='es'?'Tu próximo paso':'Your next step')+'</div>'
      +     '<div class="onbSummaryNextTitle">'+nextLine+'</div>'
      +   '</div>'
      + '</div>';
    footerHtml = '<button class="cta" onclick="onbContinue()">'+(lang==='es'?'Empezar mi camino':'Start my path')+' →</button>';
  }

  step.innerHTML = html;
  // restart entrance animation
  step.style.animation = 'none';
  void step.offsetWidth;
  step.style.animation = '';

  if(footerHtml){
    footer.innerHTML = footerHtml;
    footer.classList.remove('hidden');
  } else {
    footer.innerHTML = '';
    footer.classList.add('hidden');
  }
}

function finishOnboarding(){
  var name = (onbState.name || '').trim() || (lang==='es' ? 'Amigo' : 'Friend');
  user.name = name;
  user.phase = onbState.phase || null;
  user.immigrationGoal = onbState.goal || null;
  user.greenCardDate = onbState.gcDate || '2020-03-03';
  user.marriedToCitizen = !!onbState.married;
  user.currentStageId = onbState.stageId || (isOnGCPath() ? 'permanent-resident' : null);
  user.dailyMinutes = onbState.dailyMinutes || 5;
  user.countryOfBirth = onbState.country || 'Other';
  user.petitionType = onbState.petition || null;
  user.marriageDate = (onbState.married && onbState.marriageDate) ? onbState.marriageDate : null;
  user.monthsOutside = onbState.monthsOutside || 'lt6';
  user.criminalHistory = onbState.criminalHistory === true;
  user.onboarded = true;
  // Fully initialize progress — every field that any render function reads.
  user.progress = {
    completedLessons: [],
    xp: 0,
    streak: 0,
    lastLessonDate: null,
    mastered: 0,
    missedQs: [],
    civicsMastery: {},
    dailyFlashcards: {lastCompleted: null, streak: 0},
    interviewAttempts: []
  };
  user.documents = {};
  user.eligibility = null;
  saveUser();
  try { applyHeroName(); } catch(e){}
  try { renderAll(); } catch(e){ console.error('renderAll error after onboarding:', e); }

  // After onboarding: (1) accept legal disclaimer, (2) see 7-day trial offer, (3) land on home.
  // Skip the trial offer if they already started/used a trial or are already on Plus.
  if(!hasAcceptedDisclaimer()){
    // Show disclaimer; once accepted it'll fall through to the trial offer.
    showDisclaimerModal(false);
    user.pendingTrialOffer = true;
    saveUser();
    return;
  }
  if(planStatus() === 'free' && !user.trialStartedAt){
    go('trialOffer');
    renderTrialOffer();
    return;
  }
  go('home');
  toast(lang==='es' ? '¡Listo! Empecemos.' : "You're set! Let's go.");
  // Cami offers a tour here too (this path skips the trial offer)
  setTimeout(maybeOfferTutorial, 1200);
}

function useDemoData(){
  user.name = 'María';
  user.phase = 'hasGC';
  user.immigrationGoal = 'citizenship';
  user.greenCardDate = '2020-03-03';
  user.marriedToCitizen = false;
  user.currentStageId = 'file-n400';
  user.dailyMinutes = 5;
  user.countryOfBirth = 'Mexico';
  user.petitionType = 'family-ir';
  user.marriageDate = null;
  user.monthsOutside = 'lt6';
  user.criminalHistory = false;
  user.onboarded = true;
  user.progress = {
    completedLessons: ['principles','rule-of-law','constitution'],
    xp: 320, streak: 14, lastLessonDate: todayISO(), mastered: 18
  };
  user.documents = { gc:true, stateId:true, passports:true, taxes:true };
  user.eligibility = null;
  // Always re-show the tutorial when loading the demo profile (it's a "fresh start")
  user.tutorialCompleted = false;
  saveUser();
  applyHeroName();
  renderAll();
  go('home');
  toast(lang==='es' ? 'Perfil de demo cargado' : 'Demo profile loaded');
  setTimeout(maybeOfferTutorial, 800);
}

function resetOnboarding(){
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
  location.reload();
}

var picked = null;
var lessonState = null;

function getCurrentLessonId(){
  for(var i=0;i<LESSONS.length;i++){
    if(user.progress.completedLessons.indexOf(LESSONS[i].id) === -1) return LESSONS[i].id;
  }
  return null;
}

function isLessonUnlocked(lessonId){
  if(user.progress.completedLessons.indexOf(lessonId) !== -1) return true;
  return getCurrentLessonId() === lessonId;
}

function startCurrentLesson(){
  var lid = getCurrentLessonId();
  if(!lid){ toast(lang==='es' ? '¡Unidad completa!' : 'Unit complete!'); return; }
  startLesson(lid);
}

function startLesson(lessonId, skipIntro){
  if(!isLessonUnlocked(lessonId)){
    toast(lang==='es' ? 'Termina la lección anterior 🔒' : 'Finish the previous lesson 🔒');
    return;
  }
  var lesson = findLesson(lessonId);
  if(!lesson) return;
  lessonState = {
    lessonId: lessonId,
    qIds: lesson.qIds.slice(),
    qIdx: 0,
    correct: 0,
    correctQIds: [],
    wrongQIds: [],
    hearts: 5,
    inARow: 0,
    answered: false,
    failed: false,
    isReview: false,
    introDone: !!skipIntro
  };
  go('lesson');
  if(!skipIntro && lesson.intro && !lesson.isChest){
    renderLessonIntro();
  } else {
    lessonState.introDone = true;
    renderQuestion();
  }
}

function beginLessonQuestions(){
  if(!lessonState) return;
  lessonState.introDone = true;
  var qwrap = document.querySelector('#lesson .qwrap');
  if(qwrap){ qwrap.innerHTML = '<div class="qkick"></div><div class="q"></div><div class="opts" id="opts"></div>'; }
  var checkbar = document.getElementById('checkbar');
  if(checkbar){ checkbar.style.display = ''; }
  renderQuestion();
}

function renderLessonIntro(){
  if(!lessonState) return;
  var l = findLesson(lessonState.lessonId);
  if(!l) return;
  var qwrap = document.querySelector('#lesson .qwrap');
  if(!qwrap) return;
  var checkbar = document.getElementById('checkbar');
  if(checkbar) checkbar.style.display = 'none';

  var introText = (l.intro && l.intro[lang]) || (l.intro && l.intro.en) || '';
  var unitName = '';
  for(var i=0;i<UNITS.length;i++) if(UNITS[i].id === l.unit){ unitName = UNITS[i].title[lang]; break; }
  qwrap.innerHTML = '<div class="introPanel">'
    + '<div class="introCami">'+camiSVG('happy')+'</div>'
    + '<div class="introUnit">'+unitName+'</div>'
    + '<div class="introTitle">'+l.title[lang]+'</div>'
    + (introText ? '<div class="introBody">'+introText+'</div>' : '')
    + '<div class="introMeta">'+l.qIds.length+' '+(lang==='es' ? 'preguntas' : 'questions')+' · ♥ '+(isPlus() ? '∞' : '5')+' '+(lang==='es' ? 'corazones' : 'hearts')+'</div>'
    + '<button class="cta introBegin" onclick="beginLessonQuestions()">'+(lang==='es' ? 'Empezar' : 'Begin')+' →</button>'
    + '<button class="failedExit" onclick="exitLesson()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>'
    + '</div>';
}

function restartLesson(){
  if(!lessonState) return;
  var lid = lessonState.lessonId;
  if(lid === '__review__') startReviewSession();
  else startLesson(lid, true); // skip intro on retry
}

function startReviewSession(){
  if(!user.progress.missedQs) user.progress.missedQs = [];
  var pool = user.progress.missedQs.slice();
  if(pool.length === 0){
    toast(lang==='es' ? 'No hay preguntas por repasar' : 'No questions to review');
    return;
  }
  var qIds = shuffleArr(pool.map(function(m){return m.qId;})).slice(0, Math.min(10, pool.length));
  lessonState = {
    lessonId: '__review__',
    qIds: qIds,
    qIdx: 0,
    correct: 0,
    correctQIds: [],
    wrongQIds: [],
    hearts: 5,
    inARow: 0,
    answered: false,
    failed: false,
    isReview: true
  };
  go('lesson');
  renderQuestion();
}

function exitLesson(){
  lessonState = null;
  go('home');
}

function pick(el){
  if(!lessonState || lessonState.answered) return;
  document.querySelectorAll('.opt').forEach(function(o){ o.classList.remove('sel'); });
  el.classList.add('sel');
  picked = el;
  var cb = document.getElementById('checkbtn');
  if(cb) cb.classList.remove('dim');
}

function renderQuestion(){
  if(!lessonState) return;
  var qId = lessonState.qIds[lessonState.qIdx];
  var q = findQ(qId);
  if(!q) return;

  // Defensive: if .qwrap was replaced (e.g. by a celebration / intro / failed panel),
  // rebuild the question scaffolding so the rest of this function can find its targets.
  var qwrap = document.querySelector('#lesson .qwrap');
  if(qwrap && !document.getElementById('opts')){
    qwrap.innerHTML = '<div class="qkick"></div><div class="q"></div><div class="opts" id="opts"></div>';
  }

  var kicker = document.querySelector('#lesson .qkick');
  if(kicker){
    kicker.removeAttribute('data-en'); kicker.removeAttribute('data-es');
    kicker.textContent = (lang==='es' ? 'Pregunta ' : 'Question ') + (lessonState.qIdx+1) + (lang==='es' ? ' de ' : ' of ') + lessonState.qIds.length;
  }
  var qEl = document.querySelector('#lesson .q');
  if(qEl){
    qEl.removeAttribute('data-en'); qEl.removeAttribute('data-es');
    qEl.textContent = q.q[lang];
  }
  var opts = document.getElementById('opts');
  if(opts){
    var shuffled = shuffleArr(q.options);
    var html = '';
    for(var i=0;i<shuffled.length;i++){
      var o = shuffled[i];
      html += '<button class="opt" data-correct="'+(o.correct?'1':'')+'" onclick="pick(this)">'+o[lang]+'</button>';
    }
    opts.innerHTML = html;
  }
  var fillPct = (lessonState.qIdx / lessonState.qIds.length) * 100;
  var fill = document.getElementById('lprogfill');
  if(fill) fill.style.width = fillPct + '%';

  var heartsN = document.getElementById('heartsN');
  if(heartsN) heartsN.textContent = isPlus() ? '∞' : lessonState.hearts;

  picked = null;
  var fb = document.getElementById('fb');
  if(fb) fb.style.display = 'none';
  var corr = document.getElementById('fbCorrectAns');
  if(corr) corr.style.display = 'none';
  var streakRow = document.getElementById('fbStreakRow');
  if(streakRow) streakRow.style.display = 'none';
  var checkbar = document.getElementById('checkbar');
  if(checkbar){ checkbar.className = 'checkbar'; checkbar.style.display = ''; }
  var cb = document.getElementById('checkbtn');
  if(cb){ cb.style.display = ''; cb.classList.add('dim'); cb.textContent = lang==='es' ? 'Verificar' : 'Check'; }
  lessonState.answered = false;
}

function check(){
  if(!lessonState || !picked) return;
  if(lessonState.answered){
    if(lessonState.failed) return failLesson();
    if(lessonState.qIdx >= lessonState.qIds.length - 1) return completeLesson();
    lessonState.qIdx++;
    renderQuestion();
    return;
  }
  var qId = lessonState.qIds[lessonState.qIdx];
  var q = findQ(qId);
  var correctOpt = null;
  if(q && q.options) for(var i=0;i<q.options.length;i++) if(q.options[i].correct){ correctOpt = q.options[i]; break; }

  var ok = picked.getAttribute('data-correct') === '1';
  if(ok){
    lessonState.correct++;
    lessonState.correctQIds.push(qId);
    lessonState.inARow = (lessonState.inARow || 0) + 1;
  } else {
    lessonState.wrongQIds.push(qId);
    lessonState.inARow = 0;
    if(!isPlus()){                      // Plus: unlimited hearts (as advertised on the paywall)
      lessonState.hearts = Math.max(0, lessonState.hearts - 1);
      var heartsN = document.getElementById('heartsN');
      if(heartsN) heartsN.textContent = lessonState.hearts;
      var heartsBox = document.querySelector('#lesson .hearts');
      if(heartsBox){
        heartsBox.classList.remove('heartLost');
        void heartsBox.offsetWidth;
        heartsBox.classList.add('heartLost');
        setTimeout(function(){ if(heartsBox) heartsBox.classList.remove('heartLost'); }, 450);
      }
      if(lessonState.hearts === 0) lessonState.failed = true;
    }
  }

  document.querySelectorAll('.opt').forEach(function(o){
    if(o.getAttribute('data-correct') === '1') o.classList.add('right');
  });
  if(!ok) picked.classList.add('wrong');

  var fb = document.getElementById('fb');
  if(fb) fb.style.display = 'block';
  var bar = document.getElementById('checkbar');
  if(bar) bar.classList.add(ok ? 'correct' : 'incorrect');

  var streakRow = document.getElementById('fbStreakRow');
  if(streakRow){
    if(ok && lessonState.inARow >= 2){
      streakRow.style.display = 'block';
      streakRow.innerHTML = '🔥 ' + lessonState.inARow + ' ' + (lang==='es' ? 'seguidas' : 'in a row');
    } else {
      streakRow.style.display = 'none';
    }
  }

  var t = document.getElementById('fbt');
  if(t){
    t.className = 'fbtitle ' + (ok ? 'g' : 'r');
    t.innerHTML = ok
      ? '✓ ' + (lang==='es' ? '¡Correcto!' : 'Nice work!')
      : '✕ ' + (lang==='es' ? 'No es esa' : 'Not quite');
  }

  var corr = document.getElementById('fbCorrectAns');
  if(corr){
    if(!ok && correctOpt){
      corr.style.display = 'block';
      corr.innerHTML = '<div class="fbCorrectLabel">'+(lang==='es' ? 'Respuesta correcta' : 'Correct answer')+'</div>'
        + '<div class="fbCorrectText">'+correctOpt[lang]+'</div>';
    } else {
      corr.style.display = 'none';
    }
  }

  var fbs = document.getElementById('fbs');
  if(fbs){
    var exp = EXPLAIN[qId];
    var expText = (exp && exp[lang]) || (exp && exp.en) || '';
    if(expText){
      fbs.style.display = 'block';
      fbs.innerHTML = '<div class="fbExplainLabel">'+iconSVG('lightbulb','#ff9b21',14)+' '+(lang==='es' ? 'Por qué' : 'Why')+'</div>'
        + '<div class="fbExplainText">'+expText+'</div>';
    } else {
      fbs.style.display = 'none';
    }
  }

  var scoreEl = document.getElementById('fbScore');
  if(scoreEl){
    var answered = lessonState.qIdx + 1;
    var totalQ = lessonState.qIds.length;
    scoreEl.textContent = (lang==='es'
      ? (lessonState.correct + ' de ' + answered + ' correctas · pregunta ' + answered + ' de ' + totalQ)
      : (lessonState.correct + ' of ' + answered + ' correct · question ' + answered + ' of ' + totalQ));
  }

  var pct = ((lessonState.qIdx + 1) / lessonState.qIds.length) * 100;
  var fill = document.getElementById('lprogfill');
  if(fill) fill.style.width = pct + '%';

  var cb = document.getElementById('checkbtn');
  if(cb){
    cb.classList.remove('dim');
    if(lessonState.failed){
      cb.textContent = lang==='es' ? 'Ver resultado' : 'See result';
    } else {
      var isLast = lessonState.qIdx >= lessonState.qIds.length - 1;
      cb.textContent = isLast ? (lang==='es' ? 'Terminar' : 'Finish') : (lang==='es' ? 'Continuar' : 'Continue');
    }
  }
  lessonState.answered = true;
}

function failLesson(){
  if(!lessonState) return;
  var p = user.progress;
  if(!p.missedQs) p.missedQs = [];
  lessonState.wrongQIds.forEach(function(qid){
    var ex = null;
    for(var i=0;i<p.missedQs.length;i++) if(p.missedQs[i].qId === qid){ ex = p.missedQs[i]; break; }
    if(ex){ ex.lastMissed = todayISO(); ex.reviewedCount = 0; }
    else p.missedQs.push({qId:qid, lastMissed:todayISO(), reviewedCount:0});
  });
  saveUser();
  renderLessonFailed();
}

function renderLessonFailed(){
  if(!lessonState) return;
  var qwrap = document.querySelector('#lesson .qwrap');
  var checkbar = document.getElementById('checkbar');
  if(checkbar) checkbar.style.display = 'none';
  if(!qwrap) return;
  var correct = lessonState.correct;
  var attempted = lessonState.qIdx + 1;
  var total = lessonState.qIds.length;
  var lid = lessonState.lessonId;
  var lessonTitle = '';
  if(lid && lid !== '__review__'){
    var l = findLesson(lid);
    if(l) lessonTitle = l.title[lang];
  } else if(lid === '__review__'){
    lessonTitle = lang==='es' ? 'Repaso' : 'Review';
  }
  qwrap.innerHTML = '<div class="failedPanel">'
    + '<div class="failedCami">'+camiSVG('sad')+'</div>'
    + '<div class="failedTitle">'+(lang==='es' ? 'Sin corazones' : 'Out of hearts')+'</div>'
    + '<div class="failedSub">'+(lang==='es'
        ? 'No te preocupes — las preguntas que fallaste están en tu lista de repaso. Inténtalo cuando estés listo.'
        : "Don't worry — the questions you missed are in your review queue. Try again when you're ready.")+'</div>'
    + '<div class="failedStats">'
    +   '<div class="failedStat"><div class="failedStatVal">'+correct+'</div><div class="failedStatLbl">'+(lang==='es'?'correctas':'correct')+'</div></div>'
    +   '<div class="failedStat"><div class="failedStatVal">'+attempted+' / '+total+'</div><div class="failedStatLbl">'+(lang==='es'?'intentadas':'attempted')+'</div></div>'
    + '</div>'
    + (lessonTitle ? '<div class="failedLessonName">'+lessonTitle+'</div>' : '')
    + '<button class="cta failedRetry" onclick="restartLesson()">'+(lang==='es' ? '🔁 Intentar de nuevo' : '🔁 Try again')+'</button>'
    + (!isPlus() ? '<button class="failedExit" onclick="go(\'upgrade\')">'+(lang==='es' ? '♥ Corazones ilimitados con Plus' : '♥ Unlimited hearts with Plus')+'</button>' : '')
    + '<button class="failedExit" onclick="exitLesson()">'+(lang==='es' ? 'Volver a Hoy' : 'Back to Today')+'</button>'
    + '</div>';
}

function completeLesson(){
  if(!lessonState) return;
  var p = user.progress;
  if(!p.missedQs) p.missedQs = [];

  if(lessonState.isReview){
    lessonState.correctQIds.forEach(function(qid){
      var ex = null;
      for(var i=0;i<p.missedQs.length;i++) if(p.missedQs[i].qId === qid){ ex = p.missedQs[i]; break; }
      if(ex) ex.reviewedCount = (ex.reviewedCount || 0) + 1;
    });
    lessonState.wrongQIds.forEach(function(qid){
      var ex = null;
      for(var i=0;i<p.missedQs.length;i++) if(p.missedQs[i].qId === qid){ ex = p.missedQs[i]; break; }
      if(ex){ ex.lastMissed = todayISO(); ex.reviewedCount = 0; }
    });
    p.missedQs = p.missedQs.filter(function(m){ return (m.reviewedCount||0) < 2; });
    addXP(5);
    p.mastered += lessonState.correct;
    saveUser();
    var earned = lessonState.correct;
    var totalR = lessonState.qIds.length;
    lessonState = null;
    renderAll();
    go('home');
    toast(lang==='es' ? ('Repaso · ' + earned + '/' + totalR + ' · +5 XP') : ('Review · ' + earned + '/' + totalR + ' · +5 XP'));
    return;
  }

  lessonState.wrongQIds.forEach(function(qid){
    var ex = null;
    for(var i=0;i<p.missedQs.length;i++) if(p.missedQs[i].qId === qid){ ex = p.missedQs[i]; break; }
    if(ex){ ex.lastMissed = todayISO(); ex.reviewedCount = 0; }
    else p.missedQs.push({qId:qid, lastMissed:todayISO(), reviewedCount:0});
  });

  var lid = lessonState.lessonId;
  if(p.completedLessons.indexOf(lid) === -1) p.completedLessons.push(lid);
  addXP(15);
  p.mastered += lessonState.correct;

  var today = todayISO();
  if(p.lastLessonDate !== today){
    if(p.lastLessonDate){
      var d = new Date();
      var yMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()-1).getTime();
      var yy = new Date(yMs);
      var mm = yy.getMonth()+1; if(mm<10) mm='0'+mm;
      var dd = yy.getDate(); if(dd<10) dd='0'+dd;
      var yest = yy.getFullYear()+'-'+mm+'-'+dd;
      p.streak = (p.lastLessonDate === yest) ? (p.streak + 1) : 1;
    } else {
      p.streak = 1;
    }
    p.lastLessonDate = today;
  }
  saveUser();
  // Don't clear lessonState yet — celebration screen reads it
  var l = findLesson(lid);
  if(l && l.isChest){
    renderUnitComplete(l.unit);
  } else {
    renderLessonComplete();
  }
}

// ===== CUSTOM ICON SET =====
// Stroke style: 2.4px ink + filled accent. 24x24 base viewbox.
function iconSVG(name, color, size){
  size = size || 24;
  color = color || '#1d1d22';
  var ink = '#1d1d22';
  var bodies = {
    flame:'<path d="M12 3 c1 3 3 4 3 7 c0 2-1 4-3 6 c-2-2-3-4-3-6 c0-2 1-3 2-4 c0 2 1 2 1 3 c0-2 0-4 0-6z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    bolt:'<path d="M14 3 l-7 11 h4 l-2 7 l7-11 h-4 l2-7z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    target:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="'+ink+'" stroke-width="2.2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="'+ink+'" stroke-width="2.2"/><circle cx="12" cy="12" r="2" fill="'+color+'"/>',
    book:'<path d="M5 4 h11 a3 3 0 0 1 3 3 v13 a2 2 0 0 0 -2 -2 h-10 a2 2 0 0 1 -2 -2 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><line x1="9" y1="9" x2="15" y2="9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="12" x2="14" y2="12" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
    cards:'<rect x="4" y="6" width="13" height="14" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><rect x="8" y="3" width="13" height="14" rx="2" fill="#fff" stroke="'+ink+'" stroke-width="2" opacity=".85"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M6 12 a6 6 0 0 0 12 0" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="18" x2="12" y2="21" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="21" x2="15" y2="21" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    doc:'<path d="M6 3 h8 l5 5 v13 a0 0 0 0 1 0 0 h-13 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M14 3 v5 h5" fill="none" stroke="'+ink+'" stroke-width="2"/>',
    folder:'<path d="M3 7 a2 2 0 0 1 2 -2 h5 l2 2 h7 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    scales:'<line x1="12" y1="4" x2="12" y2="20" stroke="'+ink+'" stroke-width="2"/><line x1="6" y1="20" x2="18" y2="20" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><path d="M6 9 l-3 5 h6 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M18 9 l-3 5 h6 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="5" r="1.5" fill="'+ink+'"/>',
    calendar:'<rect x="3" y="6" width="18" height="15" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><line x1="3" y1="11" x2="21" y2="11" stroke="'+ink+'" stroke-width="2"/><line x1="8" y1="3" x2="8" y2="7" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="3" x2="16" y2="7" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    clock:'<circle cx="12" cy="12" r="8.5" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M12 8 v4 l3 2" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" fill="none"/>',
    star:'<path d="M12 3 l2.8 5.7 6.2 .9 -4.5 4.4 1.1 6.2 -5.6 -3 -5.6 3 1.1 -6.2 -4.5 -4.4 6.2 -.9 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    trophy:'<path d="M8 4 h8 v6 a4 4 0 0 1 -8 0 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M16 6 h3 v3 a3 3 0 0 1 -3 3" fill="none" stroke="'+ink+'" stroke-width="2"/><path d="M8 6 h-3 v3 a3 3 0 0 0 3 3" fill="none" stroke="'+ink+'" stroke-width="2"/><line x1="12" y1="14" x2="12" y2="18" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="20" x2="15" y2="20" stroke="'+ink+'" stroke-width="3" stroke-linecap="round"/>',
    heart:'<path d="M12 21 s-7-4-7-10 a4 4 0 0 1 7-2.5 a4 4 0 0 1 7 2.5 c0 6-7 10-7 10z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    check:'<path d="M5 12 l5 5 9-11" fill="none" stroke="'+color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    refresh:'<path d="M21 11 a9 9 0 1 0 -2.6 6.4" fill="none" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round"/><path d="M21 4 v7 h-7" fill="none" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    bell:'<path d="M6 9 a6 6 0 0 1 12 0 v5 l1.5 3 h-15 l1.5-3 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M10 19 a2 2 0 0 0 4 0" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    chevron:'<path d="M9 6 l6 6 -6 6" fill="none" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    id:'<rect x="3" y="5" width="18" height="14" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><circle cx="9" cy="11" r="2.5" fill="#fff" stroke="'+ink+'" stroke-width="1.5"/><path d="M5 17 c1-2 3-3 4-3 c1 0 3 1 4 3" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="9" x2="19" y2="9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="13" x2="18" y2="13" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
    people:'<circle cx="8" cy="9" r="3" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><circle cx="16" cy="9" r="3" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M3 19 c0-3 2-5 5-5 s5 2 5 5" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><path d="M11 19 c0-3 2-5 5-5 s5 2 5 5" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    bill:'<rect x="3" y="7" width="18" height="11" rx="1.5" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><circle cx="12" cy="12.5" r="2.5" fill="#fff" stroke="'+ink+'" stroke-width="1.5"/><circle cx="6" cy="10" r=".8" fill="'+ink+'"/><circle cx="18" cy="15" r=".8" fill="'+ink+'"/>',
    plane:'<path d="M3 14 l8-2 4-7 c1-1 3-1 3 1 l-2 5 8 4 l-1 3 -9-2 -4 4 l-1 2 -2-1 1-3 -5-1 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    ring:'<circle cx="12" cy="14" r="6" fill="none" stroke="'+color+'" stroke-width="2.5"/><path d="M9 5 l3 4 3-4 z" fill="'+color+'" stroke="'+ink+'" stroke-width="1.8" stroke-linejoin="round"/>',
    globe:'<circle cx="12" cy="12" r="9" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="'+ink+'" stroke-width="1.5"/><line x1="3" y1="12" x2="21" y2="12" stroke="'+ink+'" stroke-width="1.5"/>',
    flag:'<line x1="5" y1="3" x2="5" y2="21" stroke="'+ink+'" stroke-width="2.5" stroke-linecap="round"/><path d="M5 4 h11 l-2 4 2 4 h-11 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    mailbox:'<rect x="3" y="8" width="18" height="11" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M3 9 l9 6 9-6" fill="none" stroke="'+ink+'" stroke-width="2"/>',
    warning:'<path d="M12 3 l9 16 h-18 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="'+ink+'" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1.2" fill="'+ink+'"/>',
    play:'<polygon points="7,4 20,12 7,20" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    speaker:'<polygon points="3,9 8,9 13,5 13,19 8,15 3,15" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M16 9 c2 1.5 2 4.5 0 6" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><path d="M18 6 c4 3 4 9 0 12" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    pencil:'<path d="M4 20 l4-1 11-11 -3-3 -11 11 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><line x1="14" y1="6" x2="17" y2="9" stroke="'+ink+'" stroke-width="2"/>',
    plus:'<line x1="12" y1="5" x2="12" y2="19" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/>',
    x:'<line x1="6" y1="6" x2="18" y2="18" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="18" x2="18" y2="6" stroke="'+color+'" stroke-width="3" stroke-linecap="round"/>',
    home:'<path d="M3 11 l9-8 9 8 v9 a1 1 0 0 1 -1 1 h-5 v-6 h-6 v6 h-5 a1 1 0 0 1 -1-1 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/>',
    map:'<path d="M3 6 l6-2 6 2 6-2 v14 l-6 2 -6-2 -6 2 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><line x1="9" y1="4" x2="9" y2="20" stroke="'+ink+'" stroke-width="1.5"/><line x1="15" y1="6" x2="15" y2="22" stroke="'+ink+'" stroke-width="1.5"/>',
    briefcase:'<rect x="3" y="7" width="18" height="13" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M9 7 v-2 a1 1 0 0 1 1-1 h4 a1 1 0 0 1 1 1 v2" fill="none" stroke="'+ink+'" stroke-width="2"/><line x1="3" y1="13" x2="21" y2="13" stroke="'+ink+'" stroke-width="2"/>',
    shield:'<path d="M12 3 l8 3 v6 c0 5-4 8-8 9 c-4-1-8-4-8-9 v-6 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M9 12 l2 2 4-4" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    cup:'<path d="M5 8 h12 v6 a4 4 0 0 1 -4 4 h-4 a4 4 0 0 1 -4 -4 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M17 10 a3 3 0 0 1 0 6" fill="none" stroke="'+ink+'" stroke-width="2"/><path d="M8 4 c0 1 1 1 1 2 s-1 1-1 2" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><path d="M12 4 c0 1 1 1 1 2 s-1 1-1 2" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    walk:'<circle cx="13" cy="4" r="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M9 22 l3-7 -1-3 3-3 3 4 -2 5 2 4" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    question:'<circle cx="12" cy="12" r="9" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M9 9 a3 3 0 0 1 6 0 c0 2 -3 2 -3 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="#fff"/>',
    smile:'<circle cx="12" cy="12" r="9" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><circle cx="9" cy="10" r="1.3" fill="'+ink+'"/><circle cx="15" cy="10" r="1.3" fill="'+ink+'"/><path d="M8 14 c1.5 2 6.5 2 8 0" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    stamp:'<rect x="4" y="13" width="16" height="6" rx="1" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M8 13 v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="19" x2="21" y2="19" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    mountain:'<path d="M3 20 l6-12 4 7 3-4 5 9 z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><polygon points="9,8 11,12 7,12" fill="#fff"/>',
    person:'<circle cx="12" cy="8" r="4" fill="'+color+'" stroke="'+ink+'" stroke-width="2"/><path d="M4 21 c0-5 4-8 8-8 s8 3 8 8" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    // Lightbulb — replaces 💡 emoji used throughout for tips
    lightbulb:'<path d="M9 18 v1 a3 3 0 0 0 6 0 v-1 z" fill="'+ink+'"/><path d="M12 2 a6 6 0 0 0 -4 10.5 c1 1 1.5 2 1.5 3.5 h5 c0-1.5 .5-2.5 1.5-3.5 a6 6 0 0 0 -4-10.5z" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><line x1="9" y1="18" x2="15" y2="18" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/>',
    // Snowflake — replaces ❄️ emoji used for streak freeze
    snowflake:'<line x1="12" y1="3" x2="12" y2="21" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round"/><line x1="5" y1="5" x2="19" y2="19" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="'+color+'"/>',
    // Padlock — matches the rest of the icon library (color fill + ink outline)
    lock:'<rect x="5" y="11" width="14" height="10" rx="2" fill="'+color+'" stroke="'+ink+'" stroke-width="2" stroke-linejoin="round"/><path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="'+ink+'"/>'
  };
  // SVG flag icons (24x16 rect centered in viewBox) — replace flag emojis everywhere
  var flags = {
    flagUS: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#fff" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<rect x="2" y="6"   width="20" height="1.4" fill="#b22234"/>'
      + '<rect x="2" y="8.7" width="20" height="1.4" fill="#b22234"/>'
      + '<rect x="2" y="11.4" width="20" height="1.4" fill="#b22234"/>'
      + '<rect x="2" y="14.1" width="20" height="1.4" fill="#b22234"/>'
      + '<rect x="2" y="16.8" width="20" height="1.2" fill="#b22234"/>'
      + '<rect x="2" y="6" width="9" height="6" fill="#3c3b6e"/>'
      + '<g fill="#fff">'
      + '<circle cx="4" cy="7.5" r=".5"/><circle cx="6" cy="7.5" r=".5"/><circle cx="8" cy="7.5" r=".5"/>'
      + '<circle cx="5" cy="9" r=".5"/><circle cx="7" cy="9" r=".5"/><circle cx="9" cy="9" r=".5"/>'
      + '<circle cx="4" cy="10.5" r=".5"/><circle cx="6" cy="10.5" r=".5"/><circle cx="8" cy="10.5" r=".5"/>'
      + '</g>',
    flagMX: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#fff" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<rect x="2"  y="6" width="6.67" height="12" fill="#006847"/>'
      + '<rect x="15.33" y="6" width="6.67" height="12" fill="#ce1126"/>'
      + '<circle cx="12" cy="12" r="2" fill="none" stroke="#006847" stroke-width=".8"/>',
    flagIN: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#fff" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<rect x="2" y="6"  width="20" height="4" fill="#ff9933"/>'
      + '<rect x="2" y="14" width="20" height="4" fill="#138808"/>'
      + '<circle cx="12" cy="12" r="1.6" fill="none" stroke="#000080" stroke-width=".6"/>'
      + '<circle cx="12" cy="12" r=".3" fill="#000080"/>',
    flagCN: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#de2910" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<polygon points="6,9 6.6,10.7 8.4,10.7 7,11.7 7.5,13.4 6,12.4 4.5,13.4 5,11.7 3.6,10.7 5.4,10.7" fill="#ffde00"/>'
      + '<circle cx="10" cy="8.5" r=".5" fill="#ffde00"/>'
      + '<circle cx="11" cy="10" r=".5" fill="#ffde00"/>'
      + '<circle cx="11" cy="11.5" r=".5" fill="#ffde00"/>'
      + '<circle cx="10" cy="13" r=".5" fill="#ffde00"/>',
    flagPH: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#fff" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<rect x="2" y="6"  width="20" height="6" fill="#0038a8"/>'
      + '<rect x="2" y="12" width="20" height="6" fill="#ce1126"/>'
      + '<polygon points="2,6 12,12 2,18" fill="#fff"/>'
      + '<circle cx="5" cy="12" r="1.2" fill="#fcd116"/>',
    flagVN: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#da251d" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<polygon points="12,8.5 13,11 15.6,11 13.4,12.6 14.2,15 12,13.5 9.8,15 10.6,12.6 8.4,11 11,11" fill="#ff0"/>',
    // Haiti — blue top half + red bottom half + small white center panel
    flagHT: ''
      + '<rect x="2" y="6"  width="20" height="6" fill="#00209f" stroke="'+ink+'" stroke-width="1.2" stroke-linejoin="round"/>'
      + '<rect x="2" y="12" width="20" height="6" fill="#d21034" stroke="'+ink+'" stroke-width="1.2" stroke-linejoin="round"/>'
      + '<rect x="2" y="6"  width="20" height="12" rx="1.5" fill="none" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<rect x="10" y="10.5" width="4" height="3" fill="#fff" stroke="'+ink+'" stroke-width=".7"/>',
    // Arabic — green background (Saudi-inspired) with stylized white crescent + script suggestion
    flagAR: ''
      + '<rect x="2" y="6" width="20" height="12" rx="1.5" fill="#0f7c3a" stroke="'+ink+'" stroke-width="1.2"/>'
      + '<path d="M7 9 q-2 3 0 6 q4 -1 3 -3 q-1 -2 -3 -3" fill="#fff"/>'
      + '<path d="M12 9.5 q2 0 2 1.5 q0 1.5 -2 1.5" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>'
      + '<path d="M14 13.5 q1.5 0 2 1" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>',
    flagWorld: ''
      + '<circle cx="12" cy="12" r="9" fill="#1cb0f6" stroke="'+ink+'" stroke-width="1.5"/>'
      + '<ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="'+ink+'" stroke-width=".8"/>'
      + '<line x1="3" y1="12" x2="21" y2="12" stroke="'+ink+'" stroke-width=".8"/>'
      + '<path d="M5 8 q3 -2 7 -1 q3 2 7 1" fill="none" stroke="'+ink+'" stroke-width=".8"/>'
      + '<path d="M5 16 q3 2 7 1 q3 -2 7 -1" fill="none" stroke="'+ink+'" stroke-width=".8"/>'
  };
  if(flags[name]) bodies[name] = flags[name];
  return '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+bodies[name]+'</svg>';
}

function camiSVG(mood){
  // mood: 'happy' | 'celebrate' | 'sad' | 'wave'
  var wingColor = mood === 'sad' ? '#84807a' : '#00b4a8';
  var bodyShift = mood === 'celebrate' ? ' transform="rotate(-6 50 50)"' : '';
  var armUp = mood === 'celebrate'
    ? '<ellipse cx="22" cy="38" rx="8" ry="14" fill="'+wingColor+'" stroke="#1d1d22" stroke-width="3" transform="rotate(35 22 38)"/>'
    : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"'+bodyShift+'>'
    + '<ellipse cx="50" cy="62" rx="24" ry="26" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<ellipse cx="34" cy="58" rx="11" ry="20" fill="'+wingColor+'" stroke="#1d1d22" stroke-width="3" transform="rotate(-18 34 58)"/>'
    + armUp
    + '<circle cx="56" cy="30" r="20" fill="#ffffff" stroke="#1d1d22" stroke-width="3"/>'
    + '<ellipse cx="63" cy="25" rx="7" ry="9" fill="#ffffff"/>'
    + '<circle cx="63" cy="27" r="3" fill="#1d1d22"/>'
    + '<circle cx="64" cy="26" r="1" fill="#ffffff"/>'
    + '<polygon points="73,32 84,28 73,38" fill="#ff9b21" stroke="#1d1d22" stroke-width="2" stroke-linejoin="round"/>'
    + '<line x1="44" y1="86" x2="40" y2="94" stroke="#ff9b21" stroke-width="4" stroke-linecap="round"/>'
    + '<line x1="56" y1="86" x2="60" y2="94" stroke="#ff9b21" stroke-width="4" stroke-linecap="round"/>'
    + (mood === 'sad'
        ? '<path d="M 50 36 Q 56 40 62 36" stroke="#1d1d22" stroke-width="2" fill="none" stroke-linecap="round"/>'
        : '<path d="M 50 36 Q 56 32 62 36" stroke="#1d1d22" stroke-width="2" fill="none" stroke-linecap="round"/>')
    + '</svg>';
}

function renderLessonComplete(){
  if(!lessonState) return;
  var qwrap = document.querySelector('#lesson .qwrap');
  var checkbar = document.getElementById('checkbar');
  if(checkbar) checkbar.style.display = 'none';
  if(!qwrap) return;
  var correct = lessonState.correct;
  var total = lessonState.qIds.length;
  var p = user.progress;
  var l = findLesson(lessonState.lessonId);
  var lessonTitle = l ? l.title[lang] : '';
  var goal = dailyXPGoal();
  var tdy = todayXP();
  var goalPct = Math.min(100, Math.round(tdy / goal * 100));
  var nextId = getCurrentLessonId();
  var nextL = nextId ? findLesson(nextId) : null;
  var perfect = correct === total;
  var titleTxt = perfect
    ? (lang==='es' ? '¡Perfecto!' : 'Perfect!')
    : (lang==='es' ? '¡Lección completa!' : 'Lesson complete!');

  qwrap.innerHTML = '<div class="completePanel">'
    + '<div class="completeCami">'+camiSVG('celebrate')+'</div>'
    + '<div class="completeTitle">'+titleTxt+'</div>'
    + (lessonTitle ? '<div class="completeName">'+lessonTitle+'</div>' : '')
    + '<div class="completeStats">'
    +   '<div class="completeStat"><div class="completeStatVal">'+correct+'/'+total+'</div><div class="completeStatLbl">'+(lang==='es'?'correctas':'correct')+'</div></div>'
    +   '<div class="completeStat"><div class="completeStatVal">+15</div><div class="completeStatLbl">XP</div></div>'
    +   '<div class="completeStat"><div class="completeStatVal">🔥 '+p.streak+'</div><div class="completeStatLbl">'+(lang==='es'?'racha':'streak')+'</div></div>'
    + '</div>'
    + '<div class="completeDaily">'
    +   '<div class="completeDailyLbl">'+(lang==='es'?'Meta diaria':'Daily goal')+' · '+tdy+'/'+goal+' XP</div>'
    +   '<div class="completeDailyBar"><div class="completeDailyFill'+(tdy>=goal?' completeDailyDone':'')+'" style="width:'+goalPct+'%"></div></div>'
    +   (tdy >= goal ? '<div class="completeDailyDoneTxt">✨ '+(lang==='es'?'¡Meta cumplida!':'Goal met today!')+'</div>' : '')
    + '</div>'
    + (nextL ? '<button class="cta completeNext" onclick="startLesson(\''+nextL.id+'\')">'+(lang==='es'?'Siguiente':'Next')+': '+nextL.title[lang]+' →</button>' : '<button class="cta completeNext" onclick="exitLesson()">'+(lang==='es'?'¡Has terminado todo!':'You\'ve finished everything!')+'</button>')
    + '<button class="completeExit" onclick="exitLesson()">'+(lang==='es'?'Volver a Hoy':'Back to Today')+'</button>'
    + '</div>';
}

function renderUnitComplete(unitId){
  if(!lessonState) return;
  var qwrap = document.querySelector('#lesson .qwrap');
  var checkbar = document.getElementById('checkbar');
  if(checkbar) checkbar.style.display = 'none';
  if(!qwrap) return;
  var unit = null;
  for(var i=0;i<UNITS.length;i++) if(UNITS[i].id === unitId){ unit = UNITS[i]; break; }
  if(!unit) return;
  var unitLessons = LESSONS.filter(function(l){ return l.unit === unitId; });
  var totalQs = 0;
  unitLessons.forEach(function(l){ totalQs += l.qIds.length; });
  var nextUnit = null;
  for(var u=0;u<UNITS.length;u++) if(UNITS[u].id === unitId + 1){ nextUnit = UNITS[u]; break; }
  var firstNext = null;
  if(nextUnit){
    for(var j=0;j<LESSONS.length;j++) if(LESSONS[j].unit === nextUnit.id && !LESSONS[j].isChest){ firstNext = LESSONS[j]; break; }
  }
  var p = user.progress;

  qwrap.innerHTML = '<div class="unitCompletePanel">'
    + '<div class="unitCompleteTrophy">🏆</div>'
    + '<div class="unitCompleteKick">'+(lang==='es'?'UNIDAD COMPLETA':'UNIT COMPLETE')+'</div>'
    + '<div class="unitCompleteTitle">'+unit.title[lang]+'</div>'
    + '<div class="unitCompleteBadge">'+unitLessons.length+' '+(lang==='es'?'lecciones':'lessons')+' · '+totalQs+' '+(lang==='es'?'preguntas':'questions')+' · 🔥 '+p.streak+'</div>'
    + (nextUnit
        ? '<div class="unitCompleteNextLbl">'+(lang==='es'?'Siguiente unidad':'Next unit')+'</div><div class="unitCompleteNext">'+nextUnit.title[lang]+'</div>'
        : '<div class="unitCompleteFinal">'+(lang==='es'?'¡Has completado todas las unidades de cívica!':'You\'ve completed every civics unit!')+'</div>')
    + (firstNext
        ? '<button class="cta unitCompleteNextBtn" onclick="startLesson(\''+firstNext.id+'\')">'+(lang==='es'?'Empezar la siguiente unidad':'Start the next unit')+' →</button>'
        : '<button class="cta unitCompleteNextBtn" onclick="exitLesson()">'+(lang==='es'?'Volver a Hoy':'Back to Today')+'</button>')
    + (firstNext ? '<button class="completeExit" onclick="exitLesson()">'+(lang==='es'?'Más tarde':'Maybe later')+'</button>' : '')
    + '</div>';
}

// ===== MOCK TEST =====
// USCIS rolled out the 128-question test on Oct 20, 2025. Some applicants are
// still grandfathered into the 2008 100-question version (eligibility depends on
// filing date + age/residency exemptions). User picks which version they're prepping for.
//
// 2008 test: 10 questions asked verbally, 6 correct to pass
// 2025 test: 20 questions asked verbally, 12 correct to pass
var TEST_RULES = {
  '2008': { mockSize: 10, mockPass: 6,  poolDescription: {en:'100 questions', es:'100 preguntas'} },
  '2025': { mockSize: 20, mockPass: 12, poolDescription: {en:'128 questions', es:'128 preguntas'} }
};
function currentTestVersion(){
  return (user && user.testVersion === '2008') ? '2008' : '2025';
}
function currentTestRules(){ return TEST_RULES[currentTestVersion()]; }
// Legacy aliases preserved for existing call sites
function MOCK_TEST_SIZE_FN(){ return currentTestRules().mockSize; }
function MOCK_PASS_FN(){ return currentTestRules().mockPass; }
// Civics-question pool filtered by version. 2025 = official 128 from USCIS M-1778; 2008 = legacy 100.
function civicsPoolForCurrentVersion(){
  var v = currentTestVersion();
  if(v === '2008') return CIVICS;
  return (typeof CIVICS_2025 !== 'undefined') ? CIVICS_2025 : CIVICS;
}
function setTestVersion(v){
  if(v !== '2008' && v !== '2025') return;
  if(user.testVersion === v) return;
  user.testVersion = v;
  saveUser();
  toast(lang==='es'
    ? (v === '2025' ? 'Examen 2025 (128 preguntas)' : 'Examen 2008 (100 preguntas)')
    : (v === '2025' ? '2025 test · 128 questions' : '2008 test · 100 questions'));
  try { renderAll(); } catch(e){}
}
var mockState = null;

function getRandomQIds(n){
  var allIds = civicsPoolForCurrentVersion().map(function(c){return c.id;});
  return shuffleArr(allIds).slice(0, Math.min(n, allIds.length));
}

function startMockTest(){
  var avail = todayMockTestsAvailable();
  if(avail <= 0){
    showMockTestPaywall();
    return;
  }
  recordMockTestStart();
  mockState = {
    qIds: getRandomQIds(MOCK_TEST_SIZE_FN()),
    qIdx: 0,
    answers: [],
    picked: null,
    finished: false
  };
  go('mockTest');
  renderMockQuestion();
}

function showMockTestPaywall(){
  // When a free user hits the 3/day cap, route them to the Upgrade view with a toast
  toast(lang==='es' ? 'Llegaste al límite diario · Plus = ilimitado' : 'Daily limit reached · Plus = unlimited');
  go('upgrade');
}

function exitMockTest(){
  if(!mockState || mockState.finished || mockState.answers.length === 0){
    mockState = null;
    go('home');
    return;
  }
  var msg = lang==='es' ? '¿Salir del examen? Tu progreso se perderá.' : 'Exit the test? Your progress will be lost.';
  if(window.confirm(msg)){
    mockState = null;
    go('home');
  }
}

function renderMockQuestion(){
  if(!mockState) return;
  var qId = mockState.qIds[mockState.qIdx];
  var q = findQ(qId);
  if(!q) return;
  var counter = document.getElementById('mtCounter');
  if(counter) counter.textContent = (mockState.qIdx+1) + ' / ' + mockState.qIds.length;
  var fill = document.getElementById('mtProgressFill');
  if(fill) fill.style.width = ((mockState.qIdx) / mockState.qIds.length * 100) + '%';

  var qwrap = document.getElementById('mtQwrap');
  if(qwrap){
    var shuffled = shuffleArr(q.options);
    var opts = '';
    for(var i=0;i<shuffled.length;i++){
      var o = shuffled[i];
      var safeEn = o.en.replace(/"/g,'&quot;');
      opts += '<button class="opt" data-correct="'+(o.correct?'1':'')+'" data-pick="'+safeEn+'" onclick="mockPick(this)">'+o[lang]+'</button>';
    }
    qwrap.innerHTML =
      '<div class="qkick">' + (lang==='es' ? 'Pregunta ' : 'Question ') + (mockState.qIdx+1) + (lang==='es' ? ' de ' : ' of ') + mockState.qIds.length + '</div>' +
      '<div class="q">' + q.q[lang] + '</div>' +
      '<div class="opts">' + opts + '</div>';
  }

  mockState.picked = null;
  var btn = document.getElementById('mtNext');
  if(btn){
    btn.classList.add('dim');
    btn.onclick = mockNext;
    btn.textContent = (mockState.qIdx === mockState.qIds.length - 1) ? (lang==='es'?'Terminar':'Finish') : (lang==='es'?'Siguiente':'Next');
  }
}

function mockPick(el){
  if(!mockState || mockState.finished) return;
  document.querySelectorAll('#mtQwrap .opt').forEach(function(o){o.classList.remove('sel');});
  el.classList.add('sel');
  mockState.picked = el;
  var btn = document.getElementById('mtNext');
  if(btn) btn.classList.remove('dim');
}

function mockNext(){
  if(!mockState || !mockState.picked) return;
  var qId = mockState.qIds[mockState.qIdx];
  var ok = mockState.picked.getAttribute('data-correct') === '1';
  var pickedEn = mockState.picked.getAttribute('data-pick');
  mockState.answers.push({qId: qId, pickedEn: pickedEn, correct: ok});
  if(mockState.qIdx >= mockState.qIds.length - 1) return finishMockTest();
  mockState.qIdx++;
  renderMockQuestion();
}

function finishMockTest(){
  if(!mockState) return;
  mockState.finished = true;
  var correct = mockState.answers.filter(function(a){return a.correct;}).length;
  var total = mockState.qIds.length;
  var passed = correct >= MOCK_PASS_FN();
  if(!user.progress.mockScores) user.progress.mockScores = [];
  user.progress.mockScores.push({score: correct, total: total, passed: passed, takenAt: todayISO()});
  if(!user.progress.missedQs) user.progress.missedQs = [];
  mockState.answers.filter(function(a){return !a.correct;}).forEach(function(a){
    var ex = null;
    for(var i=0;i<user.progress.missedQs.length;i++) if(user.progress.missedQs[i].qId === a.qId){ ex = user.progress.missedQs[i]; break; }
    if(ex){ ex.lastMissed = todayISO(); ex.reviewedCount = 0; }
    else user.progress.missedQs.push({qId:a.qId, lastMissed:todayISO(), reviewedCount:0});
  });
  saveUser();
  renderMockResults(correct, total, passed);
  renderHomeMockCard();
}

function categorizeAnswers(answers){
  var byUnit = {};
  answers.forEach(function(a){
    var lesson = null;
    for(var i=0;i<LESSONS.length;i++){
      if(LESSONS[i].qIds.indexOf(a.qId) !== -1){ lesson = LESSONS[i]; break; }
    }
    if(!lesson) return;
    var unitId = lesson.unit;
    if(!byUnit[unitId]) byUnit[unitId] = {correct:0, total:0};
    byUnit[unitId].total++;
    if(a.correct) byUnit[unitId].correct++;
  });
  return byUnit;
}

function findWeakestUnit(byUnit){
  var weakest = null, weakestPct = 101;
  UNITS.forEach(function(u){
    var stat = byUnit[u.id];
    if(!stat || stat.total === 0) return;
    var pct = stat.correct / stat.total * 100;
    if(pct < weakestPct){ weakestPct = pct; weakest = u; }
  });
  return weakest ? {unit: weakest, pct: weakestPct} : null;
}

function firstIncompleteLessonInUnit(unitId){
  var lessons = LESSONS.filter(function(l){ return l.unit === unitId && !l.isChest; });
  for(var i=0;i<lessons.length;i++){
    if(user.progress.completedLessons.indexOf(lessons[i].id) === -1) return lessons[i];
  }
  return lessons[0];
}

function renderMockResults(correct, total, passed){
  var qwrap = document.getElementById('mtQwrap');
  if(!qwrap) return;
  var fill = document.getElementById('mtProgressFill');
  if(fill) fill.style.width = '100%';
  var counter = document.getElementById('mtCounter');
  if(counter) counter.textContent = lang==='es' ? 'Resultados' : 'Results';

  var badge = passed
    ? '<div class="mtResultBadge mtPass">'+(lang==='es'?'¡Aprobado!':'Pass!')+'</div>'
    : '<div class="mtResultBadge mtFail">'+(lang==='es'?'Sigue practicando':'Keep practicing')+'</div>';
  var verdict = passed
    ? (lang==='es' ? 'En USCIS, esto sería un examen aprobado (6 de 10).' : 'On the real USCIS test, this would be a passing score (6/10).')
    : (lang==='es' ? 'USCIS requiere 6 de 10 correctas. Sigue dominando las lecciones.' : 'USCIS requires 6/10 correct. Keep mastering the lessons.');

  var byUnit = categorizeAnswers(mockState.answers);
  var breakdownRows = '';
  UNITS.forEach(function(u){
    var stat = byUnit[u.id];
    if(!stat || stat.total === 0) return;
    var pct = Math.round(stat.correct / stat.total * 100);
    var cls = pct >= 80 ? 'mtPctGood' : pct >= 50 ? 'mtPctOk' : 'mtPctWeak';
    breakdownRows += '<div class="mtUnitRow">'
      + '<div class="mtUnitName">'+u.title[lang]+'</div>'
      + '<div class="mtUnitScore '+cls+'">'+stat.correct+' / '+stat.total+'</div>'
      + '</div>';
  });
  var breakdown = breakdownRows
    ? '<div class="mtBreakdownHead">'+(lang==='es'?'Por unidad':'By unit')+'</div><div class="mtBreakdown">'+breakdownRows+'</div>'
    : '';

  var weak = findWeakestUnit(byUnit);
  var practiceCTA = '';
  if(weak && weak.pct < 100){
    var lesson = firstIncompleteLessonInUnit(weak.unit.id);
    if(lesson){
      practiceCTA = '<div class="mtPractice" onclick="practiceFromMock(\''+lesson.id+'\')">'
        + '<div class="mtPracticeKick">'+(lang==='es'?'Tu punto más débil':'Your weak spot')+': '+weak.unit.title[lang]+'</div>'
        + '<div class="mtPracticeTitle">'+(lang==='es'?'Practicar':'Practice')+': '+lesson.title[lang]+' →</div>'
        + '</div>';
    }
  }

  var wrongCount = mockState.answers.filter(function(a){return !a.correct;}).length;
  var drillCTA = '';
  if(wrongCount > 0){
    drillCTA = '<div class="mtDrillCTA" onclick="startReviewFromMock()">'
      + '<div class="mtDrillIcon">🔁</div>'
      + '<div class="mtDrillMain">'
      +   '<div class="mtDrillTitle">'+(lang==='es' ? ('Repasa las '+wrongCount+' que fallaste ahora') : ('Drill the '+wrongCount+' you missed now'))+'</div>'
      +   '<div class="mtDrillSub">'+(lang==='es' ? 'Refuerza con explicaciones · +5 XP' : 'Drill with explanations · +5 XP')+'</div>'
      + '</div>'
      + '<div class="mtDrillArrow">→</div>'
      + '</div>';
  }

  var review = '';
  for(var i=0;i<mockState.answers.length;i++){
    var a = mockState.answers[i];
    var q = findQ(a.qId);
    var correctOpt = null;
    for(var ci=0;ci<q.options.length;ci++) if(q.options[ci].correct){ correctOpt = q.options[ci]; break; }
    var pickedTxt = a.correct ? correctOpt[lang] : (a.pickedEn ? findOpt(q, a.pickedEn, lang) : '—');
    var exp = EXPLAIN[a.qId];
    var expText = (exp && exp[lang]) || (exp && exp.en) || '';

    review += '<div class="mtReviewCard '+(a.correct?'mtRcorrect':'mtRwrong')+'">'
      + '<div class="mtReviewCardTop">'
      +   '<div class="mtReviewNum">'+(i+1)+'</div>'
      +   '<div class="mtReviewStatus">'+(a.correct ? '✓' : '✕')+'</div>'
      + '</div>'
      + '<div class="mtReviewQ">'+q.q[lang]+'</div>';

    if(a.correct){
      review += '<div class="mtReviewYourPick mtPickRight">'
        +   '<div class="mtReviewPickLabel">'+(lang==='es'?'Tu respuesta · correcta':'Your answer · correct')+'</div>'
        +   '<div class="mtReviewPickText">'+pickedTxt+'</div>'
        + '</div>';
    } else {
      review += '<div class="mtReviewYourPick mtPickWrong">'
        +   '<div class="mtReviewPickLabel">'+(lang==='es'?'Tu respuesta':'You picked')+'</div>'
        +   '<div class="mtReviewPickText">'+pickedTxt+'</div>'
        + '</div>'
        + '<div class="mtReviewCorrect">'
        +   '<div class="mtReviewCorrectLabel">'+(lang==='es'?'Respuesta correcta':'Correct answer')+'</div>'
        +   '<div class="mtReviewCorrectText">'+correctOpt[lang]+'</div>'
        + '</div>';
    }

    if(expText){
      review += '<div class="mtReviewWhy">'
        +   '<div class="mtReviewWhyLabel">'+iconSVG('lightbulb','#ff9b21',14)+' '+(lang==='es'?'Por qué':'Why')+'</div>'
        +   '<div class="mtReviewWhyText">'+expText+'</div>'
        + '</div>';
    }
    review += '</div>';
  }

  qwrap.innerHTML =
    '<div class="mtResultsHead">'
    +   badge
    +   '<div class="mtScore"><span class="mtScoreNum">'+correct+'</span><span class="mtScoreSlash"> / '+total+'</span></div>'
    +   '<div class="mtScoreSub">'+verdict+'</div>'
    + '</div>'
    + breakdown
    + practiceCTA
    + drillCTA
    + '<div class="mtReviewHeader">'+(lang==='es'?'Repaso pregunta por pregunta':'Question-by-question review')+'</div>'
    + '<div class="mtReviewList">'+review+'</div>';

  var btn = document.getElementById('mtNext');
  if(btn){
    btn.textContent = lang==='es' ? 'Volver a Hoy' : 'Back to Today';
    btn.classList.remove('dim');
    btn.onclick = function(){ mockState = null; go('home'); };
  }
}

function practiceFromMock(lessonId){
  mockState = null;
  startLesson(lessonId);
}

function startReviewFromMock(){
  if(!mockState) return;
  var wrongQIds = mockState.answers.filter(function(a){return !a.correct;}).map(function(a){return a.qId;});
  if(wrongQIds.length === 0){ mockState = null; go('home'); return; }
  lessonState = {
    lessonId: '__review__',
    qIds: shuffleArr(wrongQIds.slice()),
    qIdx: 0,
    correct: 0,
    correctQIds: [],
    wrongQIds: [],
    hearts: 5,
    inARow: 0,
    answered: false,
    failed: false,
    isReview: true
  };
  mockState = null;
  go('lesson');
  renderQuestion();
}

function findOpt(q, en, l){
  for(var i=0;i<q.options.length;i++) if(q.options[i].en === en) return q.options[i][l];
  return en;
}

function renderHomeReviewCard(){
  var el = document.getElementById('homeReviewCard');
  if(!el) return;
  var missed = (user.progress && user.progress.missedQs) || [];
  if(missed.length === 0){ el.style.display = 'none'; return; }
  el.style.display = 'block';
  var count = missed.length;
  el.innerHTML = '<span class="pill">'+(lang==='es'?'Para repasar':'To review')+'</span>'
    + '<div class="lessonTitle">'+count+' '+(lang==='es'?('pregunta'+(count>1?'s':'')+' por repasar'):('question'+(count>1?'s':'')+' to review'))+'</div>'
    + '<div class="lessonSub">'+(lang==='es'?'Refuerza lo que fallaste · +5 XP':'Drill the ones you got wrong · +5 XP')+'</div>'
    + '<div class="lessonMeta"><span>'+(lang==='es'?'Sin tiempo':'No timer')+'</span><span>'+(lang==='es'?'Empezar':'Start')+' →</span></div>';
}

function renderHomeStreakRisk(){
  var el = document.getElementById('homeStreakRisk');
  if(!el) return;
  var p = user.progress || {};
  if(!p.streak || p.streak === 0){ el.style.display = 'none'; return; }
  if(p.lastLessonDate === todayISO()){ el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = '<div class="streakRiskIcon">🔥</div>'
    + '<div class="streakRiskMain">'
    +   '<div class="streakRiskTitle">'+(lang==='es'?'Asegura tu racha de ':'Lock in your ')+p.streak+(lang==='es'?' días':'-day streak')+'</div>'
    +   '<div class="streakRiskSub">'+(lang==='es'?'Una lección hoy la mantiene viva':'One lesson today keeps it alive')+'</div>'
    + '</div>'
    + '<button class="streakRiskBtn" onclick="startCurrentLesson()">'+(lang==='es'?'Vamos':'Go')+'</button>';
}

function renderDates(){
  var el = document.getElementById('datesList');
  if(!el) return;
  var dates = getImportantDates();
  // Merge in user-added custom dates and expiration dates
  (user.customDates || []).forEach(function(cd){
    dates.push({
      title: cd.title,
      date: cd.date,
      status: getDateStatus(cd.date),
      note: cd.note || null,
      custom: true,
      id: cd.id
    });
  });
  Object.keys(user.expirationDates || {}).forEach(function(key){
    var ed = user.expirationDates[key];
    if(!ed.date) return;
    var st = getDateStatus(ed.date);
    var daysLeft = Math.ceil((new Date(ed.date) - new Date(todayISO())) / (24*3600*1000));
    var urgent = daysLeft > 0 && daysLeft <= 90;
    dates.push({
      title: ed.label,
      date: ed.date,
      status: urgent ? 'estimated' : st,
      note: lang==='es' ? 'Vence: ' + daysLeft + ' días' : 'Expires in ' + daysLeft + ' days',
      urgent: urgent,
      expiry: true,
      id: 'exp-'+key
    });
  });
  // Re-sort by date
  dates.sort(function(a, b){
    return new Date(a.date) - new Date(b.date);
  });
  var now = today();
  var upcoming = [], past = [];
  dates.forEach(function(d){
    if(d.status === 'past') past.push(d);
    else upcoming.push(d);
  });

  function dateCard(d){
    var title = (typeof d.title === 'object') ? d.title[lang] : d.title;
    var dateText = d.isRange
      ? fmtMonthRange(d.date, d.dateHigh || d.date, lang)
      : fmtDate(d.date, lang);
    var note = d.note ? (typeof d.note === 'object' ? d.note[lang] : d.note) : '';
    var icon;
    if(d.urgent) icon = iconSVG('warning', '#e63946', 18);
    else if(d.status === 'past') icon = iconSVG('check', '#008a7e', 18);
    else if(d.status === 'estimated') icon = iconSVG('clock', '#1cb0f6', 18);
    else icon = iconSVG('calendar', '#1cb0f6', 18);
    var cls = 'dateCard ' + d.status + (d.urgent ? ' dateUrgent' : '');
    return '<div class="'+cls+'">'
      + '<div class="dateIcon">'+icon+'</div>'
      + '<div class="dateMain">'
      +   '<div class="dateTitle">'+title+'</div>'
      +   '<div class="dateText">'+dateText+'</div>'
      + (note ? '<div class="dateNote">'+note+'</div>' : '')
      + '</div></div>';
  }

  var html = '';
  if(upcoming.length){
    html += '<div class="sec">'+(lang==='es'?'Próximos':'Upcoming')+'</div>';
    html += '<div class="datesList">';
    upcoming.forEach(function(d){ html += dateCard(d); });
    html += '</div>';
  }
  if(past.length){
    html += '<div class="sec">'+(lang==='es'?'Hitos pasados':'Past milestones')+'</div>';
    html += '<div class="datesList">';
    past.slice().reverse().forEach(function(d){ html += dateCard(d); });
    html += '</div>';
  }
  if(!upcoming.length && !past.length){
    html = '<div class="emptyState">'
      + '<div class="emptyStateCami">'+camiSVG('happy')+'</div>'
      + '<div class="emptyStateTitle">'+(lang==='es'?'Aún no hay fechas':'No dates yet')+'</div>'
      + '<div class="emptyStateBody">'+(lang==='es'
          ? 'A medida que avances en tu camino, los hitos importantes aparecerán aquí. También puedes agregar fechas personales (cita con abogado, plazos, etc).'
          : 'As you progress, important milestones will appear here. You can also add personal dates (lawyer appointments, deadlines, etc).')+'</div>'
      + '<button class="cta emptyStateCta" onclick="showAddCustomDate()">'+(lang==='es'?'Agregar primera fecha':'Add your first date')+' →</button>'
      + '</div>';
  }
  // Action bar — add custom date, expiration tracker, calendar export
  html += '<div class="datesActions">'
    + '<button class="datesActionBtn" onclick="showAddCustomDate()">'+iconSVG('plus','#1d1d22',14)+' '+(lang==='es'?'Agregar fecha':'Add date')+'</button>'
    + '<button class="datesActionBtn" onclick="showExpirationTracker()">'+iconSVG('clock','#1d1d22',14)+' '+(lang==='es'?'Vencimientos':'Expirations')+'</button>'
    + '<button class="datesActionBtn" onclick="exportDatesToICS()">'+iconSVG('calendar','#1d1d22',14)+' '+(lang==='es'?'Exportar':'Export .ics')+'</button>'
    + '</div>';
  el.innerHTML = html;
  populateIcons();
}

function getDateStatus(dateStr){
  if(!dateStr) return 'estimated';
  var d = new Date(dateStr);
  var now = new Date(todayISO());
  if(d < now) return 'past';
  return 'upcoming';
}

// ===== ADD CUSTOM DATE =====
function showAddCustomDate(){
  closeAddCustomDate();
  var overlay = document.createElement('div');
  overlay.id = 'addCustomDateModal';
  overlay.className = 'disclaimerOverlay';
  overlay.innerHTML = ''
    + '<div class="addDateCard">'
    + '  <div class="addDateTitle">'+(lang==='es'?'Agregar fecha personal':'Add a personal date')+'</div>'
    + '  <div class="addDateSub">'+(lang==='es'?'Cita con abogado, plazo, todo lo que importa para ti.':'Lawyer appointment, deadline, anything important.')+'</div>'
    + '  <label class="addDateLbl">'+(lang==='es'?'Título':'Title')+'</label>'
    + '  <input type="text" class="addDateInput" id="customDateTitle" placeholder="'+(lang==='es'?'p.ej. Cita con abogado':'e.g. Lawyer appointment')+'" />'
    + '  <label class="addDateLbl">'+(lang==='es'?'Fecha':'Date')+'</label>'
    + '  <input type="date" class="addDateInput" id="customDateDate" />'
    + '  <label class="addDateLbl">'+(lang==='es'?'Nota (opcional)':'Note (optional)')+'</label>'
    + '  <input type="text" class="addDateInput" id="customDateNote" placeholder="'+(lang==='es'?'p.ej. Llevar pasaporte':'e.g. Bring passport')+'" />'
    + '  <div class="addDateBtnRow">'
    + '    <button class="cta addDateSave" onclick="saveCustomDate()">'+(lang==='es'?'Guardar':'Save')+'</button>'
    + '    <button class="addDateCancel" onclick="closeAddCustomDate()">'+(lang==='es'?'Cancelar':'Cancel')+'</button>'
    + '  </div>'
    + '</div>';
  document.body.appendChild(overlay);
  setupModalFocus(overlay);
}

function closeAddCustomDate(){
  var el = document.getElementById('addCustomDateModal');
  if(el){ teardownModalFocus(el); el.remove(); }
}

function saveCustomDate(){
  var title = (document.getElementById('customDateTitle')||{}).value || '';
  var date = (document.getElementById('customDateDate')||{}).value || '';
  var note = (document.getElementById('customDateNote')||{}).value || '';
  if(!title.trim() || !date){
    toast(lang==='es' ? 'Necesitas título y fecha' : 'Title and date are required');
    return;
  }
  if(!user.customDates) user.customDates = [];
  user.customDates.push({
    id: 'cd-'+Date.now(),
    title: title.trim(),
    date: date,
    note: note.trim()
  });
  saveUser();
  closeAddCustomDate();
  renderDates();
  toast(lang==='es' ? 'Fecha guardada' : 'Date saved');
}

// ===== EXPIRATION TRACKER =====
var EXPIRATION_FIELDS = [
  {key:'passport',   label:{en:'Passport',                            es:'Pasaporte'}},
  {key:'gc',         label:{en:'Green card (10-yr renewal)',          es:'Residencia (renovación 10 años)'}},
  {key:'ead',        label:{en:'Employment Authorization (EAD)',      es:'Permiso de trabajo (EAD)'}},
  {key:'i94',        label:{en:'I-94 admit-until date',               es:'Fecha de admisión I-94'}},
  {key:'visa',       label:{en:'U.S. visa stamp',                     es:'Sello de visa de EE.UU.'}},
  {key:'i20',        label:{en:'I-20 program end date',               es:'Fecha de fin de programa I-20'}},
  {key:'ap',         label:{en:'Advance Parole (I-512)',              es:'Permiso adelantado (I-512)'}},
  {key:'driversLic', label:{en:'Driver\'s license / state ID',        es:'Licencia / ID estatal'}}
];

function showExpirationTracker(){
  closeExpirationTracker();
  if(!user.expirationDates) user.expirationDates = {};
  var rows = EXPIRATION_FIELDS.map(function(f){
    var ed = user.expirationDates[f.key] || {};
    var daysLeft = ed.date ? Math.ceil((new Date(ed.date) - new Date(todayISO())) / (24*3600*1000)) : null;
    var statusBadge = '';
    if(daysLeft !== null){
      if(daysLeft < 0) statusBadge = '<span class="expBadge expBadgeExpired">'+(lang==='es'?'Vencido':'Expired')+'</span>';
      else if(daysLeft <= 30) statusBadge = '<span class="expBadge expBadgeUrgent">'+daysLeft+'d</span>';
      else if(daysLeft <= 90) statusBadge = '<span class="expBadge expBadgeWarn">'+daysLeft+'d</span>';
      else statusBadge = '<span class="expBadge expBadgeOk">'+daysLeft+'d</span>';
    }
    return '<div class="expRow">'
      + '<div class="expRowMain">'
      +   '<div class="expRowTitle">'+f.label[lang]+' '+statusBadge+'</div>'
      +   '<input type="date" class="expRowInput" data-key="'+f.key+'" value="'+(ed.date||'')+'" onchange="saveExpiration(\''+f.key+'\', this.value, \''+(f.label[lang].replace(/'/g,"\\'"))+'\')" />'
      + '</div>'
      + '</div>';
  }).join('');

  var overlay = document.createElement('div');
  overlay.id = 'expModal';
  overlay.className = 'disclaimerOverlay';
  overlay.innerHTML = ''
    + '<div class="expCard">'
    + '  <div class="expHead">'
    + '    <div class="expIco">'+iconSVG('clock','#1cb0f6',24)+'</div>'
    + '    <div>'
    + '      <div class="expTitle">'+(lang==='es'?'Vencimientos':'Expiration tracker')+'</div>'
    + '      <div class="expSub">'+(lang==='es'?'Te avisamos cuando faltan 90 / 30 / 7 días':'We alert you at 90 / 30 / 7 days out')+'</div>'
    + '    </div>'
    + '  </div>'
    + '  <div class="expRows">'+rows+'</div>'
    + '  <div class="expNote">'+(lang==='es'
        ? 'Solo se guardan las fechas — no almacenamos copias de tus documentos.'
        : 'Only dates are stored — we never store copies of your documents.')+'</div>'
    + '  <button class="cta expDoneBtn" onclick="closeExpirationTracker()">'+(lang==='es'?'Listo':'Done')+'</button>'
    + '</div>';
  document.body.appendChild(overlay);
  setupModalFocus(overlay);
}

function closeExpirationTracker(){
  var el = document.getElementById('expModal');
  if(el){ teardownModalFocus(el); el.remove(); }
}

function saveExpiration(key, date, label){
  if(!user.expirationDates) user.expirationDates = {};
  if(date){
    user.expirationDates[key] = {date: date, label: label};
  } else {
    delete user.expirationDates[key];
  }
  saveUser();
  // Re-render the tracker to update badges
  showExpirationTracker();
  // Also re-render the dates list so it picks up new expirations
  if(document.getElementById('datesList')) renderDates();
}

// ===== CALENDAR EXPORT (.ics) =====
function exportDatesToICS(){
  var dates = getImportantDates();
  (user.customDates || []).forEach(function(cd){
    dates.push({title: cd.title, date: cd.date, note: cd.note, custom: true});
  });
  Object.keys(user.expirationDates || {}).forEach(function(key){
    var ed = user.expirationDates[key];
    if(ed.date) dates.push({title: 'Expires: ' + ed.label, date: ed.date, expiry: true});
  });
  if(!dates.length){
    toast(lang==='es' ? 'No hay fechas para exportar' : 'No dates to export');
    return;
  }
  var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Camino//Immigration App//EN', 'CALSCALE:GREGORIAN'];
  function fmt(d){ return d.replace(/-/g, ''); }
  function uid(d, i){ return 'camino-'+fmt(d)+'-'+i+'@camino.app'; }
  dates.forEach(function(d, i){
    var title = (typeof d.title === 'object') ? d.title.en : d.title;
    if(!d.date) return;
    var note = d.note ? (typeof d.note === 'object' ? d.note.en : d.note) : '';
    ics.push('BEGIN:VEVENT');
    ics.push('UID:' + uid(d.date, i));
    ics.push('DTSTAMP:' + fmt(todayISO()) + 'T000000Z');
    ics.push('DTSTART;VALUE=DATE:' + fmt(d.date));
    ics.push('SUMMARY:' + title.replace(/[,;\\]/g, ' '));
    if(note) ics.push('DESCRIPTION:' + note.replace(/[,;\\]/g, ' '));
    ics.push('END:VEVENT');
  });
  ics.push('END:VCALENDAR');
  var content = ics.join('\r\n');

  if(Store.isNative()){
    // WKWebView has no download manager — the blob/download path silently no-ops.
    // Write to the app cache and hand the file to the iOS share sheet ("Add to Calendar").
    var fs = window.CapFilesystem, share = window.CapShare, dir = window.CapFsDirectory, enc = window.CapFsEncoding;
    if(fs && share && fs.writeFile){
      fs.writeFile({ path: 'camino-dates.ics', data: content, directory: (dir && dir.Cache) || 'CACHE', encoding: (enc && enc.UTF8) || 'utf8' })
        .then(function(res){ return share.share({ title: 'Camino dates', url: res.uri }); })
        .catch(function(e){ if(!(e && /cancel/i.test(e.message||''))) toast(lang==='es' ? 'No se pudo exportar' : 'Could not export'); });
    } else {
      toast(lang==='es' ? 'Exportar no está disponible en esta versión' : 'Export is not available in this version');
    }
    return;
  }

  var blob = new Blob([content], {type: 'text/calendar'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'camino-dates.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  toast(lang==='es' ? 'Descargado · ábrelo con tu calendario' : 'Downloaded · open in your calendar app');
}

function renderHomeMockCard(){
  var el = document.getElementById('homeMockCard');
  if(!el) return;
  var scores = (user.progress && user.progress.mockScores) || [];
  var head = (lang==='es' ? 'Examen de práctica' : 'Mock test');
  if(scores.length === 0){
    el.innerHTML = '<span class="pill">'+head+'</span>'
      + '<div class="lessonTitle">'+(lang==='es'?'Toma tu primer examen':'Take your first test')+'</div>'
      + '<div class="lessonSub">'+(lang==='es'?'10 preguntas al azar · USCIS aprueba en 6/10':'10 random questions · USCIS passes at 6/10')+'</div>'
      + '<div class="lessonMeta"><span>'+(lang==='es'?'Sin tiempo límite':'No time limit')+'</span><span>'+(lang==='es'?'Empezar':'Start')+' →</span></div>';
  } else {
    var best = scores.reduce(function(m, s){ return s.score > m ? s.score : m; }, 0);
    var last = scores[scores.length - 1];
    el.innerHTML = '<span class="pill">'+head+'</span>'
      + '<div class="lessonTitle">'+(lang==='es'?'Mejor: ':'Best: ')+best+' / 10</div>'
      + '<div class="lessonSub">'+(lang==='es'?'Último: ':'Last: ')+last.score+'/10 · '+last.takenAt+(last.passed?(lang==='es'?' · ✓ Aprobado':' · ✓ Pass'):(lang==='es'?' · Sigue':' · Keep going'))+'</div>'
      + '<div class="lessonMeta"><span>'+(lang==='es'?'Intentos: ':'Attempts: ')+scores.length+'</span><span>'+(lang==='es'?'Intentar de nuevo':'Try again')+' →</span></div>';
  }
}

function isUnitUnlocked(unitId){
  if(unitId === 1) return true;
  // Plus gate: Unit 3 (Symbols & Geography) requires Camino Plus
  if(unitId === 3 && !isPlus()) return false;
  // Unit N unlocks when all non-chest lessons of unit N-1 are done.
  // Free users skip the Plus-gated Unit 3 as a prerequisite — Unit 4 must not
  // silently dead-end for them; it unlocks off Unit 2 instead.
  var prevUnit = unitId - 1;
  if(prevUnit === 3 && !isPlus()) prevUnit = 2;
  var prevLessons = LESSONS.filter(function(l){ return l.unit === prevUnit && !l.isChest; });
  return prevLessons.every(function(l){ return user.progress.completedLessons.indexOf(l.id) !== -1; });
}

function isUnitPlusGated(unitId){
  // True if this unit is currently locked because the user isn't on Plus
  return unitId === 3 && !isPlus();
}

function UNIT_ICON_SVG(unitId){
  if(unitId === 1) return iconSVG('shield', '#fff', 26);   // Government
  if(unitId === 2) return iconSVG('book',   '#fff', 26);   // History
  if(unitId === 3) return iconSVG('star',   '#fff', 26);   // Symbols & Geography
  if(unitId === 4) return iconSVG('scales', '#fff', 26);   // Rights & Responsibilities
  return iconSVG('star','#fff',26);
}

function renderUnitBlock(unit){
  var unitLessons = LESSONS.filter(function(l){ return l.unit === unit.id; });
  var unitNonChest = unitLessons.filter(function(l){ return !l.isChest; });
  var unitAllDone = unitNonChest.every(function(l){ return user.progress.completedLessons.indexOf(l.id) !== -1; });
  var unitLocked = !isUnitUnlocked(unit.id);
  var plusGated = isUnitPlusGated(unit.id);
  var curId = getCurrentLessonId();
  var totalCount = unitLessons.length;
  var doneCount = 0;
  for(var di=0;di<unitLessons.length;di++) if(user.progress.completedLessons.indexOf(unitLessons[di].id) !== -1) doneCount++;
  var unitPct = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0;

  var meta;
  if(plusGated){
    meta = '<button class="unitPlusBadge" onclick="go(\'upgrade\')" aria-label="Upgrade to Plus">'
      + iconSVG('bolt', '#fff', 14) + (lang==='es' ? 'Camino Plus' : 'Camino Plus') + '</button>';
  } else if(unitLocked){
    meta = '<div class="unitMeta">'+iconSVG('lock', '#fff', 14)+'<span style="margin-left:5px;vertical-align:middle;">'+(lang==='es' ? 'Bloqueado' : 'Locked')+'</span></div>';
  } else {
    meta = '<div class="unitProgressBox">'
      + '<div class="unitProgressTxt">'+doneCount+' / '+totalCount+'</div>'
      + '<div class="unitProgressBar"><div class="unitProgressBarFill" style="width:'+unitPct+'%"></div></div>'
      + '</div>';
  }

  var bannerCls = 'unitBanner ' + unit.banner + (plusGated ? ' unitPlusLocked' : '');
  var banner = '<div class="'+bannerCls+'">'
    + '<div class="unitBannerIco">'+UNIT_ICON_SVG(unit.id)+'</div>'
    + '<div class="unitBannerLeft"><div class="unitNo">'+unit.kicker[lang]+'</div><div class="unitNm">'+unit.title[lang]+'</div></div>'
    + meta
    + '</div>';

  var path = '<div class="path">';
  for(var i=0;i<unitLessons.length;i++){
    var l = unitLessons[i];
    var done = user.progress.completedLessons.indexOf(l.id) !== -1;
    var current = !done && (l.id === curId);
    var nodeCls, content, onclick;
    if(plusGated){
      nodeCls='locked'; content=iconSVG('bolt', '#ffc83d', 28);
      onclick = "go('upgrade')";
    } else if(unitLocked){
      nodeCls='locked'; content=iconSVG('lock', '#a3a3aa', 26);
      onclick = "toast(lang==='es'?'Termina la unidad anterior':'Finish the previous unit')";
    } else if(l.isChest){
      if(unitAllDone){ nodeCls='crown'; content=iconSVG('trophy', '#fff', 28); onclick="startLesson('"+l.id+"')"; }
      else { nodeCls='locked'; content=iconSVG('lock', '#a3a3aa', 26); onclick="toast(lang==='es'?'Termina la unidad':'Finish the unit')"; }
    } else if(done){
      nodeCls='done'; content=iconSVG('check', '#fff', 32); onclick="startLesson('"+l.id+"')";
    } else if(current){
      nodeCls='cur';
      content='<span class="startBubble">'+(lang==='es'?'EMPIEZA':'START')+'</span>'+iconSVG('book', '#00b4a8', 30);
      onclick="startLesson('"+l.id+"')";
    } else {
      nodeCls='locked'; content=iconSVG('lock', '#a3a3aa', 26);
      onclick="toast(lang==='es'?'Termina la lección anterior':'Finish the lesson before')";
    }
    path += '<div class="pnodeWrap '+l.pos+'">'
      + '<button class="lnode '+nodeCls+'" onclick="'+onclick+'">'+content+'</button>'
      + '<div class="nodeCap">'+l.title[lang]+'</div>'
      + '</div>';
  }
  path += '</div>';
  return banner + path;
}

function renderLearnPath(){
  var el = document.getElementById('learnUnits');
  if(!el) return;
  var html = '';
  for(var u=0;u<UNITS.length;u++){
    var unit = UNITS[u];
    if(u > 0){
      html += '<div class="restMark"><div class="ln"></div><span>'+unit.kicker[lang].toUpperCase()+'</span><div class="ln"></div></div>';
    }
    html += renderUnitBlock(unit);
  }
  el.innerHTML = html + '<div style="height:20px"></div>';

  var totalQs = CIVICS.length;
  var head = document.getElementById('learnMastered');
  if(head) head.textContent = '📘 ' + user.progress.mastered + (lang==='es' ? ' / '+totalQs+' dominadas' : ' / '+totalQs+' mastered');
  var streakHead = document.getElementById('learnStreak');
  if(streakHead) streakHead.innerHTML = '<span class="n400KickIco">'+iconSVG('flame','#ff4d3a',14)+'</span> ' + user.progress.streak;
  var xpHead = document.getElementById('learnXp');
  if(xpHead) xpHead.textContent = '⚡ ' + user.progress.xp + ' XP';

  var dailyEl = document.getElementById('learnDailyGoal');
  if(dailyEl){
    var goal = dailyXPGoal();
    var tdy = todayXP();
    var done = tdy >= goal;
    var pct = Math.min(100, Math.round(tdy / goal * 100));
    dailyEl.innerHTML = '<div class="learnDailyRow">'
      + '<div class="learnDailyLbl">'+(done?'✨ ':'')+(lang==='es'?'Meta diaria':'Daily goal')+' · '+tdy+'/'+goal+' XP</div>'
      + '<div class="learnDailyBar"><div class="learnDailyFill'+(done?' learnDailyFillDone':'')+'" style="width:'+pct+'%"></div></div>'
      + '</div>';
  }
}

function renderHomeLessonCard(){
  var el = document.getElementById('homeLessonCard');
  if(!el) return;
  var lid = getCurrentLessonId();
  if(!lid){
    el.innerHTML = '<span class="pill">🏆 '+(lang==='es'?'¡Completado!':'Done!')+'</span>'
      + '<div class="lessonTitle">'+(lang==='es'?'Unidad 1 completa':'Unit 1 complete')+'</div>'
      + '<div class="lessonSub">'+(lang==='es'?'Repasa para mantener tu racha':'Review to keep your streak')+'</div>';
    return;
  }
  var l = findLesson(lid);
  var idx = -1;
  for(var i=0;i<LESSONS.length;i++){ if(LESSONS[i].id===lid){ idx=i+1; break; } }
  var doneCount = user.progress.completedLessons.length;
  el.innerHTML = '<span class="pill">'+(lang==='es'?'Cívica · Lección ':'Civics · Lesson ')+idx+'</span>'
    + '<div class="lessonTitle">'+l.title[lang]+'</div>'
    + '<div class="lessonSub">'+l.qIds.length+' '+(lang==='es'?'preguntas · mantén tu racha':'questions · keep your streak alive')+'</div>'
    + '<div class="xpbar"><div class="xpfill" style="width:'+Math.min(100, doneCount*16)+'%"></div></div>'
    + '<div class="lessonMeta"><span>+15 XP</span><span>'+(lang==='es'?'Empezar':'Start')+' →</span></div>';
}

function renderHomeStats(){
  var sN = document.getElementById('streakN');
  if(sN) sN.textContent = user.progress.streak;
  var xN = document.getElementById('xpN');
  if(xN) xN.textContent = user.progress.xp;
  var rN = document.getElementById('readyN');
  if(rN){
    var pct = Math.min(100, Math.round((user.progress.mastered / 128) * 100));
    rN.textContent = pct + '%';
  }
  // Replace emoji icons with custom SVG once on first render
  var streakIco = document.getElementById('streakIco');
  if(streakIco && !streakIco.dataset.set){ streakIco.innerHTML = iconSVG('flame', '#ff4d3a', 20); streakIco.dataset.set='1'; }
  var xpIco = document.getElementById('xpIco');
  if(xpIco && !xpIco.dataset.set){ xpIco.innerHTML = iconSVG('bolt', '#ffc83d', 20); xpIco.dataset.set='1'; }
  var readyIco = document.getElementById('readyIco');
  if(readyIco && !readyIco.dataset.set){ readyIco.innerHTML = iconSVG('target', '#00b4a8', 20); readyIco.dataset.set='1'; }
}

// ===== PROFILE FIELD EDITING =====
var ME_FIELDS = {
  name:             {label:{en:'Name',                 es:'Nombre'},                  type:'text'},
  currentStageId:   {label:{en:'Current stage',        es:'Etapa actual'},            type:'stage'},
  countryOfBirth:   {label:{en:'Country of birth',     es:'País de nacimiento'},      type:'country'},
  petitionType:     {label:{en:'Sponsorship path',     es:'Vía de patrocinio'},       type:'petition'},
  greenCardDate:    {label:{en:'Green card date',      es:'Fecha de residencia'},     type:'date'},
  marriedToCitizen: {label:{en:'Married to a U.S. citizen?', es:'¿Casado/a con ciudadano?'}, type:'yesno'},
  marriageDate:     {label:{en:'Marriage date',        es:'Fecha de matrimonio'},     type:'date'},
  monthsOutside:    {label:{en:'Time outside the U.S.',es:'Tiempo fuera de EE.UU.'},  type:'monthsOutside'},
  criminalHistory:  {label:{en:'Criminal history',     es:'Antecedentes penales'},    type:'yesno'},
  dailyMinutes:     {label:{en:'Daily commitment',     es:'Compromiso diario'},       type:'dailyMinutes'}
};

var editFieldState = null;

function openEditField(fieldKey){
  if(!ME_FIELDS[fieldKey]){ return; }
  editFieldState = { fieldKey: fieldKey, value: user[fieldKey] };
  go('editField');
  renderEditField();
}

function closeEditField(){
  editFieldState = null;
  go('me');
}

function saveEditField(){
  if(!editFieldState) return;
  var key = editFieldState.fieldKey;
  var v = editFieldState.value;
  if(key === 'name'){
    var input = document.getElementById('editFieldText');
    if(input) v = input.value.trim();
    if(!v) v = lang==='es' ? 'Amigo' : 'Friend';
  } else if(ME_FIELDS[key].type === 'date'){
    var d = document.getElementById('editFieldDate');
    if(d) v = d.value;
  }
  user[key] = v;
  if(key === 'marriedToCitizen' && !v){ user.marriageDate = null; }
  saveUser();
  applyHeroName();
  closeEditField();
  renderAll();
  go('me');
}

function pickEditValue(v){
  if(!editFieldState) return;
  editFieldState.value = v;
  renderEditField();
  setTimeout(saveEditField, 240);
}

function renderEditField(){
  if(!editFieldState) return;
  var key = editFieldState.fieldKey;
  var field = ME_FIELDS[key];
  if(!field) return;
  var title = document.getElementById('editFieldTitle');
  if(title) title.textContent = field.label[lang];
  var body = document.getElementById('editFieldBody');
  var footer = document.getElementById('editFieldFooter');
  if(!body) return;

  var current = editFieldState.value;
  var html = '';
  var showFooter = false;

  if(field.type === 'text'){
    html = '<div class="onbBig"><input class="onbInputBig" id="editFieldText" value="'+((current||'').replace(/"/g,'&quot;'))+'" autofocus /></div>';
    showFooter = true;
  } else if(field.type === 'date'){
    html = '<div class="onbBig"><input class="onbDateBig" type="date" id="editFieldDate" value="'+(current || '2020-01-01')+'" /></div>';
    showFooter = true;
  } else if(field.type === 'yesno'){
    html = '<div class="onbCards">'
      + onbCardHtml('🙂', (lang==='es'?'No':'No'), '', current === false, "pickEditValue(false)")
      + onbCardHtml('✅', (lang==='es'?'Sí':'Yes'), '', current === true,  "pickEditValue(true)")
      + '</div>';
  } else if(field.type === 'stage'){
    html = '<div class="onbCards">';
    STAGES.forEach(function(s, i){
      var sub = s.home ? s.home.headline[lang] : '';
      html += onbCardHtml(String(i+1), s.name[lang], sub, current === s.id, "pickEditValue('"+s.id+"')");
    });
    html += '</div>';
  } else if(field.type === 'country'){
    html = '<div class="onbCards">'
      + onbCardHtml(flagSVG('Mexico', 28),     'Mexico','',          current==='Mexico',      "pickEditValue('Mexico')")
      + onbCardHtml(flagSVG('India', 28),      'India','',           current==='India',       "pickEditValue('India')")
      + onbCardHtml(flagSVG('China', 28),      'China','',           current==='China',       "pickEditValue('China')")
      + onbCardHtml(flagSVG('Philippines', 28),'Philippines','',     current==='Philippines', "pickEditValue('Philippines')")
      + onbCardHtml(flagSVG('Other', 28),      (lang==='es'?'Otro país':'Another country'), '', current==='Other', "pickEditValue('Other')")
      + '</div>';
  } else if(field.type === 'petition'){
    html = '<div class="onbCards">'
      + onbCardHtml('💍', petitionLabel('family-ir',  lang), '', current==='family-ir',  "pickEditValue('family-ir')")
      + onbCardHtml('👨‍👩‍👧', petitionLabel('family-pref',lang), '', current==='family-pref',"pickEditValue('family-pref')")
      + onbCardHtml('🏠', petitionLabel('family-lpr', lang), '', current==='family-lpr', "pickEditValue('family-lpr')")
      + onbCardHtml('💼', petitionLabel('employment', lang), '', current==='employment', "pickEditValue('employment')")
      + onbCardHtml('🛟', petitionLabel('asylum',     lang), '', current==='asylum',     "pickEditValue('asylum')")
      + onbCardHtml('🌍', petitionLabel('other',      lang), '', current==='other',      "pickEditValue('other')")
      + '</div>';
  } else if(field.type === 'monthsOutside'){
    html = '<div class="onbCards">'
      + onbCardHtml('✅', monthsOutsideLabel('lt6',   lang), '', current==='lt6',    "pickEditValue('lt6')")
      + onbCardHtml('🟡', monthsOutsideLabel('6-18',  lang), '', current==='6-18',   "pickEditValue('6-18')")
      + onbCardHtml('⚠️', monthsOutsideLabel('gt18',  lang), '', current==='gt18',   "pickEditValue('gt18')")
      + onbCardHtml('❓', monthsOutsideLabel('unsure',lang), '', current==='unsure', "pickEditValue('unsure')")
      + '</div>';
  } else if(field.type === 'dailyMinutes'){
    html = '<div class="onbCards">'
      + onbCardHtml('☕', '5 ' + (lang==='es'?'min':'min'),  '', current===5,  "pickEditValue(5)")
      + onbCardHtml('🚶', '10 ' + (lang==='es'?'min':'min'), '', current===10, "pickEditValue(10)")
      + onbCardHtml('🔥', '15 ' + (lang==='es'?'min':'min'), '', current===15, "pickEditValue(15)")
      + '</div>';
  }

  body.innerHTML = html;
  body.style.animation = 'none';
  void body.offsetWidth;
  body.style.animation = '';

  if(footer){
    if(showFooter){
      footer.innerHTML = '<button class="cta" onclick="saveEditField()">'+(lang==='es'?'Guardar':'Save')+' →</button>';
      footer.classList.remove('hidden');
    } else {
      footer.innerHTML = '';
      footer.classList.add('hidden');
    }
  }
}

var ACHIEVEMENTS = [
  {id:'first-lesson', icon:'🎓', name:{en:'First lesson',           es:'Primera lección'},      check:function(u){ return u.progress.completedLessons.length >= 1; }},
  {id:'streak-3',     icon:'🔥', name:{en:'3-day streak',           es:'Racha de 3 días'},      check:function(u){ return u.progress.streak >= 3; }},
  {id:'streak-7',     icon:'⚡', name:{en:'7-day streak',           es:'Racha de 7 días'},      check:function(u){ return u.progress.streak >= 7; }},
  {id:'streak-30',    icon:'💎', name:{en:'30-day streak',          es:'Racha de 30 días'},     check:function(u){ return u.progress.streak >= 30; }},
  {id:'unit-1-master',icon:'🏛️', name:{en:'Unit 1 mastered',        es:'Unidad 1 dominada'},    check:function(u){ return ['principles','rule-of-law','constitution','three-branches','rights-freedoms','unit-1-review'].every(function(l){ return u.progress.completedLessons.indexOf(l)!==-1; }); }},
  {id:'unit-2-master',icon:'📜', name:{en:'Unit 2 mastered',        es:'Unidad 2 dominada'},    check:function(u){ return ['colonial-era','independence','founding-era','civil-war-era','modern-era','unit-2-review'].every(function(l){ return u.progress.completedLessons.indexOf(l)!==-1; }); }},
  {id:'unit-3-master',icon:'🗽', name:{en:'Unit 3 mastered',        es:'Unidad 3 dominada'},    check:function(u){ return ['national-symbols','holidays','states-coasts','gov-numbers','voting-courts','unit-3-review'].every(function(l){ return u.progress.completedLessons.indexOf(l)!==-1; }); }},
  {id:'unit-4-master',icon:'⚖️', name:{en:'Unit 4 mastered',        es:'Unidad 4 dominada'},    check:function(u){ return ['becoming-citizen','voting','federal-states','civic-engagement','taxes-service','unit-4-review'].every(function(l){ return u.progress.completedLessons.indexOf(l)!==-1; }); }},
  {id:'first-mock',   icon:'🎯', name:{en:'First mock pass',        es:'Primer aprobado'},      check:function(u){ return ((u.progress.mockScores||[]).some(function(s){ return s.passed; })); }},
  {id:'mock-perfect', icon:'💯', name:{en:'Perfect mock score',     es:'Mock perfecto'},        check:function(u){ return ((u.progress.mockScores||[]).some(function(s){ return s.score === s.total; })); }},
  {id:'all-docs',     icon:'📁', name:{en:'All docs ready',         es:'Documentos listos'},    check:function(u){ var d = docsReady(); return d.total > 0 && d.ready === d.total; }},
  {id:'eligibility',  icon:'✅', name:{en:'Eligibility passed',     es:'Elegibilidad aprobada'},check:function(u){ return u.eligibility && u.eligibility.passed; }}
];

function renderMe(){
  var avatar = document.getElementById('meAvatar');
  var nameEl = document.getElementById('meName');
  var subEl = document.getElementById('meSub');
  var body = document.getElementById('meBody');
  if(!body) return;

  var initial = (user.name || '?').trim().charAt(0).toUpperCase() || '·';
  if(avatar) avatar.textContent = initial;
  if(nameEl) nameEl.textContent = user.name || '';
  var curStage = STAGES[stageIndex(user.currentStageId)];
  if(subEl) subEl.textContent = countryLabel(user.countryOfBirth, lang) + (curStage ? ' · ' + curStage.name[lang] : '');

  var p = user.progress || {};
  var docs = docsReady();
  var timeline = projectTimeline();
  var html = '';

  // Camino Plus status / upgrade banner
  var ps = planStatus();
  if(ps === 'plus'){
    html += '<div class="mePlusBanner mePlusActive">'
      + '<div class="mePlusBannerLeft">'
      +   '<div class="mePlusLabel">CAMINO <span class="mePlusGoldTag">PLUS</span></div>'
      +   '<div class="mePlusStatusTxt">'+(lang==='es'?'Plan activo':'Plan active')+'</div>'
      + '</div>'
      + '<button class="mePlusManageBtn" onclick="go(\'upgrade\')">'+(lang==='es'?'Administrar':'Manage')+'</button>'
      + '</div>';
  } else if(ps === 'trial-active'){
    var daysLeft = trialDaysLeft();
    html += '<div class="mePlusBanner mePlusTrial">'
      + '<div class="mePlusBannerLeft">'
      +   '<div class="mePlusLabel">CAMINO <span class="mePlusGoldTag">PLUS</span></div>'
      +   '<div class="mePlusStatusTxt">'+(lang==='es'?'Prueba gratis · ':'Free trial · ')+daysLeft+' '+(lang==='es'?'días restantes':'days left')+'</div>'
      + '</div>'
      + '<button class="mePlusManageBtn" onclick="go(\'upgrade\')">'+(lang==='es'?'Ver':'View')+'</button>'
      + '</div>';
  } else {
    html += '<div class="mePlusBanner mePlusOffer" onclick="go(\'upgrade\')">'
      + '<div class="mePlusOfferIco">'+iconSVG('star','#ffc83d',24)+'</div>'
      + '<div class="mePlusBannerLeft">'
      +   '<div class="mePlusLabel">CAMINO <span class="mePlusGoldTag">PLUS</span></div>'
      +   '<div class="mePlusStatusTxt">'+(lang==='es'?'7 días gratis · estudia más rápido':'7 days free · study smarter')+'</div>'
      + '</div>'
      + '<div class="mePlusArrow">→</div>'
      + '</div>';
  }

  html += '<div class="sec">'+(lang==='es'?'Tu camino · toca para editar':'Your path · tap to edit')+'</div>';
  html += '<div class="mini">';
  html += '<div class="row" onclick="openEditField(\'name\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Nombre':'Name')+'</div><div class="rSub">'+(user.name||'—')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'currentStageId\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Etapa actual':'Current stage')+'</div><div class="rSub">'+(curStage ? curStage.name[lang] : '—')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'countryOfBirth\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'País de nacimiento':'Country of birth')+'</div><div class="rSub">'+countryLabel(user.countryOfBirth, lang)+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'petitionType\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Vía de patrocinio':'Sponsorship path')+'</div><div class="rSub">'+(user.petitionType ? petitionLabel(user.petitionType, lang) : '—')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'greenCardDate\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Fecha de residencia':'Green card date')+'</div><div class="rSub">'+(user.greenCardDate ? fmtDate(user.greenCardDate, lang) : '—')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'marriedToCitizen\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Casado/a con ciudadano':'Married to citizen')+'</div><div class="rSub">'+(user.marriedToCitizen ? (lang==='es'?'Sí · regla de 3 años':'Yes · 3-year rule') : (lang==='es'?'No · regla de 5 años':'No · 5-year rule'))+'</div></div><div class="chev">›</div></div>';
  if(user.marriedToCitizen) html += '<div class="row" onclick="openEditField(\'marriageDate\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Casado/a desde':'Married since')+'</div><div class="rSub">'+(user.marriageDate ? fmtDate(user.marriageDate, lang) : '—')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'monthsOutside\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Tiempo fuera de EE.UU.':'Time outside U.S.')+'</div><div class="rSub">'+monthsOutsideLabel(user.monthsOutside, lang)+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'criminalHistory\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Antecedentes penales':'Criminal history')+'</div><div class="rSub">'+(user.criminalHistory ? (lang==='es'?'Sí · consulta legal':'Yes · legal consult') : (lang==='es'?'No':'No'))+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="openEditField(\'dailyMinutes\')"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Compromiso diario':'Daily commitment')+'</div><div class="rSub">'+(user.dailyMinutes||5)+' '+(lang==='es'?'min':'min')+'</div></div><div class="chev">›</div></div>';
  if(timeline) html += '<div class="row"><div class="rMain"><div class="rTitle">'+(lang==='es'?'Tiempo estimado':'Estimated time')+'</div><div class="rSub">'+fmtMonthsTotal(timeline.totalMonthsLow, timeline.totalMonthsHigh, lang)+' '+(lang==='es'?'a la ciudadanía':'to citizenship')+'</div></div></div>';
  if(user.criminalHistory) html += '<div class="row"><div class="rIco" style="background:rgba(255,159,10,.16);">'+iconSVG('warning','#ff9b21',20)+'</div><div class="rMain"><div class="rTitle" style="color:var(--orange)">'+(lang==='es'?'Marcado para revisión':'Flagged for review')+'</div><div class="rSub">'+(lang==='es'?'Consulta con un abogado de inmigración antes de presentar':'Talk to an immigration lawyer before filing')+'</div></div></div>';
  html += '</div>';

  // Web Notification API doesn't exist in the iOS webview — don't offer a dead
  // "Enable" button there. (Native reminders return via local-notifications in v1.1.)
  if(notifSupported()){
    var notif = user.notifications || {enabled:false, time:'09:00'};
    var notifEnabled = notif.enabled && (Notification.permission === 'granted');
    html += '<div class="sec">'+(lang==='es'?'Recordatorios':'Reminders')+'</div>';
    html += '<div class="mini">';
    html += '<div class="row"><div class="rIco" style="background:rgba(255,107,53,.16);">'+iconSVG('bell','#ff6b35',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Recordatorios diarios':'Daily reminders')+'</div><div class="rSub">'+(notifEnabled ? (lang==='es'?'Activado · navegador':'On · browser') : (lang==='es'?'Desactivado':'Off'))+'</div></div>'
      + (notifEnabled
          ? '<button class="meBtnGhost" onclick="disableNotifications()">'+(lang==='es'?'Apagar':'Off')+'</button>'
          : '<button class="meBtnPrimary" onclick="requestNotifications()">'+(lang==='es'?'Activar':'Enable')+'</button>')
      + '</div>';
    if(notifEnabled){
      html += '<div class="row"><div class="rIco" style="background:rgba(94,92,230,.14);">'+iconSVG('clock','#5e5ce6',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Hora preferida':'Preferred time')+'</div><div class="rSub">'+(lang==='es'?'Para la notificación diaria':'For the daily nudge')+'</div></div><input type="time" class="meTimeInput" value="'+(notif.time||'09:00')+'" onchange="setNotifTime(this.value)" /></div>';
      html += '<div class="row" onclick="sendTestNotification()"><div class="rIco" style="background:rgba(52,199,89,.14);">'+iconSVG('mailbox','#248a3d',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Probar notificación':'Test notification')+'</div><div class="rSub">'+(lang==='es'?'Envía una ahora mismo':'Send one right now')+'</div></div><div class="chev">›</div></div>';
    }
    html += '</div>';
  }

  // N-400 organizer + PDF, findable on the profile (regenerated on demand from
  // saved answers — the file itself is never stored)
  if(user.n400 && Object.keys(user.n400.answers||{}).length > 0){
    html += '<div class="sec">'+(lang==='es'?'Tu N-400':'Your N-400')+'</div>';
    html += '<div class="mini">';
    html += '<div class="row" onclick="startN400FormHelper()"><div class="rIco" style="background:rgba(0,180,168,.14);">'+iconSVG('folder','#0f6b62',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Organizador N-400':'N-400 organizer')+'</div><div class="rSub">'+n400FH_overallPct()+'% '+(lang==='es'?'completo':'complete')+'</div></div><div class="chev">›</div></div>';
    html += '<div class="row" onclick="n400FH_pdfEntry()"><div class="rIco" style="background:rgba(94,92,230,.14);">'+iconSVG('doc','#5e5ce6',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Tu borrador N-400 (PDF)':'Your N-400 draft (PDF)')+'</div><div class="rSub">'+(lang==='es'?'Generado en tu dispositivo · solo tus respuestas':'Generated on your device · your answers only')+'</div></div><div class="chev">›</div></div>';
    html += '</div>';
  }

  html += '<div class="sec">'+(lang==='es'?'Tu progreso':'Your progress')+'</div>';
  html += '<div class="mini">';
  var freezeRow = isPlus()
    ? '<div class="streakFreezeBadge">'+iconSVG('snowflake','#1cb0f6',12)+' '+(user.streakFreezes||0)+' '+(lang==='es'?'congelar':'freeze')+'</div>'
    : '';
  html += '<div class="row"><div class="rIco" style="background:rgba(255,77,58,.14);">'+iconSVG('flame','#ff4d3a',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Racha':'Streak')+'</div><div class="rSub">'+(p.streak||0)+' '+(lang==='es'?'días':'days')+' '+freezeRow+'</div></div></div>';
  html += '<div class="row"><div class="rIco" style="background:rgba(255,200,61,.18);">'+iconSVG('bolt','#ffc83d',20)+'</div><div class="rMain"><div class="rTitle">XP</div><div class="rSub">'+(p.xp||0)+'</div></div></div>';
  html += '<div class="row"><div class="rIco" style="background:rgba(28,176,246,.14);">'+iconSVG('book','#1cb0f6',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Lecciones':'Lessons')+'</div><div class="rSub">'+((p.completedLessons||[]).length)+' / '+LESSONS.length+'</div></div></div>';
  html += '<div class="row"><div class="rIco" style="background:rgba(140,77,209,.14);">'+iconSVG('folder','#8c4dd1',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Documentos':'Documents')+'</div><div class="rSub">'+docs.ready+' / '+docs.total+' '+(lang==='es'?'listos':'ready')+'</div></div></div>';
  html += '</div>';

  var unlockedCount = ACHIEVEMENTS.filter(function(a){return a.check(user);}).length;
  html += '<div class="sec">'+(lang==='es'?'Logros':'Achievements')
       + ' <span class="secCount">'+unlockedCount+'/'+ACHIEVEMENTS.length+'</span></div>';
  if(unlockedCount === 0){
    html += '<div class="achEmptyHint">'+(lang==='es'?'✨ Completa una lección o haz un examen para desbloquear tu primer logro.':'✨ Complete a lesson or take a test to unlock your first achievement.')+'</div>';
  }
  html += '<div class="achGrid">';
  for(var ai=0; ai<ACHIEVEMENTS.length; ai++){
    var a = ACHIEVEMENTS[ai];
    var got = a.check(user);
    html += '<div class="achBadge'+(got?' achUnlocked':'')+'" role="img" aria-label="'+a.name[lang]+(got?' — unlocked':' — locked')+'">'
      +    '<div class="achIcon">'+(got?a.icon:'<span class="achLockSvg">'+iconSVG('shield','#84807a',24)+'</span>')+'</div>'
      +    '<div class="achName">'+a.name[lang]+'</div>'
      +  '</div>';
  }
  html += '</div>';

  html += '<div class="sec">'+(lang==='es'?'Idioma':'Language')+'</div>';
  html += '<div class="meLangGrid">';
  LANGUAGES.forEach(function(L){
    var selCls = (lang === L.code) ? ' meLangSel' : '';
    var beta = L.fullyTranslated ? '' : '<span class="meLangBeta">beta</span>';
    html += '<button class="meLangCard'+selCls+'" onclick="setLang(\''+L.code+'\',this)">'
      + '<div class="meLangFlag">'+iconSVG(L.flagIcon, '#1d1d22', 32)+'</div>'
      + '<div class="meLangName">'+L.native+'</div>'
      + beta
      + '</button>';
  });
  html += '</div>';

  // Test-version toggle — 2008 (100q) vs 2025 (128q)
  var tv = currentTestVersion();
  html += '<div class="sec">'+(lang==='es'?'Versión del examen de cívica':'Civics test version')+'</div>';
  html += '<div class="testVerBox">'
       + '<div class="testVerHelp">'+(lang==='es'
          ? 'Solicitantes que presentaron el N-400 a partir del 20 de octubre de 2025 toman la versión 2025 (128 preguntas, 12 de 20 para aprobar). Antes de esa fecha: versión 2008 (100 preguntas, 6 de 10).'
          : 'Applicants who filed N-400 on or after Oct 20, 2025 take the 2025 version (128 questions, 12 of 20 to pass). Filed before that date: 2008 version (100 questions, 6 of 10).')+'</div>'
       + '<div class="testVerRow">'
       +   '<button class="testVerBtn'+(tv==='2025'?' testVerBtnSel':'')+'" onclick="setTestVersion(\'2025\')">'
       +     '<div class="testVerName">2025</div>'
       +     '<div class="testVerSub">128 ' + (lang==='es'?'preguntas · 12 de 20':'questions · 12 of 20') + '</div>'
       +   '</button>'
       +   '<button class="testVerBtn'+(tv==='2008'?' testVerBtnSel':'')+'" onclick="setTestVersion(\'2008\')">'
       +     '<div class="testVerName">2008</div>'
       +     '<div class="testVerSub">100 ' + (lang==='es'?'preguntas · 6 de 10':'questions · 6 of 10') + '</div>'
       +   '</button>'
       + '</div>'
       + '</div>';

  // USCIS case-status section
  html += '<div class="sec">'+(lang==='es'?'Caso USCIS':'USCIS case status')+'</div>';
  html += '<div class="uscisBox">';
  html += '<div class="uscisLabel">'+(lang==='es'?'Número de recibo':'Receipt number')+'</div>';
  html += '<input type="text" class="uscisInputField" id="uscisInput" maxlength="13" placeholder="MSC1234567890" value="'+(user.uscisReceipt||'')+'" autocomplete="off" />';
  html += '<div class="uscisHint">'+(lang==='es'?'3 letras + 10 dígitos (ej. MSC, IOE, EAC, WAC, LIN, SRC)':'3 letters + 10 digits (e.g. MSC, IOE, EAC, WAC, LIN, SRC)')+'</div>';
  html += '<div class="uscisBtnRow">';
  html += '<button class="cta ctaSky uscisCheckBtn" onclick="checkUSCISStatus()">'+(lang==='es'?'Ver en USCIS.gov':'Check on USCIS.gov')+' ↗</button>';
  html += '<button class="meBtnPrimary" onclick="saveUSCISReceipt()">'+(lang==='es'?'Guardar':'Save')+'</button>';
  if(user.uscisReceipt) html += '<button class="meBtnGhost" onclick="copyUSCISReceipt()">'+(lang==='es'?'Copiar':'Copy')+'</button>';
  html += '</div>';
  html += '<div class="uscisNote">'+(lang==='es'?'USCIS no tiene API pública. Guardamos tu número localmente para acceso rápido y abrimos su sitio oficial en una pestaña nueva.':'USCIS has no public API. We store your number locally for quick access and open their official site in a new tab.')+'</div>';
  html += '</div>';

  html += '<div class="sec">'+(lang==='es'?'Cuenta':'Account')+'</div>';
  html += '<div class="mini">';
  html += '<div class="row" onclick="startTutorial()"><div class="rIco" style="background:rgba(255,200,61,.18);">'+iconSVG('star','#ffc83d',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Repasar el tutorial':'Replay the tutorial')+'</div><div class="rSub">'+(lang==='es'?'Recorrido guiado por Cami':"Cami's guided walkthrough")+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="go(\'help\')"><div class="rIco" style="background:rgba(28,176,246,.14);">'+iconSVG('question','#1cb0f6',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Ayuda y preguntas':'Help & FAQ')+'</div><div class="rSub">'+(lang==='es'?'Respuestas comunes + comentarios':'Common answers + feedback')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="showDisclaimerModal(true)"><div class="rIco" style="background:rgba(132,128,122,.16);">'+iconSVG('scales','#84807a',20)+'</div><div class="rMain"><div class="rTitle">'+(lang==='es'?'Términos y descargo legal':'Terms & legal disclaimer')+'</div><div class="rSub">'+(lang==='es'?'Lo que esta app es y no es':'What this app is and isn\'t')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="confirmRestartOnboarding()"><div class="rIco" style="background:rgba(10,132,255,.14);">'+iconSVG('refresh','#0a84ff',20)+'</div><div class="rMain"><div class="rTitle" style="color:var(--blue)">'+(lang==='es'?'Volver a configurar perfil':'Restart onboarding')+'</div><div class="rSub">'+(lang==='es'?'Repasa las preguntas iniciales':'Re-enter your profile answers')+'</div></div><div class="chev">›</div></div>';
  html += '<div class="row" onclick="confirmClearData()"><div class="rIco" style="background:rgba(255,59,48,.12);">'+iconSVG('x','#ff3b30',20)+'</div><div class="rMain"><div class="rTitle" style="color:var(--red)">'+(lang==='es'?'Borrar todos los datos':'Clear all data')+'</div><div class="rSub">'+(lang==='es'?'Borra perfil, progreso y documentos':'Wipes profile, progress, and documents')+'</div></div><div class="chev">›</div></div>';
  html += '</div>';

  body.innerHTML = html;
  syncLangButtons();
}

// ===== SERVICE WORKER + PWA =====
var swReady = false;

function registerServiceWorker(){
  // SW disabled during active development to eliminate stale-cache issues.
  // Also actively unregisters any previously-installed SW + clears its caches.
  if(!('serviceWorker' in navigator)) return;
  try {
    navigator.serviceWorker.getRegistrations().then(function(regs){
      regs.forEach(function(r){ r.unregister(); });
    });
    if(typeof caches !== 'undefined' && caches.keys){
      caches.keys().then(function(keys){
        keys.forEach(function(k){ caches.delete(k); });
      });
    }
  } catch(e){}
}

function postToServiceWorker(msg){
  if(!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
  try { navigator.serviceWorker.controller.postMessage(msg); return true; } catch(e){ return false; }
}

function scheduleDailyNotification(timeStr){
  if(!timeStr) return;
  var parts = (timeStr || '09:00').split(':');
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  if(isNaN(h) || isNaN(m)) return;
  var title = 'Camino';
  var body = lang === 'es' ? 'Tiempo para tu lección diaria 🔥'
           : lang === 'zh' ? '该上每日课程了 🔥'
           : lang === 'vi' ? 'Đến giờ học hàng ngày 🔥'
           :                  'Time for your daily lesson 🔥';
  postToServiceWorker({type:'schedule-daily', hour:h, minute:m, title:title, body:body});
}

function cancelDailyNotification(){
  postToServiceWorker({type:'cancel-daily'});
}

// ===== BROWSER NOTIFICATIONS =====
function notifSupported(){ return typeof Notification !== 'undefined'; }

function requestNotifications(){
  if(!notifSupported()){
    toast(lang==='es' ? 'Notificaciones no soportadas en este navegador' : 'Notifications not supported in this browser');
    return;
  }
  Notification.requestPermission().then(function(perm){
    user.notifications = user.notifications || {time:'09:00'};
    user.notifications.enabled = (perm === 'granted');
    saveUser();
    renderMe();
    if(perm === 'granted'){
      scheduleDailyNotification(user.notifications.time || '09:00');
      try {
        new Notification('Camino', {
          body: lang==='es' ? '¡Listo! Te recordaremos tu lección diaria.' : "You're set! We'll remind you of your daily lesson."
        });
      } catch(e){}
    } else {
      toast(lang==='es' ? 'Permiso denegado' : 'Permission denied');
    }
  });
}

function disableNotifications(){
  user.notifications = user.notifications || {time:'09:00'};
  user.notifications.enabled = false;
  cancelDailyNotification();
  saveUser();
  renderMe();
}

function sendTestNotification(){
  if(!notifSupported() || Notification.permission !== 'granted'){
    requestNotifications();
    return;
  }
  try {
    new Notification('🔥 Camino', {
      body: lang==='es' ? 'Asegura tu racha de '+(user.progress.streak||0)+' día(s)' : 'Lock in your '+(user.progress.streak||0)+'-day streak'
    });
  } catch(e){}
}

function maybeShowDailyNotification(){
  if(!notifSupported() || Notification.permission !== 'granted') return;
  if(!user.notifications || !user.notifications.enabled) return;
  var p = user.progress || {};
  if(!p.streak || p.streak === 0) return;
  if(p.lastLessonDate === todayISO()) return;
  try {
    new Notification('🔥 Camino', {
      body: lang==='es' ? 'Una lección hoy mantiene viva tu racha de '+p.streak+' días.' : 'One lesson today keeps your '+p.streak+'-day streak alive.'
    });
  } catch(e){}
}

function setNotifTime(timeStr){
  user.notifications = user.notifications || {enabled:false};
  user.notifications.time = timeStr;
  saveUser();
  if(user.notifications.enabled) scheduleDailyNotification(timeStr);
}

function confirmRestartOnboarding(){
  var msg = lang==='es' ? '¿Volver a hacer el onboarding? Tu perfil actual se reemplazará.' : 'Restart onboarding? Your current profile will be replaced.';
  if(!window.confirm(msg)) return;
  user.onboarded = false;
  // Re-show tutorial on restart — fresh start gets the full intro again
  user.tutorialCompleted = false;
  saveUser();
  onbState = {
    step:0, name:user.name||'', country:user.countryOfBirth||null, phase:null,
    goal:user.immigrationGoal||null,
    petition:user.petitionType||null,
    stageId:user.currentStageId||null, gcDate:user.greenCardDate||'2020-03-03', married:!!user.marriedToCitizen,
    marriageDate:user.marriageDate||'2020-01-01', monthsOutside:user.monthsOutside||null,
    criminalHistory:user.criminalHistory===true ? true : null, dailyMinutes:user.dailyMinutes||5
  };
  renderOnboarding();
  go('onboarding');
}

function confirmClearData(){
  var msg = lang==='es' ? '¿Borrar todos los datos? Esto no se puede deshacer.' : 'Clear all data? This cannot be undone.';
  if(!window.confirm(msg)) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
  location.reload();
}

function renderHomeDocsRow(){
  var el = document.getElementById('homeDocsRow');
  if(!el) return;
  var s = docsReady();
  var t = el.querySelector('.rTitle');
  var sub = el.querySelector('.rSub');
  if(t){ t.removeAttribute('data-en'); t.removeAttribute('data-es'); t.textContent = lang==='es' ? 'Reúne tus documentos' : 'Gather your documents'; }
  if(sub){
    sub.removeAttribute('data-en'); sub.removeAttribute('data-es');
    var txt = lang==='es' ? (s.ready + ' de ' + s.total + ' listos para el N-400') : (s.ready + ' of ' + s.total + ' ready for the N-400');
    if(s.inProgress > 0) txt += lang==='es' ? ' · ' + s.inProgress + ' en progreso' : ' · ' + s.inProgress + ' in progress';
    sub.textContent = txt;
  }
}

var docsViewState = { showAll: false };

function toggleDocsShowAll(){
  docsViewState.showAll = !docsViewState.showAll;
  renderDocs();
}

var DOC_PATH_LABELS = {
  'student':    {en:"F-1 student docs",        es:'Documentos F-1'},
  'opt':        {en:"OPT docs",                es:'Documentos OPT'},
  'workvisa':   {en:'H-1B / work-visa docs',   es:'Documentos H-1B / trabajo'},
  'asylum':     {en:'Asylum docs',             es:'Documentos de asilo'},
  'family-ir':  {en:'Family-based GC docs',    es:'Documentos residencia familiar'},
  'family-pref':{en:'Family preference docs',  es:'Documentos preferencia familiar'},
  'family-lpr': {en:'F2A / LPR-sponsored docs',es:'Documentos F2A / patrocinio LPR'},
  'employment': {en:'Employment GC docs',      es:'Documentos residencia por empleo'},
  'n400':       {en:'For your N-400 application', es:'Para tu solicitud N-400'}
};

function renderDocs(){
  var stat = docsReady();
  var cnt = document.getElementById('docsCount');
  if(cnt) cnt.textContent = lang==='es' ? (stat.ready + ' de ' + stat.total + ' listos') : (stat.ready + ' of ' + stat.total + ' ready');
  var fill = document.getElementById('docsProgressFill');
  if(fill) fill.style.width = (stat.total ? (stat.ready/stat.total)*100 : 0) + '%';
  var title = document.getElementById('docsTitle');
  if(title) title.textContent = lang==='es' ? 'Documentos' : 'Documents';
  var subT = document.getElementById('docsSubtitle');
  var pathKey = userDocPathKey();
  var pathLabel = (DOC_PATH_LABELS[pathKey] || DOC_PATH_LABELS.n400)[lang];
  if(subT) subT.textContent = docsViewState.showAll
    ? (lang==='es' ? 'Mostrando todos los documentos' : 'Showing all documents')
    : pathLabel;

  var list = document.getElementById('docsList');
  if(!list) return;
  var apps = applicableDocuments({all: docsViewState.showAll});

  // Toggle row at the top of the list
  var allCount = applicableDocuments({all: true}).length;
  var pathCount = applicableDocuments().length;
  var toggleHtml = '<div class="docsFilterRow">'
    + '<button class="docsFilterBtn'+(!docsViewState.showAll?' docsFilterActive':'')+'" onclick="docsViewState.showAll=false; renderDocs();">'
    +   (lang==='es' ? 'Solo mi vía' : 'My path only')
    +   ' <span class="docsFilterCount">'+pathCount+'</span>'
    + '</button>'
    + '<button class="docsFilterBtn'+(docsViewState.showAll?' docsFilterActive':'')+'" onclick="docsViewState.showAll=true; renderDocs();">'
    +   (lang==='es' ? 'Mostrar todos' : 'Show all')
    +   ' <span class="docsFilterCount">'+allCount+'</span>'
    + '</button>'
    + '</div>';

  // Educational N-400 walkthrough card (only show for N-400 path users)
  var helperCard = (pathKey === 'n400') ? (n400WalkthroughCard() + n400FormHelperCard()) : '';

  var html = helperCard + toggleHtml;
  for(var c=0;c<DOC_CATS.length;c++){
    var cat = DOC_CATS[c];
    var catDocs = apps.filter(function(d){ return d.cat === cat.id; });
    if(catDocs.length === 0) continue;
    var catIco = '<span class="docCatIco" style="background:'+cat.color+'1a;">'+iconSVG(cat.icon, cat.color, 18)+'</span>';
    html += '<div class="docCatHead">'+catIco+cat.label[lang]+'</div>';
    html += '<div class="mini">';
    for(var i=0;i<catDocs.length;i++){
      var d = catDocs[i];
      var st = docStatusOf(d.id);
      var got = st === 'ready', prog = st === 'progress';
      var optTag = d.optional ? '<span class="docOpt">'+(lang==='es'?'opcional':'optional')+'</span>' : '';
      var progTag = prog ? '<span class="docProgTag">'+(lang==='es'?'en progreso':'in progress')+'</span>' : '';
      var checkContent = got ? iconSVG('check', '#fff', 16) : (prog ? iconSVG('clock', '#fff', 14) : '');
      html += '<div class="row docRow'+(got?' docDone':'')+(prog?' docProg':'')+'">'
        + '<div class="docCheck" onclick="event.stopPropagation(); toggleDocument(\''+d.id+'\')">'+checkContent+'</div>'
        + '<div class="rMain" onclick="openDocDetail(\''+d.id+'\')"><div class="rTitle">'+d.name[lang]+' '+optTag+progTag+'</div><div class="rSub">'+d.sub[lang]+'</div></div>'
        + '<div class="chev" onclick="openDocDetail(\''+d.id+'\')"></div>'
        + '</div>';
    }
    html += '</div>';
  }
  list.innerHTML = html;
  populateIcons();
}

// ===== ELIGIBILITY WIZARD =====
function eligKey(){ return ELIG_STEPS[eligState.step]; }

function eligShouldSkip(key){
  if(key === 'physical' && eligState.physical !== null) return true;
  if(key === 'crime' && eligState.crime !== null) return true;
  return false;
}

function startEligibility(){
  eligState = { step: 0, continuous: null, physical: null, state: null, crime: null, prefilled: [] };
  if(user.monthsOutside === 'lt6'){
    eligState.physical = true;
    eligState.prefilled.push('physical');
  }
  if(user.criminalHistory === true || user.criminalHistory === false){
    eligState.crime = user.criminalHistory === true;
    eligState.prefilled.push('crime');
  }
  while(eligState.step < ELIG_STEPS.length - 1 && eligShouldSkip(ELIG_STEPS[eligState.step])) eligState.step++;
  go('eligibility');
  renderEligibility();
}

function eligBack(){
  if(eligState.step === 0){ go('home'); return; }
  eligState.step--;
  while(eligState.step > 0 && eligShouldSkip(ELIG_STEPS[eligState.step])) eligState.step--;
  renderEligibility();
}

function eligPick(key, value){
  eligState[key] = value;
  renderEligibility();
  if(eligState.step < ELIG_STEPS.length - 1){
    setTimeout(function(){
      eligState.step++;
      while(eligState.step < ELIG_STEPS.length - 1 && eligShouldSkip(ELIG_STEPS[eligState.step])) eligState.step++;
      renderEligibility();
    }, 240);
  }
}

function eligOk(){
  return eligState.continuous === true
    && eligState.physical === true
    && eligState.state === true
    && eligState.crime === false;
}

function eligCardHtml(icon, title, sub, sel, onclick){
  return '<button type="button" class="onbBigCard'+(sel?' onbSel':'')+'" onclick="'+onclick+'">'
    + '<div class="onbCardIcon">'+icon+'</div>'
    + '<div class="onbCardMain">'
    +   '<div class="onbCardTitle">'+title+'</div>'
    + (sub ? '<div class="onbCardSub">'+sub+'</div>' : '')
    + '</div></button>';
}

function renderEligibility(){
  var step = document.getElementById('eligStep');
  var footer = document.getElementById('eligFooter');
  var fill = document.getElementById('eligProgressFill');
  if(!step) return;

  var k = eligKey();
  if(fill) fill.style.width = ((eligState.step + 1) / ELIG_STEPS.length * 100) + '%';

  var years = user.marriedToCitizen ? 3 : 5;
  var months = user.marriedToCitizen ? 18 : 30;

  var html = '';
  var footerHtml = '';

  if(k === 'continuous'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'Residencia continua':'Continuous residence')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'
          ? 'Desde que recibiste tu residencia ('+fmtDate(user.greenCardDate,'es')+'), ¿has hecho algún viaje fuera de EE.UU. de más de 6 meses?'
          : 'Since you became a permanent resident on '+fmtDate(user.greenCardDate,'en')+', have you taken any trip outside the U.S. longer than 6 months?')+'</div>'
      + '<div class="onbCards">'
      + eligCardHtml('🙂', (lang==='es'?'No, ningún viaje largo':'No, no long trips'), (lang==='es'?'Bien — cumples este requisito':'Good — you meet this requirement'), eligState.continuous===true, "eligPick('continuous',true)")
      + eligCardHtml('⚠️', (lang==='es'?'Sí, uno o más':'Yes, one or more'), (lang==='es'?'Puede romper la continuidad — pide consejo legal':'May break continuity — get legal advice'), eligState.continuous===false, "eligPick('continuous',false)")
      + '</div>';
  }
  else if(k === 'physical'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'Presencia física':'Physical presence')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'
          ? '¿Has estado físicamente en EE.UU. al menos '+months+' meses de los últimos '+years+' años?'
          : 'Have you been physically in the U.S. for at least '+months+' months of the past '+years+' years?')+'</div>'
      + '<div class="onbCards">'
      + eligCardHtml('✅', (lang==='es'?'Sí':'Yes'), (lang==='es'?'La mitad o más del tiempo':'At least half the time'), eligState.physical===true, "eligPick('physical',true)")
      + eligCardHtml('❌', (lang==='es'?'No estoy seguro / No':"Not sure / No"), (lang==='es'?'Revisa pasaportes y registros':'Check passports and records'), eligState.physical===false, "eligPick('physical',false)")
      + '</div>';
  }
  else if(k === 'state'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'Residencia en tu estado':'State residence')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'
          ? '¿Has vivido en tu estado actual de EE.UU. (o distrito de USCIS) al menos 3 meses?'
          : 'Have you lived in your current U.S. state (or USCIS district) for at least 3 months?')+'</div>'
      + '<div class="onbCards">'
      + eligCardHtml('🏠', (lang==='es'?'Sí, 3+ meses':'Yes, 3+ months'), '', eligState.state===true, "eligPick('state',true)")
      + eligCardHtml('🧳', (lang==='es'?'No, me mudé recientemente':'No, I moved recently'), (lang==='es'?'Espera hasta cumplir 3 meses':'Wait until you reach 3 months'), eligState.state===false, "eligPick('state',false)")
      + '</div>';
  }
  else if(k === 'crime'){
    html = '<div class="onbStepTitle">'+(lang==='es'?'Carácter moral':'Good moral character')+'</div>'
      + '<div class="onbStepSub">'+(lang==='es'
          ? '¿Has sido arrestado, acusado o condenado por algún delito en los últimos 5 años? También cuenta DUI, fraude migratorio o evasión de impuestos.'
          : 'In the past 5 years, have you been arrested, charged, or convicted of any crime? This includes DUI, immigration fraud, or tax evasion.')+'</div>'
      + '<div class="onbCards">'
      + eligCardHtml('✅', (lang==='es'?'No':'No'), (lang==='es'?'Sin problemas legales recientes':'No recent legal issues'), eligState.crime===false, "eligPick('crime',false)")
      + eligCardHtml('⚠️', (lang==='es'?'Sí':'Yes'), (lang==='es'?'Consulta un abogado de inmigración antes de presentar':'Talk to an immigration lawyer before filing'), eligState.crime===true, "eligPick('crime',true)")
      + '</div>';
  }
  else if(k === 'result'){
    var ok = eligOk();
    if(ok){
      var prefillNote = '';
      if(eligState.prefilled && eligState.prefilled.length > 0){
        prefillNote = ' ' + (lang==='es'
          ? '(Usamos lo que respondiste en el onboarding para acelerar esto.)'
          : "(We used your onboarding answers to speed this up.)");
      }
      html = '<div class="onbStepTitle">'+(lang==='es'?'¡Cumples los requisitos!':"You meet the requirements!")+'</div>'
        + '<div class="onbStepSub">'+(lang==='es'
            ? 'Según tus respuestas, cumples las bases para naturalización. El siguiente paso es presentar el Formulario N-400.'
            : 'Based on your answers, you meet the basic requirements for naturalization. The next step is filing Form N-400.') + prefillNote + '</div>'
        + '<div class="onbSummary">'
        +   '<div class="onbSummaryCard">'
        +     '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Residencia':'Residence')+'</div><div class="onbSummaryV">'+years+' '+(lang==='es'?'años':'years')+'</div></div>'
        +     '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Presencia':'Presence')+'</div><div class="onbSummaryV">'+months+'+ '+(lang==='es'?'meses':'months')+'</div></div>'
        +     '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Estado':'State')+'</div><div class="onbSummaryV">3+ '+(lang==='es'?'meses':'months')+'</div></div>'
        +     '<div class="onbSummaryRow"><div class="onbSummaryK">'+(lang==='es'?'Carácter':'Character')+'</div><div class="onbSummaryV">✓</div></div>'
        +   '</div>'
        +   '<div class="onbSummaryNext">'
        +     '<div class="onbSummaryNextKick">'+(lang==='es'?'Próximo paso':'Next step')+'</div>'
        +     '<div class="onbSummaryNextTitle">'+(lang==='es'?'Presenta el Formulario N-400':'File Form N-400')+'</div>'
        +   '</div>'
        + '</div>';
      footerHtml = '<button class="cta" onclick="finishEligibility(true)">'+(lang==='es'?"Marqué que lo presenté":'I filed my N-400')+' →</button>';
    } else {
      var reasons = [];
      if(eligState.continuous === false) reasons.push(lang==='es'?'Viaje largo puede romper continuidad':'Long trip may break continuity');
      if(eligState.physical === false) reasons.push(lang==='es'?'Tiempo físico en EE.UU. dudoso':'Physical presence may be short');
      if(eligState.state === false) reasons.push(lang==='es'?'Menos de 3 meses en tu estado':'Less than 3 months in your state');
      if(eligState.crime === true) reasons.push(lang==='es'?'Historial legal a revisar':'Legal history to review');
      var rHtml = '';
      for(var i=0;i<reasons.length;i++) rHtml += '<div class="onbSummaryRow"><div class="onbSummaryK">'+(i+1)+'</div><div class="onbSummaryV">'+reasons[i]+'</div></div>';
      html = '<div class="onbStepTitle">'+(lang==='es'?'Necesitas revisar algunas cosas':'A few things to check first')+'</div>'
        + '<div class="onbStepSub">'+(lang==='es'
            ? 'No es un "no" definitivo — algunos casos sí proceden con ayuda legal. Te recomendamos hablar con un abogado de inmigración o organización sin fines de lucro.'
            : 'This isn\'t a definite "no" — many cases still go forward with legal help. We recommend talking to an immigration lawyer or a nonprofit.')+'</div>'
        + '<div class="onbSummary">'
        +   '<div class="onbSummaryCard">'+rHtml+'</div>'
        +   '<div class="onbSummaryNext" style="background:linear-gradient(150deg,#c44d2b,#ff8a3a);box-shadow:0 6px 18px rgba(255,138,58,.25);">'
        +     '<div class="onbSummaryNextKick">'+(lang==='es'?'Recomendado':'Recommended')+'</div>'
        +     '<div class="onbSummaryNextTitle">'+(lang==='es'?'Habla con un abogado de inmigración':'Talk to an immigration lawyer')+'</div>'
        +   '</div>'
        + '</div>';
      footerHtml = '<button class="cta" onclick="finishEligibility(false)">'+(lang==='es'?'Entendido':'Got it')+'</button>';
    }
  }

  step.innerHTML = html;
  step.style.animation = 'none';
  void step.offsetWidth;
  step.style.animation = '';

  if(footerHtml){
    footer.innerHTML = footerHtml;
    footer.classList.remove('hidden');
  } else {
    footer.innerHTML = '';
    footer.classList.add('hidden');
  }
}

function exitEligibility(){
  go('home');
}

function finishEligibility(passed){
  user.eligibility = {
    passed: !!passed,
    checkedAt: todayISO(),
    answers: { continuous: eligState.continuous, physical: eligState.physical, state: eligState.state, crime: eligState.crime }
  };
  saveUser();
  if(passed){
    advanceStage();
  } else {
    go('home');
    renderAll();
    toast(lang==='es' ? 'Guardado. Consulta un abogado.' : 'Saved. Consider talking to a lawyer.');
  }
}

function finishEligibilityAndOpenHelp(){
  user.eligibility = {
    passed: false,
    checkedAt: todayISO(),
    answers: { continuous: eligState.continuous, physical: eligState.physical, state: eligState.state, crime: eligState.crime }
  };
  saveUser();
  renderAll();
  go('help');
}

var tt;
function toast(msg){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(function(){ el.classList.remove('show'); }, 1900);
}

(function boot(){
  backfillTranslations();
  applyTranslationOverrides();
  setTimeout(maybeShowDailyNotification, 1500);
  setTimeout(registerServiceWorker, 1000);
  var stored = loadUser();
  if(stored && stored.onboarded){
    user.name = stored.name || user.name;
    user.greenCardDate = stored.greenCardDate || user.greenCardDate;
    user.marriedToCitizen = !!stored.marriedToCitizen;
    user.currentStageId = stored.currentStageId || user.currentStageId;
    user.dailyMinutes = stored.dailyMinutes || user.dailyMinutes;
    user.onboarded = true;
    if(stored.progress){
      user.progress.completedLessons = stored.progress.completedLessons || [];
      user.progress.xp = stored.progress.xp || 0;
      user.progress.streak = stored.progress.streak || 0;
      user.progress.lastLessonDate = stored.progress.lastLessonDate || null;
      user.progress.mastered = stored.progress.mastered || 0;
      user.progress.todayXP = stored.progress.todayXP || 0;
      user.progress.lastXPDate = stored.progress.lastXPDate || null;
      user.progress.dailyXPGoal = stored.progress.dailyXPGoal || null;
      user.progress.missedQs = stored.progress.missedQs || [];
      user.progress.mockScores = stored.progress.mockScores || [];
      user.progress.interviewAttempts = stored.progress.interviewAttempts || [];
      user.progress.dailyFlashcards = stored.progress.dailyFlashcards || {lastCompleted:null, streak:0};
    }
    user.documents = stored.documents || {};
    user.eligibility = stored.eligibility || null;
    user.countryOfBirth = stored.countryOfBirth || 'Other';
    user.petitionType = stored.petitionType || null;
    user.marriageDate = stored.marriageDate || null;
    user.monthsOutside = stored.monthsOutside || 'lt6';
    user.criminalHistory = !!stored.criminalHistory;
    user.n400Progress = stored.n400Progress || null;
    user.notifications = stored.notifications || { enabled: false, time: '09:00' };
    user.phase = stored.phase || null;
    user.uscisReceipt = stored.uscisReceipt || null;
    user.testVersion = (stored.testVersion === '2008') ? '2008' : '2025';
    user.plan = stored.plan || 'free';
    user.trialStartedAt = stored.trialStartedAt || null;
    user.trialEndsAt = stored.trialEndsAt || null;
    user.planSelected = stored.planSelected || null;
    user.planRenewsAt = stored.planRenewsAt || null;
    user.mockTestsTodayCount = stored.mockTestsTodayCount || 0;
    user.mockTestsTodayDate = stored.mockTestsTodayDate || null;
    user.voiceInterviewsTodayCount = stored.voiceInterviewsTodayCount || 0;
    user.voiceInterviewsTodayDate = stored.voiceInterviewsTodayDate || null;
    user.micPermission = stored.micPermission || null;
    // v1 cleanup migration: the removed N-400 filler's drafts (names, criminal-history
    // answers) and Cami's key/chat history are sensitive — stop persisting them.
    user.n400Form = null;
    user.n400 = stored.n400 || null;   // N-400 organizer state (answers stay local-only)
    user.immigrationGoal = stored.immigrationGoal || null;
    user.pathCurrentStage = stored.pathCurrentStage || null;
    user.anthropicApiKey = CAMI_AVAILABLE ? (stored.anthropicApiKey || null) : null;
    user.camiChatHistory = CAMI_AVAILABLE ? (stored.camiChatHistory || []) : [];
    user.camiMessagesTodayCount = stored.camiMessagesTodayCount || 0;
    user.camiMessagesTodayDate = stored.camiMessagesTodayDate || null;
    user.disclaimerAcceptedVersion = stored.disclaimerAcceptedVersion || null;
    user.disclaimerAcceptedAt = stored.disclaimerAcceptedAt || null;
    user.trialReminderShown = stored.trialReminderShown || {};
    user.tutorialCompleted = !!stored.tutorialCompleted;
    user.cancelHistory = stored.cancelHistory || [];
    user.streakFreezes = (typeof stored.streakFreezes === 'number') ? stored.streakFreezes : 2;
    user.streakFreezesMonth = stored.streakFreezesMonth || null;
    user.streakFreezeHistory = stored.streakFreezeHistory || [];
    user.customDates = stored.customDates || [];
    user.expirationDates = stored.expirationDates || {};
    user.eligWizardResults = stored.eligWizardResults || {};
    user.preferredLang = stored.preferredLang || null;
    user.vbCategory = stored.vbCategory || null;
    user.vbCountry = stored.vbCountry || null;
    user.vbPriorityDate = stored.vbPriorityDate || null;
    lang = (stored.lang === 'es') ? 'es' : 'en';   // v1: EN/ES only (zh/vi users fall back to EN)
    if(stored.preferredLang) user.preferredLang = stored.preferredLang;
    syncLangButtons();
    renderHeroLang();
    updateGreeting();
    applyStaticTranslations();
    applyHeroName();
    camiBoot();
    Store.init();
    refreshStreakFreezes();
    maybeFreezeStreak();
    renderAll();
    setTimeout(maybeShowFirstRunDisclaimer, 600);
    setTimeout(checkTrialReminders, 1200);
  } else {
    syncLangButtons();
    renderHeroLang();
    updateGreeting();
    applyStaticTranslations();
    applyHeroName();
    camiBoot();
    Store.init();
    renderAll();
    renderOnboarding();
    go('onboarding');
  }

  // Re-check subscription/trial state when the app returns to the foreground:
  // native refreshes the RevenueCat entitlement; web re-runs the mock trial clock.
  // Also: if the calendar day changed while backgrounded, re-render so daily
  // surfaces (flashcards, streak, daily goal) roll over without a relaunch.
  var lastSeenDay = todayISO();
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState !== 'visible' || !user) return;
    if(Store.isNative() && Store.ready){ Store._refresh(); }
    else { checkTrialReminders(); }
    if(lastSeenDay !== todayISO()){
      lastSeenDay = todayISO();
      try { renderAll(); } catch(e){}
    }
  });
})();
