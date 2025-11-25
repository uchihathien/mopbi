import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    orderDate: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    totalAmount: number;
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine: string;
        ward: string;
        district: string;
        city: string;
    };
    paymentMethod: string;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        try {
            const config: EmailConfig = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || '',
                },
            };

            if (!config.auth.user || !config.auth.pass) {
                console.warn('Email service not configured. Emails will not be sent.');
                return;
            }

            this.transporter = nodemailer.createTransport(config);
            console.log('✉️  Email service initialized');
        } catch (error) {
            console.error('Failed to initialize email service:', error);
        }
    }

    async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
        if (!this.transporter) {
            console.warn('Email service not available. Skipping email.');
            return false;
        }

        try {
            const html = this.generateOrderEmailHTML(data);

            await this.transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'Shop'}" <${process.env.SMTP_USER}>`,
                to: data.customerEmail,
                subject: `Xác nhận đơn hàng #${data.orderId.slice(0, 8)}`,
                html,
            });

            console.log(`✅ Order confirmation email sent to ${data.customerEmail}`);
            return true;
        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
            return false;
        }
    }

    private generateOrderEmailHTML(data: OrderEmailData): string {
        const itemsHTML = data.items
            .map(
                (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    ${item.name}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    ${item.price.toLocaleString('vi-VN')} ₫
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
                    ${item.subtotal.toLocaleString('vi-VN')} ₫
                </td>
            </tr>
        `
            )
            .join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
                                ✅ Đặt hàng thành công!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Cảm ơn bạn đã đặt hàng
                            </p>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                                Xin chào <strong>${data.customerName}</strong>,
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">
                                Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. Dưới đây là thông tin chi tiết đơn hàng:
                            </p>

                            <!-- Order Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                                            <strong>Mã đơn hàng:</strong> #${data.orderId.slice(0, 8)}
                                        </p>
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                                            <strong>Ngày đặt:</strong> ${data.orderDate}
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #666;">
                                            <strong>Phương thức thanh toán:</strong> ${data.paymentMethod === 'cod'
                ? 'COD - Thanh toán khi nhận hàng'
                : 'Chuyển khoản ngân hàng'
            }
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Shipping Address -->
                            <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">
                                📍 Địa chỉ giao hàng
                            </h3>
                            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #333;">
                                    <strong>${data.shippingAddress.fullName}</strong>
                                </p>
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #666;">
                                    ${data.shippingAddress.phone}
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
                                    ${data.shippingAddress.addressLine}, ${data.shippingAddress.ward}, ${data.shippingAddress.district}, ${data.shippingAddress.city}
                                </p>
                            </div>

                            <!-- Order Items -->
                            <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">
                                🛍️ Sản phẩm đã đặt
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                                <thead>
                                    <tr style="background-color: #f9f9f9;">
                                        <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Sản phẩm</th>
                                        <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">SL</th>
                                        <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Đơn giá</th>
                                        <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                            </table>

                            <!-- Total -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 14px; color: #666;">Tạm tính:</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                                        ${data.totalAmount.toLocaleString('vi-VN')} ₫
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 14px; color: #666;">Phí vận chuyển:</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #34C759; text-align: right;">
                                        Miễn phí
                                    </td>
                                </tr>
                                <tr style="border-top: 2px solid #007AFF;">
                                    <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #333;">Tổng cộng:</td>
                                    <td style="padding: 12px 0; font-size: 20px; font-weight: bold; color: #007AFF; text-align: right;">
                                        ${data.totalAmount.toLocaleString('vi-VN')} ₫
                                    </td>
                                </tr>
                            </table>

                            ${data.paymentMethod === 'bank_transfer'
                ? `
                            <!-- Bank Transfer Info -->
                            <div style="background-color: #FFF3CD; border-left: 4px solid #FF9500; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #856404;">
                                    💳 Thông tin chuyển khoản
                                </h4>
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #856404;">
                                    <strong>Ngân hàng:</strong> Vietcombank
                                </p>
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #856404;">
                                    <strong>Số tài khoản:</strong> 1234567890
                                </p>
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #856404;">
                                    <strong>Chủ tài khoản:</strong> NGUYEN VAN A
                                </p>
                                <p style="margin: 0 0 6px 0; font-size: 14px; color: #856404;">
                                    <strong>Nội dung:</strong> <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">ORDER ${data.orderId.slice(
                    0,
                    8
                )}</code>
                                </p>
                                <p style="margin: 12px 0 0 0; font-size: 13px; color: #856404; line-height: 1.5;">
                                    ⚠️ Vui lòng chuyển khoản với nội dung chính xác để đơn hàng được xác nhận nhanh chóng.
                                </p>
                            </div>
                            `
                : ''
            }

                            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                                Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                © ${new Date().getFullYear()} Shop. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }
}

export const emailService = new EmailService();
