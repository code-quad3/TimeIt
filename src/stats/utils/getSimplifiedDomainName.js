import { parse } from 'tldts';

export function getSimplifiedDomainName(input) {
  if (!input) return input;

  const { domain } = parse(input);

  // If we got a domain, split it and return the first part before the dot
  if (domain) {
    return domain.split('.')[0];
  }

  return input; // fallback
}
