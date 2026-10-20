# 📖 Los Cuatro Evangelios — Editor de Consolidación y Armonización

Aplicación web diseñada para compilar, consolidar y armonizar los 4 Evangelios (**San Mateo**, **San Marcos**, **San Lucas** y **San Juan**) en un solo libro unificado titulado **"Los Cuatro Evangelios"**.

---

## 🚀 Cómo Iniciar la Aplicación

Tienes dos formas muy sencillas de usarla:

### Opción 1: Con Servidor Local (Recomendado)
1. Haz doble clic en el archivo **`iniciar.bat`** (o ejecuta en una terminal: `node server.js`).
2. Se abrirá automáticamente tu navegador en:
   👉 **`http://localhost:3000`**
3. **Ventajas**: Guarda tus cambios directamente en el archivo `los_cuatro_evangelios_proyecto.json` en tu disco duro y permite exportar directamente los archivos `.md` y `.txt`.

### Opción 2: Sin Servidor (Standalone)
- Simplemente haz doble clic sobre el archivo **`index.html`** para abrirlo en cualquier navegador (Chrome, Edge, Firefox).
- Funciona 100% sin conexión a internet y guarda tu avance en el almacenamiento del navegador (`localStorage`).

---

## 🎯 Cómo Seleccionar y Pasar Versículos

La interfaz está dividida en dos paneles:

### 1. Panel Izquierdo (Fuentes: Los 4 Evangelios)
1. **Seleccionar el Libro**: Haz clic en las pestañas superiores:
   - **Mt** (San Mateo - 28 capítulos, 1,067 versículos)
   - **Mc** (San Marcos - 16 capítulos, 674 versículos)
   - **Lc** (San Lucas - 24 capítulos, 1,149 versículos)
   - **Jn** (San Juan - 21 capítulos, 879 versículos)
2. **Seleccionar el Capítulo**: Usa las flechas `◀` y `▶`, el menú desplegable o haz clic en las píldoras de números de capítulo.
3. **Pasar Versículos al Nuevo Libro**:
   - ⚡ **Doble Clic**: Haz doble clic sobre cualquier tarjeta de versículo.
   - 🖱️ **Clic Derecho**: Haz clic derecho sobre el versículo para transferirlo de inmediato sin abrir el menú del navegador.
   - ➕ **Botón "+ Añadir"**: Disponible al pasar el cursor por encima.

> **Indicador de versículos ya incluidos:**  
> Cuando un versículo ya ha sido transferido al libro, cambia a un tono verde suave y muestra un distintivo indicando en qué capítulo y posición está (ej: `✓ En Cap. 1 (#3)`).

---

### 2. Panel Derecho (Destino: "Los Cuatro Evangelios")
- **Título del Libro**: Editable directamente (por defecto *"Los Cuatro Evangelios"*).
- **Gestión de Capítulos**:
  - Pulsa **`+ Nuevo Capítulo`** para crear el Capítulo 2, 3, etc.
  - Selecciona cualquier pestaña de capítulo para hacerlo el capítulo activo al que irán los versículos seleccionados.
  - Asigna un título o subtítulo temático opcional al capítulo (ej: *"Capítulo 1: Genealogía y Anunciación"*).
  - Reordena capítulos con `◀` y `▶`, o elimínalos con `🗑️`.
- **Organización de Versículos**:
  - **Renumeración automática**: Cada versículo en el nuevo capítulo recibe su número secuencial (`1`, `2`, `3`...).
  - **Referencia de origen**: Muestra de qué evangelio proviene (`[Mt 1:1]`, `[Jn 1:1]`). Al hacer clic en la etiqueta de origen, el panel izquierdo salta automáticamente a ese evangelio y capítulo original.
  - **Reordenar**: Usa las flechas `▲` y `▼` para cambiar el orden de los versículos.
  - **Editar texto**: Puedes hacer clic directamente sobre el texto de cualquier versículo para pulir o armonizar la redacción.
  - **Mover de capítulo**: Pulsa `➡️` para transferir un versículo a otro capítulo de Los Cuatro Evangelios.
  - **Quitar**: Pulsa `✕` para remover un versículo (vuelve a quedar pendiente en el panel izquierdo).

---

## 🛠️ Herramientas Adicionales

- **📊 Barra de Progreso Global**: En la parte superior verás en tiempo real cuántos versículos únicos has incluido de los **3,769 versículos totales** y el avance por cada evangelio.
- **📜 Vista de Lectura (Libro Completo)**: Cambia a la pestaña *"Libro Completo"* para leer todo tu trabajo maquetado como un libro continuo, con capítulos y versículos listos para imprimir o guardar como PDF (`Ctrl + P`).
- **🔍 Búsqueda Global (`Ctrl + F`)**: Busca palabras o frases en simultáneo en los 4 evangelios y añade los resultados con un solo clic.
- **💾 Guardado y Respaldos**:
  - Auto-guardado continuo en memoria local.
  - Botón **Guardar** (`Ctrl + S`).
  - **Exportar**: Descarga tu libro en formato **JSON** (copia de seguridad editable), **TXT** (texto limpio), **Markdown** (`.md`) o **HTML** (maquetado bíblico).
  - **Importar**: Puedes subir cualquier archivo `.json` de respaldo previo para continuar tu trabajo en cualquier computadora.
- **🌙 Tema Claro / Oscuro**: Pulsa el icono de luna/sol en la esquina superior derecha.

---

## 📁 Estructura del Proyecto

```
los4evangelios/
├── doc/
│   ├── 47_mt.json       # Texto original San Mateo
│   ├── 48_mc.json       # Texto original San Marcos
│   ├── 49_lc.json       # Texto original San Lucas
│   └── 50_jn.json       # Texto original San Juan
├── data/
│   └── gospels.js       # Base de datos empaquetada para uso offline
├── index.html           # Interfaz web principal
├── styles.css           # Estilos y diseño tipográfico bíblico
├── app.js               # Lógica interactiva del editor y armonizador
├── server.js            # Servidor local Node.js ligero
├── iniciar.bat          # Lanzador automático para Windows
└── README.md            # Documentación de uso
```
