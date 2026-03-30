import { createContext, useContext } from 'react';
import { Animated } from 'react-native';

const ScrollContext = createContext<Animated.Value | null>(null);

export function ScrollProvider({
    scrollY,
    children,
}: {
    scrollY: Animated.Value;
    children: React.ReactNode;
}) {
    return (
        <ScrollContext.Provider value={scrollY}>
            {children}
        </ScrollContext.Provider>
    );
}

export function useScrollY() {
    return useContext(ScrollContext);
}
