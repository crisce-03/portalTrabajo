// shortcut: no guarda; con la API, PUT /api/empresas/:id con los datos del formulario
    document.getElementById("form-empresa").addEventListener("enviado", () =>
      document.getElementById("actualizado").textContent = new Date().toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" }));
