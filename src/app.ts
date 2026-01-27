import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.ts';
import type { ErrorRequestHandler } from 'express';
import expressLayouts from 'express-ejs-layouts';

//import authRoutes from './routes/auth.js';
//import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('layout', './layouts/main')
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'))
const cloudflareIPs = [
  'loopback',
  '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '104.16.0.0/13',
  '104.24.0.0/14', '108.162.192.0/18', '131.0.72.0/22', '141.101.64.0/18',
  '162.158.0.0/15', '172.64.0.0/13', '173.245.48.0/20', '188.114.96.0/20',
  '190.93.240.0/20', '197.234.240.0/22', '198.41.128.0/17',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'
];

app.set('trust proxy', cloudflareIPs);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "object-src": ["'none'"],
      "upgrade-insecure-requests": [],
    },
  },
}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(expressLayouts);

app.use('/auth', authRoutes)

const errorHandler: ErrorRequestHandler = (err,_req,res,_next) => {
	console.error("SERVER ERROR:", err.message)
	const status = err.status || 500;
	res.status(status).render('error', {'content_title': 'Помилка сервера', "message": "Сталась невідома помилка. Будь ласка спробуйте пізніше, або повідомте про проблему в телеграм-боті @lpmonitor_bot", 'status_code': 500})
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
