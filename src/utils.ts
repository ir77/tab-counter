// カバレッジテスト用のユーティリティ関数
export function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}

export function isValidTabCount(count: number): boolean {
  return count >= 0 && Number.isInteger(count);
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}