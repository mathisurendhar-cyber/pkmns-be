import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async contact(
    body: {
      name?: string;
      mobile?: string;
      message?: string;
    },
    files?: Express.Multer.File[],
  ) {
    try {
      const { name, mobile, message } = body;

      // ==============================
      // VALIDATION
      // ==============================

      if (!name?.trim() || !mobile?.trim() || !message?.trim()) {
        return {
          success: false,
          message: 'Missing fields',
        };
      }

      // Name validation
      if (!/^[A-Za-z\s]+$/.test(name.trim())) {
        return {
          success: false,
          message: 'Name should contain letters and spaces only',
        };
      }

      // Mobile validation
      if (!/^\d{10}$/.test(mobile.trim())) {
        return {
          success: false,
          message: 'Mobile number must be exactly 10 digits',
        };
      }

      // ==============================
      // EMAIL HTML
      // ==============================

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>New Contact Message</title>
          </head>

          <body
            style="
              margin:0;
              padding:0;
              background:#f1f5f9;
              font-family:Arial,Helvetica,sans-serif;
            "
          >

            <div
              style="
                max-width:650px;
                margin:30px auto;
                background:#ffffff;
                border-radius:16px;
                overflow:hidden;
                box-shadow:0 10px 30px rgba(15,23,42,0.12);
              "
            >

              <!-- HEADER -->

              <div
                style="
                  padding:22px 25px;
                  background:linear-gradient(
                    135deg,
                    #f97316,
                    #3b82f6
                  );
                  color:#ffffff;
                "
              >
                <div
                  style="
                    font-size:12px;
                    font-weight:bold;
                    letter-spacing:2px;
                    opacity:0.9;
                  "
                >
                  CONTACT FORM
                </div>

                <h1
                  style="
                    margin:8px 0 0;
                    font-size:24px;
                  "
                >
                  New Contact Message
                </h1>
              </div>

              <!-- CONTENT -->

              <div style="padding:25px">

                <div
                  style="
                    margin-bottom:18px;
                    padding:15px;
                    background:#f8fafc;
                    border-radius:10px;
                    border:1px solid #e2e8f0;
                  "
                >
                  <div
                    style="
                      color:#64748b;
                      font-size:12px;
                      font-weight:bold;
                      margin-bottom:5px;
                    "
                  >
                    NAME
                  </div>

                  <div
                    style="
                      color:#0f172a;
                      font-size:16px;
                      font-weight:600;
                    "
                  >
                    ${this.escapeHtml(name.trim())}
                  </div>
                </div>

                <div
                  style="
                    margin-bottom:18px;
                    padding:15px;
                    background:#f8fafc;
                    border-radius:10px;
                    border:1px solid #e2e8f0;
                  "
                >
                  <div
                    style="
                      color:#64748b;
                      font-size:12px;
                      font-weight:bold;
                      margin-bottom:5px;
                    "
                  >
                    MOBILE
                  </div>

                  <div
                    style="
                      color:#0f172a;
                      font-size:16px;
                      font-weight:600;
                    "
                  >
                    ${this.escapeHtml(mobile.trim())}
                  </div>
                </div>

                <div
                  style="
                    margin-bottom:18px;
                    padding:15px;
                    background:#f8fafc;
                    border-radius:10px;
                    border:1px solid #e2e8f0;
                  "
                >
                  <div
                    style="
                      color:#64748b;
                      font-size:12px;
                      font-weight:bold;
                      margin-bottom:8px;
                    "
                  >
                    MESSAGE
                  </div>

                  <div
                    style="
                      color:#334155;
                      font-size:15px;
                      line-height:1.6;
                      white-space:pre-wrap;
                    "
                  >
                    ${this.escapeHtml(message.trim())}
                  </div>
                </div>

                ${
                  files?.length
                    ? `
                      <div
                        style="
                          padding:15px;
                          background:#eff6ff;
                          border-radius:10px;
                          border:1px solid #bfdbfe;
                        "
                      >
                        <div
                          style="
                            color:#1d4ed8;
                            font-size:12px;
                            font-weight:bold;
                            margin-bottom:8px;
                          "
                        >
                          ATTACHMENTS
                        </div>

                        <div
                          style="
                            color:#334155;
                            font-size:14px;
                            line-height:1.7;
                          "
                        >
                          ${files
                            .map(
                              (file) =>
                                `📎 ${this.escapeHtml(file.originalname)}`,
                            )
                            .join('<br />')}
                        </div>
                      </div>
                    `
                    : ''
                }

              </div>

              <!-- FOOTER -->

              <div
                style="
                  padding:15px 25px;
                  background:#f8fafc;
                  border-top:1px solid #e2e8f0;
                  color:#64748b;
                  font-size:12px;
                  text-align:center;
                "
              >
                Sri Ambal Nagar Peoples Welfare Association
              </div>

            </div>

          </body>
        </html>
      `;

      // ==============================
      // ATTACHMENTS
      // ==============================

      const attachments =
        files?.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        })) || [];

      // ==============================
      // SEND MAIL
      // ==============================

      const mailResult = await this.transporter.sendMail({
        from: `"Sri Ambal Nagar Contact" <${process.env.SMTP_FROM}>`,

        to: process.env.SMTP_TO || process.env.SMTP_FROM,

        subject: `New Contact Message - ${name.trim()}`,

        html,

        attachments,
      });

      console.log(
        'Contact email sent successfully:',
        mailResult.messageId,
      );

      return {
        success: true,
        message: 'Message sent successfully',
      };
    } catch (err) {
      console.error('SMTP contact email error:', err);

      return {
        success: false,
        message: 'Unable to send message',
      };
    }
  }

  // ==========================================
  // HTML SECURITY
  // ==========================================

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}