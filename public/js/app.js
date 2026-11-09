document.getElementById('btn-test').addEventListener('click', async () => {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Conectando...';
    
    try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        
        if (data.success) {
            resultadoDiv.innerHTML = `
                <div class="alert alert-success">
                    <h5>${data.mensaje}</h5>
                    <p class="mb-0 text-dark"><small>Postgres: ${data.datos.version}</small></p>
                </div>
            `;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
});