import { useState } from "react";
import { ArrowLeft, Flame, Loader2, Moon, Sparkles } from "lucide-react";
import GoogleIcon from "../components/GoogleIcon";
import { cx } from "../lib/astro";
import Logo from "../components/Logo";
import ZodiacWheel from "../components/ZodiacWheel";

const FEATURES = [
  {
    Icon: Sparkles,
    title: "Un insight cosmique chaque jour",
    text: "Calculé à partir de votre thème natal.",
  },
  {
    Icon: Moon,
    title: "Vos jours fastes à l’avance",
    text: "Un calendrier de manifestation mois par mois.",
  },
  {
    Icon: Flame,
    title: "Votre série sauvegardée",
    text: "Retrouvez votre progression sur tous vos appareils.",
  },
];

export default function Login({ onSignIn, demo, fromQuiz = false, onBack }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      await onSignIn();
    } catch {
      setError("La connexion a échoué. Vérifiez votre réseau, puis réessayez.");
    } finally {
      setPending(false);
    }
  };

  // Sur ordinateur : présentation à gauche, carte de connexion à droite.
  return (
    <div className="flex min-h-screen flex-col justify-between pb-10 pt-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-12">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour à l’accueil"
            className="-ml-1.5 mb-8 rounded-lg p-1.5 text-zinc-400 transition-all duration-300 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {fromQuiz ? (
          <>
            <Logo size="sm" className="mb-8" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-500">
              Dernière étape
            </p>
            <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight text-white lg:text-[44px]">
              Créez votre compte pour recevoir votre analyse.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-400 lg:text-lg">
              Vos réponses sont gardées : il ne reste que votre nom et votre
              heure de naissance.
            </p>
          </>
        ) : (
          <>
            <Logo as="h1" size="lg" />
            <p className="mt-3 max-w-[18rem] text-[15px] leading-relaxed text-zinc-400">
              L’astrologie personnalisée au service de vos journées de travail.
            </p>
          </>
        )}

        <ul className="mt-10 flex flex-col gap-2.5">
          {FEATURES.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-3.5 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                <Icon className="h-4 w-4 text-blue-600" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">
                  {text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 lg:mt-0 lg:rounded-2xl lg:border lg:border-zinc-900 lg:bg-zinc-950 lg:p-10">
        <ZodiacWheel className="mx-auto mb-8 hidden w-full max-w-[260px] lg:block" />
        <p className="mb-5 hidden text-center text-lg font-semibold text-white lg:block">
          {fromQuiz ? "Plus qu’une étape" : "Connectez-vous"}
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          className={cx(
            "flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-white px-4 py-3.5 text-[15px] font-semibold text-zinc-900",
            "transition-all duration-300 ease-in-out hover:bg-zinc-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "disabled:cursor-wait disabled:opacity-70",
          )}
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          Continuer avec Google
        </button>

        {error && (
          <p role="alert" className="mt-3 text-center text-xs text-red-400">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-500">
          {demo
            ? "Mode démo : la connexion est simulée et aucun compte Google n’est utilisé."
            : "Nous récupérons uniquement votre nom et votre adresse e-mail."}
        </p>
      </div>
    </div>
  );
}
