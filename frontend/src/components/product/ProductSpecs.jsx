import { MdVerified } from "react-icons/md";

export default function ProductSpecs({ specs = [] }) {
  const defaultSpecs = [
    { label: "Driver Type", value: "40mm Dynamic Neodymium" },
    { label: "Frequency Response", value: "10Hz - 40kHz" },
    { label: "Impedance", value: "32 Ohms" },
    { label: "Connectivity", value: "Bluetooth 5.2, USB-C, 3.5mm" },
    { label: "Weight", value: "250g" },
  ];

  const specList = specs.length > 0 ? specs : defaultSpecs;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      {/* Specifications */}
      <div className="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant">
        <h3 className="text-h3 font-h3 mb-6">Technical Specifications</h3>
        <div className="grid grid-cols-1 gap-4">
          {specList.map((spec, idx) => (
            <div
              key={idx}
              className={`flex justify-between py-3 ${idx !== specList.length - 1 ? "border-b border-outline-variant" : ""}`}
            >
              <span className="text-on-surface-variant font-medium">
                {spec.label}
              </span>
              <span className="font-medium text-on-surface">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warranty Card */}
      <div className="bg-primary-container text-on-primary-container p-stack-lg rounded-xl shadow-sm flex flex-col justify-center text-center">
        <MdVerified className="text-6xl mx-auto mb-4" />
        <h3 className="text-h3 font-h3 mb-2">2 Year Warranty</h3>
        <p className="text-body-md font-body-md opacity-90 mb-6">
          Every purchase includes a full 2-year international warranty and 24/7
          technical support for your peace of mind.
        </p>
        <button className="text-on-primary-container font-bold border-b border-on-primary-container hover:opacity-80 transition-opacity">
          Learn more about coverage
        </button>
      </div>
    </div>
  );
}
