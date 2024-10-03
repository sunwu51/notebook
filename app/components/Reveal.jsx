'use client'
import { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';

const RevealWrapper = (props) => {
    const deckDivRef = useRef(null);
    const deckRef = useRef(null);
    const [RevealLoaded, setRevealLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('reveal.js').then((RevealModule) => {
                const Reveal = RevealModule.default;
                import('reveal.js/dist/reveal.css');
                setRevealLoaded(true);
            });
        }
    }, []);

    useEffect(() => {
        if (RevealLoaded && typeof window !== 'undefined') {
            if (deckRef.current) return;

            import('reveal.js').then((RevealModule) => {
                const Reveal = RevealModule.default;
                
                // Small delay to ensure styles are applied
                setTimeout(() => {
                    deckRef.current = new Reveal(deckDivRef.current, {
                        embedded: true,
                        // other config options
                    });

                    deckRef.current.initialize().then(() => {
                        // Force a layout update after initialization
                        window.dispatchEvent(new Event('resize'));
                    });
                }, 100);
            });

            return () => {
                try {
                    if (deckRef.current) {
                        deckRef.current.destroy();
                        deckRef.current = null;
                    }
                } catch (e) {
                    console.warn("Reveal.js destroy call failed.");
                }
            };
        }
    }, [RevealLoaded]);

    return (
        <div style={{width: '100%', maxWidth: '1200px', aspectRatio: props.ratio ? props.ratio : '4 / 3', position: 'relative', ...props.style}}>
            <div className="reveal" ref={deckDivRef} 
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, '--slide-width': '960px', '--slide-height': '800px'}}>
                <div className="slides">
                    {props.children}
                </div>
            </div>
            <style jsx global>{`
                .reveal .slides > section,
                .reveal .slides > section > section {
                    top: 0 !important;
                    margin: 1rem !important;
                }
            `}</style>
        </div>
    );
}
/*
usage:

<div>
    <Reveal>
        <section>
            <h1>这是一个图</h1>
            <img src="https://i.imgur.com/dXq8Z.png" />
        </section>
        <section>
            <h1>这是一个图</h1>
            <img src="https://i.imgur.com/dXq8Z.png" />
        </section>
    </Reveal>
</div>
*/

export default dynamic(() => Promise.resolve(RevealWrapper), { ssr: false });