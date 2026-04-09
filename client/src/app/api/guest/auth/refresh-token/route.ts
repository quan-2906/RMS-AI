import { cookies } from "next/headers";
import Jwt from "jsonwebtoken";
import guestApiRequest from "@/apiRequests/guest";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy refreshToken",
      },
      {
        status: 401,
      },
    );
  }
  try {
    const { payload } = await guestApiRequest.sRefreshToken({
      refreshToken,
    });

    const decodedAccessToken = Jwt.decode(payload.data.accessToken) as {
      exp: number;
    };
    const decodedRefreshToken = Jwt.decode(payload.data.refreshToken) as {
      exp: number;
    };

    cookieStore.set("accessToken", payload.data.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(decodedAccessToken.exp * 1000),
    });

    cookieStore.set("refreshToken", payload.data.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(decodedRefreshToken.exp * 1000),
    });

    return Response.json({
      message: "Lấy Access Token và Refresh Token thành công",
      data: payload.data,
    });
  } catch (error: any) {
    console.log(error);
    return Response.json(
      {
        message: error.message ?? "Đã có lỗi",
      },
      { status: 401 },
    );
  }
}
