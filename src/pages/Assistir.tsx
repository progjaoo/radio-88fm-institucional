import { useEffect } from "react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

const VIDEO_URL = "https://playerv.srvstm.com/video/radioenergia4369//true/false/V1hwT1UyUkhVbkZTV0ZacVRUQnZlVmw2VGxOa1JYaDBWRzVhYVZWVU1Eaz0rUg==/16:9/YUhSMGNITTZMeTl5WVdScGJ6ZzRabTB1WTI5dEwzZGhiR3h3WVhCbGNuTXZkMkZzYkhCaGNHVnlYemc0WDI1dmRtRXVhbkJuK0Q=/nao/nao";

const Assistir = () => {
  const { isPlaying, pause } = useAudioPlayer();

  useEffect(() => {
    if (isPlaying) pause();
  }, [isPlaying, pause]);

  return (
    <div className="min-h-[80vh] bg-radio-brand-blue flex flex-col">
      <section className="py-8">
        <div className="container text-center">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
            ASSISTA AO VIVO
          </h1>
        </div>
      </section>

      <div className="flex-1 container max-w-4xl pb-12">
        <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-radio-yellow">
          <iframe
            src={VIDEO_URL}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title="Rádio 88 FM - Ao Vivo"
          />
        </div>
      </div>
    </div>
  );
};

export default Assistir;
