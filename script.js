/* ===== SeizGuard - ชักไม่ซ้ำ ===== */

// --- GOOGLE APPS SCRIPT CONFIGURATION ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_SGSO86onWlLGPzVFtY0X3UnTe2lIIgzleKq-p7d-mXQVCEHHL5BrcnDCYKeGlfB-/exec';

const COMMON_AEDS = [
  { name: 'Phenytoin', thai: 'เฟนิโทอิน' },
  { name: 'Carbamazepine', thai: 'คาร์บามาซีพีน' },
  { name: 'Valproate (Depakine)', thai: 'วัลโปรเอต (ดีปาคีน)' },
  { name: 'Levetiracetam (Keppra)', thai: 'ลีเวไทราซีแทม (เคปปรา)' },
  { name: 'Lamotrigine', thai: 'ลาโมไทรจีน' },
  { name: 'Topiramate', thai: 'โทพิราเมท' },
  { name: 'Oxcarbazepine', thai: 'ออกซ์คาร์บาซีพีน' },
  { name: 'Gabapentin', thai: 'กาบาเพนติน' },
  { name: 'Phenobarbital', thai: 'ฟีโนบาร์บิทอล' },
];

const TIME_PRESETS = [
  { label: 'เช้า', time: '08:00' },
  { label: 'กลางวัน', time: '12:00' },
  { label: 'เย็น', time: '18:00' },
  { label: 'ก่อนนอน', time: '21:00' },
];

const SEIZURE_SYMPTOMS = [
  { name: 'เกร็งทั้งตัว', weight: 2 },
  { name: 'กระตุกแขนขา', weight: 2 },
  { name: 'เหม่อนิ่ง', weight: 1 },
  { name: 'ตาค้าง/กลอกตา', weight: 1 },
  { name: 'หมดสติ', weight: 3 },
  { name: 'กัดลิ้น', weight: 3 },
  { name: 'อาเจียน', weight: 2 },
  { name: 'ปัสสาวะราด', weight: 2 },
  { name: 'สับสนหลังชัก', weight: 2 },
  { name: 'ปวดศีรษะ', weight: 1 },
  { name: 'อ่อนแรงแขน/ขา', weight: 2 },
  { name: 'พูดไม่ได้ชั่วคราว', weight: 2 },
  { name: 'หยุดหายใจ/หน้าเขียว', weight: 5 }
];

// อาการข้างเคียงทั่วไปของยากันชัก (ใช้เมื่อยังไม่ได้เลือกยา)
const SIDE_EFFECTS_LIST = [
  { name: 'เวียนศีรษะ', weight: 1 },
  { name: 'มึนงง', weight: 1 },
  { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1 },
  { name: 'คลื่นไส้', weight: 2 },
  { name: 'อาเจียน', weight: 3 },
  { name: 'ปวดศีรษะ', weight: 1 },
  { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2 },
  { name: 'เดินเซ/ทรงตัวไม่ดี', weight: 2 },
  { name: 'ผื่นผิวหนัง', weight: 4 },
  { name: 'ผื่นรุนแรง/ปากพอง (SJS)', weight: 5 },
  { name: 'ตัวเหลือง/ตาเหลือง', weight: 5 },
  { name: 'หงุดหงิด/อารมณ์แปรปรวน', weight: 2 },
  { name: 'นอนไม่หลับ', weight: 1 },
  { name: 'เบื่ออาหาร', weight: 1 },
  { name: 'น้ำหนักเพิ่ม', weight: 1 },
  { name: 'ผมร่วง', weight: 1 },
  { name: 'มือสั่น', weight: 2 },
  { name: 'ความจำ/สมาธิลดลง', weight: 2 }
];

// อาการข้างเคียงเฉพาะของยาแต่ละตัว
const AED_SIDE_EFFECTS = {
  'Phenytoin': [
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'บ่อย' },
    { name: 'เดินเซ/ทรงตัวไม่ดี (Ataxia)', weight: 2, freq: 'บ่อย' },
    { name: 'เหงือกบวม (Gingival Hyperplasia)', weight: 2, freq: 'บ่อย' },
    { name: 'ขนดก/ผมขึ้นมาก (Hirsutism)', weight: 1, freq: 'พบได้' },
    { name: 'สิว/ผิวหยาบ', weight: 1, freq: 'พบได้' },
    { name: 'คลื่นไส้/อาเจียน', weight: 2, freq: 'พบได้' },
    { name: 'ผื่นผิวหนัง', weight: 4, freq: 'พบได้' },
    { name: 'ผื่นรุนแรง/ปากพอง (SJS/TEN)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ตัวเหลือง/ตาเหลือง (ตับอักเสบ)', weight: 5, freq: 'หายาก' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'พบได้' },
  ],
  'Carbamazepine': [
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'บ่อย' },
    { name: 'เดินเซ/ทรงตัวไม่ดี (Ataxia)', weight: 2, freq: 'บ่อย' },
    { name: 'คลื่นไส้/อาเจียน', weight: 2, freq: 'บ่อย' },
    { name: 'โซเดียมในเลือดต่ำ (Hyponatremia)', weight: 3, freq: 'พบได้' },
    { name: 'ผื่นผิวหนัง', weight: 4, freq: 'พบได้' },
    { name: 'ผื่นรุนแรง/ปากพอง (SJS/TEN)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'เม็ดเลือดขาวต่ำ (Leukopenia)', weight: 4, freq: 'พบได้' },
    { name: 'ตัวเหลือง/ตาเหลือง (ตับอักเสบ)', weight: 5, freq: 'หายาก' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'พบได้' },
  ],
  'Valproate (Depakine)': [
    { name: 'คลื่นไส้/อาเจียน', weight: 2, freq: 'บ่อย' },
    { name: 'น้ำหนักเพิ่ม', weight: 1, freq: 'บ่อย' },
    { name: 'ผมร่วง', weight: 1, freq: 'บ่อย' },
    { name: 'มือสั่น (Tremor)', weight: 2, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'เวียนศีรษะ', weight: 1, freq: 'พบได้' },
    { name: 'ตับอักเสบ (Hepatotoxicity)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ตับอ่อนอักเสบ (Pancreatitis)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ตัวเหลือง/ตาเหลือง', weight: 5, freq: 'หายาก' },
    { name: 'เกล็ดเลือดต่ำ (Thrombocytopenia)', weight: 4, freq: 'พบได้' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'พบได้' },
  ],
  'Levetiracetam (Keppra)': [
    { name: 'หงุดหงิด/อารมณ์แปรปรวน', weight: 2, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'นอนไม่หลับ', weight: 1, freq: 'บ่อย' },
    { name: 'เวียนศีรษะ', weight: 1, freq: 'พบได้' },
    { name: 'ปวดศีรษะ', weight: 1, freq: 'พบได้' },
    { name: 'คลื่นไส้', weight: 2, freq: 'พบได้' },
    { name: 'ซึมเศร้า/วิตกกังวล', weight: 3, freq: 'พบได้' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'พบได้' },
    { name: 'ก้าวร้าว/พฤติกรรมเปลี่ยน', weight: 3, freq: 'พบได้ โดยเฉพาะในเด็ก' },
  ],
  'Lamotrigine': [
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ปวดศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'บ่อย' },
    { name: 'คลื่นไส้', weight: 2, freq: 'บ่อย' },
    { name: 'นอนไม่หลับ', weight: 1, freq: 'พบได้' },
    { name: 'ผื่นผิวหนัง', weight: 4, freq: 'พบได้ (พบบ่อยในเด็ก)' },
    { name: 'ผื่นรุนแรง/ปากพอง (SJS/TEN)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'พบได้' },
    { name: 'เดินเซ/ทรงตัวไม่ดี', weight: 2, freq: 'พบได้' },
  ],
  'Topiramate': [
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'บ่อย' },
    { name: 'เบื่ออาหาร/น้ำหนักลด', weight: 1, freq: 'บ่อย' },
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'ปวดศีรษะ', weight: 1, freq: 'พบได้' },
    { name: 'นิ่วในไต (Kidney Stones)', weight: 3, freq: 'พบได้' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'พบได้' },
    { name: 'ชาปลายมือปลายเท้า (Paresthesia)', weight: 2, freq: 'พบได้' },
    { name: 'กรดในเลือดสูง (Metabolic Acidosis)', weight: 4, freq: 'พบได้' },
  ],
  'Oxcarbazepine': [
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'บ่อย' },
    { name: 'เดินเซ/ทรงตัวไม่ดี', weight: 2, freq: 'บ่อย' },
    { name: 'คลื่นไส้/อาเจียน', weight: 2, freq: 'บ่อย' },
    { name: 'โซเดียมในเลือดต่ำ (Hyponatremia)', weight: 3, freq: 'พบได้บ่อยกว่า Carbamazepine' },
    { name: 'ผื่นผิวหนัง', weight: 4, freq: 'พบได้' },
    { name: 'ผื่นรุนแรง/ปากพอง (SJS/TEN)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ปวดศีรษะ', weight: 1, freq: 'พบได้' },
  ],
  'Gabapentin': [
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อย' },
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'เดินเซ/ทรงตัวไม่ดี (Ataxia)', weight: 2, freq: 'บ่อย' },
    { name: 'น้ำหนักเพิ่ม', weight: 1, freq: 'บ่อย' },
    { name: 'ตาพร่า/เห็นภาพซ้อน', weight: 2, freq: 'พบได้' },
    { name: 'คลื่นไส้/อาเจียน', weight: 2, freq: 'พบได้' },
    { name: 'บวมน้ำ (Peripheral Edema)', weight: 2, freq: 'พบได้' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'พบได้' },
  ],
  'Phenobarbital': [
    { name: 'ง่วงนอน/อ่อนเพลีย', weight: 1, freq: 'บ่อยมาก' },
    { name: 'เวียนศีรษะ', weight: 1, freq: 'บ่อย' },
    { name: 'เดินเซ/ทรงตัวไม่ดี', weight: 2, freq: 'บ่อย' },
    { name: 'ความจำ/สมาธิลดลง', weight: 2, freq: 'บ่อย' },
    { name: 'ซึมเศร้า', weight: 3, freq: 'พบได้' },
    { name: 'หงุดหงิด/อารมณ์แปรปรวน', weight: 2, freq: 'พบได้ (โดยเฉพาะในเด็ก)' },
    { name: 'ผื่นผิวหนัง', weight: 4, freq: 'พบได้' },
    { name: 'ผื่นรุนแรง/ปากพอง (SJS/TEN)', weight: 5, freq: 'หายาก แต่อันตราย' },
    { name: 'ตับอักเสบ', weight: 5, freq: 'หายาก' },
    { name: 'การพึ่งพายา (Dependence)', weight: 3, freq: 'พบได้เมื่อใช้นาน' },
  ],
};

