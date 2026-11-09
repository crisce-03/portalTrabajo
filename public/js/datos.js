// Datos de ejemplo del prototipo.
// shortcut: todo vive aquí en memoria; cuando exista la API, cada lista se reemplaza por un fetch (p. ej. GET /api/ofertas)

const OFERTAS = [
  {
    id: 302, titulo: 'Arquitecto de Software Cloud', empresa: 'InnovaTech S.A.', ubicacion: 'San Salvador, El Salvador',
    modalidad: 'Híbrido', contrato: 'Tiempo completo', experiencia: 'Intermedio', sector: 'Tecnología',
    salarioMin: 1800, salarioMax: 2500, fecha: '2026-11-06', contacto: 'rrhh@innovatech.com',
    descripcion: 'En InnovaTech S.A. buscamos a un profesional que participe en el diseño y desarrollo de soluciones en la nube, con enfoque en escalabilidad, calidad y trabajo colaborativo.',
    responsabilidades: ['Diseñar APIs escalables y arquitecturas de software.', 'Participar en decisiones técnicas de bases de datos SQL.', 'Colaborar en revisiones de código y documentación técnica.', 'Proponer mejoras de rendimiento y seguridad.'],
    requisitos: ['3 o más años de experiencia en desarrollo web.', 'Conocimientos de servicios cloud y APIs REST.', 'Experiencia con bases de datos relacionales y Git.', 'Capacidad para comunicarse y trabajar en equipo.'],
    beneficios: ['Seguro médico y bono anual.', 'Modalidad de trabajo híbrida.', 'Capacitaciones y oportunidades de crecimiento.'],
  },
  {
    id: 305, titulo: 'Diseñador UI/UX', empresa: 'InnovaTech S.A.', ubicacion: 'San Salvador, El Salvador',
    modalidad: 'Remoto', contrato: 'Tiempo completo', experiencia: 'Junior', sector: 'Diseño',
    salarioMin: 900, salarioMax: 1300, fecha: '2026-11-04', contacto: 'rrhh@innovatech.com',
    descripcion: 'Buscamos un diseñador que convierta necesidades de usuarios en interfaces claras para nuestros productos web y móviles.',
    responsabilidades: ['Diseñar flujos, wireframes y prototipos en Figma.', 'Realizar pruebas de usabilidad con usuarios.', 'Mantener el sistema de diseño del producto.'],
    requisitos: ['Portafolio con proyectos de UI/UX.', 'Manejo de Figma y principios de accesibilidad.', 'Comunicación con equipos de desarrollo.'],
    beneficios: ['Trabajo 100 % remoto.', 'Equipo de trabajo proporcionado.', 'Horario flexible.'],
  },
  {
    id: 311, titulo: 'Backend Developer .NET', empresa: 'InnovaTech S.A.', ubicacion: 'San Salvador, El Salvador',
    modalidad: 'Híbrido', contrato: 'Tiempo completo', experiencia: 'Intermedio', sector: 'Tecnología',
    salarioMin: 1400, salarioMax: 1900, fecha: '2026-11-02', contacto: 'rrhh@innovatech.com',
    descripcion: 'Desarrollarás servicios y APIs en .NET para las plataformas de nuestros clientes empresariales.',
    responsabilidades: ['Construir y mantener APIs REST en C#.', 'Optimizar consultas SQL Server.', 'Escribir pruebas automatizadas.'],
    requisitos: ['2 o más años con C# / .NET.', 'Conocimiento de SQL y Git.', 'Inglés técnico.'],
    beneficios: ['Seguro médico privado.', 'Bono por desempeño.', 'Certificaciones pagadas.'],
  },
  {
    id: 318, titulo: 'Desarrollador Fullstack', empresa: 'TechNova S.A.', ubicacion: 'Santa Ana, El Salvador',
    modalidad: 'Remoto', contrato: 'Tiempo completo', experiencia: 'Intermedio', sector: 'Tecnología',
    salarioMin: 1200, salarioMax: 1700, fecha: '2026-11-08', contacto: 'talento@technova.com',
    descripcion: 'Únete al equipo que desarrolla nuestra plataforma de comercio electrónico con Node.js y React.',
    responsabilidades: ['Desarrollar funcionalidades de frontend y backend.', 'Integrar servicios de pago y envíos.', 'Participar en la planificación del equipo.'],
    requisitos: ['Experiencia con JavaScript, Node.js y React.', 'Bases de datos relacionales.', 'Trabajo con metodologías ágiles.'],
    beneficios: ['Trabajo remoto.', 'Aguinaldo completo.', 'Días libres por cumpleaños.'],
  },
  {
    id: 320, titulo: 'Analista de Datos Jr.', empresa: 'Finanzas Unidas S.A.', ubicacion: 'San Salvador, El Salvador',
    modalidad: 'Presencial', contrato: 'Tiempo completo', experiencia: 'Junior', sector: 'Administración y finanzas',
    salarioMin: 800, salarioMax: 1100, fecha: '2026-11-07', contacto: 'empleos@finanzasunidas.com',
    descripcion: 'Apoyarás al área de inteligencia de negocios con reportes y análisis para la toma de decisiones.',
    responsabilidades: ['Preparar reportes en Excel y Power BI.', 'Limpiar y validar bases de datos.', 'Presentar hallazgos al equipo.'],
    requisitos: ['Estudiante avanzado o graduado en carreras afines.', 'Excel intermedio y nociones de SQL.', 'Atención al detalle.'],
    beneficios: ['Prestaciones de ley.', 'Plan de carrera.', 'Transporte desde puntos clave.'],
  },
  {
    id: 322, titulo: 'Asistente Administrativo', empresa: 'Auto Life Corp', ubicacion: 'San Miguel, El Salvador',
    modalidad: 'Presencial', contrato: 'Medio tiempo', experiencia: 'Sin experiencia', sector: 'Administración y finanzas',
    salarioMin: 450, salarioMax: 600, fecha: '2026-11-05', contacto: 'rrhh@autolife.com',
    descripcion: 'Brindarás apoyo administrativo a la sucursal de San Miguel en horario de medio tiempo.',
    responsabilidades: ['Atender clientes y llamadas.', 'Archivar y digitar documentos.', 'Apoyar en inventarios.'],
    requisitos: ['Bachillerato completo.', 'Manejo básico de Office.', 'Buena actitud de servicio.'],
    beneficios: ['Horario de medio tiempo.', 'Prestaciones de ley.'],
  },
  {
    id: 325, titulo: 'Especialista en Marketing Digital', empresa: 'Creativa Agencia Digital', ubicacion: 'La Libertad, El Salvador',
    modalidad: 'Híbrido', contrato: 'Por proyecto', experiencia: 'Intermedio', sector: 'Marketing',
    salarioMin: 1000, salarioMax: 1400, fecha: '2026-11-01', contacto: 'hola@creativa.com',
    descripcion: 'Lidera campañas digitales para marcas locales durante un proyecto de seis meses.',
    responsabilidades: ['Planificar campañas en redes sociales.', 'Medir resultados y optimizar anuncios.', 'Coordinar con diseño y clientes.'],
    requisitos: ['2 años en marketing digital.', 'Manejo de Meta Ads y Google Analytics.', 'Redacción creativa.'],
    beneficios: ['Modalidad híbrida.', 'Posibilidad de contrato permanente.'],
  },
  {
    id: 327, titulo: 'Practicante de Soporte TI', empresa: 'TechNova S.A.', ubicacion: 'Santa Ana, El Salvador',
    modalidad: 'Presencial', contrato: 'Pasantía', experiencia: 'Sin experiencia', sector: 'Tecnología',
    salarioMin: 300, salarioMax: 400, fecha: '2026-11-09', contacto: 'talento@technova.com',
    descripcion: 'Pasantía para estudiantes que deseen aprender soporte técnico en un equipo de TI.',
    responsabilidades: ['Atender solicitudes de soporte.', 'Instalar y configurar equipos.', 'Documentar incidencias.'],
    requisitos: ['Estudiante de Ingeniería en Sistemas o afín.', 'Disponibilidad de 6 meses.', 'Ganas de aprender.'],
    beneficios: ['Estipendio mensual.', 'Constancia de pasantía.', 'Mentoría del equipo.'],
  },
];

