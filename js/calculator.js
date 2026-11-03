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
    { name: 'Netflix',        cost: 19.99,  category: 'streaming' },
    { name: 'Spotify',        cost: 12.99,  category: 'music' },
    { name: 'YouTube Premium',cost: 15.99,  category: 'streaming' },
    { name: 'Disney+',        cost: 21.49,  category: 'streaming' },
    { name: 'Hulu',           cost: 21.49,  category: 'streaming' },
    { name: 'Amazon Prime',   cost: 14.99,  category: 'streaming' },
    { name: 'Apple Music',    cost: 11.99,  category: 'music' },
    { name: 'ChatGPT Plus',   cost: 20.00,  category: 'software' },
    { name: 'Adobe CC',       cost: 69.99,  category: 'software' },
    { name: 'iCloud+',        cost: 2.99,   category: 'cloud' },
    { name: 'Xbox Game Pass Ultimate', cost: 22.99, category: 'gaming' },
    { name: 'Gym Membership', cost: 49.99,  category: 'fitness' },
    { name: 'Newspaper',      cost: 14.99,  category: 'news' },
    { name: 'Magazine',       cost: 9.99,   category: 'news' },
    { name: 'Home Security',  cost: 24.99,  category: 'other' },
    { name: 'Antivirus',      cost: 4.99,   category: 'software' },
    { name: 'VPN',            cost: 4.99,   category: 'software' },
    { name: 'Charity Donation', cost: 10.00, category: 'other' },
];

// Sample data with renewal dates relative to today, so the demo always
// shows upcoming charges: Netflix in 9 days, Gym Membership in 21 days.
function sampleData() {
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };
    return SAMPLE_DATA.map(s => {
        const copy = { ...s };
        if (s.name === 'Netflix') copy.renewal = inDays(9);
        if (s.name === 'Gym Membership') copy.renewal = inDays(21);
        return copy;
    });
}

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
        <div class="sm:col-span-12 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span class="flex items-center gap-2">
                <label class="text-xs text-gray-400 whitespace-nowrap">Next renewal <span class="text-gray-300">(optional)</span></label>
                <input type="date"
                       value="${data.renewal || ''}"
                       class="renewal border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand"
                       aria-label="Next renewal date (optional)" />
            </span>
            <span class="flex items-center gap-2">
                <label class="text-xs text-gray-400 whitespace-nowrap">Whose bill?</label>
                <select class="tag border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-800 focus:border-brand focus:ring-1 focus:ring-brand" aria-label="Whose bill is this">
                    <option value="personal" ${(!data.tag || data.tag === 'personal') ? 'selected' : ''}>Personal</option>
                    <option value="business" ${data.tag === 'business' ? 'selected' : ''}>Business</option>
                    <option value="shared" ${data.tag === 'shared' ? 'selected' : ''}>Shared</option>
                </select>
            </span>
            <span class="flex items-center gap-2">
                <label class="text-xs text-gray-400 whitespace-nowrap">My share $</label>
                <input type="number" step="0.01" min="0" placeholder="0.00"
                       value="${data.share != null ? data.share : ''}"
                       class="share w-24 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand"
                       aria-label="My share of this plan (only for shared plans)" />
            </span>
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

    // The share field only applies to shared plans
    const tagSelect = row.querySelector('.tag');
    const shareInput = row.querySelector('.share');
    const syncShareState = () => {
        const isShared = tagSelect.value === 'shared';
        shareInput.disabled = !isShared;
        shareInput.classList.toggle('opacity-40', !isShared);
    };
    tagSelect.addEventListener('change', syncShareState);
    syncShareState();

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

    const fmtTotal = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('runningMonthly').textContent = `$${fmtTotal(monthly)}`;
    document.getElementById('runningYearly').textContent  = `$${fmtTotal(monthly * 12)}`;
    const mm = document.getElementById('mobileMonthly');
    const my = document.getElementById('mobileYearly');
    if (mm) mm.textContent = `$${fmtTotal(monthly)}/mo`;
    if (my) my.textContent = `$${fmtTotal(monthly * 12)}/year`;
}

