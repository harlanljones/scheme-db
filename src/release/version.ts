import * as fs from 'node:fs';
import * as path from 'node:path';
import { DATA_DIR } from '../schema/load';

/**
 * The data version the site's downloads carry, kept in one file: `data/VERSION`, for example `v1.0.0`.
 *
 * Why a file: the site's downloads used to say `version: "dev"` unless the build was given `DATA_VERSION`, so a
 * citation could not name a version. A release tag (`data-v1.0.0`, or `data-v1.0.0-rc.1`) now has to match the file
 * (see `tagMatchesVersion`), so the downloads on the site and the files on the GitHub release name the same version.
 */
export const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;

/** The version in the text of `data/VERSION`; throws when it is not `vMAJOR.MINOR.PATCH`. */
export function parseDataVersion(text: string): string {
  const version = text.trim();
  if (!VERSION_PATTERN.test(version)) throw new Error(`data/VERSION must hold one version like v1.2.3, found "${version}".`);
  return version;
}

export function readDataVersion(dataDir: string = DATA_DIR): string {
  return parseDataVersion(fs.readFileSync(path.join(dataDir, 'VERSION'), 'utf-8'));
}

/** What a site build stamps on its downloads: `DATA_VERSION` when set (an override), else `data/VERSION`. */
export function siteDataVersion(env: Record<string, string | undefined> = process.env, dataDir: string = DATA_DIR): string {
  const override = env.DATA_VERSION?.trim();
  return override ? override : readDataVersion(dataDir);
}

/**
 * True when a release tag names the version in `data/VERSION`. A suffix such as `-rc.1` is a pre-release of that
 * version, so `data-v1.0.0-rc.1` matches `v1.0.0`.
 */
export function tagMatchesVersion(tag: string, version: string): boolean {
  const match = tag.match(/^data-(v\d+\.\d+\.\d+)(?:-[0-9A-Za-z.]+)?$/);
  return match !== null && match[1] === version;
}