const EMPRESAS = [
  {
    id: 'innovatech-sa', nombre: 'InnovaTech S.A.', sector: 'Tecnología y software', ubicacion: 'San Salvador, El Salvador',
    contacto: 'rrhh@innovatech.com', web: 'innovatech.com (ejemplo)', promedio: 4.8, opiniones: 24,
    resenas: [
      { autor: 'Exempleado', calificacion: 5, texto: 'Excelente ambiente laboral y pagos puntuales.' },
      { autor: 'Profesional de tecnología', calificacion: 4, texto: 'Buenos proyectos y oportunidades para aprender.' },
      { autor: 'Desarrolladora backend', calificacion: 5, texto: 'Se respetan los horarios y hay capacitación constante.' },
    ],
  },
  {
    id: 'technova-sa', nombre: 'TechNova S.A.', sector: 'Comercio electrónico', ubicacion: 'Santa Ana, El Salvador',
    contacto: 'talento@technova.com', web: 'technova.com (ejemplo)', promedio: 4.3, opiniones: 15,
    resenas: [
      { autor: 'Desarrollador fullstack', calificacion: 4, texto: 'El trabajo remoto está bien organizado.' },
      { autor: 'Exempleado de soporte', calificacion: 4, texto: 'Buen lugar para iniciar tu carrera.' },
    ],
  },
  {
    id: 'finanzas-unidas-sa', nombre: 'Finanzas Unidas S.A.', sector: 'Servicios financieros', ubicacion: 'San Salvador, El Salvador',
    contacto: 'empleos@finanzasunidas.com', web: 'finanzasunidas.com (ejemplo)', promedio: 4.1, opiniones: 12,
    resenas: [
      { autor: 'Analista', calificacion: 4, texto: 'Prestaciones completas y plan de carrera claro.' },
      { autor: 'Exempleada', calificacion: 4, texto: 'Mucha carga a fin de mes, pero buen equipo.' },
    ],
  },
  {
    id: 'creativa-agencia-digital', nombre: 'Creativa Agencia Digital', sector: 'Marketing y publicidad', ubicacion: 'La Libertad, El Salvador',
    contacto: 'hola@creativa.com', web: 'creativa.com (ejemplo)', promedio: 4.5, opiniones: 7,
    resenas: [
      { autor: 'Diseñador gráfico', calificacion: 5, texto: 'Proyectos creativos y un equipo joven.' },
      { autor: 'Community manager', calificacion: 4, texto: 'Horario flexible, aunque los proyectos son cortos.' },
    ],
  },
  {
    id: 'auto-life-corp', nombre: 'Auto Life Corp', sector: 'Automotriz y servicios', ubicacion: 'San Miguel, El Salvador',
    contacto: 'rrhh@autolife.com', web: 'autolife.com (ejemplo)', promedio: 3.9, opiniones: 9,
    resenas: [
      { autor: 'Asistente de ventas', calificacion: 4, texto: 'Buen trato de los jefes.' },
      { autor: 'Exempleado', calificacion: 3, texto: 'El salario podría mejorar.' },
    ],
  },
];

