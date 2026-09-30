import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_APP_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error(
    "EMAIL_USER and EMAIL_APP_PASSWORD must be defined"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export async function sendResetEmail(
  email: string,
  resetLink: string
): Promise<void> {
  await transporter.sendMail({
    from: `"FlowDay" <${emailUser}>`,
    to: email,
    subject: "Reset your FlowDay password",

    text: `
We received a request to reset your FlowDay password.

Reset your password here:
${resetLink}

If you did not request this, you can ignore this email.
    `,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your FlowDay password</h2>

        <p>
          We received a request to reset your FlowDay password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <p>
          <a
            href="${resetLink}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#8b5cf6;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Reset password
          </a>
        </p>

        <p>
          This link will expire after a limited time.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>— FlowDay</p>
      </div>
    `,
  });
}