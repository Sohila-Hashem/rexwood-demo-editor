export interface TokenDef {
  label: string
  category: string
}

export type TokenMap = Record<string, TokenDef>

/** Mock data — replace the fetch in Editor.tsx with your real API endpoint. */
export const MOCK_TOKENS: TokenMap = {
  full_name:           { label: 'Full Name',           category: 'Client Info' },
  email:               { label: 'Email',               category: 'Client Info' },
  phone:               { label: 'Phone',               category: 'Client Info' },
  total_capital:       { label: 'Total Capital',       category: 'Investment' },
  hybrid_ratio:        { label: 'Hybrid Ratio',        category: 'Investment' },
  investment_horizon:  { label: 'Investment Horizon',  category: 'Investment' },
  portfolio_value:     { label: 'Portfolio Value',     category: 'Investment' },
  mandate_name:        { label: 'Mandate Name',        category: 'Mandate' },
}

/** Group a TokenMap by category, preserving insertion order. */
export function groupTokens(
  tokens: TokenMap,
): Record<string, Array<{ key: string; label: string }>> {
  return Object.entries(tokens).reduce<Record<string, Array<{ key: string; label: string }>>>(
    (acc, [key, { label, category }]) => {
      if (!acc[category]) acc[category] = []
      acc[category].push({ key, label })
      return acc
    },
    {},
  )
}