// sector: software | diseno | finanzas · nivel: junior | senior · tipo: remoto | completo
const HILOS = [
  {
    id: 1, titulo: '¿Qué tecnologías y pruebas técnicas están pidiendo para Desarrollador Web este año?',
    resumen: 'Compartamos experiencias reales sobre entrevistas técnicas en React, Node.js y bases de datos SQL para ayudar a otros candidatos.',
    contenido: 'En mis últimas tres entrevistas me pidieron una prueba práctica con React y una API en Node.js, además de preguntas de SQL. ¿Qué les han pedido a ustedes? Así podemos prepararnos mejor.',
    autor: 'Carlos Méndez', cargo: 'Ingeniero de Software', fecha: 'Hace 2 horas', respuestas: 34,
    sector: 'software', nivel: 'junior', tipo: 'remoto', salarios: false,
    etiquetas: [['ocean', 'code-slash', 'Sector: Tecnología'], ['community', 'wifi', 'Modalidad: Remoto'], ['salary', 'cash', 'Nivel: Junior / Mid']],
    comentarios: [
      { autor: 'Ana Martínez', cargo: 'Desarrolladora de Software', fecha: 'Hace 1 hora', texto: 'A mí me pidieron un CRUD con Express y PostgreSQL en 48 horas, y luego explicarlo en una llamada.' },
      { autor: 'Kevin Alvarado', cargo: 'Desarrollador Frontend', fecha: 'Hace 40 minutos', texto: 'Practiquen hooks de React y manejo de estado; casi siempre preguntan por eso.' },
    ],
  },
  {
    id: 2, titulo: 'Consejos para negociar salario y prestaciones en tu primera oferta formal de trabajo',
    resumen: 'Guía práctica sobre cómo evaluar el rango salarial ofrecido por la empresa antes de firmar contrato.',
    contenido: 'Antes de aceptar, compara el salario con otras ofertas del mismo puesto, pregunta por prestaciones adicionales y negocia con datos, no con suposiciones.',
    autor: 'Ana Martínez', cargo: 'Especialista RRHH', fecha: 'Ayer', respuestas: 52,
    sector: 'finanzas', nivel: 'junior', tipo: 'completo', salarios: true,
    etiquetas: [['warning', 'briefcase', 'Contrato Indefinido'], ['ocean', 'geo-alt', 'Ubicación: Santa Ana / San Salvador']],
    comentarios: [
      { autor: 'Diego Portillo', cargo: 'Contador Junior', fecha: 'Ayer', texto: 'Me sirvió preguntar por el seguro médico y el aguinaldo antes de firmar.' },
      { autor: 'Gabriela Flores', cargo: 'Analista de RRHH', fecha: 'Hace 20 horas', texto: 'Siempre pidan la oferta por escrito con el detalle de prestaciones.' },
    ],
  },
  {
    id: 3, titulo: '¿Cómo armar un portafolio de UI/UX sin experiencia laboral?',
    resumen: 'Ideas para crear casos de estudio que muestren tu proceso de diseño aunque todavía no hayas trabajado en una empresa.',
    contenido: 'Estoy terminando la carrera y quiero aplicar a puestos de diseño. ¿Qué proyectos recomiendan incluir en el portafolio para que lo tomen en cuenta?',
    autor: 'Sofía Ramírez', cargo: 'Diseñadora UI/UX', fecha: 'Hace 3 días', respuestas: 18,
    sector: 'diseno', nivel: 'junior', tipo: 'remoto', salarios: false,
    etiquetas: [['ocean', 'palette', 'Sector: Diseño'], ['community', 'wifi', 'Modalidad: Remoto'], ['salary', 'mortarboard', 'Nivel: Junior']],
    comentarios: [
      { autor: 'Natalia Cruz', cargo: 'Product Designer', fecha: 'Hace 2 días', texto: 'Rediseña una app que uses a diario y documenta cada decisión; eso pesa más que pantallas bonitas.' },
    ],
  },
  {
    id: 4, titulo: 'Experiencias trabajando en modalidad híbrida en San Salvador',
    resumen: '¿Cómo organizan sus días de oficina y de casa? Compartan qué les ha funcionado en equipos de tecnología.',
    contenido: 'Mi empresa pasó a modalidad híbrida y quiero saber cómo organizan las reuniones y la comunicación para no perder productividad.',
    autor: 'José Hernández', cargo: 'Líder Técnico', fecha: 'Hace 5 días', respuestas: 9,
    sector: 'software', nivel: 'senior', tipo: 'completo', salarios: false,
    etiquetas: [['ocean', 'code-slash', 'Sector: Tecnología'], ['community', 'building', 'Modalidad: Híbrido'], ['salary', 'award', 'Nivel: Senior']],
    comentarios: [
      { autor: 'Óscar Lemus', cargo: 'Scrum Master', fecha: 'Hace 4 días', texto: 'Dejamos los días de oficina para planificación y revisiones; lo demás es remoto.' },
    ],
  },
];

