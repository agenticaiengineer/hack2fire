// App logic — UI, search, sandbox, flashcards, notes.
// Expects db, flashcards, sandboxAlgos from python_interview.data.js.

let currentTabId = 'syntax';
let currentSubFilter = 'All';
let quizIdx = 0;
let isFlipped = false;

const STORAGE_KEY_PROGRESS = 'py_xlang_progress';
const STORAGE_KEY_NOTES    = 'py_xlang_notes';

let progressDB = JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS)) || {};
let notesDB    = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES))    || {};

let pyodideInstance = null;
let pyodideLoading = false;
let activeNoteId = null;

window.onload = function() {
    renderNav();
    switchTab('syntax');
    calculateProgressStats();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) clearBtn.addEventListener('click', clearSearchFilter);
};

// ---- Reset modal ----
function requestResetConfirmation() {
    const modal = document.getElementById('customConfirmModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    }, 10);
}
function closeConfirmModal() {
    const modal = document.getElementById('customConfirmModal');
    modal.classList.add('opacity-0');
    modal.firstElementChild.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
}
function confirmResetAllProgress() {
    progressDB = {};
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressDB));
    calculateProgressStats();
    switchTab(currentTabId);
    closeConfirmModal();
    showToast("Progress cleared.");
}

// ---- Mastery ----
function calculateProgressStats() {
    let total = 0, mastered = 0;
    Object.values(db).forEach(tab => {
        if (!tab.categories) return;
        tab.categories.forEach(cat => cat.items.forEach(item => {
            total++;
            if (progressDB[item.id] === 'mastered') mastered++;
        }));
    });
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    document.getElementById('masteryPercent').innerText = `${pct}%`;
    document.getElementById('masteryBar').style.width   = `${pct}%`;
    document.getElementById('masteryCount').innerText   = `${mastered} / ${total} mastered`;
}

function toggleMasteryState(itemId) {
    if (progressDB[itemId] === 'mastered') {
        progressDB[itemId] = 'todo';
        showToast("Marked as practicing.");
    } else {
        progressDB[itemId] = 'mastered';
        showToast("Marked as mastered.");
    }
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressDB));
    calculateProgressStats();
    if (currentTabId !== 'sandbox' && currentTabId !== 'quiz') {
        const cats = currentSubFilter === 'All'
            ? db[currentTabId].categories
            : db[currentTabId].categories.filter(c => c.title === currentSubFilter);
        renderContent(cats);
    }
}

// ---- Notes ----
function toggleNotesPanel(itemId = null, conceptTitle = "") {
    const panel = document.getElementById('notesPanel');
    const textarea = document.getElementById('noteTextarea');
    const titleEl = document.getElementById('noteConceptTitle');

    if (!itemId || (panel.classList.contains('translate-x-0') && activeNoteId === itemId)) {
        panel.classList.add('translate-x-full');
        panel.classList.remove('translate-x-0');
        activeNoteId = null;
    } else {
        activeNoteId = itemId;
        titleEl.innerText = conceptTitle;
        textarea.value = notesDB[itemId] || "";
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        textarea.focus();
    }
}
function saveNote() {
    if (!activeNoteId) return;
    notesDB[activeNoteId] = document.getElementById('noteTextarea').value;
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesDB));
    showToast("Note saved.");
    toggleNotesPanel();
    rerenderCurrentTab();
}
function clearNote() {
    if (!activeNoteId) return;
    document.getElementById('noteTextarea').value = "";
    delete notesDB[activeNoteId];
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesDB));
    showToast("Note cleared.");
    toggleNotesPanel();
    rerenderCurrentTab();
}
function rerenderCurrentTab() {
    if (currentTabId === 'sandbox' || currentTabId === 'quiz') return;
    const cats = currentSubFilter === 'All'
        ? db[currentTabId].categories
        : db[currentTabId].categories.filter(c => c.title === currentSubFilter);
    renderContent(cats);
}