const SEVERITY_DESCRIPTIONS = {
  1: {
    label: 'เล็กน้อยมาก',
    color: 'var(--success)',
    desc: 'อาการเพียงเล็กน้อย ไม่กระทบกิจวัตรประจำวัน เช่น รู้สึกชาเล็กน้อยชั่วคราว เหม่อนิ่งไม่กี่วินาที หรือผลข้างเคียงยาที่แทบไม่รู้สึก',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 1; ILAE Seizure Severity Scale'
  },
  2: {
    label: 'เล็กน้อย',
    color: 'var(--success)',
    desc: 'อาการเล็กน้อย รบกวนเล็กน้อยแต่ยังทำกิจกรรมได้ตามปกติ เช่น กระตุกเฉพาะที่สั้นๆ มึนงงเล็กน้อย หรือรู้สึกง่วงเป็นบางเวลา',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 1; Liverpool Seizure Severity Scale'
  },
  3: {
    label: 'ปานกลาง',
    color: 'var(--warning)',
    desc: 'อาการปานกลาง กระทบการใช้ชีวิตบ้าง ต้องหยุดพักกิจกรรม เช่น อาการชักที่มีเกร็ง/กระตุกชัดเจนแต่ไม่นาน คลื่นไส้ต้องนอนพัก หรือเวียนศีรษะจนเดินไม่ถนัด',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 2; Chalfont Seizure Severity Scale'
  },
  4: {
    label: 'รุนแรง',
    color: 'var(--danger)',
    desc: 'อาการรุนแรง กระทบการใช้ชีวิตมาก ต้องการความช่วยเหลือ เช่น ชักนานกว่า 2-3 นาที สับสนหลังชักนาน หมดสติ ผลข้างเคียงรุนแรง (ผื่นลามทั้งตัว ตาเหลือง) ต้องไปพบแพทย์',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 3; ILAE Definition of Status Epilepticus'
  },
  5: {
    label: 'รุนแรงมาก / ฉุกเฉิน',
    color: 'var(--danger)',
    desc: 'อาการรุนแรงมาก เป็นอันตรายต่อชีวิต ต้องเรียกรถฉุกเฉินทันที เช่น ชักนานเกิน 5 นาที (Status epilepticus) ชักซ้ำไม่หยุด หยุดหายใจ มีอาการ Stevens-Johnson Syndrome',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 4; ILAE Guidelines for Emergency Management'
  }
};

const SIDE_EFFECT_SEVERITY_DESCRIPTIONS = {
  1: {
    label: 'เล็กน้อย',
    color: 'var(--success)',
    desc: 'อาการข้างเคียงเล็กน้อย ไม่กระทบกิจวัตรประจำวัน เช่น ง่วงนอนเล็กน้อย เวียนศีรษะชั่วคราว หรือเบื่ออาหารเล็กน้อย สังเกตอาการต่อไป แจ้งแพทย์ในนัดถัดไป',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 1; Perucca P, Gilliam FG. Lancet Neurol. 2012'
  },
  2: {
    label: 'ปานกลาง',
    color: 'var(--warning)',
    desc: 'อาการรบกวนการใช้ชีวิต เช่น เวียนศีรษะจนเดินไม่ถนัด คลื่นไส้ต้องนอนพัก หรืออารมณ์แปรปรวนจนกระทบคนรอบข้าง ควรปรึกษาแพทย์เพื่อปรับขนาดยาหรือเปลี่ยนยา',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 2; Perucca P, Gilliam FG. Lancet Neurol. 2012'
  },
  3: {
    label: 'รุนแรงปานกลาง',
    color: 'var(--warning)',
    desc: 'อาการรุนแรงปานกลาง กระทบการใช้ชีวิตมาก เช่น ซึมเศร้า อารมณ์แปรปรวนรุนแรง นิ่วในไต หรือโซเดียมในเลือดต่ำ ควรพบแพทย์โดยเร็ว',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 3; Perucca P, Gilliam FG. Lancet Neurol. 2012'
  },
  4: {
    label: 'รุนแรง / ต้องพบแพทย์ทันที',
    color: 'var(--danger)',
    desc: 'อาการรุนแรง ต้องพบแพทย์ทันที เช่น ผื่นลามทั้งตัว เม็ดเลือดขาวต่ำ เกล็ดเลือดต่ำ หรือกรดในเลือดสูง ห้ามหยุดยาเองโดยไม่ปรึกษาแพทย์',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 3; Perucca P, Gilliam FG. Lancet Neurol. 2012'
  },
  5: {
    label: 'อันตรายถึงชีวิต / ฉุกเฉิน',
    color: 'var(--danger)',
    desc: 'อาการรุนแรงมาก เป็นอันตรายต่อชีวิต เช่น Stevens-Johnson Syndrome (ผื่นพอง ปากเปื่อย), ตับอักเสบรุนแรง (ตัวเหลืองมาก), หรือคิดสั้น/พยายามฆ่าตัวตาย ต้องไปห้องฉุกเฉินทันที',
    ref: 'อ้างอิง: CTCAE v5.0 Grade 4; Perucca P, Gilliam FG. Lancet Neurol. 2012'
  }
};

