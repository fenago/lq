import Link from "next/link";
import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";

// <Pricing/> displays the pricing plans for your app
// Per-book pricing model with bundles

const Pricing = () => {
  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 mx-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Pay Per Book
          </div>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-4">
            One Price. One Book. Yours Forever.
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-base-content/70">
            No subscriptions. Pay once, get your book with 1 year of hosting included.
            Download anytime. Save more with bundles.
          </p>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-6">
          {config.stripe.plans.map((plan) => (
            <div key={plan.priceId} className="relative w-full max-w-xs">
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span className="badge text-xs text-primary-content font-semibold border-0 bg-primary">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {plan.priceAnchor && !plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span className="badge text-xs text-success-content font-semibold border-0 bg-success">
                    {plan.description}
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div className="absolute -inset-[1px] rounded-[9px] bg-primary z-10"></div>
              )}

              <div className="relative flex flex-col h-full gap-5 z-10 bg-base-100 p-6 rounded-lg">
                <div>
                  <p className="text-lg font-bold">{plan.name}</p>
                  {plan.description && !plan.priceAnchor && (
                    <p className="text-base-content/70 text-sm mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  {plan.priceAnchor && (
                    <span className="text-lg text-base-content/50 line-through">
                      ${plan.priceAnchor.toFixed(2)}
                    </span>
                  )}
                  <span className="text-4xl font-extrabold">
                    {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
                  </span>
                  {plan.isPerBook && (
                    <span className="text-sm text-base-content/60">
                      one-time
                    </span>
                  )}
                </div>

                {plan.features && (
                  <ul className="space-y-2 text-sm flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 text-success shrink-0 mt-0.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-2 mt-auto">
                  {plan.isFree ? (
                    <Link
                      href="/sign-in"
                      className="btn btn-outline btn-block"
                    >
                      Try Free
                    </Link>
                  ) : (
                    <ButtonCheckout priceId={plan.priceId} />
                  )}

                  <p className="text-xs text-center text-base-content/60">
                    {plan.isFree
                      ? "No credit card required"
                      : "Includes 1 year hosting"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* After 1 year note */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-base-100 rounded-lg px-6 py-4 shadow-sm">
            <p className="text-sm text-base-content/70">
              <strong>After 1 year:</strong> Renew hosting for $19.99/year, or download your book as a ZIP and host it yourself for free.
              <br />
              <span className="text-base-content/50">Your content, your choice.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
