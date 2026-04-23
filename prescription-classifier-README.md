---
library_name: transformers
tags:
  - text-classification
  - medical
  - prescription
  - bert
  - healthcare
  - indian-pharma
language:
  - en
pipeline_tag: text-classification
license: apache-2.0
---

# 💊 Prescription Classifier — Sanjeevani

A fine-tuned **BERT-based text classification model** built for the [Sanjeevani](https://huggingface.co/Samay-Verse) healthcare platform. It classifies whether a given text input is a **valid medical prescription** or not, enabling automated prescription validation in the Sanjeevani ordering and delivery pipeline.

---

## 🏥 Project Context

**Sanjeevani** is a full-stack healthcare platform that connects patients with pharmacies and delivery agents. It includes:

- 📱 Mobile App (Flutter) — for customers to browse medicines and place orders
- 🖥️ Admin Console (React) — for pharmacy/admin management
- 🚚 Delivery App (Flutter) — for delivery agents
- 🤖 AI Chatbots (WhatsApp & Telegram) — for conversational ordering
- 📞 Calling Assistant (VAPI) — voice-based ordering
- 🧠 **This Model** — prescription validation at the AI layer

This model is used by the backend services to verify uploaded prescriptions before allowing controlled medicine orders.

---

## 🧠 Model Details

| Property | Value |
|---|---|
| Base Model | `bert-base-uncased` |
| Task | Text Classification (Binary) |
| Tokenizer | `BertTokenizer` |
| Max Sequence Length | 512 |
| Language | English |
| Domain | Medical / Pharmaceutical |

### Labels

| Label | Description |
|---|---|
| `VALID_PRESCRIPTION` | Input is a legitimate medical prescription |
| `INVALID` | Input is not a valid prescription |

---

## 🚀 Quick Start

```python
from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="Samay-Verse/prescription-classifier"
)

result = classifier("Tab. Amoxicillin 500mg - 1 tablet twice daily for 5 days. Dr. Sharma")
print(result)
# [{'label': 'VALID_PRESCRIPTION', 'score': 0.97}]
```

---

## 🔧 Manual Usage

```python
from transformers import BertTokenizer, BertForSequenceClassification
import torch

model_name = "Samay-Verse/prescription-classifier"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name)

text = "Tab. Paracetamol 650mg - 1 tablet SOS. Sig: after food."
inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

with torch.no_grad():
    outputs = model(**inputs)
    prediction = torch.argmax(outputs.logits, dim=1).item()

print("Valid Prescription" if prediction == 1 else "Invalid")
```

---

## 🏗️ Integration in Sanjeevani Backend

This model is called by the Sanjeevani backend API when a customer uploads a prescription image (OCR-extracted text) or types a prescription manually via the chatbot.

```
Customer uploads prescription
        ↓
OCR / Text Extraction
        ↓
prescription-classifier (this model)
        ↓
VALID → Order proceeds
INVALID → User prompted to re-upload
```

---

## 📦 Training Details

- **Base Model:** `bert-base-uncased`
- **Training Data:** Curated dataset of Indian pharmaceutical prescriptions and non-prescription texts
- **Preprocessing:** Lowercased, tokenized with `BertTokenizer`, max length 512
- **Framework:** HuggingFace Transformers + PyTorch

---

## ⚠️ Limitations & Disclaimer

- This model is designed for the **Indian pharmaceutical context** and may not generalize well to other regions.
- It is a **supporting tool**, not a replacement for professional medical verification.
- Always ensure compliance with local regulations when using AI for prescription validation.
- Model performance may vary on handwritten prescription OCR output.

---

## 📄 License

Apache 2.0 — Free to use with attribution.

---

## 🔗 Related Resources

- 🌐 Sanjeevani Platform: [Samay-Verse on HuggingFace](https://huggingface.co/Samay-Verse)
- 🤗 Base Model: [bert-base-uncased](https://huggingface.co/bert-base-uncased)

---

## ✉️ Contact

Built and maintained by the **Samay-Verse** team.
For issues or contributions, open a discussion on the [HuggingFace model page](https://huggingface.co/Samay-Verse/prescription-classifier).
