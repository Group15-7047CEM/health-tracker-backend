export const envFiles = {
  local: '.env.local',
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production',
  staginggcp: '.env.staging.gcp',
  productiongcp: '.env.production.gcp',
  stgcloudrun: '.env.staging.cloudrun',
  prodcloudrun: '.env.production.cloudrun',
};

export function getEnvFilePath(envName: string): string {
  if (!envFiles[envName]) {
    return envFiles['local'];
  }
  return envFiles[envName];
}
