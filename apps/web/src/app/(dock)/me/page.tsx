import { MeScreen } from "@/components/me-screen";
import { requestSession } from "@/server/services";

export default async function MePage() {
  const session = await requestSession();
  // No session yet means a first visit, which the dock layout signs in as a guest.
  return <MeScreen guest={!session || session.user.isAnonymous === true} />;
}
