import { parse } from 'tldts';

 export function getFullDomain(input) {
  if (!input) return input;
  const { domain } = parse(input); // returns e.g., "bbc.co.uk"
  return domain || input;
}
