/**
 * Fake values for each token key — used server-side for PDF preview.
 * Replace with real data when integrating with the actual API.
 */
export const FAKE_VALUES: Record<string, string> = {
  full_name:          'Jonathan R. Mitchell',
  email:              'jonathan.mitchell@example.com',
  phone:              '+1 (555) 234-7890',
  total_capital:      '$2,450,000',
  hybrid_ratio:       '60% / 40%',
  investment_horizon: '7 years',
  portfolio_value:    '$3,120,500',
  mandate_name:       'Conservative Growth Mandate',
}

/** Replace all {{key}} placeholders in HTML with their fake values. */
export function replacePlaceholders(html: string, values: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match)
}
