# Project file: export_utils.py — small helper for server-side export formatting (optional; frontend also exports)
# Helper for server-side exports (Optional, JS handles client-side)
def format_csv(data):
    return ",".join(map(str, data))