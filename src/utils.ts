import axios from 'axios';

export const textToSpeech = async (inputText) => {
  const speechDetails = await axios.post(
  'https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb',
  { 'text': inputText, 'model_id': 'eleven_multilingual_v2' },
    {
        params: {
        'output_format': 'mp3_44100_128'
        },
        headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
        }
    }
    );


  return speechDetails.data;
};