// estado: pendiente | revision | contactado | descartado
const POSTULANTES = [
  { id: 1, nombre: 'Ana Martínez', correo: 'ana.martinez@correo.com', telefono: '+503 7000-0000', ubicacion: 'San Salvador', cargo: 'Desarrolladora de Software', fecha: '2026-10-20', estado: 'revision', habilidades: ['C# / .NET', 'SQL', 'REST APIs', 'Git'], resumen: 'Profesional de desarrollo de software con 4 años de experiencia en APIs REST, aplicaciones web y bases de datos relacionales. Interesada en soluciones cloud y trabajo colaborativo.', experiencia: ['Desarrolladora Backend · TechSolutions (2023–2026) — Implementación de APIs, pruebas y optimización de consultas.', 'Desarrolladora Junior · CodeLabs (2022–2023) — Mantenimiento de aplicaciones web y documentación técnica.'], formacion: 'Ingeniería en Desarrollo de Software · Universidad (dato de ejemplo)' },
  { id: 2, nombre: 'Carlos Gómez', correo: 'carlos.gomez@correo.com', telefono: '+503 7111-2233', ubicacion: 'Santa Tecla', cargo: 'Backend Developer', fecha: '2026-10-19', estado: 'pendiente', habilidades: ['Node.js', 'PostgreSQL', 'Docker'], resumen: 'Desarrollador backend con 3 años creando servicios en Node.js y bases de datos PostgreSQL.', experiencia: ['Backend Developer · DataSoft (2023–2026) — Servicios REST y colas de mensajes.'], formacion: 'Ingeniería en Sistemas Informáticos' },
  { id: 3, nombre: 'Sofía Ramírez', correo: 'sofia.ramirez@correo.com', telefono: '+503 7222-3344', ubicacion: 'San Salvador', cargo: 'Diseñadora UI/UX', fecha: '2026-10-18', estado: 'contactado', habilidades: ['Figma', 'Prototipado', 'Investigación UX'], resumen: 'Diseñadora con enfoque en investigación de usuarios y prototipos de alta fidelidad.', experiencia: ['Diseñadora UI · Estudio Pixel (2024–2026) — Diseño de apps móviles.'], formacion: 'Licenciatura en Diseño Gráfico' },
  { id: 4, nombre: 'José Hernández', correo: 'jose.hernandez@correo.com', telefono: '+503 7333-4455', ubicacion: 'Antiguo Cuscatlán', cargo: 'Líder Técnico', fecha: '2026-10-17', estado: 'revision', habilidades: ['AWS', 'Java', 'Microservicios'], resumen: 'Líder técnico con 6 años diseñando arquitecturas en la nube.', experiencia: ['Líder Técnico · CloudWorks (2021–2026) — Migraciones a AWS.'], formacion: 'Ingeniería en Computación' },
  { id: 5, nombre: 'Daniela López', correo: 'daniela.lopez@correo.com', telefono: '+503 7444-5566', ubicacion: 'Santa Ana', cargo: 'Desarrolladora Web', fecha: '2026-10-16', estado: 'pendiente', habilidades: ['JavaScript', 'PHP', 'MySQL'], resumen: 'Desarrolladora web con experiencia en sitios administrables y comercio electrónico.', experiencia: ['Desarrolladora Web · Agencia Norte (2023–2026) — Sitios en PHP y WordPress.'], formacion: 'Técnico en Ingeniería de Software' },
  { id: 6, nombre: 'Luis Martínez', correo: 'luis.martinez@correo.com', telefono: '+503 7555-6677', ubicacion: 'San Salvador', cargo: 'DevOps Engineer', fecha: '2026-10-16', estado: 'revision', habilidades: ['Kubernetes', 'CI/CD', 'Linux'], resumen: 'Ingeniero DevOps enfocado en automatización de despliegues.', experiencia: ['DevOps · FinTech SV (2022–2026) — Pipelines de CI/CD.'], formacion: 'Ingeniería en Sistemas' },
  { id: 7, nombre: 'María Fernanda Ruiz', correo: 'mf.ruiz@correo.com', telefono: '+503 7666-7788', ubicacion: 'Soyapango', cargo: 'Analista Programadora', fecha: '2026-10-15', estado: 'pendiente', habilidades: ['Python', 'SQL', 'Power BI'], resumen: 'Analista programadora con experiencia en reportes y automatización con Python.', experiencia: ['Analista · Retail Centro (2024–2026) — Automatización de reportes.'], formacion: 'Ingeniería Industrial' },
  { id: 8, nombre: 'Kevin Alvarado', correo: 'kevin.alvarado@correo.com', telefono: '+503 7777-8899', ubicacion: 'Santa Ana', cargo: 'Desarrollador Frontend', fecha: '2026-10-15', estado: 'revision', habilidades: ['React', 'TypeScript', 'CSS'], resumen: 'Desarrollador frontend que construye interfaces accesibles con React.', experiencia: ['Frontend · WebLab (2023–2026) — Aplicaciones en React.'], formacion: 'Ingeniería en Sistemas Informáticos' },
  { id: 9, nombre: 'Andrea Castillo', correo: 'andrea.castillo@correo.com', telefono: '+503 7888-9900', ubicacion: 'San Salvador', cargo: 'Ingeniera Cloud', fecha: '2026-10-14', estado: 'contactado', habilidades: ['Azure', 'Terraform', 'C#'], resumen: 'Ingeniera cloud certificada en Azure con 4 años de experiencia.', experiencia: ['Ingeniera Cloud · Nube Central (2022–2026) — Infraestructura como código.'], formacion: 'Ingeniería en Telecomunicaciones' },
  { id: 10, nombre: 'Diego Portillo', correo: 'diego.portillo@correo.com', telefono: '+503 7999-0011', ubicacion: 'San Miguel', cargo: 'Desarrollador Junior', fecha: '2026-10-14', estado: 'pendiente', habilidades: ['JavaScript', 'Git'], resumen: 'Recién graduado con proyectos personales en JavaScript.', experiencia: ['Pasante · Municipalidad (2025) — Soporte y sitio web.'], formacion: 'Ingeniería en Sistemas' },
  { id: 11, nombre: 'Gabriela Flores', correo: 'gabriela.flores@correo.com', telefono: '+503 7012-3456', ubicacion: 'Santa Tecla', cargo: 'Arquitecta de Software', fecha: '2026-10-13', estado: 'revision', habilidades: ['Arquitectura', 'Go', 'GCP'], resumen: 'Arquitecta de software con experiencia en sistemas distribuidos.', experiencia: ['Arquitecta · Logística SV (2020–2026) — Sistemas de rastreo.'], formacion: 'Maestría en Ingeniería de Software' },
  { id: 12, nombre: 'Ricardo Menjívar', correo: 'ricardo.menjivar@correo.com', telefono: '+503 7123-4567', ubicacion: 'Apopa', cargo: 'Soporte TI', fecha: '2026-10-12', estado: 'pendiente', habilidades: ['Redes', 'Windows Server'], resumen: 'Técnico de soporte que busca dar el paso a desarrollo.', experiencia: ['Soporte TI · Clínicas Unidas (2022–2026).'], formacion: 'Técnico en Redes' },
  { id: 13, nombre: 'Valeria Orellana', correo: 'valeria.orellana@correo.com', telefono: '+503 7234-5678', ubicacion: 'San Salvador', cargo: 'QA Engineer', fecha: '2026-10-12', estado: 'revision', habilidades: ['Cypress', 'Selenium', 'API testing'], resumen: 'QA con experiencia en pruebas automatizadas web y de APIs.', experiencia: ['QA · TestHouse (2023–2026) — Automatización con Cypress.'], formacion: 'Ingeniería en Sistemas' },
  { id: 14, nombre: 'Fernando Rivas', correo: 'fernando.rivas@correo.com', telefono: '+503 7345-6789', ubicacion: 'Ilopango', cargo: 'Desarrollador Java', fecha: '2026-10-11', estado: 'pendiente', habilidades: ['Java', 'Spring', 'Oracle'], resumen: 'Desarrollador Java con experiencia en sistemas bancarios.', experiencia: ['Desarrollador · BancaSoft (2021–2026).'], formacion: 'Ingeniería en Computación' },
  { id: 15, nombre: 'Paola Guzmán', correo: 'paola.guzman@correo.com', telefono: '+503 7456-7890', ubicacion: 'Santa Ana', cargo: 'Desarrolladora Fullstack', fecha: '2026-10-10', estado: 'revision', habilidades: ['Vue', 'Laravel', 'MySQL'], resumen: 'Fullstack con experiencia en proyectos para pymes.', experiencia: ['Fullstack · Freelance (2022–2026).'], formacion: 'Ingeniería en Sistemas Informáticos' },
  { id: 16, nombre: 'Óscar Lemus', correo: 'oscar.lemus@correo.com', telefono: '+503 7567-8901', ubicacion: 'San Salvador', cargo: 'Scrum Master', fecha: '2026-10-10', estado: 'contactado', habilidades: ['Scrum', 'Jira', 'Liderazgo'], resumen: 'Scrum Master con formación técnica en desarrollo web.', experiencia: ['Scrum Master · Agile Center (2021–2026).'], formacion: 'Ingeniería Industrial' },
  { id: 17, nombre: 'Natalia Cruz', correo: 'natalia.cruz@correo.com', telefono: '+503 7678-9012', ubicacion: 'Antiguo Cuscatlán', cargo: 'Product Designer', fecha: '2026-10-09', estado: 'revision', habilidades: ['Figma', 'Design Systems'], resumen: 'Diseñadora de producto interesada en plataformas cloud.', experiencia: ['Product Designer · SaaS Latam (2023–2026).'], formacion: 'Licenciatura en Diseño' },
  { id: 18, nombre: 'Javier Aguilar', correo: 'javier.aguilar@correo.com', telefono: '+503 7789-0123', ubicacion: 'Santa Ana', cargo: 'Desarrollador Python', fecha: '2026-10-08', estado: 'pendiente', habilidades: ['Python', 'Django', 'AWS'], resumen: 'Desarrollador Python con experiencia en APIs y servicios en AWS.', experiencia: ['Desarrollador · DataLab (2022–2026).'], formacion: 'Ingeniería en Sistemas' },
];

