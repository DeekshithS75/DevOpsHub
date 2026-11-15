import "server-only";
import { getResendClient } from "@/lib/resend";

type InvitationEmailInput = {
  email: string;
  organizationName: string;
  inviterName: string;
  role: "ADMIN" | "DEVELOPER" | "VIEWER";
  token: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function sendOrganizationInvitationEmail({
  email,
  organizationName,
  inviterName,
  role,
  token,
}: InvitationEmailInput) {
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL;

  if (!from || !appUrl) {
    throw new Error("Email sender or application URL is not configured");
  }

  const invitationUrl = new URL(
    `/invitations/${encodeURIComponent(token)}`,
    appUrl,
  ).toString();

  const safeOrganizationName = escapeHtml(organizationName);
  const safeInviterName = escapeHtml(inviterName);
  const safeRole = escapeHtml(role);

  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: `You're invited to join ${organizationName} on DevOpsHub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #171717;">
        <h1 style="font-size: 24px;">You're invited to DevOpsHub</h1>

        <p>
          <strong>${safeInviterName}</strong> has invited you to join
          <strong>${safeOrganizationName}</strong>.
        </p>

        <p>Your assigned role is <strong>${safeRole}</strong>.</p>

        <a
          href="${escapeHtml(invitationUrl)}"
          style="display: inline-block; background: #171717; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;"
        >
          View Invitation
        </a>

        <p>This invitation expires in 7 days and can only be accepted once.</p>

        <p style="font-size: 13px; color: #737373;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
You're invited to DevOpsHub.

${inviterName} has invited you to join ${organizationName}.
Your assigned role is ${role}.

View your invitation:
${invitationUrl}

This invitation expires in 7 days and can only be accepted once.

If you weren't expecting this invitation, you can ignore this email.
    `.trim(),
  });

  if (error) {
    console.error("Resend invitation email error:", error);
    throw new Error("Failed to send organization invitation email");
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email ID");
  }

  return {
    emailId: data.id,
  };
}
