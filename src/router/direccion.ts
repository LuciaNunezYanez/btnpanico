import { Router, Request, Response } from 'express';
const { verificaToken } = require('../server/middlewares/autenticacion');
import MySQL from '../mysql/mysql';

const router = Router();


export default router;