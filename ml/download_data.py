"""
Downloads the public disease-symptom dataset used to train the AI
symptom checker model.

Source: itachi9604/healthcare-chatbot (public GitHub repo), which
mirrors a well-known educational Kaggle dataset: 4,920 patient
records, 131 symptoms, 41 diseases, plus per-disease descriptions,
precautions, and symptom severity scores.

Usage:
    python download_data.py
"""

import urllib.request
from pathlib import Path

BASE_URL = "https://raw.githubusercontent.com/itachi9604/healthcare-chatbot/master"
DATA_DIR = Path(__file__).resolve().parent / "data"

FILES = {
    "Data/dataset.csv": "dataset.csv",
    "MasterData/symptom_Description.csv": "symptom_description.csv",
    "MasterData/symptom_precaution.csv": "symptom_precaution.csv",
    "MasterData/Symptom_severity.csv": "symptom_severity.csv",
}


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True)

    for remote_path, local_name in FILES.items():
        url = f"{BASE_URL}/{remote_path}"
        destination = DATA_DIR / local_name
        print(f"Downloading {url} ...")
        urllib.request.urlretrieve(url, destination)
        size_kb = destination.stat().st_size / 1024
        print(f"  Saved to {destination} ({size_kb:.1f} KB)")

    print("\nAll dataset files downloaded successfully.")


if __name__ == "__main__":
    main()