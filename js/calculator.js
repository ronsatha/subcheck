// calculator.js - SubCheck calculator logic

// ── Category & preset config ────────────────────────────────────
const CATEGORIES = [
    { value: 'streaming', label: 'Streaming' },
    { value: 'software',  label: 'Software' },
    { value: 'music',     label: 'Music' },
    { value: 'gaming',    label: 'Gaming' },
    { value: 'fitness',   label: 'Fitness' },
    { value: 'news',      label: 'News / Media' },
    { value: 'food',      label: 'Food / Delivery' },
    { value: 'cloud',     label: 'Cloud Storage' },
    { value: 'other',     label: 'Other' },
];

const PRESETS = [
    { name: 'Netflix',        cost: 15.49,  category: 'streaming' },
    { name: 'Spotify',        cost: 11.99,  category: 'music' },
    { name: 'YouTube Premium',cost: 13.99,  category: 'streaming' },
    { name: 'Disney+',        cost: 13.99,  category: 'streaming' },
    { name: 'Hulu',           cost: 17.99,  category: 'streaming' },
    { name: 'Amazon Prime',   cost: 14.99,  category: 'streaming' },
    { name: 'Apple Music',    cost: 10.99,  category: 'music' },
    { name: 'ChatGPT Plus',   cost: 20.00,  category: 'software' },
    { name: 'Adobe CC',       cost: 59.99,  category: 'software' },
    { name: 'iCloud+',        cost: 2.99,   category: 'cloud' },
    { name: 'Xbox Game Pass', cost: 16.99,  category: 'gaming' },
    { name: 'Gym Membership', cost: 49.99,  category: 'fitness' },
];

// ── DOM references ──────────────────────────────────────────────
const container    = document.getElementById('subscriptionContainer');
const addRowBtn    = document.getElementById('addRow');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn     = document.getElementById('clearBtn');
const presetsDiv   = document.getElementById('presets');

// ── Analytics events ────────────────────────────────────────────
function trackEvent(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
}
let calculatorStarted = false;
function markCalculatorStarted() {
    if (!calculatorStarted) {
        calculatorStarted = true;
        trackEvent('calculator_started');
    }
}

// ── Row counter (for unique IDs) ────────────────────────────────
let rowId = 0;

// ── Create a subscription row ───────────────────────────────────
function createRow(data = {}) {
    const id = rowId++;
    const row = document.createElement('div');
    row.className = 'subscription-row grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3 items-start bg-gray-50 dark:bg-gray-700 sm:bg-transparent border border-gray-100 dark:border-gray-700 sm:border-0 rounded-xl p-3 sm:p-0';
    row.dataset.id = id;
    if (data.presetName) row.dataset.preset = data.presetName;

    const categoryOptions = CATEGORIES.map(c =>
        `<option value="${c.value}" ${c.value === (data.category || '') ? 'selected' : ''}>${c.label}</option>`
    ).join('');

    row.innerHTML = `
        <div class="sm:col-span-4">
            <input type="text"
                   placeholder="e.g. Netflix"
                   value="${data.name || ''}"
                   class="service-name w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                   aria-label="Service name" />
        </div>
        <div class="sm:col-span-2 relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
            <input type="number"
                   placeholder="0.00"
                   step="0.01"
                   min="0"
                   value="${data.cost != null ? data.cost : ''}"
                   class="cost w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                   aria-label="Monthly cost" />
        </div>
        <div class="sm:col-span-2">
            <select class="frequency w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:border-brand focus:ring-1 focus:ring-brand"
                    aria-label="Billing frequency">
                <option value="monthly"   ${data.frequency === 'monthly'   ? 'selected' : ''}>Monthly</option>
                <option value="quarterly"  ${data.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                <option value="yearly"     ${data.frequency === 'yearly'    ? 'selected' : ''}>Yearly</option>
            </select>
        </div>
        <div class="sm:col-span-3">
            <select class="category w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:border-brand focus:ring-1 focus:ring-brand"
                    aria-label="Category">
                ${categoryOptions}
            </select>
        </div>
        <div class="sm:col-span-1 flex items-center justify-center">
            <button class="delete-row w-8 h-8 rounded-full text-gray-300 hover:text-warning hover:bg-red-50 flex items-center justify-center text-lg transition"
                    aria-label="Delete row">&times;</button>
        </div>
    `;

    // Wire up delete
    row.querySelector('.delete-row').addEventListener('click', () => {
        row.remove();
        updateRunningTotal();
        syncPresetButtons();
    });

    // If the service name is edited away from a preset, free that preset button again
    row.querySelector('.service-name').addEventListener('input', syncPresetButtons);

    // Wire up live total updates
    row.querySelector('.cost').addEventListener('input', updateRunningTotal);
    row.querySelector('.frequency').addEventListener('change', updateRunningTotal);

    container.appendChild(row);
    updateRunningTotal();
    return row;
}

