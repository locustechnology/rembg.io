import { Lock } from "lucide-react";
import { Separator } from "./ui/separator";

export default function HeroSection() {
    return (
        <div className="grid grid-cols-1 items-center align-middle gap-2 mb-2">
            <header className="text-center">
                <h1 className="text-5xl font-bold">
                    Remove Background from Images for Free
                </h1>
                <h2 className="text-xl mt-4 text-gray-600 dark:text-gray-400 font-medium">
                    100% Automatic AI Background Removal - Works Offline in Your Browser
                </h2>
            </header>
            
            <div className="my-2 text-md text-gray-600 dark:text-gray-400 border p-4 rounded-lg font-medium flex flex-wrap justify-evenly flex-col space-y-2 shadow-md">
                <Lock className="mx-auto" aria-hidden="true"/>
                <div className="text-center space-y-2">
                    <p>         
                        <strong>100% Privacy Protected:</strong> Your images never leave your device. <br/> 
                        All AI processing happens locally in your browser.
                    </p>
                    <p className="text-green-600 font-semibold">
                        ✓ No uploads ✓ No registration ✓ Completely free
                    </p>
                    <p className="text-amber-600 text-sm">
                        Note: May not work optimally on mobile devices due to processing requirements.
                    </p>
                </div>
                <Separator/>
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-200 font-semibold">
                        🤖 AI-Powered • 🔒 Offline Processing • ⚡ Instant Results
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Perfect for product photos, portraits, marketing materials, and e-commerce
                    </p>
                </div>
            </div>
        </div>        
    );
}