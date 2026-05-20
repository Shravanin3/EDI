import requests
import pandas as pd

apis_url = "https://www.googleapis.com/discovery/v1/apis"
apis_response = requests.get(apis_url).json()

all_scopes = []

for api in apis_response.get("items", []):
    name = api.get("name")
    version = api.get("version")
    discovery_url = api.get("discoveryRestUrl")

    try:
        api_doc = requests.get(discovery_url).json()
        scopes = api_doc.get("auth", {}).get("oauth2", {}).get("scopes", {})

        for scope_url, scope_info in scopes.items():
            all_scopes.append({
                "api_name": name,
                "version": version,
                "scope": scope_url,
                "description": scope_info.get("description", "")
            })

    except Exception:
        continue

df = pd.DataFrame(all_scopes).drop_duplicates()

df.to_csv("backend/data/google_oauth_scopes.csv", index=False)

print("Total scopes extracted:", len(df))