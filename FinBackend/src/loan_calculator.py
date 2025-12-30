# loan_calculator.py

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import csv
import math


@dataclass
class AmortizationRow:
    month: int
    interest: float
    principal: float
    extra_payment: float
    total_payment: float
    balance: float


@dataclass
class LoanResult:
    loan_amount: float
    annual_rate: float
    months: int
    emi: float
    total_interest: float
    total_payment: float
    months_taken: int
    schedule: List[AmortizationRow]


def calculate_loan_emi(
    loan_amount: float,
    annual_rate: float,
    years: Optional[int] = None,
    months: Optional[int] = None,
) -> float:
    """
    Calculate EMI for a loan.

    If `months` is not provided, it is derived from `years`.
    """
    if months is None:
        if years is None:
            raise ValueError("Either years or months must be provided")
        months = years * 12

    if months <= 0:
        raise ValueError("Tenure (months) must be > 0")

    monthly_rate = annual_rate / 12.0 / 100.0

    if monthly_rate == 0:
        return loan_amount / months

    r = monthly_rate
    n = months
    emi = loan_amount * r * (1 + r) ** n / ((1 + r) ** n - 1)
    return emi


def generate_amortization_schedule(
    loan_amount: float,
    annual_rate: float,
    years: Optional[int] = None,
    months: Optional[int] = None,
    extra_monthly: float = 0.0,
    lump_sum: float = 0.0,
    lump_sum_month: Optional[int] = None,
) -> LoanResult:
    """
    Generate a MONTHLY amortization schedule.

    - loan_amount: principal
    - annual_rate: annual interest % (e.g. 8.5)
    - years / months: tenure (one of them is required)
    - extra_monthly: fixed extra payment every month
    - lump_sum: one-time extra payment
    - lump_sum_month: month number (1-based) when lump_sum is paid
    """
    if months is None:
        if years is None:
            raise ValueError("Either years or months must be provided")
        months = years * 12

    if months <= 0:
        raise ValueError("Tenure (months) must be > 0")

    monthly_rate = annual_rate / 12.0 / 100.0
    emi = calculate_loan_emi(loan_amount, annual_rate, months=months)

    balance = float(loan_amount)
    schedule: List[AmortizationRow] = []
    total_interest = 0.0
    total_payment = 0.0

    month = 0
    max_months = months * 10  # safety guard

    while balance > 0 and month < max_months:
        month += 1

        interest = balance * monthly_rate
        principal = emi - interest

        extra = extra_monthly if extra_monthly > 0 else 0.0
        if lump_sum_month is not None and month == lump_sum_month:
            extra += lump_sum

        # Avoid overpaying
        if principal + extra > balance:
            diff = principal + extra - balance
            if extra >= diff:
                extra -= diff
            else:
                principal -= (diff - extra)
                extra = 0.0

        total_payment_for_month = principal + interest + extra
        balance -= principal + extra

        if balance < 0.01:
            balance = 0.0

        total_interest += interest
        total_payment += total_payment_for_month

        schedule.append(
            AmortizationRow(
                month=month,
                interest=round(interest, 2),
                principal=round(principal + extra, 2),
                extra_payment=round(extra, 2),
                total_payment=round(total_payment_for_month, 2),
                balance=round(balance, 2),
            )
        )

        if balance <= 0:
            break

        # If there are no extra payments, we usually stop at `months`
        if month >= months and extra_monthly <= 0 and lump_sum_month is None:
            break

    return LoanResult(
        loan_amount=float(loan_amount),
        annual_rate=float(annual_rate),
        months=months,
        emi=round(emi, 2),
        total_interest=round(total_interest, 2),
        total_payment=round(total_payment, 2),
        months_taken=month,
        schedule=schedule,
    )


def compare_loans(loans: List[Dict[str, Any]]) -> List[LoanResult]:
    """
    Compare multiple loan options.

    Each item in `loans` is a dict with:
      {
        "loan_amount": float,
        "annual_rate": float,
        "years": int OR "months": int,
        "extra_monthly": 0.0 (optional),
        "lump_sum": 0.0 (optional),
        "lump_sum_month": int (optional)
      }

    Returns a list of LoanResult, one for each loan.
    """
    results: List[LoanResult] = []

    for cfg in loans:
        result = generate_amortization_schedule(
            loan_amount=cfg["loan_amount"],
            annual_rate=cfg["annual_rate"],
            years=cfg.get("years"),
            months=cfg.get("months"),
            extra_monthly=cfg.get("extra_monthly", 0.0),
            lump_sum=cfg.get("lump_sum", 0.0),
            lump_sum_month=cfg.get("lump_sum_month"),
        )
        results.append(result)

    return results


def export_schedule_to_csv(result: LoanResult, filename: str) -> None:
    """
    Export amortization schedule to a CSV file (Excel-compatible).
    """
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        # Summary section
        writer.writerow(["Summary"])
        writer.writerow(["Loan Amount", result.loan_amount])
        writer.writerow(["Annual Rate (%)", result.annual_rate])
        writer.writerow(["EMI", result.emi])
        writer.writerow(["Total Interest", result.total_interest])
        writer.writerow(["Total Payment", result.total_payment])
        writer.writerow(["Months Taken", result.months_taken])
        writer.writerow([])

        # Header
        writer.writerow(
            ["Month", "Interest", "Principal", "Extra Payment", "Total Payment", "Balance"]
        )

        # Rows
        for row in result.schedule:
            writer.writerow(
                [
                    row.month,
                    row.interest,
                    row.principal,
                    row.extra_payment,
                    row.total_payment,
                    row.balance,
                ]
            )


# OPTIONAL: simple CLI for quick manual testing
if __name__ == "__main__":
    # Example usage when running `python loan_calculator.py`
    amt = 500000
    rate = 8.5
    years = 20

    result = generate_amortization_schedule(
        loan_amount=amt,
        annual_rate=rate,
        years=years,
        extra_monthly=2000,
        lump_sum=50000,
        lump_sum_month=24,
    )

    print("EMI:", result.emi)
    print("Total Interest:", result.total_interest)
    print("Total Payment:", result.total_payment)
    print("Months Taken:", result.months_taken)

    export_schedule_to_csv(result, "example_loan_schedule.csv")
    print("CSV schedule exported to example_loan_schedule.csv")