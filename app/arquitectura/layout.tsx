import { createAuthClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export default async function ArquitecturaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("ARQUITECTURA USER:", user);

  return (
    <>
      <div style={{ background: "red", padding: 20 }}>
        USER: {user ? user.email : "NULL"}
      </div>
      {children}
    </>
  );
}