/* ===== STATE ===== */
let currentUser = null;
let selectedTimes = [];
let editingProfile = false;
let missedDoseFreq = 1;
let missedDoseStep = 'frequency';

/* ===== CORE FUNCTIONS ===== */
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function getData(key) { return JSON.parse(localStorage.getItem(`seizguard_${currentUser}_${key}`) || '[]'); }
function setData(key, val) { localStorage.setItem(`seizguard_${currentUser}_${key}`, JSON.stringify(val)); }
function getObj(key) { return JSON.parse(localStorage.getItem(`seizguard_${currentUser}_${key}`) || '{}'); }
function setObj(key, val) { localStorage.setItem(`seizguard_${currentUser}_${key}`, JSON.stringify(val)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('active');
  setTimeout(() => t.classList.remove('active'), 3000);
}

// --- SYNC TO GOOGLE APPS SCRIPT ---
async function syncToSheet(action, data) {
  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  const hn = users[currentUser]?.hn || '';
  const payload = {
    action: action,
    username: currentUser,
    hn: hn,
    timestamp: new Date().toISOString(),
    ...data
  };
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Synced to sheet:', action);
  } catch (e) {
    console.error('Sync failed:', e);
  }
}

/* ===== AUTH ===== */
async function handleLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const h = document.getElementById('loginHN').value.trim();
  if (!u || !h) { showToast('กรุณากรอกข้อมูลให้ครบ'); return; }

  // 1. ตรวจสอบใน Local ก่อน
  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  if (users[u] && users[u].hn === h) {
    currentUser = u;
    localStorage.setItem('seizguard_currentUser', u);
    enterApp();
    return;
  }

  // 2. ถ้าไม่เจอใน Local ให้ลองตรวจสอบกับ Google Sheets (เพื่อให้ Login ข้ามเครื่องได้)
  showToast('กำลังตรวจสอบข้อมูล...');
  try {
    const response = await fetch(`${SCRIPT_URL}?action=checkUser&username=${encodeURIComponent(u)}&hn=${encodeURIComponent(h)}`);
    const result = await response.json();
    if (result.exists) {
      users[u] = { hn: h };
      localStorage.setItem('seizguard_users', JSON.stringify(users));
      currentUser = u;
      localStorage.setItem('seizguard_currentUser', u);
      enterApp();
    } else {
      showToast('ไม่พบข้อมูลผู้ใช้ หรือ HN ไม่ถูกต้อง');
    }
  } catch (e) {
    showToast('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
  }
}

function handleRegister() {
  const u = document.getElementById('regUser').value.trim();
  const h = document.getElementById('regHN').value.trim();
  if (!u || !h) { showToast('กรุณากรอกข้อมูลให้ครบ'); return; }
  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  if (users[u]) { showToast('Username นี้มีในระบบแล้ว'); return; }
  
  users[u] = { hn: h };
  localStorage.setItem('seizguard_users', JSON.stringify(users));
  
  // ส่งข้อมูลผู้ใช้ใหม่ไป Google Sheets
  syncToSheet('register', { hn: h });
  
  showToast('ลงทะเบียนสำเร็จ');
  toggleAuthMode();
}

function toggleAuthMode() {
  const isLogin = document.getElementById('loginForm').style.display !== 'none';
  document.getElementById('loginForm').style.display = isLogin ? 'none' : 'block';
  document.getElementById('regForm').style.display = isLogin ? 'block' : 'none';
  document.getElementById('authTitle').textContent = isLogin ? 'ลงทะเบียนใหม่' : 'เข้าสู่ระบบ';
  document.getElementById('authToggleText').innerHTML = isLogin 
    ? 'มีบัญชีอยู่แล้ว? <a href="#" onclick="toggleAuthMode()">เข้าสู่ระบบ</a>' 
    : 'ยังไม่มีบัญชี? <a href="#" onclick="toggleAuthMode()">ลงทะเบียนที่นี่</a>';
}

function enterApp() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('appScreen').classList.add('active');
  showTab('home');
}

function handleLogout() {
  if (confirm('ต้องการออกจากระบบหรือไม่?')) {
    localStorage.removeItem('seizguard_currentUser');
    currentUser = null;
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
  }
}

/* ===== NAVIGATION ===== */
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
  const nav = document.querySelector(`.nav-item[onclick*="'${tabId}'"]`);
  if (nav) nav.classList.add('active');

  if (tabId === 'home') renderHome();
  if (tabId === 'assess') renderAssess();
  if (tabId === 'learn') renderLearnTopics();
  if (tabId === 'profile') renderProfile();
  if (tabId === 'missedDose') renderMissedDose();
  window.scrollTo(0,0);
}

