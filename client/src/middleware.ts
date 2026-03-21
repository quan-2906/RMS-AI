import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { decodeToken } from "./lib/utils";
import { Role } from "./constants/type";

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // pathname: /manage/dashboard
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  // 1. Chưa đăng nhập thì không cho vào private path
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }
  //  2. Đã đăng nhập
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login thì redirect về trang chủ
    if (accessToken && unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // 2.2 Đăng nhập rồi những Access Token lại hết hạn
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // 2.3 Vào không đúng role thì redirect về trang chủ
    const role = accessToken ? decodeToken(accessToken).role : null;
    // Guest nhưng cố vào role OWNER
    const isGuestGotoManagePath =
      role === Role.Guest &&
      managePaths.some((path) => pathname.startsWith(path));
    // Không phải Guest nhưng cố vào role Guest
    const isNotGuestGoToGuestPath =
      role !== Role.Guest &&
      guestPaths.some((path) => pathname.startsWith(path));
    if (isGuestGotoManagePath || isNotGuestGoToGuestPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/manage/:path*", "/guest/:paths*", "/login"],
};
