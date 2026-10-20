// ==============================================================================================================================
// === COPIAS DE SEGURIDAD (BACKUP / RESTORE) ===
// ==============================================================================================================================

function hacerCopiaSeguridad() {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = '#fff';
  popup.style.padding = '20px';
  popup.style.borderRadius = '10px';
  popup.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  popup.style.zIndex = '99999';
  popup.innerHTML = `
    <p style="font-weight:bold; margin-top:0;">Registrar copia de seguridad</p>
    <label>Nombre: <input type="text" id="backupName" placeholder="Nombre de copia de seguridad" style="padding:6px; width:90%; margin-top:4px;"></label><br><br>
    <label>Fecha: <input type="date" id="backupDate" style="padding:6px; margin-top:4px;"></label><br><br>
    <button id="confirmBackup" style="padding:10px 15px; background:#28a745; color:#fff; border:none; border-radius:5px; cursor:pointer;">Guardar</button>
    <button id="cancelBackup" style="padding:10px 15px; background:#ccc; color:#000; border:none; border-radius:5px; cursor:pointer; margin-left:8px;">Cancelar</button>
  `;
  document.body.appendChild(popup);

  document.getElementById('cancelBackup').addEventListener('click', () => {
    document.body.removeChild(popup);
  });

  document.getElementById('confirmBackup').addEventListener('click', () => {
    const nombre = document.getElementById('backupName').value.trim() || 'Copia';
    const fechaInput = document.getElementById('backupDate').value;
    let fecha = new Date();
    if (fechaInput) fecha = new Date(fechaInput);

    const nombreArchivo = `${nombre} ${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}.json`;
    const data = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    document.body.removeChild(popup);

    // Popup post-descarga
    const popup2 = document.createElement('div');
    popup2.style.position = 'fixed';
    popup2.style.top = '50%';
    popup2.style.left = '50%';
    popup2.style.transform = 'translate(-50%, -50%)';
    popup2.style.backgroundColor = '#fff';
    popup2.style.padding = '20px';
    popup2.style.borderRadius = '10px';
    popup2.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    popup2.style.zIndex = '99999';
    popup2.innerHTML = `
      <p style="margin-top:0;">Copia de seguridad "${nombreArchivo}" descargada ✅</p>
      <button id="cerrarPopup2" style="padding:10px 15px; background:#ccc; color:#000; border:none; border-radius:5px; cursor:pointer;">Cerrar</button>
    `;
    document.body.appendChild(popup2);
    document.getElementById('cerrarPopup2').addEventListener('click', () => document.body.removeChild(popup2));
  });
}

function restaurarCopia() {
  const restoreFile = document.createElement('input');
  restoreFile.type = 'file';
  restoreFile.accept = '.json';
  restoreFile.style.display = 'none';
  document.body.appendChild(restoreFile);

  restoreFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        localStorage.clear();
        for (const key in data) localStorage.setItem(key, data[key]);
        alert('Copia de seguridad restaurada ✅');
        location.reload();
      } catch (err) {
        alert('Error al restaurar el archivo. Asegúrate de que sea la copia correcta.');
      }
    };
    reader.readAsText(file);
  });

  restoreFile.click();
  document.body.removeChild(restoreFile);
}

