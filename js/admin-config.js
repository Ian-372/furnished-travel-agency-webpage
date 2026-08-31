export const ADMIN_EMAIL = "littlemonksltd@gmail.com";

export function isAdminEmail(email) {
    return email?.trim().toLowerCase() === ADMIN_EMAIL;
}