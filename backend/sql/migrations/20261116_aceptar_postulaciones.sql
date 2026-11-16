-- Permite guardar el resultado explícito de una candidatura en bases existentes.
BEGIN;

ALTER TABLE postulaciones
    DROP CONSTRAINT IF EXISTS postulaciones_estado_check;

ALTER TABLE postulaciones
    ADD CONSTRAINT postulaciones_estado_check
    CHECK (estado IN ('pendiente', 'revision', 'contactado', 'aceptado', 'descartado'));

COMMIT;
