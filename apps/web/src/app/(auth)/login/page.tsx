import { redirect } from "next/navigation";
import { createClient } from "@/shared/api/supabase/server";
import { LoginPage } from "@/_pages/login";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
