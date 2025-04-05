"use client";
import React from "react";
import TestimonialCard from "./TestimonialCard";

interface Testimonial {
  avatar: string;
  name: string;
  location: string;
  date: string;
  // stars: string[];
  review: string;
}

// Define static data outside the component
const testimonials: Testimonial[] = [
  {
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/5540c48ea0f915edad9a5dc07c950f3a1ac121ec?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    name: "Yifei Chen",
    location: "Seoul, South Korea",
    date: "April 2019",
    review:
      "What a great experience using Tripma! I booked all of my flights for my gap year through Tripma and never had any issues. When I had to cancel a flight because of an emergency, Tripma support helped me",
  },
  {
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/80a4e06e8d0e8dddafa7bc9af3284b2b200d0116?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    name: "Kaori Yamaguchi",
    location: "Honolulu, Hawaii",
    date: "February 2017",
    review:
      "My family and I visit Hawaii every year, and we usually book our flights using other services. Tripma was recommened to us by a long time friend, and I'm so glad we tried it out! The process was easy and",
  },
  {
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/0f4e78fbe5680ad32f843f40a44fd06de78fc7be?placeholderIfAbsent=true&apiKey=9e5c8a3cce9c409fa3e820113dadf010",
    name: "Anthony Lewis",
    location: "Berlin, Germany",
    date: "April 2019",
    review:
      "When I was looking to book my flight to Berlin from LAX, Tripma had the best browsing experiece so I figured I'd give it a try. It was my first time using Tripma, but I'd definitely recommend it to a friend and use it for",
  },
];

const TestimonialsSection: React.FC = () => {
  console.log("TestimonialsSection is being rendered during build");

  return (
    <section className="flex flex-col p-16 mt-10 w-full max-md:px-5 max-md:max-w-full">
      <h2 className="self-center text-2xl font-bold text-slate-500">
        What <span className="text-[rgba(96,93,236,1)]">Tripma</span> users are
        saying
      </h2>
      <div className="flex flex-wrap gap-10 items-start mt-6 w-full max-md:max-w-full">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            avatar={testimonial.avatar}
            name={testimonial.name}
            location={testimonial.location}
            date={testimonial.date}
            review={testimonial.review}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
