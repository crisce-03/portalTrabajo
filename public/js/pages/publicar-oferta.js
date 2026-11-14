// Borrador: se guarda en este navegador y se recupera al volver a la página
    // shortcut: localStorage; con la API, POST /api/ofertas con estado "borrador"
    const formOferta = document.getElementById('form-oferta');
    const leerBorrador = () => { try { return JSON.parse(localStorage.getItem('borradorOferta')); } catch { return null; } };
    const escribirBorrador = valor => {
      try { valor ? localStorage.setItem('borradorOferta', JSON.stringify(valor)) : localStorage.removeItem('borradorOferta'); return true; } catch { return false; }
    };
    const borrador = leerBorrador();
    if (borrador) {
      for (const [nombre, valor] of Object.entries(borrador)) if (formOferta.elements[nombre]) formOferta.elements[nombre].value = valor;
      notificar('Recuperamos el borrador que guardaste.', 'info');
    }
    document.getElementById('guardar-borrador').addEventListener('click', () => {
      const guardado = escribirBorrador(Object.fromEntries(new FormData(formOferta)));
      notificar(guardado ? 'Borrador guardado. Puedes continuar después.' : 'No se pudo guardar el borrador en este navegador.', guardado ? 'exito' : 'error');
    });
    formOferta.addEventListener('enviado', () => escribirBorrador(null));
