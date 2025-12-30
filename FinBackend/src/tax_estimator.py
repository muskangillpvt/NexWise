def calculate_tax_india(income_inr):
    """India tax slabs (Old Regime)."""
    if income_inr <= 250000:
        return 0
    elif income_inr <= 500000:
        return 0.05 * (income_inr - 250000)
    elif income_inr <= 1000000:
        return 12500 + 0.2 * (income_inr - 500000)
    else:
        return 112500 + 0.3 * (income_inr - 1000000)

def calculate_tax_us(income_usd):
    """US Federal Tax (Single Filer, 2024)."""
    if income_usd <= 11000:
        return 0.10 * income_usd
    elif income_usd <= 44725:
        return 1100 + 0.12 * (income_usd - 11000)
    elif income_usd <= 95375:
        return 5147 + 0.22 * (income_usd - 44725)
    else:
        return 16290 + 0.24 * (income_usd - 95375)

def calculate_tax_australia(income_aud):
    """Australia Tax Rates (2024–2025)."""
    if income_aud <= 18200:
        return 0
    elif income_aud <= 45000:
        return 0.19 * (income_aud - 18200)
    elif income_aud <= 120000:
        return 5092 + 0.325 * (income_aud - 45000)
    else:
        return 29467 + 0.37 * (income_aud - 120000)
