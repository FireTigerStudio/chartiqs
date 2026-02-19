"use client";

import Link from "next/link";
import config from "@/config";
import { useTranslation } from "@/libs/i18n";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className=" flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-6" />
              </svg>
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-base-content/80">
              {config.appDescription}
            </p>
            <p className="mt-3 text-sm text-base-content/60">
              {t("footer.copyright")} &copy; {new Date().getFullYear()}{" "}
              <a href="https://firetigerstudio.com/" target="_blank" rel="noopener noreferrer" className="link link-hover">FireTigerStudio</a>
              {" "}- {t("footer.allRightsReserved")}
            </p>
          </div>
          <div className="flex-grow flex flex-wrap justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("footer.links")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/commodities" className="link link-hover">
                  {t("footer.commodities")}
                </Link>
                <Link href="/#pricing" className="link link-hover">
                  {t("footer.pricing")}
                </Link>
                {config.resend.supportEmail && (
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    {t("footer.contact")}
                  </a>
                )}
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("footer.legal")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  {t("footer.tos")}
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  {t("footer.privacy")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-base-content/10 py-6">
        <p className="text-center text-xs text-base-content/50 max-w-3xl mx-auto px-4">
          {t("disclaimer.title")}: {t("disclaimer.text")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
