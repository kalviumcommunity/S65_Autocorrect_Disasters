import { useState, useEffect } from "react";
import { Image, Heart, MessageCircle } from "lucide-react";
import backgroundImage from "../assets/codioful-formerly-gradienta-bmbfr43iBog-unsplash.jpg";
import FeatureCard from "../components/FeatureCard";
import { motion, AnimatePresence } from "framer-motion";

const Landing = () => {
    const features = [
        {
            icon: <Image className="w-8 h-8" />,
            title: "Share Your Fails.",
            description:
                "Transform your amusing text exchanges into shareable moments. Join a thousand other users who find humor in these everyday digital mishaps and connect over laughter.",
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Interact with Friends.",
            description:
                "Become part of a vibrant community that celebrates the lighter side of technology. Show appreciation for posts that make you laugh, create collections of your favourites.",
        },
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Build Connections.",
            description:
                "Share your thoughts through our interactive comment system, exchange stories about similar experiences, and participate in weekly trending discussions.",
        },
    ];

    const heroData = [
        {
            title: "Share Hilarious Autocorrect Fails.",
            description:
                "Transform embarrassing autocorrect moments into hilarious memories. Share and discover the funniest fails while connecting with others who love a good laugh.",
        },
        {
            title: "Discover Hilarious Chat Mishaps.",
            description:
                "Enjoy a collection of hilarious autocorrect fails that will make you laugh and brighten your day. Share, connect, and have fun with these digital mishaps.",
        },
    ];

    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroData.length);
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const currentHero = heroData[currentHeroIndex];

    const heroVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.25,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.25,
                ease: "easeIn",
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            {/* Hero Section */}
            <section
                className="relative pt-20 pb-20 px-4 bg-cover bg-center min-h-[90vh] flex items-center justify-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="relative max-w-4xl mx-auto text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHeroIndex}
                            variants={heroVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.h1 className="text-7xl font-bold mb-6 text-white">
                                {currentHero.title}
                            </motion.h1>
                            <motion.p className="text-l text-gray-100 mb-12 max-w-2xl mx-auto">
                                {currentHero.description}
                            </motion.p>
                            <motion.div className="flex gap-4 justify-center">
                                <motion.button
                                    className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                                    onClick={() => (window.location.href = "/signup")}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-black">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-6xl font-bold mb-6 text-white">What Can You Do?</h2>
                    <p className="text-l text-gray-100 mb-12 max-w-2xl mx-auto">
                        Our platform offers a comprehensive suite of features designed to help you share, connect, and engage
                        with a community that appreciates the humor in our daily digital communications.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;