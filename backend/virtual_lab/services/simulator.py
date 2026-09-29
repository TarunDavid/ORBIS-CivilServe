from ai_engine.services import LLMService

class SimulatorService:
    @staticmethod
    def process_turn(scenario_system_prompt: str, transcript: list) -> str:
        """
        Sends the current scenario transcript to the LLM to get the simulator's next response.
        """
        messages = [{"role": "system", "content": scenario_system_prompt}]
        messages.extend(transcript)
        
        try:
            output = LLMService.chat(messages=messages, max_tokens=256)
            return output['choices'][0]['message']['content'].strip()
        except Exception as e:
            print(f"Simulation chat error: {e}")
            return "Simulation paused due to an engine error. Please try again."

    @staticmethod
    def evaluate_attempt(scenario_system_prompt: str, transcript: list) -> dict:
        """
        Asks the LLM to grade the user's performance in the role-play scenario out of 100
        and provide constructive feedback.
        """
        messages = [{"role": "system", "content": scenario_system_prompt}]
        messages.extend(transcript)
        
        eval_prompt = (
            "The role-play scenario has concluded. As an expert evaluator, analyze the user's "
            "performance based on the transcript above.\n"
            "Provide your evaluation as a JSON object with two keys:\n"
            '{"score": <number between 0 and 100>, "feedback": "<detailed constructive feedback>"}'
        )
        messages.append({"role": "user", "content": eval_prompt})
        
        try:
            output = LLMService.generate_json(messages=messages, schema={
                "type": "object",
                "properties": {
                    "score": {"type": "number"},
                    "feedback": {"type": "string"}
                },
                "required": ["score", "feedback"]
            })
            return output
        except Exception as e:
            print(f"Simulation evaluation error: {e}")
            return {"score": 0.0, "feedback": "Could not generate feedback due to an engine error."}
