# Helper for server-side exports (Optional, JS handles client-side)
def format_csv(data):
    return ",".join(map(str, data))