import OrderCart from "./orders-cart";

export default function OrderPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">Đơn hàng</h1>
      <OrderCart />
    </div>
  );
}
