-- =====================================================================
-- PortalTrabajo · Esquema de la base de datos (PostgreSQL)
-- Se ejecuta con:  npm run db:init   (o pegándolo en el cliente SQL)
-- Todo va dentro de una transacción: si algo falla, no se crea nada.
-- =====================================================================
BEGIN;

-- Actualiza solo la columna "actualizado_en" cada vez que se modifica una fila.
CREATE OR REPLACE FUNCTION actualizar_fecha() RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------------------
-- 1. USUARIOS Y PERFILES
-- ---------------------------------------------------------------------

-- Cuenta de acceso. Sirve para los tres roles: candidato, empresa y admin.
CREATE TABLE usuarios (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellidos      VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL,
    clave_hash     VARCHAR(100) NOT NULL,           -- contraseña cifrada con bcrypt, nunca en texto plano
    telefono       VARCHAR(30),
    cargo          VARCHAR(120),                    -- puesto profesional del candidato
    rol            VARCHAR(20) NOT NULL CHECK (rol IN ('candidato', 'empresa', 'admin')),
    activo         BOOLEAN NOT NULL DEFAULT TRUE,   -- el admin puede deshabilitar cuentas
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- El correo es único sin importar mayúsculas (Ana@mail.com = ana@mail.com).
CREATE UNIQUE INDEX usuarios_correo_unico ON usuarios (LOWER(correo));
CREATE TRIGGER usuarios_fecha BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();

-- Datos extra del candidato (1 a 1 con usuarios de rol "candidato").
CREATE TABLE perfiles_candidato (
    usuario_id     INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    ubicacion      VARCHAR(100),
    resumen        TEXT,
    habilidades    TEXT[] NOT NULL DEFAULT '{}',    -- lista de textos: {'SQL','Git'}
    experiencia    TEXT[] NOT NULL DEFAULT '{}',
    formacion      TEXT,
    cv_nombre      VARCHAR(200),                    -- nombre original del archivo (Ana_CV.pdf)
    cv_ruta        VARCHAR(300),                    -- dónde quedó guardado
    visitas        INTEGER NOT NULL DEFAULT 0,      -- "Visitas al perfil"
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER perfiles_candidato_fecha BEFORE UPDATE ON perfiles_candidato FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();

-- Alertas de empleo del candidato (interruptores del panel de alertas).
CREATE TABLE alertas (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    termino    VARCHAR(150) NOT NULL,               -- ej. "Desarrollador Web"
    activa     BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX alertas_usuario_idx ON alertas (usuario_id);


-- ---------------------------------------------------------------------
-- 2. EMPRESAS Y OFERTAS
-- ---------------------------------------------------------------------

-- Empresa (1 a 1 con un usuario de rol "empresa").
CREATE TABLE empresas (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id      INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    sector          VARCHAR(100) NOT NULL,
    tamano          VARCHAR(30) CHECK (tamano IN ('1 a 10 empleados', '11 a 50 empleados', '51 a 200 empleados',
                                                  '201 a 500 empleados', 'Más de 500 empleados')),
    correo_contacto VARCHAR(150) NOT NULL,
    telefono        VARCHAR(30),
    ubicacion       VARCHAR(150),                   -- se completa después del registro
    sitio_web       VARCHAR(200),
    acerca          TEXT,
    verificada      BOOLEAN NOT NULL DEFAULT FALSE, -- el admin verifica la empresa
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX empresas_nombre_unico ON empresas (LOWER(nombre));
CREATE TRIGGER empresas_fecha BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();

-- Oferta de empleo (lo que el prototipo llama "vacante").
CREATE TABLE ofertas (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id        INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo            VARCHAR(150) NOT NULL,
    ubicacion         VARCHAR(150),
    modalidad         VARCHAR(20) CHECK (modalidad IN ('Presencial', 'Híbrido', 'Remoto')),
    contrato          VARCHAR(20) CHECK (contrato IN ('Tiempo completo', 'Medio tiempo', 'Por proyecto', 'Pasantía')),
    experiencia       VARCHAR(20) CHECK (experiencia IN ('Sin experiencia', 'Junior', 'Intermedio', 'Senior')),
    sector            VARCHAR(50) CHECK (sector IN ('Tecnología', 'Diseño', 'Administración y finanzas', 'Marketing', 'Otro')),
    salario_min       NUMERIC(10, 2) CHECK (salario_min >= 0),
    salario_max       NUMERIC(10, 2) CHECK (salario_max >= 0),
    correo_contacto   VARCHAR(150),
    descripcion       TEXT,
    responsabilidades TEXT[] NOT NULL DEFAULT '{}',
    requisitos        TEXT[] NOT NULL DEFAULT '{}',
    beneficios        TEXT[] NOT NULL DEFAULT '{}',
    estado            VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activa', 'cerrada')),
    publicada_en      TIMESTAMPTZ,                  -- fecha en que pasó de borrador a activa
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT salario_coherente CHECK (salario_max IS NULL OR salario_min IS NULL OR salario_max >= salario_min),

    -- Un borrador puede estar incompleto, pero una oferta activa o cerrada debe tener sus datos obligatorios.
    CONSTRAINT oferta_completa CHECK (
        estado = 'borrador' OR (
            ubicacion IS NOT NULL AND modalidad IS NOT NULL AND contrato IS NOT NULL
            AND correo_contacto IS NOT NULL AND descripcion IS NOT NULL
            AND cardinality(requisitos) > 0
        )
    )
);
CREATE INDEX ofertas_empresa_idx ON ofertas (empresa_id);
CREATE INDEX ofertas_listado_idx ON ofertas (estado, publicada_en DESC);
CREATE TRIGGER ofertas_fecha BEFORE UPDATE ON ofertas FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();

-- Ofertas que un candidato guardó ("Guardar oferta").
CREATE TABLE ofertas_guardadas (
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    oferta_id   INTEGER NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    guardada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, oferta_id)
);


-- ---------------------------------------------------------------------
-- 3. POSTULACIONES
-- ---------------------------------------------------------------------

-- Un candidato se postula a una oferta (solo una vez por oferta).
-- El código de seguimiento "POST-001" se arma con el id, no se guarda.
CREATE TABLE postulaciones (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    oferta_id      INTEGER NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    candidato_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje        TEXT,
    cv_nombre      VARCHAR(200),
    cv_ruta        VARCHAR(300),
    estado         VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'revision', 'contactado', 'aceptado', 'descartado')),
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (oferta_id, candidato_id)
);
CREATE INDEX postulaciones_candidato_idx ON postulaciones (candidato_id);
CREATE TRIGGER postulaciones_fecha BEFORE UPDATE ON postulaciones FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();


-- ---------------------------------------------------------------------
-- 4. VALORACIONES Y MODERACIÓN
-- ---------------------------------------------------------------------

-- Opinión de un usuario sobre una empresa (una por usuario y empresa).
-- El promedio y el total de opiniones se calculan con AVG() y COUNT(), no se guardan.
CREATE TABLE valoraciones (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id   INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario   TEXT NOT NULL,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (empresa_id, usuario_id)
);

-- Reports moderate company reviews.
CREATE TABLE reportes (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reportado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    valoracion_id INTEGER NOT NULL REFERENCES valoraciones(id) ON DELETE CASCADE,
    motivo        TEXT NOT NULL,
    estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado')),
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------


COMMIT;
