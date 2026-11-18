const formRegistro = document.getElementById('form-registro');
    const camposEmpresa = document.getElementById('campos-empresa');

    // Un fieldset deshabilitado no se valida ni se envía: los datos de empresa solo se piden a las empresas.
    // Nombre y apellidos se piden siempre: la API los exige a la persona dueña de la cuenta.
    function alternarTipo() {
      camposEmpresa.hidden = camposEmpresa.disabled = formRegistro.tipo.value !== 'empresa';
    }
    formRegistro.querySelectorAll('[name="tipo"]').forEach(radio => radio.addEventListener('change', alternarTipo));
    if (parametro('tipo') === 'empresa') document.getElementById('t-empresa').checked = true;
    alternarTipo();

    const clave = document.getElementById('r-clave');
    const confirmar = document.getElementById('r-confirmar');
    const revisarClaves = () => confirmar.setCustomValidity(confirmar.value === clave.value ? '' : 'Las contraseñas no coinciden.');
    [clave, confirmar].forEach(campo => campo.addEventListener('input', revisarClaves));

    formRegistro.addEventListener('enviado', async () => {
      try {
        const { data } = await apiRequest('/registro', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(formRegistro))) });
        iniciarSesion(data);
        location.href = INICIO_POR_ROL[data.usuario.rol];
      } catch (error) {
        avisar(formRegistro, error.message);
      }
    });
