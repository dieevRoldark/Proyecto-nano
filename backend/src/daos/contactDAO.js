import pool from '../config/db.js';
import { CONTACT_TABLE } from '../models/contact.js';

const INSERT_SQL = `INSERT INTO ${CONTACT_TABLE}
  (nombre, apellido, email, mensaje, ip_address)
  VALUES (?, ?, ?, ?, ?)`;

export async function create({ nombre, apellido, email, mensaje, ip }, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(INSERT_SQL, [
    nombre,
    apellido,
    email,
    mensaje,
    ip || null,
  ]);
  return {
    id: result.insertId,
    affectedRows: result.affectedRows,
  };
}

export default { create };
