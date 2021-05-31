export function parsePath<T>(pattern: string): T {
  const patternPieces = pattern.split('/').filter(p => !!p);
  const pathPieces = window.location.pathname.split('/').filter(p => !!p);

  if (patternPieces.length !== pathPieces.length) {
    throw new Error('Path and pattern pieces must match');
  }

  const result: any = {};
  for (let i = 0; i < patternPieces.length; i++) {
    if (patternPieces[i].startsWith(':')) {
      result[patternPieces[i].substring(1)] = pathPieces[i];
    }
  }

  return result;
}