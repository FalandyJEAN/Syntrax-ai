import os
import mimetypes
import requests

BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")


def is_enabled() -> bool:
    return bool(BLOB_TOKEN)


def upload(file_bytes: bytes, filename: str) -> str | None:
    """Upload file to Vercel Blob. Returns public URL or None if not configured."""
    if not BLOB_TOKEN:
        return None

    content_type, _ = mimetypes.guess_type(filename)
    content_type = content_type or "application/octet-stream"

    try:
        response = requests.put(
            f"https://blob.vercel-storage.com/{filename}",
            headers={
                "Authorization": f"Bearer {BLOB_TOKEN}",
                "x-content-type": content_type,
            },
            data=file_bytes,
            timeout=30,
        )
        if response.ok:
            return response.json().get("url")
    except Exception:
        pass
    return None