// ── Running total display ───────────────────────────────────────
function updateRunningTotal() {
    let monthly = 0;
    container.querySelectorAll('.subscription-row').forEach(row => {
        const cost = parseFloat(row.querySelector('.cost').value) || 0;
        const freq = row.querySelector('.frequency').value;
        if (freq === 'quarterly')  monthly += cost / 3;
        else if (freq === 'yearly') monthly += cost / 12;
        else monthly += cost;
    });

    document.getElementById('runningMonthly').textContent = `$${monthly.toFixed(2)}`;
    document.getElementById('runningYearly').textContent  = `$${(monthly * 12).toFixed(2)}`;
    const mm = document.getElementById('mobileMonthly');
    const my = document.getElementById('mobileYearly');
    if (mm) mm.textContent = `$${monthly.toFixed(2)}/mo`;
    if (my) my.textContent = `$${(monthly * 12).toFixed(2)}/year`;
}

// ── Gather subscription data from rows ──────────────────────────
function gatherSubscriptions() {
    const subs = [];
    container.querySelectorAll('.subscription-row').forEach(row => {
        const name      = row.querySelector('.service-name').value.trim();
        const cost      = parseFloat(row.querySelector('.cost').value);
        const frequency = row.querySelector('.frequency').value;
        const category  = row.querySelector('.category').value;
        if (name && cost > 0) {
            subs.push({ name, cost, frequency, category });
        }
    });
    return subs;
}

// ── Event: Add Row ──────────────────────────────────────────────
addRowBtn.addEventListener('click', () => {
    markCalculatorStarted();
    const row = createRow();
    row.querySelector('.service-name').focus();
});

container.addEventListener('input', markCalculatorStarted);

// ── Event: Clear All ────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all subscriptions?')) return;
    container.innerHTML = '';
    Storage.clear();
    createRow(); // leave one empty row
    syncPresetButtons();
});

// ── Event: Calculate ────────────────────────────────────────────
calculateBtn.addEventListener('click', () => {
    const subs = gatherSubscriptions();
    if (subs.length === 0) {
        alert('Please add at least one subscription with a name and cost.');
        return;
    }
    trackEvent('calculator_completed', { subscription_count: subs.length });
    Storage.save(subs);
    window.location.href = 'results.html';
});

// ── Preset Buttons ──────────────────────────────────────────────
const PRESET_ICONS = {
    'Netflix': '🎬', 'Spotify': '🎵', 'YouTube Premium': '▶️', 'Disney+': '✨',
    'Hulu': '📺', 'Amazon Prime': '📦', 'Apple Music': '🎧', 'ChatGPT Plus': '🤖',
    'Adobe CC': '🎨', 'iCloud+': '☁️', 'Xbox Game Pass': '🎮', 'Gym Membership': '💪',
};

function presetButtonLabel(preset, added) {
    const icon = PRESET_ICONS[preset.name] || '➕';
    return added
        ? `<span>✓</span> ${preset.name} <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">added</span>`
        : `<span>${icon}</span> ${preset.name} <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">$${preset.cost.toFixed(2)}</span>`;
}

// A preset button is disabled only while a row with that service name exists.
// Deleting the row, clearing all, or renaming the row frees the button again.
function syncPresetButtons() {
    const namesInUse = new Set();
    container.querySelectorAll('.subscription-row').forEach(row => {
        const n = row.querySelector('.service-name').value.trim();
        if (n) namesInUse.add(n);
    });
    presetsDiv.querySelectorAll('button[data-preset]').forEach(btn => {
        const preset = PRESETS.find(pr => pr.name === btn.dataset.preset);
        if (!preset) return;
        const added = namesInUse.has(preset.name);
        btn.classList.toggle('opacity-50', added);
        btn.classList.toggle('pointer-events-none', added);
        btn.disabled = added;
        btn.innerHTML = presetButtonLabel(preset, added);
    });
}

PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-brand hover:bg-blue-50 text-gray-700 dark:text-gray-300 hover:text-brand text-sm rounded-lg transition font-medium shadow-sm hover:shadow';
    btn.dataset.preset = preset.name;
    btn.innerHTML = presetButtonLabel(preset, false);
    btn.addEventListener('click', () => {
        markCalculatorStarted();
        createRow({ name: preset.name, cost: preset.cost, frequency: 'monthly', category: preset.category, presetName: preset.name });
        syncPresetButtons();
    });
    presetsDiv.appendChild(btn);
});