/* ===== HOME / MEDICATION ===== */
function renderHome() {
  const meds = getData('medications');
  const container = document.getElementById('medList');
  if (meds.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-pills"></i><p>ยังไม่มีรายการยา<br>กดปุ่ม + เพื่อเพิ่มยาของคุณ</p></div>';
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const logs = getData('medLogs');

  container.innerHTML = meds.map(med => {
    const thaiName = getThaiName(med.name);
    return `
      <div class="med-card" onclick="showMedDetail('${med.id}')">
        <div class="med-info">
          <div class="med-name">${med.name}</div>
          ${thaiName ? `<div class="med-thai">${thaiName}</div>` : ''}
          <div class="med-dosage"><i class="fas fa-prescription-bottle-medical"></i> ${med.dosage}</div>
          <div class="med-schedule"><i class="fas fa-clock"></i> ${med.times.join(', ')}</div>
        </div>
        <div class="med-status-grid" onclick="event.stopPropagation()">
          ${med.times.map(time => {
            const log = logs.find(l => l.medicationId === med.id && l.date === todayStr && l.scheduledTime === time);
            const isTaken = log && log.status === 'taken';
            return `<div class="status-btn ${isTaken ? 'taken' : ''}" onclick="toggleMedStatus('${med.id}', '${time}')">
              <div class="status-time">${time}</div>
              <div class="status-icon"><i class="fas ${isTaken ? 'fa-check' : 'fa-check'}"></i></div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function getThaiName(name) {
  const found = COMMON_AEDS.find(a => a.name.toLowerCase() === name.toLowerCase());
  return found ? found.thai : '';
}

function toggleMedStatus(medId, time) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  let logs = getData('medLogs');
  const idx = logs.findIndex(l => l.medicationId === medId && l.date === todayStr && l.scheduledTime === time);

  if (idx >= 0) {
    logs.splice(idx, 1);
    showToast('ยกเลิกการบันทึก');
  } else {
    const logEntry = { medicationId: medId, date: todayStr, scheduledTime: time, actualTime: timeStr, status: 'taken' };
    logs.push(logEntry);
    showToast('บันทึกการกินยาแล้ว');
    
    // ส่งข้อมูลไป Google Sheets
    const meds = getData('medications');
    const med = meds.find(m => m.id === medId);
    syncToSheet('logMedication', {
      date: todayStr,
      medName: med ? med.name : 'Unknown',
      scheduledTime: time,
      actualTime: timeStr,
      status: 'กินแล้ว'
    });
  }
  setData('medLogs', logs);
  renderHome();
}

/* ===== ADD MED MODAL ===== */
function initAddMedModal() {
  const select = document.getElementById('medNameSelect');
  select.innerHTML = '<option value="">-- เลือกยา หรือพิมพ์ชื่อเองด้านล่าง --</option>' + 
    COMMON_AEDS.map(a => `<option value="${a.name}">${a.name} (${a.thai})</option>`).join('');
  
  selectedTimes = ['08:00'];
  renderTimeOptions();
}

function onMedSelectChange() {
  const select = document.getElementById('medNameSelect');
  const input = document.getElementById('medName');
  if (select.value) input.value = select.value;
}

function renderTimeOptions() {
  const container = document.getElementById('timeOptions');
  container.innerHTML = TIME_PRESETS.map(p => {
    const isActive = selectedTimes.includes(p.time);
    return `<div class="time-chip ${isActive ? 'active' : ''}" onclick="toggleTime('${p.time}')">${p.label} (${p.time})</div>`;
  }).join('');
}

function toggleTime(time) {
  if (selectedTimes.includes(time)) selectedTimes = selectedTimes.filter(t => t !== time);
  else selectedTimes.push(time);
  selectedTimes.sort();
  renderTimeOptions();
}

function saveNewMedication() {
  const name = document.getElementById('medName').value.trim();
  const dosage = document.getElementById('medDosage').value.trim() || 'ตามแพทย์สั่ง';
  const pillCount = parseInt(document.getElementById('medPillCount').value) || 0;
  const notes = document.getElementById('medNotes').value.trim();
  if (!name) { showToast('กรุณากรอกชื่อยา'); return; }
  if (selectedTimes.length === 0) { showToast('กรุณาเลือกเวลากินยาอย่างน้อย 1 เวลา'); return; }
  const meds = getData('medications');
  meds.push({ id: genId(), name, dosage, frequency: selectedTimes.length, times: selectedTimes, pillCount, notes });
  setData('medications', meds);
  closeModal('addMedModal');
  renderHome();
  showToast('เพิ่มรายการยาแล้ว');
}

/* ===== MED DETAIL ===== */
function showMedDetail(medId) {
  const meds = getData('medications');
  const med = meds.find(m => m.id === medId);
  if (!med) return;

  const thaiName = getThaiName(med.name);
  document.getElementById('medDetailTitle').textContent = med.name;
  document.getElementById('deleteMedBtn').onclick = () => {
    if (confirm('ต้องการลบ ' + med.name + ' หรือไม่?')) {
      const ms = getData('medications').filter(m => m.id !== medId);
      setData('medications', ms);
      showTab('home');
      showToast('ลบรายการยาแล้ว');
    }
  };

  const allLogs = getData('medLogs').filter(l => l.medicationId === medId).sort((a,b) => b.date.localeCompare(a.date)).slice(0,14);
  const takenCount = allLogs.filter(l => l.status === 'taken').length;
  const totalCount = allLogs.length;
  const adherencePct = totalCount > 0 ? Math.round(takenCount / totalCount * 100) : 0;

  document.getElementById('medDetailContent').innerHTML = `
    <div class="detail-card">
      <div class="info-grid">
        <div class="info-item"><div class="info-label">ชื่อยา</div><div class="info-value">${med.name}</div>${thaiName ? `<div style="font-size:13px;color:var(--text2);margin-top:2px">${thaiName}</div>` : ''}</div>
        <div class="info-item"><div class="info-label">ขนาดยา</div><div class="info-value">${med.dosage}</div></div>
      </div>
      <div class="info-grid" style="margin-top:12px">
        <div class="info-item"><div class="info-label">จำนวนครั้ง/วัน</div><div class="info-value">${med.frequency} ครั้ง</div></div>
        ${med.pillCount > 0 ? `<div class="info-item"><div class="info-label">จำนวนเม็ดที่ได้รับ</div><div class="info-value">${med.pillCount} เม็ด</div></div>` : ''}
      </div>
    </div>
    <div class="detail-card">
      <h4>ตารางเวลากินยา</h4>
      ${med.times.map(t => `<div class="time-row"><div class="time-dot"><i class="fas fa-clock"></i></div><div class="time-text">${t}</div></div>`).join('')}
    </div>
    <div class="detail-card">
      <h4>สถิติการกินยา (14 วันล่าสุด)</h4>
      <div class="stats-row">
        <div class="stat-item"><div class="stat-num" style="color:var(--success)">${takenCount}</div><div class="stat-label">กินแล้ว</div></div>
        <div class="stat-item"><div class="stat-num" style="color:var(--danger)">${totalCount - takenCount}</div><div class="stat-label">ขาด/รอ</div></div>
        <div class="stat-item"><div class="stat-num" style="color:var(--primary)">${adherencePct}%</div><div class="stat-label">Adherence</div></div>
      </div>
      <div class="adherence-bar"><div class="adherence-fill" style="width:${adherencePct}%"></div></div>
    </div>
    <div class="detail-card">
      <h4>ประวัติล่าสุด</h4>
      ${allLogs.length === 0 ? '<p style="text-align:center;color:var(--text3);padding:20px">ยังไม่มีประวัติ</p>' : ''}
      ${allLogs.slice(0,7).map(l => {
        const c = l.status === 'taken' ? 'var(--success)' : l.status === 'missed' ? 'var(--danger)' : 'var(--warning)';
        const s = l.status === 'taken' ? 'กินแล้ว' : l.status === 'missed' ? 'ขาด' : 'รอ';
        return `<div class="log-row"><div class="log-dot" style="background:${c}"></div><div class="log-row-date">${l.date}</div><div class="log-row-time">${l.scheduledTime}</div><div class="log-row-status" style="color:${c}">${s}</div></div>`;
      }).join('')}
    </div>
    ${med.notes ? `<div class="detail-card"><h4>หมายเหตุ</h4><p style="font-size:14px;color:var(--text2);line-height:1.6">${med.notes}</p></div>` : ''}`;

  showTab('medDetail');
}

/* ===== ASSESS / LOGS ===== */
function renderAssess() {
  const seizures = getData('seizures').sort((a,b) => b.dateTime.localeCompare(a.dateTime));
  const sideEffects = getData('sideEffects').sort((a,b) => b.dateTime.localeCompare(a.dateTime));

  document.getElementById('seizureHistory').innerHTML = seizures.length === 0 
    ? '<p class="empty-text">ไม่มีประวัติการชัก</p>'
    : seizures.slice(0, 5).map(s => {
        const sev = SEVERITY_DESCRIPTIONS[s.severity];
        return `
          <div class="history-item">
            <div class="history-main">
              <div class="history-date">${new Date(s.dateTime).toLocaleString('th-TH')}</div>
              <div class="history-meta">ระยะเวลา: ${s.duration} นาที | ความรุนแรง: <span style="color:${sev.color}">${sev.label}</span></div>
              <div class="history-tags">${s.symptoms.map(sym => `<span class="history-tag">${sym}</span>`).join('')}</div>
            </div>
            <button class="delete-log-btn" onclick="deleteLog('seizures', '${s.id}')"><i class="fas fa-times"></i></button>
          </div>`;
      }).join('');

  document.getElementById('sideEffectHistory').innerHTML = sideEffects.length === 0
    ? '<p class="empty-text">ไม่มีประวัติผลข้างเคียง</p>'
    : sideEffects.slice(0, 5).map(s => {
        const sev = SIDE_EFFECT_SEVERITY_DESCRIPTIONS[s.severity];
        return `
          <div class="history-item">
            <div class="history-main">
              <div class="history-date">${new Date(s.dateTime).toLocaleString('th-TH')}</div>
              <div class="history-meta">ยาที่สงสัย: ${s.medName} | ความรุนแรง: <span style="color:${sev.color}">${sev.label}</span></div>
              <div class="history-tags">${s.symptoms.map(sym => `<span class="history-tag">${sym}</span>`).join('')}</div>
            </div>
            <button class="delete-log-btn" onclick="deleteLog('sideEffects', '${s.id}')"><i class="fas fa-times"></i></button>
          </div>`;
      }).join('');
}

function deleteLog(type, id) {
  if (confirm('ต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
    let logs = getData(type);
    logs = logs.filter(l => l.id !== id);
    setData(type, logs);
    renderAssess();
    showToast('ลบข้อมูลแล้ว');
  }
}

/* ===== SEIZURE MODAL ===== */
function initSeizureModal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('seizureDateTime').value = now.toISOString().slice(0, 16);
  
  const container = document.getElementById('seizureSymptomsList');
  container.innerHTML = SEIZURE_SYMPTOMS.map(s => 
    `<div class="check-item" onclick="toggleCheck(this)">
      <input type="checkbox" value="${s.name}" data-weight="${s.weight}">
      <span>${s.name}</span>
    </div>`
  ).join('');
}

function toggleCheck(el) {
  const cb = el.querySelector('input');
  cb.checked = !cb.checked;
  el.classList.toggle('active', cb.checked);
}

function saveSeizure() {
  const dateTime = document.getElementById('seizureDateTime').value;
  const duration = parseFloat(document.getElementById('seizureDuration').value) || 0;
  const symptoms = Array.from(document.querySelectorAll('#seizureSymptomsList input:checked')).map(i => i.value);
  const notes = document.getElementById('seizureNotes').value.trim();

  if (!dateTime) { showToast('กรุณาระบุวันเวลา'); return; }
  if (symptoms.length === 0) { showToast('กรุณาเลือกอาการอย่างน้อย 1 อย่าง'); return; }

  // คำนวณความรุนแรง (Logic เดิม)
  let score = 0;
  document.querySelectorAll('#seizureSymptomsList input:checked').forEach(i => score += parseInt(i.dataset.weight));
  if (duration > 5) score += 5; else if (duration > 2) score += 3; else score += 1;
  
  let severity = 1;
  if (score >= 10 || duration > 5) severity = 5;
  else if (score >= 7) severity = 4;
  else if (score >= 4) severity = 3;
  else if (score >= 2) severity = 2;

  const logs = getData('seizures');
  const entry = { id: genId(), dateTime, duration, symptoms, severity, notes };
  logs.push(entry);
  setData('seizures', logs);
  
  // ส่งข้อมูลไป Google Sheets
  syncToSheet('logSeizure', {
    dateTime: dateTime,
    duration: duration,
    symptoms: symptoms.join(', '),
    severity: SEVERITY_DESCRIPTIONS[severity].label,
    notes: notes
  });

  closeModal('seizureModal');
  renderAssess();
  showSeverityResult(severity, SEVERITY_DESCRIPTIONS);
}

/* ===== SIDE EFFECT MODAL ===== */
function initSideEffectModal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('sideEffectDateTime').value = now.toISOString().slice(0, 16);
  
  const meds = getData('medications');
  const select = document.getElementById('sideEffectMed');
  select.innerHTML = '<option value="ไม่ระบุ / อื่นๆ">ไม่ระบุ / อื่นๆ</option>' + 
    meds.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
  
  updateSideEffectSymptoms();
}

function updateSideEffectSymptoms() {
  const medName = document.getElementById('sideEffectMed').value;
  const container = document.getElementById('sideEffectSymptomsList');
  const list = AED_SIDE_EFFECTS[medName] || SIDE_EFFECTS_LIST;
  
  container.innerHTML = list.map(s => 
    `<div class="check-item" onclick="toggleCheck(this)">
      <input type="checkbox" value="${s.name}" data-weight="${s.weight}">
      <span>${s.name} ${s.freq ? `<small>(${s.freq})</small>` : ''}</span>
    </div>`
  ).join('');
}

function saveSideEffect() {
  const dateTime = document.getElementById('sideEffectDateTime').value;
  const medName = document.getElementById('sideEffectMed').value;
  const symptoms = Array.from(document.querySelectorAll('#sideEffectSymptomsList input:checked')).map(i => i.value);
  const notes = document.getElementById('sideEffectNotes').value.trim();

  if (!dateTime) { showToast('กรุณาระบุวันเวลา'); return; }
  if (symptoms.length === 0) { showToast('กรุณาเลือกอาการอย่างน้อย 1 อย่าง'); return; }

  let maxWeight = 0;
  document.querySelectorAll('#sideEffectSymptomsList input:checked').forEach(i => {
    maxWeight = Math.max(maxWeight, parseInt(i.dataset.weight));
  });
  const severity = maxWeight;

  const logs = getData('sideEffects');
  const entry = { id: genId(), dateTime, medName, symptoms, severity, notes };
  logs.push(entry);
  setData('sideEffects', logs);

  // ส่งข้อมูลไป Google Sheets
  syncToSheet('logSideEffect', {
    dateTime: dateTime,
    medName: medName,
    symptoms: symptoms.join(', '),
    severity: SIDE_EFFECT_SEVERITY_DESCRIPTIONS[severity].label,
    notes: notes
  });

  closeModal('sideEffectModal');
  renderAssess();
  showSeverityResult(severity, SIDE_EFFECT_SEVERITY_DESCRIPTIONS);
}

function showSeverityResult(level, descSource) {
  const data = descSource[level];
  document.getElementById('resultTitle').textContent = data.label;
  document.getElementById('resultTitle').style.color = data.color;
  document.getElementById('resultDesc').textContent = data.desc;
  document.getElementById('resultRef').textContent = data.ref;
  showModal('severityResultModal');
}

/* ===== LEARN ===== */
const LEARN_TOPICS = [
  { id:'what-is-seizure', icon:'fa-bolt', color:'var(--accent)', bg:'var(--accent-soft)', title:'อาการชักคืออะไร', sub:'ความรู้พื้นฐาน, ชนิดของอาการชัก, สาเหตุ' },
  { id:'why-aeds', icon:'fa-pills', color:'var(--primary)', bg:'#E0F4F4', title:'ทำไมต้องกินยากันชัก', sub:'เหตุผล, ประโยชน์, กลุ่มผู้ป่วยที่ต้องใช้ยา' },
  { id:'tbi-criteria', icon:'fa-shield-halved', color:'#6366F1', bg:'#EEF2FF', title:'เกณฑ์การให้ยาหลัง Head Injury', sub:'Criteria, งานวิจัย, แนวทางปฏิบัติ' },
  { id:'side-effects', icon:'fa-exclamation-triangle', color:'var(--warning)', bg:'var(--warning-light)', title:'ผลข้างเคียงยากันชัก', sub:'อาการที่ควรสังเกต, เมื่อไหร่ควรพบแพทย์' },
  { id:'missed-dose-guide', icon:'fa-circle-question', color:'#EC4899', bg:'#FDF2F8', title:'ถ้าลืมกินยากันชักควรทำอย่างไร', sub:'คำแนะนำเมื่อลืมกินยา, หลักปฏิบัติ' },
  { id:'seizure-first-aid', icon:'fa-heart-pulse', color:'var(--danger)', bg:'var(--danger-light)', title:'การปฐมพยาบาลเมื่อมีอาการชัก', sub:'สิ่งที่ควรทำ/ไม่ควรทำ สำหรับผู้ดูแล' },
  { id:'self-observation', icon:'fa-eye', color:'#0EA5E9', bg:'#F0F9FF', title:'การสังเกตอาการตนเอง', sub:'สัญญาณเตือนก่อนชัก, การบันทึกอาการ' },
  { id:'research-evidence', icon:'fa-file-lines', color:'#8B5CF6', bg:'#F5F3FF', title:'หลักฐานเชิงประจักษ์และงานวิจัย', sub:'Systematic reviews, Practice guidelines' },
];

function renderLearnTopics() {
  document.getElementById('learnTopicsList').innerHTML = LEARN_TOPICS.map(t =>
    `<div class="topic-card" onclick="showLearnDetail('${t.id}')">
      <div class="topic-icon" style="background:${t.bg};color:${t.color}"><i class="fas ${t.icon}"></i></div>
      <div class="topic-info"><div class="topic-title">${t.title}</div><div class="topic-sub">${t.sub}</div></div>
      <i class="fas fa-chevron-right" style="color:var(--text3)"></i>
    </div>`
  ).join('') + `<div class="disclaimer-card"><i class="fas fa-info-circle"></i><p>ข้อมูลในหน้านี้จัดทำเพื่อการให้ความรู้ ไม่ใช่การวินิจฉัยหรือรักษาโรค กรุณาปรึกษาแพทย์สำหรับข้อมูลเฉพาะบุคคล</p></div>`;
}

const LEARN_CONTENT = {
  'what-is-seizure': { title:'อาการชักคืออะไร', sections:[
    { title:'อาการชักคืออะไร?', body:'อาการชัก (Seizure) คือภาวะที่เกิดจากกระแสไฟฟ้าในสมองทำงานผิดปกติอย่างฉับพลัน ส่งผลให้เกิดอาการต่างๆ เช่น กล้ามเนื้อเกร็งกระตุก หมดสติ ตาค้าง หรือพฤติกรรมผิดปกติชั่วคราว' },
    { title:'ชนิดของอาการชัก', body:'1. Generalized seizures: อาการชักทั้งตัว รวมถึง Tonic-clonic (เกร็งกระตุก), Absence (เหม่อ), Myoclonic (กระตุกสั้นๆ)\n\n2. Focal seizures: อาการชักเฉพาะที่ อาจมีหรือไม่มีการเปลี่ยนแปลงระดับความรู้สึกตัว\n\n3. Unknown onset: อาการชักที่ไม่ทราบจุดเริ่มต้น', ref:'Fisher RS, et al. ILAE official report: a practical clinical definition of epilepsy. Epilepsia. 2014;55(4):475-482.' },
    { title:'โรคลมชัก (Epilepsy) คืออะไร?', body:'โรคลมชักคือภาวะที่มีอาการชักซ้ำตั้งแต่ 2 ครั้งขึ้นไป โดยไม่มีสาเหตุกระตุ้นเฉพาะเจาะจง (unprovoked seizures) หรือมีอาการชักครั้งเดียวแต่มีความเสี่ยงสูงที่จะเกิดซ้ำ', ref:'International League Against Epilepsy (ILAE) Classification, 2017.' },
  ]},
  'why-aeds': { title:'ทำไมต้องกินยากันชัก', sections:[
    { title:'เหตุผลที่ต้องกินยากันชัก', body:'ยากันชัก (Antiepileptic Drugs: AEDs) ใช้เพื่อ:\n\n1. รักษาโรคลมชัก (Epilepsy) ป้องกันอาการชักซ้ำ\n2. ป้องกันอาการชักเฉียบพลันหลังบาดเจ็บที่ศีรษะ (Head injury/TBI) ในผู้ที่มีความเสี่ยงสูง\n3. ป้องกันอาการชักหลังผ่าตัดสมอง' },
    { title:'ประโยชน์ของการกินยาสม่ำเสมอ', body:'- ลดความถี่ของอาการชัก\n- ป้องกันภาวะชักต่อเนื่อง (Status epilepticus) ซึ่งเป็นอันตรายถึงชีวิต\n- ช่วยให้ดำเนินชีวิตประจำวันได้ปกติ\n- ลดความเสี่ยงการบาดเจ็บจากอาการชัก\n- ป้องกันความเสียหายต่อสมองจากการชักซ้ำ', ref:'Kwan P, et al. Early identification of refractory epilepsy. N Engl J Med. 2000;342(5):314-319.' },
    { title:'กลุ่มผู้ป่วยที่ใช้ยากันชัก', body:'- ผู้ที่ได้รับการวินิจฉัยว่าเป็นโรคลมชัก\n- ผู้ป่วย TBI/ภาวะสมองบาดเจ็บที่มีความเสี่ยงสูง\n- ผู้ป่วยหลังผ่าตัดสมอง\n- ผู้ป่วยที่อยู่ในระยะฟื้นฟูหลังอุบัติเหตุทางสมอง' },
  ]},
  'tbi-criteria': { title:'เกณฑ์การให้ยาหลัง Head Injury', sections:[
    { title:'เกณฑ์ความเสี่ยงสูงในการเกิดชักหลัง TBI', body:'ผู้ป่วยที่มีปัจจัยเสี่ยงต่อไปนี้ ควรได้รับยากันชักเพื่อป้องกัน:\n\n- Intracranial hemorrhage (เลือดออกในสมอง)\n- Depressed skull fracture (กะโหลกยุบ)\n- Penetrating brain injury (บาดเจ็บแบบทะลุ)\n- Prolonged loss of consciousness > 24 ชั่วโมง\n- GCS < 10\n- อายุ > 65 ปี\n- ประวัติเป็นโรคลมชักมาก่อน', ref:'Temkin NR, et al. A randomized, double-blind study of phenytoin for the prevention of post-traumatic seizures. N Engl J Med. 1990;323(8):497-502.' },
    { title:'Early vs Late Post-traumatic Seizures', body:'Early seizures: เกิดภายใน 7 วันหลังบาดเจ็บ\n- ยากันชักมีประสิทธิภาพในการป้องกัน early seizures\n- ลดการเกิดชักได้อย่างมีนัยสำคัญทางสถิติ\n\nLate seizures: เกิดหลัง 7 วัน\n- ยากันชักไม่ได้ลดการเกิด late seizures อย่างมีนัยสำคัญ\n- แนะนำให้ใช้ยาป้องกันเป็นเวลา 7 วัน (ในกลุ่มเสี่ยงสูง)', ref:'Chang BS, Lowenstein DH. Practice parameter: antiepileptic drug prophylaxis in severe traumatic brain injury. Neurology. 2003;60(1):10-16. (AAN Practice Parameter)' },
    { title:'แนวทางจาก Cochrane Systematic Review', body:'"การให้ยากันชักหลัง traumatic brain injury ช่วยลดการเกิดอาการชักภายใน 7 วันแรกในผู้ที่มีความเสี่ยงสูง แต่ไม่ลดการชักในระยะยาว"\n\nLevetiracetam และ Phenytoin มีประสิทธิภาพเทียบเคียงกันในการป้องกัน early seizures หลัง TBI', ref:'Thompson K, et al. Pharmacological treatments for preventing epilepsy following traumatic head injury. Cochrane Database Syst Rev. 2015.\n\nInaba K, et al. A prospective multicenter comparison of levetiracetam versus phenytoin for early posttraumatic seizure prophylaxis. J Trauma Acute Care Surg. 2013;74(3):766-771.' },
  ]},
  'side-effects': { title:'ผลข้างเคียงยากันชัก', sections:[
    { title:'ผลข้างเคียงที่พบได้บ่อย (ทุกยา)', body:'ยากันชักทุกตัวอาจทำให้เกิด:\n\n- เวียนศีรษะ / มึนงง\n- ง่วงนอน / อ่อนเพลีย\n- คลื่นไส้ / อาเจียน\n- ปวดศีรษะ\n- ตาพร่า / เห็นภาพซ้อน\n- เดินเซ / ทรงตัวไม่ดี', ref:'Perucca P, Gilliam FG. Adverse effects of antiepileptic drugs. Lancet Neurol. 2012;11(9):792-802.' },
    { title:'ผลข้างเคียงเฉพาะยาแต่ละตัว', body:'Phenytoin (เฟนิโทอิน):\n• เหงือกบวม (Gingival Hyperplasia) — พบบ่อย\n• ขนดก / ผมขึ้นมาก (Hirsutism) — พบได้\n• เดินเซ / ทรงตัวไม่ดี (Ataxia) — พบบ่อย\n• ตาพร่า / เห็นภาพซ้อน — พบบ่อย\n• ผื่นผิวหนัง / SJS (หายาก แต่อันตราย)\n\nCarbamazepine (คาร์บามาซีพีน):\n• โซเดียมในเลือดต่ำ (Hyponatremia) — พบได้\n• เม็ดเลือดขาวต่ำ (Leukopenia) — พบได้\n• ผื่นผิวหนัง / SJS (หายาก แต่อันตราย)\n\nValproate (วัลโปรเอต):\n• น้ำหนักเพิ่ม — พบบ่อย\n• ผมร่วง — พบบ่อย\n• มือสั่น (Tremor) — พบบ่อย\n• ตับอักเสบ (Hepatotoxicity) — หายาก แต่อันตราย\n• ตับอ่อนอักเสบ (Pancreatitis) — หายาก แต่อันตราย\n\nLevetiracetam (ลีเวไทราซีแทม):\n• หงุดหงิด / อารมณ์แปรปรวน — พบบ่อย\n• นอนไม่หลับ — พบบ่อย\n• ซึมเศร้า / ก้าวร้าว — พบได้\n\nLamotrigine (ลาโมไทรจีน):\n• ผื่นผิวหนัง (พบบ่อยในเด็ก)\n• ผื่นรุนแรง / SJS (หายาก แต่อันตราย)\n• ปวดศีรษะ / เวียนศีรษะ\n\nTopiramate (โทพิราเมท):\n• ความจำ / สมาธิลดลง — พบบ่อย\n• เบื่ออาหาร / น้ำหนักลด — พบบ่อย\n• นิ่วในไต — พบได้\n• ชาปลายมือปลายเท้า — พบได้' },
    { title:'เมื่อไหร่ควรพบแพทย์ทันที?', body:'หากมีอาการรุนแรงดังนี้:\n- ผื่นผิวหนังลามรุนแรง ปากพอง มีไข้ (เสี่ยง SJS)\n- ตัวเหลือง ตาเหลือง ปวดท้องรุนแรง\n- มีความคิดอยากทำร้ายตนเองหรือซึมเศร้าผิดปกติ\n- ชักซ้ำบ่อยขึ้น หรือชักไม่หยุด' },
  ]},
  'missed-dose-guide': { title:'ถ้าลืมกินยากันชักควรทำอย่างไร', sections:[
    { title:'หลักการทั่วไปเมื่อลืมกินยา', body:'1. นึกได้ทันที: ให้รีบกินยามื้อที่ลืมทันที\n2. นึกได้เมื่อใกล้เวลามื้อถัดไป: ให้ข้ามมื้อที่ลืมไปเลย และกินมื้อถัดไปตามเวลาปกติ\n3. ห้ามกินยาเพิ่มเป็น 2 เท่า: เพื่อชดเชยมื้อที่ลืม เพราะอาจเกิดพิษจากยาเกินขนาด' },
    { title:'ตัวอย่างการคำนวณ (กฎครึ่งหนึ่งของระยะห่าง)', body:'เช่น ถ้าต้องกินยาทุก 12 ชั่วโมง (เช้า-เย็น) ครึ่งหนึ่งคือ 6 ชั่วโมง\n- ถ้านึกได้ภายใน 6 ชั่วโมงหลังเวลาปกติ -> กินทันที\n- ถ้านึกได้หลัง 6 ชั่วโมงไปแล้ว -> ข้ามไปกินมื้อเย็นเลย' },
  ]},
  'seizure-first-aid': { title:'การปฐมพยาบาลเมื่อมีอาการชัก', sections:[
    { title:'สิ่งที่ "ควรทำ" (DOs)', body:'- ตั้งสติ และดูเวลาที่เริ่มชัก\n- ประคองผู้ป่วยลงนอนในที่ปลอดภัย\n- คลายเสื้อผ้าให้หลวม และตะเขียงตัวผู้ป่วยไปด้านข้าง (ป้องกันสำลัก)\n- หาของนิ่มๆ รองศีรษะ\n- อยู่กับผู้ป่วยจนกว่าจะฟื้นสติสมบูรณ์' },
    { title:'สิ่งที่ "ไม่ควรทำ" (DON\'Ts)', body:'- ห้ามเอาสิ่งของงัดปาก หรือให้ผู้ป่วยกัด (เช่น ช้อน นิ้วมือ ผ้า)\n- ห้ามกดหรือฝืนอาการเกร็งกระตุก\n- ห้ามกรอกยาหรือน้ำเข้าปากขณะชัก\n- ห้ามผายปอด (ยกเว้นชักหยุดแล้วแต่ไม่หายใจ)' },
    { title:'เมื่อไหร่ควรเรียกรถพยาบาล (1669)?', body:'- ชักนานเกิน 5 นาที\n- ชักซ้ำโดยที่ยังไม่ฟื้นสติจากครั้งแรก\n- ได้รับบาดเจ็บขณะชัก\n- ชักในน้ำ\n- เป็นการชักครั้งแรกในชีวิต\n- ตั้งครรภ์ หรือมีโรคประจำตัวร้ายแรง' },
  ]},
  'self-observation': { title:'การสังเกตอาการตนเอง', sections:[
    { title:'สัญญาณเตือนก่อนชัก (Aura)', body:'ผู้ป่วยบางรายอาจมีอาการเตือนก่อนชัก เช่น:\n- รู้สึกเดจาวู (เหมือนเคยเห็นมาก่อน)\n- ได้กลิ่นหรือรสชาติแปลกๆ\n- รู้สึกวูบในท้อง\n- มีอาการชาหรือกระตุกเฉพาะที่\n\nการบันทึกอาการเตือนช่วยให้แพทย์ระบุจุดเริ่มต้นของกระแสไฟฟ้าผิดปกติในสมองได้' },
    { title:'ปัจจัยกระตุ้นที่ควรเลี่ยง', body:'- การอดนอน / พักผ่อนไม่พอ (พบบ่อยที่สุด)\n- ความเครียดสะสม\n- การลืมกินยา\n- แสงระยิบระยับ หรือไฟกะพริบ\n- การดื่มแอลกอฮอล์\n- อาการเจ็บป่วย มีไข้' },
  ]},
  'research-evidence': { title:'หลักฐานเชิงประจักษ์และงานวิจัย', sections:[
    { title:'ประสิทธิภาพของยากันชัก', body:'งานวิจัยยืนยันว่ายากันชักสามารถควบคุมอาการชักได้สมบูรณ์ในผู้ป่วยประมาณ 60-70% เมื่อใช้ยาตัวแรกหรือตัวที่สองอย่างถูกต้อง', ref:'Kwan P, Brodie MJ. Early identification of refractory epilepsy. N Engl J Med. 2000.' },
    { title:'Levetiracetam vs Phenytoin หลัง TBI', body:'การศึกษาเปรียบเทียบขนาดใหญ่พบว่า Levetiracetam มีประสิทธิภาพเท่ากับ Phenytoin ในการป้องกันการชักระยะเฉียบพลันหลังอุบัติเหตุทางสมอง โดยมีผลข้างเคียงด้านการทำงานของสมองน้อยกว่า แต่ราคาสูงกว่า', ref:'Zafar SN, et al. Phenytoin versus levetiracetam for seizure prophylaxis after traumatic brain injury. J Trauma Acute Care Surg. 2012.' },
  ]}
};

function showLearnDetail(id) {
  const content = LEARN_CONTENT[id];
  if (!content) return;
  document.getElementById('learnDetailTitle').textContent = content.title;
  document.getElementById('learnDetailBody').innerHTML = content.sections.map(s => `
    <div class="learn-section">
      <h3>${s.title}</h3>
      <p>${s.body.replace(/\n/g, '<br>')}</p>
      ${s.ref ? `<div class="learn-ref">${s.ref}</div>` : ''}
    </div>
  `).join('');
  showTab('learnDetail');
}

/* ===== PROFILE ===== */
function renderProfile() {
  const profile = getObj('profile');
  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  const hn = users[currentUser]?.hn || '';
  
  const sections = [
    { title: 'ข้อมูลส่วนตัว', rows: [
      { label: 'ชื่อ-นามสกุล', key: 'name', placeholder: 'ระบุชื่อของคุณ' },
      { label: 'อายุ', key: 'age', placeholder: 'ระบุอายุ', type: 'number' },
      { label: 'HN (เลขประจำตัวผู้ป่วย)', key: 'hn', value: hn, readonly: true },
      { label: 'การวินิจฉัย', key: 'diagnosis', placeholder: 'เช่น ลมชักหลังอุบัติเหตุ' }
    ]},
    { title: 'ข้อมูลการติดต่อฉุกเฉิน', rows: [
      { label: 'ผู้ติดต่อฉุกเฉิน', key: 'emergencyContact', placeholder: 'ชื่อผู้ติดต่อ' },
      { label: 'เบอร์โทรศัพท์', key: 'emergencyPhone', placeholder: '08x-xxx-xxxx', type: 'tel' }
    ]},
    { title: 'ข้อมูลการรักษา', rows: [
      { label: 'แพทย์เจ้าของไข้', key: 'doctorName', placeholder: 'ชื่อแพทย์' },
      { label: 'เบอร์โทรแผนก/รพ.', key: 'doctorPhone', placeholder: '0x-xxx-xxxx', type: 'tel' },
      { label: 'วันนัดครั้งถัดไป', key: 'nextAppointment', placeholder: '', type: 'date' }
    ]}
  ];

  document.getElementById('editProfileBtn').innerHTML = editingProfile ? '<i class="fas fa-save"></i> บันทึก' : '<i class="fas fa-edit"></i> แก้ไขข้อมูล';
  
  document.getElementById('profileContent').innerHTML = sections.map(s => `
    <div class="profile-section">
      <div class="profile-section-title">${s.title}</div>
      <div class="profile-card">
        ${s.rows.map(r => `
        <div class="profile-row">
          <span class="profile-label">${r.label}</span>
          ${editingProfile && !r.readonly
            ? `<input class="profile-input" id="pf_${r.key}" value="${profile[r.key] || ''}" placeholder="${r.placeholder}" type="${r.type || 'text'}">`
            : `<span class="profile-value ${(!profile[r.key] && !r.value) ? 'placeholder' : ''}">${r.value || profile[r.key] || r.placeholder}</span>`
          }
        </div>`).join('')}
      </div>
    </div>`
  ).join('');
}

function toggleEditProfile() {
  if (editingProfile) {
    const profile = {};
    ['name','age','diagnosis','emergencyContact','emergencyPhone','doctorName','doctorPhone','nextAppointment'].forEach(k => {
      const el = document.getElementById('pf_' + k);
      profile[k] = el ? el.value.trim() : '';
    });
    setObj('profile', profile);
    editingProfile = false;
    showToast('บันทึกข้อมูลแล้ว');
    
    // ส่งข้อมูลโปรไฟล์ที่แก้ไขไป Google Sheets
    syncToSheet('updateProfile', profile);
  } else {
    editingProfile = true;
  }
  renderProfile();
}

/* ===== MISSED DOSE ===== */
function renderMissedDose() {
  missedDoseStep = 'frequency';
  renderMissedDoseContent();
}

function renderMissedDoseContent() {
  const container = document.getElementById('missedDoseContent');
  let advisorHtml = '';

  if (missedDoseStep === 'frequency') {
    advisorHtml = `<p class="question-text">คุณกินยาวันละกี่ครั้ง?</p>
      <div class="options-grid">${[1,2,3,4].map(f => `<button class="option-btn" onclick="missedDoseFreq=${f};missedDoseStep='hours';renderMissedDoseContent()"><span class="option-num">${f}</span><span class="option-label">ครั้ง/วัน</span></button>`).join('')}</div>`;
  } else if (missedDoseStep === 'hours') {
    advisorHtml = `<p class="question-text">เลยเวลากินยามาแล้วกี่ชั่วโมง?</p>
      <div class="options-grid">${[1,2,3,4,5,6,8,10].map(h => `<button class="option-btn" onclick="calcMissedDose(${h})"><span class="option-num">${h}</span><span class="option-label">ชม.</span></button>`).join('')}</div>`;
  } else {
    const takeNow = missedDoseStep === 'take-now';
    advisorHtml = takeNow
      ? `<div class="result-box" style="background:var(--success-light)"><i class="fas fa-check-circle" style="color:var(--success)"></i><h3 style="color:var(--success)">ควรกินยาเลยตอนนี้</h3><p>ยังอยู่ในช่วงเวลาที่ปลอดภัยสำหรับการกินยามื้อที่ลืม</p></div>`
      : `<div class="result-box" style="background:var(--warning-light)"><i class="fas fa-clock" style="color:var(--warning)"></i><h3 style="color:var(--warning)">ควรรอกินยามื้อถัดไป</h3><p>ใกล้ถึงเวลามื้อถัดไปแล้ว ให้ข้ามมื้อที่ลืมและกินมื้อถัดไปตามปกติ</p></div>`;
    advisorHtml += `<button class="reset-btn" onclick="missedDoseStep='frequency';renderMissedDoseContent()"><i class="fas fa-redo"></i> คำนวณใหม่</button>`;
  }

  container.innerHTML = `
    <div class="advisor-card">
      <div class="advisor-header"><i class="fas fa-lightbulb"></i><span>ระบบช่วยแนะนำ</span></div>
      ${advisorHtml}
    </div>
    <h3 style="font-size:17px;font-weight:600;margin-bottom:14px">หลักปฏิบัติเมื่อลืมกินยากันชัก</h3>
    <div class="guide-item">
      <div class="guide-icon" style="background:var(--success-light);color:var(--success)"><i class="fas fa-check"></i></div>
      <div class="guide-content"><strong>นึกได้ไม่นานหลังเวลาที่ควรกินยา</strong><p>ให้กินยาทันที</p></div>
    </div>
    <div class="guide-item">
      <div class="guide-icon" style="background:var(--warning-light);color:var(--warning)"><i class="fas fa-clock"></i></div>
      <div class="guide-content"><strong>นึกได้ใกล้เวลามื้อถัดไป</strong><p>ให้ข้ามมื้อที่ลืม และกินมื้อต่อไปตามปกติ</p></div>
    </div>
    <div class="guide-item">
      <div class="guide-icon" style="background:var(--danger-light);color:var(--danger)"><i class="fas fa-times"></i></div>
      <div class="guide-content"><strong>ห้ามกินยาเป็น 2 เท่า</strong><p>ไม่ว่ากรณีใด ห้ามกินยาเป็น 2 เท่าเพื่อชดเชยมื้อที่ลืม</p></div>
    </div>
    <div class="guide-item">
      <div class="guide-icon" style="background:#EEF2FF;color:#6366F1"><i class="fas fa-stethoscope"></i></div>
      <div class="guide-content"><strong>หากลืมบ่อยหรือมีอาการผิดปกติ</strong><p>ควรปรึกษาแพทย์หรือพยาบาลทันที</p></div>
    </div>
    <div class="note-box">
      <i class="fas fa-info-circle"></i>
      <p>หมายเหตุ: ยาบางชนิด เช่น Valproate (วัลโปรเอต), Phenytoin (เฟนิโทอิน), Carbamazepine (คาร์บามาซีพีน), Levetiracetam (ลีเวไทราซีแทม) อาจมีข้อแนะนำเฉพาะ แต่หลักใหญ่เหมือนกัน คือ กินทันทีที่นึกได้ ถ้าใกลื้อต่อไปให้ข้าม และไม่กินซ้ำสองเท่า</p>
    </div>`;
}

function calcMissedDose(hours) {
  const interval = 24 / missedDoseFreq;
  const half = interval / 2;
  missedDoseStep = hours <= half ? 'take-now' : 'skip-wait';
  renderMissedDoseContent();
}

/* ===== MODALS ===== */
function showModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'seizureModal') initSeizureModal();
  if (id === 'sideEffectModal') initSideEffectModal();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('seizguard_currentUser');
  if (saved) {
    const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
    if (users[saved]) {
      currentUser = saved;
      enterApp();
      return;
    }
  }
  document.getElementById('loginScreen').classList.add('active');
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});
