import 'dotenv/config';
import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes.ts';
import expressLayouts from 'express-ejs-layouts';
import {helmetMiddleware} from './middleware/helmetMiddleware.ts';
import {corsMiddleware} from './middleware/corsMiddleware.ts';
import cookieParser from 'cookie-parser';
import {errorHandlerMiddleware} from './middleware/errorHandlerMiddleware.ts';
import csrf from 'csurf';
import session from 'express-session';
import flash from 'connect-flash';

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

app.use(expressLayouts);
app.use(cookieParser(process.env.CSRF_SECRET));
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(session({
	secret: process.env.SESSION_SECRET!,
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 },
}))
app.use(flash())
app.use(csrf({ cookie: true }))
app.use((req, res, next) => {res.locals.csrfToken = req.csrfToken(); next()})

app.use('/auth', authRoutes)

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