// ── Gather subscription data from rows ──────────────────────────
function gatherSubscriptions() {
    const subs = [];
    container.querySelectorAll('.subscription-row').forEach(row => {
        const name      = row.querySelector('.service-name').value.trim();
        const cost      = parseFloat(row.querySelector('.cost').value);
        const frequency = row.querySelector('.frequency').value;
        const category  = row.querySelector('.category').value;
        const renewalEl = row.querySelector('.renewal');
        const renewal   = renewalEl ? renewalEl.value : '';
        const tagEl     = row.querySelector('.tag');
        const tag       = tagEl ? tagEl.value : 'personal';
        const shareEl   = row.querySelector('.share');
        const share     = shareEl ? parseFloat(shareEl.value) : NaN;
        if (name && cost > 0) {
            const sub = { name, cost, frequency, category };
            if (renewal) sub.renewal = renewal;
            if (tag === 'business' || tag === 'shared') sub.tag = tag;
            if (tag === 'shared' && share > 0) sub.share = Math.min(share, cost);
            subs.push(sub);
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

// ── Recall checklist: commonly forgotten charges add a blank row ──
document.querySelectorAll('.recall-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        markCalculatorStarted();
        createRow({ name: btn.dataset.name, cost: '', frequency: 'monthly', category: btn.dataset.category });
        const rows = container.querySelectorAll('.subscription-row');
        const last = rows[rows.length - 1];
        const costInput = last ? last.querySelector('.cost') : null;
        if (costInput) costInput.focus();
        trackEvent('recall_used', { item: btn.dataset.name });
    });
});

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
    { name: 'Netflix', cost: 19.99, frequency: 'monthly', category: 'streaming' },
    { name: 'Spotify', cost: 12.99, frequency: 'monthly', category: 'music' },
    { name: 'Disney+', cost: 21.49, frequency: 'monthly', category: 'streaming' },
    { name: 'ChatGPT Plus', cost: 20.00, frequency: 'monthly', category: 'software' },
    { name: 'iCloud+', cost: 2.99, frequency: 'monthly', category: 'cloud' },
    { name: 'Gym Membership', cost: 49.99, frequency: 'monthly', category: 'fitness' },
];
const sampleBtn = document.getElementById('sampleBtn');
if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
        markCalculatorStarted();
        container.innerHTML = '';
        sampleData().forEach(sub => createRow(sub));
        syncPresetButtons();
        trackEvent('sample_data_loaded', { subscription_count: SAMPLE_DATA.length });
    });
}