// ---- Navigation ----
function renderNav() {
    const navContainer = document.getElementById('navTabs');
    navContainer.innerHTML = '';
    Object.values(db).forEach(tab => {
        const isActive = tab.id === currentTabId;
        const btn = document.createElement('button');
        const activeClasses = isActive
            ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-sm'
            : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200';
        btn.className = `w-full flex items-center justify-start gap-3 p-3 rounded-xl border transition-all duration-200 ${activeClasses}`;
        btn.onclick = () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('clearSearch').classList.add('hidden');
            switchTab(tab.id);
        };
        btn.innerHTML = `
            <i class="ph ${isActive ? 'ph-fill' : 'ph-bold'} ${tab.icon} text-lg shrink-0"></i>
            <span class="text-xs md:text-sm font-medium whitespace-nowrap truncate">${tab.title}</span>
        `;
        navContainer.appendChild(btn);
    });
}

function switchTab(tabId) {
    currentTabId = tabId;
    currentSubFilter = 'All';
    document.getElementById('currentTabTitle').innerText = db[tabId].title;
    renderNav();
    const contentArea = document.getElementById('contentArea');
    const sandboxArea = document.getElementById('sandboxArea');
    const quizArea = document.getElementById('quizArea');
    const subtabsArea = document.getElementById('subtabsArea');

    contentArea.classList.add('hidden');
    sandboxArea.classList.add('hidden');
    quizArea.classList.add('hidden');
    subtabsArea.classList.add('hidden');

    if (tabId === 'sandbox') {
        sandboxArea.classList.remove('hidden');
        loadSandboxAlgorithm();
        asyncInitializePyodide();
    } else if (tabId === 'quiz') {
        quizArea.classList.remove('hidden');
        quizIdx = 0;
        isFlipped = false;
        renderFlashcard();
    } else {
        contentArea.classList.remove('hidden');
        renderSubtabs();
        renderContent(db[tabId].categories);
    }
    document.getElementById('mainScrollArea').scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSubtabs() {
    const container = document.getElementById('subtabsArea');
    container.innerHTML = '';
    const q = document.getElementById('searchInput').value.trim();
    if (q) { container.classList.add('hidden'); return; }
    const cats = db[currentTabId].categories;
    if (!cats || cats.length <= 1) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    const filters = ['All', ...cats.map(c => c.title)];
    filters.forEach(f => {
        const btn = document.createElement('button');
        const isActive = currentSubFilter === f;
        btn.className = `px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${
            isActive
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
        }`;
        btn.innerText = f;
        btn.onclick = () => {
            currentSubFilter = f;
            renderSubtabs();
            renderContent(f === 'All' ? db[currentTabId].categories : db[currentTabId].categories.filter(c => c.title === f));
        };
        container.appendChild(btn);
    });
}

// ---- Card rendering ----
function renderContent(categories, isSearchResult = false) {
    const grid = document.getElementById('contentArea');
    const noResults = document.getElementById('noResults');
    grid.innerHTML = '';
    if (!categories || categories.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');

    categories.forEach(category => {
        const isFullLayout = category.layout === 'full' && !isSearchResult;
        if (!isSearchResult) {
            grid.className = `grid gap-6 items-start pb-20 ${isFullLayout ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'}`;
        } else {
            grid.className = 'grid gap-6 items-start pb-20 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';
        }

        const card = document.createElement('div');
        card.className = `bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col h-full shadow-lg tab-content`;
        let sourceBadge = '';
        if (isSearchResult && category.sourceTab) {
            sourceBadge = `<span class="ml-auto text-[10px] font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">${category.sourceTab}</span>`;
        }
        card.innerHTML = `
            <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div class="flex items-center gap-3">
                    <div class="p-1.5 rounded-lg ${category.bg} ${category.color}">
                        <i class="ph-bold ${category.icon} text-lg"></i>
                    </div>
                    <h2 class="font-bold text-slate-100 text-sm sm:text-base">${category.title}</h2>
                </div>
                ${sourceBadge}
            </div>
        `;
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'p-5 flex flex-col gap-6 flex-1';
        category.items.forEach(item => {
            const isMastered = progressDB[item.id] === 'mastered';
            const hasNote = !!notesDB[item.id];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'group flex flex-col h-full';
            const complexityHTML = item.complexity && item.complexity !== "N/A"
                ? `<span class="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">${escapeAttr(item.complexity)}</span>`
                : '';
            const noteBadge = hasNote
                ? `<span onclick="toggleNotesPanel('${item.id}', '${escapeAttr(item.concept)}')" class="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900"><i class="ph ph-note"></i> Note</span>`
                : '';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-start mb-2 gap-2">
                    <div class="flex items-center gap-2">
                        <button onclick="toggleMasteryState('${item.id}')" class="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 transition-colors">
                            <i class="ph-bold ${isMastered ? 'ph-check-square-offset text-emerald-400' : 'ph-square'} text-lg"></i>
                        </button>
                        <h3 class="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">${escapeHtml(item.concept)}</h3>
                    </div>
                    <div class="flex items-center gap-1.5">
                        ${noteBadge}
                        ${complexityHTML}
                    </div>
                </div>
                <div class="relative group mt-1.5 flex-1">
                    <pre class="language-python"><code class="language-python">${escapeHtml(item.code)}</code></pre>
                    <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="toggleNotesPanel('${item.id}', '${escapeAttr(item.concept)}')" class="p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800" title="Note">
                            <i class="ph ph-note-pencil text-sm"></i>
                        </button>
                        <button onclick="copyToClipboardById('${item.id}')" class="p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800" title="Copy">
                            <i class="ph ph-copy text-sm"></i>
                        </button>
                    </div>
                </div>
                <div class="text-xs text-slate-400 mt-2.5 leading-relaxed border-l-2 border-slate-700 pl-3">
                    ${escapeHtml(item.note || '')}
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });
        card.appendChild(itemsContainer);
        grid.appendChild(card);
    });
    Prism.highlightAllUnder(grid);
}

// Lookup code by id for copy (avoids HEREDOC quoting hell in inline handlers).
function copyToClipboardById(id) {
    let found = null;
    Object.values(db).forEach(tab => {
        if (!tab.categories) return;
        tab.categories.forEach(cat => cat.items.forEach(it => {
            if (it.id === id) found = it.code;
        }));
    });
    if (found != null) copyToClipboard(found);
}

// ---- Search ----
function handleSearch(event) {
    const query = (event.target.value || '').toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearch');
    if (!query) {
        clearBtn.classList.add('hidden');
        document.getElementById('currentTabTitle').innerText = db[currentTabId].title;
        renderSubtabs();
        if (currentTabId === 'sandbox' || currentTabId === 'quiz') return;
        renderContent(currentSubFilter === 'All'
            ? db[currentTabId].categories
            : db[currentTabId].categories.filter(c => c.title === currentSubFilter));
        return;
    }
    clearBtn.classList.remove('hidden');
    document.getElementById('subtabsArea').classList.add('hidden');
    document.getElementById('currentTabTitle').innerText = `Search: "${query}"`;
    let results = [];
    Object.values(db).forEach(tab => {
        if (!tab.categories) return;
        tab.categories.forEach(category => {
            const filtered = category.items.filter(item => {
                const c = (item.concept || '').toLowerCase();
                const code = (item.code || '').toLowerCase();
                const note = (item.note || '').toLowerCase();
                return c.includes(query) || code.includes(query) || note.includes(query);
            });
            if (filtered.length > 0) {
                results.push({ ...category, sourceTab: tab.title, items: filtered });
            }
        });
    });
    // Show search results in the main content area regardless of current tab.
    document.getElementById('sandboxArea').classList.add('hidden');
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('contentArea').classList.remove('hidden');
    renderContent(results, true);
}

function clearSearchFilter() {
    document.getElementById('searchInput').value = '';
    handleSearch({ target: { value: '' } });
    // If we're on sandbox/quiz, restore them.
    if (currentTabId === 'sandbox' || currentTabId === 'quiz') switchTab(currentTabId);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSearchFilter();
});

// ---- Clipboard / toast ----
function copyToClipboard(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-999999px";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
    if (ok) showToast("Copied.");
}

function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 border border-slate-800 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium text-emerald-400 toast-enter';
    toast.innerHTML = `<i class="ph-fill ph-check-circle text-lg text-emerald-400"></i> ${escapeHtml(msg)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => { if (toast.parentNode) container.removeChild(toast); }, 300);
    }, 2500);
}

// ---- Flashcards ----
function renderFlashcard() {
    const card = flashcards[quizIdx];
    document.getElementById('quizIndex').innerText = `Card ${quizIdx + 1} / ${flashcards.length}`;
    document.getElementById('quizTag').innerText = card.tag;
    const mainText = document.getElementById('flashCardMainText');
    const helper = document.getElementById('flashCardHelper');
    const cardEl = document.getElementById('flashCard');
    if (isFlipped) {
        mainText.innerHTML = `
            <div class="text-left w-full">
                <p class="text-xs font-mono text-cyan-400 mb-2">// Answer</p>
                <p class="text-sm font-semibold text-slate-300 leading-relaxed mb-4">${escapeHtml(card.answer)}</p>
                <pre class="language-python rounded-md overflow-hidden text-xs"><code class="language-python">${escapeHtml(card.code)}</code></pre>
            </div>
        `;
        helper.innerText = "Click to see question";
        cardEl.classList.add('border-cyan-500/50');
        Prism.highlightAllUnder(mainText);
    } else {
        mainText.innerHTML = `<p class="text-lg font-semibold text-slate-200 leading-normal max-w-sm">${escapeHtml(card.question)}</p>`;
        helper.innerText = "Click to reveal";
        cardEl.classList.remove('border-cyan-500/50');
    }
}
function flipFlashCard() { isFlipped = !isFlipped; renderFlashcard(); }
function nextFlashCard() { isFlipped = false; quizIdx = (quizIdx + 1) % flashcards.length; renderFlashcard(); }
function prevFlashCard() { isFlipped = false; quizIdx = (quizIdx - 1 + flashcards.length) % flashcards.length; renderFlashcard(); }

// ---- Pyodide sandbox ----
async function asyncInitializePyodide() {
    if (pyodideInstance || pyodideLoading) return;
    pyodideLoading = true;
    const terminal = document.getElementById('sandboxTerminalOutput');
    terminal.innerHTML = `Loading Python 3.12 WASM runtime...`;
    try {
        pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" });
        pyodideInstance.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
        `);
        terminal.innerHTML = `Python 3.12 (Pyodide WASM) ready. Edit & click Run.`;
        const runBtn = document.getElementById('runCodeBtn');
        runBtn.removeAttribute('disabled');
        runBtn.innerHTML = `<i class="ph-bold ph-play"></i> Run Python`;
    } catch (err) {
        terminal.innerHTML = `WASM load failed: ${escapeHtml(err.message || String(err))}`;
    } finally {
        pyodideLoading = false;
    }
}

