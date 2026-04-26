"""add_user_devices_table

Revision ID: dd370f59670b
Revises: cc260f59670a
Create Date: 2026-04-26 14:46:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd370f59670b'
down_revision: Union[str, None] = 'cc260f59670a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_devices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('fingerprint', sa.String(length=255), nullable=False),
        sa.Column('is_trusted', sa.Boolean(), nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_devices_user_id'), 'user_devices', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_devices_fingerprint'), 'user_devices', ['fingerprint'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_devices_fingerprint'), table_name='user_devices')
    op.drop_index(op.f('ix_user_devices_user_id'), table_name='user_devices')
    op.drop_table('user_devices')
