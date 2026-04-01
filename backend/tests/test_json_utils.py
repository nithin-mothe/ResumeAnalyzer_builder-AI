from utils.json_utils import extract_json_payload


def test_extract_json_payload_handles_fenced_json():
    payload = extract_json_payload('```json\n{"score": 90, "strengths": [], "problems": [], "suggestions": []}\n```')
    assert payload["score"] == 90

