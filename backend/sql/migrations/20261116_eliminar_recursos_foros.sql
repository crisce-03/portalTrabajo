-- Elimina recursos, noticias y discusiones existentes, conservando las valoraciones.
BEGIN;

-- Los reportes de hilos y respuestas no aplican al módulo de valoraciones.
DELETE FROM reportes WHERE valoracion_id IS NULL;

ALTER TABLE reportes DROP CONSTRAINT IF EXISTS reportes_check;
ALTER TABLE reportes DROP COLUMN IF EXISTS hilo_id;
ALTER TABLE reportes DROP COLUMN IF EXISTS respuesta_id;
ALTER TABLE reportes ALTER COLUMN valoracion_id SET NOT NULL;

DROP TABLE IF EXISTS respuestas CASCADE;
DROP TABLE IF EXISTS hilos CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;

COMMIT;
