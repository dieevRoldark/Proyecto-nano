import { validateContact } from '../validators/contactValidator.js';
import { create as createContact } from '../daos/contactDAO.js';
import { sendJson } from '../middlewares/errorHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

export async function handleContact(req, res) {
  const { valid, errors, data } = validateContact(req.body);

  if (!valid) {
    throw new AppError('Validation failed', 400, errors);
  }

  const ip = getClientIp(req);

  try {
    const result = await createContact({ ...data, ip });

    logger.info('Contact message stored', {
      id: result.id,
      email: data.email,
      ip,
    });

    sendJson(res, 201, {
      success: true,
      message: 'Mensaje recibido correctamente',
      id: result.id,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('Failed to store contact', {
      message: err?.message,
      code: err?.code,
    });
    throw new AppError('No se pudo procesar el mensaje', 500);
  }
}
