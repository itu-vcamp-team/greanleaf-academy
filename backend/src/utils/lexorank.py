import string

def get_next_rank(last_rank: str = None) -> str:
    """
    Generates the next rank string. 
    Simplification: If no last_rank, start at '000100'.
    Otherwise, increment the last rank.
    """
    if not last_rank:
        return "000100"
    
    try:
        # Simple integer-based string increment with padding
        current_val = int(last_rank)
        return str(current_val + 100).zfill(6)
    except ValueError:
        # Fallback if rank is not numeric
        return last_rank + "a"

def generate_sequence(count: int) -> list[str]:
    """Generates a list of count ranks with gaps."""
    return [str((i + 1) * 100).zfill(6) for i in range(count)]
