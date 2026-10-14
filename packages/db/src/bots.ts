// `amount` is the lump seed-players.ts gives each bot for a season. The E2E board specs rely on it:
// rank 10 (170) is passed by a perfect player on day 3 and a 4/5 player on day 4.
export const BOTS = [
  { name: "Priya Raman", username: "priya.ships", amount: 420 },
  { name: "Marcus Chen", username: "segfault_marcus", amount: 365 },
  { name: "Ana Souza", username: "ana_rebases", amount: 330 },
  { name: "Tom Becker", username: "tbecker_dev", amount: 295 },
  { name: "Aisha Khan", username: "aisha.k8s", amount: 260 },
  { name: "Diego Morales", username: "diego_yaml", amount: 240 },
  { name: "Yuki Tanaka", username: "yuki_tensor", amount: 215 },
  { name: "Sam Okafor", username: "sam_ok_404", amount: 200 },
  { name: "Lena Fischer", username: "lena.lambda", amount: 185 },
  { name: "Arjun Mehta", username: "arjun_gradient", amount: 170 },
  { name: "Chloe Martin", username: "chloe_cuda", amount: 150 },
  { name: "Omar Haddad", username: "omar.monorepo", amount: 135 },
  { name: "Nina Petrova", username: "nina_nullable", amount: 120 },
  { name: "Kofi Mensah", username: "kofi_kernel", amount: 105 },
  { name: "Hannah Lee", username: "hlee_vim", amount: 90 },
  { name: "Ravi Iyer", username: "ravi.regex", amount: 75 },
  { name: "Sofia Rossi", username: "sofia_async", amount: 60 },
  { name: "Ben Carter", username: "bcarter_ops", amount: 45 },
  { name: "Mei Lin", username: "mei_tokenizer", amount: 30 },
  { name: "Jonas Berg", username: "jonas.dotfiles", amount: 15 },
];

export const botId = (username: string) => `bot-${username}`;

export function botUser({ name, username }: { name: string; username: string }) {
  return {
    id: botId(username),
    name,
    email: `${username}@bots.invalid`,
    username,
    displayUsername: username,
    isBot: true,
  };
}
