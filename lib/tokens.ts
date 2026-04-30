export interface TokenDef {
  label: string
  category: string
}

export type TokenMap = Record<string, TokenDef>

/** Mock data — replace the fetch in Editor.tsx with your real API endpoint. */
export const MOCK_TOKENS: TokenMap = {
  // Agreement Meta
  date:                     { label: 'Agreement Date',           category: 'Agreement' },
  start_date:               { label: 'Start Date',               category: 'Agreement' },
  end_date:                 { label: 'End Date',                 category: 'Agreement' },

  // Company
  company_name:             { label: 'Company Name',             category: 'Company' },
  jurisdiction:             { label: 'Jurisdiction',             category: 'Company' },
  company_address:          { label: 'Company Address',          category: 'Company' },
  company_rep_name:         { label: 'Representative Name',      category: 'Company' },
  company_rep_title:        { label: 'Representative Title',     category: 'Company' },

  // Investor
  investor_name:            { label: 'Investor Name',            category: 'Investor' },
  id_number:                { label: 'ID Number',                category: 'Investor' },
  investor_address:         { label: 'Investor Address',         category: 'Investor' },

  // Investment Strategy
  investment_objective:     { label: 'Investment Objective',     category: 'Strategy' },
  risk_profile:             { label: 'Risk Profile',             category: 'Strategy' },
  investment_horizon:       { label: 'Investment Horizon',       category: 'Strategy' },
  asset_allocation:         { label: 'Asset Allocation',         category: 'Strategy' },
  geographic_focus:         { label: 'Geographic Focus',         category: 'Strategy' },
  sector_restrictions:      { label: 'Sector Restrictions',      category: 'Strategy' },
  prohibited_investments:   { label: 'Prohibited Investments',   category: 'Strategy' },

  // Capital
  capital_amount:           { label: 'Capital Amount',           category: 'Capital' },
  contribution_conditions:  { label: 'Contribution Conditions',  category: 'Capital' },
  withdrawal_notice_period: { label: 'Withdrawal Notice Period', category: 'Capital' },
  minimum_withdrawal:       { label: 'Minimum Withdrawal',       category: 'Capital' },
  lock_up_period:           { label: 'Lock-up Period',           category: 'Capital' },

  // Authority
  discretionary_authority:  { label: 'Discretionary Authority', category: 'Authority' },

  // Fees
  management_fee:           { label: 'Management Fee',           category: 'Fees' },
  performance_fee:          { label: 'Performance Fee',          category: 'Fees' },
  high_water_mark:          { label: 'High-Water Mark',          category: 'Fees' },
  hurdle_rate:              { label: 'Hurdle Rate',              category: 'Fees' },

  // Reporting
  reporting_frequency:      { label: 'Reporting Frequency',      category: 'Reporting' },

  // Legal
  termination_notice_period: { label: 'Termination Notice Period', category: 'Legal' },
  dispute_resolution:        { label: 'Dispute Resolution',        category: 'Legal' },
  dispute_venue:             { label: 'Dispute Venue',             category: 'Legal' },
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
