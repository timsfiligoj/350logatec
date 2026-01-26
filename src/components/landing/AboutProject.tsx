"use client";

import { Mail, Heart } from "lucide-react";

export function AboutProject() {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="https://cdn.prod.website-files.com/68ce6a31fc94cbf6f6244803/68cefe508b9cdc61323b45ad_350life_logo.svg"
                alt="350life logo"
                className="w-32 md:w-36"
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Brezplačno. Za Logatec.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  350Logatec je brezplačna aplikacija, razvita kot osebni projekt
                  digitalnega studia 350life v okviru iniciative Logatec Digi Boost
                  – kjer s tehnologijo želimo narediti nekaj dobrega za domači kraj.
                </p>
                <p>
                  Podatki o odvozih so pridobljeni iz javno dostopnega koledarja
                  Komunalnega podjetja Logatec. Čeprav si prizadevamo za točnost,
                  lahko občasno pride do napak ali sprememb.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <a
                  href="mailto:tim@350life.com"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Opazili napako ali imate idejo? Pišite nam</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>

              {/* Made with love */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                  Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> in Logatec
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
