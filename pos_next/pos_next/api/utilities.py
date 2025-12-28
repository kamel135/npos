# -*- coding: utf-8 -*-
# Copyright (c) 2024, POS Next and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


@frappe.whitelist()
def fix_print_format():
	"""
	Force update POS Next Receipt print format from fixtures
	Use this if print format stops working after VM restart
	"""
	try:
		from pos_next.install import ensure_print_format_updated
		ensure_print_format_updated(quiet=False)
		frappe.db.commit()
		frappe.clear_cache()
		return {"success": True, "message": "Print format updated successfully"}
	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Fix Print Format Error")
		return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_csrf_token():
	"""
	Get CSRF token for the current session.
	Only returns CSRF token if user is authenticated with a valid session.

	Security checks:
	- User must be authenticated (not Guest)
	- Session must be valid
	- User must be enabled

	Note: frappe.sessions.get_csrf_token() handles session updates and commits internally.
	"""
	# Check if user is authenticated
	if frappe.session.user == "Guest":
		frappe.throw("Authentication required", frappe.AuthenticationError)

	# Verify user is enabled
	if not frappe.db.get_value("User", frappe.session.user, "enabled"):
		frappe.throw("User is disabled", frappe.AuthenticationError)

	# Verify session exists and is valid
	if not frappe.session.sid or frappe.session.sid == "Guest":
		frappe.throw("Invalid session", frappe.AuthenticationError)

	# Get CSRF token for valid, authenticated session
	csrf_token = frappe.sessions.get_csrf_token()

	if not csrf_token:
		frappe.throw("Failed to generate CSRF token", frappe.ValidationError)

	return {
		"csrf_token": csrf_token,
		"session_id": frappe.session.sid
	}
