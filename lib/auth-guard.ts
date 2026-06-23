import { getSession } from "./session";

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: new Response("Не авторизован", { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: new Response("Не авторизован", { status: 401 }) };
  }
  if (session.role !== "ADMIN") {
    return { session: null, error: new Response("Доступ только для администратора", { status: 403 }) };
  }
  return { session, error: null };
}
