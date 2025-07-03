"""add_stage_and_recruit_fields_to_openproject

Revision ID: 20240702_add_stage_recruit_fields
Revises: 9ed3c3fff7b1
Create Date: 2024-07-02 03:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '20240702_add_stage_recruit_fields'
down_revision = '9ed3c3fff7b1'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('openproject', sa.Column('stage', sa.String(length=30), nullable=True, server_default='idea'))
    op.add_column('openproject', sa.Column('is_recruiting', sa.Boolean(), nullable=True, server_default=sa.false()))
    # 兼容sqlite和其他数据库
    try:
        op.add_column('openproject', sa.Column('open_positions', sa.JSON(), nullable=True))
    except NotImplementedError:
        op.add_column('openproject', sa.Column('open_positions', sqlite.JSON(), nullable=True))

def downgrade():
    op.drop_column('openproject', 'stage')
    op.drop_column('openproject', 'is_recruiting')
    op.drop_column('openproject', 'open_positions')
