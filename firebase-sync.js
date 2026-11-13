/**
 * ====================================================================
 * FIREBASE CLOUD SYNC MODULE
 * Proyecto: Los Cuatro Evangelios
 * ====================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración de Firebase proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyCDjE-CA21la_rBIpCsb76154UW60AyroM",
  authDomain: "los-cuatro-evangelios.firebaseapp.com",
  projectId: "los-cuatro-evangelios",
  storageBucket: "los-cuatro-evangelios.firebasestorage.app",
  messagingSenderId: "1021231312735",
  appId: "1:1021231312735:web:859daa6e596713d72e50ea"
};

const PROJECT_DOC_ID = "los-cuatro-evangelios";
const COLLECTION_NAME = "proyectos";

let app = null;
let db = null;
let isInitialized = false;
let isPermissionBlocked = false;
let listeners = [];
let unsubscribeSnapshot = null;

const FirebaseSync = {
  status: "initializing", // "initializing" | "connected" | "error" | "permission_denied"
  lastError: null,

  async init() {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      isInitialized = true;
      this.status = "connected";
      console.log("🔥 Firebase inicializado correctamente en el cliente");
      this.notifyStatusChange();
      return true;
    } catch (err) {
      console.warn("⚠️ Error al inicializar Firebase SDK:", err);
      this.status = "error";
      this.lastError = err.message;
      this.notifyStatusChange();
      return false;
    }
  },

  notifyStatusChange() {
    const event = new CustomEvent("firebase-status-change", {
      detail: { status: this.status, error: this.lastError }
    });
    window.dispatchEvent(event);
  },

  async save(projectData) {
    if (!isInitialized || !db) {
      return { success: false, error: "Firebase no inicializado" };
    }

    try {
      this.status = "saving";
      this.notifyStatusChange();

      const docRef = doc(db, COLLECTION_NAME, PROJECT_DOC_ID);
      const payload = {
        titulo: projectData.titulo || "Los Cuatro Evangelios",
        capitulos: projectData.capitulos || [],
        creadoEn: projectData.creadoEn || new Date().toISOString(),
        ultimaModificacion: new Date().toISOString(),
        totalCapitulos: (projectData.capitulos && projectData.capitulos.length) || 0,
        actualizadoDesde: "web-client"
      };

      await setDoc(docRef, payload, { merge: true });

      this.status = "connected";
      isPermissionBlocked = false;
      this.notifyStatusChange();

      return { success: true, savedAt: new Date().toISOString() };
    } catch (err) {
      console.warn("⚠️ Error al guardar en Firestore:", err);

      if (err.code === "permission-denied" || (err.message && err.message.includes("permissions"))) {
        this.status = "permission_denied";
        isPermissionBlocked = true;
      } else {
        this.status = "error";
      }

      this.lastError = err.message || err.code;
      this.notifyStatusChange();

      return {
        success: false,
        error: err.message,
        code: err.code,
        isPermissionDenied: isPermissionBlocked
      };
    }
  },

  async load() {
    if (!isInitialized || !db) {
      return { success: false, error: "Firebase no inicializado" };
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, PROJECT_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.status = "connected";
        this.notifyStatusChange();
        return { success: true, project: docSnap.data() };
      } else {
        return { success: true, project: null, message: "No hay documento previo en Firebase" };
      }
    } catch (err) {
      console.warn("⚠️ Error al cargar desde Firestore:", err);

      if (err.code === "permission-denied" || (err.message && err.message.includes("permissions"))) {
        this.status = "permission_denied";
        isPermissionBlocked = true;
      } else {
        this.status = "error";
      }

      this.lastError = err.message || err.code;
      this.notifyStatusChange();

      return {
        success: false,
        error: err.message,
        code: err.code,
        isPermissionDenied: isPermissionBlocked
      };
    }
  },

  subscribe(callback) {
    if (!isInitialized || !db) return null;

    try {
      const docRef = doc(db, COLLECTION_NAME, PROJECT_DOC_ID);
      unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(data);
        }
      }, (err) => {
        console.warn("⚠️ Error en listener de Firestore:", err.code);
        if (err.code === "permission-denied") {
          this.status = "permission_denied";
          this.notifyStatusChange();
        }
      });
      return unsubscribeSnapshot;
    } catch (err) {
      console.warn("No se pudo iniciar listener en Firestore:", err);
      return null;
    }
  }
};

// Export to global window for app.js
window.FirebaseSync = FirebaseSync;

// Auto-initialize when script loads
FirebaseSync.init();
