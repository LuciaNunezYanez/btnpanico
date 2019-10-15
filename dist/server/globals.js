"use strict";
// ======================
// Vencimiento del token (1 día)
// ======================
var caducidad = 60 * 60 * 24;
process.env.CADUCIDAD_TOKEN = String(caducidad);
// ======================
// SEED de autenticación
// ======================
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
