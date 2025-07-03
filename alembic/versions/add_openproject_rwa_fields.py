"""add RWA fields to openproject

Revision ID: 20240701_add_rwa_fields
Revises: 9ed3c3fff7b1
Create Date: 2024-07-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240701_add_rwa_fields'
down_revision = '9ed3c3fff7b1'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('openproject', sa.Column('progress', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('total_value', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('raised', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('investors', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('team_size', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('days_left', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('openproject', sa.Column('asset_owner', sa.String(length=100), nullable=True))
    op.add_column('openproject', sa.Column('leader_id', sa.Integer(), nullable=True))
    op.add_column('openproject', sa.Column('leader_role', sa.String(length=50), nullable=True, server_default='项目负责人'))

def downgrade():
    op.drop_column('openproject', 'progress')
    op.drop_column('openproject', 'total_value')
    op.drop_column('openproject', 'raised')
    op.drop_column('openproject', 'investors')
    op.drop_column('openproject', 'team_size')
    op.drop_column('openproject', 'days_left')
    op.drop_column('openproject', 'asset_owner')
    op.drop_column('openproject', 'leader_id')
    op.drop_column('openproject', 'leader_role')