import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { type, email, name, message } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const gmailUser = process.env.GMAIL_USER || "princegajera944@gmail.com";
    const gmailPass = process.env.GMAIL_PASS || "vazlgqamwfcoznve";
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminRecipient = process.env.EMAIL_TO || "ebookvala.official@gmail.com";

    let subject = "";
    let htmlContent = "";

    if (type === "contact") {
      subject = `📬 New Contact Form Submission from ${name || email}`;
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #7c3aed; margin-top: 0;">New Inquiry Received</h2>
          <p>You have received a new message from the contact form on EBOOKVALA.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; white-space: pre-wrap; background: #f9f9f9; padding: 10px; border-radius: 4px;">${message || "No message content."}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 11px; color: #666;">This email was sent automatically from the EBOOKVALA serverless mail service.</p>
        </div>
      `;
    } else if (type === "newsletter") {
      subject = "Welcome to the EBOOKVALA Community! 📖";
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #7c3aed; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">EBOOKVALA</h1>
            <p style="font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; tracking-wider; font-family: monospace;">Premium Digital Library</p>
          </div>
          
          <h2 style="color: #111; font-size: 20px; margin-top: 0;">Thank you for joining our community!</h2>
          <p style="line-height: 1.6; font-size: 14px;">We are thrilled to welcome you to the EBOOKVALA family. You now have open-library access to premium developer editions, SaaS product design playbooks, and tech founder self-help guides.</p>
          
          <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h4 style="margin: 0 0 5px 0; color: #7c3aed;">What is next?</h4>
            <p style="margin: 0; font-size: 13px; line-height: 1.5;">Explore our catalog, download verified PDFs, and use our smart study tools (like visual mind maps and AI summaries) to accelerate your learning.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ebookvala-lts4-black.vercel.app/marketplace" style="background: #7c3aed; color: #ffffff; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.15);">Explore the Library</a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; margin-bottom: 0;">Happy reading,<br /><strong>The EBOOKVALA Team</strong></p>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0 15px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
            You received this email because you subscribed to updates on ebookvala-lts4-black.vercel.app.
          </p>
        </div>
      `;
    } else {
      return res.status(400).json({ error: "Invalid type parameter. Supported values: 'contact', 'newsletter'" });
    }

    // Gmail SMTP Transport
    if (gmailPass && gmailUser) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const mailOptions = {
        from: `"EBOOKVALA" <${gmailUser}>`,
        to: type === "contact" ? adminRecipient : email,
        subject: subject,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, messageId: info.messageId, service: "gmail" });
    } 
    // Fallback to Resend API
    else if (resendApiKey) {
      const fromSender = process.env.EMAIL_FROM || "Ebookvala <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromSender,
          to: type === "contact" ? adminRecipient : email,
          subject: subject,
          html: htmlContent
        })
      });

      const result = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: result.message || "Failed to send email via Resend." });
      }
      return res.status(200).json({ success: true, messageId: result.id, service: "resend" });
    } else {
      return res.status(500).json({ error: "No email service configured (GMAIL_PASS or RESEND_API_KEY missing)." });
    }

  } catch (error) {
    console.error("Serverless send-email error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
