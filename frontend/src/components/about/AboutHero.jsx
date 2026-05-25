export default function AboutHero() {
  return (
    <section className="relative w-full h-96 md:h-screen flex items-center overflow-hidden bg-on-secondary-fixed">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW6ESCmHWLncBpNT4HPkgqCzF5huanaXrJZugzIbKe7kksMBK3fED_sVm6Pjrsxnt7ZIqtJHtQyMbuR5ANXq9lfByEeywrvlwX0EwuOA-EXAhKiB_JKAoHRUS7LbSJk7-OmFpmigiIVCwOMw4zJ3vKPWlMrRyw6QApmWStknTku-in0kBec6olhxa2-JE_zSyRDposNNsgve1sG_PXfEPW90V2GtBSxosxmhGO8qPyXtgkzS_x9lOJIOwT22m5_6MaJ6m8dVSZ9W7U"
        alt="Corporate office"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop">
        <div className="max-w-2xl">
          <h1 className="font-h1 text-h1 text-on-primary-container mb-4">
            Engineering the Future of Commerce
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant leading-relaxed">
            TechStore is a global leader in high-performance electronics,
            bridging the gap between cutting-edge innovation and the modern
            consumer.
          </p>
        </div>
      </div>
    </section>
  );
}
