import LoginForm from "@/app/components/LoginForm";
import { getSystemConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let config = null;
  try {
    config = await getSystemConfig();
  } catch (error) {
    console.error("Unable to load login branding:", error);
  }

  return <LoginForm config={config} />;
}
