export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-PT');
}
