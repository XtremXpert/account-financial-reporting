# © 2018 Forest and Biomass Romania SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
# Odoo 20: account.group no longer exists; the hierarchy lives on
# account.account (parent_id, parent_path, code_path). A "group" is a parent
# account.
from odoo import api, fields, models


class AccountAccount(models.Model):
    _inherit = "account.account"

    centralized = fields.Boolean(
        help="If flagged, no details will be displayed in "
        "the General Ledger report (the webkit one only), "
        "only centralized amounts per period.",
    )
    child_account_ids = fields.One2many(
        comodel_name="account.account",
        inverse_name="parent_id",
        string="Child Accounts",
        context={"active_test": False},
    )
    level = fields.Integer(compute="_compute_level", recursive=True)
    complete_code = fields.Char(
        "Full Code", compute="_compute_complete_code", recursive=True
    )
    compute_account_ids = fields.Many2many(
        "account.account",
        recursive=True,
        compute="_compute_group_accounts",
        string="Compute accounts",
        store=False,
        context={"active_test": False},
    )

    @api.depends("parent_id", "parent_id.level")
    def _compute_level(self):
        for account in self:
            account.level = (account.parent_id.level + 1) if account.parent_id else 0

    @api.depends("code", "name", "parent_id.complete_code")
    def _compute_complete_code(self):
        # Odoo 20: some charts of accounts (e.g. ca_2023) have no account code;
        # the name is then used as key to keep a stable hierarchical order.
        for account in self:
            key = account.code or account.name or ""
            if account.parent_id.complete_code:
                account.complete_code = f"{account.parent_id.complete_code}/{key}"
            else:
                account.complete_code = key

    @api.depends("child_account_ids", "child_account_ids.compute_account_ids")
    def _compute_group_accounts(self):
        """All descendant accounts (leaves and intermediate parents)."""
        for account in self:
            descendants = account.child_account_ids
            for child in account.child_account_ids:
                descendants |= child.compute_account_ids
            account.compute_account_ids = descendants