function loadSandboxAlgorithm() {
    const key = document.getElementById('sandboxSelector').value;
    document.getElementById('sandboxPythonCodeEditor').value = sandboxAlgos[key];
}
function resetSandboxCode() {
    loadSandboxAlgorithm();
    showToast("Template reset.");
}

async function executePythonCode() {
    if (!pyodideInstance) { showToast("Python runtime not loaded."); return; }
    const code = document.getElementById('sandboxPythonCodeEditor').value;
    const terminal = document.getElementById('sandboxTerminalOutput');
    terminal.innerHTML = `Running...`;
    try {
        pyodideInstance.runPython(`
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
        `);
        const result = await pyodideInstance.runPythonAsync(code);
        const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
        const stderr = pyodideInstance.runPython("sys.stderr.getvalue()");
        let out = "";
        if (stdout) out += `<span class="text-slate-100">${escapeHtml(stdout)}</span>`;
        if (stderr) out += `<span class="text-rose-400 font-bold">stderr:\n</span><span class="text-rose-300">${escapeHtml(stderr)}</span>`;
        if (result !== undefined && result !== null) {
            let dv = result;
            if (typeof result === 'object' && typeof result.toJs === 'function') {
                try { dv = JSON.stringify(result.toJs()); } catch (e) { dv = String(result); }
            }
            out += `\n<span class="text-cyan-400 font-bold">return:</span> <span class="text-cyan-200 font-mono">${escapeHtml(String(dv))}</span>`;
        }
        if (!stdout && !stderr && (result === undefined || result === null)) {
            out += `<span class="text-slate-500 italic">[no output]</span>`;
        }
        terminal.innerHTML = out;
        const wrapper = document.getElementById('terminalWrapper');
        wrapper.scrollTop = wrapper.scrollHeight;
    } catch (err) {
        terminal.innerHTML = `<span class="text-rose-400 font-bold">Error:</span>\n<span class="text-rose-300 font-mono">${escapeHtml(err.message || String(err))}</span>`;
    }
}

function clearConsole() {
    document.getElementById('sandboxTerminalOutput').innerHTML = `<span class="text-slate-500 italic">[cleared]</span>`;
}

// ---- HTML escape helpers ----
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeAttr(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
