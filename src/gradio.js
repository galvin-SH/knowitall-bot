import { Client } from '@gradio/client';

export async function generateTTS(text, voice) {
    const app = await Client.connect('http://127.0.0.1:6969/');
    const ttsPrompt = text.replace(/[\*\n]/g, '');
    let None = null;

    // Send a request to the TTS server
    switch (voice) {
        case 'march':
            await app.predict('/run_tts_script', {
                tts_text: ttsPrompt,
                tts_voice: 'en-US-AvaMultilingualNeural',
                tts_rate: -5,
                pitch: 9,
                filter_radius: 3,
                index_rate: 0.5,
                volume_envelope: 1,
                protect: 0.459,
                hop_length: 1,
                f0_method: 'rmvpe',
                output_tts_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_output.wav',
                output_rvc_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_rvc_output.wav',
                pth_path: 'logs\\march72.0\\march72.0.pth',
                index_path:
                    'logs\\march72.0\\added_IVF274_Flat_nprobe_1_march72.0_v2.index',
                split_audio: false,
                f0_autotune: false,
                clean_audio: true,
                clean_strength: 0.25,
                export_format: 'wav',
                upscale_audio: false,
                f0_file: None,
                embedder_model: 'contentvec',
                embedder_model_custom: None,
            });
            break;

        case 'ranni':
            await app.predict('/run_tts_script', {
                tts_text: ttsPrompt,
                tts_voice: 'en-GB-SoniaNeural',
                tts_rate: -10,
                pitch: 0,
                filter_radius: 3,
                index_rate: 0.75,
                volume_envelope: 1,
                protect: 0.426,
                hop_length: 458,
                f0_method: 'rmvpe',
                output_tts_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_output.wav',
                output_rvc_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_rvc_output.wav',
                pth_path: 'logs\\ranni\\ranni.pth',
                index_path:
                    'logs\\ranni\\added_IVF740_Flat_nprobe_1_ranni_v2.index',
                split_audio: false,
                f0_autotune: false,
                clean_audio: true,
                clean_strength: 0.5,
                export_format: 'WAV',
                upscale_audio: false,
                f0_file: None,
                embedder_model: 'contentvec',
                embedder_model_custom: None,
            });
            break;

        case 'trump':
            await app.predict('/run_tts_script', {
                tts_text: ttsPrompt,
                tts_voice: 'en-US-AndrewMultilingualNeural',
                tts_rate: 0,
                pitch: 0,
                filter_radius: 3,
                index_rate: 0.75,
                volume_envelope: 1,
                protect: 0.426,
                hop_length: 458,
                f0_method: 'rmvpe',
                output_tts_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_output.wav',
                output_rvc_path:
                    'C:\\Users\\matth\\Applio\\Applio-3.2.3\\assets\\audios\\tts_rvc_output.wav',
                pth_path: 'logs\\Trump\\Trump_e160_s7520.pth',
                index_path:
                    'logs\\Trump.index\\added_IVF1377_Flat_nprobe_1_Trump_v2.index',
                split_audio: false,
                f0_autotune: false,
                clean_audio: true,
                clean_strength: 0.5,
                export_format: 'WAV',
                upscale_audio: false,
                f0_file: None,
                embedder_model: 'contentvec',
                embedder_model_custom: None,
            });
            break;

        default:
            console.log('Voice not found');
    }
}
