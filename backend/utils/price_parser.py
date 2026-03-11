import re

def parse_price_to_inr(price_str: str) -> int:
    """
    Parses a string like '$120', '¥8000', '150-200 EUR', or '₹1000'
    and returns an approximate integer value in INR (₹).
    If a range is given, it averages the values.
    """
    if not price_str or not isinstance(price_str, str):
        return 0

    clean_str = price_str.upper().replace(',', '')
    
    # Extract all numbers from the string
    numbers = [float(n) for n in re.findall(r'\d+(?:\.\d+)?', clean_str)]
    
    if not numbers:
        return 0
        
    avg_val = sum(numbers) / len(numbers)
    
    # Simple conversion rates (approximate for demo)
    if '$' in clean_str or 'USD' in clean_str:
        return int(avg_val * 83)
    elif '€' in clean_str or 'EUR' in clean_str:
        return int(avg_val * 90)
    elif '£' in clean_str or 'GBP' in clean_str:
        return int(avg_val * 105)
    elif '¥' in clean_str or 'JPY' in clean_str:
        return int(avg_val * 0.55)
    
    # Assume it's already INR or local currency fallback
    return int(avg_val)

def format_price_inr(price_inr: int) -> str:
    """Returns formatted string like ₹12,000"""
    if price_inr <= 0:
        return "Price not available"
    return f"₹{price_inr:,.0f}"
