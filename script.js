// Mock Storage System
let medications = JSON.parse(localStorage.getItem('seizguard_meds')) || [
    { id: 1, name: "Phenytoin", dosage: "100mg", instructions: "หลังอาหาร", color: "#3b82f6", schedules: [{ id: 101, time: "08:00", status: "pending" }] },
    { id: 2, name: "Levetiracetam", dosage: "500mg", instructions: "ท้องว่าง", color: "#8b5cf6", schedules: [{ id: 102, time: "20:00", status: "pending" }] }
];

// App State
const state = {
    currentView: 'home-view',
};

// UI Elements
const containers = {
    nextDose: document.getElementById('next-dose-container'),
    schedule: document.getElementById('today-schedule-container'),
    medList: document.getElementById('med-list-container'),
    date: document.getElementById('current-date')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    setupNavigation();
    setupModals();
    renderApp();
});

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    containers.date.innerText = now.toLocaleDateString('en-US', options);
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            switchView(view);
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    state.currentView = viewId;
    renderApp();
}

function renderApp() {
    if (state.currentView === 'home-view') renderHome();
    if (state.currentView === 'medications-view') renderMedications();
    updateHistoryStats();
}

function renderHome() {
    // Flatten schedules for timeline
    const allDoses = medications.flatMap(med => 
        med.schedules.map(s => ({ ...s, medName: med.name, medDosage: med.dosage, medColor: med.color, medInstructions: med.instructions }))
    ).sort((a, b) => a.time.localeCompare(b.time));

    // Next Dose
    const nextPending = allDoses.find(d => d.status === 'pending');
    containers.nextDose.innerHTML = nextPending ? createDoseCard(nextPending, true) : '<div class="text-sm text-gray-400 italic">ไม่มีมื้อยาถัดไปสำหรับวันนี้</div>';

    // Today's Schedule (remaining)
    const remaining = allDoses.filter(d => d !== nextPending);
    containers.schedule.innerHTML = remaining.length ? remaining.map(d => createDoseCard(d, false)).join('') : 
        (allDoses.length === 0 ? '<div class="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200"><p class="text-gray-400">ยังไม่มีรายการยา</p></div>' : '');
}

