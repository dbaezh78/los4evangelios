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
    jn: 879,
    fs: 0
  };

  // State
  let state = {
    currentGospel: 'mt',          // 'mt' | 'mc' | 'lc' | 'jn' | 'fs'
    currentSourceChapter: 1,      // 1-based
    lastChapterByGospel: { mt: 1, mc: 1, lc: 1, jn: 1, fs: 1 },
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
    badgeFs: document.getElementById('badgeFs'),
    countTabMt: document.getElementById('countTabMt'),
    countTabMc: document.getElementById('countTabMc'),
    countTabLc: document.getElementById('countTabLc'),
    countTabJn: document.getElementById('countTabJn'),
    countTabFs: document.getElementById('countTabFs'),

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
    chkSearchFs: document.getElementById('chkSearchFs'),

    btnAddVerseToFs: document.getElementById('btnAddVerseToFs'),
    btnNewChapterFs: document.getElementById('btnNewChapterFs'),

    modalHelp: document.getElementById('modalHelp'),
    btnCloseHelpModal: document.getElementById('btnCloseHelpModal'),

    btnReadSourceChapter: document.getElementById('btnReadSourceChapter'),
    btnReadTargetChapter: document.getElementById('btnReadTargetChapter'),
    btnReadReaderBook: document.getElementById('btnReadReaderBook'),

    firebaseStatus: document.getElementById('firebaseStatus'),
    modalFirebase: document.getElementById('modalFirebase'),
    btnCloseFirebaseModal: document.getElementById('btnCloseFirebaseModal'),
    firebaseModalDetail: document.getElementById('firebaseModalDetail'),

    // Target Selection Elements
    targetSelectionBar: document.getElementById('targetSelectionBar'),
    checkSelectAllTarget: document.getElementById('checkSelectAllTarget'),
    targetSelectedCount: document.getElementById('targetSelectedCount'),
    selectMoveTargetChapter: document.getElementById('selectMoveTargetChapter'),
    btnMoveSelectedUp: document.getElementById('btnMoveSelectedUp'),
    btnMoveSelectedDown: document.getElementById('btnMoveSelectedDown'),
    btnMoveSelectedPos: document.getElementById('btnMoveSelectedPos'),
    btnDeleteSelected: document.getElementById('btnDeleteSelected'),
    btnClearSelection: document.getElementById('btnClearSelection'),

    // Source Selection Elements
    btnAddSelectedSource: document.getElementById('btnAddSelectedSource'),
    sourceSelectedCount: document.getElementById('sourceSelectedCount'),

    // Fusión & Armonización Elements
    btnAddSelectedToFusion: document.getElementById('btnAddSelectedToFusion'),
    sourceSelectedFusionCount: document.getElementById('sourceSelectedFusionCount'),
    fusionDockBar: document.getElementById('fusionDockBar'),
    fusionDockCountText: document.getElementById('fusionDockCountText'),
    fusionDockPills: document.getElementById('fusionDockPills'),
    fusionDockBtnCount: document.getElementById('fusionDockBtnCount'),
    btnOpenFusionStudioFromDock: document.getElementById('btnOpenFusionStudioFromDock'),
    btnClearFusionDock: document.getElementById('btnClearFusionDock'),
    modalFusionStudio: document.getElementById('modalFusionStudio'),
    fusionStudioTitle: document.getElementById('fusionStudioTitle'),
    btnCloseFusionStudio: document.getElementById('btnCloseFusionStudio'),
    fusionRuleBanner: document.getElementById('fusionRuleBanner'),
    fusionBannerIcon: document.getElementById('fusionBannerIcon'),
    fusionRuleBannerText: document.getElementById('fusionRuleBannerText'),
    pickerGospel: document.getElementById('pickerGospel'),
    pickerChapter: document.getElementById('pickerChapter'),
    pickerVerse: document.getElementById('pickerVerse'),
    btnPickerAddQuote: document.getElementById('btnPickerAddQuote'),
    pickerPreviewBox: document.getElementById('pickerPreviewBox'),
    pickerPreviewRef: document.getElementById('pickerPreviewRef'),
    pickerPreviewText: document.getElementById('pickerPreviewText'),
    fusionComparisonCount: document.getElementById('fusionComparisonCount'),
    btnClearAllQuotesInStudio: document.getElementById('btnClearAllQuotesInStudio'),
    fusionComparisonGrid: document.getElementById('fusionComparisonGrid'),
    fusionSourcesLabel: document.getElementById('fusionSourcesLabel'),
    fusionTargetChapterSelect: document.getElementById('fusionTargetChapterSelect'),
    fusionNextVerseBadge: document.getElementById('fusionNextVerseBadge'),
    btnMergeAllQuotes: document.getElementById('btnMergeAllQuotes'),
    btnClearEditorDraft: document.getElementById('btnClearEditorDraft'),
    fusionDraftCharCount: document.getElementById('fusionDraftCharCount'),
    fusionDraftTextarea: document.getElementById('fusionDraftTextarea'),
    fusionFooterStatus: document.getElementById('fusionFooterStatus'),
    btnCancelFusionStudio: document.getElementById('btnCancelFusionStudio'),
    btnSaveFusionStudio: document.getElementById('btnSaveFusionStudio'),

    toastContainer: document.getElementById('toastContainer')
  };

  // Multi-selection state
  let selectedTargetVerseIds = new Set();
  let lastClickedTargetIndex = -1;
  let selectedSourceVerseNums = new Set();
  let fusionSelectedVerses = [];
  let fusionStudioEditing = null;

  // ====================================================================
  // AUDIO NARRATOR ENGINE (WEB SPEECH API)
  // ====================================================================
  let spanishVoice = null;
  let audioState = {
    isPlaying: false,
    activeType: null, // 'single' | 'source' | 'target' | 'reader'
    currentVerseIndex: -1,
    activeCardEl: null,
    chapterQueue: []
  };

  function initAudioVoices() {
    if (!('speechSynthesis' in window)) return;
    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;
      spanishVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))) ||
                     voices.find(v => v.lang.startsWith('es-ES')) ||
                     voices.find(v => v.lang.startsWith('es-MX')) ||
                     voices.find(v => v.lang.startsWith('es')) ||
                     null;
    };
    findVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  function stopAudioPlayback() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioState.isPlaying = false;
    audioState.activeType = null;
    audioState.currentVerseIndex = -1;
    audioState.chapterQueue = [];
    audioState.activeCardEl = null;

    // Quitar resaltado de lectura de cualquier tarjeta
    document.querySelectorAll('.is-reading').forEach(node => node.classList.remove('is-reading'));

    // Restaurar iconos en versículos individuales
    document.querySelectorAll('.btn-speak-verse, .btn-speak-target-verse').forEach(btn => {
      btn.innerHTML = '🔊';
      btn.title = 'Escuchar este versículo en voz alta';
    });

    // Restaurar botones superiores de capítulos
    if (el.btnReadSourceChapter) {
      el.btnReadSourceChapter.classList.remove('active');
      el.btnReadSourceChapter.innerHTML = '<span class="audio-icon">🔊</span> <span class="audio-text">Leer Capítulo</span>';
      el.btnReadSourceChapter.title = 'Escuchar este capítulo completo en voz alta';
    }
    if (el.btnReadTargetChapter) {
      el.btnReadTargetChapter.classList.remove('active');
      el.btnReadTargetChapter.innerHTML = '<span class="audio-icon">🔊</span> <span class="audio-text">Leer Capítulo</span>';
      el.btnReadTargetChapter.title = 'Escuchar este capítulo completo en voz alta';
    }
    if (el.btnReadReaderBook) {
      el.btnReadReaderBook.classList.remove('active');
      el.btnReadReaderBook.innerHTML = '<span class="audio-icon">🔊</span> <span class="audio-text">Escuchar Libro</span>';
      el.btnReadReaderBook.title = 'Escuchar el libro en voz alta';
    }
  }

  function playSingleVerse(cardEl, text, refText = '') {
    if (!('speechSynthesis' in window)) {
      showToast('Tu navegador no soporta síntesis de voz (Web Speech API)', 'warning');
      return;
    }

    // Si ya se está reproduciendo este versículo exactamente, lo detenemos
    if (audioState.isPlaying && audioState.activeCardEl === cardEl) {
      stopAudioPlayback();
      showToast('Lectura detenida', 'info');
      return;
    }

    stopAudioPlayback();

    audioState.isPlaying = true;
    audioState.activeType = 'single';
    audioState.activeCardEl = cardEl;

    cardEl.classList.add('is-reading');
    const speakBtn = cardEl.querySelector('.btn-speak-verse, .btn-speak-target-verse');
    if (speakBtn) {
      speakBtn.innerHTML = '⏹️';
      speakBtn.title = 'Detener lectura';
    }

    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      stopAudioPlayback();
    };

    utterance.onerror = (e) => {
      console.warn('Error en síntesis de voz:', e);
      stopAudioPlayback();
    };

    window.speechSynthesis.speak(utterance);
    showToast(`Leyendo: ${refText || 'versículo'}`, 'info');
  }

  function toggleReadChapter(type) {
    if (!('speechSynthesis' in window)) {
      showToast('Tu navegador no soporta síntesis de voz (Web Speech API)', 'warning');
      return;
    }

    // Si ya está sonando este mismo capítulo, lo detenemos
    if (audioState.isPlaying && audioState.activeType === type) {
      stopAudioPlayback();
      showToast('Lectura de capítulo detenida', 'info');
      return;
    }

    stopAudioPlayback();

    let items = [];
    let topBtn = null;

    if (type === 'source') {
      topBtn = el.btnReadSourceChapter;
      const cards = el.sourceVersesContainer.querySelectorAll('.verse-card');
      cards.forEach(card => {
        const textNode = card.querySelector('.verse-card-text');
        const numNode = card.querySelector('.verse-num-badge');
        if (textNode) {
          const num = numNode ? numNode.textContent.trim() : '';
          items.push({
            el: card,
            text: (num ? `Versículo ${num}. ` : '') + textNode.innerText.replace(/\[.*?\]/g, '').trim()
          });
        }
      });
    } else if (type === 'target') {
      topBtn = el.btnReadTargetChapter;
      const cards = el.targetVersesContainer.querySelectorAll('.target-verse-card');
      cards.forEach(card => {
        const textNode = card.querySelector('.target-verse-text-area');
        const numNode = card.querySelector('.target-verse-num');
        if (textNode) {
          const num = numNode ? numNode.textContent.trim() : '';
          items.push({
            el: card,
            text: (num ? `Versículo ${num}. ` : '') + textNode.innerText.replace(/\[.*?\]/g, '').trim()
          });
        }
      });
    } else if (type === 'reader') {
      topBtn = el.btnReadReaderBook;
      const chapterBlocks = el.readerBookContent.querySelectorAll('.reader-chapter-block');
      chapterBlocks.forEach(block => {
        const titleNode = block.querySelector('.reader-chapter-title');
        const contentNode = block.querySelector('.reader-chapter-content');
        if (contentNode) {
          items.push({
            el: block,
            text: (titleNode ? titleNode.innerText + '. ' : '') + contentNode.innerText.replace(/\[.*?\]/g, '').trim()
          });
        }
      });
    }

    if (items.length === 0) {
      showToast('No hay versículos disponibles para leer en este capítulo', 'warning');
      return;
    }

    audioState.isPlaying = true;
    audioState.activeType = type;
    audioState.chapterQueue = items;

    if (topBtn) {
      topBtn.classList.add('active');
      topBtn.innerHTML = '<span class="audio-icon">⏹️</span> <span class="audio-text">Detener Lectura</span>';
      topBtn.title = 'Haz clic para detener la lectura en voz alta';
    }

    showToast(`Iniciando lectura en voz alta (${items.length} versículos)...`, 'info');

    function readNext(index) {
      if (!audioState.isPlaying || audioState.activeType !== type || index >= items.length) {
        stopAudioPlayback();
        showToast('Lectura en voz alta finalizada', 'success');
        return;
      }

      audioState.currentVerseIndex = index;
      const item = items[index];

      // Resaltar visualmente el versículo que se está leyendo
      document.querySelectorAll('.is-reading').forEach(n => n.classList.remove('is-reading'));
      item.el.classList.add('is-reading');
      item.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Icono en la tarjeta individual
      const cardSpeakBtn = item.el.querySelector('.btn-speak-verse, .btn-speak-target-verse');
      if (cardSpeakBtn) cardSpeakBtn.innerHTML = '⏹️';

      const utterance = new SpeechSynthesisUtterance(item.text);
      if (spanishVoice) utterance.voice = spanishVoice;
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (cardSpeakBtn) cardSpeakBtn.innerHTML = '🔊';
        if (audioState.isPlaying && audioState.activeType === type) {
          readNext(index + 1);
        }
      };

      utterance.onerror = (e) => {
        console.warn('TTS error en capítulo:', e);
        stopAudioPlayback();
      };

      window.speechSynthesis.speak(utterance);
    }

    readNext(0);
  }

  // ====================================================================
  // INITIALIZATION
  // ====================================================================
  async function init() {
    initAudioVoices();
    loadSavedTheme();
    loadSavedNavigation();
    loadFusionData();
    setupEventListeners();
    await checkServerStatus();
    loadProject();
    updateGospelTabsUI();
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
    const isLocalhost = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.protocol === 'file:';
    if (!isLocalhost) {
      state.isServerOnline = false;
      if (el.connectionStatus) {
        el.connectionStatus.className = 'connection-status offline';
        el.connectionStatus.innerHTML = '<span class="status-dot"></span><span class="status-label">Modo Nube (Firebase)</span>';
      }
      return false;
    }

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

  function updateFirebaseUI(status, errorMsg) {
    if (!el.firebaseStatus) return;

    if (status === 'connected') {
      el.firebaseStatus.className = 'firebase-status connected';
      el.firebaseStatus.innerHTML = '<span class="fb-icon">🔥</span> <span class="fb-label">Firebase: Conectado</span>';
      el.firebaseStatus.title = 'Conectado a Firebase Cloud (los-cuatro-evangelios). Haz clic para detalles.';
      if (el.firebaseModalDetail) {
        el.firebaseModalDetail.innerHTML = '<span style="color:#10b981;font-weight:600;">✓ Conectado exitosamente</span> a la base de datos Firestore (proyecto: <code>los-cuatro-evangelios</code>). Los cambios se guardan y sincronizan en la nube automáticamente.';
      }
    } else if (status === 'saving') {
      el.firebaseStatus.className = 'firebase-status';
      el.firebaseStatus.innerHTML = '<span class="fb-icon">⏳</span> <span class="fb-label">Guardando en Firebase...</span>';
    } else if (status === 'permission_denied') {
      el.firebaseStatus.className = 'firebase-status warning';
      el.firebaseStatus.innerHTML = '<span class="fb-icon">⚠️</span> <span class="fb-label">Firebase: Permisos pendientes</span>';
      el.firebaseStatus.title = 'Haz clic para ver cómo habilitar las reglas de Firestore en la consola de Firebase';
      if (el.firebaseModalDetail) {
        el.firebaseModalDetail.innerHTML = '<span style="color:#c2410c;font-weight:600;">⚠️ Permisos denegados en Firestore:</span><br>Firebase está conectado, pero las reglas de seguridad de Firestore tienen restringido el acceso. Sigue los pasos de abajo para habilitar lectura y escritura en tu consola de Firebase.';
      }
    } else if (status === 'error') {
      el.firebaseStatus.className = 'firebase-status warning';
      el.firebaseStatus.innerHTML = '<span class="fb-icon">⚠️</span> <span class="fb-label">Firebase: Error</span>';
      el.firebaseStatus.title = errorMsg || 'Error de conexión con Firebase';
      if (el.firebaseModalDetail) {
        el.firebaseModalDetail.innerHTML = '<span style="color:#ef4444;font-weight:600;">Error:</span> ' + (errorMsg || 'No se pudo conectar a Firebase.');
      }
    } else {
      el.firebaseStatus.className = 'firebase-status';
      el.firebaseStatus.innerHTML = '<span class="fb-icon">🔥</span> <span class="fb-label">Firebase: Inicializando</span>';
    }
  }

  async function loadProject() {
    let localLoaded = false;

    // 1. Cargar desde memoria local (LocalStorage)
    const local = localStorage.getItem('los_cuatro_evangelios_proyecto');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.capitulos) && parsed.capitulos.length > 0) {
          project = parsed;
          localLoaded = true;
          showToast('Proyecto cargado desde memoria local', 'info');
        }
      } catch (err) {
        console.error('Error al parsear localStorage:', err);
      }
    }

    // 2. Si el servidor local está disponible, verificar si tiene versión más reciente
    if (state.isServerOnline) {
      try {
        const res = await fetch('/api/load');
        const data = await res.json();
        if (data.success && data.project && data.project.capitulos) {
          const serverDate = data.project.ultimaModificacion || '';
          const currentDate = project.ultimaModificacion || '';
          if (!localLoaded || serverDate >= currentDate) {
            project = data.project;
            showToast('Proyecto sincronizado desde el servidor local', 'info');
            renderTargetChapters();
            renderTargetVerses();
            renderSourceVerses();
            updateStatistics();
          }
        }
      } catch (err) {
        console.log('Sin archivo previo en servidor:', err);
      }
    }

    // 3. Verificar si Firebase Cloud tiene datos
    if (window.FirebaseSync && typeof window.FirebaseSync.load === 'function') {
      try {
        const fbRes = await window.FirebaseSync.load();
        if (fbRes.success && fbRes.project && fbRes.project.capitulos) {
          const cloudDate = fbRes.project.ultimaModificacion || '';
          const currentDate = project.ultimaModificacion || '';
          if (!localLoaded || cloudDate > currentDate) {
            project = fbRes.project;
            showToast('✓ Proyecto sincronizado desde Firebase Cloud', 'success');
            renderTargetChapters();
            renderTargetVerses();
            renderSourceVerses();
            updateStatistics();
          }
        }
      } catch (err) {
        console.log('Firebase load check:', err);
      }
    }
  }

  let saveDebounceTimer = null;
  function triggerAutoSave() {
    project.ultimaModificacion = new Date().toISOString();
    // Guardado debounced para no saturar
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      saveProjectLocally();
      if (state.isServerOnline) {
        saveProjectToServer(false);
      }
      saveProjectToFirebase(false);
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

  async function saveProjectToFirebase(notifyUser = false) {
    if (!window.FirebaseSync || typeof window.FirebaseSync.save !== 'function') return;

    const res = await window.FirebaseSync.save(project);
    if (res.success) {
      updateSaveIndicator('Guardado (Nube)');
      if (notifyUser) showToast('¡Guardado exitosamente en Firebase Cloud!', 'success');
    } else if (res.isPermissionDenied) {
      if (notifyUser) {
        showToast('Firebase: Habilita las reglas de Firestore en la consola para sincronizar en la nube', 'warning');
      }
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
        if (notifyUser) {
          const cloudMsg = data.firebaseSynced ? ' y en Firebase Cloud' : '';
          showToast(`¡Guardado exitosamente en el archivo del disco${cloudMsg}!`, 'success');
        }
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      saveProjectLocally();
      if (notifyUser) showToast('Guardado en memoria local (servidor no disponible)', 'warning');
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

    // Toggle Fusión specific buttons vs standard bulk buttons
    const isFs = state.currentGospel === 'fs';
    if (el.btnAddVerseToFs) el.btnAddVerseToFs.style.display = isFs ? 'inline-flex' : 'none';
    if (el.btnNewChapterFs) el.btnNewChapterFs.style.display = isFs ? 'inline-flex' : 'none';
    if (el.btnAddAllChapter) el.btnAddAllChapter.style.display = isFs ? 'none' : 'inline-flex';

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
        setSourceChapter(c);
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
      let locSummary = '';
      if (isAdded) {
        const firstLoc = addedLocations[0];
        locSummary = addedLocations.map(l => l.capDisplay).join(', ');
        statusBadgeHtml = `<span class="verse-added-badge" title="${locSummary}">✓ En ${firstLoc.capDisplay} (#${firstLoc.vIndex + 1})</span>`;
      }

      const buttonTitle = isAdded 
        ? `Ya añadido en ${locSummary}. Para volver a agregarlo, primero quítalo de allí.` 
        : 'Añadir al capítulo actual de Los Cuatro Evangelios';

      const isFs = state.currentGospel === 'fs';
      const deleteFsBtnHtml = isFs 
        ? `<button class="btn-verse-action danger btn-delete-fs-verse" title="Eliminar de Fusión">✕</button>` 
        : '';

      const inFusion = isVerseInFusion(state.currentGospel, state.currentSourceChapter, vNum);
      const fusionBtnHtml = isFs
        ? `<button class="btn-verse-action btn-reopen-fusion-tool" title="Ver y editar fuentes en el Taller de Fusión">🔀 Taller</button>`
        : `<button class="btn-verse-action btn-fusion-pick ${inFusion ? 'is-in-fusion' : ''}" title="${inFusion ? 'Quitar de la Mesa de Fusión' : 'Añadir a la Mesa de Fusión para comparar y fusionar'}">🔀 ${inFusion ? 'En Fusión' : 'Fusión'}</button>`;

      let fsSourcesLineHtml = '';
      if (isFs && project.fusionMetadata && project.fusionMetadata[state.currentSourceChapter.toString()] && project.fusionMetadata[state.currentSourceChapter.toString()][vNum.toString()]) {
        const meta = project.fusionMetadata[state.currentSourceChapter.toString()][vNum.toString()];
        fsSourcesLineHtml = `
          <div class="fs-source-ref-line">
            <span class="fs-source-badge" title="Citas de los evangelios que componen esta fusión">🔀 Fuentes: ${escapeHtml(meta.refLabel)}</span>
            <button class="btn-reopen-fusion" data-cap="${state.currentSourceChapter}" data-verse="${vNum}" type="button">Comparar / Editar en Taller</button>
          </div>
        `;
      }

      const textSpanHtml = isFs
        ? `<span class="verse-card-text fs-editable" contenteditable="true" spellcheck="false" title="Haz clic para escribir o editar este versículo fusionado">${escapeHtml(text)}</span>`
        : `<span class="verse-card-text">${highlightMatch(text, query)}</span>`;

      card.innerHTML = `
        <label class="verse-checkbox-wrapper" title="${isAdded ? 'Ya añadido' : 'Marcar para añadir al libro'}">
          ${!isAdded ? `<input type="checkbox" class="source-verse-checkbox" data-verse="${vNum}" ${selectedSourceVerseNums.has(vNum) ? 'checked' : ''} />` : ''}
          <span class="verse-num-badge ${state.currentGospel}">${vNum}</span>
        </label>
        <div class="verse-card-body">
          <div class="verse-card-actions">
            ${deleteFsBtnHtml}
            ${fusionBtnHtml}
            <button class="btn-verse-action btn-speak-verse" title="Escuchar este versículo en voz alta">
              🔊
            </button>
            <button class="btn-verse-action btn-add-fast ${isAdded ? 'is-added' : ''}" 
                    title="${buttonTitle}" 
                    ${isAdded ? 'disabled' : ''}>
              ${isAdded ? '✓ Añadido' : '+ Añadir'}
            </button>
          </div>
          <span class="origin-pill ${state.currentGospel}">${refTag}</span>
          ${statusBadgeHtml}
          ${textSpanHtml}
          ${fsSourcesLineHtml}
        </div>
      `;

      // Edición de versículo en Fusión
      if (isFs) {
        const fsTextEl = card.querySelector('.fs-editable');
        if (fsTextEl) {
          fsTextEl.addEventListener('blur', () => {
            const newText = fsTextEl.innerText.trim();
            if (newText) {
              gospel.capitulos[state.currentSourceChapter.toString()][vNum.toString()] = newText;
              saveFusionData();
              updateStatistics();
            }
          });
        }

        const btnDelFs = card.querySelector('.btn-delete-fs-verse');
        if (btnDelFs) {
          btnDelFs.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar versículo FS ${state.currentSourceChapter}:${vNum} de Fusión?`)) {
              delete gospel.capitulos[state.currentSourceChapter.toString()][vNum.toString()];
              if (project.fusionMetadata && project.fusionMetadata[state.currentSourceChapter.toString()]) {
                delete project.fusionMetadata[state.currentSourceChapter.toString()][vNum.toString()];
              }
              saveFusionData();
              renderSourceVerses();
              renderSourceChapterControls();
              updateStatistics();
              showToast(`Versículo FS ${state.currentSourceChapter}:${vNum} eliminado de Fusión`, 'info');
            }
          });
        }
      }

      // Botón para agregar o quitar de la Mesa de Fusión
      const btnFusionPick = card.querySelector('.btn-fusion-pick');
      if (btnFusionPick) {
        btnFusionPick.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleVerseInFusion(state.currentGospel, state.currentSourceChapter, vNum);
        });
      }

      // Botón para reabrir versículo en el Taller de Fusión
      const btnReopenStudio = card.querySelectorAll('.btn-reopen-fusion, .btn-reopen-fusion-tool');
      btnReopenStudio.forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          openFusionStudio({
            editTarget: { capNum: state.currentSourceChapter, vNum: vNum },
            targetCap: state.currentSourceChapter
          });
        });
      });

      // Checkbox selección en fuente
      const chkSource = card.querySelector('.source-verse-checkbox');
      if (chkSource) {
        chkSource.addEventListener('click', (e) => {
          e.stopPropagation();
          if (chkSource.checked) selectedSourceVerseNums.add(vNum);
          else selectedSourceVerseNums.delete(vNum);
          updateSourceSelectionUI();
        });
      }

      // Escuchar versículo individual
      const btnSpeak = card.querySelector('.btn-speak-verse');
      if (btnSpeak) {
        btnSpeak.addEventListener('click', (e) => {
          e.stopPropagation();
          playSingleVerse(card, text, refTag);
        });
      }

      // ===============================================================
      // USER REQUEST REQUIREMENTS:
      // Si la cita ya está agregada, se bloquea la acción.
      // Solo se puede agregar si no está en el libro.
      // ===============================================================

      // 1. Double click transfer
      card.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (isAdded) {
          showToast(`⚠️ Este versículo ya está añadido en ${locSummary || 'el libro'}. Quítalo de allí si deseas reubicarlo.`, 'warning');
          return;
        }
        transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, text, card);
      });

      // 2. Right click transfer
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (isAdded) {
          showToast(`⚠️ Este versículo ya está añadido en ${locSummary || 'el libro'}. Quítalo de allí si deseas reubicarlo.`, 'warning');
          return;
        }
        transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, text, card);
      });

      // 3. Fast button click
      const btnAddFast = card.querySelector('.btn-add-fast');
      if (btnAddFast && !isAdded) {
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

    updateSourceSelectionUI();
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

    // BLOQUEO: No permitir volver a agregar si la cita ya existe en el libro
    const indexMap = getTargetVerseIndexMap();
    const verseKey = `${gospelKey}:${capNum}:${vNum}`;
    if (indexMap.has(verseKey)) {
      const locs = indexMap.get(verseKey) || [];
      const locDisplay = locs.map(l => l.capDisplay).join(', ') || 'el libro';
      showToast(`⚠️ "${originTag}" ya está añadido en ${locDisplay}. Para agregarlo aquí, primero quítalo de donde está.`, 'warning');
      return false;
    }

    const newVerse = {
      id: 'v-' + gospelKey + '-' + capNum + '-' + vNum + '-' + Date.now().toString(36),
      origen: originTag,
      gospelKey: gospelKey,
      capOrigen: capNum.toString(),
      vOrigen: vNum.toString(),
      texto: text,
      agregadoEn: new Date().toISOString()
    };

    if (gospelKey === 'fs') {
      const meta = project.fusionMetadata && project.fusionMetadata[capNum.toString()] && project.fusionMetadata[capNum.toString()][vNum.toString()];
      if (meta) {
        newVerse.fusionSources = meta.sources;
        newVerse.fusionRef = meta.refLabel;
      }
    }

    targetCap.versiculos.push(newVerse);

    // Visual animation on source card
    if (sourceCardEl) {
      sourceCardEl.classList.add('flash-success');
      setTimeout(() => sourceCardEl.classList.remove('flash-success'), 800);
    }

    // Toast feedback
    const capTitleDisplay = targetCap.titulo ? `Capítulo ${state.currentTargetChapterIndex + 1} (${targetCap.titulo})` : `Capítulo ${state.currentTargetChapterIndex + 1}`;
    showToast(`✓ Añadido: ${originTag} → ${capTitleDisplay}`, 'success');

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
        stopAudioPlayback();
        state.currentTargetChapterIndex = idx;
        saveNavigationState();
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
      selectedTargetVerseIds.clear();
      updateTargetSelectionUI();
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
      const isSelected = selectedTargetVerseIds.has(v.id);
      vCard.className = `target-verse-card ${isSelected ? 'is-selected' : ''}`;
      vCard.dataset.index = index;
      vCard.dataset.id = v.id;

      const gospelKey = v.gospelKey || 'mt';
      const seqNumber = index + 1;
      const fusionSubHtml = (v.gospelKey === 'fs' && v.fusionRef)
        ? `<span class="origin-fusion-sub" title="Cita fusionada de: ${escapeHtml(v.fusionRef)}">🔀 ${escapeHtml(v.fusionRef)}</span>`
        : '';

      vCard.innerHTML = `
        <label class="verse-checkbox-wrapper" title="Marcar para mover o reordenar (Mantén Shift para seleccionar varios)">
          <input type="checkbox" class="verse-select-checkbox" data-index="${index}" data-id="${v.id}" ${isSelected ? 'checked' : ''} />
          <span class="target-verse-num" title="Versículo ${seqNumber}">${seqNumber}</span>
        </label>
        <div class="target-verse-body">
          <div class="target-verse-actions">
            <button class="btn-order-action btn-speak-target-verse" title="Escuchar este versículo en voz alta">🔊</button>
            <button class="btn-order-action btn-move-up" ${index === 0 ? 'disabled' : ''} title="Subir versículo">▲</button>
            <button class="btn-order-action btn-move-down" ${index === verses.length - 1 ? 'disabled' : ''} title="Bajar versículo">▼</button>
            <button class="btn-order-action btn-move-to-cap" title="Mover a otro capítulo...">➡️</button>
            <button class="btn-order-action danger btn-remove-verse" title="Quitar de Los Cuatro Evangelios">✕</button>
          </div>
          <span class="origin-pill ${gospelKey}" title="Origen: ${v.origen} (Haz clic para ver el capítulo original)">${v.origen}</span>${fusionSubHtml}
          <span class="target-verse-text-area" contenteditable="true" spellcheck="false" title="Haz clic para editar o armonizar el texto">${escapeHtml(v.texto)}</span>
        </div>
      `;

      // Checkbox selección en destino
      const chk = vCard.querySelector('.verse-select-checkbox');
      if (chk) {
        chk.addEventListener('click', (e) => {
          e.stopPropagation();
          handleTargetVerseCheckbox(index, v.id, e.shiftKey, chk.checked);
        });
      }

      // Escuchar versículo en Los Cuatro Evangelios
      const btnSpeakTarget = vCard.querySelector('.btn-speak-target-verse');
      if (btnSpeakTarget) {
        btnSpeakTarget.addEventListener('click', () => {
          playSingleVerse(vCard, v.texto, `Capítulo ${state.currentTargetChapterIndex + 1}:${seqNumber}`);
        });
      }

      // Jump to original gospel chapter on clicking origin badge
      const originPill = vCard.querySelector('.origin-pill');
      originPill.addEventListener('click', () => {
        if (v.gospelKey && v.capOrigen) {
          switchSourceGospel(v.gospelKey, parseInt(v.capOrigen, 10));
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

    updateTargetSelectionUI();

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

  // ====================================================================
  // MULTI-SELECTION LOGIC (TARGET & SOURCE)
  // ====================================================================
  function handleTargetVerseCheckbox(index, id, isShift, checked) {
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    if (!activeCap || !activeCap.versiculos) return;

    if (isShift && lastClickedTargetIndex !== -1 && lastClickedTargetIndex !== index) {
      const start = Math.min(lastClickedTargetIndex, index);
      const end = Math.max(lastClickedTargetIndex, index);
      for (let i = start; i <= end; i++) {
        const item = activeCap.versiculos[i];
        if (item) {
          if (checked) selectedTargetVerseIds.add(item.id);
          else selectedTargetVerseIds.delete(item.id);
        }
      }
    } else {
      if (checked) selectedTargetVerseIds.add(id);
      else selectedTargetVerseIds.delete(id);
    }
    lastClickedTargetIndex = index;
    updateTargetSelectionUI();
  }

  function updateTargetSelectionUI() {
    if (!el.targetSelectionBar) return;
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    const verses = (activeCap && activeCap.versiculos) || [];
    const totalCount = verses.length;

    // Prune any ids not in active chapter
    const currentIdSet = new Set(verses.map(v => v.id));
    for (const id of selectedTargetVerseIds) {
      if (!currentIdSet.has(id)) selectedTargetVerseIds.delete(id);
    }

    const count = selectedTargetVerseIds.size;

    if (count > 0) {
      el.targetSelectionBar.style.display = 'flex';
      el.targetSelectedCount.textContent = `${count} de ${totalCount} seleccionados`;

      // Populate chapters in selectMoveTargetChapter
      if (el.selectMoveTargetChapter) {
        el.selectMoveTargetChapter.innerHTML = '<option value="">📁 Mover a capítulo...</option>';
        project.capitulos.forEach((cap, idx) => {
          if (idx !== state.currentTargetChapterIndex) {
            const opt = document.createElement('option');
            opt.value = idx.toString();
            const capTitle = cap.titulo ? `: ${cap.titulo}` : '';
            const vLen = (cap.versiculos || []).length;
            opt.textContent = `Capítulo ${idx + 1}${capTitle} (${vLen} versículos)`;
            el.selectMoveTargetChapter.appendChild(opt);
          }
        });
        const optNew = document.createElement('option');
        optNew.value = 'new';
        optNew.textContent = '+ Crear nuevo capítulo y mover allí';
        el.selectMoveTargetChapter.appendChild(optNew);
      }
    } else {
      el.targetSelectionBar.style.display = 'none';
    }

    if (el.checkSelectAllTarget) {
      el.checkSelectAllTarget.checked = totalCount > 0 && count === totalCount;
      el.checkSelectAllTarget.indeterminate = count > 0 && count < totalCount;
    }

    // Update classes on cards
    el.targetVersesContainer.querySelectorAll('.target-verse-card').forEach(card => {
      const id = card.dataset.id;
      const isSelected = selectedTargetVerseIds.has(id);
      card.classList.toggle('is-selected', isSelected);
      const cb = card.querySelector('.verse-select-checkbox');
      if (cb) cb.checked = isSelected;
    });
  }

  function moveSelectedTargetVersesToChapter(destChapterIndex) {
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    if (!activeCap || !activeCap.versiculos) return;

    const count = selectedTargetVerseIds.size;
    if (count === 0) return;

    let destCap = null;
    let newCapIndex = -1;

    if (destChapterIndex === 'new') {
      newCapIndex = project.capitulos.length;
      destCap = {
        id: 'cap-' + Date.now(),
        titulo: '',
        versiculos: []
      };
      project.capitulos.push(destCap);
    } else {
      destCap = project.capitulos[destChapterIndex];
    }

    if (!destCap) return;
    if (!destCap.versiculos) destCap.versiculos = [];

    // Extract selected preserving relative order
    const toMove = activeCap.versiculos.filter(v => selectedTargetVerseIds.has(v.id));
    activeCap.versiculos = activeCap.versiculos.filter(v => !selectedTargetVerseIds.has(v.id));

    destCap.versiculos.push(...toMove);
    selectedTargetVerseIds.clear();

    const destName = destChapterIndex === 'new' 
      ? `Capítulo ${newCapIndex + 1}` 
      : `Capítulo ${destChapterIndex + 1}${destCap.titulo ? ' (' + destCap.titulo + ')' : ''}`;

    showToast(`✓ ${toMove.length} versículos movidos al ${destName}`, 'success');

    triggerAutoSave();
    renderTargetChapters();
    renderTargetVerses();
    renderSourceVerses();
    renderSourceChapterControls();
    updateStatistics();
  }

  function moveSelectedTargetVersesUp() {
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    const verses = activeCap && activeCap.versiculos;
    if (!verses || verses.length <= 1) return;

    const firstIdx = verses.findIndex(v => selectedTargetVerseIds.has(v.id));
    if (firstIdx <= 0) {
      showToast('Los versículos seleccionados ya están al inicio', 'info');
      return;
    }

    for (let i = 1; i < verses.length; i++) {
      if (selectedTargetVerseIds.has(verses[i].id) && !selectedTargetVerseIds.has(verses[i - 1].id)) {
        const temp = verses[i];
        verses[i] = verses[i - 1];
        verses[i - 1] = temp;
      }
    }

    triggerAutoSave();
    renderTargetVerses();
  }

  function moveSelectedTargetVersesDown() {
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    const verses = activeCap && activeCap.versiculos;
    if (!verses || verses.length <= 1) return;

    let lastIdx = -1;
    for (let i = verses.length - 1; i >= 0; i--) {
      if (selectedTargetVerseIds.has(verses[i].id)) {
        lastIdx = i;
        break;
      }
    }
    if (lastIdx === -1 || lastIdx >= verses.length - 1) {
      showToast('Los versículos seleccionados ya están al final', 'info');
      return;
    }

    for (let i = verses.length - 2; i >= 0; i--) {
      if (selectedTargetVerseIds.has(verses[i].id) && !selectedTargetVerseIds.has(verses[i + 1].id)) {
        const temp = verses[i];
        verses[i] = verses[i + 1];
        verses[i + 1] = temp;
      }
    }

    triggerAutoSave();
    renderTargetVerses();
  }

  function promptMoveSelectedVersesPosition() {
    const activeCap = project.capitulos[state.currentTargetChapterIndex];
    const verses = activeCap && activeCap.versiculos;
    const count = selectedTargetVerseIds.size;
    if (!verses || count === 0) return;

    const input = prompt(
      `Mover ${count} versículos seleccionados de lugar:\n\n` +
      `• Escribe 1 (o "inicio") para colocarlos al principio del capítulo.\n` +
      `• Escribe ${verses.length} (o "final") para colocarlos al final.\n` +
      `• O escribe el número de versículo específico donde deseas ubicarlos (1 a ${verses.length}):`
    );

    if (input === null) return;
    const clean = input.trim().toLowerCase();
    let destPos = -1;

    if (clean === 'inicio' || clean === '1') {
      destPos = 1;
    } else if (clean === 'final' || clean === verses.length.toString()) {
      destPos = verses.length;
    } else {
      destPos = parseInt(clean, 10);
    }

    if (isNaN(destPos) || destPos < 1 || destPos > verses.length) {
      showToast(`Posición inválida. Debe ser un número entre 1 y ${verses.length}`, 'warning');
      return;
    }

    const selected = verses.filter(v => selectedTargetVerseIds.has(v.id));
    const unselected = verses.filter(v => !selectedTargetVerseIds.has(v.id));

    let insertIdx = destPos - 1;
    if (insertIdx > unselected.length) insertIdx = unselected.length;

    unselected.splice(insertIdx, 0, ...selected);
    activeCap.versiculos = unselected;

    triggerAutoSave();
    renderTargetVerses();
    showToast(`✓ ${count} versículos movidos a la posición ${destPos}`, 'success');
  }

  function deleteSelectedTargetVerses() {
    const count = selectedTargetVerseIds.size;
    if (count === 0) return;

    if (confirm(`¿Quitar los ${count} versículos seleccionados de este capítulo? (Volverán a estar disponibles en la fuente)`)) {
      const activeCap = project.capitulos[state.currentTargetChapterIndex];
      activeCap.versiculos = activeCap.versiculos.filter(v => !selectedTargetVerseIds.has(v.id));
      selectedTargetVerseIds.clear();
      triggerAutoSave();
      renderTargetVerses();
      renderSourceVerses();
      renderSourceChapterControls();
      updateStatistics();
      showToast(`✓ ${count} versículos eliminados del capítulo`, 'info');
    }
  }

  function clearTargetSelection() {
    selectedTargetVerseIds.clear();
    lastClickedTargetIndex = -1;
    updateTargetSelectionUI();
  }

  function updateSourceSelectionUI() {
    if (!el.btnAddSelectedSource || !el.sourceSelectedCount) return;
    const count = selectedSourceVerseNums.size;
    if (count > 0) {
      el.btnAddSelectedSource.style.display = 'inline-flex';
      el.sourceSelectedCount.textContent = count;
      if (el.btnAddSelectedToFusion && state.currentGospel !== 'fs') {
        el.btnAddSelectedToFusion.style.display = 'inline-flex';
        if (el.sourceSelectedFusionCount) el.sourceSelectedFusionCount.textContent = count;
      } else if (el.btnAddSelectedToFusion) {
        el.btnAddSelectedToFusion.style.display = 'none';
      }
    } else {
      el.btnAddSelectedSource.style.display = 'none';
      if (el.btnAddSelectedToFusion) el.btnAddSelectedToFusion.style.display = 'none';
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
    saveNavigationState();
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
      saveNavigationState();
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
    const counts = { mt: 0, mc: 0, lc: 0, jn: 0, fs: 0 };
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

    const totalFs = countTotalFsVerses();

    // Header Mini Badges
    el.badgeMt.textContent = `Mt: ${counts.mt}/${GOSPEL_TOTALS.mt}`;
    el.badgeMc.textContent = `Mc: ${counts.mc}/${GOSPEL_TOTALS.mc}`;
    el.badgeLc.textContent = `Lc: ${counts.lc}/${GOSPEL_TOTALS.lc}`;
    el.badgeJn.textContent = `Jn: ${counts.jn}/${GOSPEL_TOTALS.jn}`;
    if (el.badgeFs) {
      el.badgeFs.textContent = `Fs: ${counts.fs}${totalFs > 0 ? '/' + totalFs : ''}`;
    }

    // Source Gospel Tabs Count
    el.countTabMt.textContent = `${counts.mt}/${GOSPEL_TOTALS.mt}`;
    el.countTabMc.textContent = `${counts.mc}/${GOSPEL_TOTALS.mc}`;
    el.countTabLc.textContent = `${counts.lc}/${GOSPEL_TOTALS.lc}`;
    el.countTabJn.textContent = `${counts.jn}/${GOSPEL_TOTALS.jn}`;
    if (el.countTabFs) {
      el.countTabFs.textContent = `${counts.fs}${totalFs > 0 ? '/' + totalFs : ''}`;
    }

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
  // FUSIÓN GOSPEL (CUSTOM SYNOPTIC FUSION)
  // ====================================================================
  function countTotalFsVerses() {
    const fs = window.GOSPELS_DATA && window.GOSPELS_DATA['fs'];
    if (!fs || !fs.capitulos) return 0;
    let total = 0;
    Object.values(fs.capitulos).forEach(cap => {
      total += Object.keys(cap).length;
    });
    return total;
  }

  function saveFusionData() {
    try {
      const fsData = window.GOSPELS_DATA && window.GOSPELS_DATA['fs'] ? window.GOSPELS_DATA['fs'].capitulos : {};
      localStorage.setItem('los_cuatro_evangelios_fusion', JSON.stringify(fsData));
      if (project) {
        project.fusionData = fsData;
        if (project.fusionMetadata) {
          localStorage.setItem('los_cuatro_evangelios_fusion_meta', JSON.stringify(project.fusionMetadata));
        }
        triggerAutoSave();
      }
    } catch (e) {
      console.warn('Error al guardar datos de Fusión:', e);
    }
  }

  function loadFusionData() {
    try {
      let loaded = null;
      if (project && project.fusionData && Object.keys(project.fusionData).length > 0) {
        loaded = project.fusionData;
      } else {
        const saved = localStorage.getItem('los_cuatro_evangelios_fusion');
        if (saved) loaded = JSON.parse(saved);
      }
      if (loaded && window.GOSPELS_DATA && window.GOSPELS_DATA['fs']) {
        window.GOSPELS_DATA['fs'].capitulos = loaded;
      }

      if (project) {
        if (!project.fusionMetadata || Object.keys(project.fusionMetadata).length === 0) {
          const savedMeta = localStorage.getItem('los_cuatro_evangelios_fusion_meta');
          if (savedMeta) {
            project.fusionMetadata = JSON.parse(savedMeta);
          } else {
            project.fusionMetadata = {};
          }
        }
      }
    } catch (e) {
      console.warn('Error al cargar datos de Fusión:', e);
    }
  }

  // ====================================================================
  // MESA DE FUSIÓN & TALLER DE ARMONIZACIÓN
  // ====================================================================
  function isVerseInFusion(gospelKey, capNum, vNum) {
    const id = `${gospelKey}:${capNum}:${vNum}`;
    return fusionSelectedVerses.some(item => item.id === id);
  }

  function toggleVerseInFusion(gospelKey, capNum, vNum) {
    const id = `${gospelKey}:${capNum}:${vNum}`;
    const idx = fusionSelectedVerses.findIndex(item => item.id === id);
    const gospel = window.GOSPELS_DATA[gospelKey];
    if (!gospel) return;
    const text = gospel.capitulos[capNum.toString()] ? gospel.capitulos[capNum.toString()][vNum.toString()] : '';
    const ref = `${gospel.abbreviation.toUpperCase()} ${capNum}:${vNum}`;

    if (idx >= 0) {
      fusionSelectedVerses.splice(idx, 1);
      showToast(`${ref} retirado de la Mesa de Fusión`, 'info');
    } else {
      fusionSelectedVerses.push({
        id,
        gospelKey,
        capNum: Number(capNum),
        vNum: Number(vNum),
        ref,
        gospelName: gospel.name,
        text
      });
      showToast(`✓ ${ref} añadido a la Mesa de Fusión (${fusionSelectedVerses.length} citas)`, 'success');
    }

    updateFusionDockUI();
    renderSourceVerses();
  }

  function addVerseToFusionStudio(gospelKey, capNum, vNum) {
    const id = `${gospelKey}:${capNum}:${vNum}`;
    if (fusionSelectedVerses.some(item => item.id === id)) {
      showToast('Esta cita ya está incluida en la comparación', 'warning');
      return false;
    }
    const gospel = window.GOSPELS_DATA[gospelKey];
    if (!gospel) return false;
    const text = gospel.capitulos[capNum.toString()] ? gospel.capitulos[capNum.toString()][vNum.toString()] : '';
    const ref = `${gospel.abbreviation.toUpperCase()} ${capNum}:${vNum}`;

    fusionSelectedVerses.push({
      id,
      gospelKey,
      capNum: Number(capNum),
      vNum: Number(vNum),
      ref,
      gospelName: gospel.name,
      text
    });

    updateFusionDockUI();
    renderFusionStudioComparison();
    renderSourceVerses();
    return true;
  }

  function removeVerseFromFusionStudio(id) {
    fusionSelectedVerses = fusionSelectedVerses.filter(item => item.id !== id);
    updateFusionDockUI();
    renderFusionStudioComparison();
    renderSourceVerses();
  }

  function clearAllFusionSelection() {
    fusionSelectedVerses = [];
    updateFusionDockUI();
    if (el.modalFusionStudio && el.modalFusionStudio.style.display !== 'none') {
      renderFusionStudioComparison();
    }
    renderSourceVerses();
  }

  function updateFusionDockUI() {
    if (!el.fusionDockBar) return;
    const count = fusionSelectedVerses.length;
    if (count === 0) {
      el.fusionDockBar.style.display = 'none';
      return;
    }

    el.fusionDockBar.style.display = 'flex';
    if (el.fusionDockCountText) {
      const gospelsSet = new Set(fusionSelectedVerses.map(v => v.gospelKey));
      const gospelsStr = Array.from(gospelsSet).map(g => g.toUpperCase()).join(', ');
      el.fusionDockCountText.textContent = `${count} ${count === 1 ? 'cita' : 'citas'} (${gospelsStr})`;
    }
    if (el.fusionDockBtnCount) {
      el.fusionDockBtnCount.textContent = count;
    }

    if (el.fusionDockPills) {
      el.fusionDockPills.innerHTML = '';
      fusionSelectedVerses.forEach(item => {
        const pill = document.createElement('span');
        pill.className = `fusion-dock-pill ${item.gospelKey}`;
        pill.innerHTML = `${item.ref} <button class="btn-remove-dock-pill" title="Quitar cita">✕</button>`;
        pill.querySelector('.btn-remove-dock-pill').addEventListener('click', (e) => {
          e.stopPropagation();
          removeVerseFromFusionStudio(item.id);
        });
        el.fusionDockPills.appendChild(pill);
      });
    }

    if (el.btnOpenFusionStudioFromDock) {
      if (count >= 2) {
        el.btnOpenFusionStudioFromDock.classList.add('ready');
      } else {
        el.btnOpenFusionStudioFromDock.classList.remove('ready');
      }
    }
  }

  function openFusionStudio(options = {}) {
    fusionStudioEditing = options.editTarget || null;

    if (el.fusionStudioTitle) {
      el.fusionStudioTitle.textContent = fusionStudioEditing
        ? `🔀 Editando Cita Fusionada FS Cap. ${fusionStudioEditing.capNum}:${fusionStudioEditing.vNum}`
        : '🔀 Taller de Armonización y Fusión de Citas';
    }

    populateFusionTargetChapters(options.targetCap);

    if (fusionStudioEditing) {
      const fs = window.GOSPELS_DATA['fs'];
      const capKey = fusionStudioEditing.capNum.toString();
      const vKey = fusionStudioEditing.vNum.toString();
      const currentText = (fs && fs.capitulos[capKey] && fs.capitulos[capKey][vKey]) || '';
      if (el.fusionDraftTextarea) el.fusionDraftTextarea.value = currentText;

      const meta = project.fusionMetadata && project.fusionMetadata[capKey] && project.fusionMetadata[capKey][vKey];
      if (meta && Array.isArray(meta.sources) && fusionSelectedVerses.length === 0) {
        meta.sources.forEach(srcKey => {
          const parts = srcKey.split(':');
          if (parts.length === 3) {
            const g = parts[0];
            const c = Number(parts[1]);
            const v = Number(parts[2]);
            const gData = window.GOSPELS_DATA[g];
            if (gData && gData.capitulos[c.toString()] && gData.capitulos[c.toString()][v.toString()]) {
              fusionSelectedVerses.push({
                id: srcKey,
                gospelKey: g,
                capNum: c,
                vNum: v,
                ref: `${gData.abbreviation.toUpperCase()} ${c}:${v}`,
                gospelName: gData.name,
                text: gData.capitulos[c.toString()][v.toString()]
              });
            }
          }
        });
        updateFusionDockUI();
      }
    } else {
      if (options.initialDraft && el.fusionDraftTextarea) {
        el.fusionDraftTextarea.value = options.initialDraft;
      }
    }

    initFusionQuickPicker();
    renderFusionStudioComparison();

    if (el.fusionDraftCharCount && el.fusionDraftTextarea) {
      el.fusionDraftCharCount.textContent = `${el.fusionDraftTextarea.value.length} caracteres`;
    }

    if (el.modalFusionStudio) el.modalFusionStudio.style.display = 'flex';
  }

  function closeFusionStudio() {
    if (el.modalFusionStudio) el.modalFusionStudio.style.display = 'none';
    fusionStudioEditing = null;
  }

  function populateFusionTargetChapters(preferredCap) {
    if (!el.fusionTargetChapterSelect) return;
    el.fusionTargetChapterSelect.innerHTML = '';
    const fs = window.GOSPELS_DATA['fs'];
    const caps = fs && fs.capitulos ? Object.keys(fs.capitulos).map(Number).sort((a, b) => a - b) : [1];

    caps.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = `Capítulo ${c}`;
      if (preferredCap && c === preferredCap) opt.selected = true;
      else if (!preferredCap && c === state.currentSourceChapter && state.currentGospel === 'fs') opt.selected = true;
      el.fusionTargetChapterSelect.appendChild(opt);
    });

    const optNew = document.createElement('option');
    optNew.value = 'new';
    optNew.textContent = '+ Nuevo Capítulo en Fusión';
    el.fusionTargetChapterSelect.appendChild(optNew);

    updateNextVerseBadge();

    el.fusionTargetChapterSelect.onchange = () => {
      updateNextVerseBadge();
    };
  }

  function updateNextVerseBadge() {
    if (!el.fusionNextVerseBadge || !el.fusionTargetChapterSelect) return;
    const selected = el.fusionTargetChapterSelect.value;
    const fs = window.GOSPELS_DATA['fs'];
    if (fusionStudioEditing) {
      el.fusionNextVerseBadge.textContent = `Versículo ${fusionStudioEditing.vNum} (Editando)`;
      return;
    }
    if (selected === 'new') {
      const caps = fs && fs.capitulos ? Object.keys(fs.capitulos).map(Number) : [0];
      const nextCap = Math.max(...caps, 0) + 1;
      el.fusionNextVerseBadge.textContent = `Cap. ${nextCap}:1 (Nuevo)`;
    } else {
      const capKey = selected.toString();
      const verses = fs && fs.capitulos && fs.capitulos[capKey] ? Object.keys(fs.capitulos[capKey]).map(Number) : [];
      const nextV = verses.length > 0 ? Math.max(...verses) + 1 : 1;
      el.fusionNextVerseBadge.textContent = `Versículo ${nextV} (Nuevo)`;
    }
  }

  function renderFusionStudioComparison() {
    if (!el.fusionComparisonGrid) return;
    el.fusionComparisonGrid.innerHTML = '';
    const count = fusionSelectedVerses.length;

    if (el.fusionComparisonCount) el.fusionComparisonCount.textContent = count;

    if (count === 0) {
      el.fusionComparisonGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 1.75rem 1rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <div style="font-size: 1.75rem; margin-bottom: 0.35rem;">🔀</div>
          <strong>No hay citas seleccionadas en la comparación</strong>
          <p style="font-size: 0.82rem; margin-top: 0.25rem;">Usa el selector de arriba para agregar citas de Mateo, Marcos, Lucas o Juan, o selecciónalas desde el panel de evangelios con el botón 🔀 Fusión.</p>
        </div>
      `;
    } else {
      fusionSelectedVerses.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `fusion-quote-card ${item.gospelKey}`;
        card.innerHTML = `
          <div class="quote-card-header">
            <span class="origin-pill ${item.gospelKey}">${item.ref} · ${item.gospelName}</span>
            <div class="quote-card-actions">
              <button class="btn-quote-tool btn-use-base" data-idx="${index}" type="button" title="Copiar este texto como base en el área de redacción">⬇️ Usar de base</button>
              <button class="btn-quote-tool btn-insert-quote" data-idx="${index}" type="button" title="Añadir este texto al final del área de redacción">➕ Insertar</button>
              <button class="btn-quote-tool danger btn-remove-quote" data-id="${item.id}" type="button" title="Quitar de la comparación">✕</button>
            </div>
          </div>
          <div class="quote-card-text">${escapeHtml(item.text)}</div>
        `;

        card.querySelector('.btn-use-base').addEventListener('click', () => {
          if (el.fusionDraftTextarea) {
            el.fusionDraftTextarea.value = item.text;
            el.fusionDraftTextarea.focus();
            if (el.fusionDraftCharCount) el.fusionDraftCharCount.textContent = `${item.text.length} caracteres`;
            updateFusionStudioValidation();
            showToast(`Texto de ${item.ref} cargado como base`, 'info');
          }
        });

        card.querySelector('.btn-insert-quote').addEventListener('click', () => {
          if (el.fusionDraftTextarea) {
            const current = el.fusionDraftTextarea.value.trim();
            el.fusionDraftTextarea.value = current ? `${current} ${item.text}` : item.text;
            el.fusionDraftTextarea.focus();
            if (el.fusionDraftCharCount) el.fusionDraftCharCount.textContent = `${el.fusionDraftTextarea.value.length} caracteres`;
            updateFusionStudioValidation();
            showToast(`Fragmento de ${item.ref} insertado`, 'info');
          }
        });

        card.querySelector('.btn-remove-quote').addEventListener('click', () => {
          removeVerseFromFusionStudio(item.id);
        });

        el.fusionComparisonGrid.appendChild(card);
      });
    }

    if (el.fusionSourcesLabel) {
      if (count === 0) {
        el.fusionSourcesLabel.textContent = 'Fuentes: (selecciona al menos 2 citas de los evangelios)';
      } else {
        const refs = fusionSelectedVerses.map(v => v.ref).join(' · ');
        el.fusionSourcesLabel.textContent = `Fuentes: ${refs}`;
      }
    }

    updateFusionStudioValidation();
  }

  function updateFusionStudioValidation() {
    const count = fusionSelectedVerses.length;
    const uniqueGospels = new Set(fusionSelectedVerses.map(v => v.gospelKey));
    const draft = el.fusionDraftTextarea ? el.fusionDraftTextarea.value.trim() : '';

    const isValid = count >= 2 && draft.length > 0;

    if (el.fusionRuleBanner) {
      if (count >= 2) {
        el.fusionRuleBanner.className = 'fusion-rule-banner is-valid';
        if (el.fusionBannerIcon) el.fusionBannerIcon.textContent = '✓';
        if (el.fusionRuleBannerText) {
          el.fusionRuleBannerText.innerHTML = `<strong>${count} citas seleccionadas de ${uniqueGospels.size} evangelio(s).</strong> Analiza los textos paralelos y redacta la mejor opción consolidada.`;
        }
      } else {
        el.fusionRuleBanner.className = 'fusion-rule-banner';
        if (el.fusionBannerIcon) el.fusionBannerIcon.textContent = '⚠️';
        if (el.fusionRuleBannerText) {
          el.fusionRuleBannerText.innerHTML = `Para crear una cita fusionada, debes tener seleccionadas <strong>2 o más citas</strong> de los evangelios (Mateo, Marcos, Lucas o Juan). Actualmente tienes <strong>${count}</strong>.`;
        }
      }
    }

    if (el.fusionFooterStatus) {
      if (count < 2) {
        el.fusionFooterStatus.innerHTML = '<span class="warn">⚠️ Se requieren al menos 2 citas de los evangelios para poder guardar la fusión.</span>';
      } else if (!draft) {
        el.fusionFooterStatus.innerHTML = '<span class="warn">⚠️ Escribe o redacta el texto de la cita fusionada arriba para guardar.</span>';
      } else {
        el.fusionFooterStatus.innerHTML = `<span class="success">✓ Todo listo para guardar la cita fusionada (${count} citas armonizadas).</span>`;
      }
    }

    if (el.btnSaveFusionStudio) {
      el.btnSaveFusionStudio.disabled = !isValid;
    }
  }

  function initFusionQuickPicker() {
    if (!el.pickerGospel || !el.pickerChapter || !el.pickerVerse) return;

    function populateChapters() {
      const gKey = el.pickerGospel.value;
      const gData = window.GOSPELS_DATA[gKey];
      el.pickerChapter.innerHTML = '';
      if (!gData || !gData.capitulos) return;
      const chapters = Object.keys(gData.capitulos).map(Number).sort((a, b) => a - b);
      chapters.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `Capítulo ${c}`;
        el.pickerChapter.appendChild(opt);
      });
      populateVerses();
    }

    function populateVerses() {
      const gKey = el.pickerGospel.value;
      const cNum = el.pickerChapter.value;
      const gData = window.GOSPELS_DATA[gKey];
      el.pickerVerse.innerHTML = '';
      if (!gData || !gData.capitulos || !gData.capitulos[cNum]) return;
      const verses = Object.keys(gData.capitulos[cNum]).map(Number).sort((a, b) => a - b);
      verses.forEach(v => {
        const text = gData.capitulos[cNum][v.toString()] || '';
        const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = `v. ${v} — "${preview}"`;
        el.pickerVerse.appendChild(opt);
      });
      updatePickerPreview();
    }

    el.pickerGospel.onchange = populateChapters;
    el.pickerChapter.onchange = populateVerses;
    el.pickerVerse.onchange = updatePickerPreview;

    populateChapters();
  }

  function updatePickerPreview() {
    if (!el.pickerPreviewRef || !el.pickerPreviewText || !el.pickerGospel || !el.pickerChapter || !el.pickerVerse) return;
    const gKey = el.pickerGospel.value;
    const cNum = el.pickerChapter.value;
    const vNum = el.pickerVerse.value;
    const gData = window.GOSPELS_DATA[gKey];
    if (!gData || !gData.capitulos || !gData.capitulos[cNum]) {
      el.pickerPreviewText.textContent = 'Selecciona un versículo válido';
      return;
    }
    const text = gData.capitulos[cNum][vNum] || '';
    el.pickerPreviewRef.className = `picker-preview-ref ${gKey}`;
    el.pickerPreviewRef.textContent = `${gData.abbreviation.toUpperCase()} ${cNum}:${vNum}`;
    el.pickerPreviewText.textContent = text || '(sin texto)';
  }

  function mergeAllQuotesToDraft() {
    if (!el.fusionDraftTextarea) return;
    if (fusionSelectedVerses.length === 0) {
      showToast('Selecciona citas primero para unirlas', 'warning');
      return;
    }
    const lines = fusionSelectedVerses.map(v => `[${v.ref}] ${v.text}`);
    el.fusionDraftTextarea.value = lines.join('\n\n');
    el.fusionDraftTextarea.focus();
    if (el.fusionDraftCharCount) el.fusionDraftCharCount.textContent = `${el.fusionDraftTextarea.value.length} caracteres`;
    updateFusionStudioValidation();
    showToast('Textos combinados en el área de redacción. Edítalos para crear la versión definitiva.', 'info');
  }

  function saveFusionStudioVerse() {
    if (fusionSelectedVerses.length < 2) {
      showToast('Para crear una cita fusionada, debes seleccionar al menos 2 citas de los evangelios', 'warning');
      return;
    }
    const draftText = el.fusionDraftTextarea ? el.fusionDraftTextarea.value.trim() : '';
    if (!draftText) {
      showToast('Por favor escribe o redacta el texto de la cita fusionada', 'warning');
      return;
    }

    const fs = window.GOSPELS_DATA['fs'];
    if (!fs) return;
    if (!fs.capitulos) fs.capitulos = {};

    let targetCapNum;
    let targetVerseNum;

    if (fusionStudioEditing) {
      targetCapNum = fusionStudioEditing.capNum;
      targetVerseNum = fusionStudioEditing.vNum;
    } else {
      const selectedCapVal = el.fusionTargetChapterSelect ? el.fusionTargetChapterSelect.value : '1';
      if (selectedCapVal === 'new') {
        const caps = Object.keys(fs.capitulos).map(Number);
        targetCapNum = caps.length > 0 ? Math.max(...caps) + 1 : 1;
        fs.capitulos[targetCapNum.toString()] = {};
      } else {
        targetCapNum = Number(selectedCapVal);
      }

      if (!fs.capitulos[targetCapNum.toString()]) {
        fs.capitulos[targetCapNum.toString()] = {};
      }

      const verses = Object.keys(fs.capitulos[targetCapNum.toString()]).map(Number);
      targetVerseNum = verses.length > 0 ? Math.max(...verses) + 1 : 1;
    }

    fs.capitulos[targetCapNum.toString()][targetVerseNum.toString()] = draftText;

    if (!project.fusionMetadata) project.fusionMetadata = {};
    if (!project.fusionMetadata[targetCapNum.toString()]) project.fusionMetadata[targetCapNum.toString()] = {};

    const sources = fusionSelectedVerses.map(v => `${v.gospelKey}:${v.capNum}:${v.vNum}`);
    const refLabel = fusionSelectedVerses.map(v => v.ref).join(' · ');

    project.fusionMetadata[targetCapNum.toString()][targetVerseNum.toString()] = {
      sources,
      refLabel,
      updatedAt: new Date().toISOString()
    };

    saveFusionData();
    updateStatistics();

    closeFusionStudio();

    state.currentGospel = 'fs';
    state.currentSourceChapter = targetCapNum;
    saveNavigationState();
    renderSourceChapterControls();
    renderSourceVerses();

    showToast(`✓ Cita fusionada FS ${targetCapNum}:${targetVerseNum} guardada exitosamente (${refLabel})`, 'success');

    clearAllFusionSelection();
  }

  function addNewVerseToFs() {
    openFusionStudio({
      targetCap: state.currentSourceChapter
    });
  }

  function addNewChapterToFs() {
    const fs = window.GOSPELS_DATA && window.GOSPELS_DATA['fs'];
    if (!fs) return;
    if (!fs.capitulos) fs.capitulos = {};

    const caps = Object.keys(fs.capitulos).map(Number);
    const nextCapNum = caps.length > 0 ? Math.max(...caps) + 1 : 1;

    fs.capitulos[nextCapNum.toString()] = {
      '1': 'Escribe aquí el primer versículo del Capítulo ' + nextCapNum + '...'
    };

    saveFusionData();
    setSourceChapter(nextCapNum);
    updateStatistics();
    showToast(`Capítulo ${nextCapNum} creado en Fusión`, 'success');
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
    stopAudioPlayback();
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
    if (el.chkSearchFs && el.chkSearchFs.checked) enabledGospels.push('fs');

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
        <span class="verse-num-badge ${r.gKey}">${r.vNum}</span>
        <div class="verse-card-body">
          <div class="verse-card-actions" style="opacity: 1;">
            <button class="btn btn-primary btn-xs btn-add-search-verse" ${r.isAdded ? 'disabled style="opacity:0.6;cursor:not-allowed;"' : ''}>
              ${r.isAdded ? '✓ Añadido' : '+ Añadir'}
            </button>
            <button class="btn btn-secondary btn-xs btn-goto-search-verse">Ir al cap.</button>
          </div>
          <span class="origin-pill ${r.gKey}">${r.gospelName} ${r.capNum}:${r.vNum}</span>
          ${r.isAdded ? '<span class="verse-added-badge">✓ Ya incluido</span>' : ''}
          <span class="verse-card-text">${highlightMatch(r.text, query)}</span>
        </div>
      `;

      const btnAddSearch = card.querySelector('.btn-add-search-verse');
      if (btnAddSearch && !r.isAdded) {
        btnAddSearch.addEventListener('click', () => {
          transferVerseToTarget(r.gKey, r.capNum, r.vNum, r.text, card);
        });
      }

      card.querySelector('.btn-goto-search-verse').addEventListener('click', () => {
        switchSourceGospel(r.gKey, parseInt(r.capNum, 10));
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
      setSourceChapter(parseInt(e.target.value, 10));
    });

    el.btnPrevChapter.addEventListener('click', () => {
      setSourceChapter(state.currentSourceChapter - 1);
    });

    el.btnNextChapter.addEventListener('click', () => {
      setSourceChapter(state.currentSourceChapter + 1);
    });

    // Chapter Audio Narration (Bocinas Superiores)
    if (el.btnReadSourceChapter) {
      el.btnReadSourceChapter.addEventListener('click', () => toggleReadChapter('source'));
    }
    if (el.btnReadTargetChapter) {
      el.btnReadTargetChapter.addEventListener('click', () => toggleReadChapter('target'));
    }
    if (el.btnReadReaderBook) {
      el.btnReadReaderBook.addEventListener('click', () => toggleReadChapter('reader'));
    }

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
      const indexMap = getTargetVerseIndexMap();
      const pendingVerses = verseNumbers.filter(vNum => !indexMap.has(`${state.currentGospel}:${state.currentSourceChapter}:${vNum}`));

      if (pendingVerses.length === 0) {
        showToast(`Todos los versículos de ${gospel.name} Cap. ${state.currentSourceChapter} ya están añadidos al libro`, 'info');
        return;
      }

      const targetCapNum = state.currentTargetChapterIndex + 1;
      const confirmMsg = pendingVerses.length === verseNumbers.length
        ? `¿Añadir todos los ${verseNumbers.length} versículos de ${gospel.name} Cap. ${state.currentSourceChapter} al Capítulo ${targetCapNum} de Los Cuatro Evangelios?`
        : `¿Añadir los ${pendingVerses.length} versículos pendientes de ${gospel.name} Cap. ${state.currentSourceChapter} al Capítulo ${targetCapNum} de Los Cuatro Evangelios? (${verseNumbers.length - pendingVerses.length} ya añadidos)`;

      if (confirm(confirmMsg)) {
        pendingVerses.forEach(vNum => {
          transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, capData[vNum.toString()]);
        });
        showToast(`${pendingVerses.length} versículos añadidos al Capítulo ${targetCapNum}`, 'success');
      }
    });

    // Fusión Book Actions
    if (el.btnAddVerseToFs) {
      el.btnAddVerseToFs.addEventListener('click', addNewVerseToFs);
    }
    if (el.btnNewChapterFs) {
      el.btnNewChapterFs.addEventListener('click', addNewChapterToFs);
    }

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
        saveNavigationState();
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
        saveNavigationState();
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

    // Multi-Selection Bar in Target Chapter
    if (el.checkSelectAllTarget) {
      el.checkSelectAllTarget.addEventListener('change', (e) => {
        const activeCap = project.capitulos[state.currentTargetChapterIndex];
        if (!activeCap || !activeCap.versiculos) return;
        if (e.target.checked) {
          activeCap.versiculos.forEach(v => selectedTargetVerseIds.add(v.id));
        } else {
          selectedTargetVerseIds.clear();
        }
        updateTargetSelectionUI();
      });
    }

    if (el.selectMoveTargetChapter) {
      el.selectMoveTargetChapter.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        if (val === 'new') {
          moveSelectedTargetVersesToChapter('new');
        } else {
          moveSelectedTargetVersesToChapter(parseInt(val, 10));
        }
        el.selectMoveTargetChapter.value = '';
      });
    }

    if (el.btnMoveSelectedUp) {
      el.btnMoveSelectedUp.addEventListener('click', moveSelectedTargetVersesUp);
    }

    if (el.btnMoveSelectedDown) {
      el.btnMoveSelectedDown.addEventListener('click', moveSelectedTargetVersesDown);
    }

    if (el.btnMoveSelectedPos) {
      el.btnMoveSelectedPos.addEventListener('click', promptMoveSelectedVersesPosition);
    }

    if (el.btnDeleteSelected) {
      el.btnDeleteSelected.addEventListener('click', deleteSelectedTargetVerses);
    }

    if (el.btnClearSelection) {
      el.btnClearSelection.addEventListener('click', clearTargetSelection);
    }

    // Multi-Selection Button in Source Chapter
    if (el.btnAddSelectedSource) {
      el.btnAddSelectedSource.addEventListener('click', () => {
        const gospel = window.GOSPELS_DATA[state.currentGospel];
        const capData = gospel.capitulos[state.currentSourceChapter.toString()];
        const toAdd = Array.from(selectedSourceVerseNums).sort((a, b) => a - b);
        if (toAdd.length === 0) return;
        toAdd.forEach(vNum => {
          transferVerseToTarget(state.currentGospel, state.currentSourceChapter, vNum, capData[vNum.toString()]);
        });
        selectedSourceVerseNums.clear();
        updateSourceSelectionUI();
        renderSourceVerses();
        showToast(`✓ ${toAdd.length} versículos añadidos al Capítulo ${state.currentTargetChapterIndex + 1}`, 'success');
      });
    }

    // Bulk Add to Fusión
    if (el.btnAddSelectedToFusion) {
      el.btnAddSelectedToFusion.addEventListener('click', () => {
        const gospel = window.GOSPELS_DATA[state.currentGospel];
        if (!gospel || !gospel.capitulos) return;
        const capData = gospel.capitulos[state.currentSourceChapter.toString()];
        if (!capData) return;
        let addedCount = 0;
        selectedSourceVerseNums.forEach(vNum => {
          if (capData[vNum.toString()]) {
            const added = addVerseToFusionStudio(state.currentGospel, state.currentSourceChapter, vNum);
            if (added) addedCount++;
          }
        });
        selectedSourceVerseNums.clear();
        updateSourceSelectionUI();
        renderSourceVerses();
        if (addedCount > 0) {
          showToast(`✓ ${addedCount} citas añadidas a la Mesa de Fusión (${fusionSelectedVerses.length} en total)`, 'success');
        }
      });
    }

    // Fusión Dock Bar Listeners
    if (el.btnOpenFusionStudioFromDock) {
      el.btnOpenFusionStudioFromDock.addEventListener('click', () => {
        openFusionStudio();
      });
    }

    if (el.btnClearFusionDock) {
      el.btnClearFusionDock.addEventListener('click', clearAllFusionSelection);
    }

    // Fusión Studio Modal Listeners
    if (el.btnCloseFusionStudio) {
      el.btnCloseFusionStudio.addEventListener('click', closeFusionStudio);
    }

    if (el.btnCancelFusionStudio) {
      el.btnCancelFusionStudio.addEventListener('click', closeFusionStudio);
    }

    if (el.btnPickerAddQuote) {
      el.btnPickerAddQuote.addEventListener('click', () => {
        const gKey = el.pickerGospel.value;
        const cNum = Number(el.pickerChapter.value);
        const vNum = Number(el.pickerVerse.value);
        const success = addVerseToFusionStudio(gKey, cNum, vNum);
        if (success) {
          showToast('✓ Cita agregada a la comparación', 'success');
        }
      });
    }

    if (el.btnClearAllQuotesInStudio) {
      el.btnClearAllQuotesInStudio.addEventListener('click', () => {
        if (fusionSelectedVerses.length > 0 && confirm('¿Quitar todas las citas de la comparación?')) {
          clearAllFusionSelection();
        }
      });
    }

    if (el.btnMergeAllQuotes) {
      el.btnMergeAllQuotes.addEventListener('click', mergeAllQuotesToDraft);
    }

    if (el.btnClearEditorDraft) {
      el.btnClearEditorDraft.addEventListener('click', () => {
        if (el.fusionDraftTextarea) {
          el.fusionDraftTextarea.value = '';
          if (el.fusionDraftCharCount) el.fusionDraftCharCount.textContent = '0 caracteres';
          updateFusionStudioValidation();
        }
      });
    }

    if (el.fusionDraftTextarea) {
      el.fusionDraftTextarea.addEventListener('input', () => {
        if (el.fusionDraftCharCount) el.fusionDraftCharCount.textContent = `${el.fusionDraftTextarea.value.length} caracteres`;
        updateFusionStudioValidation();
      });
    }

    if (el.btnSaveFusionStudio) {
      el.btnSaveFusionStudio.addEventListener('click', saveFusionStudioVerse);
    }

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
    el.btnSave.addEventListener('click', async () => {
      saveProjectLocally();
      if (state.isServerOnline) {
        await saveProjectToServer(true);
      } else {
        showToast('Guardado en memoria local', 'info');
      }
      await saveProjectToFirebase(true);
    });

    // Firebase Status Modal & Listener
    if (el.firebaseStatus) {
      el.firebaseStatus.addEventListener('click', () => {
        if (el.modalFirebase) el.modalFirebase.style.display = 'flex';
      });
    }
    if (el.btnCloseFirebaseModal) {
      el.btnCloseFirebaseModal.addEventListener('click', () => {
        if (el.modalFirebase) el.modalFirebase.style.display = 'none';
      });
    }

    window.addEventListener('firebase-status-change', (e) => {
      if (e.detail) {
        updateFirebaseUI(e.detail.status, e.detail.error);
      }
    });

    if (window.FirebaseSync) {
      updateFirebaseUI(window.FirebaseSync.status, window.FirebaseSync.lastError);
    }

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

    [el.chkSearchMt, el.chkSearchMc, el.chkSearchLc, el.chkSearchJn, el.chkSearchFs].filter(Boolean).forEach(chk => {
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

  function updateGospelTabsUI() {
    document.querySelectorAll('.gospel-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.gospel === state.currentGospel);
    });
  }

  function switchSourceGospel(gKey, forceChapter = null) {
    stopAudioPlayback();
    state.currentGospel = gKey;
    selectedSourceVerseNums.clear();
    updateSourceSelectionUI();
    updateGospelTabsUI();
    if (forceChapter !== null) {
      state.currentSourceChapter = forceChapter;
    } else {
      state.currentSourceChapter = state.lastChapterByGospel[gKey] || 1;
    }
    state.lastChapterByGospel[gKey] = state.currentSourceChapter;
    saveNavigationState();
    renderSourceChapterControls();
    renderSourceVerses();
  }

  function setSourceChapter(c) {
    stopAudioPlayback();
    state.currentSourceChapter = c;
    selectedSourceVerseNums.clear();
    updateSourceSelectionUI();
    state.lastChapterByGospel[state.currentGospel] = c;
    saveNavigationState();
    renderSourceChapterControls();
    renderSourceVerses();
  }

  function saveNavigationState() {
    try {
      const navData = {
        currentGospel: state.currentGospel,
        currentSourceChapter: state.currentSourceChapter,
        lastChapterByGospel: state.lastChapterByGospel,
        currentTargetChapterIndex: state.currentTargetChapterIndex
      };
      localStorage.setItem('los_cuatro_evangelios_nav', JSON.stringify(navData));
    } catch (e) {
      console.warn('Error al guardar estado de navegación:', e);
    }
  }

  function loadSavedNavigation() {
    try {
      const saved = localStorage.getItem('los_cuatro_evangelios_nav');
      if (saved) {
        const nav = JSON.parse(saved);
        if (nav.currentGospel && ['mt', 'mc', 'lc', 'jn', 'fs'].includes(nav.currentGospel)) {
          state.currentGospel = nav.currentGospel;
        }
        if (typeof nav.currentSourceChapter === 'number' && nav.currentSourceChapter >= 1) {
          state.currentSourceChapter = nav.currentSourceChapter;
        }
        if (nav.lastChapterByGospel && typeof nav.lastChapterByGospel === 'object') {
          state.lastChapterByGospel = { ...state.lastChapterByGospel, ...nav.lastChapterByGospel };
        }
        if (typeof nav.currentTargetChapterIndex === 'number' && nav.currentTargetChapterIndex >= 0) {
          state.currentTargetChapterIndex = nav.currentTargetChapterIndex;
        }
      }
    } catch (e) {
      console.warn('Error al cargar navegación previa:', e);
    }
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
