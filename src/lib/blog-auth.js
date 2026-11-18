
import jwt from "jsonwebtoken";
export function isPingalAdminRequest(request) {
  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    const payload = jwt.verify(token, secret);
    return payload?.admin === true;
  } catch {
    return false;
  }
}
