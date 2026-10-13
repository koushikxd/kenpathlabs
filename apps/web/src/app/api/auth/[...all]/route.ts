import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/services";

export const { GET, POST } = toNextJsHandler(auth);
