/**
 * Fake values for each token key — used server-side for PDF preview.
 * Replace with real data when integrating with the actual API.
 */
export const FAKE_VALUES: Record<string, string> = {
  // Agreement Meta
  date:                     new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  start_date:               'January 1, 2025',
  end_date:                 'December 31, 2027',
  type:                     'Investment Management Agreement',

  // Company
  company_name:             'Rexwood Capital',
  jurisdiction:             'Dubai International Financial Centre (DIFC)',
  company_address:          'Level 12, Gate Building, DIFC, Dubai, UAE',
  company_rep_name:         'Alexandra Wren',
  company_rep_title:        'Chief Investment Officer',

  // Investor
  investor_name:            'Jonathan R. Mitchell',
  id_number:                'ID-987654321',
  investor_address:         '45 Riverside Drive, Apt 8B, New York, NY 10024',

  // Investment Strategy
  investment_objective:     'Balanced Strategy',
  risk_profile:             'Moderate',
  investment_horizon:       'Medium Term (3–7 years)',
  asset_allocation:         'Equities 50%, Fixed Income 30%, Alternatives 20%',
  geographic_focus:         'Global, with emphasis on MENA and North America',
  sector_restrictions:      'No exposure to tobacco or weapons manufacturing',
  prohibited_investments:   'Cryptocurrencies, leveraged ETFs',

  // Capital
  capital_amount:           '$2,450,000',
  contribution_conditions:  'Additional contributions allowed with 10 business days notice',
  withdrawal_notice_period: '30 calendar days',
  minimum_withdrawal:       '$50,000',
  lock_up_period:           '12 months from the date of each contribution',

  // Authority
  discretionary_authority:  'Full Discretion',

  // Fees
  management_fee:           '1.5% per annum, charged quarterly',
  performance_fee:          '20% of returns above the hurdle rate',
  high_water_mark:          'Applicable',
  hurdle_rate:              '8% per annum',

  // Reporting
  reporting_frequency:      'Quarterly',

  // Legal
  termination_notice_period: '60 calendar days written notice',
  dispute_resolution:        'Arbitration under DIFC-LCIA Rules',
  dispute_venue:             'Dubai, UAE',
}

/** Replace all {{key}} placeholders in HTML with their fake values. */
export function replacePlaceholders(html: string, values: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match)
}
