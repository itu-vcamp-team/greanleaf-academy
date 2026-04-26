"""migrate_order_to_lexorank

Revision ID: c1d2e3f4g5h6
Revises: b1c2d3e4f5a6
Create Date: 2026-04-26 08:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4g5h6'
down_revision: Union[str, None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alter column type to String (VARCHAR)
    # Using raw SQL to handle the transition safely in PostgreSQL
    op.execute('ALTER TABLE academy_contents ALTER COLUMN "order" TYPE VARCHAR(255)')
    
    # 2. Convert existing integers to zero-padded strings to preserve order
    # Example: 1 -> 000001, 10 -> 000010
    op.execute('UPDATE academy_contents SET "order" = LPAD("order"::text, 6, \'0\')')


def downgrade() -> None:
    # Convert back to integer
    op.execute('ALTER TABLE academy_contents ALTER COLUMN "order" TYPE INTEGER USING "order"::integer')
