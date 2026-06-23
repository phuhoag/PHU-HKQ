import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function TeamSection() {
  const { t } = useLanguage();

  const TEAM = [
    {
      id: 1,
      name: "Marcus Chen",
      role: t("about.ceoRole"),
      bio: t("about.ceoBio"),
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0k0e_2NTGAwuOFZ2Q-QowymccCdNedqD4yNNm5vGu02d6RG-NdObyHdcyWt-biPS_4KCGs-dQRckxLIqj6sjsQ91u70GVNIpmBq5Y-qtf-0OKncdlB3omQWRsHXuP5L0FNBB9TcHc8NALoweIozw1WOF09x3gGoX9WUc25XKE29jIXZoMFt0XAspJ4CQZQTC5IiyYfUPRF0nSsZUNucTlTex0786wvr3toN5Ta7u2Xvwh-1vpm0-88W3gxdxSL0U9yjeVMUjD1qC",
    },
    {
      id: 2,
      name: "Sarah J. Williams",
      role: t("about.engDirRole"),
      bio: t("about.engDirBio"),
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBR4iuNPcV2pI1ygBe_pX9IpjDf54qych0-AZOiTTvTnbmEP98luGX6OAmHTRdv27jTDp4LDOC4z9gubvjT4S5RP7hwqmtHvrsH6KY56RUi6KjvVzBNcaJSpQLxoEsqgoZyQWXal6Jf0Vw_U-bdRqQGbojiTHxPAYA4mnIUZBjyUyrjt5eVhirmzRLzo5d8jHcupA2NfPwaAOlfarL4QlQLsfTKgIXvLIRnnjCTNWwvroyDyNPlDOlYLNlBCu2TGmDHE1krKeAPoYnT",
    },
    {
      id: 3,
      name: "David Vance",
      role: t("about.productHeadRole"),
      bio: t("about.productHeadBio"),
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD1_lmYGwZVpKQUvZT0XIMX7HRjDvzfg7G3NanYoVbZ12FGTUGp_ayT1G8RYLwj5_OqF5AxnvDBkjxmDs-Rejs_I_0wXZAurewaAMzDibihUgqb9nUsPVgvvYXC6T9QqW-BRerwpxx9aJsIgSR_g91DqpzZwby14bmIK6lPFJVFmCYPMDZxEwJcanJEpWtM37VyFqFRcrZzDIizBcuDstAVjFexMjr5BTLPzM7vgVDuAhsHiE2qQ8U2EMy0x0SSFTtH3XF4PQsRrFRS",
    },
    {
      id: 4,
      name: "Elena Rodriguez",
      role: t("about.cooRole"),
      bio: t("about.cooBio"),
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC53VNY93G8V2GWVc8FRu6XrUwXpvMYEVEgX45kvo8I_8ST_34JdEmkMsSR0Jk2fWQqxa4aAFo0QuOg8Lwrrwrw_qZLlnsAKoIQMKNQ0GnaCnKli9ODjNotZEjOtnLPkA1FN76w7JYqPhRh-LvCnGrvvenNkLDfOp5Dylr0xDv9so4HNSk0YKlHi0yYO8qIpnT0WWm3IwyAw_cKhjyD31RUsXffIazUlBljsK4rxI9t_oC-Cdm1DMSzhxokQNOlrxedk-vDqBbr7xG1",
    },
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="font-h2 text-h2 text-on-surface mb-4">
              {t("about.teamTitle")}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("about.teamSubtitle")}
            </p>
          </div>
          <Link
            to="/careers"
            className="px-6 py-3 bg-primary text-on-primary font-button text-button rounded-lg hover:bg-primary-container transition-colors whitespace-nowrap"
          >
            {t("about.joinTeam")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member) => (
            <div key={member.id} className="group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h4 className="font-h3 text-h3 text-on-surface">{member.name}</h4>
              <p className="font-label-caps text-label-caps text-primary mb-2">
                {member.role}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
