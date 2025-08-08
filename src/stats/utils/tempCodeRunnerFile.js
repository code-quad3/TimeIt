
// testGetFullDomain.js
import { getFullDomain } from "./getFullDomain.js";

const testInputs = [
  "https://www.bbc.co.uk/news",
  "bbc.co.uk",
  "www.example.com",
  "subdomain.google.com",
  "https://openai.com/research",
  "bbc", // single word (invalid domain)
  "",
  null
];

console.log("Testing getFullDomain:");
for (const input of testInputs) {
  console.log(`Input: ${input}`);
  console.log(`Output: ${getFullDomain(input)}`);
  console.log("---");
}
