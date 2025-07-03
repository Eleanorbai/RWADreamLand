"""merge heads

Revision ID: c51bc0423c87
Revises: 20240702_add_stage_recruit_fields, 20240701_add_rwa_fields
Create Date: 2025-07-02 10:53:07.985355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c51bc0423c87'
down_revision: Union[str, Sequence[str], None] = ('20240702_add_stage_recruit_fields', '20240701_add_rwa_fields')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
