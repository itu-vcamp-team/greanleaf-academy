"""add is_public to academy_contents

Revision ID: f1g2h3i4j5k6
Revises: e1f2g3h4i5j6
Create Date: 2026-04-30 23:00:00.000000

Adds is_public boolean column to academy_contents table.
- true  → visible to guests on the landing page and sorted first in academy listing
- false → only visible to authenticated partners (private/members-only content)

Default is TRUE so existing content stays visible.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1g2h3i4j5k6'
down_revision: Union[str, None] = 'e1f2g3h4i5j6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE academy_contents
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_academy_contents_is_public "
        "ON academy_contents (is_public);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_academy_contents_is_public;")
    op.execute("ALTER TABLE academy_contents DROP COLUMN IF EXISTS is_public;")
