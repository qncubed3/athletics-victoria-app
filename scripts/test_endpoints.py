"""
Smoke-test API endpoints locally or against production.

Three ways to run (use project venv):

  # 1. Production — real deployed URL (what users hit)
  .venv\\Scripts\\python.exe scripts/test_endpoints.py --env production

  # 2. Local server — start Django first: python manage.py runserver
  .venv\\Scripts\\python.exe scripts/test_endpoints.py --env local

  # 3. Services only — no server; calls Python service layer directly
  .venv\\Scripts\\python.exe scripts/test_endpoints.py --env services

Override URL:
  .venv\\Scripts\\python.exe scripts/test_endpoints.py --base-url https://your-deploy.vercel.app

Quiet summary only:
  .venv\\Scripts\\python.exe scripts/test_endpoints.py --env production --quiet
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import traceback
from typing import Any, Callable

import requests

PRODUCTION_URL = "https://athletics-victoria-app.vercel.app"
LOCAL_URL = "http://127.0.0.1:8000"

# (label, path, validator, optional)
# optional=True: 404 counts as SKIP (e.g. not deployed to Vercel yet)
Validator = Callable[[Any], None | str]  # None = pass, str = error message

ENDPOINTS: list[tuple[str, str, Validator, bool]] = [
    (
        "health",
        "/api/health",
        lambda d: None if _require(d, "status") == "ok" else "status != ok",
        False,
    ),
    (
        "affiliations",
        "/api/affiliations",
        lambda d: (
            None
            if isinstance(_require(d, "affiliations"), list) and "MUU" in d["affiliations"]
            else "affiliations must be a list containing MUU"
        ),
        False,
    ),
    (
        "results",
        "/api/results?season=2026&series=xcr&round=2&venue=all",
        lambda d: (
            None
            if _require(d, "table_count", "tables") and d["table_count"] > 0
            else "expected table_count > 0"
        ),
        False,
    ),
    (
        "athletes/results (Nguyen,Quan)",
        "/api/athletes/results?name=Nguyen,Quan",
        lambda d: _athlete_ok(d, "Quan Nguyen", "MUU"),
        False,
    ),
    (
        "athletes/results (Nguyen,Quan) repeat",
        "/api/athletes/results?name=Nguyen,Quan",
        lambda d: _athlete_ok(d, "Quan Nguyen", "MUU"),
        False,
    ),
    (
        "athletes/compare",
        "/api/athletes/compare?name1=Nguyen,Quan&name2=Nguyen,Quan",
        lambda d: (
            None
            if _require(d, "overlap_count", "comparisons", "summary") is not None
            and d["overlap_count"] >= 1
            and len(d["comparisons"]) == d["overlap_count"]
            else "compare response shape invalid"
        ),
        False,
    ),
    (
        "relays (MUU)",
        "/api/relays?season=2026&series=xcr&round=2&club=MUU",
        lambda d: (
            None
            if _require(d, "relay_count", "relays") is not None
            and d["relay_count"] > 0
            and d["relays"][0].get("affiliation") == "MUU"
            else "expected relay_count > 0 for MUU"
        ),
        False,
    ),
    (
        "events",
        "/api/events?season=2026",
        lambda d: (
            None
            if isinstance(_require(d, "tables"), dict) and len(d["tables"]) > 0
            else "expected tables dict"
        ),
        True,
    ),
    (
        "news",
        "/api/news?season=2026&series=xcr",
        lambda d: (
            None
            if _require(d, "news_count", "news") is not None and d["news_count"] >= 0
            else "news response shape invalid"
        ),
        True,
    ),
]


def _require(d: dict, *keys: str) -> Any:
    for k in keys:
        if k not in d:
            raise KeyError(k)
    return d if len(keys) > 1 else d[keys[0]]


def _athlete_ok(d: dict, expected_name: str, expected_club: str) -> str | None:
    try:
        info = d["data"]["athlete_info"]
        if info.get("athlete") != expected_name:
            return f"athlete name expected {expected_name!r}, got {info.get('athlete')!r}"
        if info.get("club") != expected_club:
            return f"club expected {expected_club!r}, got {info.get('club')!r}"
        if not d["data"].get("results"):
            return "results list empty"
        return None
    except (KeyError, TypeError) as e:
        return f"invalid athlete response: {e}"


def truncate(obj: Any, max_list: int = 2, max_keys: int = 8) -> Any:
    if isinstance(obj, list):
        if len(obj) <= max_list:
            return [truncate(x, max_list, max_keys) for x in obj]
        return [truncate(obj[i], max_list, max_keys) for i in range(max_list)] + [
            f"... +{len(obj) - max_list} more"
        ]
    if isinstance(obj, dict):
        items = list(obj.items())
        out: dict = {}
        for i, (k, v) in enumerate(items):
            if i >= max_keys:
                out["..."] = f"+{len(items) - max_keys} keys"
                break
            if k == "tables" and isinstance(v, dict):
                out[k] = {n: truncate(rows) for n, rows in list(v.items())[:3]}
                if len(v) > 3:
                    out[k]["..."] = f"+{len(v) - 3} tables"
                continue
            out[k] = truncate(v, max_list, max_keys)
        return out
    return obj


def _http_session(insecure: bool) -> requests.Session:
    session = requests.Session()
    if insecure:
        import urllib3

        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        session.verify = False
    return session


def run_http(
    base_url: str, quiet: bool, timeout: int, insecure: bool
) -> tuple[int, int, int]:
    base_url = base_url.rstrip("/")
    passed = failed = skipped = 0
    session = _http_session(insecure)
    if insecure and not quiet:
        print("Note: SSL verification disabled (--insecure). Use only for local dev machines.\n")

    for name, path, validate, optional in ENDPOINTS:
        url = f"{base_url}{path}"
        t0 = time.perf_counter()
        err_msg = None
        status = None
        data = None
        r = None

        try:
            r = session.get(url, timeout=timeout)
            status = r.status_code
            if status == 404 and optional:
                skipped += 1
                result = "SKIP"
                err_msg = "not deployed (404)"
            else:
                r.raise_for_status()
                data = r.json()
                err_msg = validate(data)
                if err_msg:
                    raise AssertionError(err_msg)
                passed += 1
                result = "PASS"
        except Exception as e:
            if optional and status == 404:
                skipped += 1
                result = "SKIP"
                err_msg = "not deployed (404)"
            else:
                failed += 1
                result = "FAIL"
                err_msg = str(e)
                if status and status != 200 and not quiet:
                    try:
                        print(getattr(r, "text", "")[:300])
                    except Exception:
                        pass

        elapsed_ms = int((time.perf_counter() - t0) * 1000)

        if quiet:
            print(f"  [{result}] {name} ({status or '—'}) {elapsed_ms}ms")
        else:
            print(f"\n{'=' * 64}")
            print(f"[{result}] {name}")
            print(f"GET {url}")
            print(f"Status: {status}  Time: {elapsed_ms}ms")
            if err_msg and result == "FAIL":
                print(f"Error: {err_msg}")
                traceback.print_exc()
            elif data is not None:
                print(json.dumps(truncate(data), indent=2, default=str))

    return passed, failed, skipped


def run_services(quiet: bool) -> tuple[int, int, int]:
    """Call Django services directly (no HTTP). Requires venv + django setup."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, root)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    import django

    django.setup()

    if os.environ.get("RESULTSHUB_VERIFY_SSL") != "1":
        import urllib3
        import api.services.resultshub_client as rh_client

        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        _orig = rh_client.requests.get

        def _get(url, **kwargs):
            kwargs.setdefault("verify", False)
            return _orig(url, **kwargs)

        rh_client.requests.get = _get

    from api.services.affiliation_service import fetch_affiliations
    from api.services.athlete_service import compare_athletes, fetch_athlete_results
    from api.services.event_service import fetch_events, fetch_news
    from api.services.relay_service import get_relay_results
    from api.services.resultshub_client import fetch_event_results

    service_map = {
        "health": lambda: {"status": "ok", "service": "athletics-victoria-api"},
        "affiliations": fetch_affiliations,
        "results": lambda: fetch_event_results(
            season="2026", series="xcr", round_number="2", venue="all"
        ),
        "athletes/results (Nguyen,Quan)": lambda: fetch_athlete_results("Nguyen,Quan"),
        "athletes/results (Nguyen,Quan) repeat": lambda: fetch_athlete_results("Nguyen,Quan"),
        "athletes/compare": lambda: compare_athletes("Nguyen,Quan", "Nguyen,Quan"),
        "relays (MUU)": lambda: get_relay_results(
            season="2026", series="xcr", round_number="2", club="MUU"
        ),
        "events": lambda: fetch_events("2026"),
        "news": lambda: fetch_news(season="2026", series="xcr"),
    }

    passed = failed = skipped = 0
    for name, path, validate, optional in ENDPOINTS:
        fn = service_map.get(name)
        if not fn:
            continue
        try:
            data = fn()
            err = validate(data)
            if err:
                raise AssertionError(err)
            passed += 1
            if quiet:
                print(f"  [PASS] {name}")
            else:
                print(f"\n{'=' * 64}\n[PASS] {name} (service layer)\n")
                print(json.dumps(truncate(data), indent=2, default=str))
        except Exception as e:
            failed += 1
            if quiet:
                print(f"  [FAIL] {name}: {e}")
            else:
                print(f"\n{'=' * 64}\n[FAIL] {name}: {e}\n")
                traceback.print_exc()

    return passed, failed, 0


