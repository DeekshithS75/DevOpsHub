
import { readFile } from "node:fs/promises";
import { createSign } from "node:crypto";

const GITHUB_API_URL = "https://api.github.com";

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;

  if (!appId || !privateKeyPath) {
    throw new Error("GitHub App credentials are missing");
  }

  const privateKey = await readFile(privateKeyPath, "utf8");

  const now = Math.floor(Date.now() / 1000);

  const header = encodeBase64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );

  const payload = encodeBase64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  );

  const unsignedToken = `${header}.${payload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(privateKey).toString("base64url");

  return `${unsignedToken}.${signature}`;
}

export async function getInstallationAccessToken(
  installationId: string,
) {
  if (!/^\d+$/.test(installationId)) {
    throw new Error("Invalid GitHub installation ID");
  }

  const appJwt = await createGitHubAppJwt();

  const response = await fetch(
    `${GITHUB_API_URL}/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${appJwt}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `GitHub installation token request failed: ${data.message ?? response.statusText}`,
    );
  }

  return {
    token: data.token as string,
    expiresAt: data.expires_at as string,
  };
}