// ── Preset search ───────────────────────────────────────────────
const presetSearch = document.getElementById('presetSearch');
if (presetSearch) {
    presetSearch.addEventListener('input', () => {
        const q = presetSearch.value.trim().toLowerCase();
        presetsDiv.querySelectorAll('button[data-preset]').forEach(btn => {
            btn.style.display = (!q || btn.dataset.preset.toLowerCase().includes(q)) ? '' : 'none';
        });
    });
}

// ── Sample data ─────────────────────────────────────────────────
const SAMPLE_DATA = [
    { name: 'Netflix', cost: 15.49, frequency: 'monthly', category: 'streaming' },
    { name: 'Spotify', cost: 11.99, frequency: 'monthly', category: 'music' },
    { name: 'Disney+', cost: 13.99, frequency: 'monthly', category: 'streaming' },
    { name: 'ChatGPT Plus', cost: 20.00, frequency: 'monthly', category: 'software' },
    { name: 'iCloud+', cost: 2.99, frequency: 'monthly', category: 'cloud' },
    { name: 'Gym Membership', cost: 49.99, frequency: 'monthly', category: 'fitness' },
];
const sampleBtn = document.getElementById('sampleBtn');
if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
        markCalculatorStarted();
        container.innerHTML = '';
        SAMPLE_DATA.forEach(sub => createRow(sub));
        syncPresetButtons();
        trackEvent('sample_data_loaded', { subscription_count: SAMPLE_DATA.length });
    });
}

// ── CSV import (accepts the format of SubCheck's own CSV export) ──
function parseCsvLine(line) {
    const fields = [];
    const re = /"([^"]*)"|([^,]+)/g;
    let m;
    while ((m = re.exec(line)) !== null) fields.push((m[1] !== undefined ? m[1] : m[2]).trim());
    return fields;
}
const csvImport = document.getElementById('csvImport');
if (csvImport) {
    csvImport.addEventListener('change', () => {
        const file = csvImport.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const labelToValue = {};
            CATEGORIES.forEach(c => { labelToValue[c.label.toLowerCase()] = c.value; });
            let added = 0;
            String(reader.result).split(/\r?\n/).forEach((line, idx) => {
                if (!line.trim() || idx === 0) return; // skip header
                const f = parseCsvLine(line);
                const name = f[0];
                const cost = parseFloat(f[1]);
                if (!name || !(cost > 0) || /total/i.test(name)) return;
                const freq = ['monthly', 'quarterly', 'yearly'].includes((f[2] || '').toLowerCase()) ? f[2].toLowerCase() : 'monthly';
                const cat = labelToValue[(f[3] || '').toLowerCase()] || (CATEGORIES.some(c => c.value === (f[3] || '').toLowerCase()) ? f[3].toLowerCase() : 'other');
                createRow({ name, cost, frequency: freq, category: cat });
                added++;
            });
            if (added > 0) {
                markCalculatorStarted();
                syncPresetButtons();
                trackEvent('csv_imported', { subscription_count: added });
            } else {
                alert('No subscriptions found in that CSV. Expected columns: Service Name, Cost, Billing Frequency, Category.');
            }
            csvImport.value = '';
        };
        reader.readAsText(file);
    });
}

const mobileCalcBtn = document.getElementById('mobileCalculateBtn');
if (mobileCalcBtn) mobileCalcBtn.addEventListener('click', () => calculateBtn.click());

// ── Init: Load saved data or ask user ───────────────────────────
(function init() {
    // Homepage sample link: calculator.html?sample=1 loads the sample audit directly
    if (new URLSearchParams(window.location.search).get('sample') === '1') {
        SAMPLE_DATA.forEach(sub => createRow(sub));
        syncPresetButtons();
        trackEvent('sample_data_loaded', { subscription_count: SAMPLE_DATA.length });
        return;
    }
    const saved = Storage.load();
    if (saved.length > 0) {
        // Show welcome back prompt
        const loadPrevious = confirm(
            'Welcome back! You have ' + saved.length + ' subscription' +
            (saved.length > 1 ? 's' : '') + ' saved from last time.\n\n' +
            'Click OK to load them, or Cancel to start fresh.'
        );
        if (loadPrevious) {
            saved.forEach(sub => createRow(sub));
            syncPresetButtons();
        } else {
            Storage.clear();
            createRow();
        }
    } else {
        createRow();
    }
})();
