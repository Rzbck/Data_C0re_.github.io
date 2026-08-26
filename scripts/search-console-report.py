#!/usr/bin/env python3
import json
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

SITE_URL = os.environ.get("GSC_SITE_URL", "https://datac0re.is-a.dev/")
SECRET_NAME = "GSC_SERVICE_ACCOUNT_JSON"
INCLUDE_QUERIES = os.environ.get("GSC_INCLUDE_QUERIES", "false").lower() == "true"
OUTPUT_DIR = Path("output/search-console")
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
INSPECTION_URLS = [
    SITE_URL,
    f"{SITE_URL}archive.html",
    f"{SITE_URL}projects/lumina.html",
    f"{SITE_URL}projects/grand-theatre.html",
    f"{SITE_URL}projects/comedie.html",
    f"{SITE_URL}projects/hardwinner.html",
    f"{SITE_URL}fr/",
    f"{SITE_URL}es/",
]


def get_credentials():
    raw = os.environ.get(SECRET_NAME)
    if not raw:
        raise SystemExit(
            f"Missing {SECRET_NAME}. Add the full Google service-account JSON as a GitHub Actions secret."
        )
    try:
        info = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"{SECRET_NAME} is not valid JSON: {exc}") from exc

    credentials = service_account.Credentials.from_service_account_info(
        info, scopes=[SCOPE]
    )
    credentials.refresh(Request())
    return credentials


def headers(credentials):
    return {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json",
        "User-Agent": "DATA-C0RE-Search-Console-Monitor/1.0",
    }


def request_json(method, url, credentials, payload=None):
    response = requests.request(
        method,
        url,
        headers=headers(credentials),
        json=payload,
        timeout=30,
    )
    if not response.ok:
        detail = response.text[:2000]
        raise RuntimeError(f"Google API {response.status_code} for {url}: {detail}")
    return response.json() if response.content else {}


def search_analytics(credentials, start_date, end_date, dimensions):
    encoded_site = quote(SITE_URL, safe="")
    url = (
        "https://www.googleapis.com/webmasters/v3/sites/"
        f"{encoded_site}/searchAnalytics/query"
    )
    payload = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "type": "web",
        "rowLimit": 25000,
        "startRow": 0,
        "aggregationType": "auto",
    }
    if dimensions:
        payload["dimensions"] = dimensions
    return request_json("POST", url, credentials, payload)


def inspect_url(credentials, inspection_url):
    endpoint = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
    payload = {
        "inspectionUrl": inspection_url,
        "siteUrl": SITE_URL,
        "languageCode": "en-US",
    }
    try:
        return {"url": inspection_url, "response": request_json("POST", endpoint, credentials, payload)}
    except Exception as exc:
        return {"url": inspection_url, "error": str(exc)}


def rows(data):
    return data.get("rows", []) if isinstance(data, dict) else []


def top_rows(data, limit=10):
    return sorted(rows(data), key=lambda row: row.get("impressions", 0), reverse=True)[:limit]


def metric_summary(aggregate):
    aggregate_rows = rows(aggregate)
    if not aggregate_rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": None}
    row = aggregate_rows[0]
    return {
        "clicks": row.get("clicks", 0),
        "impressions": row.get("impressions", 0),
        "ctr": row.get("ctr", 0.0),
        "position": row.get("position"),
    }


def fmt_pct(value):
    return f"{value * 100:.2f}%"


def fmt_position(value):
    return "n/a" if value is None else f"{value:.2f}"


def build_markdown(report):
    metrics = report["metrics"]
    lines = [
        "# DATA C0RE — Google Search Console report",
        "",
        f"Window: **{report['window']['start']} → {report['window']['end']}**",
        f"Property: `{SITE_URL}`",
        "",
        "## Performance",
        "",
        f"- Clicks: **{metrics['clicks']}**",
        f"- Impressions: **{metrics['impressions']}**",
        f"- CTR: **{fmt_pct(metrics['ctr'])}**",
        f"- Average position: **{fmt_position(metrics['position'])}**",
        "",
        "## Top pages by impressions",
        "",
    ]

    page_rows = report["search_analytics"]["page"].get("rows", [])[:10]
    if page_rows:
        for row in page_rows:
            key = row.get("keys", ["(unknown)"])[0]
            lines.append(
                f"- `{key}` — {row.get('impressions', 0)} impressions / "
                f"{row.get('clicks', 0)} clicks / pos. {fmt_position(row.get('position'))}"
            )
    else:
        lines.append("- No page rows returned for this period.")

    if "query" in report["search_analytics"]:
        lines.extend(["", "## Top queries by impressions", ""])
        query_rows = report["search_analytics"]["query"].get("rows", [])[:10]
        if query_rows:
            for row in query_rows:
                key = row.get("keys", ["(unknown)"])[0]
                lines.append(
                    f"- `{key}` — {row.get('impressions', 0)} impressions / "
                    f"{row.get('clicks', 0)} clicks / pos. {fmt_position(row.get('position'))}"
                )
        else:
            lines.append("- No query rows returned for this period.")
    else:
        lines.extend(
            [
                "",
                "## Search queries",
                "",
                "- Query terms are intentionally excluded from the public-repository artifact.",
            ]
        )

    lines.extend(["", "## Representative URL inspection", ""])
    for item in report["url_inspection"]:
        if item.get("error"):
            lines.append(f"- `{item['url']}` — inspection error (see JSON artifact).")
            continue
        result = item.get("response", {}).get("inspectionResult", {}).get("indexStatusResult", {})
        verdict = result.get("verdict", "UNKNOWN")
        coverage = result.get("coverageState", "unknown")
        canonical = result.get("googleCanonical", "not reported")
        lines.append(
            f"- `{item['url']}` — **{verdict}** / {coverage} / Google canonical: `{canonical}`"
        )

    lines.extend(
        [
            "",
            "The JSON artifact contains the aggregate/page/device/country API rows and inspection responses used for this summary.",
            "",
        ]
    )
    return "\n".join(lines)


def main():
    credentials = get_credentials()
    end_date = date.today() - timedelta(days=2)
    start_date = end_date - timedelta(days=27)

    aggregate = search_analytics(credentials, start_date, end_date, [])
    dimension_data = {}
    dimensions_to_collect = {
        "date": ["date"],
        "page": ["page"],
        "country": ["country"],
        "device": ["device"],
    }
    if INCLUDE_QUERIES:
        dimensions_to_collect["query"] = ["query"]

    for name, dimensions in dimensions_to_collect.items():
        result = search_analytics(credentials, start_date, end_date, dimensions)
        if name != "date":
            result["rows"] = top_rows(result, limit=25000)
        dimension_data[name] = result

    inspections = [inspect_url(credentials, url) for url in INSPECTION_URLS]
    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "site_url": SITE_URL,
        "window": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "metrics": metric_summary(aggregate),
        "search_analytics": dimension_data,
        "url_inspection": inspections,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUTPUT_DIR / "report.json"
    md_path = OUTPUT_DIR / "summary.md"
    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    md_path.write_text(build_markdown(report), encoding="utf-8")

    print(md_path.read_text(encoding="utf-8"))
    print(f"Wrote {json_path} and {md_path}")


if __name__ == "__main__":
    main()
