/* ===== SeizGuard - ชักไม่ซ้ำ (Complete Original Version + Google Sheets Integration) ===== */

// 1. Google Apps Script Web App URL (อัปเดตใหม่)
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
  1: { label: 'เล็กน้อยมาก', color: 'var(--success)', desc: 'อาการเพียงเล็กน้อย ไม่กระทบกิจวัตรประจำวัน เช่น รู้สึกชาเล็กน้อยชั่วคราว เหม่อนิ่งไม่กี่วินาที หรือผลข้างเคียงยาที่แทบไม่รู้สึก', ref: 'อ้างอิง: CTCAE v5.0 Grade 1; ILAE Seizure Severity Scale' },
  2: { label: 'เล็กน้อย', color: 'var(--success)', desc: 'อาการเล็กน้อย รบกวนเล็กน้อยแต่ยังทำกิจกรรมได้ตามปกติ เช่น กระตุกเฉพาะที่สั้นๆ มึนงงเล็กน้อย หรือรู้สึกง่วงเป็นบางเวลา', ref: 'อ้างอิง: CTCAE v5.0 Grade 1; Liverpool Seizure Severity Scale' },
  3: { label: 'ปานกลาง', color: 'var(--warning)', desc: 'อาการปานกลาง กระทบการใช้ชีวิตบ้าง ต้องหยุดพักกิจกรรม เช่น อาการชักที่มีเกร็ง/กระตุกชัดเจนแต่ไม่นาน คลื่นไส้ต้องนอนพัก หรือเวียนศีรษะจนเดินไม่ถนัด', ref: 'อ้างอิง: CTCAE v5.0 Grade 2; Chalfont Seizure Severity Scale' },
  4: { label: 'รุนแรง', color: 'var(--danger)', desc: 'อาการรุนแรง กระทบการใช้ชีวิตมาก ต้องการความช่วยเหลือ เช่น ชักนานกว่า 2-3 นาที สับสนหลังชักนาน หมดสติ ผลข้างเคียงรุนแรง (ผื่นลามทั้งตัว ตาเหลือง) ต้องไปพบแพทย์', ref: 'อ้างอิง: CTCAE v5.0 Grade 3; ILAE Definition of Status Epilepticus' },
  5: { label: 'รุนแรงมาก / ฉุกเฉิน', color: 'var(--danger)', desc: 'อาการรุนแรงมาก เป็นอันตรายต่อชีวิต ต้องเรียกรถฉุกเฉินทันที เช่น ชักนานเกิน 5 นาที (Status epilepticus) ชักซ้ำไม่หยุด หยุดหายใจ มีอาการ Stevens-Johnson Syndrome', ref: 'อ้างอิง: CTCAE v5.0 Grade 4; ILAE Guidelines for Emergency Management' }
};

const SIDE_EFFECT_SEVERITY_DESCRIPTIONS = {
  1: { label: 'เล็กน้อย', color: 'var(--success)', desc: 'อาการข้างเคียงเล็กน้อย ไม่กระทบกิจวัตรประจำวัน เช่น ง่วงนอนเล็กน้อย เวียนศีรษะชั่วคราว หรือเบื่ออาหารเล็กน้อย สังเกตอาการต่อไป แจ้งแพทย์ในนัดถัดไป', ref: 'อ้างอิง: CTCAE v5.0 Grade 1; Perucca P, Gilliam FG. Lancet Neurol. 2012' },
  2: { label: 'ปานกลาง', color: 'var(--warning)', desc: 'อาการรบกวนการใช้ชีวิต เช่น เวียนศีรษะจนเดินไม่ถนัด คลื่นไส้ต้องนอนพัก หรืออารมณ์แปรปรวนจนกระทบคนรอบข้าง ควรปรึกษาแพทย์เพื่อปรับขนาดยาหรือเปลี่ยนยา', ref: 'อ้างอิง: CTCAE v5.0 Grade 2; Perucca P, Gilliam FG. Lancet Neurol. 2012' },
  3: { label: 'รุนแรงปานกลาง', color: 'var(--warning)', desc: 'อาการรุนแรงปานกลาง กระทบการใช้ชีวิตมาก เช่น ซึมเศร้า อารมณ์แปรปรวนรุนแรง นิ่วในไต หรือโซเดียมในเลือดต่ำ ควรพบแพทย์โดยเร็ว', ref: 'อ้างอิง: CTCAE v5.0 Grade 3; Perucca P, Gilliam FG. Lancet Neurol. 2012' },
  4: { label: 'รุนแรง / ต้องพบแพทย์ทันที', color: 'var(--danger)', desc: 'อาการรุนแรง ต้องพบแพทย์ทันที เช่น ผื่นลามทั้งตัว เม็ดเลือดขาวต่ำ เกล็ดเลือดต่ำ หรือกรดในเลือดสูง ห้ามหยุดยาเองโดยไม่ปรึกษาแพทย์', ref: 'อ้างอิง: CTCAE v5.0 Grade 3-4; Perucca P, Gilliam FG. Lancet Neurol. 2012' }
};

const MONTH_NAMES_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const DAY_NAMES_TH = ['อา','จ','อ','พ','พฤ','ศ','ส'];

let currentUser = null;
let selectedDate = new Date();
let selectedTimes = [];
let seizureSymptoms = [];
let sideEffectSymptoms = [];
let sideEffectMeds = [];
let editingProfile = false;
let missedDoseStep = 'frequency';
let missedDoseFreq = 0;

// 2. Google Sheets Integration Functions
async function syncDataToSheet(action, data) {
  if (!SCRIPT_URL) return;
  const username = localStorage.getItem('seizguard_currentUser');
  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  const hn = users[username]?.hn || '';
  
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: action, 
        data: { ...data, username: username, hn: hn } 
      })
    });
    return response;
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
  }
}

