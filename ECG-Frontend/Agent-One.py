import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_response(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()

def voice_to_text(audio_file_path):
    with open(audio_file_path, "rb") as audio_file:
        response = openai.Audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    return response.text

def text_to_voice(text, output_file_path):
    response = openai.Audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=text
    )
    with open(output_file_path, "wb") as audio_file:
        audio_file.write(response.audio)

def main():
    # Example usage of the functions
    audio_file_path = "input_audio.wav"
    output_file_path = "output_audio.wav"
    
    # Convert voice to text
    transcribed_text = voice_to_text(audio_file_path)
    print("Transcribed Text:", transcribed_text)
    
    # Generate a response based on the transcribed text
    response_text = generate_response(transcribed_text)
    print("Generated Response:", response_text)

    # Convert the generated response to voice
    text_to_voice(response_text, output_file_path)

if __name__ == "__main__":
    main() 

