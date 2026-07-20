-- Aggiunge il valore PENDING all'enum Visibility esistente, in una migration separata:
-- Postgres non permette di usare un nuovo valore enum (es. come DEFAULT di una colonna)
-- nella stessa transazione in cui viene aggiunto.
ALTER TYPE "Visibility" ADD VALUE 'PENDING';
