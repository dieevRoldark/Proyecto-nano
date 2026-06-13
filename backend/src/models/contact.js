export const CONTACT_TABLE = 'contacts';

export const CONTACT_FIELDS = Object.freeze({
  ID: 'id',
  NOMBRE: 'nombre',
  APELLIDO: 'apellido',
  EMAIL: 'email',
  MENSAJE: 'mensaje',
  IP: 'ip_address',
  CREATED_AT: 'created_at',
});

export const CONTACT_LIMITS = Object.freeze({
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
});

export const CONTACT_REGEX = Object.freeze({
  NAME: /^[\p{L}\s'-]{2,100}$/u,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
});

export const CONTACT_ERRORS = Object.freeze({
  REQUIRED: (field) => `El campo "${field}" es obligatorio`,
  TYPE: (field) => `El campo "${field}" debe ser texto`,
  LENGTH: (field, min, max) => `El campo "${field}" debe tener entre ${min} y ${max} caracteres`,
  FORMAT: (field) => `El campo "${field}" no tiene un formato válido`,
});