// ── CSV / spreadsheet import ────────────────────────────────────
// A SubCheck export imports directly. Any other CSV or TSV (a spreadsheet or a
// statement export) opens the column matcher below. Files are parsed locally
// in the browser; nothing is uploaded.
function parseCsvLine(line) {
    const fields = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') { cur += '"'; i++; }
                else inQuotes = false;
            } else cur += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === ',') { fields.push(cur.trim()); cur = ''; }
        else cur += ch;
    }
    fields.push(cur.trim());
    return fields;
}
function parseCsvText(text) {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const isTsv = firstLine.includes('\t');
    return text.split(/\r?\n/).filter(l => l.trim()).map(l =>
        isTsv ? l.split('\t').map(s => s.trim().replace(/^"|"$/g, '')) : parseCsvLine(l));
}
const categoryByLabel = {};
CATEGORIES.forEach(c => { categoryByLabel[c.label.toLowerCase()] = c.value; });
function normalizeFrequency(v) {
    const s = (v || '').toLowerCase();
    if (/year|annual/.test(s)) return 'yearly';
    if (/quarter/.test(s)) return 'quarterly';
    return 'monthly';
}
function normalizeCategory(v) {
    const s = (v || '').toLowerCase();
    return categoryByLabel[s] || (CATEGORIES.some(c => c.value === s) ? s : 'other');
}
function parseAmount(v) {
    const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : Math.abs(n);
}
function importRows(dataRows, map) {
    let added = 0;
    dataRows.forEach(f => {
        const name = (f[map.name] || '').trim();
        const cost = parseAmount(f[map.cost]);
        if (!name || !(cost > 0) || /^total/i.test(name)) return;
        const rowData = {
            name, cost,
            frequency: map.freq >= 0 ? normalizeFrequency(f[map.freq]) : 'monthly',
            category: map.cat >= 0 ? normalizeCategory(f[map.cat]) : 'other'
        };
        if (map.renewal >= 0 && /^\d{4}-\d{2}-\d{2}$/.test((f[map.renewal] || '').trim())) rowData.renewal = f[map.renewal].trim();
        if (map.tag >= 0) {
            const tg = (f[map.tag] || '').toLowerCase();
            if (tg === 'personal' || tg === 'business' || tg === 'shared') rowData.tag = tg;
        }
        if (map.share >= 0 && rowData.tag === 'shared') {
            const sh = parseAmount(f[map.share]);
            if (sh > 0) rowData.share = Math.min(sh, cost);
        }
        createRow(rowData);
        added++;
    });
    return added;
}
function guessColumn(headers, patterns) {
    for (const pat of patterns) {
        const i = headers.findIndex(h => pat.test(h));
        if (i > -1) return i;
    }
    return -1;
}
let pendingCsvRows = null;
function fillMapSelect(id, headers, chosen, allowNone) {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    if (allowNone) {
        const opt = document.createElement('option');
        opt.value = '-1'; opt.textContent = 'Not in this file';
        sel.appendChild(opt);
    }
    headers.forEach((h, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = h || ('Column ' + (i + 1));
        if (i === chosen) opt.selected = true;
        sel.appendChild(opt);
    });
    if (allowNone && chosen === -1) sel.value = '-1';
}
const csvImport = document.getElementById('csvImport');
if (csvImport) {
    csvImport.addEventListener('change', () => {
        const file = csvImport.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const rows = parseCsvText(String(reader.result));
            if (rows.length < 2) { alert('That file has no data rows to import.'); csvImport.value = ''; return; }
            const headers = rows[0].map(h => (h || '').toLowerCase());
            const map = {
                name: guessColumn(headers, [/service/, /name/, /description/, /merchant/, /payee/, /item/]),
                cost: guessColumn(headers, [/^cost/, /amount/, /price/, /charge/, /debit/]),
                freq: guessColumn(headers, [/frequ/, /billing/, /period/, /cycle/]),
                cat: guessColumn(headers, [/categor/, /type/, /group/]),
                renewal: guessColumn(headers, [/renew/, /next/]),
                tag: guessColumn(headers, [/^tag/, /whose/, /owner/]),
                share: guessColumn(headers, [/share/])
            };
            const looksLikeList = map.freq > -1 || map.cat > -1 || /service/.test(headers[map.name] || '');
            if (map.name > -1 && map.cost > -1 && looksLikeList) {
                finishCsvImport(importRows(rows.slice(1), map));
            } else {
                pendingCsvRows = rows;
                fillMapSelect('mapName', rows[0], map.name > -1 ? map.name : 0, false);
                fillMapSelect('mapCost', rows[0], map.cost > -1 ? map.cost : 1, false);
                fillMapSelect('mapFreq', rows[0], map.freq, true);
                fillMapSelect('mapCat', rows[0], map.cat, true);
                document.getElementById('csvMapPreview').textContent =
                    (rows.length - 1) + ' data rows found. Amounts are read as positive charges, and rows with no amount are skipped.';
                document.getElementById('csvMapPanel').classList.remove('hidden');
            }
            csvImport.value = '';
        };
        reader.readAsText(file);
    });
}
function finishCsvImport(added) {
    if (added > 0) {
        markCalculatorStarted();
        syncPresetButtons();
        trackEvent('csv_imported', { subscription_count: added });
    } else {
        alert('No subscriptions could be read from that file. Check the column choices and try again.');
    }
}
const csvMapImportBtn = document.getElementById('csvMapImportBtn');
if (csvMapImportBtn) csvMapImportBtn.addEventListener('click', () => {
    if (!pendingCsvRows) return;
    const map = {
        name: parseInt(document.getElementById('mapName').value, 10),
        cost: parseInt(document.getElementById('mapCost').value, 10),
        freq: parseInt(document.getElementById('mapFreq').value, 10),
        cat: parseInt(document.getElementById('mapCat').value, 10),
        renewal: -1, tag: -1, share: -1
    };
    const added = importRows(pendingCsvRows.slice(1), map);
    pendingCsvRows = null;
    document.getElementById('csvMapPanel').classList.add('hidden');
    finishCsvImport(added);
});
const csvMapCancelBtn = document.getElementById('csvMapCancelBtn');
if (csvMapCancelBtn) csvMapCancelBtn.addEventListener('click', () => {
    pendingCsvRows = null;
    document.getElementById('csvMapPanel').classList.add('hidden');
});

const mobileCalcBtn = document.getElementById('mobileCalculateBtn');
if (mobileCalcBtn) mobileCalcBtn.addEventListener('click', () => calculateBtn.click());

// ── Init: Load saved data or ask user ───────────────────────────
(function init() {
    // Homepage sample link: calculator.html?sample=1 loads the sample audit directly
    if (new URLSearchParams(window.location.search).get('sample') === '1') {
        sampleData().forEach(sub => createRow(sub));
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
