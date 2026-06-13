import { CONTACT_LIMITS, CONTACT_REGEX, CONTACT_ERRORS } from '../models/contact.js';

const FIELD_NAMES = Object.freeze({
  nombre: 'nombre',
  apellido: 'apellido',
  email: 'email',
  message: 'message',
});

const HTML_ENTITIES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
});

function escapeHtml(str) {
  return str.replace(/[&<>"'`=/]/g, (ch) => HTML_ENTITIES[ch]);
}

function removeControlChars(str) {
  return str.replace(/[\u0000-\u001F\u007F]/g, '');
}

function isString(value) {
  return typeof value === 'string';
}

function validateStringField(value, field, min, max) {
  if (value === undefined || value === null || value === '') {
    return CONTACT_ERRORS.REQUIRED(field);
  }
  if (!isString(value)) {
    return CONTACT_ERRORS.TYPE(field);
  }
  const cleaned = removeControlChars(value).trim();
  if (cleaned.length < min || cleaned.length > max) {
    return CONTACT_ERRORS.LENGTH(field, min, max);
  }
  return null;
}

function validateName(value, field) {
  const err = validateStringField(
    value,
    field,
    CONTACT_LIMITS.NAME_MIN,
    CONTACT_LIMITS.NAME_MAX
  );
  if (err) return err;
  const cleaned = removeControlChars(value).trim();
  if (!CONTACT_REGEX.NAME.test(cleaned)) {
    return CONTACT_ERRORS.FORMAT(field);
  }
  return null;
}

function validateEmail(value) {
  const err = validateStringField(
    value,
    FIELD_NAMES.email,
    5,
    CONTACT_LIMITS.EMAIL_MAX
  );
  if (err) return err;
  const cleaned = removeControlChars(value).trim().toLowerCase();
  if (!CONTACT_REGEX.EMAIL.test(cleaned)) {
    return CONTACT_ERRORS.FORMAT(FIELD_NAMES.email);
  }
  return null;
}

function validateMessage(value) {
  const err = validateStringField(
    value,
    FIELD_NAMES.message,
    CONTACT_LIMITS.MESSAGE_MIN,
    CONTACT_LIMITS.MESSAGE_MAX
  );
  if (err) return err;
  const cleaned = removeControlChars(value).trim();
  if (cleaned.length < CONTACT_LIMITS.MESSAGE_MIN) {
    return CONTACT_ERRORS.LENGTH(
      FIELD_NAMES.message,
      CONTACT_LIMITS.MESSAGE_MIN,
      CONTACT_LIMITS.MESSAGE_MAX
    );
  }
  return null;
}

export function validateContact(body) {
  const errors = [];
  const data = body && typeof body === 'object' ? body : {};

  const nombreErr = validateName(data[FIELD_NAMES.nombre], FIELD_NAMES.nombre);
  if (nombreErr) errors.push(nombreErr);

  const apellidoErr = validateName(data[FIELD_NAMES.apellido], FIELD_NAMES.apellido);
  if (apellidoErr) errors.push(apellidoErr);

  const emailErr = validateEmail(data[FIELD_NAMES.email]);
  if (emailErr) errors.push(emailErr);

  const messageErr = validateMessage(data[FIELD_NAMES.message]);
  if (messageErr) errors.push(messageErr);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: Object.freeze({
      nombre: removeControlChars(data[FIELD_NAMES.nombre]).trim(),
      apellido: removeControlChars(data[FIELD_NAMES.apellido]).trim(),
      email: removeControlChars(data[FIELD_NAMES.email]).trim().toLowerCase(),
      mensaje: escapeHtml(removeControlChars(data[FIELD_NAMES.message]).trim()),
    }),
  };
}
