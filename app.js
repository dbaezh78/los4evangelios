/**
 * ====================================================================
 * APLICACIÓN: LOS CUATRO EVANGELIOS
 * Armonización y Consolidación Bíblica
 * ====================================================================
 */

(function () {
  'use strict';

  // Total verse count constants for reference
  const TOTAL_VERSES = 3769;
  const GOSPEL_TOTALS = {
    mt: 1067,
    mc: 674,
    lc: 1149,
    jn: 879
  };

  // State
  let state = {
    currentGospel: 'mt',          // 'mt' | 'mc' | 'lc' | 'jn'
    currentSourceChapter: 1,      // 1-based
    currentTargetChapterIndex: 0, // 0-based index in project.capitulos
    filterStatus: 'all',          // 'all' | 'pending' | 'added'
    filterQuery: '',
    isServerOnline: false,
    viewMode: 'editor',           // 'editor' | 'reader'
    showReaderOrigins: true,
    theme: 'light'
  };

  // Main Project Model
  let project = {
    titulo: 'Los Cuatro Evangelios',
    capitulos: [
      {
        id: 'cap-' + Date.now(),
        titulo: '',
        versiculos: []
      }
    ],
    creadoEn: new Date().toISOString(),
    ultimaModificacion: new Date().toISOString()
  };

  // DOM Elements
  const el = {
    connectionStatus: document.getElementById('connectionStatus'),
    globalProgressCount: document.getElementById('globalProgressCount'),
    globalProgressPct: document.getElementById('globalProgressPct'),
    globalProgressBar: document.getElementById('globalProgressBar'),
    badgeMt: document.getElementById('badgeMt'),
    badgeMc: document.getElementById('badgeMc'),
    badgeLc: document.getElementById('badgeLc'),
    badgeJn: document.getElementById('badgeJn'),
    countTabMt: document.getElementById('countTabMt'),
    countTabMc: document.getElementById('countTabMc'),
    countTabLc: document.getElementById('countTabLc'),
    countTabJn: document.getElementById('countTabJn'),

    gospelTabs: document.getElementById('gospelTabs'),
    chapterSelect: document.getElementById('chapterSelect'),
    btnPrevChapter: document.getElementById('btnPrevChapter'),
    btnNextChapter: document.getElementById('btnNextChapter'),
    chapterPillsContainer: document.getElementById('chapterPillsContainer'),
    sourceChapterSummary: document.getElementById('sourceChapterSummary'),
    sourceVersesContainer: document.getElementById('sourceVersesContainer'),
    verseFilterInput: document.getElementById('verseFilterInput'),
    btnClearFilter: document.getElementById('btnClearFilter'),
    btnAddAllChapter: document.getElementById('btnAddAllChapter'),
    countFilteredAll: document.getElementById('countFilteredAll'),
    countFilteredPending: document.getElementById('countFilteredPending'),
    countFilteredAdded: document.getElementById('countFilteredAdded'),

    targetBookTitle: document.getElementById('targetBookTitle'),
    btnEditBookTitle: document.getElementById('btnEditBookTitle'),
    targetTotalVerses: document.getElementById('targetTotalVerses'),
    targetTotalChapters: document.getElementById('targetTotalChapters'),
    targetTotalWords: document.getElementById('targetTotalWords'),
    targetChaptersContainer: document.getElementById('targetChaptersContainer'),
    btnNewTargetChapter: document.getElementById('btnNewTargetChapter'),
    activeChapterBadge: document.getElementById('activeChapterBadge'),
    targetChapterTitleInput: document.getElementById('targetChapterTitleInput'),
    btnMoveChapterLeft: document.getElementById('btnMoveChapterLeft'),
    btnMoveChapterRight: document.getElementById('btnMoveChapterRight'),
    btnDeleteChapter: document.getElementById('btnDeleteChapter'),
    activeChapterStats: document.getElementById('activeChapterStats'),
    btnRenumberChapter: document.getElementById('btnRenumberChapter'),
    btnClearTargetChapter: document.getElementById('btnClearTargetChapter'),
    targetVersesContainer: document.getElementById('targetVersesContainer'),

    workspaceContainer: document.getElementById('workspaceContainer'),
    readerView: document.getElementById('readerView'),
    btnViewEditor: document.getElementById('btnViewEditor'),
    btnViewReader: document.getElementById('btnViewReader'),
    btnBackToEditor: document.getElementById('btnBackToEditor'),
    readerBookContent: document.getElementById('readerBookContent'),
    chkShowOriginTags: document.getElementById('chkShowOriginTags'),
    btnPrintBook: document.getElementById('btnPrintBook'),
    btnCopyBookText: document.getElementById('btnCopyBookText'),

    btnSave: document.getElementById('btnSave'),
    saveBtnText: document.getElementById('saveBtnText'),
    btnExportMenu: document.getElementById('btnExportMenu'),
    btnImport: document.getElementById('btnImport'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    btnHelp: document.getElementById('btnHelp'),
    btnGlobalSearch: document.getElementById('btnGlobalSearch'),

    modalExport: document.getElementById('modalExport'),
    btnCloseExportModal: document.getElementById('btnCloseExportModal'),
    btnExportJSON: document.getElementById('btnExportJSON'),
    btnExportServerFiles: document.getElementById('btnExportServerFiles'),
    btnExportTXT: document.getElementById('btnExportTXT'),
    btnExportMD: document.getElementById('btnExportMD'),
    btnExportHTML: document.getElementById('btnExportHTML'),

    modalImport: document.getElementById('modalImport'),
    btnCloseImportModal: document.getElementById('btnCloseImportModal'),
    importDropzone: document.getElementById('importDropzone'),
    fileInputImport: document.getElementById('fileInputImport'),

    modalGlobalSearch: document.getElementById('modalGlobalSearch'),
    btnCloseSearchModal: document.getElementById('btnCloseSearchModal'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    searchResultsStats: document.getElementById('searchResultsStats'),
    searchResultsList: document.getElementById('searchResultsList'),
    chkSearchMt: document.getElementById('chkSearchMt'),
    chkSearchMc: document.getElementById('chkSearchMc'),
    chkSearchLc: document.getElementById('chkSearchLc'),
    chkSearchJn: document.getElementById('chkSearchJn'),

    modalHelp: document.getElementById('modalHelp'),
    btnCloseHelpModal: document.getElementById('btnCloseHelpModal'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ====================================================================
  // INITIALIZATION
  // ====================================================================
  async function init() {
    loadSavedTheme();
    setupEventListeners();
    await checkServerStatus();
    loadProject();
    renderSourceChapterControls();
    renderSourceVerses();
    renderTargetChapters();
    renderTargetVerses();
    updateStatistics();
  }

  // ====================================================================
  // SERVER & PERSISTENCE
  // ====================================================================
  async function checkServerStatus() {
    try {
      const res = await fetch('/api/status', { method: 'GET', cache: 'no-cache' });
      if (res.ok) {
        state.isServerOnline = true;
        el.connectionStatus.className = 'connection-status online';
        el.connectionStatus.innerHTML = '<span class="status-dot"></span><span class="status-label">Servidor Conectado</span>';
        return true;
      }
    } catch (e) {
      // LocalStorage mode
    }
    state.isServerOnline = false;
    el.connectionStatus.className = 'connection-status offline';
    el.connectionStatus.innerHTML = '<span class="status-dot"></span><span class="status-label">Modo Local (Navegador)</span>';
    return false;
  }

  function loadProject() {
    // 1. Try local storage first or server if available
    const local = localStorage.getItem('los_cuatro_evangelios_proyecto');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.capitulos) && parsed.capitulos.length > 0) {
          project = parsed;
          showToast('Proyecto cargado desde memoria local', 'info');
          return;
        }
      } catch (err) {
        console.error('Error al parsear localStorage:', err);
      }
    }

    // Try server if empty
    if (state.isServerOnline) {
      fetch('/api/load')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.project && data.project.capitulos) {
            project = data.project;
            showToast('Proyecto cargado desde el servidor', 'info');
            renderTargetChapters();
            renderTargetVerses();
            renderSourceVerses();
            updateStatistics();
          }
        })
        .catch(err => console.log('Sin archivo previo en servidor:', err));
    }
  }

  let saveDebounceTimer = null;
  function triggerAutoSave() {
    project.ultimaModificacion = new Date().toISOString();
    // Save to localStorage immediately or debounced
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      saveProjectLocally();
      if (state.isServerOnline) {
        saveProjectToServer(false);
      }
    }, 600);
  }

  function saveProjectLocally() {
    try {
      localStorage.setItem('los_cuatro_evangelios_proyecto', JSON.stringify(project));
      updateSaveIndicator('Guardado');
    } catch (e) {
      console.warn('Error al guardar en LocalStorage:', e);
    }
  }

  async function saveProjectToServer(notifyUser = true) {
    if (!state.isServerOnline) {
      saveProjectLocally();
      if (notifyUser) showToast('Guardado en la memoria de tu navegador (LocalStorage)', 'success');
      return;
    }

    try {
      updateSaveIndicator('Guardando...');
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      });
      const data = await res.json();
      if (data.success) {
        updateSaveIndicator('Guardado');
        if (notifyUser) showToast('¡Guardado exitosamente en el archivo del disco!', 'success');
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      saveProjectLocally();
      if (notifyUser) showToast('Error al conectar con servidor, guardado en memoria local', 'warning');
    }
  }

  function updateSaveIndicator(text) {
    if (el.saveBtnText) el.saveBtnText.textContent = text;
  }

  // ====================================================================
  // INDEXING & FAST LOOKUPS
  // ====================================================================
  // Build a map of verse occurrences in the target project
  // key: "mt:1:1" => [ { capIndex, vIndex, capDisplay } ]
  function getTargetVerseIndexMap() {
    const map = new Map();
    project.capitulos.forEach((cap, capIdx) => {
      const capName = cap.titulo ? `Cap. ${capIdx + 1} (${cap.titulo})` : `Cap. ${capIdx + 1}`;
      if (Array.isArray(cap.versiculos)) {
        cap.versiculos.forEach((v, vIdx) => {
          if (v.gospelKey && v.capOrigen && v.vOrigen) {
            const key = `${v.gospelKey}:${v.capOrigen}:${v.vOrigen}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push({
              capIndex: capIdx,
              vIndex: vIdx,
              capDisplay: capName
            });
          }
        });
      }
    });
    return map;
  }

  // ====================================================================
  // RENDER: LEFT PANEL (SOURCE GOSPELS)
  // ====================================================================
  function renderSourceChapterControls() {
    const gospel = window.GOSPELS_DATA[state.currentGospel];
    if (!gospel) return;

    const chapters = Object.keys(gospel.capitulos).map(Number).sort((a, b) => a - b);
    const totalCaps = chapters.length;

    // Boundary check
    if (state.currentSourceChapter < 1) state.currentSourceChapter = 1;
    if (state.currentSourceChapter > totalCaps) state.currentSourceChapter = totalCaps;

    // Dropdown
    el.chapterSelect.innerHTML = '';
    chapters.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      const verseCount = Object.keys(gospel.capitulos[c]).length;
      opt.textContent = `Capítulo ${c} (${verseCount} versículos)`;
      if (c === state.currentSourceChapter) opt.selected = true;
      el.chapterSelect.appendChild(opt);
    });

    // Prev / Next buttons
    el.btnPrevChapter.disabled = state.currentSourceChapter <= 1;
    el.btnNextChapter.disabled = state.currentSourceChapter >= totalCaps;

    // Quick pills
    el.chapterPillsContainer.innerHTML = '';
    const indexMap = getTargetVerseIndexMap();

    chapters.forEach(c => {
      const pill = document.createElement('button');
      pill.className = `chapter-pill ${c === state.currentSourceChapter ? 'active' : ''}`;
      pill.textContent = c;
      pill.title = `Ir al Capítulo ${c}`;

      // Check if all verses in this chapter are added
      const versesInCap = Object.keys(gospel.capitulos[c]);
      const addedInCap = versesInCap.filter(v => indexMap.has(`${state.currentGospel}:${c}:${v}`)).length;
      if (addedInCap === versesInCap.length && versesInCap.length > 0) {
        pill.classList.add('completed');
        pill.title += ` (Completado: ${addedInCap}/${versesInCap.length})`;
      }

      pill.addEventListener('click', () => {
        state.currentSourceChapter = c;
        renderSourceChapterControls();
        renderSourceVerses();
      });

      el.chapterPillsContainer.appendChild(pill);
    });

    // Scroll active pill into view
    const activePill = el.chapterPillsContainer.querySelector('.chapter-pill.active');
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function renderSourceVerses() {
    const gospel = window.GOSPELS_DATA[state.currentGospel];
    if (!gospel) return;

    const capData = gospel.capitulos[state.currentSourceChapter.toString()];
    if (!capData) {
      el.sourceVersesContainer.innerHTML = '<div class="empty-placeholder">Capítulo no encontrado</div>';
      return;
    }

    const verseNumbers = Object.keys(capData).map(Number).sort((a, b) => a - b);
    const indexMap = getTargetVerseIndexMap();
    const query = state.filterQuery.trim().toLowerCase();

    el.sourceVersesContainer.innerHTML = '';

    let totalCount = verseNumbers.length;
    let pendingCount = 0;
    let addedCount = 0;
    let renderedCount = 0;

    verseNumbers.forEach(vNum => {
      const text = capData[vNum.toString()];
      const key = `${state.currentGospel}:${state.currentSourceChapter}:${vNum}`;
      const isAdded = indexMap.has(key);
      const addedLocations = indexMap.get(key) || [];

      if (isAdded) addedCount++;
      else pendingCount++;

      // Apply filter
      if (state.filterStatus === 'pending' && isAdded) return;
      if (state.filterStatus === 'added' && !isAdded) return;

      // Apply search query
      if (query && !text.toLowerCase().includes(query)) return;

      renderedCount++;

      // Create Verse Card
      const card = document.createElement('div');
      card.className = `verse-card ${isAdded ? 'already-added' : ''}`;
      card.dataset.gospel = state.currentGospel;
      card.dataset.chapter = state.currentSourceChapter;
      card.dataset.verse = vNum;

      // Format ref tag, e.g. "Mt 1:1"
      const refTag = `${gospel.abbreviation.toUpperCase()} ${state.currentSourceChapter}:${vNum}`;

      // Status Badge
      let statusBadgeHtml = '';
      if (isAdded) {
        const firstLoc = addedLocations[0];
        statusBadgeHtml = `<span class="verse-added-badge" title="${addedLocations.map(l => l.capDisplay).join(', ')}">✓ En ${firstLoc.capDisplay} (#${firstLoc.vIndex + 1})</span>`;
      }

      card.innerHTML = `
        <div class="verse-card-header">
          <div class="verse-meta ${state.currentGospel}">
            <span class="verse-num-badge">${vNum}</span>
            <span class="verse-ref-tag">${refTag}</span>
            ${statusBadgeHtml}
          </div>
          <div class="verse-card-actions">
            <button class="btn-verse-action btn-add-fast" title="Añadir al capítulo actual de Los Cuatro Evangelios">
              + Añadir
            </button>
          </div>
        </div>
        <div class="verse-card-text">${highlightMatch(text, query)}</div>
      `;

      // ===============================================================
      // USER REQUEST REQUIREMENTS:
      // "con clic derecho y tambien con doble clic para que pase al
      // capitulo del libro titulo los cuatro evangelios"
      // ===============================================================

      // 1. Double click transfer
      card.addEventListener('dblclick', (e) => {
        e.preventDefault();
        transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, text, card);
      });

      // 2. Right click transfer
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, text, card);
      });

      // 3. Fast button click
      const btnAddFast = card.querySelector('.btn-add-fast');
      if (btnAddFast) {
        btnAddFast.addEventListener('click', (e) => {
          e.stopPropagation();
          transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, text, card);
        });
      }

      el.sourceVersesContainer.appendChild(card);
    });

    // Update filter counts
    el.countFilteredAll.textContent = totalCount;
    el.countFilteredPending.textContent = pendingCount;
    el.countFilteredAdded.textContent = addedCount;

    // Summary bar text
    el.sourceChapterSummary.textContent = `${gospel.name} Cap. ${state.currentSourceChapter} • ${addedCount} de ${totalCount} versículos agregados (${renderedCount} visibles)`;

    if (renderedCount === 0) {
      el.sourceVersesContainer.innerHTML = `
        <div class="empty-placeholder">
          <span class="empty-icon">🔍</span>
          <div class="empty-title">Sin resultados</div>
          <div class="empty-desc">No se encontraron versículos con el filtro actual en este capítulo.</div>
        </div>
      `;
    }
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:#fef08a;color:#854d0e;padding:0 2px;border-radius:2px;">$1</mark>');
  }

  function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  // ====================================================================
  // VERSE TRANSFER LOGIC (SOURCE -> TARGET)
  // ====================================================================
  function transferVerseToTarget(gospelKey, capNum, vNum, text, sourceCardEl = null) {
    if (!project.capitulos || project.capitulos.length === 0) {
      createNewTargetChapter();
    }

    // Ensure valid active chapter index
    if (state.currentTargetChapterIndex < 0 || state.currentTargetChapterIndex >= project.capitulos.length) {
      state.currentTargetChapterIndex = 0;
    }

    const targetCap = project.capitulos[state.currentTargetChapterIndex];
    if (!targetCap.versiculos) targetCap.versiculos = [];

    const gospel = window.GOSPELS_DATA[gospelKey];
    const originTag = `${gospel.abbreviation.toUpperCase()} ${capNum}:${vNum}`;

    // Check if already in this chapter
    const alreadyInThisCap = targetCap.versiculos.some(v => v.gospelKey === gospelKey && v.capOrigen == capNum && v.vOrigen == vNum);

    const newVerse = {
      id: 'v-' + gospelKey + '-' + capNum + '-' + vNum + '-' + Date.now().toString(36),
      origen: originTag,
      gospelKey: gospelKey,
      capOrigen: capNum.toString(),
      vOrigen: vNum.toString(),
      texto: text,
      agregadoEn: new Date().toISOString()
    };

    targetCap.versiculos.push(newVerse);

    // Visual animation on source card
    if (sourceCardEl) {
      sourceCardEl.classList.add('flash-success');
      setTimeout(() => sourceCardEl.classList.remove('flash-success'), 800);
    }

    // Toast feedback
    const capTitleDisplay = targetCap.titulo ? `Capítulo ${state.currentTargetChapterIndex + 1} (${targetCap.titulo})` : `Capítulo ${state.currentTargetChapterIndex + 1}`;

    if (alreadyInThisCap) {
      showToast(`Añadido de nuevo: ${originTag} → ${capTitleDisplay}`, 'info');
    } else {
      showToast(`✓ Añadido: ${originTag} → ${capTitleDisplay}`, 'success');
    }

    triggerAutoSave();
    renderSourceVerses();
    renderSourceChapterControls();
    renderTargetVerses(true); // scroll to bottom
    updateStatistics();
  }

  // ====================================================================
  // RENDER: RIGHT PANEL (TARGET BOOK "LOS CUATRO EVANGELIOS")
  // ====================================================================
  function renderTargetChapters() {
    el.targetChaptersContainer.innerHTML = '';

    if (!project.capitulos || project.capitulos.length === 0) {
      project.capitulos = [{ id: 'cap-' + Date.now(), titulo: '', versiculos: [] }];
    }

    if (state.currentTargetChapterIndex >= project.capitulos.length) {
      state.currentTargetChapterIndex = Math.max(0, project.capitulos.length - 1);
    }

    project.capitulos.forEach((cap, idx) => {
      const btn = document.createElement('button');
      btn.className = `btn-target-cap ${idx === state.currentTargetChapterIndex ? 'active' : ''}`;
      
      const vCount = (cap.versiculos && cap.versiculos.length) || 0;
      const titleShort = cap.titulo ? `: ${cap.titulo.substring(0, 15)}...` : '';
      btn.innerHTML = `<span>Cap. ${idx + 1}${titleShort}</span> <span style="opacity:0.75;font-size:0.72rem;">(${vCount})</span>`;
      btn.title = cap.titulo ? `Capítulo ${idx + 1}: ${cap.titulo} (${vCount} versículos)` : `Capítulo ${idx + 1} (${vCount} versículos)`;

      btn.addEventListener('click', () => {
        state.currentTargetChapterIndex = idx;
        renderTargetChapters();
        renderTargetVerses();
      });

      el.targetChaptersContainer.appendChild(btn);
    });

    // Update active chapter header controls
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    el.activeChapterBadge.textContent = `Cap. ${state.currentTargetChapterIndex + 1}`;
    el.targetChapterTitleInput.value = activeCap.titulo || '';

    // Scroll active button into view
    const activeBtn = el.targetChaptersContainer.querySelector('.btn-target-cap.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function renderTargetVerses(scrollToBottom = false) {
    if (!project.capitulos || project.capitulos.length === 0) return;

    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    if (!activeCap) return;

    const verses = activeCap.versiculos || [];
    el.targetVersesContainer.innerHTML = '';

    // Active Chapter Stats
    const totalWords = verses.reduce((acc, v) => acc + (v.texto ? v.texto.trim().split(/\s+/).length : 0), 0);
    el.activeChapterStats.textContent = `${verses.length} versículos en este capítulo • ${totalWords} palabras`;

    if (verses.length === 0) {
      el.targetVersesContainer.innerHTML = `
        <div class="empty-placeholder">
          <span class="empty-icon">📖</span>
          <div class="empty-title">Capítulo ${state.currentTargetChapterIndex + 1} vacío</div>
          <div class="empty-desc">
            Haz <strong>doble clic</strong> o <strong>clic derecho</strong> en cualquier versículo de la columna izquierda para agregarlo a este capítulo.
          </div>
        </div>
      `;
      return;
    }

    verses.forEach((v, index) => {
      const vCard = document.createElement('div');
      vCard.className = 'target-verse-card';
      vCard.dataset.index = index;

      const gospelKey = v.gospelKey || 'mt';
      const seqNumber = index + 1;

      vCard.innerHTML = `
        <div class="target-verse-header">
          <div class="target-verse-meta">
            <span class="target-verse-num" title="Versículo ${seqNumber}">${seqNumber}</span>
            <span class="origin-pill ${gospelKey}" title="Origen: ${v.origen} (Haz clic para ver el capítulo original)">
              ${v.origen}
            </span>
          </div>
          <div class="target-verse-actions">
            <button class="btn-order-action btn-move-up" ${index === 0 ? 'disabled' : ''} title="Subir versículo">▲</button>
            <button class="btn-order-action btn-move-down" ${index === verses.length - 1 ? 'disabled' : ''} title="Bajar versículo">▼</button>
            <button class="btn-order-action btn-move-to-cap" title="Mover a otro capítulo...">➡️</button>
            <button class="btn-order-action danger btn-remove-verse" title="Quitar de Los Cuatro Evangelios">✕</button>
          </div>
        </div>
        <div class="target-verse-text-area" contenteditable="true" spellcheck="false" title="Haz clic para editar o armonizar el texto">${escapeHtml(v.texto)}</div>
      `;

      // Jump to original gospel chapter on clicking origin badge
      const originPill = vCard.querySelector('.origin-pill');
      originPill.addEventListener('click', () => {
        if (v.gospelKey && v.capOrigen) {
          switchSourceGospel(v.gospelKey);
          state.currentSourceChapter = parseInt(v.capOrigen, 10);
          renderSourceChapterControls();
          renderSourceVerses();
          showToast(`Mostrando origen en ${window.GOSPELS_DATA[v.gospelKey].name} Cap. ${v.capOrigen}`, 'info');
        }
      });

      // Move Up
      const btnUp = vCard.querySelector('.btn-move-up');
      btnUp.addEventListener('click', () => {
        if (index > 0) {
          const temp = verses[index];
          verses[index] = verses[index - 1];
          verses[index - 1] = temp;
          triggerAutoSave();
          renderTargetVerses();
        }
      });

      // Move Down
      const btnDown = vCard.querySelector('.btn-move-down');
      btnDown.addEventListener('click', () => {
        if (index < verses.length - 1) {
          const temp = verses[index];
          verses[index] = verses[index + 1];
          verses[index + 1] = temp;
          triggerAutoSave();
          renderTargetVerses();
        }
      });

      // Move to another chapter
      const btnMoveTo = vCard.querySelector('.btn-move-to-cap');
      btnMoveTo.addEventListener('click', () => {
        promptMoveVerseToChapter(index);
      });

      // Remove verse
      const btnRemove = vCard.querySelector('.btn-remove-verse');
      btnRemove.addEventListener('click', () => {
        verses.splice(index, 1);
        showToast(`Versículo eliminado del Capítulo ${state.currentTargetChapterIndex + 1}`, 'info');
        triggerAutoSave();
        renderTargetVerses();
        renderSourceVerses();
        renderSourceChapterControls();
        updateStatistics();
      });

      // Inline text editing
      const textArea = vCard.querySelector('.target-verse-text-area');
      textArea.addEventListener('blur', () => {
        const newText = textArea.innerText.trim();
        if (newText !== v.texto) {
          v.texto = newText;
          triggerAutoSave();
          updateStatistics();
        }
      });

      el.targetVersesContainer.appendChild(vCard);
    });

    if (scrollToBottom) {
      el.targetVersesContainer.scrollTop = el.targetVersesContainer.scrollHeight;
    }
  }

  function promptMoveVerseToChapter(verseIndex) {
    if (project.capitulos.length <= 1) {
      showToast('Crea primero un nuevo capítulo para poder mover versículos', 'warning');
      return;
    }

    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    const verse = activeCap.versiculos[verseIndex];

    const options = project.capitulos.map((c, i) => `${i + 1}${c.titulo ? ': ' + c.titulo : ''}`).join('\n');
    const dest = prompt(`Mover "${verse.origen}" a qué capítulo?\n(Ingresa el número de capítulo del 1 al ${project.capitulos.length}):\n${options}`);

    if (dest !== null) {
      const destIndex = parseInt(dest.trim(), 10) - 1;
      if (!isNaN(destIndex) && destIndex >= 0 && destIndex < project.capitulos.length) {
        if (destIndex === state.currentTargetChapterIndex) {
          showToast('Ya está en ese capítulo', 'info');
          return;
        }
        activeCap.versiculos.splice(verseIndex, 1);
        project.capitulos[destIndex].versiculos.push(verse);
        showToast(`Versículo movido al Capítulo ${destIndex + 1}`, 'success');
        triggerAutoSave();
        renderTargetVerses();
        renderTargetChapters();
      } else {
        showToast('Número de capítulo inválido', 'warning');
      }
    }
  }

  function createNewTargetChapter() {
    const newNum = project.capitulos.length + 1;
    project.capitulos.push({
      id: 'cap-' + Date.now(),
      titulo: '',
      versiculos: []
    });
    state.currentTargetChapterIndex = project.capitulos.length - 1;
    triggerAutoSave();
    renderTargetChapters();
    renderTargetVerses();
    updateStatistics();
    showToast(`Capítulo ${newNum} creado y activado`, 'success');
  }

  function deleteTargetChapter() {
    if (project.capitulos.length <= 1) {
      if (confirm('¿Deseas vaciar todos los versículos del Capítulo 1?')) {
        project.capitulos[0].versiculos = [];
        project.capitulos[0].titulo = '';
        triggerAutoSave();
        renderTargetChapters();
        renderTargetVerses();
        renderSourceVerses();
        renderSourceChapterControls();
        updateStatistics();
        showToast('Capítulo 1 vaciado', 'info');
      }
      return;
    }

    const capNum = state.currentTargetChapterIndex + 1;
    const vCount = project.capitulos[state.currentTargetChapterIndex].versiculos.length;
    const msg = vCount > 0 
      ? `¿Seguro que deseas eliminar el Capítulo ${capNum}? Contiene ${vCount} versículos.`
      : `¿Eliminar el Capítulo ${capNum}?`;

    if (confirm(msg)) {
      project.capitulos.splice(state.currentTargetChapterIndex, 1);
      if (state.currentTargetChapterIndex >= project.capitulos.length) {
        state.currentTargetChapterIndex = project.capitulos.length - 1;
      }
      triggerAutoSave();
      renderTargetChapters();
      renderTargetVerses();
      renderSourceVerses();
      renderSourceChapterControls();
      updateStatistics();
      showToast(`Capítulo eliminado`, 'info');
    }
  }

  // ====================================================================
  // STATISTICS & PROGRESS
  // ====================================================================
  function updateStatistics() {
    const indexMap = getTargetVerseIndexMap();

    // Counts per gospel
    const counts = { mt: 0, mc: 0, lc: 0, jn: 0 };
    for (const key of indexMap.keys()) {
      const g = key.split(':')[0];
      if (counts[g] !== undefined) counts[g]++;
    }

    const totalUniqueUsed = indexMap.size;
    const pct = Math.min(100, Math.round((totalUniqueUsed / TOTAL_VERSES) * 100));

    // Global Header Progress
    el.globalProgressCount.textContent = `${totalUniqueUsed.toLocaleString()} / ${TOTAL_VERSES.toLocaleString()}`;
    el.globalProgressPct.textContent = `(${pct}%)`;
    el.globalProgressBar.style.width = `${pct}%`;

    // Header Mini Badges
    el.badgeMt.textContent = `Mt: ${counts.mt}/${GOSPEL_TOTALS.mt}`;
    el.badgeMc.textContent = `Mc: ${counts.mc}/${GOSPEL_TOTALS.mc}`;
    el.badgeLc.textContent = `Lc: ${counts.lc}/${GOSPEL_TOTALS.lc}`;
    el.badgeJn.textContent = `Jn: ${counts.jn}/${GOSPEL_TOTALS.jn}`;

    // Source Gospel Tabs Count
    el.countTabMt.textContent = `${counts.mt}/${GOSPEL_TOTALS.mt}`;
    el.countTabMc.textContent = `${counts.mc}/${GOSPEL_TOTALS.mc}`;
    el.countTabLc.textContent = `${counts.lc}/${GOSPEL_TOTALS.lc}`;
    el.countTabJn.textContent = `${counts.jn}/${GOSPEL_TOTALS.jn}`;

    // Target Panel Stats
    let totalTargetVerses = 0;
    let totalTargetWords = 0;
    project.capitulos.forEach(cap => {
      if (Array.isArray(cap.versiculos)) {
        totalTargetVerses += cap.versiculos.length;
        cap.versiculos.forEach(v => {
          if (v.texto) totalTargetWords += v.texto.trim().split(/\s+/).length;
        });
      }
    });

    el.targetTotalVerses.innerHTML = `Total: <strong>${totalTargetVerses}</strong> versículos`;
    el.targetTotalChapters.innerHTML = `<strong>${project.capitulos.length}</strong> capítulos`;
    el.targetTotalWords.innerHTML = `<strong>${totalTargetWords.toLocaleString()}</strong> palabras`;
  }

  // ====================================================================
  // READER VIEW (FULL CONSOLIDATED BOOK)
  // ====================================================================
  function renderReaderView() {
    const bookTitle = project.titulo || 'Los Cuatro Evangelios';
    const showOrigins = el.chkShowOriginTags.checked;

    let html = `
      <div class="reader-book-header">
        <h1>${escapeHtml(bookTitle.toUpperCase())}</h1>
        <div class="reader-meta">
          Consolidación armónica de los cuatro santos evangelios: Mateo, Marcos, Lucas y Juan.<br>
          ${project.capitulos.length} capítulos • Compilación y texto completo
        </div>
      </div>
    `;

    project.capitulos.forEach((cap, idx) => {
      const capNum = idx + 1;
      const titleDisplay = cap.titulo ? `Capítulo ${capNum}: ${escapeHtml(cap.titulo)}` : `Capítulo ${capNum}`;

      html += `<div class="reader-chapter-block" id="reader-cap-${capNum}">`;
      html += `<h2 class="reader-chapter-title">${titleDisplay}</h2>`;
      html += `<div class="reader-chapter-content">`;

      if (cap.versiculos && cap.versiculos.length > 0) {
        cap.versiculos.forEach((v, vIdx) => {
          const vNum = vIdx + 1;
          const originHtml = showOrigins && v.origen ? `<span class="reader-origin-tag">[${escapeHtml(v.origen)}]</span>` : '';
          html += `<span class="reader-verse-num">${vNum}</span>${escapeHtml(v.texto)} ${originHtml} `;
        });
      } else {
        html += `<em style="color:#94a3b8;">(Capítulo sin versículos aún)</em>`;
      }

      html += `</div></div>`;
    });

    el.readerBookContent.innerHTML = html;
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'reader') {
      el.workspaceContainer.style.display = 'none';
      el.readerView.style.display = 'flex';
      el.btnViewEditor.classList.remove('active');
      el.btnViewReader.classList.add('active');
      renderReaderView();
    } else {
      el.readerView.style.display = 'none';
      el.workspaceContainer.style.display = 'grid';
      el.btnViewReader.classList.remove('active');
      el.btnViewEditor.classList.add('active');
    }
  }

  // ====================================================================
  // EXPORT FUNCTIONS
  // ====================================================================
  function exportProjectJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'los_cuatro_evangelios_proyecto.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Archivo JSON descargado exitosamente', 'success');
  }

  function exportPlainText() {
    const bookTitle = project.titulo || 'Los Cuatro Evangelios';
    let text = `${bookTitle.toUpperCase()}\n${'='.repeat(bookTitle.length)}\n\n`;

    project.capitulos.forEach((cap, idx) => {
      const capNum = idx + 1;
      const title = cap.titulo ? `Capítulo ${capNum}: ${cap.titulo}` : `Capítulo ${capNum}`;
      text += `\n--- ${title} ---\n\n`;
      if (cap.versiculos && cap.versiculos.length > 0) {
        cap.versiculos.forEach((v, vIdx) => {
          text += `${vIdx + 1}. ${v.texto} [${v.origen}]\n`;
        });
      } else {
        text += `(Capítulo sin versículos)\n`;
      }
      text += `\n`;
    });

    downloadBlob(text, 'los_cuatro_evangelios.txt', 'text/plain;charset=utf-8');
    showToast('Archivo TXT descargado', 'success');
  }

  function exportMarkdown() {
    const bookTitle = project.titulo || 'Los Cuatro Evangelios';
    let md = `# ${bookTitle}\n\n`;
    md += `*Compilación armónica de los cuatro evangelios*\n\n---\n\n`;

    project.capitulos.forEach((cap, idx) => {
      const capNum = idx + 1;
      const title = cap.titulo ? `Capítulo ${capNum}: ${cap.titulo}` : `Capítulo ${capNum}`;
      md += `## ${title}\n\n`;
      if (cap.versiculos && cap.versiculos.length > 0) {
        cap.versiculos.forEach((v, vIdx) => {
          md += `**${vIdx + 1}** ${v.texto} *[${v.origen}]*\n\n`;
        });
      } else {
        md += `*(Capítulo vacío)*\n\n`;
      }
    });

    downloadBlob(md, 'los_cuatro_evangelios.md', 'text/markdown;charset=utf-8');
    showToast('Archivo Markdown descargado', 'success');
  }

  function exportHTML() {
    const bookTitle = project.titulo || 'Los Cuatro Evangelios';
    let htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(bookTitle)}</title>
  <style>
    body { font-family: 'Merriweather', Georgia, serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; background: #fffefb; }
    h1 { text-align: center; font-size: 2.2rem; margin-bottom: 5px; font-family: sans-serif; letter-spacing: 1px; }
    .subtitle { text-align: center; font-style: italic; color: #666; margin-bottom: 40px; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 40px; font-family: sans-serif; }
    .verse-num { font-weight: bold; font-size: 0.8em; vertical-align: super; color: #4338ca; }
    .origin { font-size: 0.7em; color: #888; font-family: sans-serif; }
  </style>
</head>
<body>
  <h1>${escapeHtml(bookTitle)}</h1>
  <div class="subtitle">Armonización de los Cuatro Santos Evangelios</div>
`;

    project.capitulos.forEach((cap, idx) => {
      const capNum = idx + 1;
      const title = cap.titulo ? `Capítulo ${capNum}: ${escapeHtml(cap.titulo)}` : `Capítulo ${capNum}`;
      htmlContent += `<h2>${title}</h2>\n<p>\n`;
      if (cap.versiculos && cap.versiculos.length > 0) {
        cap.versiculos.forEach((v, vIdx) => {
          htmlContent += `<span class="verse-num">${vIdx + 1}</span> ${escapeHtml(v.texto)} <span class="origin">[${escapeHtml(v.origen)}]</span> `;
        });
      }
      htmlContent += `\n</p>\n`;
    });

    htmlContent += `</body></html>`;
    downloadBlob(htmlContent, 'los_cuatro_evangelios.html', 'text/html;charset=utf-8');
    showToast('Archivo HTML descargado', 'success');
  }

  async function exportServerFilesDirectly() {
    if (!state.isServerOnline) {
      exportMarkdown();
      return;
    }

    try {
      const res = await fetch('/api/export-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Archivos guardados en disco: los_cuatro_evangelios.md y .txt', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast('Error al exportar en servidor: ' + err.message, 'warning');
    }
  }

  function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ====================================================================
  // IMPORT FUNCTION
  // ====================================================================
  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.capitulos)) {
          // Backup current
          localStorage.setItem('los_cuatro_evangelios_backup_' + Date.now(), JSON.stringify(project));
          project = parsed;
          state.currentTargetChapterIndex = 0;
          triggerAutoSave();
          renderTargetChapters();
          renderTargetVerses();
          renderSourceVerses();
          renderSourceChapterControls();
          updateStatistics();
          el.modalImport.style.display = 'none';
          showToast('Proyecto importado exitosamente', 'success');
        } else {
          alert('El archivo no tiene el formato válido de "Los Cuatro Evangelios".');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ====================================================================
  // GLOBAL SEARCH (ACROSS ALL 4 GOSPELS)
  // ====================================================================
  function executeGlobalSearch() {
    const query = el.globalSearchInput.value.trim().toLowerCase();
    if (!query || query.length < 2) {
      el.searchResultsStats.textContent = 'Ingresa al menos 2 caracteres para buscar.';
      el.searchResultsList.innerHTML = '';
      return;
    }

    const enabledGospels = [];
    if (el.chkSearchMt.checked) enabledGospels.push('mt');
    if (el.chkSearchMc.checked) enabledGospels.push('mc');
    if (el.chkSearchLc.checked) enabledGospels.push('lc');
    if (el.chkSearchJn.checked) enabledGospels.push('jn');

    const indexMap = getTargetVerseIndexMap();
    const results = [];

    enabledGospels.forEach(gKey => {
      const gData = window.GOSPELS_DATA[gKey];
      if (!gData) return;

      Object.keys(gData.capitulos).forEach(capNum => {
        const cap = gData.capitulos[capNum];
        Object.keys(cap).forEach(vNum => {
          const text = cap[vNum];
          if (text.toLowerCase().includes(query)) {
            const key = `${gKey}:${capNum}:${vNum}`;
            results.push({
              gKey,
              capNum,
              vNum,
              text,
              isAdded: indexMap.has(key),
              gospelName: gData.name
            });
          }
        });
      });
    });

    el.searchResultsStats.textContent = `Se encontraron ${results.length} coincidencias:`;
    el.searchResultsList.innerHTML = '';

    if (results.length === 0) {
      el.searchResultsList.innerHTML = '<div class="empty-placeholder">No se encontraron versículos con esa frase.</div>';
      return;
    }

    // Render limited first 60 results for performance
    results.slice(0, 60).forEach(r => {
      const card = document.createElement('div');
      card.className = `verse-card ${r.isAdded ? 'already-added' : ''}`;
      const refTag = `${window.GOSPELS_DATA[r.gKey].abbreviation.toUpperCase()} ${r.capNum}:${r.vNum}`;

      card.innerHTML = `
        <div class="verse-card-header">
          <div class="verse-meta ${r.gKey}">
            <span class="verse-num-badge">${r.vNum}</span>
            <span class="verse-ref-tag">${r.gospelName} ${r.capNum}:${r.vNum}</span>
            ${r.isAdded ? '<span class="verse-added-badge">✓ Ya incluido</span>' : ''}
          </div>
          <div class="verse-card-actions" style="opacity: 1;">
            <button class="btn btn-primary btn-xs btn-add-search-verse">+ Añadir al Cap. Actual</button>
            <button class="btn btn-secondary btn-xs btn-goto-search-verse">Ir al capítulo</button>
          </div>
        </div>
        <div class="verse-card-text">${highlightMatch(r.text, query)}</div>
      `;

      card.querySelector('.btn-add-search-verse').addEventListener('click', () => {
        transferVerseToTarget(r.gKey, r.capNum, r.vNum, r.text, card);
      });

      card.querySelector('.btn-goto-search-verse').addEventListener('click', () => {
        switchSourceGospel(r.gKey);
        state.currentSourceChapter = parseInt(r.capNum, 10);
        renderSourceChapterControls();
        renderSourceVerses();
        el.modalGlobalSearch.style.display = 'none';
      });

      el.searchResultsList.appendChild(card);
    });
  }

  // ====================================================================
  // EVENT LISTENERS & SETUP
  // ====================================================================
  function setupEventListeners() {
    // Gospel Tabs (Mt, Mc, Lc, Jn)
    el.gospelTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.gospel-tab');
      if (tab) {
        const gospelKey = tab.dataset.gospel;
        switchSourceGospel(gospelKey);
      }
    });

    // Chapter Dropdown & Navigation
    el.chapterSelect.addEventListener('change', (e) => {
      state.currentSourceChapter = parseInt(e.target.value, 10);
      renderSourceChapterControls();
      renderSourceVerses();
    });

    el.btnPrevChapter.addEventListener('click', () => {
      state.currentSourceChapter--;
      renderSourceChapterControls();
      renderSourceVerses();
    });

    el.btnNextChapter.addEventListener('click', () => {
      state.currentSourceChapter++;
      renderSourceChapterControls();
      renderSourceVerses();
    });

    // Verse Search & Filter Bar
    el.verseFilterInput.addEventListener('input', (e) => {
      state.filterQuery = e.target.value;
      el.btnClearFilter.style.display = state.filterQuery ? 'block' : 'none';
      renderSourceVerses();
    });

    el.btnClearFilter.addEventListener('click', () => {
      el.verseFilterInput.value = '';
      state.filterQuery = '';
      el.btnClearFilter.style.display = 'none';
      renderSourceVerses();
    });

    // Filter Chips: Todos, Pendientes, Agregados
    document.querySelectorAll('.filter-status-buttons .btn-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-status-buttons .btn-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterStatus = btn.dataset.filter;
        renderSourceVerses();
      });
    });

    // Add Whole Chapter
    el.btnAddAllChapter.addEventListener('click', () => {
      const gospel = window.GOSPELS_DATA[state.currentGospel];
      const capData = gospel.capitulos[state.currentSourceChapter.toString()];
      const verseNumbers = Object.keys(capData).map(Number).sort((a, b) => a - b);
      
      const targetCapNum = state.currentTargetChapterIndex + 1;
      if (confirm(`¿Añadir todos los ${verseNumbers.length} versículos de ${gospel.name} Cap. ${state.currentSourceChapter} al Capítulo ${targetCapNum} de Los Cuatro Evangelios?`)) {
        verseNumbers.forEach(vNum => {
          transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, capData[vNum.toString()]);
        });
        showToast(`Capítulo entero de ${gospel.name} ${state.currentSourceChapter} añadido`, 'success');
      }
    });

    // Target Book Title Edit
    el.targetBookTitle.addEventListener('blur', () => {
      const title = el.targetBookTitle.innerText.trim();
      if (title) {
        project.titulo = title;
        triggerAutoSave();
      }
    });

    el.btnEditBookTitle.addEventListener('click', () => {
      el.targetBookTitle.focus();
    });

    // Target Chapter Title Edit
    el.targetChapterTitleInput.addEventListener('input', (e) => {
      if (project.capitulos[state.currentTargetChapterIndex]) {
        project.capitulos[state.currentTargetChapterIndex].titulo = e.target.value.trim();
        triggerAutoSave();
        renderTargetChapters();
      }
    });

    // Target Chapter Actions
    el.btnNewTargetChapter.addEventListener('click', createNewTargetChapter);
    el.btnDeleteChapter.addEventListener('click', deleteTargetChapter);

    el.btnMoveChapterLeft.addEventListener('click', () => {
      if (state.currentTargetChapterIndex > 0) {
        const idx = state.currentTargetChapterIndex;
        const temp = project.capitulos[idx];
        project.capitulos[idx] = project.capitulos[idx - 1];
        project.capitulos[idx - 1] = temp;
        state.currentTargetChapterIndex--;
        triggerAutoSave();
        renderTargetChapters();
        renderTargetVerses();
      }
    });

    el.btnMoveChapterRight.addEventListener('click', () => {
      if (state.currentTargetChapterIndex < project.capitulos.length - 1) {
        const idx = state.currentTargetChapterIndex;
        const temp = project.capitulos[idx];
        project.capitulos[idx] = project.capitulos[idx + 1];
        project.capitulos[idx + 1] = temp;
        state.currentTargetChapterIndex++;
        triggerAutoSave();
        renderTargetChapters();
        renderTargetVerses();
      }
    });

    el.btnClearTargetChapter.addEventListener('click', () => {
      const activeCap = project.capitulos[state.currentTargetChapterIndex];
      if (confirm(`¿Vaciar todos los versículos del Capítulo ${state.currentTargetChapterIndex + 1}?`)) {
        activeCap.versiculos = [];
        triggerAutoSave();
        renderTargetVerses();
        renderSourceVerses();
        renderSourceChapterControls();
        updateStatistics();
        showToast('Capítulo vaciado', 'info');
      }
    });

    el.btnRenumberChapter.addEventListener('click', () => {
      showToast('Los versículos se renumeran automáticamente de 1 en adelante', 'info');
    });

    // Views Toggle
    el.btnViewEditor.addEventListener('click', () => setViewMode('editor'));
    el.btnViewReader.addEventListener('click', () => setViewMode('reader'));
    el.btnBackToEditor.addEventListener('click', () => setViewMode('editor'));

    el.chkShowOriginTags.addEventListener('change', () => {
      renderReaderView();
    });

    el.btnPrintBook.addEventListener('click', () => {
      window.print();
    });

    el.btnCopyBookText.addEventListener('click', () => {
      const text = el.readerBookContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Texto completo copiado al portapapeles', 'success');
      });
    });

    // Save Button
    el.btnSave.addEventListener('click', () => {
      saveProjectToServer(true);
    });

    // Export Modal & Handlers
    el.btnExportMenu.addEventListener('click', () => { el.modalExport.style.display = 'flex'; });
    el.btnCloseExportModal.addEventListener('click', () => { el.modalExport.style.display = 'none'; });

    el.btnExportJSON.addEventListener('click', () => { exportProjectJSON(); el.modalExport.style.display = 'none'; });
    el.btnExportTXT.addEventListener('click', () => { exportPlainText(); el.modalExport.style.display = 'none'; });
    el.btnExportMD.addEventListener('click', () => { exportMarkdown(); el.modalExport.style.display = 'none'; });
    el.btnExportHTML.addEventListener('click', () => { exportHTML(); el.modalExport.style.display = 'none'; });
    el.btnExportServerFiles.addEventListener('click', () => { exportServerFilesDirectly(); el.modalExport.style.display = 'none'; });

    // Import Modal & Handlers
    el.btnImport.addEventListener('click', () => { el.modalImport.style.display = 'flex'; });
    el.btnCloseImportModal.addEventListener('click', () => { el.modalImport.style.display = 'none'; });

    el.importDropzone.addEventListener('click', () => { el.fileInputImport.click(); });
    el.fileInputImport.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleImportFile(e.target.files[0]);
    });

    // Drag & Drop to Import
    el.importDropzone.addEventListener('dragover', (e) => { e.preventDefault(); el.importDropzone.style.borderColor = '#10b981'; });
    el.importDropzone.addEventListener('dragleave', () => { el.importDropzone.style.borderColor = 'var(--primary)'; });
    el.importDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      el.importDropzone.style.borderColor = 'var(--primary)';
      if (e.dataTransfer.files.length > 0) handleImportFile(e.dataTransfer.files[0]);
    });

    // Help Modal
    el.btnHelp.addEventListener('click', () => { el.modalHelp.style.display = 'flex'; });
    el.btnCloseHelpModal.addEventListener('click', () => { el.modalHelp.style.display = 'none'; });

    // Global Search Modal
    el.btnGlobalSearch.addEventListener('click', () => {
      el.modalGlobalSearch.style.display = 'flex';
      setTimeout(() => el.globalSearchInput.focus(), 100);
    });
    el.btnCloseSearchModal.addEventListener('click', () => { el.modalGlobalSearch.style.display = 'none'; });

    el.globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeGlobalSearch();
    });

    [el.chkSearchMt, el.chkSearchMc, el.chkSearchLc, el.chkSearchJn].forEach(chk => {
      chk.addEventListener('change', executeGlobalSearch);
    });

    // Theme Toggle
    el.btnThemeToggle.addEventListener('click', toggleTheme);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Esc closes modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      }
      // Ctrl+S saves
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveProjectToServer(true);
      }
      // Ctrl+F opens search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !e.shiftKey) {
        e.preventDefault();
        el.modalGlobalSearch.style.display = 'flex';
        setTimeout(() => el.globalSearchInput.focus(), 100);
      }
    });

    // Click outside modal closes it
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
      });
    });
  }

  function switchSourceGospel(gKey) {
    state.currentGospel = gKey;
    document.querySelectorAll('.gospel-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.gospel === gKey);
    });
    state.currentSourceChapter = 1;
    renderSourceChapterControls();
    renderSourceVerses();
  }

  // ====================================================================
  // THEME & UTILITIES
  // ====================================================================
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme_preference') || 'light';
    setTheme(savedTheme);
  }

  function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  function setTheme(t) {
    state.theme = t;
    if (t === 'dark') {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      el.btnThemeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      el.btnThemeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme_preference', t);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Launch on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
