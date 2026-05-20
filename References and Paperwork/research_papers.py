import os
import requests

SAVE_DIR = "References and Paperwork\papers"
os.makedirs(SAVE_DIR, exist_ok=True)

papers = {
    "OAuthGuard Protecting User Security and Privacy":
        "https://arxiv.org/pdf/1901.08960.pdf",

    "Decoupled IFTTT Constraining Privilege in Trigger Action Platforms":
        "https://arxiv.org/pdf/1707.00405.pdf",

    "Cerberus Query Driven Vulnerability Detection in OAuth":
        "https://arxiv.org/pdf/2110.01005.pdf",

    "Mitigating CSRF Attacks on OAuth 2.0":
        "https://arxiv.org/pdf/1801.07983.pdf",

    "WPSE Fortifying Web Protocols via Browser Side Security Monitoring":
        "https://arxiv.org/pdf/1806.09111.pdf",

    "MiniScope Least Privilege Framework for Tool Calling Agents":
        "https://arxiv.org/pdf/2512.11147.pdf",

    "OAuth Security Analysis and Protection Techniques":
        "https://arxiv.org/pdf/2004.13712.pdf",

    "Security Analysis of OAuth Implementations":
        "https://arxiv.org/pdf/2302.01024.pdf",

    "Static Analysis of Permission Overprivilege in IoT Apps":
        "https://arxiv.org/pdf/2005.00445.pdf",

    "Detecting Over Privileged Applications in Cloud Platforms":
        "https://arxiv.org/pdf/2106.08489.pdf",

    "Machine Learning Based OAuth Vulnerability Detection":
        "https://arxiv.org/pdf/2105.11843.pdf",

    "Zero Trust Architecture Security Model":
        "https://arxiv.org/pdf/2103.08451.pdf",

    "Analyzing Security of Automation Platforms":
        "https://arxiv.org/pdf/2002.07610.pdf",

    "Static Analysis for Security Vulnerabilities in Scripts":
        "https://arxiv.org/pdf/1909.09260.pdf",

    "Security Risks in AI Generated Code":
        "https://arxiv.org/pdf/2308.05321.pdf"
}

def download_papers():
    for title, url in papers.items():
        filename = title.replace(" ", "_") + ".pdf"
        path = os.path.join(SAVE_DIR, filename)

        print(f"Downloading: {title}")

        try:
            r = requests.get(url)
            with open(path, "wb") as f:
                f.write(r.content)

            print(f"Saved -> {path}\n")

        except Exception as e:
            print(f"Failed: {title} ({e})")

if __name__ == "__main__":
    download_papers()