// Registros del panel administrativo · tipo: empresa | vacante | usuario
const REGISTROS = [
  { id: 1, tipo: 'empresa', nombre: 'Auto Life Corp', detalle: 'Solicitud de alta empresarial', estado: 'Verificada' },
  { id: 2, tipo: 'empresa', nombre: 'Creativa Agencia Digital', detalle: 'Marketing y publicidad', estado: 'Pendiente' },
  { id: 3, tipo: 'vacante', nombre: 'Desarrollador Fullstack', detalle: 'TechNova S.A.', estado: 'Activa', oferta: 318 },
  { id: 4, tipo: 'vacante', nombre: 'Arquitecto de Software Cloud', detalle: 'InnovaTech S.A.', estado: 'Activa', oferta: 302 },
  { id: 5, tipo: 'usuario', nombre: 'Carlos Alfredo V.', detalle: 'Candidato Registrado', estado: 'Habilitado', correo: 'carlos.v@correo.com' },
  { id: 6, tipo: 'usuario', nombre: 'María Fernanda Ruiz', detalle: 'Candidata Registrada', estado: 'Habilitado', correo: 'mf.ruiz@correo.com' },
];

const RECURSOS = [
  {
    id: 'entrevistas', categoria: 'Entrevistas', clase: 'ocean', icono: 'play-btn-fill', tipo: 'Video tutorial & guía CV',
    titulo: 'Cómo destacar tus proyectos en entrevistas técnicas', lectura: 'Video de 8 min · Gratuito',
    resumen: 'Estrategias para explicar tu experiencia y demostrar tus habilidades.',
    secciones: [
      { titulo: 'Elige dos o tres proyectos', texto: 'No hace falta contar todo: escoge los proyectos que más se relacionan con la vacante.', puntos: ['Un proyecto con trabajo en equipo.', 'Uno donde resolviste un problema difícil.', 'Uno relacionado con la tecnología del puesto.'] },
      { titulo: 'Usa el método STAR', texto: 'Explica la Situación, la Tarea, la Acción que tomaste y el Resultado medible.', puntos: ['Sé concreto con números.', 'Habla de tu aporte, no solo del equipo.'] },
      { titulo: 'Prepara una demostración', texto: 'Ten a mano el repositorio o un video corto del proyecto funcionando.', puntos: [] },
    ],
  },
  {
    id: 'curriculum', categoria: 'Currículum', clase: 'community', icono: 'file-earmark-text', tipo: 'Plantilla y artículo',
    titulo: 'Guía para organizar tu currículum', lectura: 'Lectura de 6 min',
    resumen: 'Aprende qué información priorizar y cómo presentar tus logros.',
    secciones: [
      { titulo: 'Estructura recomendada', texto: 'Un currículum claro cabe en una o dos páginas.', puntos: ['Datos de contacto y perfil breve.', 'Experiencia con logros.', 'Formación y certificaciones.', 'Habilidades técnicas y blandas.'] },
      { titulo: 'Logros antes que tareas', texto: 'Cambia "encargado de reportes" por "automaticé reportes y reduje 5 horas de trabajo semanal".', puntos: [] },
      { titulo: 'Adáptalo a cada oferta', texto: 'Usa las palabras clave de la vacante para que tu perfil coincida en las búsquedas.', puntos: [] },
    ],
  },
  {
    id: 'habilidades', categoria: 'Habilidades', clase: 'salary', icono: 'graph-up-arrow', tipo: 'Consejos de carrera',
    titulo: 'Competencias que fortalecen tu perfil', lectura: 'Lectura de 5 min',
    resumen: 'Comunicación, organización y herramientas digitales aplicadas al trabajo.',
    secciones: [
      { titulo: 'Comunicación efectiva', texto: 'Explicar ideas con claridad es la habilidad más pedida por las empresas.', puntos: ['Escucha activa.', 'Mensajes escritos breves.'] },
      { titulo: 'Organización del tiempo', texto: 'Planifica tu semana y prioriza por impacto.', puntos: ['Listas de tareas.', 'Bloques de trabajo sin interrupciones.'] },
      { titulo: 'Herramientas digitales', texto: 'Domina hojas de cálculo, herramientas colaborativas y videollamadas.', puntos: [] },
    ],
  },
];
