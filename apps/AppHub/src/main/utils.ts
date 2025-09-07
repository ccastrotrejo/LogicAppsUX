export const isDev = (): boolean => {
  return process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
};