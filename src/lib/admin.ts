export const APP_ADMIN_EMAIL = "send2chopstix@gmail.com";

export const normalizeEmail = (email?: string | null) =>
  email?.trim().toLowerCase() || "";

export const isAppAdminEmail = (email?: string | null) =>
  normalizeEmail(email) === APP_ADMIN_EMAIL;

type AdminEmailAddress = {
  emailAddress?: string | null;
  verification?: {
    status?: string | null;
  } | null;
};

export const hasVerifiedAppAdminEmail = (
  emailAddresses?: AdminEmailAddress[] | null,
) =>
  Boolean(
    emailAddresses?.some(
      (email) =>
        isAppAdminEmail(email.emailAddress) &&
        email.verification?.status === "verified",
    ),
  );
