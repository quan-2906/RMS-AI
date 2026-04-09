import { cookies } from "next/headers";
import Jwt from "jsonwebtoken";
import { HttpError } from "@/lib/http";
import { GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import guestApiRequest from "@/apiRequests/guest";

export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType;
  const cookieStore = await cookies();

  try {
    const { payload } = await guestApiRequest.sLogin(body);
    const { accessToken, refreshToken } = payload.data;
    const decodedAccessToken = Jwt.decode(accessToken) as { exp: number };
    const decodedRefreshToken = Jwt.decode(refreshToken) as { exp: number };

    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(decodedAccessToken.exp * 1000),
    });

    cookieStore.set("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(decodedRefreshToken.exp * 1000),
    });

    return Response.json({
      message: "Đăng nhập thành công",
      data: payload.data,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    }

    return Response.json(
      {
        message: "Đã có lỗi",
      },
      { status: 500 },
    );
  }
}