def resolve_base_url(env: str | None, base_url: str | None) -> str | None:
    if base_url:
        return base_url.rstrip("/")
    if env == "production":
        return PRODUCTION_URL
    if env == "local":
        return LOCAL_URL
    if env == "services":
        return None
    return None


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Smoke-test Athletics Victoria API (local or production)."
    )
    parser.add_argument(
        "--env",
        choices=["production", "local", "services"],
        default="production",
        help="production=Vercel deploy, local=runserver :8000, services=no HTTP",
    )
    parser.add_argument("--base-url", help="Override base URL (no trailing path)")
    parser.add_argument("--quiet", "-q", action="store_true", help="Summary lines only")
    parser.add_argument("--timeout", type=int, default=90, help="HTTP timeout seconds")
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Skip SSL certificate verification (needed on some Windows dev machines)",
    )
    args = parser.parse_args()

    base = resolve_base_url(args.env, args.base_url)
    insecure = args.insecure

    skipped = 0
    if args.env == "services" and not args.base_url:
        print("Mode: services (Django service layer, no HTTP)\n")
        passed, failed, skipped = run_services(args.quiet)
    else:
        if not base:
            parser.error("Provide --env or --base-url")
        print(f"Mode: HTTP\nBase: {base}\n")
        passed, failed, skipped = run_http(base, args.quiet, args.timeout, insecure)
        if failed and not insecure:
            # Retry once if local machine cannot verify any HTTPS certs
            try:
                requests.get(f"{base}/api/health", timeout=5)
            except requests.exceptions.SSLError:
                print(
                    "SSL verification failed. Retrying with --insecure "
                    "(common on Windows without CA bundle).\n"
                )
                passed, failed, skipped = run_http(
                    base, args.quiet, args.timeout, True
                )

    print(f"\n{'=' * 64}")
    msg = f"Result: {passed} passed, {failed} failed"
    if skipped:
        msg += f", {skipped} skipped"
    print(msg)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
