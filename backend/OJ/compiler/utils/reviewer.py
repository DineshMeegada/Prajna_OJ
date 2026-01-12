from google import genai
from google.genai import types
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_ai_review(code, language, problem_title):
    """
    Returns AI review for the given code
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key :
        logger.error("Gemini API key is missing.")
        return "System Error: AI Review is currently unavailable (Config Missing)"
    
    try:
        client = genai.Client(api_key=api_key)
        MODEL_ID = "gemini-2.5-flash"

        prompt = f"""
        You are a world-class Software Architect and a ruthless, honest, yet encouraging mentor. 
        Your student has submitted code for a competitive programming problem titled "{problem_title}".
        Language: {language}

        Your Goal: Make the student an expert. Do not sugarcoat bad practices.
        
        Review the code below. Output your response in valid Markdown.
        Structure your response exactly like this:
        
        ### 🧐 Ruthless Critique
        (2-3 sentences max. Is the code clean? Is the logic sound? Be blunt but professional.)

        ### ⏱️ Complexity Analysis
        * **Time Complexity:** (Estimate it. e.g., O(N log N))
        * **Space Complexity:** (Estimate it.)

        ### 🚀 Actionable Improvements
        (List 3 bullet points max. Suggest specific changes for readability, optimization, or Pythonic/Standard practices.)

        ---
        **Code to Review:**
        ```
        {code}
        ```
        """
        response = client.models.generate_content(
            model = MODEL_ID,
            contents = prompt,
            config = types.GenerateContentConfig(
                temperature = 0.3
            )
        )
        return response.text
    except Exception as e:
        logger.error(f"AI Review failed: {str(e)}")
        if "not found" in str(e).lower():
            try :
                logger.info("Retrying with gemini-flash-latest...")
                response = client.models.generate_content(
                    model = "gemini-flash-latest",
                    contents = prompt,
                )
                return response.text
            except :
                pass
        return "I apologize, but I cannot review your code right now due to a connection issue. Please try again later."