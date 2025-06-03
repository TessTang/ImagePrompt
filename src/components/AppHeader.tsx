
import Lottie from "lottie-react";
import { headerCatTailAnimationData } from "@/animations/headerCatTailAnimation";

export function AppHeader() {
  return (
    <header className="bg-primary/80 backdrop-blur-md shadow-md sticky top-0 z-50 overflow-visible">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-2 relative"> {/* Added relative for positioning context */}
          {/* Static Cat icon removed */}
          
          {/* Absolutely positioned Lottie animation */}
          <div
            className="absolute"
            style={{
              top: '-70px',  // Header padding (12px) - 7px = 5px from viewport top for animation's top edge
              left: '-15px',   // Align to the left of the header container
              width: '80px', // New width (280 / 3.5)
              height: '120px', // New height, allows tail to extend (animation content ~57px high)
              zIndex: 51, 
            }}
          >
            <Lottie
              animationData={headerCatTailAnimationData}
              loop={true}
              style={{ width: '150%', height: '150%' }}
            />
          </div>

          {/* Placeholder to maintain layout for the heading, width matches Lottie */}
          <div style={{ width: '80px' }} aria-hidden="true" /> 

          <h1 className="text-3xl font-headline text-primary-foreground">
            喵喵提示詞產生器
          </h1>
        </div>
      </div>
    </header>
  );
}
     
