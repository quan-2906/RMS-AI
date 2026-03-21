import { cookies } from "next/headers";
import accountApiRequest from "../../apiRequests/account";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value as string;
  let name = "";
  try {
    const result = await accountApiRequest.sMe(accessToken);
    name = result.payload.data.name;
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
  }
  return <div>Dashboard {name}</div>;
}
