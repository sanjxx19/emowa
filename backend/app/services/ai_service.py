from transformers import AutoModelForSequenceClassification, AutoTokenizer, AutoConfig
import torch
import numpy as np
from scipy.special import softmax
import string
from typing import Dict
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

class AIAnalysisService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_models()

    def _load_models(self):
        try:
            # Sarcasm Detection Model
            self.sarcasm_model_path = "helinivan/english-sarcasm-detector"
            self.sarcasm_tokenizer = AutoTokenizer.from_pretrained(self.sarcasm_model_path)
            self.sarcasm_model = AutoModelForSequenceClassification.from_pretrained(self.sarcasm_model_path)
            self.sarcasm_model.to(self.device)

            # Sentiment Analysis Model
            self.sentiment_model_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"
            self.sentiment_tokenizer = AutoTokenizer.from_pretrained(self.sentiment_model_path)
            self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(self.sentiment_model_path)
            self.sentiment_config = AutoConfig.from_pretrained(self.sentiment_model_path)
            self.sentiment_model.to(self.device)

            logger.info("AI models loaded successfully")

        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise

    def preprocess_for_sarcasm(self, text: str) -> str:
        return text.lower().translate(str.maketrans("", "", string.punctuation)).strip()

    def preprocess_for_sentiment(self, text: str) -> str:
        new_text = []
        for t in text.split(" "):
            t = '@user' if t.startswith('@') and len(t) > 1 else t
            t = 'http' if t.startswith('http') else t
            new_text.append(t)
        return " ".join(new_text)

    @lru_cache(maxsize=500)
    def detect_sarcasm(self, text: str) -> Dict:
        try:
            processed_text = self.preprocess_for_sarcasm(text)
            tokenized = self.sarcasm_tokenizer(
                [processed_text],
                padding=True,
                truncation=True,
                max_length=256,
                return_tensors="pt"
            ).to(self.device)

            with torch.no_grad():
                output = self.sarcasm_model(**tokenized)

            probs = output.logits.softmax(dim=-1).tolist()[0]
            confidence = max(probs)
            prediction = probs.index(confidence)

            return {
                "is_sarcastic": bool(prediction),
                "confidence": round(confidence, 4)
            }

        except Exception as e:
            logger.error(f"Sarcasm detection failed: {e}")
            return {"is_sarcastic": False, "confidence": 0.5}

    @lru_cache(maxsize=500)
    def analyze_sentiment(self, text: str) -> Dict:
        try:
            processed_text = self.preprocess_for_sentiment(text)
            encoded_input = self.sentiment_tokenizer(processed_text, return_tensors='pt').to(self.device)

            with torch.no_grad():
                output = self.sentiment_model(**encoded_input)

            scores = output[0][0].detach().cpu().numpy()
            scores = softmax(scores)
            ranking = np.argsort(scores)[::-1]

            primary_label = self.sentiment_config.id2label[ranking[0]]
            primary_confidence = float(scores[ranking[0]])

            return {
                "sentiment_label": primary_label.lower(),
                "confidence": round(primary_confidence, 4),
                "is_positive": primary_label.lower() == "positive",
                "is_negative": primary_label.lower() == "negative",
                "is_neutral": primary_label.lower() == "neutral"
            }

        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                "sentiment_label": "neutral",
                "confidence": 0.33,
                "is_positive": False,
                "is_negative": False,
                "is_neutral": True
            }

    def analyze_text_complete(self, text: str) -> Dict:
        if not text or len(text.strip()) == 0:
            return self._get_empty_analysis()

        sentiment_result = self.analyze_sentiment(text)
        sarcasm_result = self.detect_sarcasm(text)

        return {
            "text": text,
            "sentiment": sentiment_result,
            "sarcasm": sarcasm_result,
            "needs_review": self._needs_moderation(sentiment_result, sarcasm_result)
        }

    def _needs_moderation(self, sentiment: Dict, sarcasm: Dict) -> bool:
        # Flag for review if highly negative or highly negative + sarcastic
        if sentiment["is_negative"] and sentiment["confidence"] > 0.8:
            return True
        if sentiment["is_negative"] and sarcasm["is_sarcastic"] and sarcasm["confidence"] > 0.6:
            return True
        return False

    def _get_empty_analysis(self) -> Dict:
        return {
            "text": "",
            "sentiment": {
                "sentiment_label": "neutral",
                "confidence": 1.0,
                "is_positive": False,
                "is_negative": False,
                "is_neutral": True
            },
            "sarcasm": {"is_sarcastic": False, "confidence": 1.0},
            "needs_review": False
        }

ai_service = AIAnalysisService()
