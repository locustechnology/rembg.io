import BackgroundRemover from "@/components/BackgroundRemover"
import HeroSection from "@/components/HeroSection"

export default function Home() {
  return (
    <main className="flex justify-center align-middle items-center min-h-screen max-w-[90%] mx-auto" role="main">
      <div className="w-full max-w-4xl">
        <HeroSection />
        <section aria-label="Background Removal Tool">
          <BackgroundRemover />
        </section>
      </div>
    </main>
  )
}