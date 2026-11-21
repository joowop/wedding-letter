#!/usr/bin/env python3
"""Generate one image with the OpenAI Images API and save it into the project.

Standard library only (no pip install needed).

The API key is read from the OPENAI_API_KEY environment variable, or from a
`.env` / `.env.local` file in the project root (both are gitignored).
The key is never printed.

Examples (run from the project root):
    python .claude/skills/gpt-image2/scripts/generate_image.py --check
    python .claude/skills/gpt-image2/scripts/generate_image.py \
        --prompt-file _workspace/prompts/hero.txt --out images/hero-illustration.png \
        --size 1024x1536 --quality high
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_MODEL = "gpt-image-2.6-sunburst"
API_BASE = "https://api.openai.com/v1"
# .claude/skills/gpt-image2/scripts/generate_image.py -> project root is 4 levels up
PROJECT_ROOT = Path(__file__).resolve().parents[4]
RETRY_STATUS = {408, 409, 429, 500, 502, 503, 504}


def fail(message, code=1):
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False))
    sys.exit(code)


def load_api_key():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    for name in (".env.local", ".env"):
        path = PROJECT_ROOT / name
        if not path.is_file():
            continue
        for raw in path.read_text(encoding="utf-8-sig").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            if line.lower().startswith("export "):
                line = line[7:].strip()
            name_part, value = line.split("=", 1)
            if name_part.strip() == "OPENAI_API_KEY":
                value = value.strip().strip('"').strip("'")
                if value:
                    return value
    return ""


def request_json(method, url, key, payload=None, timeout=600):
    data = None
    headers = {"Authorization": "Bearer " + key}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def describe_http_error(err):
    try:
        body = json.loads(err.read().decode("utf-8", "replace"))
        info = body.get("error", {}) if isinstance(body, dict) else {}
        message = info.get("message") or str(body)
        code = info.get("code") or info.get("type") or ""
    except Exception:
        message, code = str(err), ""
    return "HTTP {}{}: {}".format(err.code, " ({})".format(code) if code else "", message)


def resolve_out(out):
    path = Path(out)
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    path = path.resolve()
    try:
        path.relative_to(PROJECT_ROOT)
    except ValueError:
        fail("--out must be inside the project folder: {}".format(PROJECT_ROOT))
    return path


def main():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="Generate one image with the OpenAI Images API.")
    parser.add_argument("--prompt", help="Prompt text (English works best).")
    parser.add_argument("--prompt-file", help="UTF-8 text file holding the prompt.")
    parser.add_argument("--out", help="Output file, relative to the project root (e.g. images/hero.png).")
    parser.add_argument("--size", default="1024x1536",
                        help="WIDTHxHEIGHT or 'auto'. Safe values: 1024x1024, 1536x1024, 1024x1536.")
    parser.add_argument("--quality", default="high", help="low | medium | high | auto")
    parser.add_argument("--background", default="auto", help="auto | opaque | transparent")
    parser.add_argument("--format", default="png", dest="output_format", help="png | webp | jpeg")
    parser.add_argument("--model", default=os.environ.get("OPENAI_IMAGE_MODEL", DEFAULT_MODEL))
    parser.add_argument("--retries", type=int, default=2, help="Extra attempts on rate limit / server errors.")
    parser.add_argument("--overwrite", action="store_true", help="Replace the output file if it exists.")
    parser.add_argument("--check", action="store_true",
                        help="Only verify the key and model access. Generates nothing, costs nothing.")
    parser.add_argument("--dry-run", action="store_true", help="Print the request without calling the API.")
    args = parser.parse_args()

    key = load_api_key()

    if args.check:
        if not key:
            fail("OPENAI_API_KEY not found. Put it in {} as OPENAI_API_KEY=...".format(PROJECT_ROOT / ".env"))
        try:
            info = request_json("GET", "{}/models/{}".format(API_BASE, args.model), key, timeout=60)
        except urllib.error.HTTPError as err:
            fail(describe_http_error(err))
        except urllib.error.URLError as err:
            fail("Network error: {}".format(err.reason))
        print(json.dumps({"ok": True, "model": info.get("id", args.model), "key": "found"}, ensure_ascii=False))
        return

    if bool(args.prompt) == bool(args.prompt_file):
        fail("Give exactly one of --prompt or --prompt-file.")
    if not args.out:
        fail("--out is required.")

    prompt = args.prompt
    if args.prompt_file:
        prompt_path = Path(args.prompt_file)
        if not prompt_path.is_absolute():
            prompt_path = PROJECT_ROOT / prompt_path
        prompt = prompt_path.read_text(encoding="utf-8-sig")
    prompt = prompt.strip()
    if not prompt:
        fail("The prompt is empty.")

    out_path = resolve_out(args.out)
    if out_path.exists() and not args.overwrite:
        fail("{} already exists. Pass --overwrite to replace it.".format(out_path))

    payload = {
        "model": args.model,
        "prompt": prompt,
        "n": 1,
        "size": args.size,
        "quality": args.quality,
        "output_format": args.output_format,
    }
    if args.background != "auto":
        payload["background"] = args.background

    if args.dry_run:
        print(json.dumps({"ok": True, "dry_run": True, "out": str(out_path), "request": payload},
                         ensure_ascii=False, indent=2))
        return

    if not key:
        fail("OPENAI_API_KEY not found. Put it in {} as OPENAI_API_KEY=...".format(PROJECT_ROOT / ".env"))

    attempt = 0
    while True:
        try:
            result = request_json("POST", API_BASE + "/images/generations", key, payload)
            break
        except urllib.error.HTTPError as err:
            message = describe_http_error(err)
            if err.code in RETRY_STATUS and attempt < args.retries:
                attempt += 1
                time.sleep(10 * attempt)
                continue
            fail(message)
        except (urllib.error.URLError, TimeoutError) as err:
            if attempt < args.retries:
                attempt += 1
                time.sleep(10 * attempt)
                continue
            fail("Network error: {}".format(getattr(err, "reason", err)))

    items = result.get("data") or []
    if not items or not items[0].get("b64_json"):
        fail("The API returned no image data.")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(base64.b64decode(items[0]["b64_json"]))

    print(json.dumps({
        "ok": True,
        "file": str(out_path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "bytes": out_path.stat().st_size,
        "model": args.model,
        "size": result.get("size", args.size),
        "quality": result.get("quality", args.quality),
        "background": result.get("background"),
        "usage": result.get("usage"),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
