const formRegistro = document.getElementById('form-registro');
    const camposCandidato = document.getElementById('campos-candidato');
    const camposEmpresa = document.getElementById('campos-empresa');

    // Un fieldset deshabilitado no se valida ni se envía: así cada tipo pide solo sus campos
    function alternarTipo() {
      const esEmpresa = formRegistro.tipo.value === 'empresa';
      camposEmpresa.hidden = camposEmpresa.disabled = !esEmpresa;
      camposCandidato.hidden = camposCandidato.disabled = esEmpresa;
    }
    formRegistro.querySelectorAll('[name="tipo"]').forEach(radio => radio.addEventListener('change', alternarTipo));
    if (parametro('tipo') === 'empresa') document.getElementById('t-empresa').checked = true;
    alternarTipo();

    const clave = document.getElementById('r-clave');
    const confirmar = document.getElementById('r-confirmar');
    const revisarClaves = () => confirmar.setCustomValidity(confirmar.value === clave.value ? '' : 'Las contraseñas no coinciden.');
    [clave, confirmar].forEach(campo => campo.addEventListener('input', revisarClaves));

    // shortcut: no crea la cuenta; con la API, hacer POST /api/registro y usar el rol que devuelva
    formRegistro.addEventListener('enviado', () => {
      guardarSesion(formRegistro.tipo.value);
      formRegistro.dataset.destino = INICIO_POR_ROL[formRegistro.tipo.value];
    });
