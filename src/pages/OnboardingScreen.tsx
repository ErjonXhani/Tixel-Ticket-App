
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slidesRef = useRef<HTMLDivElement>(null);
  
  const slides: OnboardingSlide[] = [
    {
      icon: <Calendar className="w-16 h-16 text-primary" />,
      title: "Discover Events",
      description: "Find the best concerts, sports, and entertainment events near you.",
    },
    {
      icon: <Search className="w-16 h-16 text-primary" />,
      title: "Easy Browsing",
      description: "Search by category, date, or venue to find exactly what you're looking for.",
    },
    {
      icon: <User className="w-16 h-16 text-primary" />,
      title: "Secure Tickets",
      description: "Purchase tickets safely and have them delivered right to your phone.",
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (slidesRef.current) {
      slidesRef.current.scrollTo({ 
        left: index * slidesRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (slidesRef.current) {
      const slideWidth = slidesRef.current.offsetWidth;
      const scrollPosition = slidesRef.current.scrollLeft;
      const newSlideIndex = Math.round(scrollPosition / slideWidth);
      
      if (newSlideIndex !== currentSlide) {
        setCurrentSlide(newSlideIndex);
      }
    }
  };
  
  const finishOnboarding = () => {
    localStorage.setItem("tixel_onboarded", "true");
    navigate("/login");
  };
  
  useEffect(() => {
    const slidesElement = slidesRef.current;
    if (slidesElement) {
      slidesElement.addEventListener('scroll', handleScroll);
      return () => slidesElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Slides container */}
      <div 
        ref={slidesRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index}
            className="min-w-full h-full flex flex-col items-center justify-center p-8 snap-center"
          >
            <div className="mb-8 p-6 bg-primary-50 rounded-full">
              {slide.icon}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">{slide.title}</h2>
            <p className="text-center text-gray-600 max-w-xs">{slide.description}</p>
          </div>
        ))}
      </div>
      
      {/* Indicator dots */}
      <div className="flex justify-center my-8">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`mx-1 rounded-full ${
              index === currentSlide 
                ? "w-8 h-2 bg-primary" 
                : "w-2 h-2 bg-gray-300"
            } transition-all duration-300`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Bottom buttons */}
      <div className="p-8">
        <Button 
          onClick={finishOnboarding}
          className="w-full bg-primary hover:bg-primary-600"
          size="lg"
        >
          {currentSlide < slides.length - 1 ? "Skip" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