// Helper Functions
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
function getDateStr(date) { return date.toISOString().split('T')[0]; }
function getTimeStr() { const now = new Date(); return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'); }
function userKey(key) { return `seizguard_${currentUser}_${key}`; }
function getData(key) { try { return JSON.parse(localStorage.getItem(userKey(key))) || []; } catch(e) { return []; } }
function setData(key, val) { localStorage.setItem(userKey(key), JSON.stringify(val)); }
function getObj(key) { try { return JSON.parse(localStorage.getItem(userKey(key))); } catch(e) { return null; } }
function setObj(key, val) { localStorage.setItem(userKey(key), JSON.stringify(val)); }

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function getThaiName(engName) {
  const med = COMMON_AEDS.find(a => a.name === engName);
  return med ? med.thai : '';
}

/* ===== AUTH ===== */
async function handleLogin() {
  const u = document.getElementById('loginUsername').value.trim();
  const hn = document.getElementById('loginHN').value.trim();
  if (!u || !hn) { showToast('กรุณากรอกชื่อผู้ใช้ และเลขที่โรงพยาบาล'); return; }

  const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
  
  // ตรวจสอบใน Local ก่อน
  if (users[u] && users[u].hn === hn) {
    currentUser = u;
    localStorage.setItem('seizguard_currentUser', u);
    enterApp();
  } else {
    // ถ้าไม่เจอใน Local ลองเช็คใน Google Sheets (ระบบซิงค์ข้ามเครื่อง)
    showToast('กำลังตรวจสอบข้อมูลผู้ใช้...');
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', data: { username: u, hn: hn } })
      });
      const result = await res.json();
      if (result.status === 'success') {
        users[u] = { hn: hn };
        localStorage.setItem('seizguard_users', JSON.stringify(users));
        currentUser = u;
        localStorage.setItem('seizguard_currentUser', u);
        enterApp();
      } else {
        showToast('ไม่พบข้อมูลผู้ใช้ กรุณาลงทะเบียน');
      }
    } catch (e) {
      showToast('ไม่พบข้อมูลผู้ใช้ กรุณาลงทะเบียน');
    }
  }
}

async function handleRegister() {
  const u = document.getElementById('loginUsername').value.trim();
  const hn = document.getElementById('loginHN').value.trim();
  if (!u || !hn) { showToast('กรุณากรอกชื่อผู้ใช้ และเลขที่โรงพยาบาล'); return; }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', data: { username: u, hn: hn } })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
      users[u] = { hn: hn };
      localStorage.setItem('seizguard_users', JSON.stringify(users));
      currentUser = u;
      localStorage.setItem('seizguard_currentUser', u);
      enterApp();
      showToast('ลงทะเบียนและเข้าสู่ระบบสำเร็จ');
    } else {
      showToast(result.message || 'ลงทะเบียนไม่สำเร็จ');
    }
  } catch (e) {
    showToast('เกิดข้อผิดพลาดในการลงทะเบียน');
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('seizguard_currentUser');
  document.getElementById('mainApp').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
}

function enterApp() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('mainApp').classList.add('active');
  showTab('home');
}

/* ===== NAVIGATION ===== */
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));

  const tabMap = {
    home: 'tabHome',
    learn: 'tabLearn',
    assess: 'tabAssess',
    profile: 'tabProfile',
    missedDose: 'tabMissedDose',
    learnDetail: 'tabLearnDetail',
    medDetail: 'tabMedDetail'
  };

  const btnMap = {
    home: 'tabBtnHome',
    learn: 'tabBtnLearn',
    assess: 'tabBtnAssess',
    profile: 'tabBtnProfile'
  };

  if (tabMap[tabId]) document.getElementById(tabMap[tabId]).classList.add('active');
  if (btnMap[tabId]) document.getElementById(btnMap[tabId]).classList.add('active');

  if (tabId === 'home') renderHome();
  if (tabId === 'learn') renderLearnTopics();
  if (tabId === 'assess') renderAssess();
  if (tabId === 'profile') renderProfile();
  if (tabId === 'missedDose') renderMissedDose();
}

/* ===== HOME & MEDICATION LOGS ===== */
function renderHome() {
  renderHeaderDate();
  renderWeekCalendar();
  generateDailyLogs();
  renderAdherence();
  renderMedList();
}

function renderHeaderDate() {
  const d = selectedDate;
  document.getElementById('headerDate').textContent = d.getDate() + ' ' + MONTH_NAMES_TH[d.getMonth()] + ' ' + (d.getFullYear() + 543);
}

function renderWeekCalendar() {
  const container = document.getElementById('weekCalendar');
  const days = [];
  const start = new Date(selectedDate);
  start.setDate(start.getDate() - 3);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const todayStr = getDateStr(new Date());
  const selectedStr = getDateStr(selectedDate);

  container.innerHTML = days.map(d => {
    const dStr = getDateStr(d);
    const isSelected = dStr === selectedStr;
    const isToday = dStr === todayStr && !isSelected;
    return `
      <div class="day-item ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" onclick="selectDate('${dStr}')">
        <span class="day-name">${DAY_NAMES_TH[d.getDay()]}</span>
        <span class="day-num">${d.getDate()}</span>
      </div>
    `;
  }).join('');
}

function selectDate(dateStr) {
  selectedDate = new Date(dateStr + 'T00:00:00');
  renderHome();
}

function generateDailyLogs() {
  const dateStr = getDateStr(selectedDate);
  const meds = getData('medications');
  let logs = getData('medLogs');

  meds.forEach(med => {
    med.times.forEach(time => {
      const exists = logs.find(l => l.medicationId === med.id && l.scheduledTime === time && l.date === dateStr);
      if (!exists) {
        logs.push({
          id: genId(),
          medicationId: med.id,
          scheduledTime: time,
          takenTime: null,
          status: 'pending',
          date: dateStr
        });
      }
    });
  });

  setData('medLogs', logs);
}

function renderAdherence() {
  const logs = getData('medLogs');
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = logs.filter(l => {
    const d = new Date(l.date);
    return d >= sevenDaysAgo && d <= now;
  });

  const total = recentLogs.length;
  const taken = recentLogs.filter(l => l.status === 'taken').length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;

  document.getElementById('adherenceCard').innerHTML = `
    <div class="adherence-header">
      <i class="fas fa-chart-bar"></i>
      <span>Adherence 7 วันล่าสุด</span>
    </div>
    <div class="adherence-bar">
      <div class="adherence-fill" style="width: ${pct}%"></div>
    </div>
    <div class="adherence-text">${taken}/${total} มื้อ (${pct}%)</div>
  `;
}

