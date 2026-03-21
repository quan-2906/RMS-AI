import { Suspense } from "react";
import LoginForm from "./login-form";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
