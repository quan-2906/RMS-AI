import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // sử dụng cookiesStore để lấy AT và RT
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  // xóa AT và RT khi hết hạn
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Không nhận được access token hoặc refresh token",
      },
      {
        status: 200,
      },
    );
  }
  try {
    const result = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    });
    return Response.json(result.payload);
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        message: "Lỗi khi gọi API đến Server BackEnd",
      },
      {
        status: 200,
      },
    );
  }
}