function renderMedList() {
  const meds = getData('medications');
  const dateStr = getDateStr(selectedDate);
  const logs = getData('medLogs').filter(l => l.date === dateStr);
  const isToday = getDateStr(new Date()) === dateStr;

  document.getElementById('medSectionTitle').textContent = isToday ? 'ยาวันนี้' : 'ยาวันที่ ' + selectedDate.getDate();

  if (meds.length === 0 || logs.length === 0) {
    document.getElementById('medList').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-pills"></i>
        <h3>ไม่มีรายการยา</h3>
        <p>กดปุ่ม + เพื่อเพิ่มรายการยากันชักของคุณ</p>
      </div>
    `;
    return;
  }

  document.getElementById('medList').innerHTML = logs.map(log => {
    const med = meds.find(m => m.id === log.medicationId);
    if (!med) return '';

    const isTaken = log.status === 'taken';
    const canTake = isToday && !isTaken;

    let buttonHtml = '';
    if (isTaken) {
      buttonHtml = `<span class="taken-badge">กินแล้ว</span>`;
    } else if (canTake) {
      buttonHtml = `<button class="take-btn" onclick="event.stopPropagation(); takePill('${log.id}')"><i class="fas fa-check"></i></button>`;
    } else {
      buttonHtml = `<span class="taken-badge" style="background: var(--surface2); color: var(--text3)">-</span>`;
    }

    return `
      <div class="med-card ${isTaken ? 'taken' : ''}" onclick="showMedDetail('${med.id}')">
        <div class="med-icon ${isTaken ? 'done' : 'pending'}">
          <i class="fas ${isTaken ? 'fa-check-circle' : 'fa-clock'}"></i>
        </div>
        <div class="med-info">
          <div class="med-name">${med.name}</div>
          <div class="med-dosage">${med.dosage}</div>
          <div class="med-time-row">
            <i class="fas fa-clock"></i> ${log.scheduledTime}
            ${log.takenTime ? `<span class="taken-time">(กินเมื่อ ${log.takenTime})</span>` : ''}
          </div>
        </div>
        ${buttonHtml}
      </div>
    `;
  }).join('');
}

async function takePill(logId) {
  const todayStr = getDateStr(new Date());
  let logs = getData('medLogs');
  const idx = logs.findIndex(l => l.id === logId);

  if (idx !== -1) {
    if (logs[idx].date !== todayStr) {
      showToast('บันทึกได้เฉพาะวันปัจจุบันเท่านั้น');
      return;
    }

    const med = getData('medications').find(m => m.id === logs[idx].medicationId);
    logs[idx].status = 'taken';
    logs[idx].takenTime = getTimeStr();
    setData('medLogs', logs);
    
    // ส่งข้อมูลไป Google Sheets อัตโนมัติ
    await syncDataToSheet('medication', {
      medName: med.name,
      scheduledTime: logs[idx].scheduledTime,
      date: logs[idx].date,
      takenTime: logs[idx].takenTime
    });

    renderHome();
    showToast('บันทึกการกินยาเรียบร้อยแล้ว');
  }
}

/* ===== ADD MEDICATION ===== */
function showAddMedModal() {
  document.getElementById('medName').value = '';
  document.getElementById('medDosage').value = '';
  document.getElementById('medPillCount').value = '';
  document.getElementById('medNotes').value = '';
  selectedTimes = ['08:00', '21:00'];
  renderCommonMeds();
  renderTimeOptions();
  showModal('addMedModal');
}

function renderCommonMeds() {
  document.getElementById('commonMedsList').innerHTML = COMMON_AEDS.map(med => `
    <button class="common-med-tag" onclick="document.getElementById('medName').value='${med.name}'">
      ${med.name} <br> <small>${med.thai}</small>
    </button>
  `).join('');
}

function renderTimeOptions() {
  document.getElementById('timeOptions').innerHTML = TIME_PRESETS.map(preset => {
    const isSelected = selectedTimes.includes(preset.time);
    return `
      <div class="time-option ${isSelected ? 'selected' : ''}" onclick="toggleTime('${preset.time}')">
        <i class="fas ${isSelected ? 'fa-check-circle' : 'fa-circle'}"></i>
        ${preset.label} (${preset.time})
      </div>
    `;
  }).join('');
}

function toggleTime(time) {
  if (selectedTimes.includes(time)) {
    selectedTimes = selectedTimes.filter(t => t !== time);
  } else {
    selectedTimes.push(time);
  }
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
    if (confirm('ต้องการลบรายการยา ' + med.name + ' หรือไม่?')) {
      const updatedMeds = getData('medications').filter(m => m.id !== medId);
      setData('medications', updatedMeds);
      showTab('home');
      showToast('ลบรายการยาเรียบร้อยแล้ว');
    }
  };

  const allLogs = getData('medLogs').filter(l => l.medicationId === medId).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const takenCount = allLogs.filter(l => l.status === 'taken').length;
  const totalCount = allLogs.length;
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  document.getElementById('medDetailContent').innerHTML = `
    <div class="detail-card">
      <div class="info-grid">
        <div class="info-item"><div class="info-label">ชื่อยา</div><div class="info-value">${med.name}</div>${thaiName ? `<div style="font-size: 13px; color: var(--text2); margin-top: 2px">${thaiName}</div>` : ''}</div>
        <div class="info-item"><div class="info-label">ขนาดยา</div><div class="info-value">${med.dosage}</div></div>
      </div>
      <div class="info-grid" style="margin-top: 12px">
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
        <div class="stat-item"><div class="stat-num" style="color: var(--success)">${takenCount}</div><div class="stat-label">กินแล้ว</div></div>
        <div class="stat-item"><div class="stat-num" style="color: var(--danger)">${totalCount - takenCount}</div><div class="stat-label">ขาด/รอ</div></div>
        <div class="stat-item"><div class="stat-num" style="color: var(--primary)">${adherencePct}%</div><div class="stat-label">Adherence</div></div>
      </div>
      <div class="adherence-bar"><div class="adherence-fill" style="width: ${adherencePct}%"></div></div>
    </div>
    <div class="detail-card">
      <h4>ประวัติล่าสุด</h4>
      ${allLogs.length === 0 ? '<p style="text-align: center; color: var(--text3); padding: 20px">ยังไม่มีประวัติ</p>' : ''}
      ${allLogs.slice(0, 7).map(l => {
        const color = l.status === 'taken' ? 'var(--success)' : (l.status === 'missed' ? 'var(--danger)' : 'var(--warning)');
        const statusText = l.status === 'taken' ? 'กินแล้ว' : (l.status === 'missed' ? 'ขาด' : 'รอ');
        return `<div class="log-row"><div class="log-dot" style="background: ${color}"></div><div class="log-row-date">${l.date}</div><div class="log-row-time">${l.scheduledTime}</div><div class="log-row-status" style="color: ${color}">${statusText}</div></div>`;
      }).join('')}
    </div>
    ${med.notes ? `<div class="detail-card"><h4>หมายเหตุ</h4><p style="font-size: 14px; color: var(--text2); line-height: 1.6">${med.notes}</p></div>` : ''}`;

  showTab('medDetail');
}

/* ===== LEARN TOPICS CONTENT (FULL VERSION) ===== */
const LEARN_TOPICS = [
  { id: 'what-is-seizure', icon: 'fa-bolt', color: 'var(--accent)', bg: 'var(--accent-soft)', title: 'อาการชักคืออะไร', sub: 'ความรู้พื้นฐาน, ชนิดของอาการชัก, สาเหตุ' },
  { id: 'why-aeds', icon: 'fa-pills', color: 'var(--primary)', bg: '#E0F4F4', title: 'ทำไมต้องกินยากันชัก', sub: 'เหตุผล, ประโยชน์, กลุ่มผู้ป่วยที่ต้องใช้ยา' },
  { id: 'tbi-criteria', icon: 'fa-shield-halved', color: '#6366F1', bg: '#EEF2FF', title: 'เกณฑ์การให้ยาหลัง Head Injury', sub: 'Criteria, งานวิจัย, แนวทางปฏิบัติ' },
  { id: 'side-effects', icon: 'fa-exclamation-triangle', color: 'var(--warning)', bg: 'var(--warning-light)', title: 'ผลข้างเคียงยากันชัก', sub: 'อาการที่ควรสังเกต, เมื่อไหร่ควรพบแพทย์' },
  { id: 'missed-dose-guide', icon: 'fa-circle-question', color: '#EC4899', bg: '#FDF2F8', title: 'ถ้าลืมกินยากันชักควรทำอย่างไร', sub: 'คำแนะนำเมื่อลืมกินยา, หลักปฏิบัติ' },
  { id: 'seizure-first-aid', icon: 'fa-heart-pulse', color: 'var(--danger)', bg: 'var(--danger-light)', title: 'การปฐมพยาบาลเมื่อมีอาการชัก', sub: 'สิ่งที่ควรทำ/ไม่ควรทำ สำหรับผู้ดูแล' },
  { id: 'self-observation', icon: 'fa-eye', color: '#0EA5E9', bg: '#F0F9FF', title: 'การสังเกตอาการตนเอง', sub: 'สัญญาณเตือนก่อนชัก, การบันทึกอาการ' },
  { id: 'research-evidence', icon: 'fa-file-lines', color: '#8B5CF6', bg: '#F5F3FF', title: 'หลักฐานเชิงประจักษ์และงานวิจัย', sub: 'Systematic reviews, Practice guidelines' },
];

function renderLearnTopics() {
  document.getElementById('learnTopicsList').innerHTML = LEARN_TOPICS.map(topic => `
    <div class="topic-card" onclick="showLearnDetail('${topic.id}')">
      <div class="topic-icon" style="background: ${topic.bg}; color: ${topic.color}">
        <i class="fas ${topic.icon}"></i>
      </div>
      <div class="topic-info">
        <div class="topic-title">${topic.title}</div>
        <div class="topic-sub">${topic.sub}</div>
      </div>
      <i class="fas fa-chevron-right" style="color: var(--text3)"></i>
    </div>
  `).join('') + `
    <div class="disclaimer-card">
      <i class="fas fa-info-circle"></i>
      <p>ข้อมูลในหน้านี้จัดทำเพื่อการให้ความรู้เท่านั้น ไม่ใช่การวินิจฉัยหรือการรักษาโรคโดยแพทย์ กรุณาปรึกษาแพทย์เจ้าของไข้สำหรับข้อมูลเฉพาะบุคคล</p>
    </div>
  `;
}

const LEARN_CONTENT = {
  'what-is-seizure': {
    title: 'อาการชักคืออะไร',
    sections: [
      { title: 'อาการชักคืออะไร?', body: 'อาการชัก (Seizure) คือภาวะที่เกิดจากกระแสไฟฟ้าในสมองทำงานผิดปกติอย่างฉับพลัน ส่งผลให้เกิดอาการต่างๆ เช่น กล้ามเนื้อเกร็งกระตุก หมดสติ ตาค้าง หรือพฤติกรรมผิดปกติชั่วคราว' },
      { title: 'ชนิดของอาการชัก', body: '1. Generalized seizures: อาการชักทั้งตัว รวมถึง Tonic-clonic (เกร็งกระตุก), Absence (เหม่อ), Myoclonic (กระตุกสั้นๆ)\n\n2. Focal seizures: อาการชักเฉพาะที่ อาจมีหรือไม่มีการเปลี่ยนแปลงระดับความรู้สึกตัว\n\n3. Unknown onset: อาการชักที่ไม่ทราบจุดเริ่มต้น', ref: 'Fisher RS, et al. ILAE official report: a practical clinical definition of epilepsy. Epilepsia. 2014;55(4):475-482.' },
      { title: 'โรคลมชัก (Epilepsy) คืออะไร?', body: 'โรคลมชักคือภาวะที่มีอาการชักซ้ำตั้งแต่ 2 ครั้งขึ้นไป โดยไม่มีสาเหตุกระตุ้นเฉพาะเจาะจง (unprovoked seizures) หรือมีอาการชักครั้งเดียวแต่มีความเสี่ยงสูงที่จะเกิดซ้ำ', ref: 'International League Against Epilepsy (ILAE) Classification, 2017.' },
    ]
  },
  'why-aeds': {
    title: 'ทำไมต้องกินยากันชัก',
    sections: [
      { title: 'เหตุผลที่ต้องกินยากันชัก', body: 'ยากันชัก (Antiepileptic Drugs: AEDs) ใช้เพื่อ:\n\n1. รักษาโรคลมชัก (Epilepsy) ป้องกันอาการชักซ้ำ\n2. ป้องกันอาการชักเฉียบพลันหลังบาดเจ็บที่ศีรษะ (Head injury/TBI) ในผู้ที่มีความเสี่ยงสูง\n3. ป้องกันอาการชักหลังผ่าตัดสมอง' },
      { title: 'ประโยชน์ของการกินยาสม่ำเสมอ', body: '- ลดความถี่ของอาการชัก\n- ป้องกันภาวะชักต่อเนื่อง (Status epilepticus) ซึ่งเป็นอันตรายถึงชีวิต\n- ช่วยให้ดำเนินชีวิตประจำวันได้ปกติ\n- ลดความเสี่ยงการบาดเจ็บจากอาการชัก\n- ป้องกันความเสียหายต่อสมองจากการชักซ้ำ', ref: 'Kwan P, et al. Early identification of refractory epilepsy. N Engl J Med. 2000;342(5):314-319.' },
      { title: 'กลุ่มผู้ป่วยที่ใช้ยากันชัก', body: '- ผู้ที่ได้รับการวินิจฉัยว่าเป็นโรคลมชัก\n- ผู้ป่วย TBI/ภาวะสมองบาดเจ็บที่มีความเสี่ยงสูง\n- ผู้ป่วยหลังผ่าตัดสมอง\n- ผู้ป่วยที่อยู่ในระยะฟื้นฟูหลังอุบัติเหตุทางสมอง' },
    ]
  },
  'tbi-criteria': {
    title: 'เกณฑ์การให้ยาหลัง Head Injury',
    sections: [
      { title: 'เกณฑ์ความเสี่ยงสูงในการเกิดชักหลัง TBI', body: 'ผู้ป่วยที่มีปัจจัยเสี่ยงต่อไปนี้ ควรได้รับยากันชักเพื่อป้องกัน:\n\n- Intracranial hemorrhage (เลือดออกในสมอง)\n- Depressed skull fracture (กะโหลกยุบ)\n- Penetrating brain injury (บาดเจ็บแบบทะลุ)\n- Prolonged loss of consciousness > 24 ชั่วโมง\n- GCS < 10\n- อายุ > 65 ปี\n- ประวัติเป็นโรคลมชักมาก่อน', ref: 'Temkin NR, et al. A randomized, double-blind study of phenytoin for the prevention of post-traumatic seizures. N Engl J Med. 1990;323(8):497-502.' },
      { title: 'Early vs Late Post-traumatic Seizures', body: 'Early seizures: เกิดภายใน 7 วันหลังบาดเจ็บ\n- ยากันชักมีประสิทธิภาพในการป้องกัน early seizures\n- ลดการเกิดชักได้อย่างมีนัยสำคัญทางสถิติ\n\nLate seizures: เกิดหลัง 7 วัน\n- ยากันชักไม่ได้ลดการเกิด late seizures อย่างมีนัยสำคัญ\n- แนะนำให้ใช้ยาป้องกันเป็นเวลา 7 วัน (ในกลุ่มเสี่ยงสูง)', ref: 'Chang BS, Lowenstein DH. Practice parameter: antiepileptic drug prophylaxis in severe traumatic brain injury. Neurology. 2003;60(1):10-16. (AAN Practice Parameter)' },
      { title: 'แนวทางจาก Cochrane Systematic Review', body: '"การให้ยากันชักหลัง traumatic brain injury ช่วยลดการเกิดอาการชักภายใน 7 วันแรกในผู้ที่มีความเสี่ยงสูง แต่ไม่ลดการชักในระยะยาว"\n\nLevetiracetam และ Phenytoin มีประสิทธิภาพเทียบเคียงกันในการป้องกัน early seizures หลัง TBI', ref: 'Thompson K, et al. Pharmacological treatments for preventing epilepsy following traumatic head injury. Cochrane Database Syst Rev. 2015.\n\nInaba K, et al. A prospective multicenter comparison of levetiracetam versus phenytoin for early posttraumatic seizure prophylaxis. J Trauma Acute Care Surg. 2013;74(3):766-771.' },
    ]
  },
  'side-effects': {
    title: 'ผลข้างเคียงยากันชัก',
    sections: [
      { title: 'ผลข้างเคียงที่พบได้บ่อย (ทุกยา)', body: 'ยากันชักทุกตัวอาจทำให้เกิด:\n\n- เวียนศีรษะ / มึนงง\n- ง่วงนอน / อ่อนเพลีย\n- คลื่นไส้ / อาเจียน\n- ปวดศีรษะ\n- ตาพร่า / เห็นภาพซ้อน\n- เดินเซ / ทรงตัวไม่ดี', ref: 'Perucca P, Gilliam FG. Adverse effects of antiepileptic drugs. Lancet Neurol. 2012;11(9):792-802.' },
      { title: 'ผลข้างเคียงเฉพาะยาแต่ละตัว', body: 'Phenytoin (เฟนิโทอิน):\n• เหงือกบวม (Gingival Hyperplasia) — พบบ่อย\n• ขนดก / ผมขึ้นมาก (Hirsutism) — พบได้\n• เดินเซ / ทรงตัวไม่ดี (Ataxia) — พบบ่อย\n• ตาพร่า / เห็นภาพซ้อน — พบบ่อย\n• ผื่นผิวหนัง / SJS (หายาก แต่อันตราย)\n\nCarbamazepine (คาร์บามาซีพีน):\n• โซเดียมในเลือดต่ำ (Hyponatremia) — พบได้\n• เม็ดเลือดขาวต่ำ (Leukopenia) — พบได้\n• ผื่นผิวหนัง / SJS (หายาก แต่อันตราย)\n\nValproate (วัลโปรเอต):\n• น้ำหนักเพิ่ม — พบบ่อย\n• ผมร่วง — พบบ่อย\n• มือสั่น (Tremor) — พบบ่อย\n• ตับอักเสบ (Hepatotoxicity) — หายาก แต่อันตราย\n• ตับอ่อนอักเสบ (Pancreatitis) — หายาก แต่อันตราย\n\nLevetiracetam (ลีเวไทราซีแทม):\n• หงุดหงิด / อารมณ์แปรปรวน — พบบ่อย\n• นอนไม่หลับ — พบบ่อย\n• ซึมเศร้า / ก้าวร้าว — พบได้\n\nLamotrigine (ลาโมไทรจีน):\n• ผื่นผิวหนัง (พบบ่อยในเด็ก)\n• ผื่นรุนแรง / SJS (หายาก แต่อันตราย)\n• เวียนศีรษะ / ปวดศีรษะ' },
      { title: 'เมื่อไหร่ควรพบแพทย์ทันที?', body: '- มีผื่นผิวหนังลามรุนแรง หรือมีตุ่มพองในปาก\n- ตัวเหลือง ตาเหลือง\n- มีอาการแพ้ยาเฉียบพลัน (หน้าบวม ปากบวม หายใจลำบาก)\n- อารมณ์เปลี่ยนแปลงรุนแรง มีความคิดอยากทำร้ายตนเอง\n- อาการชักรุนแรงขึ้นหรือถี่ขึ้นผิดปกติ' }
    ]
  },
  'missed-dose-guide': {
    title: 'ถ้าลืมกินยากันชักควรทำอย่างไร',
    sections: [
      { title: 'หลักปฏิบัติทั่วไปเมื่อลืมกินยา', body: '1. หากนึกได้ไม่นานหลังเวลาปกติ: ให้กินยามื้อที่ลืมทันที\n\n2. หากนึกได้เมื่อใกล้ถึงเวลามื้อถัดไป: ให้ข้ามมื้อที่ลืมไป และกินมื้อถัดไปตามปกติในขนาดเดิม\n\n3. ห้ามกินยาเป็น 2 เท่า: ไม่ว่ากรณีใดก็ตาม ห้ามเพิ่มขนาดยาเป็นสองเท่าเพื่อชดเชยมื้อที่ลืม เพราะอาจเกิดพิษจากยาได้', ref: 'Epilepsy Foundation. Missing a Dose. [Online]' },
      { title: 'ระบบช่วยคำนวณในแอปนี้', body: 'คุณสามารถใช้ฟังก์ชัน "ลืมกินยา" ในหน้าแรกของแอปเพื่อช่วยประเมินเบื้องต้นได้ โดยระบบจะใช้หลักการ "ครึ่งหนึ่งของช่วงเวลาห่างระหว่างมื้อ" (Halfway point rule) ในการแนะนำ' }
    ]
  },
  'seizure-first-aid': {
    title: 'การปฐมพยาบาลเมื่อมีอาการชัก',
    sections: [
      { title: 'สิ่งที่ "ควรทำ" (DOs)', body: '- ตั้งสติ และดูเวลาที่เริ่มชัก\n- ประคองผู้ป่วยลงนอนในที่ปลอดภัย\n- คลายเสื้อผ้าให้หลวม โดยเฉพาะบริเวณคอ\n- จับผู้ป่วยนอนตะแคงข้าง (Recovery position) เพื่อป้องกันการสำลักน้ำลายหรืออาเจียน\n- นำสิ่งของมีคมหรือของแข็งออกจากบริเวณนั้น\n- อยู่กับผู้ป่วยจนกว่าจะฟื้นคืนสติสมบูรณ์' },
      { title: 'สิ่งที่ "ห้ามทำ" (DON\'Ts)', body: '- ห้าม! เอาสิ่งของใดๆ ใส่ปากผู้ป่วย (เช่น ช้อน นิ้วมือ ผ้าเช็ดหน้า) เพราะอาจทำให้ฟันหักหรืออุดกั้นทางเดินหายใจ\n- ห้าม! งัดปากผู้ป่วย\n- ห้าม! กดหรือฝืนอาการเกร็งกระตุกรุนแรง\n- ห้าม! ให้ผู้ป่วยดื่มน้ำหรือกินยาจนกว่าจะฟื้นสติสมบูรณ์' },
      { title: 'เมื่อไหร่ควรเรียกรถพยาบาล (1669)?', body: '- ชักต่อเนื่องนานเกิน 5 นาที\n- ชักซ้ำติดกันโดยที่ยังไม่ฟื้นสติ\n- ชักในน้ำ\n- ได้รับบาดเจ็บรุนแรงขณะชัก\n- เป็นการชักครั้งแรกในชีวิต\n- ผู้ป่วยตั้งครรภ์หรือเป็นโรคเบาหวาน\n- ผู้ป่วยไม่หายใจหลังหยุดชัก', ref: 'American Epilepsy Society. Seizure First Aid. [Online]' }
    ]
  },
  'self-observation': {
    title: 'การสังเกตอาการตนเอง',
    sections: [
      { title: 'สัญญาณเตือนก่อนชัก (Aura)', body: 'ผู้ป่วยบางรายอาจมีความรู้สึกเตือนก่อนชัก เช่น:\n- รู้สึกมวนท้องแปลกๆ\n- ได้กลิ่นหรือรสชาติที่ไม่มีอยู่จริง\n- รู้สึกเดจาวู (เหมือนเคยเห็นเหตุการณ์นี้มาก่อน)\n- รู้สึกกลัวหรือกังวลอย่างกะทันหัน\n- ชาหรือวูบตามตัว' },
      { title: 'การบันทึกอาการ (Seizure Diary)', body: 'การบันทึกข้อมูลในแอปนี้จะช่วยให้แพทย์รักษาได้แม่นยำขึ้น:\n- วันและเวลาที่ชัก\n- ระยะเวลาที่ชัก\n- ลักษณะอาการ (เกร็ง, กระตุก, เหม่อ)\n- ปัจจัยกระตุ้น (อดนอน, เครียด, ลืมกินยา, มีไข้)\n- อาการหลังชัก (สับสน, ปวดหัว, อ่อนแรง)' }
    ]
  },
  'research-evidence': {
    title: 'หลักฐานเชิงประจักษ์และงานวิจัย',
    sections: [
      { title: 'ประสิทธิภาพของแอปพลิเคชันในการจัดการโรคลมชัก', body: 'งานวิจัยพบว่าการใช้ Mobile Health (mHealth) ช่วยเพิ่มความร่วมมือในการกินยา (Medication Adherence) และลดความถี่ของอาการชักได้อย่างมีนัยสำคัญ เมื่อเทียบกับการบันทึกด้วยกระดาษแบบเดิม', ref: 'Escoffery C, et al. A systematic review of self-management interventions for adults with epilepsy. Epilepsy Behav. 2015.' },
      { title: 'ความสำคัญของการป้องกันการชักหลัง TBI', body: 'การให้ยากันชักในช่วง 7 วันแรกหลังบาดเจ็บที่ศีรษะระดับรุนแรง เป็นมาตรฐานการรักษาที่ได้รับการยอมรับทั่วโลก (Level I evidence)', ref: 'Brain Trauma Foundation. Guidelines for the Management of Severe Traumatic Brain Injury. 4th Edition.' }
    ]
  }
};

function showLearnDetail(topicId) {
  const content = LEARN_CONTENT[topicId];
  if (!content) return;

  document.getElementById('learnDetailTitle').textContent = content.title;
  document.getElementById('learnDetailContent').innerHTML = content.sections.map(s => `
    <div class="detail-card">
      <h4>${s.title}</h4>
      <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: var(--text1)">${s.body}</p>
      ${s.ref ? `<div class="ref-box"><strong>อ้างอิง:</strong> ${s.ref}</div>` : ''}
    </div>
  `).join('');

  showTab('learnDetail');
}

/* ===== ASSESSMENT (SEIZURE & SIDE EFFECTS) ===== */
function renderAssess() {
  const seizureLogs = getData('seizureLogs').sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  const sideEffectLogs = getData('sideEffectLogs').sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  document.getElementById('seizureLogsList').innerHTML = seizureLogs.length ? seizureLogs.map(log => `
    <div class="log-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px">
        <strong>${log.date} ${log.time}</strong>
        <span class="badge" style="background: ${SEVERITY_DESCRIPTIONS[parseInt(log.severity) || 1].color}; color: white; font-size: 11px">ระดับ ${log.severity}</span>
      </div>
      <div style="font-size: 13px; color: var(--text2)">
        <i class="fas fa-clock"></i> นาน ${log.duration} | <i class="fas fa-notes-medical"></i> ${log.symptoms}
      </div>
      ${log.notes ? `<div style="font-size: 12px; color: var(--text3); margin-top: 4px; font-style: italic">"${log.notes}"</div>` : ''}
    </div>
  `).join('') : '<p class="empty-text">ยังไม่มีประวัติการชัก</p>';

  document.getElementById('sideEffectLogsList').innerHTML = sideEffectLogs.length ? sideEffectLogs.map(log => `
    <div class="log-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px">
        <strong>${log.date}</strong>
        <span class="badge" style="background: ${SIDE_EFFECT_SEVERITY_DESCRIPTIONS[parseInt(log.severity) || 1].color}; color: white; font-size: 11px">ระดับ ${log.severity}</span>
      </div>
      <div style="font-size: 13px; color: var(--text2)">
        <i class="fas fa-pills"></i> ยาที่สงสัย: ${log.suspectedMeds}
      </div>
      <div style="font-size: 13px; color: var(--text2); margin-top: 2px">
        <i class="fas fa-exclamation-triangle"></i> อาการ: ${log.symptoms}
      </div>
      ${log.notes ? `<div style="font-size: 12px; color: var(--text3); margin-top: 4px; font-style: italic">"${log.notes}"</div>` : ''}
    </div>
  `).join('') : '<p class="empty-text">ยังไม่มีประวัติผลข้างเคียง</p>';
}

async function saveSeizureLog() {
  const duration = document.getElementById('seizureDuration').value;
  if (!duration) { showToast('กรุณาเลือกระยะเวลาที่ชัก'); return; }

  const severity = document.getElementById('seizureSevBadge').textContent;
  const date = document.getElementById('seizureDate').textContent;
  const time = document.getElementById('seizureTime').textContent;
  const notes = document.getElementById('seizureNotes').value.trim();
  const symptoms = seizureSymptoms.join(', ');

  const logs = getData('seizureLogs');
  const newLog = { id: genId(), date, time, duration, symptoms, severity, notes, timestamp: Date.now() };
  logs.push(newLog);
  setData('seizureLogs', logs);

  // ส่งข้อมูลไป Google Sheets
  await syncDataToSheet('seizure', {
    date, time, duration, symptoms, severity, notes
  });

  closeModal('seizureModal');
  renderAssess();
  showToast('บันทึกอาการชักเรียบร้อยแล้ว');
}

async function saveSideEffectLog() {
  if (sideEffectSymptoms.length === 0) { showToast('กรุณาเลือกอาการอย่างน้อย 1 อย่าง'); return; }

  const severity = document.getElementById('sideEffectSevBadge').textContent;
  const date = document.getElementById('sideEffectDate').textContent;
  const meds = sideEffectMeds.join(', ');
  const symptoms = sideEffectSymptoms.join(', ');
  const notes = document.getElementById('sideEffectNotes').value.trim();

  const logs = getData('sideEffectLogs');
  const newLog = { id: genId(), date, suspectedMeds: meds, symptoms, severity, notes, timestamp: Date.now() };
  logs.push(newLog);
  setData('sideEffectLogs', logs);

  // ส่งข้อมูลไป Google Sheets
  await syncDataToSheet('side_effect', {
    date, suspectedMeds: meds, symptoms, severity, notes
  });

  closeModal('sideEffectModal');
  renderAssess();
  showToast('บันทึกผลข้างเคียงเรียบร้อยแล้ว');
}

/* ===== PROFILE ===== */
function renderProfile() {
  const profile = getObj('profile') || {};
  const sections = [
    {
      title: 'ข้อมูลทั่วไป',
      rows: [
        { key: 'name', label: 'ชื่อ-นามสกุล', placeholder: 'ยังไม่ได้ระบุ' },
        { key: 'age', label: 'อายุ', placeholder: 'ยังไม่ได้ระบุ', type: 'number' },
        { key: 'diagnosis', label: 'การวินิจฉัย', placeholder: 'ยังไม่ได้ระบุ' }
      ]
    },
    {
      title: 'การนัดหมาย',
      rows: [
        { key: 'doctorName', label: 'แพทย์ผู้รักษา', placeholder: 'ยังไม่ได้ระบุ' },
        { key: 'doctorPhone', label: 'เบอร์โทรแผนก/รพ.', placeholder: 'ยังไม่ได้ระบุ', type: 'tel' },
        { key: 'nextAppointment', label: 'นัดครั้งถัดไป', placeholder: 'ยังไม่ได้ระบุ', type: 'date' }
      ]
    },
    {
      title: 'ติดต่อฉุกเฉิน',
      rows: [
        { key: 'emergencyContact', label: 'ผู้ติดต่อฉุกเฉิน', placeholder: 'ยังไม่ได้ระบุ' },
        { key: 'emergencyPhone', label: 'เบอร์โทรฉุกเฉิน', placeholder: 'ยังไม่ได้ระบุ', type: 'tel' }
      ]
    }
  ];

  document.getElementById('profileContent').innerHTML = sections.map(section => `
    <div class="detail-card">
      <h4>${section.title}</h4>
      <div class="profile-grid">
        ${section.rows.map(r => `
          <div class="profile-item">
            <div class="profile-label">${r.label}</div>
            ${editingProfile
              ? `<input class="profile-input" id="pf_${r.key}" value="${profile[r.key]||''}" placeholder="${r.placeholder}" type="${r.type||'text'}">`
              : `<span class="profile-value ${!profile[r.key]?'placeholder':''}">${profile[r.key] || r.placeholder}</span>`
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
      <p>หมายเหตุ: ยาบางชนิด เช่น Valproate (วัลโปรเอต), Phenytoin (เฟนิโทอิน), Carbamazepine (คาร์บามาซีพีน), Levetiracetam (ลีเวไทราซีแทม) อาจมีข้อแนะนำเฉพาะ แต่หลักใหญ่เหมือนกัน คือ กินทันทีที่นึกได้ ถ้าใกล้มื้อต่อไปให้ข้าม และไม่กินซ้ำสองเท่า</p>
    </div>`;
}

function calcMissedDose(hours) {
  const interval = 24 / missedDoseFreq;
  const half = interval / 2;
  missedDoseStep = hours <= half ? 'take-now' : 'skip-wait';
  renderMissedDoseContent();
}

/* ===== SYMPTOM HELPERS ===== */
function renderSeizureSymptoms() {
  const container = document.getElementById('seizureSymptoms');
  container.innerHTML = SEIZURE_SYMPTOMS.map(s => {
    const sel = seizureSymptoms.includes(s.name);
    return `<div class="chip ${sel?'active':''}" onclick="toggleSeizureSymptom('${s.name}')">${s.name}</div>`;
  }).join('');
}
function toggleSeizureSymptom(name) {
  if (seizureSymptoms.includes(name)) seizureSymptoms = seizureSymptoms.filter(s=>s!==name);
  else seizureSymptoms.push(name);
  renderSeizureSymptoms();
  calculateSeizureSeverity();
}
function calculateSeizureSeverity() {
  const duration = document.getElementById('seizureDuration').value;
  let score = 0;
  if (duration === '> 5 นาที') score = 5;
  else if (duration === '2-5 นาที') score = 4;
  else if (duration === '1-2 นาที') score = 3;
  else if (duration === '30-60 วินาที') score = 2;
  else if (duration === '< 30 วินาที') score = 1;
  seizureSymptoms.forEach(name => {
    const s = SEIZURE_SYMPTOMS.find(x => x.name === name);
    if (s && s.weight > score) score = s.weight;
  });
  const sev = SEVERITY_DESCRIPTIONS[score || 1];
  document.getElementById('seizureSevBadge').textContent = score || '1';
  document.getElementById('seizureSevBadge').style.background = sev.color;
  document.getElementById('seizureSevLabel').textContent = sev.label;
  document.getElementById('seizureSeverityDesc').textContent = sev.desc;
}

function renderSideEffectSymptoms() {
  const container = document.getElementById('sideEffectSymptoms');
  container.innerHTML = SIDE_EFFECTS_LIST.map(s => {
    const sel = sideEffectSymptoms.includes(s.name);
    return `<div class="chip ${sel?'active':''}" onclick="toggleSideEffectSymptom('${s.name}')">${s.name}</div>`;
  }).join('');
}
function toggleSideEffectSymptom(name) {
  if (sideEffectSymptoms.includes(name)) sideEffectSymptoms = sideEffectSymptoms.filter(s=>s!==name);
  else sideEffectSymptoms.push(name);
  renderSideEffectSymptoms();
  calculateSideEffectSeverity();
}
function calculateSideEffectSeverity() {
  let score = 0;
  sideEffectSymptoms.forEach(name => {
    const s = SIDE_EFFECTS_LIST.find(x => x.name === name);
    if (s && s.weight > score) score = s.weight;
  });
  const sev = SIDE_EFFECT_SEVERITY_DESCRIPTIONS[score || 1];
  document.getElementById('sideEffectSevBadge').textContent = score || '1';
  document.getElementById('sideEffectSevBadge').style.background = sev.color;
  document.getElementById('sideEffectSevLabel').textContent = sev.label;
  document.getElementById('sideEffectSeverityDesc').textContent = sev.desc;
}

function renderSideEffectMeds() {
  const meds = getData('medications');
  document.getElementById('sideEffectMeds').innerHTML = meds.map(m => {
    const sel = sideEffectMeds.includes(m.name);
    return `<div class="chip ${sel?'active':''}" onclick="toggleSideEffectMed('${m.name}')">${m.name}</div>`;
  }).join('');
}
function toggleSideEffectMed(name) {
  if (sideEffectMeds.includes(name)) sideEffectMeds = sideEffectMeds.filter(m=>m!==name);
  else sideEffectMeds.push(name);
  renderSideEffectMeds();
}

function initSeizureModal() {
  const now = new Date();
  document.getElementById('seizureDate').textContent = now.toLocaleDateString('th-TH');
  document.getElementById('seizureTime').textContent = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('seizureDuration').value = '';
  document.getElementById('seizureNotes').value = '';
  seizureSymptoms = [];
  renderSeizureSymptoms();
  calculateSeizureSeverity();
}

function initSideEffectModal() {
  document.getElementById('sideEffectDate').textContent = new Date().toLocaleDateString('th-TH');
  document.getElementById('sideEffectNotes').value = '';
  sideEffectSymptoms = [];
  sideEffectMeds = [];
  renderSideEffectMeds();
  renderSideEffectSymptoms();
  calculateSideEffectSeverity();
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
  const savedUser = localStorage.getItem('seizguard_currentUser');
  if (savedUser) {
    const users = JSON.parse(localStorage.getItem('seizguard_users') || '{}');
    if (users[savedUser]) {
      currentUser = savedUser;
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