function createDoseCard(dose, isHighlight) {
    const isComplete = dose.status !== 'pending';
    return `
        <div class="dose-card ${isComplete ? 'complete' : ''} ${isHighlight ? 'scale-[1.02] shadow-md mb-2' : ''}">
            <div class="accent-bar" style="background-color: ${dose.medColor}"></div>
            <div class="flex items-start justify-between pl-3">
                <div>
                    <div class="flex items-center gap-2 text-gray-400 mb-1">
                        <i class="far fa-clock text-xs"></i>
                        <span class="text-xs font-bold">${dose.time}</span>
                    </div>
                    <h3 class="text-lg font-extrabold ${isComplete ? 'line-through opacity-50' : ''}">${dose.medName}</h3>
                    <p class="text-xs text-gray-500 font-bold mt-0.5">${dose.medDosage} • ${dose.medInstructions}</p>
                </div>
                <div class="flex items-center justify-center bg-blue-50 rounded-full w-9 h-9">
                    <i class="fas fa-pills text-blue-500 text-sm"></i>
                </div>
            </div>
            <div class="mt-5 flex gap-2 pl-3">
                ${isComplete ? `
                    <div class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs w-full justify-center ${dose.status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        <i class="fas ${dose.status === 'taken' ? 'fa-check' : 'fa-times'}"></i>
                        ${dose.status === 'taken' ? 'ทานแล้ว' : 'ข้าม'}
                    </div>
                ` : `
                    <button onclick="logDose(${dose.id}, 'taken')" class="flex-1 bg-blue-500 text-white rounded-xl h-10 text-xs font-bold shadow-lg shadow-blue-500/20">
                        <i class="fas fa-check mr-1"></i> ทานแล้ว
                    </button>
                    <button onclick="logDose(${dose.id}, 'skipped')" class="px-4 border border-gray-200 text-gray-500 rounded-xl h-10 text-xs font-bold">
                        ข้าม
                    </button>
                `}
            </div>
        </div>
    `;
}

function renderMedications() {
    containers.medList.innerHTML = medications.length ? medications.map((med, idx) => `
        <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background-color: ${med.color}"></div>
            <div class="flex justify-between items-start pl-3">
                <div>
                    <h3 class="text-lg font-bold">${med.name}</h3>
                    <p class="text-sm text-gray-500 font-medium">${med.dosage}</p>
                </div>
                <button onclick="deleteMedication(${med.id})" class="text-gray-300 hover:text-red-500 p-1">
                    <i class="fas fa-trash-alt text-sm"></i>
                </button>
            </div>
            <div class="pl-3 grid grid-cols-2 gap-2 mt-4">
                <div class="bg-gray-50 rounded-xl p-2.5">
                    <span class="text-[10px] text-gray-400 font-bold block mb-1">ความถี่</span>
                    <span class="text-xs font-bold">ทุกวัน</span>
                </div>
                <div class="bg-gray-50 rounded-xl p-2.5">
                    <span class="text-[10px] text-gray-400 font-bold block mb-1">วิธีใช้</span>
                    <span class="text-xs font-bold truncate">${med.instructions}</span>
                </div>
            </div>
            <div class="pl-3 mt-4 flex gap-1.5">
                ${med.schedules.map(s => `<span class="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-500 text-[10px] font-bold border border-blue-100">${s.time}</span>`).join('')}
            </div>
        </div>
    `).join('') : '<div class="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200"><p class="text-gray-400">ยังไม่มีรายการยา</p></div>';
}

// Actions
window.logDose = (scheduleId, status) => {
    medications.forEach(med => {
        med.schedules.forEach(s => {
            if (s.id === scheduleId) s.status = status;
        });
    });
    saveAndRender();
};

window.deleteMedication = (id) => {
    if (confirm('คุณต้องการลบรายการยานี้ใช่หรือไม่?')) {
        medications = medications.filter(m => m.id !== id);
        saveAndRender();
    }
};

function saveAndRender() {
    localStorage.setItem('seizguard_meds', JSON.stringify(medications));
    renderApp();
}

function updateHistoryStats() {
    const doses = medications.flatMap(m => m.schedules);
    const taken = doses.filter(d => d.status === 'taken').length;
    const percent = doses.length ? Math.round((taken / doses.length) * 100) : 0;
    
    const bar = document.getElementById('history-progress');
    const text = document.getElementById('history-stats-text');
    if (bar) bar.style.width = percent + '%';
    if (text) text.innerText = `คุณทานยาครบ ${percent}% ในวันนี้`;
}

// Modals
function setupModals() {
    const overlay = document.getElementById('modal-overlay');
    const addModal = document.getElementById('add-med-modal');
    
    document.getElementById('add-med-btn').addEventListener('click', () => {
        overlay.classList.remove('hidden');
        addModal.classList.remove('hidden');
    });

    document.getElementById('cancel-med').addEventListener('click', () => {
        overlay.classList.add('hidden');
        addModal.classList.add('hidden');
    });

    document.getElementById('save-med').addEventListener('click', () => {
        const name = document.getElementById('new-med-name').value;
        const dosage = document.getElementById('new-med-dosage').value;
        const time = document.getElementById('new-med-time').value;

        if (name && dosage && time) {
            medications.push({
                id: Date.now(),
                name,
                dosage,
                instructions: 'ตามแพทย์สั่ง',
                color: '#3b82f6',
                schedules: [{ id: Date.now() + 1, time, status: 'pending' }]
            });
            saveAndRender();
            overlay.classList.add('hidden');
            addModal.classList.add('hidden');
            // Reset form
            document.getElementById('new-med-name').value = '';
            document.getElementById('new-med-dosage').value = '';
        }
    });

    document.getElementById('log-seizure-btn').addEventListener('click', () => {
        alert('บันทึกอาการชัก: ฟีเจอร์นี้จะถูกเพิ่มในเวอร์ชันถัดไป');
    });
}
