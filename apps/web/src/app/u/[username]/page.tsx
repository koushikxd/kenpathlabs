// Placeholder so typed links to profiles compile. #20 replaces it.
export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <main className="mx-auto flex w-full max-w-120 flex-col gap-1 px-4 pt-6">
      <h1 className="text-lg font-semibold">@{username}</h1>
      <p className="text-xs text-muted-foreground">This player’s profile.</p>
    </main>
  );
}
