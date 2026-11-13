// Display name check. The same word list is enforced on the server in supabase/schema.sql (clean_name),
// so a name that skips this file is still refused. Keep the two lists the same.
// shortcut: a word list catches the obvious cases only, not every language or spelling. Upgrade to a
// moderation service or instructor approval if names are ever shown to other cadets.

// Matched anywhere in the name, after disguises are undone.
const ANYWHERE = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut', 'asshole', 'pussy', 'penis', 'vagina', 'porn', 'nazi', 'hitler', 'bastard', 'jizz', 'dildo', 'molest', 'suicide'];
// Matched as whole words only, so "Cassidy", "Hancock" and "Essex" pass.
const WHOLE = ['kkk', 'ass', 'dick', 'cock', 'rape', 'pedo', 'wank', 'sex', 'fag', 'cum', 'tit', 'tits', 'hoe', 'admin', 'moderator', 'mod', 'staff', 'official', 'instructor', 'support'];
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', $: 's', '!': 'i' };

/** Returns '' when the name is fine, or a sentence saying what to fix. */
export function nameProblem(raw: string): string {
  const name = raw.trim();
  if (name.length < 2 || name.length > 20) return 'Use 2 to 20 characters.';
  if (!/^[\p{L}\p{N} ._-]+$/u.test(name)) return 'Use letters, numbers, spaces, dots, dashes and underscores only.';
  const plain = name.toLowerCase().replace(/[013457@$!8]/g, (c) => LEET[c]);
  const squeezed = plain.replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1'); // "f.u.c.k" and "biiitch"
  const words = plain.split(/[^a-z]+/);
  const bad = ANYWHERE.some((w) => squeezed.includes(w.replace(/(.)\1+/g, '$1'))) || WHOLE.some((w) => words.includes(w));
  return bad ? 'Pick a different name. That one is not allowed.' : '';
}
