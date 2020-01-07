import nodemailer from 'nodemailer';
import { config } from '@app/config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.emailAccount.reg.account,
    pass: config.emailAccount.reg.password,
  },
}) as any;

export default transporter;
