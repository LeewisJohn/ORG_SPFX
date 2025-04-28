import { CSSProperties } from "react";

export const hexToRGB = (hex: any, alpha: any) => {
    const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return alpha ? `rgba(${r},${g}, ${b},${alpha})` : `rgb(${r},${g}, ${b})`;
}

export const parseCSSString = (cssString: string | undefined): CSSProperties | undefined => {
    try {
        const styles: CSSProperties = {};

        // Remove the surrounding curly braces and split the string by semicolons
        const declarations = cssString?.slice(1, -1).split(';');

        declarations?.forEach(declaration => {
            if (declaration.trim()) {
                // Split each declaration by the colon
                const [property, value] = declaration.split(':');

                if (property && value) {
                    // Trim whitespace and convert to camelCase
                    const camelCaseProperty = property.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

                    // Safely assign the value to the styles object
                    (styles as any)[camelCaseProperty] = value.trim();
                }
            }
        });

        return styles;
    }
    catch (error) {
        return undefined
    }
} 
