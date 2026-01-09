from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests
import re

API_URL = "https://toy.pequla.com/api/toy"
BASE_URL = "http://localhost:4200/toy"


TARGET_GROUP_MAP = {
    "devojčice": "devojčica",
    "devojcice": "devojčica",
    "dečake": "dečak",
    "decake": "dečak",
    "decu": "svi",
    "deca": "svi"
}

TOY_TYPE_MAP = {
    "slagalice": "slagalica",
    "slagalica": "slagalica",
    "puzzle": "puzzle",
    "puzle": "puzzle",
    "kocke": "kocke"
}


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[čć]", "c", text)
    text = re.sub(r"[š]", "s", text)
    text = re.sub(r"[đ]", "dj", text)
    text = re.sub(r"[ž]", "z", text)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text.strip("-")


class ActionListToys(Action):

    def name(self) -> Text:
        return "action_list_toys"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:

        # učitavanje igračaka
        try:
            response = requests.get(API_URL, timeout=5)
            response.raise_for_status()
            toys = response.json()
        except Exception:
            dispatcher.utter_message("Došlo je do greške prilikom učitavanja igračaka.")
            return []

        price = next(tracker.get_latest_entity_values("price"), None)
        age = next(tracker.get_latest_entity_values("age"), None)
        toy_type = next(tracker.get_latest_entity_values("toy_type"), None)
        target_group = next(tracker.get_latest_entity_values("target_group"), None)

        user_text = tracker.latest_message.get("text", "").lower()

        # fallback za target group
        if not target_group:
            if "devoj" in user_text:
                target_group = "devojčice"
            elif "dečak" in user_text or "decak" in user_text:
                target_group = "dečake"
            elif "decu" in user_text or "deca" in user_text:
                target_group = "decu"

        # fallback za tip igračke
        if not toy_type:
            for key in TOY_TYPE_MAP:
                if key in user_text:
                    toy_type = key
                    break

        # filtriranje po ceni
        if price:
            nums = re.findall(r"\d+", price)
            if nums:
                max_price = int(nums[0])
                toys = [t for t in toys if t.get("price", 0) <= max_price]

        # filtriranje po uzrastu
        if age and age.isdigit():
            user_age = int(age)

            def age_match(t):
                age_name = t.get("ageGroup", {}).get("name", "")
                m = re.match(r"(\d+)-(\d+)", age_name)
                if not m:
                    return False
                return int(m.group(1)) <= user_age <= int(m.group(2))

            toys = [t for t in toys if age_match(t)]

        # filtriranje po tipu
        if toy_type:
            mapped = TOY_TYPE_MAP.get(toy_type.lower())
            if mapped:
                toys = [
                    t for t in toys
                    if mapped in t.get("type", {}).get("name", "").lower()
                ]

        # filtriranje po ciljnoj grupi
        if target_group:
            mapped = TARGET_GROUP_MAP.get(target_group.lower())
            if mapped:
                toys = [
                    t for t in toys
                    if t.get("targetGroup", "").lower() in (mapped, "svi")
                ]

        if not toys:
            dispatcher.utter_message("Nema igračaka koje odgovaraju kriterijumu.")
            return []

        dispatcher.utter_message("Evo nekoliko predloga:")

        for toy in toys[:5]:
            toy_name = toy.get("name", "Nepoznata igračka")
            slug = slugify(toy_name)
            link = f"{BASE_URL}/{slug}"

            dispatcher.utter_message(
                text=(
                    f"Igracka: <b>{toy_name}</b><br>"
                    f"Tip: {toy.get('type', {}).get('name', 'N/A')}<br>"
                    f"Uzrast: {toy.get('ageGroup', {}).get('name', 'N/A')}<br>"
                    f"Cena: {toy.get('price', 'N/A')} RSD<br>"
                    f"🔗 <a href='{link}' target='_blank'>Pogledaj igračku</a>"
                )
            )

        return []
