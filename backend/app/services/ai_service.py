import google.generativeai as genai
import os
import json
import re

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def extract_json(text):
    # Extract JSON array from text using regex
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return match.group(0)
    return None


def generate_study_plan(subject, level, days, hours):
    prompt = f"""
    Generate a {days}-day structured study plan for {subject}.
    Level: {level}
    Hours per day: {hours}

    IMPORTANT:
    - Return ONLY a valid JSON array.
    - Do NOT include explanation.
    - Do NOT include markdown.
    - Do NOT include text outside JSON.

    Format:
    [
        {{
            "day": 1,
            "topics": [
                {{"name": "Topic Name", "hours": {hours}, "completed": false}}
            ]
        }}
    ]
    """

    response = model.generate_content(prompt)
    content = response.text.strip()

    json_text = extract_json(content)

    if not json_text:
        raise ValueError("AI did not return valid JSON format")

    return json.loads(json_text)
