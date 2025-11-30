import Image from "next/image";
import { StaticImageData } from "next/image";
import config from "@/config";

// The list of your testimonials. It needs 3 items to fill the row.
const list: {
  username?: string;
  name: string;
  role: string;
  text: string;
  img?: string | StaticImageData;
}[] = [
  {
    name: "Dr. Sarah Chen",
    role: "Professor of Computer Science",
    text: "I used to spend weeks formatting course materials in LaTeX. With LiquidBooks, I created an interactive textbook with executable code examples in a single afternoon. My students love being able to run the code right in the book!",
  },
  {
    name: "Michael Torres",
    role: "Technical Writer",
    text: "Our documentation was scattered across Google Docs, Notion, and random PDFs. LiquidBooks let us consolidate everything into beautiful, searchable web books. The AI content generation saved us months of writing time.",
  },
  {
    name: "Emily Rodriguez",
    role: "Online Course Creator",
    text: "I've tried every documentation tool out there. LiquidBooks is the first one that 'just works'. Describe what you want, AI writes it, click publish. My course companion guides went from idea to live in hours, not weeks.",
  },
];

// A single testimonial, to be rendered in  a list
const Testimonial = ({ i }: { i: number }) => {
  const testimonial = list[i];

  if (!testimonial) return null;

  return (
    <li key={i}>
      <figure className="relative max-w-lg h-full p-6 md:p-10 bg-base-200 rounded-2xl max-md:text-sm flex flex-col">
        <blockquote className="relative flex-1">
          <p className="text-base-content/80 leading-relaxed">
            {testimonial.text}
          </p>
        </blockquote>
        <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 md:gap-8 md:pt-8 md:mt-8 border-t border-base-content/5">
          <div className="w-full flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-base-content md:mb-0.5">
                {testimonial.name}
              </div>
              <div className="mt-0.5 text-sm text-base-content/60">
                {testimonial.role}
              </div>
            </div>

            <div className="overflow-hidden rounded-full bg-base-300 shrink-0">
              {testimonial.img ? (
                <Image
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                  src={list[i].img}
                  alt={`${list[i].name}'s testimonial for ${config.appName}`}
                  width={48}
                  height={48}
                />
              ) : (
                <span className="w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center text-lg font-medium bg-base-300">
                  {testimonial.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

const Testimonials3 = () => {
  return (
    <section id="testimonials" className="bg-base-100">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 mx-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Success Stories
          </div>
          <h2 className="sm:text-5xl text-4xl font-extrabold text-base-content mb-4">
            Educators and Authors Love LiquidBooks
          </h2>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-lg text-base-content/70">
            Join hundreds of educators, technical writers, and course creators who are
            publishing beautiful, interactive books in record time.
          </p>
        </div>

        <ul
          role="list"
          className="flex flex-col items-center lg:flex-row lg:items-stretch gap-6 lg:gap-8"
        >
          {[...Array(3)].map((e, i) => (
            <Testimonial key={i} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials3;
