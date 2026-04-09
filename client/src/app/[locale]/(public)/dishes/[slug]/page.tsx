import dishApiRequest from "@/apiRequests/dish";
import { generateSlugUrl, getIdFromSlugUrl, wrapServerApi } from "@/lib/utils";
import DishDetail from "./dish-detail";

export async function generateStaticParams() {
  const data = await wrapServerApi(() => dishApiRequest.list());
  const list = data?.payload.data ?? [];
  return list.map((dish) => ({
    slug: generateSlugUrl({
      name: dish.name,
      id: dish.id,
    }),
  }));
}

export default async function DishPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const id = getIdFromSlugUrl(slug);
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)));

  const dish = data?.payload?.data;
  return <DishDetail dish={dish} />;
}
