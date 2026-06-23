import { useLanguage } from "../../context/LanguageContext.jsx";

export default function MissionSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Left Content */}
          <div className="lg:col-span-5">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-4 block">
              {t("about.ourPurpose")}
            </span>
            <h2 className="font-h1 text-h1 text-on-surface mb-6">
              {t("about.redefiningAccessibility")}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              {t("about.purposeDesc")}
            </p>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <span className="block font-h2 text-h2 text-primary">50k+</span>
                <span className="font-label-caps text-label-caps text-outline">
                  {t("about.clientsServed")}
                </span>
              </div>
              <div>
                <span className="block font-h2 text-h2 text-primary">120+</span>
                <span className="font-label-caps text-label-caps text-outline">
                  {t("about.techPartners")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Images Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1gM9qirpHRgf-JswoAAHH-IagldEGL31FzD1gb0sH04TdTC6pGsu7ZEXv57fi9WSAxiJazbBzxhdQtwuMGu2rHmxuxfSK33OxaaZSG0Wf-xaWC2d9hAyivlvTpyl2NDb7vRoYXclKMRZzHACZu0zz9Jre-NdLphsN1IQSyMsc79QsfX4Wu1K-OcrTn04scAMDkcVADQDQ8BNM1TbmbXKQCBwlXVZzTLlwN2JS-JMrQxrCRl34IQ_P29P74-q9V4Fbh9zxCqilsqSM"
                alt="Circuit board"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all mt-8">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzseWrmkyv8Q9GR0ZUTrn9JLoDSDibKD-90GIBeLx-y0qr5x4O_B94HCBNAzrVdL-MhI5Mox_6M20yOr-RCJVQiVd9oFhZzL-CcqgqLU4rFaoJWXYpvr9RZ2dRTfqbNGqvVpFekaCw4TyTXtTxYEpbINLhTvqNikzKtG-OQA29NZMs9Lc4Lg-YJKY1w04kumblZfgUfTF-DZrOGN2NDLfE2EjpPyCGYo7SNEq1HpxaMheS4LPF4ijJD7yEODqFkCh2arOP5-uhj1K0"
                alt="Workspace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
